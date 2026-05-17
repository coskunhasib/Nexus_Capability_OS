# External Runtime Mapping Decision

This document covers the initial item 45 decision and the item 50 re-evaluation.

## Initial item 45 decision

Do not wire external runtime execution yet.

First validate the local Capability Runtime loop with deterministic contracts, fixtures, UI visibility and observations.

## Re-evaluation inputs now available

The final numbered block has produced the required local evidence:

```text
46. CapabilityRuntimePanel read-only UI — implemented
47. Stricter JSON schema validation — implemented
48. Local controlled worker mapping into runtime loop — implemented
49. Operator-run result mapping into runtime loop — implemented
```

## Item 50 decision

```text
Mapping pattern is accepted.
Live external runtime execution remains deferred.
External Runtime Mapping moves to Milestone 4.
Milestone 1 — Capability Runtime Alpha is the next phase after item 50.
```

## Why

The local Capability Runtime loop now has enough proof that bounded outputs can map into the runtime contract:

```text
controlled worker output
→ EvaluationObservation
→ RuntimeLoopCycle events/artifacts

operator-run result file
→ EvaluationObservation
→ RuntimeLoopCycle events/artifacts
→ memory note candidate
```

But live external runtime execution still needs stronger host, permission, artifact and memory boundaries.

## Accepted mapping principle

```text
external output
→ mapping adapter
→ Capability Runtime contract
→ evaluation observation
→ distilled memory note candidate
```

External tools and agents map into the Capability Runtime contract. They do not define the contract.

## Allowed now

```text
external mapping design docs
external mapping fixtures
operator-run mapping
controlled-worker mapping
disableable mapping interfaces
failure mapping as evaluation observations
artifact import policy design
```

## Not allowed yet

```text
live external runtime execution
unbounded shell or filesystem access
network write by default
raw external logs as memory
autonomous external worker swarm
runtime-specific protocol becoming the core contract
```

## Requirements before live external runtime execution

```text
Capability Runtime Alpha complete
Controlled Runtime Beta stable
Embedded Nexus host boundary documented
permission model verified
artifact lifecycle verified
memory distillation verified
operator approval path visible
disable / rollback path exists
```

## Candidate future sources

```text
custom code agent
operator-run result file
local controlled worker
remote runtime service
```

## Risks if this is done too early

```text
external output starts defining the core contract
permission boundaries become unclear
raw logs enter memory
sub-agents become uncontrolled workers
context dumping returns
local runtime becomes dependent on an external runtime
```

## Post-50 direction

```text
Stop numbered roadmap expansion.
Start Milestone 1 — Capability Runtime Alpha.
Keep External Runtime Mapping for Milestone 4.
```

## Completion rule

Item 50 is complete when this decision is recorded:

```text
External runtime mapping is accepted as a future mapping layer.
Live external runtime execution is deferred.
The next phase is Capability Runtime Alpha, not item 51.
```