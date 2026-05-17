# Implementation Phase Plan

## Decision

```text
Architecture phase is frozen.
No new numbered milestone is opened for the next step.
The next unit of work is one working vertical slice.
```

## Problem

The repository now has many contracts, fixtures, docs, and verifier scripts. Those are useful guardrails, but they do not prove a real runtime flow works end to end.

## Target vertical slice

```text
host request
provider run request
mock provider execution
normalized provider result
operator review decision
artifact disposition
accepted artifact record
trace and event record
e2e verifier
```

## Done definition

```text
one happy path produces an accepted artifact record only after review
one blocked path proves missing source refs cannot create accepted output
one fallback path proves fallback does not create accepted output by default
CI runs the e2e verifier
existing contract verifiers remain green
```

## Implementation files

```text
src/implementation/providerVerticalSlice.ts
scripts/verify-implementation-slice.ts
```

## Guardrails

```text
provider execution stays mock-only
candidate artifacts stay candidate-only before review
operator decision is required
accepted output is created only by host-side review logic
source refs are required
trace events are recorded
fallback is explicit
```

## Out of scope

```text
new milestone documents
real provider credentials
cloud provider execution
UI rendering work
database persistence
production authentication
```

## Execution order

```text
1. Add this plan.
2. Add provider vertical slice implementation.
3. Add e2e verifier covering happy, blocked, and fallback paths.
4. Wire verifier into package scripts and prebuild/predev.
5. Run CI through PR.
6. Merge only after green CI.
```
