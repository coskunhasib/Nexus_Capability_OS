import { runProviderVerticalSlice } from '../providerVerticalSlice';
import { InMemorySliceStore } from '../storage/localStore';
import { toStoredSliceRecord } from '../storage/storageContracts';
import type { Scenario } from '../contracts/verticalSliceContracts';
import type { ReviewAction, ReviewActionInput, ReviewActionOutcome, ReviewActionRecord } from './reviewContracts';

function scenarioForAction(action: ReviewAction): Scenario {
  if (action === 'reject_candidate') return 'review_reject_path';
  if (action === 'request_changes') return 'request_changes_path';
  if (action === 'use_fallback') return 'fallback_path';
  return 'happy_path';
}

export function runReviewAction(input: ReviewActionInput): ReviewActionOutcome {
  const scenario = scenarioForAction(input.action);
  const result = runProviderVerticalSlice(scenario);
  const store = new InMemorySliceStore();
  store.save(toStoredSliceRecord(result));

  const record: ReviewActionRecord = {
    actionId: `review-action-${scenario}`,
    action: input.action,
    operatorRef: input.operatorRef,
    scenario,
    status: result.status,
    reasonCode: result.reasonCode,
  };

  return {
    record,
    result,
    snapshot: store.snapshot(),
  };
}
