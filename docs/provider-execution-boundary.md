# Provider Execution Boundary

Provider execution is a controlled slice on top of Milestone 4 mapping contracts.

## Rule

```text
Provider execution must be host-reviewed, bounded, observable, and reversible through fallback.
```

## Host-owned decisions

```text
execution activation
provider selection
active grants
workspace boundary
artifact root
fallback policy
manual review policy
accepted result shape
```

## Runtime-owned surfaces

```text
run request shape
state machine shape
normalized ingest shape
fallback result shape
fixture set
verification helpers
```

## Default state

```text
provider_execution_enabled_by_default: false
mock_provider_only: true
local_controlled_fallback_required: true
normalized_result_required: true
```

## Acceptance gate

```text
execution disabled by default
mock provider only
host-owned decisions are explicit
runtime-owned surfaces are explicit
local fallback is required
normalized result is required
```
