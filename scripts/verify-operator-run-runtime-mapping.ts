import completedFixture from '../samples/operator-run-results/nexus-completed.sample.json' assert { type: 'json' };
import blockedFixture from '../samples/operator-run-results/nexus-blocked.sample.json' assert { type: 'json' };
import skillFixture from '../samples/capability-runtime/skill.review-doc.sample.json' assert { type: 'json' };
import agentFixture from '../samples/capability-runtime/agent.orchestrator.sample.json' assert { type: 'json' };
import subAgentFixture from '../samples/capability-runtime/subagent.verifier.sample.json' assert { type: 'json' };
import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json' assert { type: 'json' };
import runtimeNoteFixture from '../samples/capability-runtime/memory-note.runtime-philosophy.sample.json' assert { type: 'json' };
import contextNoteFixture from '../samples/capability-runtime/memory-note.context-distillation.sample.json' assert { type: 'json' };
import activeContextFixture from '../samples/capability-runtime/context.docs-review.sample.json' assert { type: 'json' };
import {
  validateEvaluationObservation,
  validateMemoryNote,
  validateRuntimeLoopCycle,
  type ActiveContextBundle,
  type AgentProfile,
  type MemoryNote,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from '../src/capabilityRuntimeContracts.ts';
import {
  mapOperatorRunResultToRuntimeLoop,
  validateOperatorRunResultFile,
  type OperatorRunResultFile,
} from '../src/operatorRunRuntimeMapping.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const common = {
  skill: skillFixture as SkillPackage,
  agent: agentFixture as AgentProfile,
  subAgent: subAgentFixture as SubAgentDelegation,
  context: activeContextFixture as ActiveContextBundle,
  toolGrants: [toolGrantFixture as ToolGrant],
  existingMemoryNotes: [runtimeNoteFixture as MemoryNote, contextNoteFixture as MemoryNote],
};

const completedValidation = validateOperatorRunResultFile(completedFixture);
const blockedValidation = validateOperatorRunResultFile(blockedFixture);
const invalidValidation = validateOperatorRunResultFile({
  ...completedFixture,
  status: 'completed',
  artifacts: [],
});

const completedMapping = mapOperatorRunResultToRuntimeLoop({
  ...common,
  resultFile: completedFixture as OperatorRunResultFile,
});
const blockedMapping = mapOperatorRunResultToRuntimeLoop({
  ...common,
  resultFile: blockedFixture as OperatorRunResultFile,
});

const completedObservationValidation = validateEvaluationObservation(completedMapping.observation);
const blockedObservationValidation = validateEvaluationObservation(blockedMapping.observation);
const completedCycleValidation = validateRuntimeLoopCycle(completedMapping.runtime_cycle);
const blockedCycleValidation = validateRuntimeLoopCycle(blockedMapping.runtime_cycle);
const completedNoteValidation = validateMemoryNote(completedMapping.memory_note_candidates[0]);
const blockedNoteValidation = validateMemoryNote(blockedMapping.memory_note_candidates[0]);

let invalidRejected = false;
try {
  mapOperatorRunResultToRuntimeLoop({
    ...common,
    resultFile: { ...completedFixture, status: 'completed', artifacts: [] } as OperatorRunResultFile,
  });
} catch {
  invalidRejected = true;
}

const assertions = [
  assert('completed operator-run fixture is valid', completedValidation.valid, { errors: completedValidation.errors }),
  assert('blocked operator-run fixture is valid', blockedValidation.valid, { errors: blockedValidation.errors }),
  assert('invalid completed operator-run fixture is rejected', !invalidValidation.valid, { errors: invalidValidation.errors }),
  assert('completed observation is valid', completedObservationValidation.valid, { errors: completedObservationValidation.errors }),
  assert('blocked observation is valid', blockedObservationValidation.valid, { errors: blockedObservationValidation.errors }),
  assert('completed observation is positive', completedMapping.observation.signal === 'positive', { signal: completedMapping.observation.signal }),
  assert('blocked observation is negative', blockedMapping.observation.signal === 'negative', { signal: blockedMapping.observation.signal }),
  assert('completed runtime cycle is valid', completedCycleValidation.valid, { errors: completedCycleValidation.errors }),
  assert('blocked runtime cycle is valid', blockedCycleValidation.valid, { errors: blockedCycleValidation.errors }),
  assert('completed runtime cycle passes', completedMapping.runtime_cycle.status === 'pass', { status: completedMapping.runtime_cycle.status }),
  assert('blocked runtime cycle is partial', blockedMapping.runtime_cycle.status === 'partial', { status: blockedMapping.runtime_cycle.status }),
  assert('completed artifacts are mapped into runtime cycle', completedMapping.runtime_cycle.artifact_refs.some((artifact) => artifact.kind === 'operator_summary'), { artifacts: completedMapping.runtime_cycle.artifact_refs }),
  assert('completed operator event is mapped into runtime cycle', completedMapping.runtime_cycle.events.some((event) => event.event_type === 'operator_result.completed'), { events: completedMapping.runtime_cycle.events }),
  assert('blocked operator event is mapped into runtime cycle', blockedMapping.runtime_cycle.events.some((event) => event.event_type === 'operator_result.blocked'), { events: blockedMapping.runtime_cycle.events }),
  assert('completed memory note candidate is valid', completedNoteValidation.valid, { errors: completedNoteValidation.errors }),
  assert('blocked memory note candidate is valid', blockedNoteValidation.valid, { errors: blockedNoteValidation.errors }),
  assert('invalid mapping fails closed', invalidRejected),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'operator-run-runtime-mapping',
  status,
  assertions,
  completed_summary: {
    observation_signal: completedMapping.observation.signal,
    runtime_status: completedMapping.runtime_cycle.status,
    artifact_ref_count: completedMapping.runtime_cycle.artifact_refs.length,
    memory_note_candidate_count: completedMapping.memory_note_candidates.length,
  },
  blocked_summary: {
    observation_signal: blockedMapping.observation.signal,
    runtime_status: blockedMapping.runtime_cycle.status,
    artifact_ref_count: blockedMapping.runtime_cycle.artifact_refs.length,
    memory_note_candidate_count: blockedMapping.memory_note_candidates.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Operator-run runtime mapping verification failed.');
  process.exit(1);
}
