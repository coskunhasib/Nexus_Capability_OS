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
22. Generic runtime integration plan — done, PR #54
23. Code Agent integration plan — done, PR #55
24. UI/runtime adapter polish — done, PR #56
25-31. UI runtime implementation phase — implemented, PR #58
32. Operator-run result file ingestion plan — done, PR #59
33. Nexus data contract discovery — pending
34. Nexus canonical result envelope — pending
35. Nexus result ingestion prototype — pending
36. Shared result guard and fixtures — pending
37. Code Agent / custom agent mapping — pending
38. First runtime wiring decision PR — pending
```

## Priority buckets

```text
P0 — required before wiring real runtimes
P1 — required before operator-facing usage
P2 — important hardening or polish
P3 — optional quality-of-life
```

## Core correction

```text
Do not implement Nexus result ingestion by guessing hidden Nexus data.
Do not treat any third-party runtime as the source of truth.
Treat Nexus as the integration owner.
Build an explicit Nexus data contract first.
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

Status: done, PR #59.

Outcome:

```text
Operator-managed result file ingestion sequence is documented in docs/operator-run-result-ingestion-plan.md.
This plan is now superseded by the Nexus data contract roadmap before implementation.
```

### 33. Nexus data contract discovery

Status: pending.

Definition of done:

```text
Inventory all existing Nexus-facing types and samples.
Identify canonical, derived, temporary and UI-only fields.
Document unknowns without inventing data.
Create docs/nexus-data-contract-inventory.md.
```

### 34. Nexus canonical result envelope

Status: pending.

Definition of done:

```text
Define the smallest stable result envelope Nexus can accept from an operator-run process.
Create contract docs and completed/blocked fixtures only after discovery.
Do not finalize field names before item 33.
```

### 35. Nexus result ingestion prototype

Status: pending.

Definition of done:

```text
Normalize a validated Nexus operator result into nexus.runtime_adapter_response.
Completed result becomes accepted response.
Blocked result becomes failed response with step_blocked event.
Identity mismatch rejects before state mutation.
Invalid artifact refs reject before state mutation.
```

### 36. Shared result guard and fixtures

Status: pending.

Definition of done:

```text
Centralize reusable result-file validation.
Validate packet_type, version, identity, source, status, artifact array, notes, diagnostics and created_at.
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
Panel-level job-state visibility, controlled worker manifest visibility, runtime envelope clarity, memory/context continuity visibility, artifact registry visibility and operator action copy improvements are documented in docs/ui-runtime-adapter-polish.md.
Implementation should proceed as focused follow-up PRs.
```

### 37. Code Agent / custom agent mapping

Status: pending.

Definition of done:

```text
Map code-agent or custom-agent output into the Nexus canonical result envelope.
Do not let agent-specific output define the primary Nexus contract.
Add focused verification after the canonical envelope exists.
```

## P2 items

### 22. Generic runtime integration plan

Status: done, PR #54.

Outcome:

```text
Runtime prerequisites, request envelope handoff, expected result collection, failure modes and operator approvals are documented.
Direct runtime invocation remains intentionally unimplemented.
```

### 23. Code Agent integration plan

Status: done, PR #55.

Outcome:

```text
Supported agent kinds, prompt/workspace envelope mapping, expected artifact collection, failure modes and operator approvals are documented in docs/code-agent-real-integration-plan.md.
Direct runtime invocation remains intentionally unimplemented.
```

### 38. First runtime wiring decision PR

Status: pending.

Definition of done:

```text
Review Nexus data contract inventory, canonical result envelope, ingestion prototype, shared guard and agent mapping outcomes.
Choose first integration path.
Prefer operator-run ingestion before direct runtime mode.
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
31. First runtime wiring decision gate — documented
```

## Nexus data contract phase

Detailed plan:

```text
docs/nexus-data-contract-roadmap.md
```

Planned sequence:

```text
33. Nexus data contract discovery — pending
34. Nexus canonical result envelope — pending
35. Nexus result ingestion prototype — pending
36. Shared result guard and fixtures — pending
37. Code Agent / custom agent mapping — pending
38. First runtime wiring decision PR — pending
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
Do not guess missing Nexus data fields.
```

## Recommended next phase

```text
1. Discover the Nexus data contract.
2. Define the canonical Nexus result envelope.
3. Implement Nexus result ingestion against that contract.
4. Add shared validation guard.
5. Map agent/custom outputs into Nexus-owned envelope.
6. Decide first runtime integration path.
```

## Completion rule

Each future item should update this file or create a follow-up backlog before merge:

```text
state the implementation target
state verification commands
keep any new follow-up as a lower-priority backlog entry
```