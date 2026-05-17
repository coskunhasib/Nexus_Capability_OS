import type { ReviewAction } from '../review/reviewContracts';

export type LocalOperatorIdentity = {
  operatorRef: string;
  allowedActions: ReviewAction[];
};

export const localAdminIdentity: LocalOperatorIdentity = {
  operatorRef: 'operator.local',
  allowedActions: ['accept_candidate', 'reject_candidate', 'request_changes', 'use_fallback'],
};

export const localReviewerIdentity: LocalOperatorIdentity = {
  operatorRef: 'operator.reviewer',
  allowedActions: ['reject_candidate', 'request_changes'],
};
