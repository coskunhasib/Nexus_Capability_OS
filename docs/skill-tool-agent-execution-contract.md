# Skill-Tool-Agent Execution Contract

This document completes item 34 at the design-contract level.

It defines how skill, tool, agent, sub-agent, memory/context and evaluation should interact inside the embedded Nexus Capability Runtime.

## Runtime cycle

```text
intent / task
→ select skill method
→ assign owning agent
→ optionally delegate to sub-agent
→ prepare active context from notes
→ authorize tools
→ execute bounded work
→ collect artifacts and observations
→ evaluate result
→ distill experience into notes
```

## Ownership rule

```text
Skill decides the method.
Agent owns the work.
Sub-agent handles bounded delegation.
Tool performs controlled action.
Memory provides experience.
Context provides current working state.
Evaluation decides if output is good enough.
```

## Minimum execution contract

A runtime cycle should carry:

```text
cycle_id
task_ref
selected_skill_refs[]
owning_agent_ref
sub_agent_refs[] optional
active_context_ref
tool_grants[]
expected_outputs[]
gates[]
observations[]
artifacts[]
result_status
memory_note_updates[]
```

## Step responsibilities

### 1. Skill selection

Input:

```text
task objective
constraints
available skills
past skill observations
```

Output:

```text
selected skill
why selected
risks
required tools
required gates
```

### 2. Agent assignment

Input:

```text
selected skill
required capabilities
risk level
review need
```

Output:

```text
owning agent
role
scope
responsibilities
```

### 3. Sub-agent delegation

Only allowed when it adds real value:

```text
bounded research
parallel check
specialized verification
permission isolation
context isolation
risk isolation
```

### 4. Context preparation

Input:

```text
task
active notes
artifact summaries
open questions
```

Output:

```text
small active context bundle
source refs
excluded irrelevant/stale notes
```

### 5. Tool authorization

Tools must be granted before action.

Tool grant should include:

```text
tool_id
action_class
scope
workspace_boundary
approval_required
expires_after
```

### 6. Execution

Execution produces:

```text
runtime events
artifact refs
gate evidence
blockers
observations
```

### 7. Evaluation

Evaluation checks:

```text
output completeness
quality gate status
artifact usefulness
risk issues
whether memory should be updated
```

### 8. Memory distillation

Runtime outputs are distilled into:

```text
decisions
lessons
failure causes
skill/tool/agent observations
artifact meanings
open questions
```

## Safety boundaries

```text
No tool action without permission model.
No sub-agent without bounded scope.
No raw runtime trace as default active context.
No skill reuse without evaluation signal.
No memory update without source refs or traceability.
```

## Open questions for implementation

```text
Should cycle_id be tied to request_id or task_packet id?
Should skill selection be deterministic or model-assisted?
Should tool grants be stored as events or separate permission records?
Should sub-agent outputs become independent notes or agent handoff notes?
```

## Item 34 completion

This item is complete at design-contract level when the execution flow and ownership rules are documented and used as input for items 35-40.
