# External Fallback Policy

External provider use must have an explicit fallback path before a provider call is attempted.

## Rule

```text
External runtime mapping is optional.
Local controlled runtime remains the primary fallback path.
Nexus host decides whether to retry, fall back, return partial, or block.
```

## Failure classes

```text
provider_unavailable
provider_timeout
provider_permission_mismatch
provider_schema_mismatch
provider_artifact_violation
provider_result_incomplete
```

## Allowed outcomes

```text
fallback_to_local
return_partial
return_blocked
retry_once
manual_review_required
```

## Host decisions

```text
retry policy
fallback policy
manual review policy
accepted partial shape
blocked result shape
```

## Acceptance gate

```text
all failure classes map to allowed outcomes
local fallback remains available
blocked results include reasons
partial results include reasons
retry is bounded
manual review remains host-owned
```
