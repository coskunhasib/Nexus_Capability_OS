# External Call Packet

External call packets describe a host-reviewed request prepared for an optional provider adapter.

## Rule

```text
Packets are provider-neutral before an adapter maps them to provider input.
Nexus host owns grants, workspace scope, artifact roots, fallback, and accepted result shape.
```

## Required fields

```text
packet_type
version
call_id
request_ref
provider_ref
adapter_ref
runtime_mode
objective
source_refs
active_tool_grants
active_workspace_boundary
allowed_artifact_root
expected_outputs
fallback_ref
```

## Acceptance gate

```text
provider and adapter are explicit
host grants are explicit
workspace boundary is explicit
source refs are present
artifact root is host-approved
expected outputs are explicit
fallback ref is present
```
