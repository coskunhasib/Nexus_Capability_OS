import externalCallPacketFixture from '../samples/nexus-host-integration/external-call-packet.sample.json' assert { type: 'json' };

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

function validateExternalCallPacket(value: unknown): Validation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['external call packet must be object'] };
  if (value.packet_type !== 'nexus.external_call_packet') errors.push('packet_type must be nexus.external_call_packet');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  ['call_id', 'request_ref', 'provider_ref', 'adapter_ref', 'runtime_mode', 'objective', 'active_workspace_boundary', 'allowed_artifact_root', 'fallback_ref'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be non-empty string`);
  });
  ['source_refs', 'active_tool_grants', 'expected_outputs'].forEach((key) => {
    if (!isStringArray(value[key]) || value[key].length === 0) errors.push(`${key} must be non-empty string array`);
  });
  if (value.runtime_mode !== 'dry_run_external' && value.runtime_mode !== 'controlled_external') errors.push('runtime_mode must be dry_run_external or controlled_external');
  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validPacket = validateExternalCallPacket(externalCallPacketFixture);
const invalidSources = validateExternalCallPacket({ ...externalCallPacketFixture, source_refs: [] });
const invalidGrants = validateExternalCallPacket({ ...externalCallPacketFixture, active_tool_grants: [] });
const invalidBoundary = validateExternalCallPacket({ ...externalCallPacketFixture, active_workspace_boundary: '' });
const invalidArtifactRoot = validateExternalCallPacket({ ...externalCallPacketFixture, allowed_artifact_root: '' });
const invalidFallback = validateExternalCallPacket({ ...externalCallPacketFixture, fallback_ref: '' });

const assertions = [
  assert('valid external call packet passes', validPacket.valid, { errors: validPacket.errors }),
  assert('empty source refs fail', !invalidSources.valid, { errors: invalidSources.errors }),
  assert('empty grants fail', !invalidGrants.valid, { errors: invalidGrants.errors }),
  assert('missing workspace boundary fails', !invalidBoundary.valid, { errors: invalidBoundary.errors }),
  assert('missing artifact root fails', !invalidArtifactRoot.valid, { errors: invalidArtifactRoot.errors }),
  assert('missing fallback ref fails', !invalidFallback.valid, { errors: invalidFallback.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'external-call-packet', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('External call packet verification failed.');
  process.exit(1);
}
