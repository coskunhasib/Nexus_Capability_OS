# Nexus Configuration Surface

Configuration is host-owned. Capability Runtime receives effective configuration through host input and must not mutate Nexus configuration directly.

## Default policy

```text
default_runtime_mode: controlled_local
external_mapping: disabled
memory_commit_policy: host_review_required
artifact_root_policy: host_approved_roots_only
workspace_boundary_policy: explicit_boundary_required
decision_gate_policy: host_validated
note_policy: candidates_only
```

## Host-owned configuration

```text
runtime mode
allowed mapping sources
storage roots
artifact roots
note policy
workspace boundary policy
decision gate policy
external mapping policy
release gate policy
```

## Runtime-readable configuration

```text
effective runtime mode
active storage roots
active artifact roots
active workspace boundary
active tool grants
active decision gate result
note candidate policy
external mapping status
```

## Blocked runtime mutations

```text
runtime_mode_override
external_mapping_enablement
artifact_root_expansion
workspace_boundary_expansion
decision_gate_override
memory_commit_policy_change
release_gate_policy_change
```

## Acceptance gate

```text
default runtime mode is explicit
external mapping is disabled by default
host-owned configuration is separated from runtime-readable configuration
runtime mutation list is explicit
local controlled verification remains required
```
