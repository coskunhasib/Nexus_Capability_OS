import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

function hasEvent(events: { event: string }[], eventName: string) {
  return events.some((item) => item.event === eventName);
}

function eventOrder(events: { event: string }[], first: string, second: string) {
  const names = events.map((item) => item.event);
  const firstIndex = names.indexOf(first);
  const secondIndex = names.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

const happy = runProviderVerticalSlice('happy_path');
const blocked = runProviderVerticalSlice('missing_source_refs');
const fallback = runProviderVerticalSlice('fallback_path');
const rejected = runProviderVerticalSlice('review_reject_path');
const changes = runProviderVerticalSlice('request_changes_path');
const noDisposition = runProviderVerticalSlice('artifact_without_disposition');
const noOperator = runProviderVerticalSlice('missing_operator_ref');
const outsideRoot = runProviderVerticalSlice('artifact_outside_root');

const assertions: Check[] = [
  check('happy path accepted', happy.status === 'accepted', { status: happy.status }),
  check('happy path has one accepted artifact', happy.acceptedArtifacts.length === 1, { acceptedArtifacts: happy.acceptedArtifacts }),
  check('happy path keeps source refs', Boolean(happy.acceptedArtifacts[0]?.sourceRefs.length), { acceptedArtifacts: happy.acceptedArtifacts }),
  check('happy path records review before accepted artifact', eventOrder(happy.events, 'review_decision_recorded', 'accepted_artifact_recorded'), { events: happy.events }),
  check('happy path has accepted disposition', happy.disposition?.disposition === 'accept_after_review', { disposition: happy.disposition }),

  check('missing source refs are blocked', blocked.status === 'blocked', { status: blocked.status, reason: blocked.reason }),
  check('blocked path has no run request', !blocked.runRequest, { runRequest: blocked.runRequest }),
  check('blocked path has no accepted artifacts', blocked.acceptedArtifacts.length === 0, { acceptedArtifacts: blocked.acceptedArtifacts }),
  check('blocked path records blocked event', hasEvent(blocked.events, 'provider_run_blocked'), { events: blocked.events }),

  check('fallback path uses fallback status', fallback.status === 'fallback_used', { status: fallback.status, reason: fallback.reason }),
  check('fallback path has no accepted provider artifact', fallback.acceptedArtifacts.length === 0, { acceptedArtifacts: fallback.acceptedArtifacts }),
  check('fallback path records fallback event', hasEvent(fallback.events, 'fallback_recorded'), { events: fallback.events }),
  check('fallback path has fallback disposition', fallback.disposition?.disposition === 'use_fallback_result', { disposition: fallback.disposition }),

  check('review reject path is rejected', rejected.status === 'rejected', { status: rejected.status }),
  check('review reject path has no accepted artifacts', rejected.acceptedArtifacts.length === 0, { acceptedArtifacts: rejected.acceptedArtifacts }),
  check('review reject path has reject disposition', rejected.disposition?.disposition === 'reject_candidate', { disposition: rejected.disposition }),

  check('request changes path is changes requested', changes.status === 'changes_requested', { status: changes.status }),
  check('request changes path has no accepted artifacts', changes.acceptedArtifacts.length === 0, { acceptedArtifacts: changes.acceptedArtifacts }),
  check('request changes path has revision disposition', changes.disposition?.disposition === 'request_revision', { disposition: changes.disposition }),

  check('artifact without disposition cannot be accepted', noDisposition.status === 'blocked' && noDisposition.acceptedArtifacts.length === 0, { status: noDisposition.status, acceptedArtifacts: noDisposition.acceptedArtifacts }),
  check('missing operator ref cannot be accepted', noOperator.status === 'blocked' && noOperator.acceptedArtifacts.length === 0, { status: noOperator.status, reviewDecision: noOperator.reviewDecision }),
  check('artifact outside root cannot be accepted', outsideRoot.status === 'blocked' && outsideRoot.acceptedArtifacts.length === 0, { status: outsideRoot.status, artifactRefs: outsideRoot.normalizedResult?.artifactRefs }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'vertical-slice', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
