# Local Controlled Worker v2

Local controlled worker v2 adds a manifest-driven worker path after the minimum real worker slice.

It is still intentionally bounded and does not invoke external runtimes.

## Boundary

```text
nexus.runtime_adapter_request
+ nexus.controlled_worker_manifest
→ runControlledWorkerV2
→ bounded artifact files
→ runtime bridge events
→ nexus.runtime_adapter_response
```

## Living code path

```text
server/controlled-worker-v2.ts
scripts/verify-controlled-worker-v2.ts
```

NPM script:

```bash
npm run verify:controlled-worker
```

## Manifest shape

```text
packet_type: nexus.controlled_worker_manifest
version: 0.1
manifest_id
actions[]
```

Each action has:

```text
action_id
action_kind
optional step_id
optional output_kind
```

## Allowed actions

```text
write_step_artifact
write_manifest_summary
```

## Output policy

```text
Outputs are written into a bounded output directory.
Artifact refs are returned as file refs.
Artifact payloads include safety metadata.
No direct external runtime is used.
```

## Runtime events

The worker emits:

```text
artifact_created
step_completed when the action is tied to a work-order step
```

## Verification coverage

`verify:controlled-worker` checks:

```text
manifest shape is valid
allowed actions are explicit
runtime adapter response shape is valid
response target worker is controlled worker v2
events are produced from manifest actions
artifact refs are emitted
unique artifact files exist
artifact payloads use bounded output policy
artifact payloads mark direct_external_runtime=false
```

## Current limitation

The worker still does not mutate repositories or call external runtimes. That is intentional. It creates a safer stepping stone before real external runtime wiring.
