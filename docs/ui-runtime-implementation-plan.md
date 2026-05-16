# UI Runtime Implementation Plan

This document turns the UI/runtime adapter polish checklist into an implementation plan.

It starts after:

```text
15/15 adapter/runtime roadmap completed
16-24 post-roadmap hardening completed
UI/runtime adapter polish checklist documented
```

## Goal

Make the runtime adapter stack operator-friendly before real external runtime wiring.

The implementation should let an operator inspect, export and understand:

```text
job state
artifact registry
controlled worker manifest
external runtime mode
memory/context carry-forward preview
runtime adapter actions
```

## Non-goals

```text
Do not wire direct external runtime invocation in this phase.
Do not add repository mutation controls in this phase.
Do not persist raw runtime logs into memory/context views.
Do not make network dev exposure the default.
```

## Implementation sequence

```text
25. Job State card + Export job state
26. Artifact Registry card
27. Controlled Worker manifest preview/export
28. External Runtime Mode explanation card
29. Memory/Context preview/export
30. Operator action label polish
31. First real external runtime wiring decision gate
```

## 25. Job State card + Export job state

### Objective

Expose runtime job state as a first-class operator view instead of forcing the operator to read raw response JSON.

### Scope

```text
Add Job State card to RuntimeAdapterPanel or adjacent runtime UI.
Show job_id, request_id, provider_id, target_worker and status.
Show started_at and last_event_at when available.
Show event_count, artifact_count, error_count and callback counters.
Add Export job state button.
```

### Acceptance criteria

```text
Operator can inspect job state without reading raw runtime response JSON.
Operator can export job state as JSON.
The exported state is derived from verified runtime adapter state.
No raw callback payload is persisted as memory-ready content.
```

### Verification

```bash
npm run build
npm run check:generated
```

If a focused UI verification is added later:

```text
verify:runtime-panel-job-state
```

## 26. Artifact Registry card

### Objective

Make runtime artifacts visible as structured refs instead of hiding them inside event JSON.

### Scope

```text
Add Artifact Registry card.
Show artifact kind, ref, step_id and summary.
Group artifacts by step_id.
Show artifact count.
Add Export artifact registry button.
```

### Acceptance criteria

```text
Operator can find generated artifacts without reading raw event JSON.
Artifact summaries stay compact and ref-based.
Repeated artifacts remain distinguishable.
Exported registry matches runtime artifact registry shape.
```

### Verification

```bash
npm run verify:artifacts
npm run build
npm run check:generated
```

## 27. Controlled Worker manifest preview/export

### Objective

Let the operator inspect controlled worker actions before dispatch.

### Scope

```text
Add controlled worker manifest preview.
Show allowed actions.
Show selected step_id and output_kind.
Show manifest action count.
Add Export controlled worker manifest button.
Keep execution behind explicit dispatch/provider choice.
```

### Acceptance criteria

```text
Operator sees which actions would run before dispatch.
Operator can export manifest for review.
Manifest uses allowlisted actions only.
No external runtime is implied by the preview.
```

### Verification

```bash
npm run verify:controlled-worker
npm run build
npm run check:generated
```

## 28. External Runtime Mode explanation card

### Objective

Prevent confusion between envelope generation and real external execution.

### Scope

```text
Add External Runtime Mode card.
Show current supported mode: envelope-only.
Show future planned modes: operator-run and direct-run.
Show direct invocation as unavailable unless explicitly implemented later.
Link or reference integration plan docs.
```

### Acceptance criteria

```text
Operator cannot confuse envelope export with actual external execution.
Operator sees that direct invocation is not enabled.
Operator sees which documents define future wiring rules.
```

### Verification

```bash
npm run verify:oh-adapter
npm run verify:ca-adapter
npm run build
npm run check:generated
```

## 29. Memory/Context preview/export

### Objective

Show what will be carried forward after review and memory/context hardening.

### Scope

```text
Add Memory/Context Preview card.
Show accepted decisions count.
Show blocker count.
Show artifact summary count.
Show open question count.
Add Export memory/context preview button when packets are available.
Make clear that raw runtime payloads are excluded.
```

### Acceptance criteria

```text
Operator can inspect carry-forward state before persistence.
Raw runtime payloads are not displayed as memory-ready content.
Exported preview follows memory/context packet hardening behavior.
```

### Verification

```bash
npm run verify:review-hardening
npm run verify:memory-context
npm run build
npm run check:generated
```

## 30. Operator action label polish

### Objective

Make runtime panel actions clearer and safer for operators.

### Scope

Rename or clarify labels:

```text
Dispatch adapter → Dispatch configured adapter
Simulate callback → Simulate mock callback
Replay last callback → Replay last callback / dedupe check
Export response → Export adapter response
Export callback → Export runtime callback
```

Add helper copy where needed:

```text
Health check does not dispatch work.
Envelope export does not invoke external runtime.
Replay callback tests dedupe behavior.
```

### Acceptance criteria

```text
Operator can infer whether an action dispatches work, simulates a callback or exports data.
Labels are consistent with runtime security policy.
```

### Verification

```bash
npm run build
npm run check:generated
```

## 31. First real external runtime wiring decision gate

### Objective

Decide whether the next implementation should wire OpenHands, Code Agent, or continue with local controlled worker actions.

### Required inputs

```text
docs/runtime-security-policy.md
docs/openhands-real-integration-plan.md
docs/code-agent-real-integration-plan.md
docs/ui-runtime-adapter-polish.md
this implementation plan
```

### Decision criteria

```text
operator approval UI exists
job state visibility exists
artifact registry visibility exists
memory/context preview exists
controlled worker manifest preview exists
external runtime mode is clearly communicated
runtime output validation path is clear
```

### Recommended default decision

```text
Do not wire direct external runtime first.
Implement operator-run result file ingestion before direct invocation.
```

### Candidate next PRs

```text
OpenHands operator-run result ingestion
Code Agent operator-run result ingestion
Controlled worker action expansion
Runtime Panel implementation completion
```

## Suggested PR breakdown

```text
PR A — Job State card + export
PR B — Artifact Registry card
PR C — Controlled Worker manifest preview/export
PR D — External Runtime Mode card
PR E — Memory/Context preview/export
PR F — Operator action label polish
PR G — Decision gate docs update
```

## File impact forecast

Likely files:

```text
src/RuntimeAdapterPanel.tsx
src/runtimeAdapter.ts
src/runtimeArtifactRegistry.ts
src/memoryContextHardening.ts
server/controlled-worker-v2.ts
docs/ui-runtime-implementation-plan.md
docs/post-roadmap-backlog.md
package.json only if new verification scripts are added
```

## Completion rule

Each implementation PR should update this plan:

```text
mark the completed item as done
add the merged PR number
record any follow-up under the decision gate or a new backlog file
```
