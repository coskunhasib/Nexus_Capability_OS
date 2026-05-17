import { useMemo, useState } from 'react';
import { runProviderVerticalSlice } from './providerVerticalSlice';
import type { Scenario, VerticalSliceResult } from './contracts/verticalSliceContracts';

const scenarios: { id: Scenario; label: string }[] = [
  { id: 'happy_path', label: 'Happy' },
  { id: 'missing_source_refs', label: 'Blocked' },
  { id: 'fallback_path', label: 'Fallback' },
  { id: 'review_reject_path', label: 'Reject' },
  { id: 'request_changes_path', label: 'Changes' },
  { id: 'artifact_without_disposition', label: 'No disposition' },
  { id: 'missing_operator_ref', label: 'No operator' },
  { id: 'artifact_outside_root', label: 'Bad root' },
];

function statusClass(status: VerticalSliceResult['status']) {
  if (status === 'accepted') return 'text-emerald-300 border-emerald-500/20 bg-emerald-950/20';
  if (status === 'fallback_used') return 'text-amber-300 border-amber-500/20 bg-amber-950/20';
  if (status === 'changes_requested') return 'text-sky-300 border-sky-500/20 bg-sky-950/20';
  if (status === 'rejected') return 'text-rose-300 border-rose-500/20 bg-rose-950/20';
  return 'text-neutral-300 border-white/10 bg-white/5';
}

function MiniRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="text-neutral-500">{label}</div>
      <div className="text-neutral-300 text-right truncate">{value}</div>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return <span className="inline-flex px-2 py-1 text-[10px] rounded-md border border-white/10 bg-black/30 text-neutral-300">{children}</span>;
}

export function VerticalSliceReviewPanel() {
  const [scenario, setScenario] = useState<Scenario>('happy_path');
  const result = useMemo(() => runProviderVerticalSlice(scenario), [scenario]);

  return (
    <section className="bg-[#0e0e0e] border border-white/5 rounded-xl p-4 space-y-4">
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Vertical slice review</h3>
        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
          Live implementation slice. Candidate output becomes accepted only through review and artifact disposition guards.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {scenarios.map((item) => (
          <button
            key={item.id}
            onClick={() => setScenario(item.id)}
            className={`px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wide transition ${
              scenario === item.id ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200' : 'border-white/10 bg-black/20 text-neutral-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide ${statusClass(result.status)}`}>
        {result.status}
      </div>

      <div className="space-y-2">
        <MiniRow label="Runner" value={result.runnerRef ?? 'none'} />
        <MiniRow label="Accepted" value={result.acceptedArtifacts.length} />
        <MiniRow label="Events" value={result.events.length} />
        <MiniRow label="Last state" value={result.stateHistory.at(-1) ?? 'none'} />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">State history</p>
        <div className="flex flex-wrap gap-2">
          {result.stateHistory.map((state, index) => <Pill key={`${state}-${index}`}>{state}</Pill>)}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">Event log</p>
        <div className="space-y-1.5">
          {result.events.map((event, index) => (
            <div key={`${event.event}-${index}`} className="text-xs text-neutral-400 border-l border-cyan-500/30 pl-3">
              <span className="text-cyan-300">{event.event}</span> — {event.ref}
            </div>
          ))}
        </div>
      </div>

      {result.disposition && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">Disposition</p>
          <p className="text-xs text-neutral-300">{result.disposition.disposition}</p>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{result.disposition.reason}</p>
        </div>
      )}

      {result.reason && <p className="text-xs text-neutral-500 leading-relaxed">{result.reason}</p>}
    </section>
  );
}
