# Provider Run Request

A provider run request is the host-reviewed input for a mock provider execution slice.

## Rule

```text
Run requests must be explicit, source-backed, bounded by host grants, and reversible through fallback.
```

## Required fields

```text
packet_type
version
run_id
request_ref
provider_ref
adapter_ref
runtime_mode
objective
source_refs
active_tool_grants
active_workspace_boundary
allowed_artifact_root
expected_outputs
fallback_ref
manual_review_required
```

## Acceptance gate

```text
run request identifies provider and adapter
run request carries host grants
run request carries explicit workspace boundary
run request carries source refs
run request carries allowed artifact root
run request carries fallback ref
manual review requirement is explicit
```
