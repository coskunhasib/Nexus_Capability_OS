# Nexus Storage Boundary

Capability Runtime may produce storage-addressable outputs, but Nexus owns persistence decisions.

This boundary prevents runtime execution from silently writing host memory, artifacts, traces, configuration, or operator result files outside allowed roots.

## Boundary rule

```text
Runtime returns refs and candidates.
Nexus host commits, rejects, redacts, or routes persistence.
```

## Storage groups

```text
trace_refs
memory_notes
note_candidates
artifact_refs
runtime_events
configuration
operator_result_files
```

## Trace refs

Trace refs point to execution observations, tool calls, validation output, and runtime cycle summaries.

Rules:

```text
runtime may emit trace refs
trace refs must be immutable once accepted
trace refs must include source refs where applicable
host controls retention and visibility
```

## Memory notes

Runtime must not directly write durable Nexus memory.

Rules:

```text
runtime may propose memory note candidates
host decides whether candidates become memory notes
memory commits require source refs
memory commits require operator or policy approval
```

## Artifact refs

Artifact refs describe files or generated outputs under host-approved roots.

Rules:

```text
artifact refs must include kind, ref, summary, and root
artifact refs must stay under allowed artifact roots
runtime must not claim host persistence before host acceptance
```

## Runtime events

Runtime events are append-only observations about execution state.

Allowed event classes:

```text
runtime_started
skill_selected
tool_grant_requested
decision_gate_checked
artifact_proposed
note_candidate_proposed
runtime_blocked
runtime_completed
```

## Configuration

Configuration is host-owned.

Runtime may read effective configuration passed through the host request but must not mutate host configuration directly.

## Operator result files

Operator result files are runtime-produced summaries for human review.

Rules:

```text
operator result files are artifacts before they are records
host decides final location
host decides whether result files become release evidence
```

## Acceptance gate

```text
storage manifest validates
all storage groups are present
memory direct write is blocked
artifact roots are explicit
configuration mutation is host-owned
runtime events are append-only
operator result files are routed through artifact refs
```
