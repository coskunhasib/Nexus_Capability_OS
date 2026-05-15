import { useMemo, useState } from 'react';
import { Beaker, BrainCircuit, FileJson, FlaskConical, ListChecks, Search, ShieldCheck, Wrench } from 'lucide-react';
import skillsData from '../registry/skills.json';
import skillResearchReviewsData from '../registry/skill-research-reviews.json';
import packsData from '../registry/example-capability-packs.json';
import packsExtraData from '../registry/capability-packs-extra.json';

type Skill = {
  id: string;
  type: 'skill';
  title: string;
  summary: string;
  status: 'draft' | 'active' | 'experimental' | 'deprecated';
  source_lineage: { origin: string; source_type: string; notes: string };
  when_to_use: string[];
  inputs: string[];
  outputs: string[];
  procedure: string[];
  edge_cases: string[];
  quality_gates: string[];
  failure_modes: string[];
  related_profiles: string[];
  related_tools?: string[];
  compatible_packs: string[];
  research_policy: {
    requires_current_research: boolean;
    required_sources: string[];
    research_questions: string[];
  };
  improvement_notes: string[];
  eval_hooks?: string[];
};

type SkillResearchReview = {
  skill_id: string;
  reviewed_at: string;
  maturity_decision: 'draft' | 'experimental' | 'active' | 'deprecated';
  source_basis: string[];
  research_findings: string[];
  applied_upgrades: string[];
  remaining_risks: string[];
  sources: string[];
};

type CapabilityPack = { pack_id: string; summary: string; skills?: string[]; macro_pipeline?: string; status?: string };

const skills = (skillsData as { skills: Skill[] }).skills ?? [];
const skillResearchReviews = (skillResearchReviewsData as { skill_research_reviews: SkillResearchReview[] }).skill_research_reviews ?? [];
const packs: CapabilityPack[] = [
  ...((packsData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
  ...((packsExtraData as { capability_packs: CapabilityPack[] }).capability_packs ?? []),
];

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

function PillList({ items, tone = 'neutral' }: { items?: string[]; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' | 'red' }) {
  if (!items?.length) return <span className="text-xs text-neutral-500">none</span>;
  return <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}</div>;
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{children}</section>;
}

function StepList({ items, tone = 'cyan' }: { items: string[]; tone?: 'cyan' | 'green' | 'yellow' | 'red' }) {
  if (!items.length) return <span className="text-xs text-neutral-500">none</span>;
  return <div className="space-y-2">{items.map((item, index) => <div key={`${index}:${item}`} className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><Badge tone={tone}>{String(index + 1).padStart(2, '0')}</Badge><span className="ml-3">{item}</span></div>)}</div>;
}

export default function SkillInspectorView() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(skills[0]?.id ?? '');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return skills.filter((skill) => !q || `${skill.id} ${skill.title} ${skill.summary} ${skill.status} ${skill.compatible_packs.join(' ')}`.toLowerCase().includes(q));
  }, [query]);

  const selected = skills.find((skill) => skill.id === selectedId) ?? filtered[0] ?? skills[0];
  const selectedReview = skillResearchReviews.find((review) => review.skill_id === selected?.id);
  const linkedPacks = packs.filter((pack) => pack.skills?.includes(selected?.id ?? ''));
  const statusTone = selected?.status === 'active' ? 'green' : selected?.status === 'experimental' ? 'yellow' : selected?.status === 'deprecated' ? 'red' : 'cyan';
  const maturityTone = selectedReview?.maturity_decision === 'active' ? 'green' : selectedReview?.maturity_decision === 'deprecated' ? 'red' : 'yellow';

  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><BrainCircuit size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Skill Inspector</h1><p className="mt-1 text-sm text-neutral-400">Canonical skills are first-class runtime ingredients, with research reviews attached.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Badge tone="cyan">{skills.length} skills</Badge><Badge tone="green">{packs.length} packs</Badge><Badge tone="yellow">{skillResearchReviews.length} research reviews</Badge><Badge tone="yellow">audit enforced</Badge></div></header>
    <section className="grid gap-6 xl:grid-cols-[390px_1fr]"><aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={18} className="text-cyan-400" />Search skills</label><input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none transition focus:border-cyan-500/50" placeholder="Search skill, status, pack..." /><div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{filtered.length} skills</div><div className="space-y-2">{filtered.map((skill) => { const review = skillResearchReviews.find((item) => item.skill_id === skill.id); return <button key={skill.id} onClick={() => setSelectedId(skill.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === skill.id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}><div className="flex items-center justify-between gap-2"><div className="truncate text-sm font-medium text-white">{skill.id}</div><Badge tone={review ? 'green' : 'red'}>{review ? review.maturity_decision : 'no review'}</Badge></div><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-400">{skill.summary}</p><div className="mt-3 flex flex-wrap gap-1">{skill.quality_gates.slice(0, 3).map((gate) => <span key={gate} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-neutral-400">{gate}</span>)}</div></button>; })}</div></aside>
    {selected && <main className="flex flex-col gap-6"><section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="mb-3 flex flex-wrap gap-2"><Badge tone={statusTone}>{selected.status}</Badge><Badge>{selected.source_lineage.source_type}</Badge><Badge tone="yellow">{linkedPacks.length} linked packs</Badge>{selectedReview && <Badge tone={maturityTone}>research: {selectedReview.maturity_decision}</Badge>}</div><h2 className="text-3xl font-light text-white">{selected.title}</h2><p className="mt-4 max-w-4xl text-sm leading-relaxed text-neutral-300">{selected.summary}</p></div><div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-neutral-400 lg:w-[360px]"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">source lineage</div><div className="text-white">{selected.source_lineage.origin}</div><p className="mt-2">{selected.source_lineage.notes}</p></div></div></section>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ListChecks size={18} />} title="When to use"><StepList items={selected.when_to_use} /></Panel><Panel icon={<FileJson size={18} />} title="Inputs / outputs"><div className="space-y-5"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">inputs</div><PillList items={selected.inputs} tone="cyan" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">outputs</div><PillList items={selected.outputs} tone="green" /></div></div></Panel></section>
      <Panel icon={<Wrench size={18} />} title="Procedure"><StepList items={selected.procedure} /></Panel>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ShieldCheck size={18} />} title="Edge cases / failure modes"><div className="grid gap-5 md:grid-cols-2"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">edge cases</div><PillList items={selected.edge_cases} tone="yellow" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">failure modes</div><PillList items={selected.failure_modes} tone="red" /></div></div></Panel><Panel icon={<ShieldCheck size={18} />} title="Quality gates / eval hooks"><div className="space-y-5"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">quality gates</div><PillList items={selected.quality_gates} tone="yellow" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">eval hooks</div><PillList items={selected.eval_hooks} tone="cyan" /></div></div></Panel></section>
      {selectedReview && <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<Beaker size={18} />} title="Research review"><div className="space-y-5"><div className="flex flex-wrap gap-2"><Badge tone={maturityTone}>{selectedReview.maturity_decision}</Badge><Badge>{selectedReview.reviewed_at}</Badge></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">source basis</div><StepList items={selectedReview.source_basis} tone="cyan" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">source refs</div><PillList items={selectedReview.sources} /></div></div></Panel><Panel icon={<FlaskConical size={18} />} title="Research findings / applied upgrades"><div className="space-y-5"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">findings</div><StepList items={selectedReview.research_findings} tone="green" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">applied upgrades</div><StepList items={selectedReview.applied_upgrades} tone="yellow" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">remaining risks</div><PillList items={selectedReview.remaining_risks} tone="red" /></div></div></Panel></section>}
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<Beaker size={18} />} title="Research policy"><div className="space-y-5"><div className="flex flex-wrap gap-2"><Badge tone={selected.research_policy.requires_current_research ? 'yellow' : 'green'}>{selected.research_policy.requires_current_research ? 'current research required' : 'stable knowledge enough'}</Badge></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">required source classes</div><PillList items={selected.research_policy.required_sources} /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">research questions</div><StepList items={selected.research_policy.research_questions} /></div></div></Panel><Panel icon={<FlaskConical size={18} />} title="Improvement notes"><StepList items={selected.improvement_notes} /></Panel></section>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<BrainCircuit size={18} />} title="Related profiles / tools"><div className="space-y-5"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">profiles</div><PillList items={selected.related_profiles} tone="cyan" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">tools</div><PillList items={selected.related_tools} tone="green" /></div></div></Panel><Panel icon={<FileJson size={18} />} title="Compatible packs"><div className="space-y-3">{linkedPacks.length ? linkedPacks.map((pack) => <div key={pack.pack_id} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-2 flex flex-wrap gap-2"><Badge tone="cyan">{pack.pack_id}</Badge><Badge>{pack.macro_pipeline ?? 'no macro'}</Badge></div><p className="text-sm leading-relaxed text-neutral-400">{pack.summary}</p></div>) : <div className="text-sm text-neutral-500">No compatible pack linked yet.</div>}</div></Panel></section>
    </main>}
    </section></div></div>;
}
