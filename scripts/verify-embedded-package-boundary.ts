import packageBoundaryFixture from '../samples/nexus-host-integration/embedded-package-boundary.sample.json' assert { type: 'json' };

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

function validateEmbeddedPackageBoundary(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['embedded package boundary must be object'] };

  if (value.packet_type !== 'nexus.embedded_package_boundary') errors.push('packet_type must be nexus.embedded_package_boundary');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  if (value.embedding_mode !== 'embedded_subsystem') errors.push('embedding_mode must be embedded_subsystem');
  if (!hasText(value.package_ref)) errors.push('package_ref must be non-empty string');
  if (value.read_only_ui !== true) errors.push('read_only_ui must be true');
  if (value.local_scaffold_required !== true) errors.push('local_scaffold_required must be true');
  if (value.external_mapping_default !== 'disabled') errors.push('external_mapping_default must be disabled');

  includesAll(
    value.export_groups,
    ['core_contracts', 'runtime_mapping', 'verification_helpers', 'read_only_ui_panel', 'sample_fixtures', 'scaffold_app_shell'],
    'export_groups',
    errors,
  );

  includesAll(
    value.required_docs,
    ['docs/nexus-host-runtime-boundary.md', 'docs/nexus-embedded-package-boundary.md', 'docs/milestone-3-embedded-nexus-integration.md'],
    'required_docs',
    errors,
  );

  includesAll(value.required_scripts, ['verify:nexus-host-boundary', 'verify:embedded-package-boundary'], 'required_scripts', errors);

  includesAll(
    value.host_owned_decisions,
    ['active_tool_grants', 'active_workspace_boundary', 'memory_commit_policy', 'artifact_root_policy', 'ui_mount_location', 'release_gate_policy'],
    'host_owned_decisions',
    errors,
  );

  includesAll(
    value.runtime_owned_surfaces,
    ['contract_shapes', 'mapping_helpers', 'verifiers', 'fixtures', 'read_only_runtime_panel', 'local_scaffold'],
    'runtime_owned_surfaces',
    errors,
  );

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validBoundary = validateEmbeddedPackageBoundary(packageBoundaryFixture);
const invalidUi = validateEmbeddedPackageBoundary({ ...packageBoundaryFixture, read_only_ui: false });
const invalidExternal = validateEmbeddedPackageBoundary({ ...packageBoundaryFixture, external_mapping_default: 'enabled' });
const invalidExports = validateEmbeddedPackageBoundary({
  ...packageBoundaryFixture,
  export_groups: packageBoundaryFixture.export_groups.filter((item) => item !== 'verification_helpers'),
});
const invalidHostOwnership = validateEmbeddedPackageBoundary({
  ...packageBoundaryFixture,
  host_owned_decisions: packageBoundaryFixture.host_owned_decisions.filter((item) => item !== 'memory_commit_policy'),
});

const assertions = [
  assert('valid embedded package boundary passes', validBoundary.valid, { errors: validBoundary.errors }),
  assert('mutable UI boundary fails', !invalidUi.valid, { errors: invalidUi.errors }),
  assert('enabled external mapping default fails', !invalidExternal.valid, { errors: invalidExternal.errors }),
  assert('missing verification helper export fails', !invalidExports.valid, { errors: invalidExports.errors }),
  assert('missing host memory ownership fails', !invalidHostOwnership.valid, { errors: invalidHostOwnership.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'embedded-package-boundary', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Embedded package boundary verification failed.');
  process.exit(1);
}
