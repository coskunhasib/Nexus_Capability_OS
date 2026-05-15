import { useMemo, useState } from 'react';
import { Cpu, FileJson, Network, PlayCircle } from 'lucide-react';
import {
  applyRuntimeEventsToRunnerState,
  buildRuntimeAdapterRequest,
  runMockRuntimeAdapter,
  summarizeRuntimeAdapterResponse,
  type EvidenceState,
  type RuntimeAdapterRequest,
  type RuntimeAdapterResponse,
  type TaskPacket,
  type WorkStatus,
} from './runtimeAdapter.ts';

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/10 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/10 text-red-200',
  }[tone];
  return <span className={`rounded-md border px-2 py-1 text-[11px] ${cls}`}>{children}</span>;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type Props = {
  packet: TaskPacket;
  statuses: Record<string, WorkStatus>;
  evidence: EvidenceState;
  onApplyRuntimeState: (next: { statuses: Record<string, WorkStatus>; evidence: EvidenceState }) => void;
};

export default function RuntimeAdapterPanel({ packet, statuses, evidence, onApplyRuntimeState }: Props) {
  const [request, setRequest] = useState<RuntimeAdapterRequest | null>(null);
  const [response, setResponse] = useState<RuntimeAdapterResponse | null>(null);
  const [lastAppliedEventCount, setLastAppliedEventCount] = useState(0);

  const summary = useMemo(() => (response ? summarizeRuntimeAdapterResponse(response) : null), [response]);

  const dispatchMockAdapter = () => {
    const nextRequest = buildRuntimeAdapterRequest(packet, 'mock');
    const nextResponse = runMockRuntimeAdapter(nextRequest);
    const patch = applyRuntimeEventsToRunnerState(statuses, evidence, nextResponse.events);
    setRequest(nextRequest);
    setResponse(nextResponse);
    setLastAppliedEventCount(patch.applied_events.length);
    onApplyRuntimeState({ statuses: patch.statuses, evidence: patch.evidence });
  };

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-cyan-100"><Network size={18} />Runtime Adapter Bridge</div>
          <p className="text-sm text-neutral-400">Generates a runtime adapter request, calls the mock adapter, then ingests runtime bridge events into Runner state.</p>
        </div>
        <button onClick={dispatchMockAdapter} className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/30">
          <PlayCircle size={14} /> Dispatch mock adapter
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary?.event_count ?? '-'}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">events</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary?.accepted ? 'yes' : response ? 'no' : '-'}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">accepted</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary?.event_types.length ?? '-'}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">event types</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{lastAppliedEventCount || '-'}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">applied</div></div>
      </div>

      {summary && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone={summary.accepted ? 'green' : 'red'}>{summary.status}</Badge>
            <Badge tone="cyan">{summary.job_id}</Badge>
            <Badge>{summary.target_worker}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">{summary.event_types.map((type) => <Badge key={type} tone="yellow">{type}</Badge>)}</div>
        </div>
      )}

      {(request || response) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {request && <button onClick={() => downloadJson('runtime-adapter-request.json', request)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><FileJson size={14} />Export request</button>}
          {response && <button onClick={() => downloadJson('runtime-adapter-response.json', response)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><FileJson size={14} />Export response</button>}
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><Cpu size={16} className="mb-2 text-cyan-400" />This is still a mock adapter, but it uses the same request/response boundary intended for a real Nexus worker.</div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><Network size={16} className="mb-2 text-cyan-400" />Runtime bridge events update Runner step status and gate evidence, so review/memory/context panels react to adapter output.</div>
      </div>
    </section>
  );
}
