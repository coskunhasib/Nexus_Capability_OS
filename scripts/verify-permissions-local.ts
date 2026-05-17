import { localAdminIdentity, localReviewerIdentity } from '../src/auth/localIdentity.ts';
import { runReviewActionWithIdentity } from '../src/review/reviewActions.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

const adminAccept = runReviewActionWithIdentity({ action: 'accept_candidate', operatorRef: 'operator.local' }, localAdminIdentity);
const reviewerAccept = runReviewActionWithIdentity({ action: 'accept_candidate', operatorRef: 'operator.reviewer' }, localReviewerIdentity);
const missingIdentity = runReviewActionWithIdentity({ action: 'accept_candidate', operatorRef: '' }, undefined);
const reviewerReject = runReviewActionWithIdentity({ action: 'reject_candidate', operatorRef: 'operator.reviewer' }, localReviewerIdentity);

const assertions: Check[] = [
  check('admin can accept', adminAccept.record.status === 'accepted' && adminAccept.result?.acceptedArtifacts.length === 1, { outcome: adminAccept }),
  check('reviewer cannot accept', reviewerAccept.record.status === 'blocked' && reviewerAccept.record.reasonCode === 'PERMISSION_DENIED', { outcome: reviewerAccept }),
  check('reviewer accept writes no snapshot record', reviewerAccept.snapshot.records.length === 0, { snapshot: reviewerAccept.snapshot }),
  check('missing identity cannot accept', missingIdentity.record.status === 'blocked' && missingIdentity.record.reasonCode === 'PERMISSION_DENIED', { outcome: missingIdentity }),
  check('missing identity writes no snapshot record', missingIdentity.snapshot.records.length === 0, { snapshot: missingIdentity.snapshot }),
  check('reviewer can reject', reviewerReject.record.status === 'rejected' && reviewerReject.result?.acceptedArtifacts.length === 0, { outcome: reviewerReject }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'local-permissions', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
