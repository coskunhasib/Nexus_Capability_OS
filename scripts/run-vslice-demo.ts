import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';
import type { Scenario } from '../src/contracts/verticalSliceContracts.ts';

const scenarios: Scenario[] = ['happy_path', 'missing_source_refs', 'fallback_path', 'review_reject_path', 'request_changes_path', 'artifact_without_disposition', 'missing_operator_ref', 'artifact_outside_root'];

const output = scenarios.map((scenario) => {
  const result = runProviderVerticalSlice(scenario);
  return {
    scenario,
    status: result.status,
    runnerRef: result.runnerRef,
    stateHistory: result.stateHistory,
    acceptedArtifacts: result.acceptedArtifacts,
    eventNames: result.events.map((event) => event.event),
    reason: result.reason ?? '',
  };
});

console.log(JSON.stringify({ demo: 'vertical-slice', output }, null, 2));
