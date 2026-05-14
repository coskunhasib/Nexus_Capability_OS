import { useMemo, useState } from 'react';
import { Clipboard, FlaskConical, ListChecks, Search, ShieldCheck, Target } from 'lucide-react';
import webSaasTrial from '../samples/trials/web-saas-mvp.trial.json';
import stm32Trial from '../samples/trials/stm32-firmware.trial.json';
import agenticTrial from '../samples/trials/agentic-system.trial.json';
import rfqTrial from '../samples/trials/rfq-generation.trial.json';
import technicalReportTrial from '../samples/trials/technical-report.trial.json';

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

const scenarios = [webSaasTrial, stm32Trial, agenticTrial, rfqTrial, technicalReportTrial] as TrialScenario[];
const pendingTrialIntentKey = 'nexus.pendingTrialIntent';

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function PillList({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'cyan' | 'green' | 'yellow' }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}</div>;
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-400">{icon}</span>{title}</div>{children}</section>;
}

export default function TrialScenarioView({ onOpenCompiler }: { onOpenCompiler?: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(scenarios[0]?.scenario_id ?? '');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return scenarios.filter((scenario) => !q || `${scenario.scenario_id} ${scenario.intent} ${(scenario.tags ?? []).join(' ')}`.toLowerCase().includes(q));
  }, [query]);
  const selected = scenarios.find((scenario) => scenario.scenario_id === selectedId) ?? filtered[0] ?? scenarios[0];

  const copyIntent = async () => {
    await navigator.clipboard.writeText(selected.intent);
  };

  const openInCompiler = async () => {
    window.localStorage.setItem(pendingTrialIntentKey, selected.intent);
    await copyIntent();
    onOpenCompiler?.();
  };

  return <div className="min-h-screen bg-[#050505] px-4 py-8 text-neutral-200 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-6"><header className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black"><FlaskConical size={26} strokeWidth={2.5} /></div><div><h1 className="text-2xl font-semibold tracking-tight text-white">Trial Scenario Library</h1><p className="mt-1 text-sm text-neutral-400">Repeatable test cases for validating compiler routing, expected packs, gates and Nexus handoff value.</p></div></div></header>
    <section className="grid gap-6 xl:grid-cols-[380px_1fr]"><aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={18} className="text-cyan-400" />Search trials</label><input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-cyan-500/50" placeholder="Search intent, tag, scenario..." /><div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{filtered.length} scenarios</div><div className="space-y-2">{filtered.map((scenario) => <button key={scenario.scenario_id} onClick={() => setSelectedId(scenario.scenario_id)} className={`w-full rounded-xl border p-3 text-left transition ${selected.scenario_id === scenario.scenario_id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}><div className="flex items-center justify-between gap-2"><div className="text-sm font-medium text-white">{scenario.scenario_id}</div><Badge tone="cyan">v{scenario.version}</Badge></div><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-400">{scenario.intent}</p><div className="mt-3 flex flex-wrap gap-1">{(scenario.tags ?? []).slice(0, 4).map((tag) => <span key={tag} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-neutral-400">{tag}</span>)}</div></button>)}</div></aside>
    {selected && <main className="flex flex-col gap-6"><Panel icon={<Target size={18} />} title="Trial intent"><div className="rounded-xl border border-white/10 bg-black/30 p-5"><div className="mb-3 flex flex-wrap gap-2"><Badge tone="cyan">{selected.scenario_id}</Badge><Badge>{selected.expected.macro_pipeline}</Badge><Badge tone="green">{selected.expected.capability_pack}</Badge></div><p className="text-lg leading-relaxed text-white">{selected.intent}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void copyIntent()} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><Clipboard size={14} />Copy intent</button><button onClick={() => void openInCompiler()} className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/30"><Clipboard size={14} />Load in Compiler</button></div></div></Panel>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ListChecks size={18} />} title="Expected routing"><div className="space-y-4"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">profiles</div><PillList items={selected.expected.profiles} /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">micro pipelines</div><PillList items={selected.expected.micro_pipelines} tone="cyan" /></div><div><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">packets</div><PillList items={selected.expected.packets} tone="green" /></div></div></Panel><Panel icon={<ShieldCheck size={18} />} title="Expected gates"><PillList items={selected.expected.gates} tone="yellow" /></Panel></section>
      <section className="grid gap-6 lg:grid-cols-2"><Panel icon={<ShieldCheck size={18} />} title="Acceptance criteria"><div className="space-y-2">{selected.acceptance_criteria.map((item, index) => <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><Badge tone="cyan">{String(index + 1).padStart(2, '0')}</Badge><span className="ml-3">{item}</span></div>)}</div></Panel><Panel icon={<FlaskConical size={18} />} title="Nexus integration notes"><div className="space-y-2">{(selected.nexus_integration_notes ?? []).map((item, index) => <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><Badge tone="yellow">{String(index + 1).padStart(2, '0')}</Badge><span className="ml-3">{item}</span></div>)}</div></Panel></section>
    </main>}
    </section></div></div>;
}
