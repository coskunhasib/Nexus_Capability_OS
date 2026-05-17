# Nexus Capability Runtime Philosophy

This document defines the core philosophy for the Nexus Capability Runtime.

For the preserved decision history that led here, read:

```text
docs/capability-runtime-decision-log.md
```

## Core distinction

```text
LLM = reasoning intelligence
Nexus Capability Runtime = wisdom, experience and operating discipline
```

The LLM thinks. The runtime gives it learned methods, safe tools, role structure, context discipline, memory and evaluation.

## Why this layer exists

```text
The LLM should not start from zero on every task.
The runtime should provide accumulated experience, reusable methods and safe operating rules.
```

## Component roles

```text
LLM — reasoning and generation engine
Skill — reusable learned method
Tool — controlled action surface
Agent — role/profile that owns a task or decision area
Sub-agent — delegated agent with narrower scope, bounded context and bounded permissions
Memory — accumulated experience and durable lessons
Context — current working state
Evaluation — quality judgment and gate discipline
Runtime — orchestration layer that combines all of the above
```

## Agent and sub-agent distinction

Agent and sub-agent should be separated only when it creates a useful boundary.

Use an agent for:

```text
major role ownership
cross-step responsibility
planning or review authority
longer context ownership
```

Use a sub-agent for:

```text
narrow delegated work
bounded tool permissions
bounded context window
specialized checks
parallel investigation
risk isolation
```

Do not create sub-agents just to multiply names. Create them when isolation, permission control or parallel reasoning is useful.

## Memory and context principle

```text
Pruning removes.
Distillation preserves meaning.
Notes carry experience.
Active context should be selected, not dumped wholesale.
```

The preferred design is notes-first and distillation-first.

Use pruning only for:

```text
duplicates
irrelevant traces
raw logs already summarized
temporary UI state
failed intermediate noise with no lesson
```

Use distillation for:

```text
decisions
lessons learned
workflow outcomes
skill/tool performance observations
agent/sub-agent handoff summaries
artifact meaning
open questions
failure causes
```

## Notes-first context policy

The runtime should avoid sending the full conversation into every LLM call.

Preferred flow:

```text
conversation / runtime trace / review output
→ extract decisions, lessons, failures, artifacts and open questions
→ create or update distilled notes
→ retire stale notes when replaced
→ select only relevant active notes for the next task
→ keep raw trace as evidence, not default working context
```

This is documented in detail in:

```text
docs/memory-context-distillation-plan.md
```

## Skill-tool-agent operating idea

```text
Skill decides the method.
Agent owns the role.
Sub-agent handles bounded delegation.
Tool performs the action.
Memory carries experience.
Context carries current state.
Evaluation decides whether the result is good enough.
```

## Research-aligned design notes

Recent agent-context research supports moving beyond simple truncation/pruning. Memory-tier systems, linked-note memory, optimized context compression and memory-action approaches all point toward the same product lesson:

```text
Do not just cut context.
Compress it into usable experience.
Treat memory as evolving notes, not as one giant prompt buffer.
```

## Current roadmap impact

This philosophy changes item 33 from a passive inventory into the first step of a runtime design:

```text
33. Capability Runtime data model discovery
34. Skill-Tool-Agent execution contract
35. Skill package standard
36. Tool permission model
37. Agent / sub-agent delegation model
38. Memory/context distillation model
39. Evaluation and observation model
40. Runtime loop prototype
```

The old Nexus unknown-mode rule still matters: do not guess hidden Nexus details. But the direction is now clearer:

```text
Nexus is the host system.
Capability Runtime is the embedded wisdom/experience layer.
```