import { Brain, Database, FileJson, FileText, ShieldAlert, Wrench } from 'lucide-react';
import { buildNextActionSuggestion, buildSkillDirectives, buildSkillRuntimeFlags, getPacketSkillIds, skillCoverageWarnings } from './skillRuntime.ts';

type WorkStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
type GateStatus = 'not_checked' | 'pass' | 'fail';

type WorkOrderStep = {
  order: number;
  id: string;
  title: string;
  owner: string;
  description: string;
  expected_outputs?: string[];
  required_gates?: string[];
  related?: string;
  status?: WorkStatus;
};

type TaskPacket = {
  packet_type: string;
  version: string;
  objective: string;
  source_compiler_rule?: string;
  routing?: {
    macro_pipeline?: string;
    micro_pipelines?: string[];
    capability_packs?: string[];
    skills?: string[];
  };
  skills?: Array<{ skill: string; required?: boolean }>;
  policies?: {
    memory?: string;
    context?: string;
  };
  work_order: WorkOrderStep[];
};

type GateEvidence = {
  status: GateStatus;
  evidence_note: string;
  blocker_reason: string;
};

type EvidenceState = Record<string, Record<string, GateEvidence>>;

type ReviewFinding = {
  type: 'failed_gate' | 'missing_evidence' | 'blocked_step' | 'incomplete_step' | 'skill_coverage_gap' | 'next_action';
  step_id: string;
  step_title: string;
  gate?: string;
  message: string;
  severity?: 'blocker' | 'major' | 'minor' | 'advisory';
  source_skill?: string;
};

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

function allGateIds(packet: TaskPacket) {
  return Array.from(new Set(packet.work_order.flatMap((step) => step.required_gates ?? [])));
}

function evidenceIsStrongEnough(note: string) {
  const normalized = note.toLowerCase();
  return ['test', 'screenshot', 'log', 'artifact', 'reviewed', 'verified', 'passed', 'evidence'].some((token) => normalized.includes(token));
}

function buildReview(packet: TaskPacket, statuses: Record<string, WorkStatus>, evidence: EvidenceState) {
  const findings: ReviewFinding[] = [];
  const skills = getPacketSkillIds(packet);
  const flags = buildSkillRuntimeFlags(packet);
  const directives = buildSkillDirectives(packet);
  const coverageWarnings = skillCoverageWarnings(packet, allGateIds(packet));
  const completedSteps = packet.work_order.filter((step) => statuses[step.id] === 'done');
  const blockedSteps = packet.work_order.filter((step) => statuses[step.id] === 'blocked');
  const incompleteSteps = packet.work_order.filter((step) => statuses[step.id] !== 'done');

  for (const warning of coverageWarnings) {
    findings.push({ type: 'skill_coverage_gap', step_id: 'skill-runtime', step_title: 'Skill Runtime Coverage', message: warning, severity: flags.ultraReview ? 'blocker' : 'major', source_skill: 'skill-runtime' });
  }

  for (const step of packet.work_order) {
    const stepStatus = statuses[step.id] ?? step.status ?? 'not_started';
    if (stepStatus === 'blocked') {
      findings.push({ type: 'blocked_step', step_id: step.id, step_title: step.title, message: 'Step is blocked.', severity: 'blocker' });
      if (flags.acceleration) {
        findings.push({ type: 'next_action', step_id: step.id, step_title: step.title, message: buildNextActionSuggestion({ stepId: step.id, stepTitle: step.title, skills }), severity: 'major', source_skill: 'execution-acceleration-skill' });
      }
    }
    if (stepStatus !== 'done') {
      findings.push({ type: 'incomplete_step', step_id: step.id, step_title: step.title, message: `Step is ${stepStatus}.`, severity: stepStatus === 'not_started' ? 'major' : 'minor' });
    }
    for (const gate of step.required_gates ?? []) {
      const item = evidence[step.id]?.[gate] ?? { status: 'not_checked', evidence_note: '', blocker_reason: '' };
      const note = item.evidence_note.trim();
      if (item.status === 'fail') {
        const message = item.blocker_reason || 'Gate failed without blocker reason.';
        findings.push({ type: 'failed_gate', step_id: step.id, step_title: step.title, gate, message, severity: 'blocker' });
        if (flags.acceleration) {
          findings.push({ type: 'next_action', step_id: step.id, step_title: step.title, gate, message: buildNextActionSuggestion({ stepId: step.id, stepTitle: step.title, gate, blockerReason: item.blocker_reason, skills }), severity: 'major', source_skill: 'execution-acceleration-skill' });
        }
      }
      if (item.status === 'not_checked' || !note) {
        findings.push({ type: 'missing_evidence', step_id: step.id, step_title: step.title, gate, message: flags.qa ? 'QA skill requires direct evidence for every required gate.' : 'Gate evidence is missing or not checked.', severity: flags.qa ? 'blocker' : 'major', source_skill: flags.qa ? 'quality-assurance-skill' : undefined });
      }
      if (flags.qa && item.status === 'pass' && note && !evidenceIsStrongEnough(note)) {
        findings.push({ type: 'missing_evidence', step_id: step.id, step_title: step.title, gate, message: 'Evidence note is present but weak; add test/log/artifact/review proof.', severity: 'major', source_skill: 'quality-assurance-skill' });
      }
    }
  }

  const gateEntries = packet.work_order.flatMap((step) => (step.required_gates ?? []).map((gate) => ({ step, gate, evidence: evidence[step.id]?.[gate] })));
  const failedGates = gateEntries.filter((entry) => entry.evidence?.status === 'fail');
  const missingEvidence = gateEntries.filter((entry) => !entry.evidence || entry.evidence.status === 'not_checked' || !entry.evidence.evidence_note.trim());
  const blockerFindings = findings.filter((finding) => finding.severity === 'blocker');
  const releaseReady = failedGates.length === 0 && missingEvidence.length === 0 && incompleteSteps.length === 0 && blockerFindings.length === 0;

  const skillRuntime = {
    active_skills: skills,
    flags,
    directives,
    coverage_warnings: coverageWarnings,
  };

  return {
    objective: packet.objective,
    source_compiler_rule: packet.source_compiler_rule,
    macro_pipeline: packet.routing?.macro_pipeline,
    capability_packs: packet.routing?.capability_packs ?? [],
    micro_pipelines: packet.routing?.micro_pipelines ?? [],
    skills,
    skill_runtime: skillRuntime,
    memory_policy: packet.policies?.memory,
    context_policy: packet.policies?.context,
    completed_steps: completedSteps.length,
    total_steps: packet.work_order.length,
    blocked_steps: blockedSteps.length,
    incomplete_steps: incompleteSteps.length,
    failed_gates: failedGates.length,
    missing_evidence: missingEvidence.length,
    release_ready: releaseReady,
    recommendation: releaseReady
      ? 'Release/handoff can proceed. Store final durable decisions and compact the context.'
      : flags.ultraReview
        ? 'Do not release. Ultra review found blockers or missing coverage; resolve risk, evidence, release and trust gaps first.'
        : 'Do not release yet. Resolve failed gates, missing evidence and blocked/incomplete steps first.',
    memory_update_recommendation: releaseReady
      ? `Record final decisions, accepted constraints and lessons under ${packet.policies?.memory ?? 'the selected memory policy'}.`
      : flags.memory
        ? 'Memory skill active: record only blocker facts, superseded assumptions, do_not_store items and unresolved decisions; do not store temporary noise as durable memory.'
        : 'Record only blocker facts and unresolved decisions; avoid storing temporary noise as durable memory.',
    context_update_recommendation: flags.contextMode
      ? `Context mode active: keep active blockers, evidence summaries and next actions; explicitly drop raw logs, duplicate UI state and resolved chatter under ${packet.policies?.context ?? 'the selected context policy'}.`
      : `Keep only active blockers, evidence summaries and next-step context under ${packet.policies?.context ?? 'the selected context policy'}.`,
    findings,
    gate_evidence: evidence,
    step_statuses: statuses,
  };
}

function buildEvidenceSummaries(evidence: EvidenceState) {
  return Object.entries(evidence).flatMap(([stepId, gates]) =>
    Object.entries(gates).map(([gateId, item]) => ({
      step_id: stepId,
      gate_id: gateId,
      status: item.status,
      evidence_note: item.evidence_note,
      blocker_reason: item.blocker_reason,
    })),
  );
}

function buildMemoryPacket(report: ReturnType<typeof buildReview>, packet: TaskPacket) {
  const evidenceSummaries = buildEvidenceSummaries(report.gate_evidence);
  const blockers = report.findings.filter((finding) => finding.type === 'failed_gate' || finding.type === 'blocked_step' || finding.type === 'skill_coverage_gap');
  const completedStepTitles = packet.work_order
    .filter((step) => report.step_statuses[step.id] === 'done')
    .map((step) => ({ step_id: step.id, title: step.title, owner: step.owner }));

  return {
    packet_type: 'nexus.memory_update_packet',
    version: '0.1',
    objective: report.objective,
    source_compiler_rule: report.source_compiler_rule,
    memory_policy: report.memory_policy,
    active_skills: report.skills,
    skill_runtime: report.skill_runtime,
    release_ready: report.release_ready,
    durable_decisions: report.release_ready
      ? [`Execution review accepted for ${report.objective}.`, `Release/handoff marked ready under ${report.macro_pipeline ?? 'unknown macro pipeline'}.`]
      : [],
    accepted_constraints: [
      ...(report.capability_packs.length ? [`Capability packs: ${report.capability_packs.join(', ')}`] : []),
      ...(report.micro_pipelines.length ? [`Micro pipelines: ${report.micro_pipelines.join(', ')}`] : []),
      ...(report.skills.length ? [`Skills: ${report.skills.join(', ')}`] : []),
    ],
    lessons_learned: evidenceSummaries
      .filter((item) => item.status === 'pass' && item.evidence_note.trim())
      .map((item) => ({ gate: item.gate_id, step_id: item.step_id, note: item.evidence_note })),
    unresolved_blockers: blockers.map((finding) => ({
      type: finding.type,
      step_id: finding.step_id,
      gate: finding.gate,
      source_skill: finding.source_skill,
      severity: finding.severity,
      message: finding.message,
    })),
    deprecated_assumptions: report.release_ready ? ['Temporary runner context can be compacted after memory update.'] : report.skill_runtime.flags.memory ? ['Do not promote temporary blocker text into durable memory until resolved.'] : [],
    memory_conflict_report: report.skill_runtime.flags.memory ? {
      checked: true,
      conflicts_found: 0,
      note: 'Manual runner mock cannot search prior memory yet; conflict check placeholder must be replaced by real memory search later.',
    } : undefined,
    completed_steps: completedStepTitles,
    do_not_store: [
      'raw transient UI state',
      'temporary not_checked gate placeholders',
      'draft evidence notes with no decision value',
      ...(report.skill_runtime.flags.memory ? ['unverified memory candidates', 'sensitive raw logs without retention policy'] : []),
    ],
  };
}

function buildContextPacket(report: ReturnType<typeof buildReview>, packet: TaskPacket) {
  const evidenceSummaries = buildEvidenceSummaries(report.gate_evidence);
  const activeFindings = report.findings.filter((finding) => finding.type !== 'missing_evidence' || !report.release_ready);
  const nextIncomplete = packet.work_order
    .filter((step) => report.step_statuses[step.id] !== 'done')
    .slice(0, 5)
    .map((step) => ({ step_id: step.id, title: step.title, owner: step.owner, status: report.step_statuses[step.id] }));
  const nextActions = report.findings.filter((finding) => finding.type === 'next_action').map((finding) => finding.message);

  return {
    packet_type: 'nexus.context_update_packet',
    version: '0.1',
    active_objective: report.objective,
    source_compiler_rule: report.source_compiler_rule,
    context_policy: report.context_policy,
    active_skills: report.skills,
    skill_runtime: report.skill_runtime,
    release_ready: report.release_ready,
    current_blockers: activeFindings
      .filter((finding) => finding.type === 'failed_gate' || finding.type === 'blocked_step' || finding.type === 'skill_coverage_gap')
      .map((finding) => ({ step_id: finding.step_id, gate: finding.gate, source_skill: finding.source_skill, message: finding.message })),
    missing_evidence: activeFindings
      .filter((finding) => finding.type === 'missing_evidence')
      .map((finding) => ({ step_id: finding.step_id, gate: finding.gate, source_skill: finding.source_skill, message: finding.message })),
    evidence_summaries: evidenceSummaries
      .filter((item) => item.status !== 'not_checked' || item.evidence_note.trim() || item.blocker_reason.trim())
      .map((item) => ({ step_id: item.step_id, gate_id: item.gate_id, status: item.status, summary: item.evidence_note || item.blocker_reason })),
    next_execution_focus: report.release_ready
      ? ['Finalize handoff.', 'Write durable memory packet.', 'Start next objective with compact context.']
      : nextActions.length
        ? nextActions
        : nextIncomplete.map((step) => `Resolve ${step.step_id}: ${step.title} (${step.status}).`),
    context_conflict_report: report.skill_runtime.flags.contextMode ? {
      checked: true,
      conflicts_found: 0,
      note: 'Manual runner mock cannot search full prior context yet; conflict check placeholder must be replaced by real context search later.',
    } : undefined,
    context_boundary: {
      keep: ['active blockers', 'failed gates', 'missing evidence', 'next incomplete steps', 'release readiness decision', ...(report.skill_runtime.flags.contextMode ? ['skill directives', 'next action suggestions', 'coverage warnings'] : [])],
      drop: ['raw completed step chatter', 'duplicate UI state', 'not_checked placeholders with no evidence', ...(report.skill_runtime.flags.contextMode ? ['large raw logs after summarization', 'stale context not tied to next action'] : [])],
    },
  };
}

function toMarkdown(report: ReturnType<typeof buildReview>) {
  return `# Execution Review Report: ${report.objective}\n\n` +
    `- Source compiler rule: ${report.source_compiler_rule ?? 'none'}\n` +
    `- Macro pipeline: ${report.macro_pipeline ?? 'none'}\n` +
    `- Active skills: ${report.skills.join(', ') || 'none'}\n` +
    `- Release ready: ${report.release_ready ? 'yes' : 'no'}\n` +
    `- Completed steps: ${report.completed_steps}/${report.total_steps}\n` +
    `- Blocked steps: ${report.blocked_steps}\n` +
    `- Incomplete steps: ${report.incomplete_steps}\n` +
    `- Failed gates: ${report.failed_gates}\n` +
    `- Missing evidence: ${report.missing_evidence}\n\n` +
    `## Skill Runtime\n\n${report.skill_runtime.directives.map((directive) => `- ${directive.skill}: ${directive.effect}`).join('\n') || '- none'}\n\n` +
    `## Recommendation\n\n${report.recommendation}\n\n` +
    `## Memory Update Recommendation\n\n${report.memory_update_recommendation}\n\n` +
    `## Context Update Recommendation\n\n${report.context_update_recommendation}\n\n` +
    `## Findings\n\n${report.findings.length ? report.findings.map((finding) => `- [${finding.severity ?? 'major'} / ${finding.type}] ${finding.step_id}${finding.gate ? ` / ${finding.gate}` : ''}${finding.source_skill ? ` / ${finding.source_skill}` : ''}: ${finding.message}`).join('\n') : '- No findings.'}\n`;
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'yellow' | 'red' | 'cyan' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/20 text-red-200',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

export default function ReviewReportPanel({ packet, statuses, evidence }: { packet: TaskPacket; statuses: Record<string, WorkStatus>; evidence: EvidenceState }) {
  const report = buildReview(packet, statuses, evidence);
  const memoryPacket = buildMemoryPacket(report, packet);
  const contextPacket = buildContextPacket(report, packet);
  const json = JSON.stringify(report, null, 2);
  const markdown = toMarkdown(report);
  const memoryJson = JSON.stringify(memoryPacket, null, 2);
  const contextJson = JSON.stringify(contextPacket, null, 2);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white"><ShieldAlert size={18} className="text-cyan-400" />Execution Review Report</div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={report.release_ready ? 'green' : 'red'}>{report.release_ready ? 'release ready' : 'not ready'}</Badge>
          <button onClick={() => downloadFile('nexus-execution-review-report.md', markdown, 'text/markdown')} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><FileText size={14} />Review MD</button>
          <button onClick={() => downloadFile('nexus-execution-review-report.json', json, 'application/json')} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><FileJson size={14} />Review JSON</button>
          <button onClick={() => downloadFile('memory_update_packet.json', memoryJson, 'application/json')} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><Database size={14} />Memory Packet</button>
          <button onClick={() => downloadFile('context_update_packet.json', contextJson, 'application/json')} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"><Brain size={14} />Context Packet</button>
        </div>
      </div>

      {report.skills.length > 0 && <div className="mb-5 rounded-xl border border-yellow-500/20 bg-yellow-950/10 p-4"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-yellow-200"><Wrench size={14} />skill-aware review active</div><div className="flex flex-wrap gap-2">{report.skills.map((skill) => <Badge key={skill} tone="yellow">{skill}</Badge>)}</div></div>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.completed_steps}/{report.total_steps}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">completed</div></div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.blocked_steps}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">blocked</div></div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.incomplete_steps}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">incomplete</div></div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.failed_gates}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">failed gates</div></div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.missing_evidence}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">missing evidence</div></div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4"><div className="text-2xl text-white">{report.release_ready ? 'YES' : 'NO'}</div><div className="text-[10px] uppercase tracking-widest text-neutral-500">release</div></div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">recommendation</div>{report.recommendation}</div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">memory update</div>{report.memory_update_recommendation}</div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-neutral-300"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">context update</div>{report.context_update_recommendation}</div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><Database size={14} />memory packet preview</div><div className="flex flex-wrap gap-2"><Badge tone="cyan">{memoryPacket.durable_decisions.length} decisions</Badge><Badge tone="yellow">{memoryPacket.unresolved_blockers.length} blockers</Badge><Badge>{memoryPacket.lessons_learned.length} lessons</Badge></div></div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><Brain size={14} />context packet preview</div><div className="flex flex-wrap gap-2"><Badge tone="yellow">{contextPacket.current_blockers.length} blockers</Badge><Badge tone="cyan">{contextPacket.evidence_summaries.length} evidence summaries</Badge><Badge>{contextPacket.next_execution_focus.length} next focus</Badge></div></div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">findings</div>
        <div className="space-y-2">
          {report.findings.length ? report.findings.slice(0, 40).map((finding, index) => (
            <div key={`${finding.type}:${finding.step_id}:${finding.gate ?? ''}:${index}`} className="rounded-lg border border-white/10 bg-[#050505] p-3 text-sm text-neutral-300">
              <div className="mb-1 flex flex-wrap gap-2"><Badge tone={finding.severity === 'blocker' ? 'red' : finding.severity === 'major' ? 'yellow' : 'neutral'}>{finding.severity ?? 'major'}</Badge><Badge>{finding.type}</Badge><Badge>{finding.step_id}</Badge>{finding.gate && <Badge tone="cyan">{finding.gate}</Badge>}{finding.source_skill && <Badge tone="yellow">{finding.source_skill}</Badge>}</div>
              {finding.message}
            </div>
          )) : <div className="text-sm text-emerald-300">No findings. Evidence and step completion are clean.</div>}
        </div>
      </div>
    </section>
  );
}
