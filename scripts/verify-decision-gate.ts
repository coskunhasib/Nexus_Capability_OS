import { evaluateDecisionGate } from '../src/decisionGate.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const open = evaluateDecisionGate({
  gate_id: 'gate.none',
  required: false,
  state: 'not_required',
});

const pending = evaluateDecisionGate({
  gate_id: 'gate.pending',
  required: true,
  state: 'do_pending',
});

const granted = evaluateDecisionGate({
  gate_id: 'gate.granted',
  required: true,
  state: 'do_granted',
  decided_by: 'operator',
  source_ref: 'review:gate-granted',
});

const badGrant = evaluateDecisionGate({
  gate_id: 'gate.bad-grant',
  required: true,
  state: 'do_granted',
});

const denied = evaluateDecisionGate({
  gate_id: 'gate.denied',
  required: true,
  state: 'do_denied',
  decided_by: 'operator',
  source_ref: 'review:gate-denied',
  reason: 'Missing required evidence.',
});

const badDeny = evaluateDecisionGate({
  gate_id: 'gate.bad-deny',
  required: true,
  state: 'do_denied',
  decided_by: 'operator',
  source_ref: 'review:gate-denied',
});

const badRequired = evaluateDecisionGate({
  gate_id: 'gate.bad-required',
  required: true,
  state: 'not_required',
});

const assertions = [
  assert('not required gate allows', open.valid && open.allowed, { open }),
  assert('pending gate does not allow', pending.valid && !pending.allowed, { pending }),
  assert('granted gate allows with trace', granted.valid && granted.allowed, { granted }),
  assert('granted gate without trace is invalid', !badGrant.valid && !badGrant.allowed, { badGrant }),
  assert('denied gate does not allow with reason', denied.valid && !denied.allowed, { denied }),
  assert('denied gate without reason is invalid', !badDeny.valid && !badDeny.allowed, { badDeny }),
  assert('required gate cannot be not_required', !badRequired.valid && !badRequired.allowed, { badRequired }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'decision-gate', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Decision gate verification failed.');
  process.exit(1);
}
