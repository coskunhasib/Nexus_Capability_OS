# Provider Adapter Manifest

A provider adapter manifest describes an optional external runtime provider without allowing that provider to become a hidden dependency or permission authority.

## Rule

```text
Provider adapters declare capabilities and limits.
Nexus host decides whether a provider may be used.
Capability Runtime normalizes requests and results.
```

## Required manifest fields

```text
provider_ref
adapter_ref
adapter_version
supported_runtime_modes
supported_invocation_types
declared_capabilities
required_host_grants
required_workspace_boundary
artifact_policy
result_policy
fallback_policy
observability_policy
```

## Provider capabilities

```text
file_read
file_write_candidate
test_execution
command_execution
artifact_generation
structured_result
partial_result
blocked_result
```

## Prohibited assumptions

```text
provider is always available
provider may widen permissions
provider may write Nexus memory directly
provider may bypass decision gates
provider-specific result is host-safe without normalization
```

## Acceptance gate

```text
manifest declares capabilities
manifest declares required host grants
manifest declares workspace boundary requirements
manifest declares artifact and result policies
manifest declares fallback and observability policies
provider availability is not assumed
```
