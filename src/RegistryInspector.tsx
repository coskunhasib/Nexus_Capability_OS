import { useMemo, useState } from 'react';
import { Database, FileJson, Layers, Search } from 'lucide-react';
import macroData from '../registry/macro-pipelines.json';
import microData from '../registry/micro-pipelines.json';
import microExtraData from '../registry/micro-pipelines-extra.json';
import profilesData from '../registry/agent-profiles.json';
import profilesExtraData from '../registry/agent-profiles-extra.json';
import gatesData from '../registry/gates.json';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';
import rulesData from '../registry/compiler-rules.json';

type RegistryEntity = {
  id: string;
  type: string;
  title: string;
  summary: string;
  source: string;
  raw: Record<string, unknown>;
  references: string[];
};

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function entityFromRaw(raw: Record<string, unknown>, source: string, type: string, idKey = 'id'): RegistryEntity {
  const id = String(raw[idKey] ?? raw.id ?? source);
  const title = String(raw.title ?? raw.pack_id ?? raw.id ?? id);
  const summary = String(raw.summary ?? 'No summary.');
  const references = [
    ...asArray(raw.micro_pipelines),
    ...asArray(raw.default_gates),
    ...asArray(raw.required_profiles),
    ...asArray(raw.required_gates),
    ...asArray(raw.profiles),
    ...asArray(raw.quality_gates),
    ...asArray(raw.gates),
    ...asArray(raw.outputs),
  ];
  return { id, type, title, summary, source, raw, references };
}

const macro = ((macroData as { macro_pipelines: Record<string, unknown>[] }).macro_pipelines ?? []).map((x) => entityFromRaw(x, 'macro-pipelines.json', 'macro-pipeline'));
const micro = [
  ...((microData as { micro_pipelines: Record<string, unknown>[] }).micro_pipelines ?? []).map((x) => entityFromRaw(x, 'micro-pipelines.json', 'micro-pipeline')),
  ...((microExtraData as { micro_pipelines: Record<string, unknown>[] }).micro_pipelines ?? []).map((x) => entityFromRaw(x, 'micro-pipelines-extra.json', 'micro-pipeline')),
];
const profiles = [
  ...((profilesData as { agent_profiles: Record<string, unknown>[] }).agent_profiles ?? []).map((x) => entityFromRaw(x, 'agent-profiles.json', 'agent-profile')),
  ...((profilesExtraData as { agent_profiles: Record<string, unknown>[] }).agent_profiles ?? []).map((x) => entityFromRaw(x, 'agent-profiles-extra.json', 'agent-profile')),
];
const gates = ((gatesData as { gates: Record<string, unknown>[] }).gates ?? []).map((x) => entityFromRaw(x, 'gates.json', 'quality-gate'));
const packs = [
  ...((packsData as { capability_packs: Record<string, unknown>[] }).capability_packs ?? []).map((x) => entityFromRaw(x, 'example-capability-packs.json', 'capability-pack', 'pack_id')),
  ...((packsExtraData as { capability_packs: Record<string, unknown>[] }).capability_packs ?? []).map((x) => entityFromRaw(x, 'capability-packs-extra.json', 'capability-pack', 'pack_id')),
];
const rules = ((rulesData as { compiler_rules: Record<string, unknown>[] }).compiler_rules ?? []).map((x) => {
  const raw = x;
  const select = (raw.select ?? {}) as Record<string, unknown>;
  return entityFromRaw({ ...raw, ...select, summary: `priority ${(raw.priority ?? 'n/a')}` }, 'compiler-rules.json', 'compiler-rule');
});

const entities = [...macro, ...micro, ...profiles, ...gates, ...packs, ...rules];

function Badge({ children }: { children: string }) {
  return <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-neutral-300">{children}</span>;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2);
  return String(value ?? '');
}

export default function RegistryInspector() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(entities[0]?.id ?? '');

  const types = useMemo(() => ['all', ...Array.from(new Set(entities.map((entity) => entity.type))).sort()], []);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return entities.filter((entity) => {
      const typeOk = typeFilter === 'all' || entity.type === typeFilter;
      const text = `${entity.id} ${entity.title} ${entity.summary} ${entity.source} ${entity.type}`.toLowerCase();
      return typeOk && (!q || text.includes(q));
    });
  }, [query, typeFilter]);

  const selected = entities.find((entity) => entity.id === selectedId) ?? filtered[0] ?? entities[0];
  const incoming = selected ? entities.filter((entity) => entity.id !== selected.id && entity.references.includes(selected.id)) : [];

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black">
              <Database size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Registry Inspector</h1>
              <p className="mt-1 text-sm text-neutral-400">Canonical registry records, references and raw payloads.</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Search size={18} className="text-cyan-400" /> Search registry
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none transition focus:border-cyan-500/50"
              placeholder="Search id, title, source..."
            />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none transition focus:border-cyan-500/50"
            >
              {types.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{filtered.length} records</div>
            <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
              {filtered.map((entity) => (
                <button
                  key={`${entity.type}:${entity.id}`}
                  onClick={() => setSelectedId(entity.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === entity.id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium text-white">{entity.title}</div>
                    <span className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] text-neutral-400">{entity.type}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-neutral-500">{entity.id}</div>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            {selected && (
              <>
                <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge>{selected.type}</Badge>
                        <Badge>{selected.source}</Badge>
                      </div>
                      <h2 className="text-3xl font-light text-white">{selected.title}</h2>
                      <p className="mt-2 text-sm text-neutral-500">{selected.id}</p>
                      <p className="mt-4 max-w-4xl text-sm leading-relaxed text-neutral-300">{selected.summary}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                      <div className="text-2xl font-light text-white">{incoming.length}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Incoming refs</div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Layers size={18} className="text-cyan-400" />Direct references</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.references.length ? selected.references.map((ref) => <Badge key={ref}>{ref}</Badge>) : <span className="text-sm text-neutral-500">No outgoing references.</span>}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Layers size={18} className="text-cyan-400" />Incoming references</div>
                    <div className="flex flex-wrap gap-2">
                      {incoming.length ? incoming.map((entity) => <button key={`${entity.type}:${entity.id}`} onClick={() => setSelectedId(entity.id)}><Badge>{entity.id}</Badge></button>) : <span className="text-sm text-neutral-500">No incoming references.</span>}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><FileJson size={18} className="text-cyan-400" />Canonical payload</div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {Object.entries(selected.raw).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">{key}</div>
                        <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-neutral-300">{formatValue(value)}</pre>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}
