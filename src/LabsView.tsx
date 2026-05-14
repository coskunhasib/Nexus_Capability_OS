import { useMemo, useState } from 'react';
import { Boxes, Building2, CircleDollarSign, FlaskConical, GitBranch, LayoutDashboard, Network, Workflow } from 'lucide-react';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';
import backlogData from '../labs/feature-backlog.json';

type LabTab = 'marketplace' | 'graph' | 'workflow' | 'workspace' | 'billing';
type CapabilityPack = { pack_id: string; status?: string; summary: string; for_intents?: string[]; macro_pipeline?: string; profiles?: string[]; micro_pipelines?: string[]; quality_gates?: string[]; tools?: string[]; skills?: string[] };
type BacklogItem = { id: string; status: string; why: string };
type Backlog = { version: string; policy: string; classes: Record<string, BacklogItem[]> };

const packs: CapabilityPack[] = [
  ...((packsData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
  ...((packsExtraData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
];
const backlog = backlogData as Backlog;

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

function PillList({ items, tone = 'neutral', limit = 8 }: { items?: string[]; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red'; limit?: number }) {
  const visible = (items ?? []).slice(0, limit);
  if (!visible.length) return <span className="text-xs text-neutral-500">none</span>;
  return <div className="flex flex-wrap gap-2">{visible.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}{(items ?? []).length > limit && <Badge>+{(items ?? []).length - limit}</Badge>}</div>;
}

function TabButton({ id, active, icon, label, onClick }: { id: LabTab; active: boolean; icon: React.ReactNode; label: string; onClick: (id: LabTab) => void }) {
  return <button onClick={() => onClick(id)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${active ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}>{icon}{label}</button>;
}

function Card({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{subtitle && <p className="mt-1 text-xs leading-relaxed text-neutral-500">{subtitle}</p>}</div></div>{children}</section>;
}

function backlogFor(id: string) {
  return Object.values(backlog.classes).flat().find((item) => item.id === id);
}

function MarketplaceLab() {
  const sorted = useMemo(() => [...packs].sort((a, b) => (b.for_intents?.length ?? 0) - (a.for_intents?.length ?? 0)), []);
  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><Card icon={<Boxes size={18} />} title="Capability Marketplace Lab" subtitle="Pack catalog view for future packaging, discovery and productization."><div className="grid gap-4 lg:grid-cols-2">{sorted.map((pack) => <div key={pack.pack_id} className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="mb-3 flex flex-wrap gap-2"><Badge tone="cyan">{pack.macro_pipeline ?? 'no macro'}</Badge><Badge tone={pack.status === 'active' ? 'green' : 'yellow'}>{pack.status ?? 'unknown'}</Badge></div><h3 className="text-base font-semibold text-white">{pack.pack_id}</h3><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">{pack.summary}</p><div className="mt-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">intents</div><PillList items={pack.for_intents} tone="cyan" limit={5} /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">profiles</div><PillList items={pack.profiles} limit={4} /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">gates</div><PillList items={pack.quality_gates} tone="yellow" limit={4} /></div></div></div>)}</div></Card><Card icon={<LayoutDashboard size={18} />} title="Marketplace activation rules"><div className="space-y-3 text-sm leading-relaxed text-neutral-300"><p>Marketplace should become active only after trials prove which packs repeatedly create useful Nexus handoff packets.</p><div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 text-xs font-semibold text-white">Promotion criteria</div><PillList items={['used in 3+ trials', 'stable handoff packet', 'clear buyer/user persona', 'defined gates', 'runtime compatible']} tone="green" /></div><div className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4 text-yellow-100">{backlogFor('marketplace-view')?.why}</div></div></Card></div>;
}

function GraphLab() {
  const nodes = ['Intent', 'Compiler Rule', 'Capability Pack', 'Profiles', 'Micro Pipelines', 'Gates', 'Task Packet', 'Nexus Handoff', 'Runtime Bridge', 'Review', 'Memory/Context'];
  return <Card icon={<Network size={18} />} title="Graph Editor Lab" subtitle="Future visual editor for seeing and editing the capability graph without touching JSON."><div className="grid gap-4 lg:grid-cols-[1fr_320px]"><div className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="flex flex-wrap items-center gap-3">{nodes.map((node, index) => <div key={node} className="flex items-center gap-3"><div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-sm font-semibold text-cyan-200">{node}</div>{index < nodes.length - 1 && <GitBranch size={16} className="text-neutral-600" />}</div>)}</div></div><div className="space-y-3"><div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 text-xs font-semibold text-white">Graph edit boundaries</div><PillList items={['no free-form mutation yet', 'schema-valid edges only', 'registry-backed nodes only', 'diff preview before save']} /></div><div className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4 text-sm text-yellow-100">{backlogFor('graph-editor')?.why}</div></div></div></Card>;
}

function WorkflowLab() {
  const lanes = [
    { title: 'Plan', items: ['intent intake', 'compiler match', 'execution plan'] },
    { title: 'Dispatch', items: ['task packet', 'nexus handoff', 'runtime target'] },
    { title: 'Observe', items: ['runtime event', 'gate evidence', 'artifact refs'] },
    { title: 'Close loop', items: ['review report', 'memory update', 'context update'] },
  ];
  return <Card icon={<Workflow size={18} />} title="Drag-drop Workflow Builder Lab" subtitle="Future workflow design surface. Current version is a semantic storyboard, not a mutable runtime graph."><div className="grid gap-4 xl:grid-cols-4">{lanes.map((lane) => <div key={lane.title} className="rounded-xl border border-white/10 bg-black/30 p-5"><h3 className="mb-4 text-sm font-semibold text-white">{lane.title}</h3><div className="space-y-2">{lane.items.map((item) => <div key={item} className="rounded-lg border border-white/10 bg-[#050505] px-3 py-2 text-sm text-neutral-300">{item}</div>)}</div></div>)}</div><div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4 text-sm text-yellow-100">{backlogFor('drag-drop-workflow-builder')?.why}</div></Card>;
}

function WorkspaceLab() {
  const roles = [
    { role: 'owner', scope: 'product strategy, registry approval, billing later' },
    { role: 'builder', scope: 'create/edit packs, run trials, export handoff packets' },
    { role: 'operator', scope: 'run task packets, update evidence, monitor blockers' },
    { role: 'viewer', scope: 'read-only inspection, reports, governance status' },
  ];
  return <Card icon={<Building2 size={18} />} title="Multi-user Workspace Lab" subtitle="Future organizational boundary for teams using Nexus + Capability OS together."><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">{roles.map((item) => <div key={item.role} className="rounded-xl border border-white/10 bg-black/30 p-5"><Badge tone="cyan">{item.role}</Badge><p className="mt-4 text-sm leading-relaxed text-neutral-300">{item.scope}</p></div>)}</div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 text-xs font-semibold text-white">Workspace objects</div><PillList items={['workspace', 'project', 'capability pack', 'trial run', 'handoff packet', 'runtime event', 'review report']} /></div><div className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4 text-sm text-yellow-100">{backlogFor('multi-user-workspace')?.why}</div></div></Card>;
}

function BillingLab() {
  const tiers = [
    { tier: 'Starter', target: 'single operator / local trial', meter: 'manual exports' },
    { tier: 'Builder', target: 'teams creating packs', meter: 'pack count + trial runs' },
    { tier: 'Runtime', target: 'Nexus-integrated execution', meter: 'handoff packets + runtime events' },
    { tier: 'Enterprise', target: 'private registry + governance', meter: 'workspace + compliance + support' },
  ];
  return <Card icon={<CircleDollarSign size={18} />} title="Billing / Packaging Lab" subtitle="Commercial model sketch. Not active until the runtime bridge proves value."><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">{tiers.map((item) => <div key={item.tier} className="rounded-xl border border-white/10 bg-black/30 p-5"><Badge tone="green">{item.tier}</Badge><div className="mt-4 text-sm leading-relaxed text-neutral-300">{item.target}</div><div className="mt-4 rounded-lg border border-white/10 bg-[#050505] p-3 text-xs text-neutral-400">Meter: {item.meter}</div></div>)}</div><div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4 text-sm text-yellow-100">{backlogFor('billing-and-marketplace-packaging')?.why}</div></Card>;
}

export default function LabsView() {
  const [tab, setTab] = useState<LabTab>('marketplace');
  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><FlaskConical size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Labs</h1><p className="mt-1 text-sm text-neutral-400">C-class ideas are visible here without polluting the core Studio → Runner → Governance workflow.</p></div></div><div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300">{backlog.policy}</div></header><nav className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2"><TabButton id="marketplace" label="Marketplace" icon={<Boxes size={16} />} active={tab === 'marketplace'} onClick={setTab} /><TabButton id="graph" label="Graph" icon={<Network size={16} />} active={tab === 'graph'} onClick={setTab} /><TabButton id="workflow" label="Workflow" icon={<Workflow size={16} />} active={tab === 'workflow'} onClick={setTab} /><TabButton id="workspace" label="Workspace" icon={<Building2 size={16} />} active={tab === 'workspace'} onClick={setTab} /><TabButton id="billing" label="Billing" icon={<CircleDollarSign size={16} />} active={tab === 'billing'} onClick={setTab} /></nav>{tab === 'marketplace' && <MarketplaceLab />}{tab === 'graph' && <GraphLab />}{tab === 'workflow' && <WorkflowLab />}{tab === 'workspace' && <WorkspaceLab />}{tab === 'billing' && <BillingLab />}</div></div>;
}
