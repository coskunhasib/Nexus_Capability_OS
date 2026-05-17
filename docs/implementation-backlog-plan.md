# Implementation Backlog Plan

## Decision

```text
Do not open new numbered milestones for the next work.
Contract and documentation phase is frozen.
Implementation phase is active.
```

## Current baseline

```text
PR #103 introduced the first working vertical slice.
The next work connects that slice to real runtime modules instead of creating more milestone documents.
```

## Workstream A — canonical vertical slice

```text
remove duplicate implementation copy
keep src/providerVerticalSlice.ts as canonical entry point
keep verify:vs as the end-to-end verifier
```

Done when:

```text
there is exactly one canonical provider vertical slice implementation
CI passes verify:vs
```

## Workstream B — shared contracts

```text
extract shared provider/review/artifact/event types
make runtime and verifiers import those types
reduce drift between fixtures and implementation
```

Done when:

```text
runtime types are defined in src/contracts
vertical slice imports contract types
```

## Workstream C — artifact registry integration

```text
add in-memory artifact registry
record candidate artifacts
commit accepted artifacts only after review and disposition
block accepted artifacts for missing source refs, fallback, missing operator ref, or invalid disposition
```

Done when:

```text
happy path writes one accepted artifact record
blocked path writes zero accepted artifact records
fallback path writes zero accepted provider artifact records
```

## Workstream D — event store integration

```text
add in-memory event store
append vertical slice events through a store API
verify event order for happy, blocked, and fallback paths
```

Done when:

```text
host_request_created
provider_run_prepared
provider_result_normalized
review_decision_recorded
artifact_disposition_recorded
accepted_artifact_recorded
```

are visible in event store for the happy path.

## Workstream E — stronger guard tests

```text
review reject path
request changes path
artifact without disposition cannot be accepted
decision without operator ref cannot be accepted
artifact outside allowed root cannot be accepted
fallback cannot create accepted provider artifact
```

Done when:

```text
verify:vs fails if acceptance guard is weakened
```

## Workstream F — adapter abstraction

```text
introduce ProviderAdapter interface
move mock execution into MockProviderAdapter
keep provider execution mock-only
prepare future controlled adapter execution
```

Done when:

```text
vertical slice depends on ProviderAdapter rather than direct mockProviderExecute
```

## Workstream G — state machine binding

```text
bind provider run states to actual flow
validate transition order
reject invalid transition sequences
```

Done when:

```text
happy, blocked and fallback paths expose deterministic state history
```

## Workstream H — UI and demo entry points

```text
add minimal demo script
later connect OperatorReviewPanel to vertical slice output
```

Done when:

```text
npm script can print happy, blocked and fallback outputs for local inspection
```

## Workstream I — repository hygiene

```text
add release history summary for PR #90 through PR #103
add current status document
make active roadmap point to implementation backlog
```

Done when:

```text
repo readers can tell which docs are historical contracts and which work is active implementation
```

## Immediate package

The next PR should complete:

```text
A — canonical vertical slice cleanup
B — shared contracts starter
C — in-memory artifact registry
D — in-memory event store
E — stronger verify:vs checks
I — current status note
```

Out of scope for the immediate package:

```text
React UI
real provider credentials
database persistence
external cloud execution
new numbered milestone files
```
