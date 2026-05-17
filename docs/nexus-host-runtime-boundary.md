# Nexus Host Runtime Boundary

## Purpose

This boundary defines the first contract between the Nexus host and the embedded Capability Runtime.

The host owns orchestration, permission decisions and persistence. Capability Runtime receives a bounded request and returns structured runtime output.

## Host request

The host request should include:

```text
packet_type
version
request_id
host_ref
task_ref
runtime_mode
objective
selected_skill_refs
owning_agent_ref
sub_agent_refs
active_context_ref
tool_grant_refs
decision_gate_refs
artifact_output_root
requested_outputs
source_refs
```

## Runtime response

The runtime response should include:

```text
packet_type
version
response_id
request_ref
status
runtime_cycle_ref
evaluation_refs
artifact_refs
memory_note_candidate_refs
events
blocked_reason optional
source_refs
```

## Status values

```text
pass — request produced accepted structured output
partial — request produced useful output but has unresolved gates or limitations
blocked — request cannot proceed under current boundary
```

## Host-owned decisions

Nexus host owns:

```text
which tool grant is active
which workspace boundary applies
which decision gate result is valid
where artifacts may be written
where notes may be persisted
which runtime mode is allowed
```

## Runtime-owned output

Capability Runtime returns:

```text
runtime events
evaluation refs
artifact refs
memory note candidate refs
status
blocked reason when needed
```

## Boundary rules

```text
host request must include source_refs
runtime response must include source_refs
artifact refs must include kind, ref and summary
runtime events must include event_type and summary
blocked response must include blocked_reason
pass response must include at least one evaluation ref
```

## First verifier expectation

```text
valid host request passes
valid runtime response passes
blocked response without reason fails
pass response without evaluation refs fails
artifact refs without summary fail
events without summary fail
```