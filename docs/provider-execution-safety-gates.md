# Provider Execution Safety Gates

Provider execution must pass host-owned gates before, during, and after a mock provider run.

## Gates

```text
provider_allowlist_gate
adapter_manifest_gate
run_request_gate
workspace_boundary_gate
artifact_root_gate
fallback_policy_gate
normalized_result_gate
manual_review_gate
```

## Rules

```text
capability declaration is not permission
host grants are required
workspace boundary is required
artifact root is required
fallback policy is required
manual review is required before acceptance
```

## Acceptance gate

```text
all execution gates are documented
host ownership is explicit
manual review is explicit
provider cannot self-approve acceptance
```
