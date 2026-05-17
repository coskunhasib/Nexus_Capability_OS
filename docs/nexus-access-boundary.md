# Nexus Access Boundary

Capability Runtime may declare the access it needs, but Nexus owns the effective access decision.

This boundary keeps runtime requests separate from host-approved execution scope.

## Boundary rule

```text
Runtime declares requested access.
Nexus host decides effective access.
```

## Runtime declarations

```text
requested_tool_access
requested_workspace_scope
requested_gate_state
required_source_refs
expected_artifact_root
requested_result_shape
```

## Host decisions

```text
effective_tool_access
effective_workspace_scope
valid_gate_result
allowed_source_refs
active_artifact_root
allowed_result_shape
access_expiry
```

## Tool access

Tool access is never inferred from skill selection.

Rules:

```text
requested tool access must be explicit
effective tool access must be host-issued
runtime must handle denied access as blocked or partial state
write-like actions require gate validation when policy requires it
```

## Workspace scope

Runtime may request a workspace scope, but it cannot expand it.

Rules:

```text
effective scope must be equal to or narrower than requested scope
runtime output must cite scope refs
host may redact results outside effective scope
```

## Gate checks

Gate checks separate proposal from execution.

Rules:

```text
runtime may report requested gate state
host validates gate result
write-like actions require valid gate result when policy requires it
blocked gate must produce blocked or partial response
```

## Source refs

Runtime may require source refs, but Nexus decides which refs are allowed.

Rules:

```text
required source refs must be explicit
allowed source refs must be host-filtered
results must preserve source refs
missing required refs must block or degrade output
```

## Artifact roots

Runtime may request an expected artifact root, but Nexus host supplies the active root.

Rules:

```text
artifact writes must stay under active artifact root
runtime must not choose final host storage location
artifact refs outside active root are invalid
```

## Result shape

Allowed result states:

```text
pass
partial
blocked
```

## Acceptance gate

```text
access manifest validates
runtime declarations are separate from host decisions
implicit tool access is blocked
workspace expansion is blocked
invalid gate cannot pass
source refs remain explicit
artifact root is host-owned
allowed result shape is constrained
```
