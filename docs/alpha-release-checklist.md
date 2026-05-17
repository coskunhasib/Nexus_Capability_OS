# Capability Runtime Alpha Release Checklist

## Release target

```text
Milestone 1 — Capability Runtime Alpha
```

## Required evidence

```text
CapabilityRuntimePanel exists and is read-only
strict Capability Runtime validators exist
Capability Runtime schema index is strict enough for Alpha
capability runtime verifier passes
controlled worker verifier passes
controlled worker runtime mapping verifier passes
operator-run runtime mapping verifier passes
external runtime mapping decision keeps live execution outside Alpha
```

## Verification commands

```bash
npm ci
npm run build
npm run check:generated
```

Focused checks:

```bash
npm run verify:capability-runtime
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
```

## UI checklist

```text
skill decision is visible
owning agent is visible
sub-agent boundary is visible
tool grant is visible
active context notes are visible
evaluation observation is visible
dry-run runtime loop cycle is visible
no mutation controls are present
```

## Runtime checklist

```text
dry-run loop validates
controlled worker output maps into runtime loop
operator-run completed result maps into runtime loop
operator-run blocked result maps into runtime loop
invalid operator-run result fails before mapping
runtime observations include evidence refs
memory note candidates include source refs
```

## Safety checklist

```text
no live external execution in Alpha
no broad workspace mutation in Alpha
no raw logs as memory notes
no memory candidate without source refs
explicit tool grants only
structured artifacts only
```

## Known limitations to include in release notes

```text
UI is read-only and fixture-backed
runtime loop is local/dry-run/controlled
memory note candidates are not persisted to a memory store
artifact lifecycle is still Beta work
workspace boundary verification is still Beta work
external runtime mapping is deferred to a later milestone
```

## Release note sections required

```text
scope
verification commands
what changed
safety boundaries
known limitations
next milestone
```