# Operator-Run Result File Ingestion Plan

This plan defines the next safe integration step after the UI/runtime implementation phase.

The goal is to accept operator-managed result files that connect back into Nexus and normalize them through the existing runtime adapter response path before any direct runtime mode is considered.

## Current state

```text
15/15 adapter/runtime roadmap: complete
16-24 hardening sequence: complete
25-31 UI/runtime implementation phase: complete
Nexus operator-run result ingestion: planned
Direct external runtime mode: not enabled
```

## Why this comes next

The system can already prepare safe Nexus work envelopes and show operator-facing runtime state.

The missing bridge is:

```text
operator or external process performs work outside the app
operator provides a result file back to Nexus
Nexus validates the result file
Nexus normalizes it to runtime adapter response/events
```

This proves the Nexus result path before any direct runtime wiring.

## Proposed sequence

```text
32. Operator-run result file ingestion plan — this document
33. Nexus operator-run result ingestion
34. Code Agent / custom agent result ingestion
35. Result schema + validation guard
36. First runtime wiring decision PR
```

## Result file concept

A result file should be small, explicit and validation-friendly.

Base shape:

```text
packet_type
version
request_id
source_adapter
operator_run_id
status: completed | blocked
artifacts[]
notes[]
diagnostics[] optional
created_at
```

Artifact shape:

```text
step_id
kind
ref
summary
```

## Ingestion boundary

```text
result file JSON
→ validate result file shape
→ validate request_id / source_adapter
→ validate artifact refs are bounded or symbolic
→ normalize to nexus.runtime_adapter_response
→ runtime events
→ artifact registry
→ review hardening
→ memory/context hardening
```

## Safety rules

```text
Result ingestion must not execute commands.
Result ingestion must not read arbitrary workspace files.
Result ingestion must not persist raw logs into memory/context packets.
Invalid result shape must fail closed.
Unknown source adapter must fail closed.
Missing artifacts should become blocked results, not invented evidence.
```

## Nexus operator-run path

Future PR 33 should:

```text
add a Nexus operator-run result type
add completed and blocked fixtures
add a verifier that normalizes both fixtures
produce nexus.runtime_adapter_response directly
keep direct runtime mode disabled
```

## Code Agent / custom agent path

Future PR 34 should:

```text
add a generic code-agent/custom-agent operator-run result type
include source_adapter and optional agent_kind in the result file
add completed and blocked fixtures for supported source kinds
add a verifier that normalizes fixtures
keep direct runtime mode disabled
```

## Common schema / guard path

Future PR 35 should:

```text
centralize shared result-file validation
add shared guard helpers
add schema-like docs or JSON schema if useful
ensure Nexus and code-agent/custom-agent fixtures pass the same base guard
```

## Decision gate

Future PR 36 should decide the first real runtime path.

Recommended default:

```text
prefer operator-run ingestion over direct runtime mode
choose direct runtime mode only after result ingestion, UI visibility and validation are proven
```

## Verification expectations

Each ingestion PR must keep the existing chain green:

```bash
npm run build
npm run check:generated
```

Focused future scripts should be added:

```text
verify:nexus-result-ingest
verify:code-agent-result-ingest
verify:operator-result-guard
```

## Completion rule

Each PR in 32-36 should update:

```text
docs/operator-run-result-ingestion-plan.md
docs/post-roadmap-backlog.md
```