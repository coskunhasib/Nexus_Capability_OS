import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, CircleDot, Database, FileJson, ShieldCheck } from 'lucide-react';
import macroData from '../registry/macro-pipelines.json';
import microData from '../registry/micro-pipelines.json';
import microExtraData from '../registry/micro-pipelines-extra.json';
import profilesData from '../registry/agent-profiles.json';
import profilesExtraData from '../registry/agent-profiles-extra.json';
import gatesData from '../registry/gates.json';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';
import rulesData from '../registry/compiler-rules.json';
import PacketSchemaHealth from './PacketSchemaHealth.tsx';

type Raw = Record<string, unknown>;
type Entity = { id: string; type: string; title: string; source: string; refs: Ref[]; raw: Raw };
type Ref = { kind: string; id: string; field: string };
type Issue = { kind: string; id: string; source: string; field?: string };
type GovernanceTab = 'issues' | 'orphan' | 'health' | 'usage' | 'packets';

const arr = (value: unknown): string[] => Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
const read = <T,>(data: T[], source: string, type: string, idKey = 'id'): Entity[] => data.map((raw) => {
  const r = raw as Raw;
  const id = String(r[idKey] ?? r.id ?? source);
  const refs: Ref[] = [];
  const add = (kind: string, field: string, values: string[]) => values.forEach((value) => refs.push({ kind, id: value, field }));
  add('micro', 'micro_pipelines', arr(r.micro_pipelines));
  add('gate', 'default_gates', arr(r.default_gates));
  add('profile', 'required_profiles', arr(r.required_profiles));
  add('gate', 'required_gates', arr(r.required_gates));
  add('profile', 'profiles', arr(r.profiles));
  add('gate', 'quality_gates', arr(r.quality_gates));
  add('gate', 'gates', arr(r.gates));
  const select = r.select as Raw | undefined;
  if (select) {
    if (typeof select.macro_pipeline === 'string') refs.push({ kind: 'macro', id: select.macro_pipeline, field: 'select.macro_pipeline' });
    add('micro', 'select.micro_pipelines', arr(select.micro_pipelines));
    add('profile', 'select.profiles', arr(select.profiles));
    add('gate', 'select.gates', arr(select.gates));
    add('pack', 'select.capability_packs', arr(select.capability_packs));
  }
  return { id, type, title: String(r.title ?? r.pack_id ?? id), source, refs, raw: r };
});

const macro = read((macroData as { macro_pipelines: Raw[] }).macro_pipelines ?? [], 'macro-pipelines.json', 'macro');
const micro = [
  ...read((microData as { micro_pipelines: Raw[] }).micro_pipelines ?? [], 'micro-pipelines.json', 'micro'),
  ...read((microExtraData as { micro_pipelines: Raw[] }).micro_pipelines ?? [], 'micro-pipelines-extra.json', 'micro'),
];
const profiles = [
  ...read((profilesData as { agent_profiles: Raw[] }).agent_profiles ?? [], 'agent-profiles.json', 'profile'),
  ...read((profilesExtraData as { agent_profiles: Raw[] }).agent_profiles ?? [], 'agent-profiles-extra.json', 'profile'),
];
const gates = read((gatesData as { gates: Raw[] }).gates ?? [], 'gates.json', 'gate');
const packs = [
  ...read((packsData as { capability_packs: Raw[] }).capability_packs ?? [], 'example-capability-packs.json', 'pack', 'pack_id'),
  ...read((packsExtraData as { capability_packs: Raw[] }).capability_packs ?? [], 'capability-packs-extra.json', 'pack', 'pack_id'),
];
const rules = read((rulesData as { compiler_rules: Raw[] }).compiler_rules ?? [], 'compiler-rules.json', 'rule');
const entities = [...macro, ...micro, ...profiles, ...gates, ...packs, ...rules];

function buildGovernance() {
  const byType = {
    macro: new Set(macro.map((e) => e.id)),
    micro: new Set(micro.map((e) => e.id)),
    profile: new Set(profiles.map((e) => e.id)),
    gate: new Set(gates.map((e) => e.id)),
    pack: new Set(packs.map((e) => e.id)),
    rule: new Set(rules.map((e) => e.id)),
  } as Record<string, Set<string>>;
  const missing: Issue[] = [];
  const duplicates: Issue[] = [];
  const usage = new Map<string, number>();

  for (const entity of entities) {
    const key = `${entity.type}:${entity.id}`;
    usage.set(key, usage.get(key) ?? 0);
    for (const ref of entity.refs) {
      const exists = byType[ref.kind]?.has(ref.id);
      const refKey = `${ref.kind}:${ref.id}`;
      usage.set(refKey, (usage.get(refKey) ?? 0) + 1);
      if (!exists) missing.push({ kind: ref.kind, id: ref.id, source: `${entity.type}:${entity.id}`, field: ref.field });
    }
  }

  for (const [type, list] of Object.entries({ macro, micro, profile: profiles, gate: gates, pack: packs, rule: rules })) {
    const seen = new Set<string>();
    for (const entity of list) {
      if (seen.has(entity.id)) duplicates.push({ kind: type, id: entity.id, source: entity.source });
      seen.add(entity.id);
    }
  }

  const orphan = entities.filter((entity) => {
    if (entity.type === 'rule' || entity.id === 'nexus-capability-os') return false;
    return (usage.get(`${entity.type}:${entity.id}`) ?? 0) === 0;
  });

  const healthRows = entities.map((entity) => {
    let score = 100;
    const incoming = usage.get(`${entity.type}:${entity.id}`) ?? 0;
    const hasSummary = typeof entity.raw.summary === 'string' && entity.raw.summary.length > 20;
    const hasStatus = typeof entity.raw.status === 'string';
    const hasRefs = entity.refs.length > 0;
    if (!hasSummary) score -= 20;
    if (!hasStatus) score -= 10;
    if (entity.type !== 'rule' && incoming === 0) score -= 25;
    if ((entity.type === 'micro' || entity.type === 'pack') && !hasRefs) score -= 20;
    return { ...entity, incoming, score: Math.max(0, score) };
  }).sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

  return { missing, duplicates, orphan, healthRows, usage };
}

function Badge({ children, tone = 'neutral' }: { children: string | number; tone?: 'neutral' | 'green' | 'yellow' | 'red' | 'cyan' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/20 text-red-200',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'green' | 'yellow' | 'red' | 'cyan' }) {
  return <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"><div className="flex items-center justify-between"><span className="text-cyan-400">{icon}</span><Badge tone={tone}>{label}</Badge></div><div className="mt-5 text-4xl font-light text-white">{value}</div></div>;
}

export default function RegistryGovernance() {
  const [tab, setTab] = useState<GovernanceTab>('issues');
  const governance = useMemo(buildGovernance, []);
  const issueCount = governance.missing.length + governance.duplicates.length;
  const topUsage = Array.from(governance.usage.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const tabs: GovernanceTab[] = ['issues', 'orphan', 'health', 'usage', 'packets'];

  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><ShieldCheck size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Registry Governance</h1><p className="mt-1 text-sm text-neutral-400">Registry health, packet contracts, references, usage and quality signals.</p></div></div></header><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Stat icon={<Database size={22} />} label="entities" value={entities.length} tone="cyan" /><Stat icon={<AlertTriangle size={22} />} label="issues" value={issueCount} tone={issueCount ? 'red' : 'green'} /><Stat icon={<CircleDot size={22} />} label="orphans" value={governance.orphan.length} tone={governance.orphan.length ? 'yellow' : 'green'} /><Stat icon={<CheckCircle2 size={22} />} label="rules" value={rules.length} tone="green" /><Stat icon={<FileJson size={22} />} label="schemas" value={6} tone="green" /></section><nav className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2">{tabs.map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${tab === x ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}>{x}</button>)}</nav>{tab === 'issues' && <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><AlertTriangle size={18} className="text-red-300" />Missing references</div><div className="space-y-2">{governance.missing.length ? governance.missing.map((m, i) => <div key={i} className="rounded-xl border border-red-500/20 bg-red-950/10 p-3 text-sm"><div className="font-medium text-red-200">{m.kind}:{m.id}</div><div className="mt-1 text-xs text-neutral-500">from {m.source} / {m.field}</div></div>) : <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-sm text-emerald-200">No missing references.</div>}</div></div><div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><AlertTriangle size={18} className="text-yellow-300" />Duplicate IDs</div><div className="space-y-2">{governance.duplicates.length ? governance.duplicates.map((d, i) => <div key={i} className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-3 text-sm"><div className="font-medium text-yellow-200">{d.kind}:{d.id}</div><div className="mt-1 text-xs text-neutral-500">{d.source}</div></div>) : <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-sm text-emerald-200">No duplicate IDs.</div>}</div></div></section>}{tab === 'orphan' && <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><CircleDot size={18} className="text-yellow-300" />Orphan entities</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{governance.orphan.map((e) => <div key={`${e.type}:${e.id}`} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex items-center justify-between gap-2"><div className="text-sm font-medium text-white">{e.title}</div><Badge>{e.type}</Badge></div><div className="mt-1 text-xs text-neutral-500">{e.id}</div></div>)}</div></section>}{tab === 'health' && <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Activity size={18} className="text-cyan-300" />Lowest health scores</div><div className="space-y-2">{governance.healthRows.slice(0, 40).map((e) => <div key={`${e.type}:${e.id}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-3 md:grid-cols-[80px_1fr_120px_80px]"><Badge tone={e.score >= 80 ? 'green' : e.score >= 60 ? 'yellow' : 'red'}>{e.score}</Badge><div><div className="text-sm font-medium text-white">{e.title}</div><div className="text-xs text-neutral-500">{e.type}:{e.id}</div></div><div className="text-xs text-neutral-400">incoming {e.incoming}</div><div className="text-xs text-neutral-500">{e.source}</div></div>)}</div></section>}{tab === 'usage' && <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><BarChart3 size={18} className="text-cyan-300" />Top referenced entities</div><div className="space-y-2">{topUsage.map(([key, count]) => <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"><div className="text-sm text-white">{key}</div><Badge tone="cyan">{count}</Badge></div>)}</div></section>}{tab === 'packets' && <PacketSchemaHealth />}</div></div>;
}
