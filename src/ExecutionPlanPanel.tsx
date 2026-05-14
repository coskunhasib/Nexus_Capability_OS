import { ClipboardList, FileText, GitBranch, Layers, ShieldCheck, UploadCloud } from 'lucide-react';

type Rule = {
  id: string;
  title: string;
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

type AgentProfile = { id: string; title: string; summary?: string; outputs?: string[]; gates?: string[] };
type Gate = { id: string; title: string; severity?: string };
type MicroPipeline = { id: string; title: string; required_profiles?: string[]; required_gates?: string[]; outputs?: string[] };
type CapabilityPack = { pack_id: string; summary?: string; skills?: string[]; tools?: string[]; quality_gates?: string[] };

type PlanStep = {
  id: string;
  title: string;
  owner: string;
  expectedOutputs: string[];
  gates: string[];
  related?: string;
  description: string;
};

function findProfile(profiles: AgentProfile[], preferred: string[], fallback?: string) {
  return profiles.find((profile) => preferred.includes(profile.id))?.id ?? fallback ?? profiles[0]?.id ?? 'unassigned';
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function buildPlan(selected: Rule, profiles: AgentProfile[], gates: Gate[], microPipelines: MicroPipeline[], packs: CapabilityPack[]): PlanStep[] {
  const gateIds = new Set(gates.map((gate) => gate.id));
  const profileIds = new Set(profiles.map((profile) => profile.id));
  const pack = packs[0];

  const intakeOwner = findProfile(profiles, ['requirement-extractor']);
  const architectureOwner = findProfile(profiles, ['system-architect', 'embedded-architect', 'agent-architect'], intakeOwner);
  const reviewOwner = findProfile(profiles, ['spec-compliance-reviewer', 'code-quality-reviewer', 'qa-automation-engineer'], profiles[0]?.id);
  const releaseOwner = findProfile(profiles, ['release-agent', 'devops-engineer', 'documentation-agent'], reviewOwner);
  const memoryOwner = findProfile(profiles, ['memory-curator', 'memory-engineer'], releaseOwner);
  const contextOwner = findProfile(profiles, ['context-manager', 'context-engineer'], memoryOwner);

  const steps: PlanStep[] = [
    {
      id: '01-intake',
      title: 'Intake / Requirement Lock',
      owner: intakeOwner,
      expectedOutputs: ['requirements', 'acceptance_criteria', 'open_questions'],
      gates: unique(['clarity', 'scope-fit'].filter((id) => gateIds.has(id))),
      description: 'Turn the raw intent into a bounded requirement set before any implementation planning.',
    },
    {
      id: '02-architecture',
      title: 'Architecture / Contract Setup',
      owner: architectureOwner,
      expectedOutputs: ['architecture_outline', 'interface_contracts', 'decision_candidates'],
      gates: unique(['architecture-coherence', 'decision-traceability'].filter((id) => gateIds.has(id))),
      description: 'Define system boundaries, interfaces, assumptions and decision points.',
    },
  ];

  for (const pipeline of microPipelines) {
    const owner = pipeline.required_profiles?.find((id) => profileIds.has(id)) ?? profiles[0]?.id ?? 'unassigned';
    steps.push({
      id: `pipeline-${pipeline.id}`,
      title: `Execute: ${pipeline.title}`,
      owner,
      expectedOutputs: pipeline.outputs ?? [],
      gates: pipeline.required_gates?.filter((id) => gateIds.has(id)) ?? [],
      related: pipeline.id,
      description: `Run the ${pipeline.id} micro-pipeline with its domain-specific outputs and gates.`,
    });
  }

  steps.push(
    {
      id: '90-review-verification',
      title: 'Review / Verification',
      owner: reviewOwner,
      expectedOutputs: ['spec_compliance_report', 'quality_report', 'test_evidence'],
      gates: unique(['spec-compliance', 'code-quality', 'test-evidence', ...(selected.select?.gates ?? [])].filter((id) => gateIds.has(id))),
      description: 'Separate spec compliance from quality review, then collect evidence for critical paths.',
    },
    {
      id: '91-release-handoff',
      title: 'Release / Handoff',
      owner: releaseOwner,
      expectedOutputs: ['release_notes', 'handoff_notes', 'risk_register'],
      gates: unique(['release-readiness', 'rollback-plan'].filter((id) => gateIds.has(id))),
      description: 'Prepare the work package for handoff, deployment or next-stage execution.',
    },
    {
      id: '92-memory-update',
      title: 'Memory Update',
      owner: memoryOwner,
      expectedOutputs: ['memory_records', 'deprecated_records', 'lessons_learned'],
      gates: unique(['memory-policy-fit', 'stale-memory-check'].filter((id) => gateIds.has(id))),
      related: selected.select?.memory_policy,
      description: 'Save only durable decisions, constraints, lessons and superseded records.',
    },
    {
      id: '93-context-policy',
      title: 'Context Policy / Working Set',
      owner: contextOwner,
      expectedOutputs: ['working_set', 'context_summary', 'next_context_boundary'],
      gates: unique(['context-budget'].filter((id) => gateIds.has(id))),
      related: selected.select?.context_policy,
      description: 'Define the active working set and prevent context bloat before the next execution loop.',
    },
  );

  if (pack) {
    steps.splice(2, 0, {
      id: '03-capability-pack-bind',
      title: `Capability Pack Bind: ${pack.pack_id}`,
      owner: architectureOwner,
      expectedOutputs: ['selected_skills', 'selected_tools', 'pack_constraints'],
      gates: pack.quality_gates?.filter((id) => gateIds.has(id)) ?? [],
      related: pack.pack_id,
      description: 'Bind the selected pack skills, tools and gates before micro-pipeline execution.',
    });
  }

  return steps;
}

function Badge({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'cyan' | 'yellow' }) {
  const cls = tone === 'cyan' ? 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300' : tone === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200' : 'border-white/10 bg-white/5 text-neutral-300';
  return <span className={`rounded-md border px-2 py-1 text-[11px] ${cls}`}>{children}</span>;
}

export default function ExecutionPlanPanel({ selected, profiles, gates, microPipelines, packs }: { selected?: Rule; profiles: AgentProfile[]; gates: Gate[]; microPipelines: MicroPipeline[]; packs: CapabilityPack[] }) {
  if (!selected) return null;
  const steps = buildPlan(selected, profiles, gates, microPipelines, packs);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ClipboardList size={18} className="text-cyan-400" />
          Generated Execution Plan
        </div>
        <Badge tone="cyan">{steps.length} steps</Badge>
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="cyan">{String(index + 1).padStart(2, '0')}</Badge>
                  {step.related && <Badge>{step.related}</Badge>}
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.description}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-neutral-300">
                Owner: <span className="text-white">{step.owner}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><FileText size={13} /> Expected outputs</div>
                <div className="flex flex-wrap gap-2">{step.expectedOutputs.length ? step.expectedOutputs.map((item) => <Badge key={item}>{item}</Badge>) : <span className="text-xs text-neutral-500">No explicit output.</span>}</div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><ShieldCheck size={13} /> Required gates</div>
                <div className="flex flex-wrap gap-2">{step.gates.length ? step.gates.map((item) => <Badge key={item} tone="yellow">{item}</Badge>) : <span className="text-xs text-neutral-500">No explicit gate.</span>}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><GitBranch size={16} className="mb-2 text-cyan-400" />Plan is generated from selected compiler rule, profiles, micro-pipelines and gates.</div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><Layers size={16} className="mb-2 text-cyan-400" />Spec compliance and quality review stay separate by design.</div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><UploadCloud size={16} className="mb-2 text-cyan-400" />Memory and context handoff are explicit final steps.</div>
      </div>
    </section>
  );
}
