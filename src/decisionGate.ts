export type DecisionGateState = 'not_required' | 'do_pending' | 'do_granted' | 'do_denied';

export type DecisionGate = {
  gate_id: string;
  required: boolean;
  state: DecisionGateState;
  decided_by?: string;
  source_ref?: string;
  reason?: string;
};

export type DecisionGateResult = {
  allowed: boolean;
  valid: boolean;
  errors: string[];
  reason: string;
};

function hasText(value: unknown) {
  return typeof value === 'string' && Boolean(value.trim());
}

export function evaluateDecisionGate(gate: DecisionGate): DecisionGateResult {
  const errors: string[] = [];
  if (!hasText(gate.gate_id)) errors.push('gate_id must be non-empty');
  if (typeof gate.required !== 'boolean') errors.push('required must be boolean');

  if (!gate.required && gate.state === 'not_required') {
    return { allowed: errors.length === 0, valid: errors.length === 0, errors, reason: 'gate not required' };
  }

  if (gate.required && gate.state === 'not_required') {
    errors.push('required gate cannot be not_required');
  }

  if (gate.state === 'do_pending') {
    return { allowed: false, valid: errors.length === 0, errors, reason: 'gate pending' };
  }

  if (gate.state === 'do_granted') {
    if (!hasText(gate.decided_by)) errors.push('granted gate requires decided_by');
    if (!hasText(gate.source_ref)) errors.push('granted gate requires source_ref');
    return { allowed: errors.length === 0, valid: errors.length === 0, errors, reason: errors.length === 0 ? 'gate granted' : 'gate invalid' };
  }

  if (gate.state === 'do_denied') {
    if (!hasText(gate.decided_by)) errors.push('denied gate requires decided_by');
    if (!hasText(gate.source_ref)) errors.push('denied gate requires source_ref');
    if (!hasText(gate.reason)) errors.push('denied gate requires reason');
    return { allowed: false, valid: errors.length === 0, errors, reason: errors.length === 0 ? gate.reason as string : 'gate invalid' };
  }

  return { allowed: false, valid: false, errors: [...errors, 'unknown gate state'], reason: 'gate invalid' };
}
