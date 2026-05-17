# External Runtime Mapping Boundary

External runtime mapping lets Capability Runtime describe how a controlled runtime task may be sent to an optional provider adapter.

The boundary exists to prevent provider-specific execution from weakening Nexus host policy, local controlled checks, or Milestone 3 embedded boundaries.

## Boundary rule

```text
External providers are adapter targets.
Nexus host owns activation, grants, workspace boundary, fallback policy, and accepted result shape.
Capability Runtime owns normalized mapping contracts and verification helpers.
```

## Default state

```text
external_mapping_enabled: false
local_controlled_runtime_primary: true
provider_required: false
provider_specific_contracts_hidden_from_host: false
```

## Mapping layers

```text
host_request
runtime_mapping
provider_adapter
external_invocation
result_normalization
host_safe_response
```

## Host-owned decisions

```text
external_mapping_activation
provider_allowlist
active_tool_grants
active_workspace_boundary
artifact_root_policy
decision_gate_policy
fallback_policy
accepted_result_shape
```

## Runtime-owned surfaces

```text
mapping_contract
normalization_contract
provider_capability_expectations
fixture_set
verification_helpers
local_fallback_path
```

## Provider adapter constraints

```text
adapter must declare provider capabilities
adapter must not widen host permissions
adapter must not bypass source refs
adapter must not write Nexus memory directly
adapter must return normalized result candidates
adapter must support blocked and partial outcomes
```

## Failure posture

```text
provider_unavailable maps to fallback_or_blocked
provider_permission_mismatch maps to blocked
provider_schema_mismatch maps to blocked
provider_timeout maps to partial_or_fallback
provider_artifact_violation maps to blocked
```

## Acceptance gate

```text
external mapping is disabled by default
local controlled runtime remains primary
provider is optional
host-owned decisions are explicit
runtime-owned surfaces are explicit
provider adapter constraints are explicit
failure posture is explicit
```
