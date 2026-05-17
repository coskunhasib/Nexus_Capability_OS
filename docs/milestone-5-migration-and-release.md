# Milestone 5 Migration and Release Notes

## Migration path

```text
1. Keep provider execution disabled by default.
2. Keep mock provider execution as the only execution slice.
3. Require host-reviewed provider run requests.
4. Track provider run state through the state machine.
5. Ingest only normalized provider result candidates.
6. Keep local controlled fallback available.
7. Route artifacts and traces as candidate refs.
8. Require manual review before host acceptance.
```

## Release notes

```text
Milestone 5 adds a thin runtime provider execution slice.
The slice uses mock provider execution only.
Run requests are bounded by host grants, workspace boundary, artifact root, source refs, and fallback ref.
Provider result ingest keeps accepted_by_host false by default.
Fallback execution is recorded as a first-class path.
Artifact and trace routing remain candidate-only until host review.
```

## Release gates

```text
provider execution boundary validates
provider run request validates
provider run state machine validates
provider result ingest validates
provider fallback execution validates
artifact and trace routing exists
safety gates are documented
observability checklist exists
CI is green
```

## Next milestone

```text
Milestone 6 — Provider Execution UI and Operator Review
```
