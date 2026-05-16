# Post-Roadmap Backlog

The adapter/runtime roadmap is complete at 15/15. This file tracks the next hardening cycle.

## Queue

```text
16. Final verification contract refresh — done, PR #48
17. Post-roadmap backlog — done, PR #49
18. Release notes / implementation summary — done
19. Runtime security policy — pending
20. Dev command cleanup — pending
21. Local controlled worker v2 — pending
22. OpenHands real integration plan — pending
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

Status: pending.

Definition of done:

```text
Document trust boundaries.
Document sensitive-data handling rules.
Document artifact and output-directory rules.
Document operator approval points.
Document allowed worker actions.
Document external-runtime constraints.
```

### 21. Local controlled worker v2

Status: pending.

Definition of done:

```text
Add a manifest-driven worker path.
Keep actions allowlisted.
Keep output bounded.
Add deterministic verification.
Produce runtime events from action results.
```

## P1 items

### 18. Release notes / implementation summary

Status: done.

Outcome:

```text
Implementation summary is documented in docs/release-notes.md.
Verification commands, safe boundaries, known limitations and next integration options are listed.
```

### 20. Dev command cleanup

Status: pending.

Definition of done:

```text
Default dev command remains local-safe.
Network/LAN dev command is explicit and opt-in if supported.
Document local dev versus network dev.
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

Status: pending.

Definition of done:

```text
Document runtime prerequisites.
Document request envelope handoff shape.
Document expected result collection.
Document failure modes and operator approvals.
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
19. Runtime security policy
20. Dev command cleanup
21. Local controlled worker v2
22. OpenHands real integration plan
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
