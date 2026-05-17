import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';
import type { Scenario } from '../src/contracts/verticalSliceContracts.ts';

type Expected = {
  status: string;
  reasonCode: string;
  lastState: string;
  acceptedCount: number;
};

const expectations: Record<Scenario, Expected> = {
  happy_path: { status: 'accepted', reasonCode: 'NONE', lastState: 'accepted', acceptedCount: 1 },
  missing_source_refs: { status: 'blocked', reasonCode: 'MISSING_SOURCE_REFS', lastState: 'blocked', acceptedCount: 0 },
  fallback_path: { status: 'fallback_used', reasonCode: 'FALLBACK_SELECTED', lastState: 'fallback_used', acceptedCount: 0 },
  review_reject_path: { status: 'rejected', reasonCode: 'REVIEW_REJECTED', lastState: 'rejected', acceptedCount: 0 },
  request_changes_path: { status: 'changes_requested', reasonCode: 'CHANGES_REQUESTED', lastState: 'changes_requested', acceptedCount: 0 },
  artifact_without_disposition: { status: 'blocked', reasonCode: 'MISSING_DISPOSITION', lastState: 'blocked', acceptedCount: 0 },
  missing_operator_ref: { status: 'blocked', reasonCode: 'MISSING_OPERATOR_REF', lastState: 'blocked', acceptedCount: 0 },
  artifact_outside_root: { status: 'blocked', reasonCode: 'ARTIFACT_OUTSIDE_ROOT', lastState: 'blocked', acceptedCount: 0 },
};

const assertions = Object.entries(expectations).map(([scenario, expected]) => {
  const result = runProviderVerticalSlice(scenario as Scenario);
  const actual = {
    status: result.status,
    reasonCode: result.reasonCode,
    lastState: result.stateHistory.at(-1) ?? 'none',
    acceptedCount: result.acceptedArtifacts.length,
  };
  return {
    scenario,
    pass:
      actual.status === expected.status &&
      actual.reasonCode === expected.reasonCode &&
      actual.lastState === expected.lastState &&
      actual.acceptedCount === expected.acceptedCount,
    expected,
    actual,
  };
});

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'vertical-slice-snapshot', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
