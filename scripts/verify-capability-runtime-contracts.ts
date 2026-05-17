import skillFixture from '../samples/capability-runtime/skill.review-doc.sample.json' assert { type: 'json' };
import agentFixture from '../samples/capability-runtime/agent.orchestrator.sample.json' assert { type: 'json' };
import subAgentFixture from '../samples/capability-runtime/subagent.verifier.sample.json' assert { type: 'json' };
import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json' assert { type: 'json' };
import runtimeNoteFixture from '../samples/capability-runtime/memory-note.runtime-philosophy.sample.json' assert { type: 'json' };
import contextNoteFixture from '../samples/capability-runtime/memory-note.context-distillation.sample.json' assert { type: 'json' };
import activeContextFixture from '../samples/capability-runtime/context.docs-review.sample.json' assert { type: 'json' };
import evaluationFixture from '../samples/capability-runtime/evaluation.docs-review.sample.json' assert { type: 'json' };
import {
  buildDryRunRuntimeLoopCycle,
  validateActiveContextBundle,
  validateAgentProfile,
  validateEvaluationObservation,
  validateMemoryNote,
  validateRuntimeLoopCycle,
  validateSkillPackage,
  validateSubAgentDelegation,
  validateToolGrant,
  type ActiveContextBundle,
  type AgentProfile,
  type EvaluationObservation,
  type MemoryNote,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from '../src/capabilityRuntimeContracts.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const skillValidation = validateSkillPackage(skillFixture);
const agentValidation = validateAgentProfile(agentFixture);
const subAgentValidation = validateSubAgentDelegation(subAgentFixture);
const toolGrantValidation = validateToolGrant(toolGrantFixture);
const runtimeNoteValidation = validateMemoryNote(runtimeNoteFixture);
const contextNoteValidation = validateMemoryNote(contextNoteFixture);
const contextValidation = validateActiveContextBundle(activeContextFixture);
const evaluationValidation = validateEvaluationObservation(evaluationFixture);

const invalidSkillValidation = validateSkillPackage({
  ...skillFixture,
  method_steps: [{ step_id: 'invalid', instruction: 'No gate/tool refs.', output_kind: 'bad' }],
});
const invalidToolGrantValidation = validateToolGrant({
  ...toolGrantFixture,
  action_class: 'unsafe_everything',
  workspace_boundary: { allowed_read_paths: ['docs/'] },
});
const invalidMemoryNoteValidation = validateMemoryNote({
  ...runtimeNoteFixture,
  confidence: 'certain',
  status: 'stale',
});
const invalidContextValidation = validateActiveContextBundle({
  ...activeContextFixture,
  selected_note_refs: [],
  excluded_refs: [{ ref: 'raw' }],
});
const invalidEvaluationValidation = validateEvaluationObservation({
  ...evaluationFixture,
  signal: 'great',
  evidence_refs: [],
});

const runtimeCycle = buildDryRunRuntimeLoopCycle({
  taskRef: 'task.docs-review-dry-run',
  skill: skillFixture as SkillPackage,
  agent: agentFixture as AgentProfile,
  subAgent: subAgentFixture as SubAgentDelegation,
  context: activeContextFixture as ActiveContextBundle,
  toolGrants: [toolGrantFixture as ToolGrant],
  observation: evaluationFixture as EvaluationObservation,
  memoryNotes: [runtimeNoteFixture as MemoryNote, contextNoteFixture as MemoryNote],
});

const runtimeCycleValidation = validateRuntimeLoopCycle(runtimeCycle);
const invalidRuntimeCycleValidation = validateRuntimeLoopCycle({
  ...runtimeCycle,
  status: 'done',
  events: [],
});

const assertions = [
  assert('skill fixture is valid', skillValidation.valid, { errors: skillValidation.errors }),
  assert('agent fixture is valid', agentValidation.valid, { errors: agentValidation.errors }),
  assert('sub-agent fixture is valid', subAgentValidation.valid, { errors: subAgentValidation.errors }),
  assert('tool grant fixture is valid', toolGrantValidation.valid, { errors: toolGrantValidation.errors }),
  assert('runtime philosophy memory note is valid', runtimeNoteValidation.valid, { errors: runtimeNoteValidation.errors }),
  assert('context distillation memory note is valid', contextNoteValidation.valid, { errors: contextNoteValidation.errors }),
  assert('active context bundle is valid', contextValidation.valid, { errors: contextValidation.errors }),
  assert('evaluation observation is valid', evaluationValidation.valid, { errors: evaluationValidation.errors }),
  assert('dry-run runtime loop cycle is valid', runtimeCycleValidation.valid, { errors: runtimeCycleValidation.errors }),
  assert('dry-run uses selected skill', runtimeCycle.selected_skill_refs.includes('skill.review-doc'), { selected_skill_refs: runtimeCycle.selected_skill_refs }),
  assert('dry-run assigns owning agent', runtimeCycle.owning_agent_ref === 'agent.orchestrator', { owning_agent_ref: runtimeCycle.owning_agent_ref }),
  assert('dry-run includes bounded sub-agent only by ref', runtimeCycle.sub_agent_refs.length === 1 && runtimeCycle.sub_agent_refs[0] === 'subagent.verifier', { sub_agent_refs: runtimeCycle.sub_agent_refs }),
  assert('dry-run uses active context notes only', runtimeCycle.active_context_ref === 'context.docs-review', { active_context_ref: runtimeCycle.active_context_ref }),
  assert('dry-run requires explicit tool grant', runtimeCycle.tool_grant_refs.includes('grant.read-doc'), { tool_grant_refs: runtimeCycle.tool_grant_refs }),
  assert('dry-run produces memory note refs', runtimeCycle.memory_note_update_refs.length === 2, { memory_note_update_refs: runtimeCycle.memory_note_update_refs }),
  assert('invalid skill method step is rejected', !invalidSkillValidation.valid, { errors: invalidSkillValidation.errors }),
  assert('invalid tool grant enum/boundary is rejected', !invalidToolGrantValidation.valid, { errors: invalidToolGrantValidation.errors }),
  assert('invalid memory note enum/stale state is rejected', !invalidMemoryNoteValidation.valid, { errors: invalidMemoryNoteValidation.errors }),
  assert('invalid active context empty notes/excluded refs are rejected', !invalidContextValidation.valid, { errors: invalidContextValidation.errors }),
  assert('invalid evaluation signal/evidence is rejected', !invalidEvaluationValidation.valid, { errors: invalidEvaluationValidation.errors }),
  assert('invalid runtime loop status/events are rejected', !invalidRuntimeCycleValidation.valid, { errors: invalidRuntimeCycleValidation.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'capability-runtime-contracts',
  status,
  assertions,
  dry_run_runtime_cycle: runtimeCycle,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Capability Runtime contract verification failed.');
  process.exit(1);
}
