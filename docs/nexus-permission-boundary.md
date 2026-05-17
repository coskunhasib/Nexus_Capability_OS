# Nexus Permission Boundary

Capability Runtime may request authority, but Nexus owns authority.

This boundary keeps runtime execution explicit, auditable, and revocable. Runtime code cannot promote its own tool access, workspace scope, memory write access, artifact root, or decision gate result.

## Boundary rule

```text
Runtime declares requested access.
Nexus host grants, narrows, blocks, or expires access.
```

## Runtime may declare

```text
requested_tool_grants
requested_workspace_boundary
requested_decision_gate_state
required_source_refs
expected_artifact_root
```

## Nexus host decides

```text
active_tool_grants
active_workspace_boundary
valid_decision_gate_result
allowed_result_shape
allowed_artifact_root
```

## Permission lifecycle

```text
requested
reviewed
active
expired
revoked
blocked
```

## Rules

```text
tool grants must be explicit
workspace boundary must be explicit
decision gate result must be host-valid
source refs must not be empty for stateful outputs
artifact root must be host-approved
runtime may not escalate from requested to active
runtime may not widen workspace boundary
runtime may not bypass a failed decision gate
```

## Blocked behavior

```text
implicit_tool_grant
self_approved_gate
workspace_boundary_widening
artifact_root_override
source_ref_omission
memory_commit_without_host_policy
```

## Acceptance gate

```text
permission manifest validates
runtime requests are separate from host grants
active grant cannot be inferred from request alone
workspace widening is blocked
self-approved decision gates are blocked
stateful outputs require source refs
```
