import { useMemo, useState, type ReactNode } from 'react';
import { Boxes, BrainCircuit, FileText, Network, Search, ShieldCheck, Users } from 'lucide-react';
import compilerRulesData from '../registry/compiler-rules.json';
import agentProfilesData from '../registry/agent-profiles.json';
import agentProfilesExtraData from '../registry/agent-profiles-extra.json';
import gatesData from '../registry/gates.json';
import microPipelinesData from '../registry/micro-pipelines.json';
import microPipelinesExtraData from '../registry/micro-pipelines-extra.json';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';
import ExecutionPlanPanel from './ExecutionPlanPanel.tsx';

type Rule = { id: string; title: string; status: string; priority?: number; match?: Record<string, string[]>; select?: { macro_pipeline?: string; micro_pipelines?: string[]; profiles?: string[]; capability_packs?: string[]; gates?: string[]; memory_policy?: string; context_policy?: string; }; };
type AgentProfile = { id: string; title: string; summary: string; family?: string; status?: string; inputs?: string[]; outputs?: string[]; gates?: string[]; does?: string[]; does_not?: string[]; failure_modes?: string[]; };
type Gate = { id: string; title: string; summary: string; family?: string; status?: string; severity?: string; inputs?: string[]; outputs?: string[]; pass_criteria?: string[]; fail_criteria?: string[]; };
type MicroPipeline = { id: string; parent_macro?: string; title: string; summary: string; status?: string; required_profiles?: string[]; required_gates?: string[]; outputs?: string[]; };
type CapabilityPack = { pack_id: string; type?: string; status?: string; summary: string; for_intents?: string[]; macro_pipeline?: string; micro_pipelines?: string[]; profiles?: string[]; skills?: string[]; tools?: string[]; quality_gates?: string[]; memory_policy?: string; context_policy?: string; };

const rules = (compilerRulesData as { compiler_rules: Rule[] }).compiler_rules ?? [];
const agentProfiles = [...((agentProfilesData as { agent_profiles: AgentProfile[] }).agent_profiles ?? []), ...((agentProfilesExtraData as { agent_profiles: AgentProfile[] }).agent_profiles ?? [])];
const gates = (gatesData as { gates: Gate[] }).gates ?? [];
const microPipelines = [...((microPipelinesData as { micro_pipelines: MicroPipeline[] }).micro_pipelines ?? []), ...((microPipelinesExtraData as { micro_pipelines: MicroPipeline[] }).micro_pipelines ?? [])];
const packs = [...((packsData as { capability_packs: CapabilityPack[] }).capability_packs ?? []), ...((packsExtraData as { capability_packs: CapabilityPack[] }).capability_packs ?? [])];

function toMap<T extends { id?: string; pack_id?: string }>(items: T[], key: 'id' | 'pack_id' = 'id') { return new Map(items.map((item) => [item[key] as string, item])); }
const profileMap = toMap(agentProfiles);
const gateMap = toMap(gates);
const microPipelineMap = toMap(microPipelines);
const packMap = toMap(packs, 'pack_id');

function normalize(value: string) { return value.toLowerCase().replace(/[_-]/g, ' '); }
function containsToken(text: string, token: string) { return text.includes(normalize(token)); }
function scoreRule(rule: Rule, rawIntent: string) {
  const intent = normalize(rawIntent);
  if (!intent.trim()) return 0;
  let score = rule.priority ?? 1;
  const match = rule.match ?? {};
  for (const token of match.contains_all ?? []) { if (!containsToken(intent, token)) return 0; score += 25; }
  const anyTokens = match.contains_any ?? [];
  if (anyTokens.length > 0) {
    const hits = anyTokens.filter((token) => containsToken(intent, token)).length;
    if (hits === 0 && (match.contains_all ?? []).length === 0) score -= 30;
    score += hits * 12;
  }
  for (const field of ['domain', 'platform', 'target_output'] as const) {
    const values = match[field] ?? [];
    const hits = values.filter((value) => containsToken(intent, value)).length;
    score += hits * 16;
  }
  return Math.max(0, score);
}
function compileIntent(intent: string) { return rules.map((rule) => ({ rule, score: scoreRule(rule, intent) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || (b.rule.priority ?? 0) - (a.rule.priority ?? 0)); }
function getUnresolvedIds(selected?: Rule) {
  if (!selected?.select) return [];
  const unresolved: string[] = [];
  for (const id of selected.select.profiles ?? []) if (!profileMap.has(id)) unresolved.push(`profile:${id}`);
  for (const id of selected.select.gates ?? []) if (!gateMap.has(id)) unresolved.push(`gate:${id}`);
  for (const id of selected.select.micro_pipelines ?? []) if (!microPipelineMap.has(id)) unresolved.push(`micro:${id}`);
  for (const id of selected.select.capability_packs ?? []) if (!packMap.has(id)) unresolved.push(`pack:${id}`);
  return unresolved;
}

function Pill({ children }: { children: ReactNode }) { return <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300">{children}</span>; }
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'cyan' | 'emerald' | 'yellow' | 'red' }) {
  const classes = { neutral: 'border-white/10 bg-white/5 text-neutral-300', cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300', emerald: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300', yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200', red: 'border-red-500/20 bg-red-950/20 text-red-200' };
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${classes[tone]}`}>{children}</span>;
}
function ListLine({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return <div className="mt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</div><div className="flex flex-wrap gap-2">{items.map((item) => <Pill key={item}>{item}</Pill>)}</div></div>;
}
function DetailCard({ title, subtitle, summary, badges, children }: { title: string; subtitle?: string; summary?: string; badges?: ReactNode; children?: ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-white">{title}</h3>{subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}</div>{badges}</div>{summary && <p className="mt-3 text-sm leading-relaxed text-neutral-400">{summary}</p>}{children}</div>;
}
function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{children}</section>;
}

export default function CompilerView({ onSendTaskPacket }: { onSendTaskPacket?: (packet: unknown) => void }) {
  const [intent, setIntent] = useState('Build a web SaaS MVP with React frontend, backend API, database, tests and release gates.');
  const matches = useMemo(() => compileIntent(intent), [intent]);
  const selected = matches[0]?.rule;
  const score = matches[0]?.score ?? 0;
  const selectedProfiles = (selected?.select?.profiles ?? []).map((id) => profileMap.get(id)).filter(Boolean) as AgentProfile[];
  const selectedGates = (selected?.select?.gates ?? []).map((id) => gateMap.get(id)).filter(Boolean) as Gate[];
  const selectedMicroPipelines = (selected?.select?.micro_pipelines ?? []).map((id) => microPipelineMap.get(id)).filter(Boolean) as MicroPipeline[];
  const selectedPacks = (selected?.select?.capability_packs ?? []).map((id) => packMap.get(id)).filter(Boolean) as CapabilityPack[];
  const unresolvedIds = getUnresolvedIds(selected);

  return <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-cyan-500/30 selection:text-cyan-200"><div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6">
    <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><BrainCircuit size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Capability Compiler</h1><p className="mt-1 text-sm text-neutral-400">Intent -&gt; team profile -&gt; pipeline -&gt; pack -&gt; gates -&gt; execution plan</p></div></div><div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">Registry enriched</div></header>

    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={18} className="text-cyan-400" />Intent</label><textarea value={intent} onChange={(event) => setIntent(event.target.value)} className="min-h-[180px] w-full resize-y rounded-xl border border-white/10 bg-black/50 p-4 text-sm leading-relaxed text-neutral-200 outline-none transition focus:border-cyan-500/50" placeholder="Example: Build an STM32 HVAC fan driver with bench validation." /><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setIntent('Build a web SaaS MVP with React frontend, backend API, database, tests and release gates.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">Web SaaS MVP</button><button onClick={() => setIntent('Design STM32 HVAC fan driver firmware for 220V control with safety, timing and bench evidence.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">STM32 HVAC</button><button onClick={() => setIntent('Create an agentic system with tools, MCP, memory, context, evals and guardrails.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">Agentic System</button><button onClick={() => setIntent('Prepare a QCW 808 diode stack RFQ for Nd:YAG vendor outreach.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">QCW RFQ</button></div></div><div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">Execution brief</div>{selected ? <div><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-light text-white">{selected.title}</h2><Badge tone="cyan">score {score}</Badge></div><p className="mt-3 text-sm text-neutral-400">{selected.id}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Macro Pipeline</div><div className="mt-2 text-sm text-white">{selected.select?.macro_pipeline ?? 'none'}</div></div><div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Capability Pack</div><div className="mt-2 text-sm text-white">{selected.select?.capability_packs?.[0] ?? 'none'}</div></div><div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Memory Policy</div><div className="mt-2 text-sm text-white">{selected.select?.memory_policy ?? 'none'}</div></div><div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Context Policy</div><div className="mt-2 text-sm text-white">{selected.select?.context_policy ?? 'none'}</div></div></div></div> : <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-5 text-sm text-yellow-200">No compiler rule matched this intent yet.</div>}</div></section>

    <ExecutionPlanPanel selected={selected} profiles={selectedProfiles} gates={selectedGates} microPipelines={selectedMicroPipelines} packs={selectedPacks} onSendTaskPacket={onSendTaskPacket} />

    {selected && <><Section icon={<Network size={18} />} title="Micro pipeline cards"><div className="grid gap-4 lg:grid-cols-2">{selectedMicroPipelines.map((pipeline) => <DetailCard key={pipeline.id} title={pipeline.title} subtitle={pipeline.id} summary={pipeline.summary} badges={<Badge tone="cyan">{pipeline.parent_macro}</Badge>}><ListLine label="required profiles" items={pipeline.required_profiles} /><ListLine label="required gates" items={pipeline.required_gates} /><ListLine label="outputs" items={pipeline.outputs} /></DetailCard>)}</div></Section><Section icon={<Users size={18} />} title="Team profile cards"><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{selectedProfiles.map((profile) => <DetailCard key={profile.id} title={profile.title} subtitle={profile.id} summary={profile.summary} badges={<Badge>{profile.family}</Badge>}><ListLine label="does" items={profile.does} /><ListLine label="outputs" items={profile.outputs} /><ListLine label="failure modes" items={profile.failure_modes} /></DetailCard>)}</div></Section><Section icon={<ShieldCheck size={18} />} title="Gate cards"><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{selectedGates.map((gate) => { const severityTone = gate.severity === 'critical' ? 'red' : gate.severity === 'blocking' ? 'yellow' : 'neutral'; return <DetailCard key={gate.id} title={gate.title} subtitle={gate.id} summary={gate.summary} badges={<Badge tone={severityTone}>{gate.severity ?? 'gate'}</Badge>}><ListLine label="pass criteria" items={gate.pass_criteria} /><ListLine label="fail criteria" items={gate.fail_criteria} /></DetailCard>; })}</div></Section><Section icon={<Boxes size={18} />} title="Capability pack details"><div className="grid gap-4 lg:grid-cols-2">{selectedPacks.map((pack) => <DetailCard key={pack.pack_id} title={pack.pack_id} subtitle={pack.status} summary={pack.summary} badges={<Badge tone="emerald">{pack.macro_pipeline}</Badge>}><ListLine label="intents" items={pack.for_intents} /><ListLine label="micro pipelines" items={pack.micro_pipelines} /><ListLine label="profiles" items={pack.profiles} /><ListLine label="skills" items={pack.skills} /><ListLine label="tools" items={pack.tools} /><ListLine label="quality gates" items={pack.quality_gates} /></DetailCard>)}</div></Section>{unresolvedIds.length > 0 && <Section icon={<FileText size={18} />} title="Missing / unresolved registry IDs"><div className="flex flex-wrap gap-2">{unresolvedIds.map((id) => <Badge key={id} tone="red">{id}</Badge>)}</div></Section>}</>}

    <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Matched rules</div><div className="space-y-2">{matches.map(({ rule, score }) => <div key={rule.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"><div><div className="text-sm font-medium text-white">{rule.title}</div><div className="text-xs text-neutral-500">{rule.id}</div></div><div className="text-xs text-cyan-300">{score}</div></div>)}</div></section>
  </div></div>;
}
