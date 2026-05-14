import { useMemo, useState } from 'react';
import { Boxes, BrainCircuit, CheckCircle2, Layers, Network, Search, ShieldCheck, Users } from 'lucide-react';
import compilerRulesData from '../registry/compiler-rules.json';

type Rule = {
  id: string;
  title: string;
  status: string;
  priority?: number;
  match?: Record<string, string[]>;
  select?: {
    macro_pipeline?: string;
    micro_pipelines?: string[];
    profiles?: string[];
    capability_packs?: string[];
    gates?: string[];
    memory_policy?: string;
    context_policy?: string;
  };
};

const rules = (compilerRulesData as { compiler_rules: Rule[] }).compiler_rules ?? [];

function normalize(value: string) {
  return value.toLowerCase().replace(/[_-]/g, ' ');
}

function containsToken(text: string, token: string) {
  return text.includes(normalize(token));
}

function scoreRule(rule: Rule, rawIntent: string) {
  const intent = normalize(rawIntent);
  if (!intent.trim()) return 0;

  let score = rule.priority ?? 1;
  const match = rule.match ?? {};

  for (const token of match.contains_all ?? []) {
    if (!containsToken(intent, token)) return 0;
    score += 25;
  }

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

function compileIntent(intent: string) {
  return rules
    .map((rule) => ({ rule, score: scoreRule(rule, intent) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.rule.priority ?? 0) - (a.rule.priority ?? 0));
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300">{children}</span>;
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items?: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-cyan-400">{icon}</span>
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {(items ?? []).length > 0 ? items!.map((item) => <Pill key={item}>{item}</Pill>) : <span className="text-sm text-neutral-500">No selection</span>}
      </div>
    </div>
  );
}

export default function CompilerView() {
  const [intent, setIntent] = useState('Build a web SaaS MVP with React frontend, backend API, database, tests and release gates.');
  const matches = useMemo(() => compileIntent(intent), [intent]);
  const selected = matches[0]?.rule;
  const score = matches[0]?.score ?? 0;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-black">
              <BrainCircuit size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Capability Compiler</h1>
              <p className="mt-1 text-sm text-neutral-400">Intent -> team profile -> pipeline -> pack -> gates</p>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Registry backed
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Search size={18} className="text-cyan-400" />
              Intent
            </label>
            <textarea
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              className="min-h-[180px] w-full resize-y rounded-xl border border-white/10 bg-black/50 p-4 text-sm leading-relaxed text-neutral-200 outline-none transition focus:border-cyan-500/50"
              placeholder="Example: Build an STM32 HVAC fan driver with bench validation."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setIntent('Build a web SaaS MVP with React frontend, backend API, database, tests and release gates.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">Web SaaS MVP</button>
              <button onClick={() => setIntent('Design STM32 HVAC fan driver firmware for 220V control with safety, timing and bench evidence.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">STM32 HVAC</button>
              <button onClick={() => setIntent('Create an agentic system with tools, MCP, memory, context, evals and guardrails.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">Agentic System</button>
              <button onClick={() => setIntent('Prepare a QCW 808 diode stack RFQ for Nd:YAG vendor outreach.')} className="rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/5">QCW RFQ</button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">Best match</div>
            {selected ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-light text-white">{selected.title}</h2>
                  <span className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-300">score {score}</span>
                </div>
                <p className="mt-3 text-sm text-neutral-400">{selected.id}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Macro Pipeline</div>
                    <div className="mt-2 text-sm text-white">{selected.select?.macro_pipeline ?? 'none'}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Capability Pack</div>
                    <div className="mt-2 text-sm text-white">{selected.select?.capability_packs?.[0] ?? 'none'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-5 text-sm text-yellow-200">No compiler rule matched this intent yet.</div>
            )}
          </div>
        </section>

        {selected && (
          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Section icon={<Network size={18} />} title="Micro Pipelines" items={selected.select?.micro_pipelines} />
            <Section icon={<Users size={18} />} title="Team Profiles" items={selected.select?.profiles} />
            <Section icon={<ShieldCheck size={18} />} title="Quality Gates" items={selected.select?.gates} />
            <Section icon={<Boxes size={18} />} title="Capability Packs" items={selected.select?.capability_packs} />
            <Section icon={<Layers size={18} />} title="Memory Policy" items={selected.select?.memory_policy ? [selected.select.memory_policy] : []} />
            <Section icon={<CheckCircle2 size={18} />} title="Context Policy" items={selected.select?.context_policy ? [selected.select.context_policy] : []} />
          </section>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Matched rules</div>
          <div className="space-y-2">
            {matches.map(({ rule, score }) => (
              <div key={rule.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-white">{rule.title}</div>
                  <div className="text-xs text-neutral-500">{rule.id}</div>
                </div>
                <div className="text-xs text-cyan-300">{score}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
