import type { SliceState } from '../contracts/verticalSliceContracts';

const allowed: Record<SliceState, SliceState[]> = {
  created: ['prepared', 'blocked'],
  prepared: ['running'],
  running: ['normalized', 'fallback_used', 'blocked'],
  normalized: ['reviewed'],
  reviewed: ['disposed', 'changes_requested', 'rejected', 'fallback_used'],
  disposed: ['accepted', 'blocked', 'fallback_used', 'changes_requested', 'rejected'],
  accepted: [],
  blocked: [],
  fallback_used: [],
  changes_requested: [],
  rejected: [],
};

export class StateFlow {
  private readonly states: SliceState[] = ['created'];

  move(next: SliceState) {
    const current = this.states[this.states.length - 1];
    if (!allowed[current].includes(next)) {
      throw new Error(`Invalid state transition: ${current} -> ${next}`);
    }
    this.states.push(next);
  }

  history() {
    return [...this.states];
  }
}

export function isValidStateHistory(history: SliceState[]) {
  if (history[0] !== 'created') return false;
  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1];
    const current = history[index];
    if (!allowed[previous].includes(current)) return false;
  }
  return true;
}
