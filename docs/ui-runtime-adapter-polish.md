# UI / Runtime Adapter Polish

This checklist closes post-roadmap item 24.

The adapter/runtime architecture is now verified, but the operator-facing UI still needs a focused polish pass before real runtime wiring becomes comfortable to use.

## Current UI baseline

`RuntimeAdapterPanel` already supports:

```text
provider selection
mock / dry_run / real dispatch mode selection
HTTP endpoint configuration
health check
retry policy
runtime adapter request export
runtime adapter response export
runtime callback export
callback simulation
callback replay / dedupe visibility
basic runtime event counters
```

## Main polish gaps

### 1. Job state visibility

Current state:

```text
The runtime job state model is implemented and verified in the runtime layer.
The panel shows response summary and callback counters.
```

Gap:

```text
The panel does not yet expose a dedicated job-state view/export.
It does not show job lifecycle as a first-class object separate from raw response/callback exports.
```

Recommended implementation:

```text
Add Job State card.
Show job_id, provider_id, target_worker, status, started_at, last_event_at.
Show event_count, artifact_count, error_count and callback counters.
Add Export job state button.
```

Acceptance criteria:

```text
Operator can inspect job state without reading raw response JSON.
Operator can export job state as JSON.
Job state view remains derived from verified runtime adapter state.
```

### 2. Controlled worker v2 visibility

Current state:

```text
Controlled worker v2 is implemented and verified.
The panel does not yet expose controlled-worker manifest authoring or preview.
```

Gap:

```text
Operator cannot build or inspect a controlled worker manifest from the UI.
```

Recommended implementation:

```text
Add controlled worker manifest preview.
Show allowed actions.
Show selected step_id and output_kind.
Add Export controlled worker manifest button.
Keep execution behind explicit dispatch mode / provider choice.
```

Acceptance criteria:

```text
Operator sees which actions will run before dispatch.
Operator can export manifest for review.
Manifest action list is allowlist-based.
```

### 3. External runtime envelope clarity

Current state:

```text
OpenHands and Code Agent adapters are envelope/normalization layers.
Direct runtime invocation is intentionally not implemented.
```

Gap:

```text
The UI does not clearly explain envelope-only versus operator-run versus future direct-run modes.
```

Recommended implementation:

```text
Add External Runtime Mode card.
Show envelope-only as current supported mode.
Show operator-run and direct-run as planned future modes.
Show warning that direct runtime invocation is not enabled.
```

Acceptance criteria:

```text
Operator cannot confuse envelope export with actual external execution.
Operator sees that direct invocation is not currently available.
```

### 4. Memory/context continuity visibility

Current state:

```text
Memory/context packet hardening is implemented and verified.
Runtime response and callback exports are available.
```

Gap:

```text
Operator cannot easily see what would be carried into memory/context after runtime and review hardening.
```

Recommended implementation:

```text
Add Memory/Context Preview card.
Show accepted decisions count, blocker count, artifact summary count and open question count after review hardening.
Add Export memory/context preview when available.
```

Acceptance criteria:

```text
Operator can inspect carry-forward state before persistence.
Raw runtime payloads are not displayed as memory-ready content.
```

### 5. Artifact registry visibility

Current state:

```text
Artifact registry is implemented and verified.
Panel shows event types and export buttons.
```

Gap:

```text
Artifact refs are not first-class in the panel.
```

Recommended implementation:

```text
Add Artifact Registry card.
Show artifact kind, ref, step_id and summary.
Group artifacts by step_id.
Add Export artifact registry button.
```

Acceptance criteria:

```text
Operator can find generated artifacts without reading raw event JSON.
Artifact summaries remain compact and ref-based.
```

### 6. Operator action labels

Current state:

```text
The panel has Reset config, Health check, Dispatch adapter, Simulate callback and Replay last callback.
```

Gap:

```text
Some labels do not make the safety boundary obvious.
```

Recommended copy improvements:

```text
Dispatch adapter → Dispatch configured adapter
Simulate callback → Simulate mock callback
Replay last callback → Replay last callback / dedupe check
Export response → Export adapter response
Export callback → Export runtime callback
```

Acceptance criteria:

```text
Operator can infer whether an action dispatches real work, simulates a callback or exports data.
```

## Suggested implementation order

```text
1. Add job-state view/export.
2. Add artifact registry card.
3. Add controlled worker manifest preview/export.
4. Add external runtime mode explanation card.
5. Add memory/context preview/export.
6. Rename unclear operator actions.
```

## Non-goals for the UI polish pass

```text
Do not wire direct external runtime invocation.
Do not add repository mutation controls.
Do not persist raw runtime logs into memory/context views.
Do not make network dev exposure the default.
```

## Verification expectations

Future UI implementation PRs should keep the existing chain green:

```bash
npm run build
npm run check:generated
```

If new generated fixtures are added, they must be covered by the generated artifact guard.

## Completion state

This document completes the planning/checklist portion of UI/runtime adapter polish. Implementation can proceed as focused follow-up PRs using the checklist above.
