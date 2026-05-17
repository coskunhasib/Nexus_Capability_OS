# Provider Capability Matrix

The provider capability matrix makes optional external runtime providers comparable without binding Nexus to any single provider.

## Capability columns

```text
provider_ref
adapter_ref
runtime_modes
invocation_types
file_read
file_write_candidate
test_execution
command_execution
artifact_generation
structured_result
partial_result
blocked_result
local_fallback_supported
observability_supported
```

## Matrix rules

```text
capabilities are declared by adapters
host decides whether a declared capability may be used
missing capability maps to blocked or fallback
capability declaration does not grant permission
provider availability is not assumed
```

## Sample matrix

| Provider | Adapter | Runtime modes | Candidate writes | Tests | Commands | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| provider.mock.external-runtime | adapter.mock.external-runtime.v1 | dry_run_external, controlled_external | yes | yes | yes | local_controlled_runtime |

## Acceptance gate

```text
matrix lists provider and adapter refs
matrix distinguishes declared capability from active permission
matrix includes fallback support
matrix supports blocked and partial result capability
```
