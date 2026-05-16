# Minimum Real Worker Vertical Slice

The minimum real worker slice adds the first safe real-work execution path behind the runtime adapter contract.

It intentionally does **not** run arbitrary shell commands, edit repositories, call external coding agents or execute untrusted code.

## Boundary

```text
nexus.runtime_adapter_request dispatch.mode=real
→ local HTTP worker
→ allowlisted worker action
→ bounded artifact file
→ runtime bridge events
→ nexus.runtime_adapter_response
```

## Living code path

```text
server/real-worker-actions.ts
server/local-http-worker.ts
scripts/verify-real-worker-slice.ts
```

NPM script:

```bash
npm run verify:real-worker
```

## Allowlisted action

Current allowed action:

```text
write_step_artifact
```

The action writes one JSON artifact per work-order step into a bounded output directory.

Artifact payload includes:

```text
request_id
worker_id
step_id
step_title
owner
expected_outputs
required_gates
produced_by
produced_at
safety.arbitrary_command_execution = false
safety.allowlisted_action = write_step_artifact
safety.output_scope = bounded_output_directory
```

## Runtime events

For each work-order step the slice emits:

```text
step_started
gate_checked
artifact_created
step_completed
```

Gate evidence is derived from the generated artifact ref.

## Local HTTP worker integration

`server/local-http-worker.ts` now routes:

```text
dispatch.mode=mock / dry_run → runMockRuntimeAdapter
dispatch.mode=real → runMinimumRealWorkerSlice
```

The worker still fails closed on invalid request shape.

## Verification coverage

`verify:real-worker` checks:

```text
only write_step_artifact is allowlisted
runtime adapter response shape is valid
job target_worker is carried through
runtime events include started, gate, artifact and completion
artifact refs are emitted
artifact files exist inside the bounded output directory
artifact payload marks arbitrary command execution as false
gate evidence is generated from artifact refs
```

## Current limitation

This is not yet an OpenHands, Codex or Claude Code integration.

It is the smallest safe vertical slice proving that a real worker can produce durable artifact files and runtime bridge events through the existing adapter contract.

Next roadmap items:

```text
14/15 — OpenHands Adapter
15/15 — Codex / Claude Code Adapter
```
