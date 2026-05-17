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

## Milestone 2 — Controlled Runtime Beta

Goal:

```text
Move from dry-run visibility to controlled local execution.
```

Beta should add:

```text
more controlled worker action types
artifact lifecycle policy
workspace boundary enforcement
approval checkpoints
runtime event persistence
memory note create/update/retire verifier
multi-skill trial scenarios
```

Beta should still avoid:

```text
direct external runtime execution by default
implicit network write access
raw logs as memory
unbounded file mutation
```

## Milestone 3 — Embedded Nexus Integration

Goal:

```text
Prepare the Capability Runtime to live as an embedded Nexus subsystem.
```

Should define:

```text
Nexus host API boundary
runtime package boundary
storage boundary
permission boundary
UI mount point
configuration surface
migration path from current repo scaffold
```

## Milestone 4 — External Runtime Mapping

Goal:

```text
Map external runtimes into the Capability Runtime contract without letting them define the core architecture.
```

Can include:

```text
custom code-agent mapping
operator-run result mapping
remote runtime service mapping
artifact import/export mapping
external observation mapping
```

Required before this milestone starts:

```text
Alpha complete
Beta controlled runtime stable
permission model verified
memory distillation verified
UI visibility available
```

## Release gates

Each milestone should have:

```text
scope
non-goals
verification commands
known limitations
security notes
release notes
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