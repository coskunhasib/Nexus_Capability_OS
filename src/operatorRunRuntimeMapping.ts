import {
  buildDryRunRuntimeLoopCycle,
  validateMemoryNote,
  type ActiveContextBundle,
  type AgentProfile,
  type ContractValidation,
  type EvaluationObservation,
  type MemoryNote,
  type RuntimeLoopCycle,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from './capabilityRuntimeContracts.ts';

export type OperatorRunResultStatus = 'completed' | 'blocked';

export type OperatorRunArtifact = {
  step_id: string;
  kind: string;
  ref: string;
  summary: string;
};

export type OperatorRunResultFile = {
  packet_type: 'nexus.operator_run_result';
  version: '0.1';
  result_id: string;
  task_ref: string;
  source: 'operator-run';
  status: OperatorRunResultStatus;
  artifacts: OperatorRunArtifact[];
  notes: string[];
  diagnostics?: string[];
  created_at: string;
};

export type OperatorRunRuntimeMappingInput = {
  resultFile: OperatorRunResultFile;
  skill: SkillPackage;
  agent: AgentProfile;
  subAgent?: SubAgentDelegation;
  context: ActiveContextBundle;
  toolGrants: ToolGrant[];
  existingMemoryNotes: MemoryNote[];
};

export type OperatorRunRuntimeMappingResult = {
  observation: EvaluationObservation;
  memory_note_candidates: MemoryNote[];
  runtime_cycle: RuntimeLoopCycle;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOperatorRunArtifact(value: unknown): value is OperatorRunArtifact {
  return isRecord(value)
    && typeof value.step_id === 'string'
    && typeof value.kind === 'string'
    && typeof value.ref === 'string'
    && typeof value.summary === 'string'
    && Boolean(value.step_id.trim())
    && Boolean(value.kind.trim())
    && Boolean(value.ref.trim())
    && Boolean(value.summary.trim());
}

export function validateOperatorRunResultFile(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['operator-run result must be an object'] };
  if (value.packet_type !== 'nexus.operator_run_result') errors.push('packet_type must be nexus.operator_run_result');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['result_id', 'task_ref', 'source', 'status', 'created_at'].forEach((key) => {
    if (typeof value[key] !== 'string' || !(value[key] as string).trim()) errors.push(`${key} must be a non-empty string`);
  });
  if (value.source !== 'operator-run') errors.push('source must be operator-run');
  if (value.status !== 'completed' && value.status !== 'blocked') errors.push('status must be completed or blocked');
  if (!Array.isArray(value.artifacts) || !value.artifacts.every(isOperatorRunArtifact)) errors.push('artifacts must be an array of operator-run artifacts');
  if (value.status === 'completed' && Array.isArray(value.artifacts) && value.artifacts.length === 0) errors.push('completed operator-run results must include at least one artifact');
  if (!isStringArray(value.notes)) errors.push('notes must be a string array');
  if (Array.isArray(value.notes) && value.notes.length === 0) errors.push('notes must not be empty');
  if (value.diagnostics !== undefined && !isStringArray(value.diagnostics)) errors.push('diagnostics must be a string array when provided');
  return { valid: errors.length === 0, errors };
}

function buildOperatorMemoryNote(resultFile: OperatorRunResultFile): MemoryNote {
  const artifactSummary = resultFile.artifacts.length > 0
    ? `Artifacts: ${resultFile.artifacts.map((artifact) => `${artifact.kind}:${artifact.ref}`).join(', ')}.`
    : 'No artifacts were produced.';
  const diagnosticSummary = resultFile.diagnostics && resultFile.diagnostics.length > 0
    ? `Diagnostics: ${resultFile.diagnostics.join('; ')}.`
    : '';

  return {
    packet_type: 'nexus.memory_note',
    version: '0.1',
    note_id: `note.operator-result.${resultFile.result_id}`,
    topic: `Operator-run result ${resultFile.result_id}`,
    note_type: resultFile.status === 'completed' ? 'artifact_summary' : 'failure',
    summary: `${resultFile.status === 'completed' ? 'Operator-run completed.' : 'Operator-run was blocked.'} ${resultFile.notes.join(' ')} ${artifactSummary} ${diagnosticSummary}`.trim(),
    source_refs: [resultFile.result_id, ...resultFile.artifacts.map((artifact) => artifact.ref)],
    confidence: resultFile.status === 'completed' ? 'high' : 'medium',
    status: 'active',
    created_at: resultFile.created_at,
    last_updated: resultFile.created_at,
  };
}

export function mapOperatorRunResultToRuntimeLoop(
  input: OperatorRunRuntimeMappingInput,
): OperatorRunRuntimeMappingResult {
  const validation = validateOperatorRunResultFile(input.resultFile);
  if (!validation.valid) {
    throw new Error(`Invalid operator-run result file: ${validation.errors.join('; ')}`);
  }

  const resultFile = input.resultFile;
  const signal = resultFile.status === 'completed' ? 'positive' : 'negative';
  const observation: EvaluationObservation = {
    packet_type: 'nexus.evaluation_observation',
    version: '0.1',
    observation_id: `obs.operator-result.${resultFile.result_id}`,
    run_ref: resultFile.task_ref,
    subject_type: resultFile.status === 'completed' ? 'artifact' : 'gate',
    subject_ref: resultFile.result_id,
    signal,
    summary: resultFile.status === 'completed'
      ? `Operator-run result completed with ${resultFile.artifacts.length} artifact(s).`
      : `Operator-run result blocked: ${[...resultFile.notes, ...(resultFile.diagnostics ?? [])].join(' ')}`,
    evidence_refs: [
      resultFile.result_id,
      ...resultFile.artifacts.map((artifact) => artifact.ref),
      ...(resultFile.diagnostics ?? []).map((diagnostic) => `diagnostic:${diagnostic}`),
    ],
    confidence: resultFile.status === 'completed' ? 'high' : 'medium',
    recommended_action: resultFile.status === 'completed'
      ? 'Allow operator-run result to feed the local runtime loop after review.'
      : 'Keep result blocked and preserve diagnostic note candidate for follow-up.',
  };

  const memoryNoteCandidate = buildOperatorMemoryNote(resultFile);
  const memoryValidation = validateMemoryNote(memoryNoteCandidate);
  if (!memoryValidation.valid) {
    throw new Error(`Invalid operator-run memory note candidate: ${memoryValidation.errors.join('; ')}`);
  }

  const runtime_cycle = buildDryRunRuntimeLoopCycle({
    taskRef: resultFile.task_ref,
    skill: input.skill,
    agent: input.agent,
    subAgent: input.subAgent,
    context: input.context,
    toolGrants: input.toolGrants,
    observation,
    memoryNotes: [...input.existingMemoryNotes, memoryNoteCandidate],
  });

  return {
    observation,
    memory_note_candidates: [memoryNoteCandidate],
    runtime_cycle: {
      ...runtime_cycle,
      cycle_id: `cycle.operator-run.${resultFile.task_ref}`,
      status: resultFile.status === 'completed' ? 'pass' : 'partial',
      events: [
        ...runtime_cycle.events,
        {
          event_type: `operator_result.${resultFile.status}`,
          summary: resultFile.status === 'completed'
            ? `Operator-run result ${resultFile.result_id} completed.`
            : `Operator-run result ${resultFile.result_id} blocked.`,
        },
        ...resultFile.artifacts.map((artifact) => ({
          event_type: 'operator_result.artifact',
          summary: `${artifact.kind} from ${artifact.step_id}: ${artifact.summary}`,
        })),
      ],
      artifact_refs: [
        ...runtime_cycle.artifact_refs,
        ...resultFile.artifacts.map((artifact) => ({
          kind: artifact.kind,
          ref: artifact.ref,
          summary: artifact.summary,
        })),
      ],
    },
  };
}
