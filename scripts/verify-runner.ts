import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';
import { ControlledLocalRunner } from '../src/runtime/controlledRunner.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

const runner = new ControlledLocalRunner();
const happy = runProviderVerticalSlice('happy_path', runner);
const fallback = runProviderVerticalSlice('fallback_path', runner);
const outsideRoot = runProviderVerticalSlice('artifact_outside_root', runner);

const assertions: Check[] = [
  check('controlled runner is recorded', happy.runnerRef === 'controlled-local-runner-v1', { runnerRef: happy.runnerRef }),
  check('controlled happy path accepts after review', happy.status === 'accepted' && happy.acceptedArtifacts.length === 1, { happy }),
  check('controlled happy artifact stays under approved root', happy.acceptedArtifacts[0]?.sourceCandidateRef.startsWith('artifacts/provider-run-candidates/') === true, { acceptedArtifacts: happy.acceptedArtifacts }),
  check('controlled fallback produces no accepted artifact', fallback.status === 'fallback_used' && fallback.acceptedArtifacts.length === 0, { fallback }),
  check('controlled fallback records runner failure reason on normalized result', fallback.normalizedResult?.reasonCode === 'RUNNER_FAILURE', { normalizedResult: fallback.normalizedResult }),
  check('outside root remains blocked', outsideRoot.status === 'blocked' && outsideRoot.acceptedArtifacts.length === 0, { outsideRoot }),
  check('outside root reason preserved', outsideRoot.reasonCode === 'ARTIFACT_OUTSIDE_ROOT', { reasonCode: outsideRoot.reasonCode }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'runner-slice', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
