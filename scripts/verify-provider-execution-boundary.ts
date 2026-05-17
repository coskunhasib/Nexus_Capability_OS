import fixture from '../samples/nexus-host-integration/provider-execution-boundary.sample.json' assert { type: 'json' };

type Validation = { valid: boolean; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => hasText(item));
}

function includesAll(value: unknown, required: string[], key: string, errors: string[]) {
  if (!isStringArray(value)) {
    errors.push(`${key} invalid`);
    return;
  }
  required.forEach((item) => {
    if (!value.includes(item)) errors.push(`${key} missing ${item}`);
  });
}

function validate(value: unknown): Validation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['boundary must be object'] };
  if (value.packet_type !== 'nexus.provider_execution_boundary') errors.push('packet_type invalid');
  if (value.version !== '0.1') errors.push('version invalid');
  if (!hasText(value.boundary_ref)) errors.push('boundary_ref invalid');
  if (value.provider_execution_enabled_by_default !== false) errors.push('default enablement invalid');
  if (value.mock_provider_only !== true) errors.push('mock provider required');
  if (value.local_controlled_fallback_required !== true) errors.push('local fallback required');
  if (value.normalized_result_required !== true) errors.push('normalized result required');
  includesAll(value.host_owned_decisions, ['execution_activation', 'provider_selection', 'active_grants', 'workspace_boundary', 'artifact_root', 'fallback_policy', 'manual_review_policy', 'accepted_result_shape'], 'host_owned_decisions', errors);
  includesAll(value.runtime_owned_surfaces, ['run_request_shape', 'state_machine_shape', 'normalized_ingest_shape', 'fallback_result_shape', 'fixture_set', 'verification_helpers'], 'runtime_owned_surfaces', errors);
  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const valid = validate(fixture);
const invalidEnablement = validate({ ...fixture, provider_execution_enabled_by_default: true });
const invalidMock = validate({ ...fixture, mock_provider_only: false });
const invalidFallback = validate({ ...fixture, local_controlled_fallback_required: false });
const invalidNormalize = validate({ ...fixture, normalized_result_required: false });

const assertions = [
  assert('valid boundary passes', valid.valid, { errors: valid.errors }),
  assert('default execution enablement fails', !invalidEnablement.valid, { errors: invalidEnablement.errors }),
  assert('non mock provider fails', !invalidMock.valid, { errors: invalidMock.errors }),
  assert('missing fallback fails', !invalidFallback.valid, { errors: invalidFallback.errors }),
  assert('missing normalization fails', !invalidNormalize.valid, { errors: invalidNormalize.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'provider-execution-boundary', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
