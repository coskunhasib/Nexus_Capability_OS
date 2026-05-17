import type { NormalizedResult, ProviderRunRequest, Scenario, SliceRunner } from '../contracts/verticalSliceContracts';

function candidateRef(request: ProviderRunRequest) {
  return `${request.artifactRoot}controlled-candidate.patch`;
}

export class ControlledLocalRunner implements SliceRunner {
  runnerRef = 'controlled-local-runner-v1';

  run(request: ProviderRunRequest, scenario: Scenario): NormalizedResult {
    const traceRefs = [`trace/${request.runId}`, `trace/${request.runId}/controlled`];

    if (scenario === 'fallback_path') {
      return {
        resultId: `result-${request.runId}`,
        runRef: request.runId,
        status: 'fallback_used',
        summary: 'Controlled local runner selected fallback.',
        sourceRefs: request.sourceRefs,
        artifactRefs: [],
        traceRefs: [...traceRefs, `fallback/${request.fallbackRef}`],
        reason: 'Controlled local runner failure mapped to fallback.',
        reasonCode: 'RUNNER_FAILURE',
      };
    }

    return {
      resultId: `result-${request.runId}`,
      runRef: request.runId,
      status: 'candidate',
      summary: 'Controlled local runner produced bounded candidate output.',
      sourceRefs: request.sourceRefs,
      artifactRefs: [
        {
          kind: 'candidate_patch',
          ref: scenario === 'artifact_outside_root' ? 'tmp/outside-root/controlled.patch' : candidateRef(request),
          root: request.artifactRoot,
          summary: 'Controlled local candidate artifact.',
          candidateOnly: true,
        },
      ],
      traceRefs,
      reasonCode: scenario === 'artifact_outside_root' ? 'ARTIFACT_OUTSIDE_ROOT' : 'NONE',
    };
  }
}
