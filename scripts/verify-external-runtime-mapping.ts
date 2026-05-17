import externalRuntimeMappingFixture from '../samples/nexus-host-integration/external-runtime-mapping.sample.json' assert { type: 'json' };

type BoundaryValidation = { valid: boolean; errors: string[] };

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

function validateExternalRuntimeMapping(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['external runtime mapping boundary must be object'] };

  if (value.packet_type !== 'nexus.external_runtime_mapping_boundary') errors.push('packet_type must be nexus.external_runtime_mapping_boundary');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  if (!hasText(value.boundary_ref)) errors.push('boundary_ref must be non-empty string');

  if (value.external_mapping_enabled_by_default !== false) errors.push('external_mapping_enabled_by_default must be false');
  if (value.local_controlled_runtime_primary !== true) errors.push('local_controlled_runtime_primary must be true');
  if (value.provider_required !== false) errors.push('provider_required must be false');
  if (value.external_mapping_may_bypass_host_policy !== false) errors.push('external_mapping_may_bypass_host_policy must be false');
  if (value.external_mapping_may_remove_local_checks !== false) errors.push('external_mapping_may_remove_local_checks must be false');
  if (value.provider_specific_contracts_hidden_from_host !== false) errors.push('provider_specific_contracts_hidden_from_host must be false');

  includesAll(
    value.mapping_layers,
    ['host_request', 'runtime_mapping', 'provider_adapter', 'external_invocation', 'result_normalization', 'host_safe_response'],
    'mapping_layers',
    errors,
  );

  includesAll(
    value.host_owned_decisions,
    ['external_mapping_activation', 'provider_allowlist', 'active_tool_grants', 'active_workspace_boundary', 'artifact_root_policy', 'decision_gate_policy', 'fallback_policy', 'accepted_result_shape'],
    'host_owned_decisions',
    errors,
  );

  includesAll(
    value.runtime_owned_surfaces,
    ['mapping_contract', 'normalization_contract', 'provider_capability_expectations', 'fixture_set', 'verification_helpers', 'local_fallback_path'],
    'runtime_owned_surfaces',
    errors,
  );

  includesAll(
    value.provider_adapter_constraints,
    ['declare_provider_capabilities', 'no_permission_widening', 'source_refs_required', 'no_direct_memory_write', 'normalized_result_candidates', 'blocked_and_partial_outcomes_supported'],
    'provider_adapter_constraints',
    errors,
  );

  includesAll(
    value.failure_posture,
    ['provider_unavailable:fallback_or_blocked', 'provider_permission_mismatch:blocked', 'provider_schema_mismatch:blocked', 'provider_timeout:partial_or_fallback', 'provider_artifact_violation:blocked'],
    'failure_posture',
    errors,
  );

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validBoundary = validateExternalRuntimeMapping(externalRuntimeMappingFixture);
const invalidDefaultEnablement = validateExternalRuntimeMapping({ ...externalRuntimeMappingFixture, external_mapping_enabled_by_default: true });
const invalidProviderRequired = validateExternalRuntimeMapping({ ...externalRuntimeMappingFixture, provider_required: true });
const invalidHostBypass = validateExternalRuntimeMapping({ ...externalRuntimeMappingFixture, external_mapping_may_bypass_host_policy: true });
const invalidLocalRemoval = validateExternalRuntimeMapping({ ...externalRuntimeMappingFixture, external_mapping_may_remove_local_checks: true });
const invalidHiddenContracts = validateExternalRuntimeMapping({ ...externalRuntimeMappingFixture, provider_specific_contracts_hidden_from_host: true });
const invalidMappingLayers = validateExternalRuntimeMapping({
  ...externalRuntimeMappingFixture,
  mapping_layers: externalRuntimeMappingFixture.mapping_layers.filter((item) => item !== 'result_normalization'),
});

const assertions = [
  assert('valid external runtime mapping boundary passes', validBoundary.valid, { errors: validBoundary.errors }),
  assert('external mapping enabled by default fails', !invalidDefaultEnablement.valid, { errors: invalidDefaultEnablement.errors }),
  assert('provider required fails', !invalidProviderRequired.valid, { errors: invalidProviderRequired.errors }),
  assert('host policy bypass fails', !invalidHostBypass.valid, { errors: invalidHostBypass.errors }),
  assert('local check removal fails', !invalidLocalRemoval.valid, { errors: invalidLocalRemoval.errors }),
  assert('hidden provider contracts fail', !invalidHiddenContracts.valid, { errors: invalidHiddenContracts.errors }),
  assert('missing result normalization layer fails', !invalidMappingLayers.valid, { errors: invalidMappingLayers.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'external-runtime-mapping', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('External runtime mapping verification failed.');
  process.exit(1);
}
