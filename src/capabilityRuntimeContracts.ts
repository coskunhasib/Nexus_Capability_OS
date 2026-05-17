export type RuntimeSignal = 'positive' | 'negative' | 'neutral' | 'unknown';
export type RuntimeConfidence = 'low' | 'medium' | 'high';
export type RuntimeStatus = 'pass' | 'partial' | 'fail';
export type ToolActionClass = 'read_only' | 'write_artifact' | 'write_workspace' | 'network_read' | 'network_write' | 'runtime_control' | 'system_sensitive';
export type MemoryNoteStatus = 'active' | 'stale' | 'retired';
export type MemoryNoteType = 'decision' | 'preference' | 'lesson' | 'failure' | 'pattern' | 'constraint' | 'open_question' | 'artifact_summary';

export type SkillPackage = {
  packet_type: 'nexus.skill_package';
  version: '0.1';
  skill_id: string;
  name: string;
  purpose: string;
  when_to_use: string[];
  when_not_to_use: string[];
  required_inputs: string[];
  method_steps: Array<{
    step_id: string;
    instruction: string;
    output_kind: string;
    required_tool_refs?: string[];
    required_gate_refs?: string[];
  }>;
  required_tools: string[];
  optional_tools: string[];
  agent_profile_hints: string[];
  sub_agent_hints: string[];
  quality_gates: string[];
  risk_notes: string[];
  expected_outputs: string[];
  observation_metrics: string[];
};

export type ToolGrant = {
  packet_type: 'nexus.tool_grant';
  version: '0.1';
  grant_id: string;
  tool_id: string;
  action_class: ToolActionClass;
  allowed_actions: string[];
  scope: string;
  workspace_boundary: {
    allowed_read_paths: string[];
    allowed_write_paths: string[];
    blocked_paths: string[];
    artifact_output_root: string;
  };
  approval_required: boolean;
  approved_by?: string;
  expires_after: string;
  source_skill_ref?: string;
  owning_agent_ref: string;
  sub_agent_ref?: string;
  audit_level: 'summary' | 'full';
};

export type AgentProfile = {
  packet_type: 'nexus.agent_profile';
  version: '0.1';
  agent_id: string;
  profile: string;
  role: string;
  owned_scope: string;
  responsibilities: string[];
  allowed_skill_refs: string[];
  default_tool_policy: string;
  memory_access_policy: string;
  context_access_policy: string;
  evaluation_responsibility: string;
};

export type SubAgentDelegation = {
  packet_type: 'nexus.sub_agent_delegation';
  version: '0.1';
  sub_agent_id: string;
  parent_agent_id: string;
  scope: string;
  allowed_tools: string[];
  active_context_ref: string;
  expected_output: string;
  handoff_format: string;
  expires_after: string;
};

export type MemoryNote = {
  packet_type: 'nexus.memory_note';
  version: '0.1';
  note_id: string;
  topic: string;
  note_type: MemoryNoteType;
  summary: string;
  source_refs: string[];
  confidence: RuntimeConfidence;
  status: MemoryNoteStatus;
  created_at: string;
  last_updated: string;
  stale_reason?: string;
  replaces?: string[];
  related_notes?: string[];
};

export type ActiveContextBundle = {
  packet_type: 'nexus.active_context_bundle';
  version: '0.1';
  context_id: string;
  task_ref: string;
  selected_note_refs: string[];
  current_constraints: string[];
  open_questions: string[];
  excluded_refs: Array<{ ref: string; reason: string }>;
};

export type EvaluationObservation = {
  packet_type: 'nexus.evaluation_observation';
  version: '0.1';
  observation_id: string;
  run_ref: string;
  subject_type: 'skill' | 'tool' | 'agent' | 'sub_agent' | 'context' | 'memory_note' | 'artifact' | 'gate';
  subject_ref: string;
  signal: RuntimeSignal;
  summary: string;
  evidence_refs: string[];
  confidence: RuntimeConfidence;
  recommended_action?: string;
};

export type RuntimeLoopCycle = {
  packet_type: 'nexus.runtime_loop_cycle';
  version: '0.1';
  cycle_id: string;
  task_ref: string;
  selected_skill_refs: string[];
  owning_agent_ref: string;
  sub_agent_refs: string[];
  active_context_ref: string;
  tool_grant_refs: string[];
  events: Array<{ event_type: string; summary: string }>;
  artifact_refs: Array<{ kind: string; ref: string; summary: string }>;
  evaluation_ref: string;
  memory_note_update_refs: string[];
  status: RuntimeStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function requiredString(value: Record<string, unknown>, key: string, errors: string[]) {
  if (typeof value[key] !== 'string' || !(value[key] as string).trim()) errors.push(`${key} must be a non-empty string`);
}

function requiredStringArray(value: Record<string, unknown>, key: string, errors: string[]) {
  if (!isStringArray(value[key])) errors.push(`${key} must be a string array`);
}

export type ContractValidation = { valid: boolean; errors: string[] };

export function validateSkillPackage(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['skill package must be an object'] };
  if (value.packet_type !== 'nexus.skill_package') errors.push('packet_type must be nexus.skill_package');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['skill_id', 'name', 'purpose'].forEach((key) => requiredString(value, key, errors));
  ['when_to_use', 'when_not_to_use', 'required_inputs', 'required_tools', 'optional_tools', 'agent_profile_hints', 'sub_agent_hints', 'quality_gates', 'risk_notes', 'expected_outputs', 'observation_metrics'].forEach((key) => requiredStringArray(value, key, errors));
  if (!Array.isArray(value.method_steps) || value.method_steps.length === 0) errors.push('method_steps must be a non-empty array');
  return { valid: errors.length === 0, errors };
}

export function validateToolGrant(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['tool grant must be an object'] };
  if (value.packet_type !== 'nexus.tool_grant') errors.push('packet_type must be nexus.tool_grant');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['grant_id', 'tool_id', 'action_class', 'scope', 'expires_after', 'owning_agent_ref', 'audit_level'].forEach((key) => requiredString(value, key, errors));
  requiredStringArray(value, 'allowed_actions', errors);
  if (typeof value.approval_required !== 'boolean') errors.push('approval_required must be boolean');
  if (!isRecord(value.workspace_boundary)) errors.push('workspace_boundary must be object');
  return { valid: errors.length === 0, errors };
}

export function validateAgentProfile(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['agent profile must be an object'] };
  if (value.packet_type !== 'nexus.agent_profile') errors.push('packet_type must be nexus.agent_profile');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['agent_id', 'profile', 'role', 'owned_scope', 'default_tool_policy', 'memory_access_policy', 'context_access_policy', 'evaluation_responsibility'].forEach((key) => requiredString(value, key, errors));
  ['responsibilities', 'allowed_skill_refs'].forEach((key) => requiredStringArray(value, key, errors));
  return { valid: errors.length === 0, errors };
}

export function validateSubAgentDelegation(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['sub-agent delegation must be an object'] };
  if (value.packet_type !== 'nexus.sub_agent_delegation') errors.push('packet_type must be nexus.sub_agent_delegation');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['sub_agent_id', 'parent_agent_id', 'scope', 'active_context_ref', 'expected_output', 'handoff_format', 'expires_after'].forEach((key) => requiredString(value, key, errors));
  requiredStringArray(value, 'allowed_tools', errors);
  return { valid: errors.length === 0, errors };
}

export function validateMemoryNote(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['memory note must be an object'] };
  if (value.packet_type !== 'nexus.memory_note') errors.push('packet_type must be nexus.memory_note');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['note_id', 'topic', 'note_type', 'summary', 'confidence', 'status', 'created_at', 'last_updated'].forEach((key) => requiredString(value, key, errors));
  requiredStringArray(value, 'source_refs', errors);
  return { valid: errors.length === 0, errors };
}

export function validateActiveContextBundle(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['active context bundle must be an object'] };
  if (value.packet_type !== 'nexus.active_context_bundle') errors.push('packet_type must be nexus.active_context_bundle');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['context_id', 'task_ref'].forEach((key) => requiredString(value, key, errors));
  ['selected_note_refs', 'current_constraints', 'open_questions'].forEach((key) => requiredStringArray(value, key, errors));
  if (!Array.isArray(value.excluded_refs)) errors.push('excluded_refs must be an array');
  return { valid: errors.length === 0, errors };
}

export function validateEvaluationObservation(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['evaluation observation must be an object'] };
  if (value.packet_type !== 'nexus.evaluation_observation') errors.push('packet_type must be nexus.evaluation_observation');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['observation_id', 'run_ref', 'subject_type', 'subject_ref', 'signal', 'summary', 'confidence'].forEach((key) => requiredString(value, key, errors));
  requiredStringArray(value, 'evidence_refs', errors);
  return { valid: errors.length === 0, errors };
}

export function validateRuntimeLoopCycle(value: unknown): ContractValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['runtime loop cycle must be an object'] };
  if (value.packet_type !== 'nexus.runtime_loop_cycle') errors.push('packet_type must be nexus.runtime_loop_cycle');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['cycle_id', 'task_ref', 'owning_agent_ref', 'active_context_ref', 'evaluation_ref', 'status'].forEach((key) => requiredString(value, key, errors));
  ['selected_skill_refs', 'sub_agent_refs', 'tool_grant_refs', 'memory_note_update_refs'].forEach((key) => requiredStringArray(value, key, errors));
  if (!Array.isArray(value.events)) errors.push('events must be an array');
  if (!Array.isArray(value.artifact_refs)) errors.push('artifact_refs must be an array');
  return { valid: errors.length === 0, errors };
}

export function buildDryRunRuntimeLoopCycle(input: {
  taskRef: string;
  skill: SkillPackage;
  agent: AgentProfile;
  subAgent?: SubAgentDelegation;
  context: ActiveContextBundle;
  toolGrants: ToolGrant[];
  observation: EvaluationObservation;
  memoryNotes: MemoryNote[];
}): RuntimeLoopCycle {
  return {
    packet_type: 'nexus.runtime_loop_cycle',
    version: '0.1',
    cycle_id: `cycle-${input.taskRef}`,
    task_ref: input.taskRef,
    selected_skill_refs: [input.skill.skill_id],
    owning_agent_ref: input.agent.agent_id,
    sub_agent_refs: input.subAgent ? [input.subAgent.sub_agent_id] : [],
    active_context_ref: input.context.context_id,
    tool_grant_refs: input.toolGrants.map((grant) => grant.grant_id),
    events: [
      { event_type: 'skill_selected', summary: `${input.skill.skill_id} selected for ${input.taskRef}.` },
      { event_type: 'agent_assigned', summary: `${input.agent.agent_id} owns the runtime cycle.` },
      { event_type: 'context_built', summary: `${input.context.selected_note_refs.length} distilled notes selected.` },
      { event_type: 'evaluation_recorded', summary: input.observation.summary },
    ],
    artifact_refs: [
      { kind: 'runtime_summary', ref: `artifact://${input.taskRef}/runtime-summary`, summary: 'Dry-run runtime summary artifact.' },
    ],
    evaluation_ref: input.observation.observation_id,
    memory_note_update_refs: input.memoryNotes.map((note) => note.note_id),
    status: input.observation.signal === 'negative' ? 'partial' : 'pass',
  };
}
