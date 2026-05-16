# Post-Roadmap Backlog

The adapter/runtime roadmap is complete at 15/15. This file tracks the next hardening cycle.

## Queue

```text
16. Final verification contract refresh — done, PR #48
17. Post-roadmap backlog — done, PR #49
18. Release notes / implementation summary — done, PR #50
19. Runtime security policy — done, PR #51
20. Dev command cleanup — done, PR #52
21. Local controlled worker v2 — done, PR #53
22. OpenHands real integration plan — done
23. Code Agent real integration plan — pending
24. UI/runtime adapter polish — pending
```

## Priority buckets

```text
P0 — required before wiring real runtimes
P1 — required before operator-facing usage
P2 — important hardening or polish
P3 — optional quality-of-life
```

## P0 items

### 16. Final verification contract refresh

Status: done, PR #48.

Outcome:

```text
The verification contract now reflects the completed 15/15 roadmap and the 16-24 hardening queue.
```

### 17. Post-roadmap backlog

Status: done, PR #49.

Outcome:

```text
16-24 queue is documented.
Priority buckets are explicit.
Real-runtime prerequisites are visible.
```

### 19. Runtime security policy

Status: done, PR #51.

Outcome:

```text
Runtime trust boundaries, sensitive-data handling rules, artifact/output rules, operator approval points, allowed worker actions and external-runtime constraints are documented in docs/runtime-security-policy.md.
```

### 21. Local controlled worker v2

Status: done, PR #53.

Outcome:

```text
Manifest-driven controlled worker path is implemented in server/controlled-worker-v2.ts.
Actions remain allowlisted.
Outputs are bounded.
Deterministic verification is available through npm run verify:controlled-worker.
Runtime events are produced from manifest action results.
```

## P1 items

### 18. Release notes / implementation summary

Status: done, PR #50.

Outcome:

```text
Implementation summary is documented in docs/release-notes.md.
Verification commands, safe boundaries, known limitations and next integration options are listed.
```

### 20. Dev command cleanup

Status: done, PR #52.

Outcome:

```text
Default dev remains local-safe.
Network/LAN dev is available through explicit opt-in command npm run dev:network.
Policy is documented in docs/dev-command-policy.md.
```

### 24. UI/runtime adapter polish

Status: pending.

Definition of done:

```text
Identify panel-level job-state export/display gaps.
Identify adapter result visibility gaps.
Identify unclear operator copy/actions.
Create focused implementation checklist.
```

## P2 items

### 22. OpenHands real integration plan

Status: done.

Outcome:

```text
Runtime prerequisites, request envelope handoff, expected result collection, failure modes and operator approvals are documented in docs/openhands-real-integration-plan.md.
Direct runtime invocation remains intentionally unimplemented.
```

### 23. Code Agent real integration plan

Status: pending.

Definition of done:

```text
Document supported agent kinds.
Document prompt/workspace envelope mapping.
Document expected artifact collection.
Document failure modes and operator approvals.
```

## Guardrails for the next phase

```text
Keep real-runtime wiring behind explicit operator choices.
Keep work request envelopes minimal.
Keep sensitive values out of envelopes by default.
Keep memory packets summary/ref based.
Keep runtime output behind response-shape validation.
Keep network development exposure opt-in.
```

## Recommended execution order

```text
23. Code Agent real integration plan
24. UI/runtime adapter polish
```

## Completion rule

Each item should update this file before merge:

```text
move item status from pending/in progress to done
add the merged PR number when available
keep any new follow-up as a lower-priority backlog entry
```