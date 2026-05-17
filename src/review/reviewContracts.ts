import type { ReasonCode, Scenario, VerticalSliceResult } from '../contracts/verticalSliceContracts';
import type { StoreSnapshot } from '../storage/storageContracts';

export type ReviewAction = 'accept_candidate' | 'reject_candidate' | 'request_changes' | 'use_fallback';

export type ReviewActionInput = {
  action: ReviewAction;
  operatorRef: string;
};

export type ReviewActionRecord = {
  actionId: string;
  action: ReviewAction;
  operatorRef: string;
  scenario: Scenario;
  status: VerticalSliceResult['status'] | 'blocked';
  reasonCode: ReasonCode;
};

export type ReviewActionOutcome = {
  record: ReviewActionRecord;
  result?: VerticalSliceResult;
  snapshot: StoreSnapshot;
};
