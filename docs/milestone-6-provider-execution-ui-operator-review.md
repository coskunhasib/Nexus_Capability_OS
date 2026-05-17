# Milestone 6 — Provider Execution UI and Operator Review

## Goal

Add the host-side review layer for provider execution candidates.

Milestone 6 defines how Nexus presents provider run results to an operator, records review decisions, routes candidate artifacts, and keeps provider output from becoming accepted state without explicit host-owned review.

## Scope

```text
review panel boundary
review decision packet
review state machine
operator action log
artifact disposition policy
review safety gates
review observability checklist
migration and release notes
closure checklist
```

## Non-goals

```text
no autonomous acceptance
no direct memory write
no direct artifact acceptance
no provider-owned review decision
no credentialed provider execution
no cloud dependency
```

## Step plan

```text
Step 1/10 — review panel boundary document, fixture and verifier
Step 2/10 — review decision packet document, fixture and verifier
Step 3/10 — review state machine document, fixture and verifier
Step 4/10 — operator action log document, fixture and verifier
Step 5/10 — artifact disposition document, fixture and verifier
Step 6/10 — review safety gates document
Step 7/10 — review observability checklist
Step 8/10 — migration checklist
Step 9/10 — release notes
Step 10/10 — Milestone 6 closure checklist
```

## Default posture

```text
review panel is read-only by default
operator decisions are explicit
accepted_by_host is false by default
candidate artifacts remain candidate-only
memory writes remain candidates-only
```

## Next milestone

```text
Milestone 7 — Accepted Artifact Commit Path
```
