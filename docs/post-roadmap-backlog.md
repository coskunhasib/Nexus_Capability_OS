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
22. OpenHands real integration plan — done, PR #54
23. Code Agent real integration plan — done, PR #55
24. UI/runtime adapter polish — done, PR #56
25-31. UI runtime implementation phase — implemented, PR #58
32. Operator-run result file ingestion plan — done
33. OpenHands operator-run result ingestion — pending
34. Code Agent operator-run result ingestion — pending
35. Result schema + validation guard — pending
36. First external runtime wiring decision PR — pending
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

### 32. Operator-run result file ingestion plan

Status: done.

Outcome:

```text
Operator-managed result file ingestion sequence is documented in docs/operator-run-result-ingestion-plan.md.
The next phase proves result validation and normalization before direct runtime mode is considered.
```

### 35. Result schema + validation guard

Status: pending.

Definition of done:

```text
Centralize shared result-file validation.
Add shared guard helpers.
Ensure OpenHands and Code Agent fixtures pass the same base guard.
Reject invalid shapes before state mutation.
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

Status: done, PR #56.

Outcome:

```text
Panel-level job-state visibility, controlled worker manifest visibility, external runtime envelope clarity, memory/context continuity visibility, artifact registry visibility and operator action copy improvements are documented in docs/ui-runtime-adapter-polish.md.
Implementation should proceed as focused follow-up PRs.
```

### 33. OpenHands operator-run result ingestion

Status: pending.

Definition of done:

```text
Add OpenHands operator-run result fixture shape.
Add completed and blocked fixtures.
Normalize fixtures through the existing OpenHands adapter normalizer.
Keep direct runtime mode disabled.
Add focused verification.
```

### 34. Code Agent operator-run result ingestion

Status: pending.

Definition of done:

```text
Add Code Agent operator-run result fixture shape.
Include agent_kind.
Add completed and blocked fixtures for supported agent kinds.
Normalize fixtures through the existing Code Agent adapter normalizer.
Keep direct runtime mode disabled.
Add focused verification.
```

## P2 items

### 22. OpenHands real integration plan

Status: done, PR #54.

Outcome:

```text
Runtime prerequisites, request envelope handoff, expected result collection, failure modes and operator approvals are documented in docs/openhands-real-integration-plan.md.
Direct runtime invocation remains intentionally unimplemented.
```

### 23. Code Agent real integration plan

Status: done, PR #55.

Outcome:

```text
Supported agent kinds, prompt/workspace envelope mapping, expected artifact collection, failure modes and operator approvals are documented in docs/code-agent-real-integration-plan.md.
Direct runtime invocation remains intentionally unimplemented.
```

### 36. First external runtime wiring decision PR

Status: pending.

Definition of done:

```text
Review operator-run result ingestion outcomes.
Choose first integration path.
Prefer operator-run result ingestion before direct runtime mode.
Document the final decision and verification requirements.
```

## UI implementation phase

Detailed implementation state:

```text
docs/ui-runtime-implementation-plan.md
```

Implemented sequence:

```text
25. Job State card + Export job state — implemented
26. Artifact Registry card — implemented
27. Controlled Worker manifest preview/export — implemented
28. External Runtime Mode explanation card — implemented
29. Memory/Context preview/export — implemented
30. Operator action label polish — implemented
31. First external runtime wiring decision gate — documented
```

## Operator-run ingestion phase

Detailed plan:

```text
docs/operator-run-result-ingestion-plan.md
```

Planned sequence:

```text
32. Operator-run result file ingestion plan — done
33. OpenHands operator-run result ingestion — pending
34. Code Agent operator-run result ingestion — pending
35. Result schema + validation guard — pending
36. First external runtime wiring decision PR — pending
```

## Guardrails for the next phase

```text
Keep real-runtime wiring behind explicit operator choices.
Keep work request envelopes minimal.
Keep sensitive values out of envelopes by default.
Keep memory packets summary/ref based.
Keep runtime output behind response-shape validation.
Keep network development exposure opt-in.
Validate operator-run result files before state mutation.
```

## Recommended next phase

```text
1. Implement OpenHands operator-run result ingestion.
2. Implement Code Agent operator-run result ingestion.
3. Centralize result schema and validation guard.
4. Decide first external runtime integration path.
```

## Completion rule

Each future item should update this file or create a follow-up backlog before merge:

```text
state the implementation target
state verification commands
keep any new follow-up as a lower-priority backlog entry
```