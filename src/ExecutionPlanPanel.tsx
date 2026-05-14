import { Clipboard, ClipboardList, Download, FileJson, FileText, GitBranch, Layers, PlayCircle, ShieldCheck, UploadCloud } from 'lucide-react';

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

type ExportPayload = {
  kind: 'nexus.execution_plan';
  version: '0.1';
  compiler_rule: { id: string; title: string };
  macro_pipeline?: string;
  capability_packs: string[];
  micro_pipelines: string[];
  team_profiles: string[];
  gates: string[];
  memory_policy?: string;
  context_policy?: string;
  steps: PlanStep[];
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

  if (pack) {
    steps.push({
      id: '03-capability-pack-bind',
      title: `Capability Pack Bind: ${pack.pack_id}`,
      owner: architectureOwner,
      expectedOutputs: ['selected_skills', 'selected_tools', 'pack_constraints'],
      gates: pack.quality_gates?.filter((id) => gateIds.has(id)) ?? [],
      related: pack.pack_id,
      description: 'Bind the selected pack skills, tools and gates before micro-pipeline execution.',
    });
  }

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

  return steps;
}

function createPayload(selected: Rule, profiles: AgentProfile[], gates: Gate[], microPipelines: MicroPipeline[], packs: CapabilityPack[], steps: PlanStep[]): ExportPayload {
  return {
    kind: 'nexus.execution_plan',
    version: '0.1',
    compiler_rule: { id: selected.id, title: selected.title },
    macro_pipeline: selected.select?.macro_pipeline,
    capability_packs: packs.map((pack) => pack.pack_id),
    micro_pipelines: microPipelines.map((pipeline) => pipeline.id),
    team_profiles: profiles.map((profile) => profile.id),
    gates: gates.map((gate) => gate.id),
    memory_policy: selected.select?.memory_policy,
    context_policy: selected.select?.context_policy,
    steps,
  };
}

function toMarkdown(payload: ExportPayload) {
  return `# Execution Plan: ${payload.compiler_rule.title}\n\n` +
    `- Compiler rule: ${payload.compiler_rule.id}\n` +
    `- Macro pipeline: ${payload.macro_pipeline ?? 'none'}\n` +
    `- Capability packs: ${payload.capability_packs.join(', ') || 'none'}\n` +
    `- Memory policy: ${payload.memory_policy ?? 'none'}\n` +
    `- Context policy: ${payload.context_policy ?? 'none'}\n\n` +
    `## Team Profiles\n${payload.team_profiles.map((id) => `- ${id}`).join('\n')}\n\n` +
    `## Micro Pipelines\n${payload.micro_pipelines.map((id) => `- ${id}`).join('\n')}\n\n` +
    `## Required Gates\n${payload.gates.map((id) => `- ${id}`).join('\n')}\n\n` +
    `## Steps\n\n${payload.steps.map((step, index) => `### ${index + 1}. ${step.title}\n\n- Owner: ${step.owner}\n- Related: ${step.related ?? 'none'}\n- Expected outputs: ${step.expectedOutputs.join(', ') || 'none'}\n- Gates: ${step.gates.join(', ') || 'none'}\n\n${step.description}`).join('\n\n')}`;
}

function toTaskPacket(payload: ExportPayload) {
  return {
    packet_type: 'nexus.task_packet',
    version: '0.1',
    objective: payload.compiler_rule.title,
    source_compiler_rule: payload.compiler_rule.id,
    routing: {
      macro_pipeline: payload.macro_pipeline,
      micro_pipelines: payload.micro_pipelines,
      capability_packs: payload.capability_packs,
    },
    team: payload.team_profiles.map((profile) => ({ profile, role: 'owner_or_reviewer' })),
    gates: payload.gates.map((gate) => ({ gate, required: true })),
    policies: {
      memory: payload.memory_policy,
      context: payload.context_policy,
    },
    work_order: payload.steps.map((step, index) => ({
      order: index + 1,
      id: step.id,
      title: step.title,
      owner: step.owner,
      description: step.description,
      expected_outputs: step.expectedOutputs,
      required_gates: step.gates,
      related: step.related,
      status: 'not_started',
    })),
  };
}

function toNexusHandoff(payload: ExportPayload, packs: CapabilityPack[], taskPacket: unknown) {
  const pack = packs[0];
  const tools = unique([...(pack?.tools ?? []), 'runtime-bridge', 'artifact-reporter', 'gate-evidence-reporter']);
  const artifactOutputs = unique(payload.steps.flatMap((step) => step.expectedOutputs));

  return {
    packet_type: 'nexus.handoff_packet',
    version: '0.1',
    objective: payload.compiler_rule.title,
    capability_os: {
      compiler_rule: payload.compiler_rule.id,
      macro_pipeline: payload.macro_pipeline ?? 'unspecified',
      memory_policy: payload.memory_policy ?? 'unspecified',
      context_policy: payload.context_policy ?? 'unspecified',
    },
    selected_capability: {
      pack_id: payload.capability_packs[0] ?? 'unspecified',
      profiles: payload.team_profiles,
      micro_pipelines: payload.micro_pipelines,
      gates: payload.gates,
    },
    task_packet: taskPacket,
    runtime_requirements: {
      target_runtime: 'nexus-worker',
      required_tools: tools,
      artifact_outputs: artifactOutputs,
    },
    callback_contract: {
      expected_events: ['step_started', 'step_completed', 'step_blocked', 'gate_checked', 'artifact_created', 'runtime_failed'],
      required_payloads: ['step_status', 'gate_evidence', 'artifact_refs', 'blocker_reason'],
    },
  };
}

function downloadFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'cyan' | 'yellow' }) {
  const cls = tone === 'cyan' ? 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300' : tone === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200' : 'border-white/10 bg-white/5 text-neutral-300';
  return <span className={`rounded-md border px-2 py-1 text-[11px] ${cls}`}>{children}</span>;
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:border-cyan-500/30 hover:text-white">{icon}{label}</button>;
}

export default function ExecutionPlanPanel({ selected, profiles, gates, microPipelines, packs, onSendTaskPacket }: { selected?: Rule; profiles: AgentProfile[]; gates: Gate[]; microPipelines: MicroPipeline[]; packs: CapabilityPack[]; onSendTaskPacket?: (packet: unknown) => void }) {
  if (!selected) return null;
  const steps = buildPlan(selected, profiles, gates, microPipelines, packs);
  const payload = createPayload(selected, profiles, gates, microPipelines, packs, steps);
  const markdown = toMarkdown(payload);
  const json = JSON.stringify(payload, null, 2);
  const taskPacketObject = toTaskPacket(payload);
  const taskPacket = JSON.stringify(taskPacketObject, null, 2);
  const handoffPacket = JSON.stringify(toNexusHandoff(payload, packs, taskPacketObject), null, 2);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ClipboardList size={18} className="text-cyan-400" />
          Generated Execution Plan
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="cyan">{steps.length} steps</Badge>
          <ActionButton icon={<PlayCircle size={14} />} label="Send Runner" onClick={() => onSendTaskPacket?.(taskPacketObject)} />
          <ActionButton icon={<Clipboard size={14} />} label="Copy MD" onClick={() => void copyText(markdown)} />
          <ActionButton icon={<Download size={14} />} label="Download MD" onClick={() => downloadFile('nexus-execution-plan.md', markdown, 'text/markdown')} />
          <ActionButton icon={<FileJson size={14} />} label="Plan JSON" onClick={() => downloadFile('nexus-execution-plan.json', json, 'application/json')} />
          <ActionButton icon={<UploadCloud size={14} />} label="Task Packet" onClick={() => downloadFile('nexus-task-packet.json', taskPacket, 'application/json')} />
          <ActionButton icon={<UploadCloud size={14} />} label="Handoff" onClick={() => downloadFile('nexus-handoff-packet.json', handoffPacket, 'application/json')} />
        </div>
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
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-400"><UploadCloud size={16} className="mb-2 text-cyan-400" />Task packet and Nexus handoff packet are both exportable.</div>
      </div>
    </section>
  );
}
