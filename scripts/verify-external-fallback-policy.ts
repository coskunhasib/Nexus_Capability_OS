import fallbackPolicyFixture from '../samples/nexus-host-integration/external-fallback-policy.sample.json' assert { type: 'json' };

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

function isObjectArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isRecord);
}

function validateFallbackPolicy(value: unknown): Validation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['policy must be object'] };
  if (value.packet_type !== 'nexus.external_fallback_policy') errors.push('packet_type invalid');
  if (value.version !== '0.1') errors.push('version invalid');
  if (!hasText(value.policy_ref)) errors.push('policy_ref invalid');
  if (value.local_controlled_runtime_available !== true) errors.push('local path required');
  if (value.retry_limit !== 1) errors.push('retry_limit invalid');
  if (value.blocked_results_require_reason !== true) errors.push('blocked reason required');
  if (value.partial_results_require_reason !== true) errors.push('partial reason required');
  if (value.manual_review_host_owned !== true) errors.push('manual review must be host owned');

  const requiredFailures = ['provider_unavailable', 'provider_timeout', 'provider_permission_mismatch', 'provider_schema_mismatch', 'provider_artifact_violation', 'provider_result_incomplete'];
  const requiredOutcomes = ['fallback_to_local', 'return_partial', 'return_blocked', 'retry_once', 'manual_review_required'];
  const allowedOutcomes = isStringArray(value.allowed_outcomes) ? value.allowed_outcomes : [];
  const mappings = isObjectArray(value.failure_mappings) ? value.failure_mappings : [];

  if (!isStringArray(value.allowed_outcomes)) errors.push('allowed_outcomes invalid');
  if (!isObjectArray(value.failure_mappings)) errors.push('failure_mappings invalid');

  requiredOutcomes.forEach((outcome) => {
    if (!allowedOutcomes.includes(outcome)) errors.push(`missing outcome ${outcome}`);
  });

  requiredFailures.forEach((failure) => {
    const mapping = mappings.find((item) => item.failure_class === failure);
    if (!mapping) {
      errors.push(`missing mapping ${failure}`);
      return;
    }
    if (!hasText(mapping.outcome)) {
      errors.push(`invalid outcome ${failure}`);
      return;
    }
    const outcome = mapping.outcome;
    if (!allowedOutcomes.includes(outcome)) errors.push(`outcome not allowed ${failure}`);
  });

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validPolicy = validateFallbackPolicy(fallbackPolicyFixture);
const invalidLocalFallback = validateFallbackPolicy({ ...fallbackPolicyFixture, local_controlled_runtime_available: false });
const invalidRetry = validateFallbackPolicy({ ...fallbackPolicyFixture, retry_limit: 5 });
const invalidBlockedReason = validateFallbackPolicy({ ...fallbackPolicyFixture, blocked_results_require_reason: false });
const invalidPartialReason = validateFallbackPolicy({ ...fallbackPolicyFixture, partial_results_require_reason: false });
const invalidMapping = validateFallbackPolicy({
  ...fallbackPolicyFixture,
  failure_mappings: fallbackPolicyFixture.failure_mappings.filter((item) => item.failure_class !== 'provider_schema_mismatch'),
});

const assertions = [
  assert('valid policy passes', validPolicy.valid, { errors: validPolicy.errors }),
  assert('missing local path fails', !invalidLocalFallback.valid, { errors: invalidLocalFallback.errors }),
  assert('invalid retry fails', !invalidRetry.valid, { errors: invalidRetry.errors }),
  assert('missing blocked reason rule fails', !invalidBlockedReason.valid, { errors: invalidBlockedReason.errors }),
  assert('missing partial reason rule fails', !invalidPartialReason.valid, { errors: invalidPartialReason.errors }),
  assert('missing mapping fails', !invalidMapping.valid, { errors: invalidMapping.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'external-fallback-policy', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('verification failed');
  process.exit(1);
}
