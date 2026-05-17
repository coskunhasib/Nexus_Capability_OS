import boundary from '../samples/nexus-host-integration/provider-execution-boundary.sample.json' assert { type: 'json' };
import request from '../samples/nexus-host-integration/provider-run-request.sample.json' assert { type: 'json' };
import machine from '../samples/nexus-host-integration/provider-run-state-machine.sample.json' assert { type: 'json' };
import ingest from '../samples/nexus-host-integration/provider-result-ingest.sample.json' assert { type: 'json' };
import fallback from '../samples/nexus-host-integration/provider-fallback-execution.sample.json' assert { type: 'json' };

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

function validateBoundary(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['boundary must be object'];
  if (value.packet_type !== 'nexus.provider_execution_boundary') errors.push('boundary packet_type invalid');
  if (value.provider_execution_enabled_by_default !== false) errors.push('execution must be disabled by default');
  if (value.mock_provider_only !== true) errors.push('mock provider required');
  if (value.local_controlled_fallback_required !== true) errors.push('local fallback required');
  if (value.normalized_result_required !== true) errors.push('normalized result required');
  if (!includesAll(value.host_owned_decisions, ['execution_activation', 'provider_selection', 'active_grants', 'workspace_boundary', 'artifact_root', 'fallback_policy', 'manual_review_policy', 'accepted_result_shape'])) errors.push('host decisions incomplete');
  if (!includesAll(value.runtime_owned_surfaces, ['run_request_shape', 'state_machine_shape', 'normalized_ingest_shape', 'fallback_result_shape', 'fixture_set', 'verification_helpers'])) errors.push('runtime surfaces incomplete');
  return errors;
}

function validateRequest(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['request must be object'];
  if (value.packet_type !== 'nexus.provider_run_request') errors.push('request packet_type invalid');
  ['run_id', 'request_ref', 'provider_ref', 'adapter_ref', 'runtime_mode', 'objective', 'active_workspace_boundary', 'allowed_artifact_root', 'fallback_ref'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} invalid`);
  });
  ['source_refs', 'active_tool_grants', 'expected_outputs'].forEach((key) => {
    if (!isStringArray(value[key]) || value[key].length === 0) errors.push(`${key} invalid`);
  });
  if (value.manual_review_required !== true) errors.push('manual review required');
  return errors;
}

function validateMachine(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['machine must be object'];
  if (value.packet_type !== 'nexus.provider_run_state_machine') errors.push('machine packet_type invalid');
  if (!includesAll(value.states, ['prepared', 'started', 'provider_running', 'normalizing_result', 'manual_review_required', 'fallback_ready', 'completed', 'blocked'])) errors.push('states incomplete');
  if (!includesAll(value.terminal_states, ['completed', 'blocked'])) errors.push('terminal states incomplete');
  if (value.blocked_requires_reason !== true) errors.push('blocked reason required');
  if (value.manual_review_required !== true) errors.push('manual review required');
  if (value.fallback_path_required !== true) errors.push('fallback path required');
  return errors;
}

function validateIngest(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['ingest must be object'];
  if (value.packet_type !== 'nexus.provider_result_ingest') errors.push('ingest packet_type invalid');
  ['ingest_id', 'run_ref', 'normalized_result_ref', 'status', 'summary'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} invalid`);
  });
  if (!isStringArray(value.source_refs) || value.source_refs.length === 0) errors.push('source refs required');
  if (!Array.isArray(value.artifact_refs)) errors.push('artifact refs array required');
  if (!isStringArray(value.trace_refs) || value.trace_refs.length === 0) errors.push('trace refs required');
  if (value.review_required !== true) errors.push('review required');
  if (value.accepted_by_host !== false) errors.push('host acceptance must be false by default');
  return errors;
}

function validateFallback(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ['fallback must be object'];
  if (value.packet_type !== 'nexus.provider_fallback_execution') errors.push('fallback packet_type invalid');
  ['fallback_run_id', 'source_run_ref', 'fallback_ref', 'reason', 'result_status'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} invalid`);
  });
  if (!isStringArray(value.source_refs) || value.source_refs.length === 0) errors.push('source refs required');
  if (!isStringArray(value.trace_refs) || value.trace_refs.length === 0) errors.push('trace refs required');
  if (value.result_status !== 'fallback_used') errors.push('fallback result status required');
  if (value.manual_review_required !== true) errors.push('manual review required');
  return errors;
}

function check(name: string, errors: string[]): Check {
  return { name, pass: errors.length === 0, details: { errors } };
}

const assertions = [
  check('provider execution boundary validates', validateBoundary(boundary)),
  check('provider run request validates', validateRequest(request)),
  check('provider run state machine validates', validateMachine(machine)),
  check('provider result ingest validates', validateIngest(ingest)),
  check('provider fallback execution validates', validateFallback(fallback)),
  check('disabled execution mutation fails', validateBoundary({ ...boundary, provider_execution_enabled_by_default: true }).length > 0 ? [] : ['mutation did not fail']),
  check('request without source refs fails', validateRequest({ ...request, source_refs: [] }).length > 0 ? [] : ['mutation did not fail']),
  check('ingest accepted by host by default fails', validateIngest({ ...ingest, accepted_by_host: true }).length > 0 ? [] : ['mutation did not fail']),
  check('fallback without reason fails', validateFallback({ ...fallback, reason: '' }).length > 0 ? [] : ['mutation did not fail']),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'provider-execution-slice', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
