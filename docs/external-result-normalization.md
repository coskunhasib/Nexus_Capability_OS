# External Result Normalization

External provider output must be converted into a Nexus host-safe response before it is accepted by Capability Runtime or the host.

## Rule

```text
Provider-native output is never treated as host-safe by default.
Every external result is normalized into a stable runtime response shape.
```

## Required normalized fields

```text
packet_type
version
result_id
call_ref
provider_ref
adapter_ref
status
summary
source_refs
artifact_refs
trace_refs
note_candidate_refs
evaluation_refs
blocked_reason
partial_reason
```

## Allowed status values

```text
pass
partial
blocked
fallback_used
```

## Normalization checks

```text
status is explicit
source refs are preserved
artifact refs stay under host-approved roots
provider-native fields are not leaked as required host fields
blocked results include blocked_reason
partial results include partial_reason
fallback results include fallback ref in trace refs
```

## Acceptance gate

```text
normalized result packet validates
provider-specific output is not accepted directly
blocked and partial states remain explainable
source refs remain attached
artifact refs remain bounded
```
