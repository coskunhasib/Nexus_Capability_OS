import normalizedResultFixture from '../samples/nexus-host-integration/external-result-normalization.sample.json' assert { type: 'json' };

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

function validateNormalizedResult(value: unknown): Validation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['normalized result must be object'] };
  if (value.packet_type !== 'nexus.external_normalized_result') errors.push('packet_type must be nexus.external_normalized_result');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['result_id', 'call_ref', 'provider_ref', 'adapter_ref', 'status', 'summary'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be non-empty string`);
  });
  if (!['pass', 'partial', 'blocked', 'fallback_used'].includes(String(value.status))) errors.push('status must be pass, partial, blocked or fallback_used');
  ['source_refs', 'trace_refs', 'note_candidate_refs', 'evaluation_refs'].forEach((key) => {
    if (!isStringArray(value[key])) errors.push(`${key} must be string array`);
  });
  if (Array.isArray(value.source_refs) && value.source_refs.length === 0) errors.push('source_refs must not be empty');
  if (!isObjectArray(value.artifact_refs)) errors.push('artifact_refs must be object array');
  if (isObjectArray(value.artifact_refs)) {
    value.artifact_refs.forEach((artifact, index) => {
      ['kind', 'ref', 'root', 'summary'].forEach((key) => {
        if (!hasText(artifact[key])) errors.push(`artifact_refs[${index}].${key} must be non-empty string`);
      });
    });
  }
  if (value.status === 'blocked' && !hasText(value.blocked_reason)) errors.push('blocked status requires blocked_reason');
  if (value.status === 'partial' && !hasText(value.partial_reason)) errors.push('partial status requires partial_reason');
  if (value.status === 'fallback_used' && (!Array.isArray(value.trace_refs) || !value.trace_refs.some((ref) => String(ref).includes('fallback')))) {
    errors.push('fallback_used status requires fallback trace ref');
  }
  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validResult = validateNormalizedResult(normalizedResultFixture);
const invalidSources = validateNormalizedResult({ ...normalizedResultFixture, source_refs: [] });
const invalidArtifact = validateNormalizedResult({ ...normalizedResultFixture, artifact_refs: [{ kind: 'candidate_patch', ref: 'x', summary: 'x' }] });
const invalidBlocked = validateNormalizedResult({ ...normalizedResultFixture, status: 'blocked', blocked_reason: '' });
const invalidPartial = validateNormalizedResult({ ...normalizedResultFixture, status: 'partial', partial_reason: '' });
const invalidFallback = validateNormalizedResult({ ...normalizedResultFixture, status: 'fallback_used', trace_refs: ['trace/external-call-001'] });

const assertions = [
  assert('valid normalized result passes', validResult.valid, { errors: validResult.errors }),
  assert('empty source refs fail', !invalidSources.valid, { errors: invalidSources.errors }),
  assert('artifact without root fails', !invalidArtifact.valid, { errors: invalidArtifact.errors }),
  assert('blocked without reason fails', !invalidBlocked.valid, { errors: invalidBlocked.errors }),
  assert('partial without reason fails', !invalidPartial.valid, { errors: invalidPartial.errors }),
  assert('fallback without trace fails', !invalidFallback.valid, { errors: invalidFallback.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'external-result-normalization', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('External result normalization verification failed.');
  process.exit(1);
}
