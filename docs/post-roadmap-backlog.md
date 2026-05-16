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
25-31. UI runtime implementation phase — implemented
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

Status: done, PR #56.

Outcome:

```text
Panel-level job-state visibility, controlled worker manifest visibility, external runtime envelope clarity, memory/context continuity visibility, artifact registry visibility and operator action copy improvements are documented in docs/ui-runtime-adapter-polish.md.
Implementation should proceed as focused follow-up PRs.
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

## Guardrails for the next phase

```text
Keep real-runtime wiring behind explicit operator choices.
Keep work request envelopes minimal.
Keep sensitive values out of envelopes by default.
Keep memory packets summary/ref based.
Keep runtime output behind response-shape validation.
Keep network development exposure opt-in.
```

## Recommended next phase

```text
1. Review the runtime panel implementation in real UI usage.
2. Decide first external runtime integration path.
3. Prefer operator-run result ingestion before direct runtime mode.
4. Add focused verification for any new result-ingestion path.
```

## Completion rule

Each future item should update this file or create a follow-up backlog before merge:

```text
state the implementation target
state verification commands
keep any new follow-up as a lower-priority backlog entry
```