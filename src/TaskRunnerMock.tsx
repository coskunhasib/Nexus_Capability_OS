import { useMemo, useState } from 'react';
import { ClipboardList, FileJson, ListChecks, PlayCircle, RotateCcw, UploadCloud } from 'lucide-react';

type WorkStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
type WorkOrderStep = {
  order: number;
  id: string;
  title: string;
  owner: string;
  description: string;
  expected_outputs?: string[];
  required_gates?: string[];
  related?: string;
  status?: WorkStatus;
};

type TaskPacket = {
  packet_type: string;
  version: string;
  objective: string;
  source_compiler_rule?: string;
  routing?: {
    macro_pipeline?: string;
    micro_pipelines?: string[];
    capability_packs?: string[];
  };
  team?: Array<{ profile: string; role?: string }>;
  gates?: Array<{ gate: string; required?: boolean }>;
  policies?: {
    memory?: string;
    context?: string;
  };
  work_order: WorkOrderStep[];
};

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Web SaaS MVP execution mock',
  source_compiler_rule: 'rule-web-saas-mvp',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['frontend-web', 'backend-api', 'database', 'qa-automation', 'devops-platform'],
    capability_packs: ['web-saas-mvp-pack'],
  },
  team: [
    { profile: 'requirement-extractor', role: 'owner_or_reviewer' },
    { profile: 'system-architect', role: 'owner_or_reviewer' },
    { profile: 'frontend-web-engineer', role: 'owner_or_reviewer' },
    { profile: 'backend-api-engineer', role: 'owner_or_reviewer' },
    { profile: 'qa-automation-engineer', role: 'owner_or_reviewer' },
  ],
  gates: [
    { gate: 'spec-compliance', required: true },
    { gate: 'api-contract-fit', required: true },
    { gate: 'test-evidence', required: true },
    { gate: 'release-readiness', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-intake',
      title: 'Intake / Requirement Lock',
      owner: 'requirement-extractor',
      description: 'Turn the raw intent into bounded requirements and acceptance criteria.',
      expected_outputs: ['requirements', 'acceptance_criteria', 'open_questions'],
      required_gates: ['clarity', 'scope-fit'],
      status: 'not_started',
    },
    {
      order: 2,
      id: '02-architecture',
      title: 'Architecture / Contract Setup',
      owner: 'system-architect',
      description: 'Define boundaries, interfaces and decision candidates.',
      expected_outputs: ['architecture_outline', 'interface_contracts'],
      required_gates: ['architecture-coherence'],
      status: 'not_started',
    },
    {
      order: 3,
      id: 'pipeline-frontend-web',
      title: 'Execute: Frontend Web',
      owner: 'frontend-web-engineer',
      description: 'Run frontend micro-pipeline with UI state and responsive gates.',
      expected_outputs: ['implemented_ui', 'ui_state_matrix'],
      required_gates: ['ui-state-coverage', 'responsive-check', 'accessibility-baseline'],
      related: 'frontend-web',
      status: 'not_started',
    },
  ],
};

const statusOptions: WorkStatus[] = ['not_started', 'in_progress', 'blocked', 'done'];

function statusTone(status: WorkStatus) {
  if (status === 'done') return 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300';
  if (status === 'in_progress') return 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300';
  if (status === 'blocked') return 'border-red-500/20 bg-red-950/20 text-red-200';
  return 'border-white/10 bg-white/5 text-neutral-300';
}

function Pill({ children }: { children: string }) {
  return <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-neutral-300">{children}</span>;
}

function parsePacket(text: string): { packet?: TaskPacket; error?: string } {
  try {
    const parsed = JSON.parse(text) as TaskPacket;
    if (!parsed || parsed.packet_type !== 'nexus.task_packet') return { error: 'packet_type must be nexus.task_packet' };
    if (!Array.isArray(parsed.work_order)) return { error: 'work_order must be an array' };
    return { packet: parsed };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

export default function TaskRunnerMock() {
  const [rawPacket, setRawPacket] = useState(JSON.stringify(samplePacket, null, 2));
  const [packet, setPacket] = useState<TaskPacket>(samplePacket);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, WorkStatus>>(() => Object.fromEntries(samplePacket.work_order.map((step) => [step.id, step.status ?? 'not_started'])));

  const progress = useMemo(() => {
    const total = packet.work_order.length || 1;
    const done = packet.work_order.filter((step) => statuses[step.id] === 'done').length;
    const blocked = packet.work_order.filter((step) => statuses[step.id] === 'blocked').length;
    const inProgress = packet.work_order.filter((step) => statuses[step.id] === 'in_progress').length;
    return { total, done, blocked, inProgress, percent: Math.round((done / total) * 100) };
  }, [packet, statuses]);

  const loadPacket = (text = rawPacket) => {
    const result = parsePacket(text);
    if (result.error || !result.packet) {
      setError(result.error ?? 'Invalid task packet');
      return;
    }
    setError(null);
    setPacket(result.packet);
    setRawPacket(JSON.stringify(result.packet, null, 2));
    setStatuses(Object.fromEntries(result.packet.work_order.map((step) => [step.id, step.status ?? 'not_started'])));
  };

  const updateStatus = (id: string, status: WorkStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }));
  };

  const resetStatuses = () => {
    setStatuses(Object.fromEntries(packet.work_order.map((step) => [step.id, 'not_started'])));
  };

  const exportState = () => {
    const output = {
      ...packet,
      work_order: packet.work_order.map((step) => ({ ...step, status: statuses[step.id] ?? 'not_started' })),
      runner_state: {
        total_steps: progress.total,
        done_steps: progress.done,
        blocked_steps: progress.blocked,
        in_progress_steps: progress.inProgress,
        progress_percent: progress.percent,
      },
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexus-task-packet-runner-state.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black">
              <PlayCircle size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Task Packet Runner Mock</h1>
              <p className="mt-1 text-sm text-neutral-400">Reads nexus-task-packet.json and tracks work_order steps without running real agents.</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[520px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><FileJson size={18} className="text-cyan-400" />Task packet JSON</div>
              <button onClick={() => loadPacket()} className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/30">Load</button>
            </div>
            <textarea value={rawPacket} onChange={(event) => setRawPacket(event.target.value)} className="min-h-[520px] w-full resize-y rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-neutral-300 outline-none transition focus:border-cyan-500/50" />
            {error && <div className="mt-3 rounded-xl border border-red-500/20 bg-red-950/10 p-3 text-sm text-red-200">{error}</div>}
            <div className="mt-4 flex flex-wrap gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white">
                <UploadCloud size={14} /> Upload JSON
                <input type="file" accept="application/json,.json" className="hidden" onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  setRawPacket(text);
                  loadPacket(text);
                }} />
              </label>
              <button onClick={() => { setRawPacket(JSON.stringify(samplePacket, null, 2)); loadPacket(JSON.stringify(samplePacket, null, 2)); }} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><ClipboardList size={14} />Load sample</button>
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Pill>{packet.packet_type}</Pill>
                    <Pill>{packet.version}</Pill>
                    {packet.source_compiler_rule && <Pill>{packet.source_compiler_rule}</Pill>}
                  </div>
                  <h2 className="text-3xl font-light text-white">{packet.objective}</h2>
                  <p className="mt-3 text-sm text-neutral-500">{packet.routing?.macro_pipeline ?? 'no macro pipeline'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{progress.percent}%</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">progress</div></div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{progress.inProgress}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">active</div></div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{progress.blocked}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">blocked</div></div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{progress.done}/{progress.total}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">done</div></div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-500 transition-all" style={{ width: `${progress.percent}%` }} /></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={resetStatuses} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><RotateCcw size={14} />Reset statuses</button>
                <button onClick={exportState} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><FileJson size={14} />Export runner state</button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><ListChecks size={18} className="text-cyan-400" />Work order</div>
              <div className="space-y-4">
                {packet.work_order.map((step) => {
                  const status = statuses[step.id] ?? step.status ?? 'not_started';
                  return <div key={step.id} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="mb-2 flex flex-wrap gap-2"><Pill>{String(step.order).padStart(2, '0')}</Pill>{step.related && <Pill>{step.related}</Pill>}<span className={`rounded-md border px-2 py-1 text-[11px] ${statusTone(status)}`}>{status}</span></div><h3 className="text-base font-semibold text-white">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.description}</p><div className="mt-3 text-xs text-neutral-500">Owner: <span className="text-neutral-300">{step.owner}</span></div></div><select value={status} onChange={(event) => updateStatus(step.id, event.target.value as WorkStatus)} className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-neutral-300 outline-none">{statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">expected outputs</div><div className="flex flex-wrap gap-2">{(step.expected_outputs ?? []).map((item) => <Pill key={item}>{item}</Pill>)}</div></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">required gates</div><div className="flex flex-wrap gap-2">{(step.required_gates ?? []).map((item) => <Pill key={item}>{item}</Pill>)}</div></div></div></div>;
                })}
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  );
}
