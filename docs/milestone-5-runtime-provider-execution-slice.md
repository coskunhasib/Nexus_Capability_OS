# Milestone 5 — Runtime Provider Execution Slice

## Goal

Move from external runtime mapping contracts to a thin, controlled provider execution slice.

The slice proves that Nexus can prepare a host-reviewed provider run, track provider state, ingest normalized provider output, preserve fallback behavior, and keep all Milestone 3 and Milestone 4 boundaries intact.

## Scope

```text
provider execution boundary
provider run request
provider run state machine
provider result ingest
fallback execution path
artifact and trace routing
safety and permission gates
observability and evaluation checklist
migration and release notes
closure checklist
```

## Non-goals

```text
no real provider credentials
no cloud dependency
no marketplace dependency
no automatic memory writes
no automatic accepted artifacts
no provider permission expansion
no replacement of local controlled runtime
```

## Step plan

```text
Step 1/10 — provider execution boundary document, fixture and verifier
Step 2/10 — provider run request document, fixture and verifier
Step 3/10 — provider run state machine document, fixture and verifier
Step 4/10 — provider result ingest document, fixture and verifier
Step 5/10 — fallback execution path document, fixture and verifier
Step 6/10 — artifact and trace routing document and sample
Step 7/10 — safety and permission gate document
Step 8/10 — observability and evaluation checklist
Step 9/10 — migration checklist and release notes
Step 10/10 — Milestone 5 closure checklist
```

## Default posture

```text
provider execution disabled by default
mock provider execution only
host-reviewed run request required
normalized result required before host review
local controlled fallback remains available
```

## Release gate

```text
focused verifiers are wired into predev and prebuild
CI is green
Milestone 4 mapping contracts remain intact
Milestone 3 embedded boundaries remain intact
```

## Next milestone

```text
Milestone 6 — Provider Execution UI and Operator Review
```
