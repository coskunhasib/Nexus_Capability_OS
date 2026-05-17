# Capability Runtime Alpha Release Notes

## Release status

```text
Milestone: Capability Runtime Alpha
Status: prepared for Alpha validation
Primary verification: npm run build && npm run check:generated
```

## Scope

Capability Runtime Alpha proves the local embedded loop in read-only or controlled mode.

```text
read-only runtime decision panel
strict contract validation
local dry-run loop
controlled worker mapping
operator-run result mapping
evaluation observation generation
memory note candidate generation
```

## What changed

```text
CapabilityRuntimePanel shows runtime decisions read-only.
Capability Runtime contracts validate skill, tool, agent, sub-agent, context, memory note, evaluation and runtime loop shapes.
Strict validators reject invalid enums, empty required arrays, missing method refs, incomplete workspace boundaries and invalid runtime cycles.
Controlled worker responses map into runtime observations, events and artifacts.
Operator-run completed and blocked result files map into runtime observations, cycles, artifacts and memory note candidates.
External mapping was re-evaluated and moved to a later milestone.
```

## Verification commands

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

## Safety boundaries

```text
UI is read-only.
Tool grants are explicit.
Controlled outputs are bounded.
Operator-run results are structured files, not raw logs.
Memory writes are candidates with source refs.
External live execution is outside Alpha scope.
```

## Known limitations

```text
UI is fixture-backed.
Runtime loop is local/dry-run/controlled.
Memory note candidates are not persisted to a store.
Artifact lifecycle policy is still Beta work.
Workspace boundary verification is still Beta work.
External runtime mapping remains a later milestone.
```

## Next milestone

```text
Milestone 2 — Controlled Runtime Beta
```

Beta should focus on:

```text
artifact lifecycle policy
workspace boundary verifier
memory note lifecycle verifier
multi-skill controlled runtime fixtures
approval checkpoint visibility
```