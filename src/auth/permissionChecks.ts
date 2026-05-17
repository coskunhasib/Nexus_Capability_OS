import type { ReviewAction } from '../review/reviewContracts';
import type { LocalOperatorIdentity } from './localIdentity';

export function canRunReviewAction(identity: LocalOperatorIdentity | undefined, action: ReviewAction) {
  return Boolean(identity?.operatorRef.trim()) && Boolean(identity?.allowedActions.includes(action));
}

export function permissionReason(identity: LocalOperatorIdentity | undefined, action: ReviewAction) {
  if (!identity?.operatorRef.trim()) return 'Missing local operator identity.';
  if (!identity.allowedActions.includes(action)) return `Operator ${identity.operatorRef} cannot run ${action}.`;
  return '';
}
