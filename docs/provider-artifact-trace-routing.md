# Provider Artifact and Trace Routing

Provider execution artifacts and traces stay candidate-only until Nexus host review accepts them.

## Rule

```text
Provider execution returns artifact refs and trace refs.
Nexus host decides whether refs become accepted records.
```

## Required routing fields

```text
run_ref
artifact_root
artifact_refs
trace_refs
review_required
accepted_by_host
```

## Routing rules

```text
artifact refs must stay under host-approved root
trace refs must preserve run and ingest refs
candidate artifacts are not accepted artifacts
review is required before acceptance
```

## Acceptance gate

```text
artifact root is explicit
artifact refs are bounded
trace refs are preserved
host acceptance is false by default
```
