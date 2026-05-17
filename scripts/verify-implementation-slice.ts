import { runProviderVerticalSlice } from '../src/implementation/providerVerticalSlice.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

function hasEvent(events: { event: string }[], eventName: string) {
  return events.some((item) => item.event === eventName);
}

const happy = runProviderVerticalSlice('happy_path');
const blocked = runProviderVerticalSlice('missing_source_refs');
const fallback = runProviderVerticalSlice('fallback_path');

const assertions: Check[] = [
  check('happy path reaches accepted status', happy.status === 'accepted', { status: happy.status }),
  check('happy path produces exactly one accepted artifact', happy.acceptedArtifacts.length === 1, { acceptedArtifacts: happy.acceptedArtifacts }),
  check('happy path keeps accepted artifact source refs', Boolean(happy.acceptedArtifacts[0]?.sourceRefs.length), { acceptedArtifacts: happy.acceptedArtifacts }),
  check('happy path records review decision before accepted artifact event', hasEvent(happy.events, 'review_decision_recorded') && hasEvent(happy.events, 'accepted_artifact_recorded'), { events: happy.events }),
  check('happy path has disposition', happy.disposition?.disposition === 'accept_after_review', { disposition: happy.disposition }),

  check('missing source refs are blocked', blocked.status === 'blocked', { status: blocked.status, reason: blocked.reason }),
  check('blocked path has no run request', !blocked.runRequest, { runRequest: blocked.runRequest }),
  check('blocked path produces no accepted artifacts', blocked.acceptedArtifacts.length === 0, { acceptedArtifacts: blocked.acceptedArtifacts }),
  check('blocked path records blocked event', hasEvent(blocked.events, 'provider_run_blocked'), { events: blocked.events }),

  check('fallback path uses fallback status', fallback.status === 'fallback_used', { status: fallback.status, reason: fallback.reason }),
  check('fallback path creates no accepted provider artifact', fallback.acceptedArtifacts.length === 0, { acceptedArtifacts: fallback.acceptedArtifacts }),
  check('fallback path records fallback event', hasEvent(fallback.events, 'fallback_recorded'), { events: fallback.events }),
  check('fallback path has fallback disposition', fallback.disposition?.disposition === 'use_fallback_result', { disposition: fallback.disposition }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'implementation-slice', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
