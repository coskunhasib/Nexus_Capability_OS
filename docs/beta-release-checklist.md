# Controlled Runtime Beta Release Checklist

## Release target

```text
Milestone 2 — Controlled Runtime Beta
```

## Required Alpha carry-over

```text
Capability Runtime Alpha gates remain green
CapabilityRuntimePanel remains read-only
strict Capability Runtime validators remain active
controlled worker runtime mapping remains verified
operator-run runtime mapping remains verified
external live execution remains outside default path
```

## Beta evidence to add

```text
artifact lifecycle policy exists
artifact lifecycle verifier passes
workspace boundary policy exists
workspace boundary verifier passes
memory note lifecycle policy exists
memory note lifecycle verifier passes
multi-skill controlled runtime fixtures exist
approval-required action behavior is explicit
```

## Verification commands

```bash
npm ci
npm run build
npm run check:generated
```

Existing focused checks:

```bash
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
npm run verify:artifacts
npm run verify:memory-context
```

New Beta checks to wire:

```bash
npm run verify:artifact-lifecycle
npm run verify:workspace-boundary
npm run verify:memory-note-lifecycle
```

## Artifact lifecycle checklist

```text
artifact has id/ref/kind/summary/source refs
artifact has lifecycle status
artifact status transition rules are documented
artifact status transition verifier rejects invalid transitions
artifact refs remain traceable to runtime events or operator results
```

## Workspace boundary checklist

```text
allowed read paths are explicit
allowed write paths are explicit
blocked paths are explicit
artifact output root is explicit
writes outside allowed roots fail validation
blocked paths override broad allow rules
```

## Memory note lifecycle checklist

```text
new note candidates include source refs
updates preserve lineage
merge operation preserves replaced refs
retire operation includes reason
raw logs are not accepted as memory notes
```

## Approval checkpoint checklist

```text
approval-required action without approval is blocked
approval-required action with approval is traceable
approval metadata is not optional when required
blocked approval becomes evaluation observation
```

## Known limitations to include in Beta notes

```text
controlled execution remains local and deterministic
external live execution remains outside default path
persistent host API remains Milestone 3 work
external runtime mapping remains Milestone 4 work
```