# Runtime Loop Prototype Plan

This document completes item 40 at the design-contract level.

It defines the first embedded Nexus Capability Runtime loop to prototype after the data model and contracts are ready.

## Loop purpose

```text
Turn intent into guided execution.
Use skills as methods.
Use tools through permissions.
Use agents/sub-agents for ownership and bounded delegation.
Use notes-first memory for context.
Use evaluation to create experience.
```

## Loop phases

```text
1. Receive task
2. Select skill
3. Assign owning agent
4. Decide sub-agent delegation
5. Build active context bundle
6. Grant tools
7. Execute bounded work
8. Collect artifacts/events
9. Evaluate output
10. Distill memory notes
11. Update observations
```

## Prototype boundaries

First prototype should remain local and controlled.

```text
No direct external runtime mode required.
No unbounded workspace mutation.
No full-context dumping.
No sub-agent without explicit scope.
No tool action without grant.
```

## Prototype input

```text
TaskPacket or future CapabilityRuntimeTask
available skills
available agents
available tools
active memory notes
operator constraints
```

## Prototype output

```text
RuntimeLoopCycle
runtime events
artifact refs
evaluation result
memory note updates
context carry-forward summary
```

## RuntimeLoopCycle shape

```text
cycle_id
task_ref
selected_skill_refs[]
owning_agent_ref
sub_agent_refs[]
active_context_ref
tool_grants[]
events[]
artifacts[]
evaluation_ref
memory_note_update_refs[]
status
```

## First dry-run scenario

Use a small non-destructive workflow:

```text
objective: evaluate a skill/tool/agent combination for a documentation task
skill: technical-report or review skill
agent: reviewer or orchestrator
sub-agent: optional verifier
output: artifact summary + evaluation + memory notes
```

## Verification goal

Future verifier should prove:

```text
skill is selected with reason
owning agent is assigned
sub-agent appears only when scope justifies it
active context contains selected notes only
tools require grants
runtime events are produced
evaluation produces observations
memory note updates are distilled, not raw traces
```

Suggested script:

```bash
npm run verify:runtime-loop-prototype
```

## Item 40 completion

This item is complete at design-contract level when the prototype loop phases, boundaries, inputs and outputs are documented.

Implementation should come later as a focused PR after item 38 and 39 models are represented in code or fixtures.
