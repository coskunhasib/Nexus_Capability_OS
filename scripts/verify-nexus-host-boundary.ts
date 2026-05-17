import hostRequestFixture from '../samples/nexus-host-integration/host-request.sample.json' assert { type: 'json' };
import runtimeResponseFixture from '../samples/nexus-host-integration/runtime-response.sample.json' assert { type: 'json' };

type BoundaryValidation = { valid: boolean; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasText(value: unknown) {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => hasText(item));
}

function objectArray(value: unknown) {
  return Array.isArray(value) && value.every(isRecord);
}

function validateHostRequest(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['host request must be object'] };
  if (value.packet_type !== 'nexus.host_runtime_request') errors.push('packet_type must be nexus.host_runtime_request');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['request_id', 'host_ref', 'task_ref', 'runtime_mode', 'objective', 'owning_agent_ref', 'active_context_ref', 'artifact_output_root'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be non-empty string`);
  });
  ['selected_skill_refs', 'sub_agent_refs', 'tool_grant_refs', 'decision_gate_refs', 'requested_outputs', 'source_refs'].forEach((key) => {
    if (!isStringArray(value[key])) errors.push(`${key} must be string array`);
  });
  if (Array.isArray(value.selected_skill_refs) && value.selected_skill_refs.length === 0) errors.push('selected_skill_refs must not be empty');
  if (Array.isArray(value.tool_grant_refs) && value.tool_grant_refs.length === 0) errors.push('tool_grant_refs must not be empty');
  if (Array.isArray(value.source_refs) && value.source_refs.length === 0) errors.push('source_refs must not be empty');
  return { valid: errors.length === 0, errors };
}

function validateRuntimeResponse(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['runtime response must be object'] };
  if (value.packet_type !== 'nexus.host_runtime_response') errors.push('packet_type must be nexus.host_runtime_response');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['response_id', 'request_ref', 'status', 'runtime_cycle_ref'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be non-empty string`);
  });
  if (!['pass', 'partial', 'blocked'].includes(String(value.status))) errors.push('status must be pass, partial or blocked');
  ['evaluation_refs', 'memory_note_candidate_refs', 'source_refs'].forEach((key) => {
    if (!isStringArray(value[key])) errors.push(`${key} must be string array`);
  });
  if (!objectArray(value.artifact_refs)) errors.push('artifact_refs must be object array');
  if (!objectArray(value.events)) errors.push('events must be object array');
  if (Array.isArray(value.artifact_refs)) {
    value.artifact_refs.forEach((artifact, index) => {
      if (!isRecord(artifact)) return;
      ['kind', 'ref', 'summary'].forEach((key) => {
        if (!hasText(artifact[key])) errors.push(`artifact_refs[${index}].${key} must be non-empty string`);
      });
    });
  }
  if (Array.isArray(value.events)) {
    value.events.forEach((event, index) => {
      if (!isRecord(event)) return;
      ['event_type', 'summary'].forEach((key) => {
        if (!hasText(event[key])) errors.push(`events[${index}].${key} must be non-empty string`);
      });
    });
  }
  if (value.status === 'blocked' && !hasText(value.blocked_reason)) errors.push('blocked response requires blocked_reason');
  if (value.status === 'pass' && Array.isArray(value.evaluation_refs) && value.evaluation_refs.length === 0) errors.push('pass response requires evaluation_refs');
  if (Array.isArray(value.source_refs) && value.source_refs.length === 0) errors.push('source_refs must not be empty');
  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validRequest = validateHostRequest(hostRequestFixture);
const validResponse = validateRuntimeResponse(runtimeResponseFixture);
const invalidRequest = validateHostRequest({ ...hostRequestFixture, source_refs: [] });
const invalidBlocked = validateRuntimeResponse({ ...runtimeResponseFixture, status: 'blocked', blocked_reason: '' });
const invalidPass = validateRuntimeResponse({ ...runtimeResponseFixture, evaluation_refs: [] });
const invalidArtifact = validateRuntimeResponse({ ...runtimeResponseFixture, artifact_refs: [{ kind: 'runtime_summary', ref: 'x' }] });
const invalidEvent = validateRuntimeResponse({ ...runtimeResponseFixture, events: [{ event_type: 'x' }] });

const assertions = [
  assert('valid host request passes', validRequest.valid, { errors: validRequest.errors }),
  assert('valid runtime response passes', validResponse.valid, { errors: validResponse.errors }),
  assert('host request without source refs fails', !invalidRequest.valid, { errors: invalidRequest.errors }),
  assert('blocked response without reason fails', !invalidBlocked.valid, { errors: invalidBlocked.errors }),
  assert('pass response without evaluation refs fails', !invalidPass.valid, { errors: invalidPass.errors }),
  assert('artifact without summary fails', !invalidArtifact.valid, { errors: invalidArtifact.errors }),
  assert('event without summary fails', !invalidEvent.valid, { errors: invalidEvent.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'nexus-host-boundary', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Nexus host boundary verification failed.');
  process.exit(1);
}
