import { useMemo, useState } from 'react';
import { Boxes, BrainCircuit, FileJson, Layers, Network, Search, ShieldCheck, Users, Wrench } from 'lucide-react';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';
import profilesData from '../registry/agent-profiles.json';
import profilesExtraData from '../registry/agent-profiles-extra.json';
import microData from '../registry/micro-pipelines.json';
import microExtraData from '../registry/micro-pipelines-extra.json';
import gatesData from '../registry/gates.json';
import rulesData from '../registry/compiler-rules.json';

type CapabilityPack = {
  pack_id: string;
  type?: string;
  status?: string;
  summary: string;
  for_intents?: string[];
  macro_pipeline?: string;
  micro_pipelines?: string[];
  profiles?: string[];
  skills?: string[];
  tools?: string[];
  quality_gates?: string[];
  memory_policy?: string;
  context_policy?: string;
};

type AgentProfile = {
  id: string;
  title: string;
  summary: string;
  family?: string;
  outputs?: string[];
  gates?: string[];
  does?: string[];
  failure_modes?: string[];
};

type MicroPipeline = {
  id: string;
  parent_macro?: string;
  title: string;
  summary: string;
  required_profiles?: string[];
  required_gates?: string[];
  outputs?: string[];
};

type Gate = {
  id: string;
  title: string;
  summary: string;
  family?: string;
  severity?: string;
  pass_criteria?: string[];
  fail_criteria?: string[];
};

type Rule = {
  id: string;
  title: string;
  priority?: number;
  status?: string;
  select?: {
    capability_packs?: string[];
    macro_pipeline?: string;
    micro_pipelines?: string[];
    profiles?: string[];
    gates?: string[];
    memory_policy?: string;
    context_policy?: string;
  };
};

const packs: CapabilityPack[] = [
  ...((packsData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
  ...((packsExtraData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
];
const profiles: AgentProfile[] = [
  ...((profilesData as { agent_profiles: AgentProfile[] }).agent_profiles ?? []),
  ...((profilesExtraData as { agent_profiles: AgentProfile[] }).agent_profiles ?? []),
];
const microPipelines: MicroPipeline[] = [
  ...((microData as { micro_pipelines: MicroPipeline[] }).micro_pipelines ?? []),
  ...((microExtraData as { micro_pipelines: MicroPipeline[] }).micro_pipelines ?? []),
];
const gates: Gate[] = (gatesData as { gates: Gate[] }).gates ?? [];
const rules: Rule[] = (rulesData as { compiler_rules: Rule[] }).compiler_rules ?? [];

const profileMap = new Map(profiles.map((item) => [item.id, item]));
const microMap = new Map(microPipelines.map((item) => [item.id, item]));
const gateMap = new Map(gates.map((item) => [item.id, item]));

function Badge({ children, tone = 'neutral' }: { children: string | number; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/20 text-red-200',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function PillList({ items, tone = 'neutral' }: { items?: string[]; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  if (!items || items.length === 0) return <span className="text-xs text-neutral-500">none</span>;
  return <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}</div>;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{children}</section>;
}

function DetailCard({ title, subtitle, summary, badge, children }: { title: string; subtitle?: string; summary?: string; badge?: React.ReactNode; children?: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-white">{title}</h3>{subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}</div>{badge}</div>{summary && <p className="mt-3 text-sm leading-relaxed text-neutral-400">{summary}</p>}{children}</div>;
}

function buildPackHealth(pack: CapabilityPack) {
  const missing: string[] = [];
  for (const id of pack.profiles ?? []) if (!profileMap.has(id)) missing.push(`profile:${id}`);
  for (const id of pack.micro_pipelines ?? []) if (!microMap.has(id)) missing.push(`micro:${id}`);
  for (const id of pack.quality_gates ?? []) if (!gateMap.has(id)) missing.push(`gate:${id}`);

  let score = 100;
  if (!pack.summary || pack.summary.length < 20) score -= 15;
  if (!pack.for_intents?.length) score -= 15;
  if (!pack.profiles?.length) score -= 20;
  if (!pack.micro_pipelines?.length) score -= 20;
  if (!pack.quality_gates?.length) score -= 20;
  if (!pack.skills?.length) score -= 10;
  if (!pack.tools?.length) score -= 10;
  score -= missing.length * 15;

  return { score: Math.max(0, score), missing };
}

function packetFlowFor(pack: CapabilityPack) {
  return [
    { id: 'execution-plan', title: 'Execution Plan', description: 'Compiler binds pack profiles, pipelines, tools, skills and gates into an executable plan.' },
    { id: 'task-packet', title: 'Task Packet', description: 'Execution plan becomes a runner-compatible work_order packet.' },
    { id: 'runner-state', title: 'Runner State', description: 'Runner tracks step status and gate evidence for this pack execution.' },
    { id: 'review-report', title: 'Review Report', description: 'Evidence is converted into release readiness and findings.' },
    { id: 'memory-context', title: 'Memory / Context Packets', description: `${pack.memory_policy ?? 'memory policy'} + ${pack.context_policy ?? 'context policy'} define what survives into the next loop.` },
  ];
}

export default function CapabilityPackDetailView() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(packs[0]?.pack_id ?? '');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return packs.filter((pack) => {
      const text = `${pack.pack_id} ${pack.summary} ${(pack.for_intents ?? []).join(' ')} ${pack.macro_pipeline ?? ''}`.toLowerCase();
      return !q || text.includes(q);
    });
  }, [query]);

  const selected = packs.find((pack) => pack.pack_id === selectedId) ?? filtered[0] ?? packs[0];
  const selectedProfiles = (selected?.profiles ?? []).map((id) => profileMap.get(id)).filter(Boolean) as AgentProfile[];
  const selectedMicro = (selected?.micro_pipelines ?? []).map((id) => microMap.get(id)).filter(Boolean) as MicroPipeline[];
  const selectedGates = (selected?.quality_gates ?? []).map((id) => gateMap.get(id)).filter(Boolean) as Gate[];
  const matchedRules = rules.filter((rule) => rule.select?.capability_packs?.includes(selected?.pack_id ?? ''));
  const health = selected ? buildPackHealth(selected) : { score: 0, missing: [] };
  const flow = selected ? packetFlowFor(selected) : [];

  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><Boxes size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Capability Pack Detail</h1><p className="mt-1 text-sm text-neutral-400">Intent coverage, team profiles, pipelines, gates, skills, tools and packet flow.</p></div></div></header>

    <section className="grid gap-6 xl:grid-cols-[420px_1fr]"><aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={18} className="text-cyan-400" />Search packs</label><input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none transition focus:border-cyan-500/50" placeholder="Search id, intent, macro..." /><div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{filtered.length} packs</div><div className="max-h-[76vh] space-y-2 overflow-auto pr-1">{filtered.map((pack) => { const packHealth = buildPackHealth(pack); return <button key={pack.pack_id} onClick={() => setSelectedId(pack.pack_id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.pack_id === pack.pack_id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}><div className="flex items-center justify-between gap-2"><div className="truncate text-sm font-medium text-white">{pack.pack_id}</div><Badge tone={packHealth.score >= 80 ? 'green' : packHealth.score >= 60 ? 'yellow' : 'red'}>{packHealth.score}</Badge></div><div className="mt-1 truncate text-xs text-neutral-500">{pack.macro_pipeline ?? 'no macro'}</div><div className="mt-2 flex flex-wrap gap-1">{(pack.for_intents ?? []).slice(0, 3).map((intent) => <span key={intent} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-neutral-400">{intent}</span>)}</div></button>; })}</div></aside>

      {selected && <main className="flex flex-col gap-6"><section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="mb-3 flex flex-wrap gap-2"><Badge tone="cyan">{selected.type ?? 'capability-pack'}</Badge><Badge tone={selected.status === 'active' ? 'green' : 'yellow'}>{selected.status ?? 'unknown'}</Badge><Badge>{selected.macro_pipeline ?? 'no macro'}</Badge></div><h2 className="text-3xl font-light text-white">{selected.pack_id}</h2><p className="mt-4 max-w-4xl text-sm leading-relaxed text-neutral-300">{selected.summary}</p></div><div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center"><div className="text-3xl font-light text-white">{health.score}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">pack health</div></div></div>{health.missing.length > 0 && <div className="mt-5 rounded-xl border border-red-500/20 bg-red-950/10 p-4"><div className="mb-2 text-xs font-semibold text-red-200">Missing references</div><PillList items={health.missing} tone="red" /></div>}</section>

        <section className="grid gap-6 lg:grid-cols-2"><Section icon={<BrainCircuit size={18} />} title="Intent coverage"><PillList items={selected.for_intents} tone="cyan" /><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">memory policy</div><Badge>{selected.memory_policy ?? 'none'}</Badge></div><div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">context policy</div><Badge>{selected.context_policy ?? 'none'}</Badge></div></div></Section><Section icon={<Wrench size={18} />} title="Skills / tools"><div className="grid gap-4 md:grid-cols-2"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">skills</div><PillList items={selected.skills} tone="green" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">tools</div><PillList items={selected.tools} tone="yellow" /></div></div></Section></section>

        <Section icon={<Users size={18} />} title="Team profiles"><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{selectedProfiles.map((profile) => <DetailCard key={profile.id} title={profile.title} subtitle={profile.id} summary={profile.summary} badge={<Badge>{profile.family ?? 'profile'}</Badge>}><div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">outputs</div><PillList items={profile.outputs} /></div><div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">failure modes</div><PillList items={profile.failure_modes} tone="yellow" /></div></DetailCard>)}</div></Section>

        <Section icon={<Network size={18} />} title="Micro pipelines"><div className="grid gap-4 lg:grid-cols-2">{selectedMicro.map((pipeline) => <DetailCard key={pipeline.id} title={pipeline.title} subtitle={pipeline.id} summary={pipeline.summary} badge={<Badge tone="cyan">{pipeline.parent_macro ?? 'micro'}</Badge>}><div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">required profiles</div><PillList items={pipeline.required_profiles} /></div><div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">outputs</div><PillList items={pipeline.outputs} tone="green" /></div></DetailCard>)}</div></Section>

        <Section icon={<ShieldCheck size={18} />} title="Quality gates"><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{selectedGates.map((gate) => <DetailCard key={gate.id} title={gate.title} subtitle={gate.id} summary={gate.summary} badge={<Badge tone={gate.severity === 'critical' ? 'red' : gate.severity === 'blocking' ? 'yellow' : 'neutral'}>{gate.severity ?? 'gate'}</Badge>}><div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">pass criteria</div><PillList items={gate.pass_criteria} tone="green" /></div></DetailCard>)}</div></Section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"><Section icon={<FileJson size={18} />} title="Packet flow"><div className="grid gap-3">{flow.map((item, index) => <div key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge tone="cyan">{String(index + 1).padStart(2, '0')}</Badge><Badge>{item.id}</Badge></div><div className="text-sm font-semibold text-white">{item.title}</div><p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.description}</p></div>)}</div></Section><Section icon={<Layers size={18} />} title="Compiler rules using this pack"><div className="space-y-3">{matchedRules.length ? matchedRules.map((rule) => <div key={rule.id} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-medium text-white">{rule.title}</div><div className="mt-1 text-xs text-neutral-500">{rule.id}</div></div><Badge tone="cyan">p{rule.priority ?? 'n/a'}</Badge></div></div>) : <div className="text-sm text-neutral-500">No compiler rules reference this pack yet.</div>}</div></Section></section>
      </main>}
    </section>
  </div></div>;
}
