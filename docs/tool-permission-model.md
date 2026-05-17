# Tool Permission Model

This document completes item 36 at the design-contract level.

Tools are controlled action surfaces. A skill can request a tool, but runtime permission grants decide whether that tool can act.

## Permission principle

```text
Tools do not act just because a skill wants them.
Tools act only when the runtime grants a bounded permission.
```

## Tool classes

```text
read_only — inspect state or files
write_artifact — create bounded output artifacts
write_workspace — modify approved workspace files
network_read — fetch external information
network_write — send data to an external service
runtime_control — start, stop or configure a runtime
system_sensitive — high-risk operations requiring explicit approval
```

## Tool grant shape

```text
grant_id
tool_id
action_class
allowed_actions[]
scope
workspace_boundary
approval_required
approved_by optional
expires_after
source_skill_ref optional
owning_agent_ref
sub_agent_ref optional
audit_level
```

## Workspace boundary

Every tool grant must define a boundary:

```text
allowed_read_paths[]
allowed_write_paths[]
blocked_paths[]
artifact_output_root
```

## Approval policy

Require approval for:

```text
write_workspace
network_write
runtime_control
system_sensitive
large artifact deletion
secrets access
```

Approval may be skipped for:

```text
read_only inside approved workspace
write_artifact inside bounded artifact output root
fixture-only dry runs
```

## Audit output

Every tool execution should emit:

```text
tool_id
grant_id
action
input_summary
output_summary
artifact_refs[] optional
risk_flags[] optional
timestamp
status
```

## Relationship to sub-agents

Sub-agents can receive narrower tool grants than their parent agent.

```text
Parent agent owns responsibility.
Sub-agent receives only the tools needed for its bounded scope.
```

## Anti-patterns

```text
unbounded filesystem access
implicit network access
skill-owned permissions
sub-agent inherits all parent permissions by default
tool output stored in memory without distillation
```

## Future implementation files

```text
schemas/tool-permission.schema.json
src/toolPermissionModel.ts
samples/tool-grants/*.json
scripts/verify-tool-permission-model.ts
```

## Item 36 completion

This item is complete at design-contract level when the permission classes, grant shape, workspace boundary and audit expectations are documented.
