import { canRunReviewAction, permissionReason } from '../auth/permissionChecks';
import type { LocalOperatorIdentity } from '../auth/localIdentity';
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
  return runReviewActionWithIdentity(input, { operatorRef: input.operatorRef, allowedActions: ['accept_candidate', 'reject_candidate', 'request_changes', 'use_fallback'] });
}

export function runReviewActionWithIdentity(input: ReviewActionInput, identity?: LocalOperatorIdentity): ReviewActionOutcome {
  const scenario = scenarioForAction(input.action);
  const store = new InMemorySliceStore();

  if (!canRunReviewAction(identity, input.action)) {
    const record: ReviewActionRecord = {
      actionId: `review-action-${scenario}`,
      action: input.action,
      operatorRef: identity?.operatorRef ?? input.operatorRef,
      scenario,
      status: 'blocked',
      reasonCode: 'PERMISSION_DENIED',
    };
    return { record, snapshot: store.snapshot() };
  }

  const result = runProviderVerticalSlice(scenario);
  store.save(toStoredSliceRecord(result));

  const record: ReviewActionRecord = {
    actionId: `review-action-${scenario}`,
    action: input.action,
    operatorRef: identity?.operatorRef ?? input.operatorRef,
    scenario,
    status: result.status,
    reasonCode: result.reasonCode,
  };

  if (permissionReason(identity, input.action)) {
    return {
      record: { ...record, status: 'blocked', reasonCode: 'PERMISSION_DENIED' },
      snapshot: store.snapshot(),
    };
  }

  return {
    record,
    result,
    snapshot: store.snapshot(),
  };
}
