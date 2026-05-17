import decision from '../samples/nexus-host-integration/review-decision-packet.sample.json' assert { type: 'json' };
import machine from '../samples/nexus-host-integration/review-state-machine.sample.json' assert { type: 'json' };
import log from '../samples/nexus-host-integration/operator-action-log.sample.json' assert { type: 'json' };
import disposition from '../samples/nexus-host-integration/review-artifact-disposition.sample.json' assert { type: 'json' };

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(hasText);
}

function includesAll(value: unknown, required: string[]) {
  return isStringArray(value) && required.every((item) => value.includes(item));
}

function validateDecision(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['decision must be object'];
  if (value.packet_type !== 'nexus.review_decision_packet') errors.push('decision packet_type invalid');
  ['decision_id', 'run_ref', 'result_ref', 'decision', 'reason', 'operator_ref', 'recorded_at'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} invalid`);
  });
  if (!['accept_candidate', 'reject_candidate', 'request_changes', 'use_fallback'].includes(String(value.decision))) errors.push('decision invalid');
  ['source_refs', 'artifact_refs', 'trace_refs'].forEach((key) => {
    if (!isStringArray(value[key]) || value[key].length === 0) errors.push(`${key} invalid`);
  });
  if (value.candidate_state_changes_only_by_packet !== true) errors.push('candidate state rule invalid');
  return errors;
}

function validateMachine(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['machine must be object'];
  if (value.packet_type !== 'nexus.review_state_machine') errors.push('machine packet_type invalid');
  if (!includesAll(value.states, ['review_queued', 'reviewing', 'changes_requested', 'fallback_selected', 'candidate_rejected', 'candidate_accepted', 'closed'])) errors.push('states incomplete');
  if (!includesAll(value.terminal_states, ['closed'])) errors.push('terminal state missing');
  if (!includesAll(value.decision_required_states, ['changes_requested', 'fallback_selected', 'candidate_rejected', 'candidate_accepted'])) errors.push('decision states incomplete');
  if (value.manual_review_required !== true) errors.push('manual review required');
  return errors;
}

function validateLog(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['log must be object'];
  if (value.packet_type !== 'nexus.operator_action_log') errors.push('log packet_type invalid');
  if (!hasText(value.log_ref)) errors.push('log_ref invalid');
  if (!Array.isArray(value.actions) || value.actions.length === 0) errors.push('actions invalid');
  if (Array.isArray(value.actions)) {
    value.actions.forEach((action, index) => {
      if (!isRecord(action)) {
        errors.push(`action ${index} invalid`);
        return;
      }
      ['action_id', 'operator_ref', 'action_type', 'run_ref', 'result_ref', 'decision_ref', 'recorded_at'].forEach((key) => {
        if (!hasText(action[key])) errors.push(`action ${index} ${key} invalid`);
      });
      if (!isStringArray(action.source_refs) || action.source_refs.length === 0) errors.push(`action ${index} source_refs invalid`);
      if (!isStringArray(action.trace_refs) || action.trace_refs.length === 0) errors.push(`action ${index} trace_refs invalid`);
    });
  }
  if (value.append_only !== true) errors.push('append_only required');
  return errors;
}

function validateDisposition(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['disposition must be object'];
  if (value.packet_type !== 'nexus.review_artifact_disposition') errors.push('disposition packet_type invalid');
  ['disposition_id', 'artifact_ref', 'run_ref', 'result_ref', 'decision_ref', 'disposition', 'reason'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} invalid`);
  });
  if (!['keep_candidate', 'request_revision', 'use_fallback_result', 'accept_after_review', 'reject_candidate'].includes(String(value.disposition))) errors.push('disposition invalid');
  if (!isStringArray(value.source_refs) || value.source_refs.length === 0) errors.push('source_refs invalid');
  if (!isStringArray(value.trace_refs) || value.trace_refs.length === 0) errors.push('trace_refs invalid');
  if (value.candidate_status_preserved !== true) errors.push('candidate status rule invalid');
  return errors;
}

function check(name: string, errors: string[]): Check {
  return { name, pass: errors.length === 0, details: { errors } };
}

const assertions = [
  check('review decision validates', validateDecision(decision)),
  check('review state machine validates', validateMachine(machine)),
  check('operator action log validates', validateLog(log)),
  check('artifact disposition validates', validateDisposition(disposition)),
  check('decision without reason fails', validateDecision({ ...decision, reason: '' }).length > 0 ? [] : ['mutation did not fail']),
  check('machine without closed state fails', validateMachine({ ...machine, terminal_states: [] }).length > 0 ? [] : ['mutation did not fail']),
  check('log not append only fails', validateLog({ ...log, append_only: false }).length > 0 ? [] : ['mutation did not fail']),
  check('disposition without candidate rule fails', validateDisposition({ ...disposition, candidate_status_preserved: false }).length > 0 ? [] : ['mutation did not fail']),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'review-layer', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
