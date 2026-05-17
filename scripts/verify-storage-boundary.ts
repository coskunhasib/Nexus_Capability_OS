import storageBoundaryFixture from '../samples/nexus-host-integration/storage-boundary.sample.json' assert { type: 'json' };

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

function excludesAll(value: unknown, blocked: string[], key: string, errors: string[]) {
  if (!isStringArray(value)) {
    errors.push(`${key} must be string array`);
    return;
  }
  const items = value;
  blocked.forEach((item) => {
    if (items.includes(item)) errors.push(`${key} must not include ${item}`);
  });
}

function validateStorageBoundary(value: unknown): BoundaryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['storage boundary must be object'] };

  if (value.packet_type !== 'nexus.storage_boundary') errors.push('packet_type must be nexus.storage_boundary');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  if (!hasText(value.boundary_ref)) errors.push('boundary_ref must be non-empty string');
  if (value.memory_direct_write_allowed !== false) errors.push('memory_direct_write_allowed must be false');
  if (value.configuration_mutation_allowed !== false) errors.push('configuration_mutation_allowed must be false');
  if (value.runtime_events_append_only !== true) errors.push('runtime_events_append_only must be true');
  if (value.artifact_root_required !== true) errors.push('artifact_root_required must be true');

  includesAll(
    value.storage_groups,
    ['trace_refs', 'memory_notes', 'note_candidates', 'artifact_refs', 'runtime_events', 'configuration', 'operator_result_files'],
    'storage_groups',
    errors,
  );

  includesAll(
    value.host_owned_persistence,
    ['memory_notes', 'configuration', 'artifact_root_policy', 'trace_retention_policy', 'operator_result_file_location'],
    'host_owned_persistence',
    errors,
  );

  includesAll(
    value.runtime_allowed_outputs,
    ['trace_refs', 'note_candidates', 'artifact_refs', 'runtime_events', 'operator_result_files'],
    'runtime_allowed_outputs',
    errors,
  );

  excludesAll(value.runtime_allowed_outputs, ['memory_notes', 'configuration'], 'runtime_allowed_outputs', errors);

  includesAll(
    value.blocked_runtime_writes,
    ['direct_memory_commit', 'direct_configuration_mutation', 'artifact_outside_allowed_root', 'trace_retention_override', 'operator_result_file_finalization'],
    'blocked_runtime_writes',
    errors,
  );

  includesAll(value.required_artifact_ref_fields, ['kind', 'ref', 'summary', 'root'], 'required_artifact_ref_fields', errors);

  includesAll(
    value.allowed_event_classes,
    ['runtime_started', 'skill_selected', 'tool_grant_requested', 'decision_gate_checked', 'artifact_proposed', 'note_candidate_proposed', 'runtime_blocked', 'runtime_completed'],
    'allowed_event_classes',
    errors,
  );

  return { valid: errors.length === 0, errors };
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const validBoundary = validateStorageBoundary(storageBoundaryFixture);
const invalidMemoryWrite = validateStorageBoundary({ ...storageBoundaryFixture, memory_direct_write_allowed: true });
const invalidConfigMutation = validateStorageBoundary({ ...storageBoundaryFixture, configuration_mutation_allowed: true });
const invalidAllowedOutputs = validateStorageBoundary({
  ...storageBoundaryFixture,
  runtime_allowed_outputs: [...storageBoundaryFixture.runtime_allowed_outputs, 'memory_notes'],
});
const invalidArtifactFields = validateStorageBoundary({
  ...storageBoundaryFixture,
  required_artifact_ref_fields: storageBoundaryFixture.required_artifact_ref_fields.filter((item) => item !== 'root'),
});
const invalidEvents = validateStorageBoundary({
  ...storageBoundaryFixture,
  runtime_events_append_only: false,
});

const assertions = [
  assert('valid storage boundary passes', validBoundary.valid, { errors: validBoundary.errors }),
  assert('direct memory write allowed fails', !invalidMemoryWrite.valid, { errors: invalidMemoryWrite.errors }),
  assert('configuration mutation allowed fails', !invalidConfigMutation.valid, { errors: invalidConfigMutation.errors }),
  assert('runtime allowed outputs including memory notes fails', !invalidAllowedOutputs.valid, { errors: invalidAllowedOutputs.errors }),
  assert('artifact ref without root requirement fails', !invalidArtifactFields.valid, { errors: invalidArtifactFields.errors }),
  assert('non append-only runtime events fail', !invalidEvents.valid, { errors: invalidEvents.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'storage-boundary', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Storage boundary verification failed.');
  process.exit(1);
}
