# Provider Result Ingest

Provider result ingest accepts only normalized provider output and converts it into host-reviewable candidate state.

## Rule

```text
Provider-native output is not accepted directly.
Only normalized result candidates enter host review.
```

## Required fields

```text
packet_type
version
ingest_id
run_ref
normalized_result_ref
status
summary
source_refs
artifact_refs
trace_refs
review_required
accepted_by_host
```

## Acceptance gate

```text
normalized result ref is present
review is required
accepted_by_host is false by default
source refs are preserved
artifact refs are bounded
trace refs are preserved
```
