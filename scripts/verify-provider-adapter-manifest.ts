import providerAdapterManifestFixture from '../samples/nexus-host-integration/provider-adapter-manifest.sample.json' assert { type: 'json' };

type Validation = { valid: boolean; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasText(value: unknown) {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => hasText(item));
}

function includesAll(value: unknown, required: string[], key: string, errors: string[]) {
  if (!isStringArray(value)) {
    errors.push(`${key} must be string array`);
    return;
  }
  const items = value;
  required.forEach((item) => {
    if (!items.includes(item)) errors.push(`${key} must include ${item}`);
  });
}

function validateProviderAdapterManifest(value: unknown): Validation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['provider adapter manifest must be object'] };

  if (value.packet_type !== 'nexus.provider_adapter_manifest') errors.push('packet_type must be nexus.provider_adapter_manifest');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['provider_ref', 'adapter_ref', 'adapter_version', 'required_workspace_boundary', 'artifact_policy', 'result_policy', 'fallback_policy', 'observability_policy'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be non-empty string`);
  });

  includesAll(value.supported_runtime_modes, ['controlled_external', 'dry_run_external'], 'supported_runtime_modes', errors);
  includesAll(value.supported_invocation_types, ['structured_task', 'code_change_candidate', 'test_execution_candidate'], 'supported_invocation_types', errors);
  includesAll(
    value.declared_capabilities,
    ['file_read', 'file_write_candidate', 'test_execution', 'command_execution', 'artifact_generation', 'structured_result', 'partial_result', 'blocked_result'],
    'declared_capabilities',
    errors,
  );
  includesAll(
    value.required_host_grants,
    ['tool_grant.external_runtime.invoke', 'tool_grant.workspace.read', 'tool_grant.artifact.write_candidate'],
    'required_host_grants',
    errors,
  );

  if (value.provider_available_assumed !== false) errors.push('provider_available_assumed must be false');
  if (value.provider_may_widen_permissions !== false) errors.push('provider_may_widen_permissions must be false');
  if (value.provider_may_write_memory_directly !== false) errors.push('provider_may_write_memory_directly must be false');
  if (value.provider_may_bypass_decision_gates !== false) errors.push('provider_may_bypass_decision_gates must be false');

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validManifest = validateProviderAdapterManifest(providerAdapterManifestFixture);
const invalidAvailability = validateProviderAdapterManifest({ ...providerAdapterManifestFixture, provider_available_assumed: true });
const invalidPermissionWidening = validateProviderAdapterManifest({ ...providerAdapterManifestFixture, provider_may_widen_permissions: true });
const invalidMemoryWrite = validateProviderAdapterManifest({ ...providerAdapterManifestFixture, provider_may_write_memory_directly: true });
const invalidDecisionGate = validateProviderAdapterManifest({ ...providerAdapterManifestFixture, provider_may_bypass_decision_gates: true });
const invalidCapabilities = validateProviderAdapterManifest({
  ...providerAdapterManifestFixture,
  declared_capabilities: providerAdapterManifestFixture.declared_capabilities.filter((item) => item !== 'blocked_result'),
});

const assertions = [
  assert('valid provider adapter manifest passes', validManifest.valid, { errors: validManifest.errors }),
  assert('provider availability assumption fails', !invalidAvailability.valid, { errors: invalidAvailability.errors }),
  assert('provider permission widening fails', !invalidPermissionWidening.valid, { errors: invalidPermissionWidening.errors }),
  assert('provider direct memory write fails', !invalidMemoryWrite.valid, { errors: invalidMemoryWrite.errors }),
  assert('provider decision gate bypass fails', !invalidDecisionGate.valid, { errors: invalidDecisionGate.errors }),
  assert('missing blocked result capability fails', !invalidCapabilities.valid, { errors: invalidCapabilities.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'provider-adapter-manifest', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Provider adapter manifest verification failed.');
  process.exit(1);
}
