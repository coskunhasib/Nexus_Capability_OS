# Post-50 Milestone Plan

This document defines what happens after the final numbered block, 46-50.

The project should not continue with endless five-item roadmap batches. After item 50, planning switches to milestone/release mode.

## Current final numbered block

```text
46. CapabilityRuntimePanel read-only UI
47. Stricter JSON schema validation
48. Local controlled worker mapping into runtime loop
49. Operator-run result mapping into runtime loop
50. External runtime mapping re-evaluation
```

## Stop rule

```text
Stop extending the numbered roadmap after item 50.
Switch to milestones.
```

## Milestone 1 — Capability Runtime Alpha

Goal:

```text
Prove the embedded Capability Runtime loop end to end in local/read-only or controlled mode.
```

Scope:

```text
read-only CapabilityRuntimePanel
strict fixture/schema validation
local dry-run runtime loop
controlled worker mapping into runtime loop
operator-run result mapping into runtime loop
evaluation observation generation
memory note candidate generation
alpha release notes
```

Alpha is ready when:

```text
skill is selected
owning agent is assigned
sub-agent appears only when justified
tool grant is explicit
active context comes from selected notes
dry-run or controlled loop produces runtime events
evaluation observation is created
memory note updates are proposed
UI shows the decisions read-only
all deterministic verifiers pass
```

Alpha non-goals:

```text
no direct external runtime execution
no unbounded workspace writes
no full-context dumping
no autonomous sub-agent swarm
no memory update without source refs
no persistent Nexus host API yet
```

Expected Alpha outputs:

```text
CapabilityRuntimePanel
strict fixture/schema verification
controlled-worker-to-runtime mapping
operator-result-to-runtime mapping
updated verification contract
alpha release notes
```

Alpha release gates:

```text
npm run build passes
npm run check:generated passes
npm run verify:capability-runtime passes
UI shows all runtime decisions read-only
external runtime mapping remains deferred
```

## Milestone 2 — Controlled Runtime Beta

Goal:

```text
Move from dry-run visibility to controlled local execution.
```

Scope:

```text
controlled worker actions become the first real execution substrate
runtime loop consumes controlled worker outputs
artifact lifecycle becomes explicit
workspace boundaries are enforced
memory notes can be created, updated, merged and retired in fixtures/verifiers
multi-skill trials are added
approval checkpoints are visible
```

Beta is ready when:

```text
controlled worker can produce runtime-loop-compatible events
artifact refs are created with lifecycle status
workspace read/write boundaries are validated
approval-required actions fail closed without approval
memory note create/update/merge/retire flow is verified
at least two skills can run through controlled local loop fixtures
runtime events persist or replay deterministically in test fixtures
```

Beta non-goals:

```text
no external runtime execution by default
no implicit network write access
no raw logs stored as memory
no unbounded file mutation
no hidden tool permissions
no production Nexus deployment requirement
```

Expected Beta outputs:

```text
controlled-worker-runtime-mapping implementation
artifact lifecycle policy and verifier
workspace boundary verifier
memory note lifecycle verifier
multi-skill controlled runtime fixtures
beta release notes
```

Beta release gates:

```text
all Alpha gates remain green
controlled worker mapping verifier passes
artifact lifecycle verifier passes
memory lifecycle verifier passes
workspace boundary verifier passes
security policy updated for controlled local execution
```

## Milestone 3 — Embedded Nexus Integration

Goal:

```text
Prepare the Capability Runtime to live as an embedded Nexus subsystem.
```

Scope:

```text
Nexus host API boundary
runtime package boundary
storage boundary
permission boundary
UI mount point
configuration surface
migration path from current repo scaffold
embedded mode initialization
```

Embedded Nexus Integration is ready when:

```text
host API inputs and outputs are documented
Capability Runtime package boundary is explicit
storage boundary separates raw trace, notes, artifacts and config
permission boundary is mapped to Nexus host controls
UI mount point is documented
configuration surface is documented
current scaffold-to-embedded migration path is documented
integration fixtures prove host-to-runtime and runtime-to-host handoff
```

Embedded integration non-goals:

```text
no external runtime execution requirement
no cloud/multi-tenant productization requirement
no marketplace requirement
no billing/workspace expansion requirement
no hidden dependency on a specific third-party agent runtime
```

Expected Embedded outputs:

```text
docs/nexus-embedded-integration-plan.md
schemas/nexus-host-runtime-boundary.schema.json optional
samples/nexus-host-integration/*.json
host boundary verifier
embedded integration release notes
```

Embedded release gates:

```text
all Beta gates remain green
host boundary verifier passes
permission boundary is reviewed
storage boundary is documented
migration checklist exists
known limitations are explicit
```

## Milestone 4 — External Runtime Mapping

Goal:

```text
Map external runtimes into the Capability Runtime contract without letting them define the core architecture.
```

Scope:

```text
custom code-agent mapping
operator-run result mapping
remote runtime service mapping
artifact import/export mapping
external observation mapping
runtime failure mapping
```

External Runtime Mapping is ready when:

```text
external output maps into Capability Runtime contracts
external artifacts map into artifact lifecycle policy
external logs are summarized before memory use
external failures become evaluation observations
tool/permission boundaries stay host-owned
operator approval gates exist for risky actions
at least one external mapping works through fixtures before live execution
```

External mapping non-goals:

```text
external runtimes do not define the core contract
no direct shell/system control without explicit permission model
no raw external logs as memory
no automatic network write access
no autonomous external worker swarm
```

Expected External outputs:

```text
external runtime mapping adapter interface
custom agent mapping fixture
operator-run mapping fixture
external artifact import policy
external failure/observation mapping verifier
external mapping release notes
```

External release gates:

```text
all Embedded gates remain green
external mapping verifier passes
permission review passes
artifact import/export verifier passes
memory distillation still blocks raw log ingestion
external runtime can be disabled without breaking local runtime
```

## Milestone dependency order

```text
Milestone 1 — Capability Runtime Alpha
→ Milestone 2 — Controlled Runtime Beta
→ Milestone 3 — Embedded Nexus Integration
→ Milestone 4 — External Runtime Mapping
```

External Runtime Mapping should not start before Alpha and Beta prove the local embedded runtime model.

## Release gates for every milestone

Each milestone must include:

```text
scope
non-goals
verification commands
known limitations
security notes
release notes
rollback or disable path
```

## Recommended next after item 50

```text
Create docs/milestone-1-capability-runtime-alpha.md
Update docs/verification-contract.md
Create alpha release checklist
```

## One-line direction

```text
Finish 46-50, then stop expanding roadmap numbers and ship Capability Runtime Alpha.
```