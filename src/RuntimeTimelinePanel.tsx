import type { ReactNode } from 'react';
import type { RuntimeEventStore } from './runtimeEventStore.ts';
import { runtimeEventStoreTimeline, summarizeRuntimeEventStore } from './runtimeEventStore.ts';

function toneFor(status: string) {
  if (status === 'done') return 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300';
  if (status === 'blocked') return 'border-red-500/20 bg-red-950/10 text-red-200';
  if (status === 'in_progress') return 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300';
  return 'border-white/10 bg-white/5 text-neutral-300';
}

function sourceTone(source: string) {
  if (source === 'callback') return 'border-yellow-500/20 bg-yellow-950/10 text-yellow-200';
  return 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300';
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`rounded-md border px-2 py-1 text-[11px] ${className}`}>{children}</span>;
}

export default function RuntimeTimelinePanel({ store }: { store: RuntimeEventStore }) {
  const summary = summarizeRuntimeEventStore(store);
  const rows = runtimeEventStoreTimeline(store);

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-6">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 text-sm font-semibold text-cyan-100">Runtime Timeline</div>
          <p className="text-sm text-neutral-400">Ordered view of stored adapter response and callback events.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-cyan-500/20 bg-cyan-950/20 text-cyan-300">events: {summary.entry_count}</Badge>
          <Badge className="border-yellow-500/20 bg-yellow-950/10 text-yellow-200">repeated: {summary.repeated_count}</Badge>
          <Badge className="border-white/10 bg-white/5 text-neutral-300">job: {summary.job_id}</Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary.entry_count}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">stored</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary.adapter_response_count}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">adapter</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary.callback_count}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">callback</div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"><div className="text-2xl text-white">{summary.repeated_count}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">repeated</div></div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-neutral-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Step</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.sequence}-${row.event_type}-${row.step_id}`} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 text-neutral-500">{row.sequence}</td>
                <td className="px-3 py-2"><Badge className={sourceTone(row.source)}>{row.source}</Badge></td>
                <td className="px-3 py-2 text-neutral-200">{row.event_type}</td>
                <td className="px-3 py-2 text-neutral-400">{row.step_id}</td>
                <td className="px-3 py-2"><Badge className={toneFor(row.status)}>{row.status}</Badge></td>
                <td className="px-3 py-2 text-neutral-500">{row.received_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
