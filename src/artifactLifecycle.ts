export type ArtifactLifecycleStatus = 'draft' | 'active' | 'retained' | 'retired' | 'rejected';

export type ArtifactLifecycleRecord = {
  artifact_id: string;
  kind: string;
  ref: string;
  summary: string;
  source_refs: string[];
  status: ArtifactLifecycleStatus;
  created_at: string;
  updated_at: string;
  reason?: string;
};

export type ArtifactLifecycleTransition = {
  artifact_id: string;
  from: ArtifactLifecycleStatus;
  to: ArtifactLifecycleStatus;
  changed_at: string;
  reason?: string;
  source_ref: string;
};

export type ArtifactLifecycleValidation = {
  valid: boolean;
  errors: string[];
};

const STATUSES: ArtifactLifecycleStatus[] = ['draft', 'active', 'retained', 'retired', 'rejected'];
const ALLOWED_TRANSITIONS: Record<ArtifactLifecycleStatus, ArtifactLifecycleStatus[]> = {
  draft: ['active', 'rejected'],
  active: ['retained', 'retired'],
  retained: ['retired'],
  retired: [],
  rejected: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasText(value: unknown) {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStatus(value: unknown): value is ArtifactLifecycleStatus {
  return typeof value === 'string' && STATUSES.includes(value as ArtifactLifecycleStatus);
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && Boolean(item.trim()));
}

export function validateArtifactLifecycleRecord(value: unknown): ArtifactLifecycleValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['artifact lifecycle record must be an object'] };

  ['artifact_id', 'kind', 'ref', 'summary', 'created_at', 'updated_at'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be a non-empty string`);
  });
  if (!isStatus(value.status)) errors.push('status must be a known lifecycle status');
  if (!isStringArray(value.source_refs) || (value.source_refs as string[]).length === 0) errors.push('source_refs must be a non-empty string array');
  if ((value.status === 'retired' || value.status === 'rejected') && !hasText(value.reason)) {
    errors.push(`${value.status} artifact must include a non-empty reason`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateArtifactLifecycleTransition(value: unknown): ArtifactLifecycleValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['artifact lifecycle transition must be an object'] };

  ['artifact_id', 'changed_at', 'source_ref'].forEach((key) => {
    if (!hasText(value[key])) errors.push(`${key} must be a non-empty string`);
  });
  if (!isStatus(value.from)) errors.push('from must be a known lifecycle status');
  if (!isStatus(value.to)) errors.push('to must be a known lifecycle status');

  if (isStatus(value.from) && isStatus(value.to) && !ALLOWED_TRANSITIONS[value.from].includes(value.to)) {
    errors.push(`transition ${value.from} -> ${value.to} is not allowed`);
  }
  if ((value.to === 'retired' || value.to === 'rejected') && !hasText(value.reason)) {
    errors.push(`transition to ${value.to} must include a non-empty reason`);
  }

  return { valid: errors.length === 0, errors };
}

export function applyArtifactLifecycleTransition(
  record: ArtifactLifecycleRecord,
  transition: ArtifactLifecycleTransition,
): { record?: ArtifactLifecycleRecord; validation: ArtifactLifecycleValidation } {
  const recordValidation = validateArtifactLifecycleRecord(record);
  const transitionValidation = validateArtifactLifecycleTransition(transition);
  const errors = [...recordValidation.errors, ...transitionValidation.errors];

  if (record.artifact_id !== transition.artifact_id) errors.push('transition artifact_id must match record artifact_id');
  if (record.status !== transition.from) errors.push('transition from must match current record status');

  if (errors.length > 0) return { validation: { valid: false, errors } };

  return {
    validation: { valid: true, errors: [] },
    record: {
      ...record,
      status: transition.to,
      updated_at: transition.changed_at,
      reason: transition.reason ?? record.reason,
      source_refs: [...new Set([...record.source_refs, transition.source_ref])],
    },
  };
}

export function summarizeArtifactLifecycle(records: ArtifactLifecycleRecord[]) {
  const status_counts = Object.fromEntries(
    STATUSES.map((status) => [status, records.filter((record) => record.status === status).length]),
  ) as Record<ArtifactLifecycleStatus, number>;

  return {
    artifact_count: records.length,
    status_counts,
    source_ref_count: records.reduce((count, record) => count + record.source_refs.length, 0),
  };
}

export function allowedArtifactLifecycleTransitions() {
  return ALLOWED_TRANSITIONS;
}
