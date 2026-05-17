import {
  allowedArtifactLifecycleTransitions,
  applyArtifactLifecycleTransition,
  summarizeArtifactLifecycle,
  validateArtifactLifecycleRecord,
  validateArtifactLifecycleTransition,
  type ArtifactLifecycleRecord,
  type ArtifactLifecycleTransition,
} from '../src/artifactLifecycle.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const draftArtifact: ArtifactLifecycleRecord = {
  artifact_id: 'artifact.runtime-summary.001',
  kind: 'runtime_summary',
  ref: 'artifact://task/runtime-summary',
  summary: 'Runtime summary artifact candidate.',
  source_refs: ['event:artifact_created:001'],
  status: 'draft',
  created_at: '2026-05-17T00:00:00.000Z',
  updated_at: '2026-05-17T00:00:00.000Z',
};

const activateTransition: ArtifactLifecycleTransition = {
  artifact_id: draftArtifact.artifact_id,
  from: 'draft',
  to: 'active',
  changed_at: '2026-05-17T00:01:00.000Z',
  source_ref: 'evaluation:obs.artifact.accepted',
};

const retainTransition: ArtifactLifecycleTransition = {
  artifact_id: draftArtifact.artifact_id,
  from: 'active',
  to: 'retained',
  changed_at: '2026-05-17T00:02:00.000Z',
  source_ref: 'review:release-evidence',
};

const retireTransition: ArtifactLifecycleTransition = {
  artifact_id: draftArtifact.artifact_id,
  from: 'retained',
  to: 'retired',
  changed_at: '2026-05-17T00:03:00.000Z',
  reason: 'Superseded by final runtime summary.',
  source_ref: 'review:retire-artifact',
};

const rejectTransition: ArtifactLifecycleTransition = {
  artifact_id: 'artifact.rejected.001',
  from: 'draft',
  to: 'rejected',
  changed_at: '2026-05-17T00:04:00.000Z',
  reason: 'Artifact payload was incomplete.',
  source_ref: 'evaluation:obs.artifact.rejected',
};

const rejectedArtifact: ArtifactLifecycleRecord = {
  ...draftArtifact,
  artifact_id: 'artifact.rejected.001',
  ref: 'artifact://task/rejected',
};

const activeResult = applyArtifactLifecycleTransition(draftArtifact, activateTransition);
const retainedResult = activeResult.record
  ? applyArtifactLifecycleTransition(activeResult.record, retainTransition)
  : { validation: { valid: false, errors: ['active transition failed'] } };
const retiredResult = retainedResult.record
  ? applyArtifactLifecycleTransition(retainedResult.record, retireTransition)
  : { validation: { valid: false, errors: ['retain transition failed'] } };
const rejectedResult = applyArtifactLifecycleTransition(rejectedArtifact, rejectTransition);

const invalidMissingSource = validateArtifactLifecycleRecord({
  ...draftArtifact,
  source_refs: [],
});
const invalidNoReason = validateArtifactLifecycleTransition({
  ...retireTransition,
  reason: '',
});
const invalidRetiredToActive = validateArtifactLifecycleTransition({
  artifact_id: draftArtifact.artifact_id,
  from: 'retired',
  to: 'active',
  changed_at: '2026-05-17T00:05:00.000Z',
  source_ref: 'bad:transition',
});
const invalidMismatchedFrom = activeResult.record
  ? applyArtifactLifecycleTransition(activeResult.record, {
      ...activateTransition,
      changed_at: '2026-05-17T00:06:00.000Z',
    })
  : { validation: { valid: false, errors: ['active transition failed'] } };

const lifecycleRecords = [activeResult.record, retainedResult.record, retiredResult.record, rejectedResult.record].filter(Boolean) as ArtifactLifecycleRecord[];
const summary = summarizeArtifactLifecycle(lifecycleRecords);

const assertions = [
  assert('allowed transitions are explicit', allowedArtifactLifecycleTransitions().draft.join(',') === 'active,rejected', { transitions: allowedArtifactLifecycleTransitions() }),
  assert('draft artifact record is valid', validateArtifactLifecycleRecord(draftArtifact).valid, { errors: validateArtifactLifecycleRecord(draftArtifact).errors }),
  assert('draft to active transition is valid', activeResult.validation.valid && activeResult.record?.status === 'active', { validation: activeResult.validation, record: activeResult.record }),
  assert('active to retained transition is valid', retainedResult.validation.valid && retainedResult.record?.status === 'retained', { validation: retainedResult.validation, record: retainedResult.record }),
  assert('retained to retired transition is valid with reason', retiredResult.validation.valid && retiredResult.record?.status === 'retired', { validation: retiredResult.validation, record: retiredResult.record }),
  assert('draft to rejected transition is valid with reason', rejectedResult.validation.valid && rejectedResult.record?.status === 'rejected', { validation: rejectedResult.validation, record: rejectedResult.record }),
  assert('missing source refs are rejected', !invalidMissingSource.valid, { errors: invalidMissingSource.errors }),
  assert('retire/reject without reason is rejected', !invalidNoReason.valid, { errors: invalidNoReason.errors }),
  assert('retired to active transition is rejected', !invalidRetiredToActive.valid, { errors: invalidRetiredToActive.errors }),
  assert('transition from must match current status', !invalidMismatchedFrom.validation.valid, { errors: invalidMismatchedFrom.validation.errors }),
  assert('summary counts statuses', summary.status_counts.active === 1 && summary.status_counts.retained === 1 && summary.status_counts.retired === 1 && summary.status_counts.rejected === 1, { summary }),
  assert('summary keeps source refs', summary.source_ref_count >= 6, { summary }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'artifact-lifecycle',
  status,
  assertions,
  summary,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Artifact lifecycle verification failed.');
  process.exit(1);
}
