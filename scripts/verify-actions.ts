import { runReviewAction } from '../src/review/reviewActions.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

const a = runReviewAction({ action: 'accept_candidate', operatorRef: 'operator.local' });
const r = runReviewAction({ action: 'reject_candidate', operatorRef: 'operator.local' });
const c = runReviewAction({ action: 'request_changes', operatorRef: 'operator.local' });
const f = runReviewAction({ action: 'use_fallback', operatorRef: 'operator.local' });

const assertions: Check[] = [
  check('a status', a.record.status === 'accepted', { record: a.record }),
  check('a artifact count', a.result.acceptedArtifacts.length === 1, { count: a.result.acceptedArtifacts.length }),
  check('a snapshot', a.snapshot.records.length === 1 && a.snapshot.records[0]?.acceptedArtifacts.length === 1, { snapshot: a.snapshot }),

  check('r status', r.record.status === 'rejected', { record: r.record }),
  check('r count', r.result.acceptedArtifacts.length === 0, { count: r.result.acceptedArtifacts.length }),
  check('r reason', r.snapshot.records[0]?.reasonCode === 'REVIEW_REJECTED', { snapshot: r.snapshot }),

  check('c status', c.record.status === 'changes_requested', { record: c.record }),
  check('c count', c.result.acceptedArtifacts.length === 0, { count: c.result.acceptedArtifacts.length }),
  check('c reason', c.snapshot.records[0]?.reasonCode === 'CHANGES_REQUESTED', { snapshot: c.snapshot }),

  check('f status', f.record.status === 'fallback_used', { record: f.record }),
  check('f count', f.result.acceptedArtifacts.length === 0, { count: f.result.acceptedArtifacts.length }),
  check('f reason', f.snapshot.records[0]?.reasonCode === 'FALLBACK_SELECTED', { snapshot: f.snapshot }),

  check('operator ref', [a, r, c, f].every((outcome) => outcome.record.operatorRef === 'operator.local'), {
    records: [a.record, r.record, c.record, f.record],
  }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'actions', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
