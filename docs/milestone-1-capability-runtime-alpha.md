# Milestone 1 — Capability Runtime Alpha

## Goal

Prove the embedded Capability Runtime loop end to end in local, read-only or controlled mode.

Alpha is the first release milestone after item 50. It is not another numbered roadmap batch.

## Baseline

```text
Capability Runtime is the embedded skill-tool-agent layer.
Nexus remains the host system.
External systems are future mapping sources, not the core contract.
```

## Scope

```text
read-only CapabilityRuntimePanel
strict fixture/schema validation
local dry-run runtime loop
controlled worker mapping into runtime loop
operator-run result mapping into runtime loop
evaluation observation generation
memory note candidate generation
verification contract alignment
alpha release notes
```

## Alpha gates

```text
skill is selected
owning agent is assigned
sub-agent appears only when justified
tool grant is explicit
active context comes from selected notes
runtime events are produced in local or controlled mode
evaluation observation is created
memory note updates are proposed with source refs
UI shows decisions read-only
all deterministic verifiers pass
```

## Non-goals

```text
no live external execution
no broad workspace mutation
no full-context dumping
no autonomous worker swarm
no memory update without source refs
no persistent Nexus host API yet
```

## Deliverables

```text
CapabilityRuntimePanel
strict fixture/schema verification
controlled-worker-to-runtime mapping
operator-result-to-runtime mapping
updated verification contract
alpha release checklist
alpha release notes
```

## Required verification

```bash
npm ci
npm run build
npm run check:generated
```

Focused Alpha checks:

```bash
npm run verify:capability-runtime
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
```

## Safety notes

```text
Runtime-facing writes remain bounded or fixture-backed.
Tool grants remain explicit.
Operator-run results are imported as structured result files.
Controlled worker outputs map through observations and artifacts.
Memory changes are candidates with source refs.
Live external execution remains outside Alpha scope.
```

## Known limitations

```text
CapabilityRuntimePanel is read-only and fixture-backed.
RuntimeLoopCycle remains local/dry-run/controlled.
Memory note candidates are not merged into a persistent memory store.
Artifact lifecycle is not yet a full Beta-grade policy.
Workspace boundary validation is not yet a complete Beta gate.
External mapping is a future milestone concern.
```

## Exit criteria

```text
Alpha release notes are written.
All Alpha gates are green.
Known limitations are explicit.
The next Beta backlog is milestone-based, not numbered-roadmap based.
```