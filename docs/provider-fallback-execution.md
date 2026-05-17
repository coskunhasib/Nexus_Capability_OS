# Provider Fallback Execution

Provider fallback execution records how a provider run returns to the local controlled runtime path.

## Rule

```text
Fallback is not an error afterthought. It is a first-class execution path owned by Nexus host policy.
```

## Required fields

```text
packet_type
version
fallback_run_id
source_run_ref
fallback_ref
reason
source_refs
trace_refs
result_status
manual_review_required
```

## Acceptance gate

```text
fallback ref is present
fallback reason is present
source run ref is present
trace refs are preserved
manual review remains explicit
```
