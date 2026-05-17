import { localAdminIdentity, localReviewerIdentity } from '../src/auth/localIdentity.ts';
import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';
import { runReviewActionWithIdentity } from '../src/review/reviewActions.ts';
import { ControlledLocalRunner } from '../src/runtime/controlledRunner.ts';
import { FileSnapshotStore } from '../src/storage/localStore.ts';
import { toStoredSliceRecord } from '../src/storage/storageContracts.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

function lastState(value: { stateHistory: string[] }) {
  return value.stateHistory.at(-1) ?? 'none';
}

const happy = runProviderVerticalSlice('happy_path');
const blocked = runProviderVerticalSlice('missing_source_refs');
const fallback = runProviderVerticalSlice('fallback_path');
const rejected = runProviderVerticalSlice('review_reject_path');
const changes = runProviderVerticalSlice('request_changes_path');
const outsideRoot = runProviderVerticalSlice('artifact_outside_root');
const controlled = runProviderVerticalSlice('happy_path', new ControlledLocalRunner());
const controlledFallback = runProviderVerticalSlice('fallback_path', new ControlledLocalRunner());
const adminAccept = runReviewActionWithIdentity({ action: 'accept_candidate', operatorRef: 'operator.local' }, localAdminIdentity);
const reviewerAccept = runReviewActionWithIdentity({ action: 'accept_candidate', operatorRef: 'operator.reviewer' }, localReviewerIdentity);
const reviewerReject = runReviewActionWithIdentity({ action: 'reject_candidate', operatorRef: 'operator.reviewer' }, localReviewerIdentity);

const store = new FileSnapshotStore();
[happy, blocked, fallback, controlled].forEach((result) => store.save(toStoredSliceRecord(result)));
const snapshot = store.snapshot();
const jsonA = store.toJson();
const jsonB = store.toJson();

const assertions: Check[] = [
  check('happy accepted', happy.status === 'accepted' && happy.acceptedArtifacts.length === 1, { happy }),
  check('happy terminal state', lastState(happy) === 'accepted', { stateHistory: happy.stateHistory }),
  check('blocked source refs', blocked.status === 'blocked' && blocked.reasonCode === 'MISSING_SOURCE_REFS' && blocked.acceptedArtifacts.length === 0, { blocked }),
  check('fallback safe', fallback.status === 'fallback_used' && fallback.acceptedArtifacts.length === 0, { fallback }),
  check('reject safe', rejected.status === 'rejected' && rejected.acceptedArtifacts.length === 0, { rejected }),
  check('changes safe', changes.status === 'changes_requested' && changes.acceptedArtifacts.length === 0, { changes }),
  check('outside root safe', outsideRoot.status === 'blocked' && outsideRoot.reasonCode === 'ARTIFACT_OUTSIDE_ROOT' && outsideRoot.acceptedArtifacts.length === 0, { outsideRoot }),

  check('controlled accepted', controlled.status === 'accepted' && controlled.runnerRef === 'controlled-local-runner-v1' && controlled.acceptedArtifacts.length === 1, { controlled }),
  check('controlled fallback safe', controlledFallback.status === 'fallback_used' && controlledFallback.normalizedResult?.reasonCode === 'RUNNER_FAILURE' && controlledFallback.acceptedArtifacts.length === 0, { controlledFallback }),

  check('store has four records', snapshot.records.length === 4, { snapshot }),
  check('store json deterministic', jsonA === jsonB, { jsonA }),
  check('store has exactly two accepted records', snapshot.records.filter((record) => record.acceptedArtifacts.length === 1).length === 2, { snapshot }),

  check('admin action accepted', adminAccept.record.status === 'accepted' && adminAccept.result?.acceptedArtifacts.length === 1, { adminAccept }),
  check('reviewer cannot accept', reviewerAccept.record.status === 'blocked' && reviewerAccept.record.reasonCode === 'PERMISSION_DENIED' && reviewerAccept.snapshot.records.length === 0, { reviewerAccept }),
  check('reviewer can reject', reviewerReject.record.status === 'rejected' && reviewerReject.result?.acceptedArtifacts.length === 0, { reviewerReject }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'alpha-e2e', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
