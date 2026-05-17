import permissionBoundaryFixture from '../samples/nexus-host-integration/permission-boundary.sample.json' assert { type: 'json' };

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

function validatePermissionBoundary(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['permission boundary must be object'] };

  if (value.packet_type !== 'nexus.permission_boundary') errors.push('packet_type must be nexus.permission_boundary');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  if (!hasText(value.boundary_ref)) errors.push('boundary_ref must be non-empty string');

  includesAll(
    value.runtime_declared_fields,
    ['requested_tool_grants', 'requested_workspace_boundary', 'requested_decision_gate_state', 'required_source_refs', 'expected_artifact_root'],
    'runtime_declared_fields',
    errors,
  );

  includesAll(
    value.host_decided_fields,
    ['active_tool_grants', 'active_workspace_boundary', 'valid_decision_gate_result', 'allowed_result_shape', 'allowed_artifact_root'],
    'host_decided_fields',
    errors,
  );

  includesAll(value.permission_lifecycle, ['requested', 'reviewed', 'active', 'expired', 'revoked', 'blocked'], 'permission_lifecycle', errors);

  includesAll(
    value.blocked_behaviors,
    ['implicit_tool_grant', 'self_approved_gate', 'workspace_boundary_widening', 'artifact_root_override', 'source_ref_omission', 'memory_commit_without_host_policy'],
    'blocked_behaviors',
    errors,
  );

  if (value.tool_grants_explicit !== true) errors.push('tool_grants_explicit must be true');
  if (value.workspace_boundary_explicit !== true) errors.push('workspace_boundary_explicit must be true');
  if (value.runtime_can_activate_grant !== false) errors.push('runtime_can_activate_grant must be false');
  if (value.runtime_can_widen_workspace !== false) errors.push('runtime_can_widen_workspace must be false');
  if (value.runtime_can_self_approve_gate !== false) errors.push('runtime_can_self_approve_gate must be false');
  if (value.stateful_outputs_require_source_refs !== true) errors.push('stateful_outputs_require_source_refs must be true');
  if (value.artifact_root_host_approved !== true) errors.push('artifact_root_host_approved must be true');

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validBoundary = validatePermissionBoundary(permissionBoundaryFixture);
const invalidActivation = validatePermissionBoundary({ ...permissionBoundaryFixture, runtime_can_activate_grant: true });
const invalidWorkspace = validatePermissionBoundary({ ...permissionBoundaryFixture, runtime_can_widen_workspace: true });
const invalidGate = validatePermissionBoundary({ ...permissionBoundaryFixture, runtime_can_self_approve_gate: true });
const invalidSources = validatePermissionBoundary({ ...permissionBoundaryFixture, stateful_outputs_require_source_refs: false });
const invalidBlocked = validatePermissionBoundary({
  ...permissionBoundaryFixture,
  blocked_behaviors: permissionBoundaryFixture.blocked_behaviors.filter((item) => item !== 'implicit_tool_grant'),
});

const assertions = [
  assert('valid permission boundary passes', validBoundary.valid, { errors: validBoundary.errors }),
  assert('runtime grant activation fails', !invalidActivation.valid, { errors: invalidActivation.errors }),
  assert('runtime workspace widening fails', !invalidWorkspace.valid, { errors: invalidWorkspace.errors }),
  assert('runtime self-approved gate fails', !invalidGate.valid, { errors: invalidGate.errors }),
  assert('stateful output without source refs requirement fails', !invalidSources.valid, { errors: invalidSources.errors }),
  assert('missing blocked behavior fails', !invalidBlocked.valid, { errors: invalidBlocked.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'permission-boundary', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Permission boundary verification failed.');
  process.exit(1);
}
