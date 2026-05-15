import { useMemo, useState } from 'react';
import { Clipboard, FlaskConical, ListChecks, Search, ShieldCheck, Target } from 'lucide-react';
import webSaasTrial from '../samples/trials/web-saas-mvp.trial.json';
import stm32Trial from '../samples/trials/stm32-firmware.trial.json';
import agenticTrial from '../samples/trials/agentic-system.trial.json';
import rfqTrial from '../samples/trials/rfq-generation.trial.json';
import technicalReportTrial from '../samples/trials/technical-report.trial.json';
import webSaasResult from '../samples/trial-results/web-saas-mvp/summary.json';
import agenticResult from '../samples/trial-results/agentic-system/summary.json';
import stm32Result from '../samples/trial-results/stm32-firmware/summary.json';
import rfqResult from '../samples/trial-results/rfq-generation/summary.json';
import technicalReportResult from '../samples/trial-results/technical-report/summary.json';
import webSaasHandoff from '../samples/handoff-results/web-saas-mvp/handoff-usability-summary.json';
import agenticHandoff from '../samples/handoff-results/agentic-system/handoff-usability-summary.json';
import stm32Handoff from '../samples/handoff-results/stm32-firmware/handoff-usability-summary.json';
import rfqHandoff from '../samples/handoff-results/rfq-generation/handoff-usability-summary.json';
import technicalReportHandoff from '../samples/handoff-results/technical-report/handoff-usability-summary.json';

type TrialScenario = {
  scenario_id: string;
  version: string;
  intent: string;
  tags?: string[];
  expected: {
    capability_pack: string;
    macro_pipeline: string;
    profiles: string[];
    micro_pipelines: string[];
    gates: string[];
    packets: string[];
  };
  acceptance_criteria: string[];
  nexus_integration_notes?: string[];
};

type TrialResult = {
  trial_id: string;
  scenario_id: string;
  status: 'pass' | 'fail';
  assertions: Array<{ name: string; pass: boolean }>;
  report_summary: {
    release_ready: boolean;
    completed_steps: number;
    total_steps: number;
    blocked_steps: number;
    failed_gates: number;
    missing_evidence: number;
    active_skills: string[];
  };
};

type HandoffResult = {
  trial_id: string;
  scenario_id: string;
  status: 'pass' | 'fail';
  assertions: Array<{ name: string; pass: boolean }>;
  handoff_summary: {
    objective: string;
    pack_id: string;
    profile_count: number;
    required_skill_count: number;
    required_tool_count: number;
    artifact_output_count: number;
    blocker_count: number;
    missing_evidence_count: number;
    release_ready: boolean;
  };
};

const scenarios = [webSaasTrial, stm32Trial, agenticTrial, rfqTrial, technicalReportTrial] as TrialScenario[];
const results = [webSaasResult, agenticResult, stm32Result, rfqResult, technicalReportResult] as TrialResult[];
const handoffResults = [webSaasHandoff, agenticHandoff, stm32Handoff, rfqHandoff, technicalReportHandoff] as HandoffResult[];
const resultMap = new Map(results.map((result) => [result.scenario_id, result]));
const handoffMap = new Map(handoffResults.map((result) => [result.scenario_id, result]));
const pendingTrialIntentKey = 'nexus.pendingTrialIntent';

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/20 text-red-200',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function PillList({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}</div>;
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{children}</section>;
}

function AssertionGrid({ assertions }: { assertions: Array<{ name: string; pass: boolean }> }) {
  return <div className="grid gap-2 md:grid-cols-2">{assertions.map((assertion) => <div key={assertion.name} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#050505] px-3 py-2 text-xs"><span className="text-neutral-300">{assertion.name}</span><Badge tone={assertion.pass ? 'green' : 'red'}>{assertion.pass ? 'pass' : 'fail'}</Badge></div>)}</div>;
}

function ResultCard({ result }: { result?: TrialResult }) {
  if (!result) return <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-100">No trial result snapshot found.</div>;
  const failedAssertions = result.assertions.filter((assertion) => !assertion.pass);
  return <div className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="mb-2 flex flex-wrap gap-2"><Badge tone={result.status === 'pass' ? 'green' : 'red'}>{result.status}</Badge><Badge>{result.trial_id}</Badge><Badge tone={result.report_summary.release_ready ? 'green' : 'yellow'}>release_ready: {String(result.report_summary.release_ready)}</Badge></div><div className="text-sm text-neutral-400">CI-backed skill-aware trial result snapshot.</div></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.report_summary.failed_gates}</div><div className="text-neutral-500">failed</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.report_summary.missing_evidence}</div><div className="text-neutral-500">missing</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.report_summary.blocked_steps}</div><div className="text-neutral-500">blocked</div></div></div></div><div className="mb-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">active skills</div><PillList items={result.report_summary.active_skills} tone="cyan" /></div><AssertionGrid assertions={result.assertions} />{failedAssertions.length > 0 && <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-100">{failedAssertions.length} failed assertions need investigation.</div>}</div>;
}

function HandoffCard({ result }: { result?: HandoffResult }) {
  if (!result) return <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-100">No handoff usability snapshot found.</div>;
  const failedAssertions = result.assertions.filter((assertion) => !assertion.pass);
  return <div className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="mb-2 flex flex-wrap gap-2"><Badge tone={result.status === 'pass' ? 'green' : 'red'}>{result.status}</Badge><Badge>{result.trial_id}</Badge><Badge tone="cyan">{result.handoff_summary.pack_id}</Badge></div><div className="text-sm text-neutral-400">Nexus handoff usability snapshot: can a runtime start work from this packet?</div></div><div className="grid grid-cols-4 gap-2 text-center text-xs"><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.handoff_summary.required_skill_count}</div><div className="text-neutral-500">skills</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.handoff_summary.required_tool_count}</div><div className="text-neutral-500">tools</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.handoff_summary.artifact_output_count}</div><div className="text-neutral-500">artifacts</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-2"><div className="text-lg text-white">{result.handoff_summary.blocker_count}</div><div className="text-neutral-500">blockers</div></div></div></div><div className="mb-4 grid gap-3 md:grid-cols-3"><div className="rounded-lg border border-white/10 bg-[#050505] p-3 text-xs text-neutral-300"><div className="text-[10px] uppercase tracking-widest text-neutral-500">profiles</div><div className="mt-1 text-lg text-white">{result.handoff_summary.profile_count}</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-3 text-xs text-neutral-300"><div className="text-[10px] uppercase tracking-widest text-neutral-500">missing evidence</div><div className="mt-1 text-lg text-white">{result.handoff_summary.missing_evidence_count}</div></div><div className="rounded-lg border border-white/10 bg-[#050505] p-3 text-xs text-neutral-300"><div className="text-[10px] uppercase tracking-widest text-neutral-500">release ready</div><div className="mt-1 text-lg text-white">{String(result.handoff_summary.release_ready)}</div></div></div><AssertionGrid assertions={result.assertions} />{failedAssertions.length > 0 && <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-100">{failedAssertions.length} handoff assertions need investigation.</div>}</div>;
}

export default function TrialScenarioView({ onOpenCompiler }: { onOpenCompiler?: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(scenarios[0]?.scenario_id ?? '');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return scenarios.filter((scenario) => !q || `${scenario.scenario_id} ${scenario.intent} ${(scenario.tags ?? []).join(' ')}`.toLowerCase().includes(q));
  }, [query]);
  const selected = scenarios.find((scenario) => scenario.scenario_id === selectedId) ?? filtered[0] ?? scenarios[0];
  const selectedResult = resultMap.get(selected.scenario_id);
  const selectedHandoff = handoffMap.get(selected.scenario_id);
  const suitePassCount = results.filter((result) => result.status === 'pass').length;
  const handoffPassCount = handoffResults.filter((result) => result.status === 'pass').length;

  const copyIntent = async () => {
    await navigator.clipboard.writeText(selected.intent);
  };

  const openInCompiler = async () => {
    window.localStorage.setItem(pendingTrialIntentKey, selected.intent);
    await copyIntent();
    onOpenCompiler?.();
  };

  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><FlaskConical size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Trial Scenario Library</h1><p className="mt-1 text-sm text-neutral-400">Repeatable test cases, CI-backed skill-aware trial results and Nexus handoff usability.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Badge tone="cyan">{scenarios.length} scenarios</Badge><Badge tone={suitePassCount === results.length ? 'green' : 'red'}>{suitePassCount}/{results.length} trials passing</Badge><Badge tone={handoffPassCount === handoffResults.length ? 'green' : 'red'}>{handoffPassCount}/{handoffResults.length} handoffs usable</Badge><Badge tone="yellow">skill-aware CI snapshots</Badge></div></header>
    <Panel icon={<ShieldCheck size={18} />} title="CI Trial + Nexus Handoff Dashboard"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{scenarios.map((scenario) => { const result = resultMap.get(scenario.scenario_id); const handoff = handoffMap.get(scenario.scenario_id); return <button key={scenario.scenario_id} onClick={() => setSelectedId(scenario.scenario_id)} className={`rounded-xl border p-4 text-left transition ${selected.scenario_id === scenario.scenario_id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}><div className="mb-2 flex items-center justify-between gap-2"><span className="text-sm font-semibold text-white">{scenario.scenario_id}</span><div className="flex gap-1"><Badge tone={result?.status === 'pass' ? 'green' : 'red'}>{result?.status ?? 'missing'}</Badge><Badge tone={handoff?.status === 'pass' ? 'green' : 'red'}>handoff {handoff?.status ?? 'missing'}</Badge></div></div><div className="grid grid-cols-3 gap-1 text-center text-[10px] text-neutral-500"><div className="rounded border border-white/10 bg-[#050505] p-1"><div className="text-neutral-200">{result?.report_summary.failed_gates ?? '-'}</div>fail</div><div className="rounded border border-white/10 bg-[#050505] p-1"><div className="text-neutral-200">{result?.report_summary.missing_evidence ?? '-'}</div>miss</div><div className="rounded border border-white/10 bg-[#050505] p-1"><div className="text-neutral-200">{handoff?.handoff_summary.required_tool_count ?? '-'}</div>tools</div></div></button>; })}</div></Panel>
    <section className="grid gap-6 xl:grid-cols-[380px_1fr]"><aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={18} className="text-cyan-400" />Search trials</label><input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-cyan-500/50" placeholder="Search intent, tag, scenario..." /><div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{filtered.length} scenarios</div><div className="space-y-2">{filtered.map((scenario) => { const result = resultMap.get(scenario.scenario_id); const handoff = handoffMap.get(scenario.scenario_id); return <button key={scenario.scenario_id} onClick={() => setSelectedId(scenario.scenario_id)} className={`w-full rounded-xl border p-3 text-left transition ${selected.scenario_id === scenario.scenario_id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}><div className="flex items-center justify-between gap-2"><div className="text-sm font-medium text-white">{scenario.scenario_id}</div><div className="flex gap-2"><Badge tone={result?.status === 'pass' ? 'green' : 'red'}>{result?.status ?? 'missing'}</Badge><Badge tone={handoff?.status === 'pass' ? 'green' : 'red'}>handoff</Badge><Badge tone="cyan">v{scenario.version}</Badge></div></div><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-400">{scenario.intent}</p><div className="mt-3 flex flex-wrap gap-1">{(scenario.tags ?? []).slice(0, 4).map((tag) => <span key={tag} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-neutral-400">{tag}</span>)}</div></button>; })}</div></aside>
    {selected && <main className="flex flex-col gap-6"><Panel icon={<ShieldCheck size={18} />} title="Selected trial CI result"><ResultCard result={selectedResult} /></Panel><Panel icon={<ShieldCheck size={18} />} title="Selected Nexus handoff usability"><HandoffCard result={selectedHandoff} /></Panel><Panel icon={<Target size={18} />} title="Trial intent"><div className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="mb-3 flex flex-wrap gap-2"><Badge tone="cyan">{selected.scenario_id}</Badge><Badge>{selected.expected.macro_pipeline}</Badge><Badge tone="green">{selected.expected.capability_pack}</Badge></div><p className="text-lg leading-relaxed text-white">{selected.intent}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void copyIntent()} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><Clipboard size={14} />Copy intent</button><button onClick={() => void openInCompiler()} className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/30"><Clipboard size={14} />Load in Compiler</button></div></div></Panel>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ListChecks size={18} />} title="Expected routing"><div className="space-y-4"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">profiles</div><PillList items={selected.expected.profiles} /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">micro pipelines</div><PillList items={selected.expected.micro_pipelines} tone="cyan" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">packets</div><PillList items={selected.expected.packets} tone="green" /></div></div></Panel><Panel icon={<ShieldCheck size={18} />} title="Expected gates"><PillList items={selected.expected.gates} tone="yellow" /></Panel></section>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ShieldCheck size={18} />} title="Acceptance criteria"><div className="space-y-2">{selected.acceptance_criteria.map((item, index) => <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><Badge tone="cyan">{String(index + 1).padStart(2, '0')}</Badge><span className="ml-3">{item}</span></div>)}</div></Panel><Panel icon={<FlaskConical size={18} />} title="Nexus integration notes"><div className="space-y-2">{(selected.nexus_integration_notes ?? []).map((item, index) => <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><Badge tone="yellow">{String(index + 1).padStart(2, '0')}</Badge><span className="ml-3">{item}</span></div>)}</div></Panel></section>
    </main>}
    </section></div></div>;
}
