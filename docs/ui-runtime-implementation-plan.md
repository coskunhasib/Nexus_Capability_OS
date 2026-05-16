# UI Runtime Implementation Plan

This document tracks the operator-facing UI/runtime implementation phase after the completed roadmap and hardening sequence.

## Current state

```text
25. Job State card + Export job state — implemented
26. Artifact Registry card — implemented
27. Controlled Worker manifest preview/export — implemented
28. External Runtime Mode explanation card — implemented
29. Memory/Context preview/export — implemented
30. Operator action label polish — implemented
31. First external runtime decision gate — documented
```

## Goal

Make the runtime adapter stack easier to inspect before the next integration phase.

The Runtime Adapter Panel now gives operator visibility into:

```text
job state
artifact registry
controlled worker manifest preview
external runtime mode
memory/context carry-forward preview
runtime adapter actions
```

## Implemented scope

### 25. Job State card + Export job state

Implemented in:

```text
src/RuntimeAdapterPanel.tsx
```

The panel shows:

```text
job_id
request_id
provider_id
target_worker
status
started_at
last_event_at
event_count
artifact_count
error_count
callback counters
seen event key count
```

Export added:

```text
Export job state
```

### 26. Artifact Registry card

The panel now shows artifact refs collected from runtime events:

```text
artifact kind
artifact ref
step_id
summary
unique artifact count
repeated artifact count
step-level artifact counts
```

Export added:

```text
Export artifact registry
```

### 27. Controlled Worker manifest preview/export

The panel now builds a preview-only controlled worker manifest from the current task packet.

Visible fields:

```text
manifest_id
action count
allowlisted action kinds
step_id
output_kind
```

Export added:

```text
Export controlled worker manifest preview
```

### 28. External Runtime Mode explanation card

The panel now explains:

```text
current mode: envelope-only
future mode: operator-run
future mode: direct-run
current UI does not run an external runtime directly
```

### 29. Memory/Context preview/export

The panel now previews carry-forward state after review and memory/context hardening.

Visible counters:

```text
accepted decisions
runtime blockers
artifact summaries
open questions
release-ready / follow-up-required state
do-not-store rule id
```

Export added:

```text
Export memory/context preview
```

### 30. Operator action label polish

Updated labels:

```text
Dispatch configured adapter
Simulate mock callback
Replay last callback / dedupe check
Export runtime adapter request
Export adapter response
Export runtime callback
```

Helper copy clarifies:

```text
Health check does not dispatch work.
Envelope export does not run an external runtime.
Replay callback tests dedupe behavior.
```

### 31. First external runtime decision gate

Decision gate remains open for the next phase.

Before the next integration PR, the operator should be able to inspect:

```text
job state
artifact registry
memory/context preview
controlled worker manifest preview
external runtime mode
runtime output validation path
```

Recommended default next step:

```text
operator-run result file ingestion before direct runtime mode
```

## Verification

Required verification:

```bash
npm run build
npm run check:generated
```

Related focused checks:

```bash
npm run verify:artifacts
npm run verify:controlled-worker
npm run verify:review-hardening
npm run verify:memory-context
npm run verify:oh-adapter
npm run verify:ca-adapter
```

## Completion state

The 25-31 UI runtime implementation phase is implemented as a panel visibility and export pass.

The next phase should be a decision PR for the first external runtime integration path.
