# Capability Runtime Decision Log

This document preserves the important design decisions made before the detailed memory/context plan.

It should be read before implementing item 33 and before changing the roadmap again.

## Decision 1 — This is not a standalone product first

The project started as a way to develop and observe skills, agents, tools and workflows for specific goals.

It later drifted toward productization.

Current decision:

```text
Do not treat this repo primarily as a standalone product.
Treat it as the embedded Nexus Capability Runtime layer.
```

## Decision 2 — This is not a separate advisor module

Rejected framing:

```text
Nexus asks this module for advice.
This module returns reports to Nexus.
```

Accepted framing:

```text
Capability Runtime is a persistent integrated layer inside Nexus.
```

It should work more like a built-in skill-tool-agent runtime, not like an external consulting layer.

## Decision 3 — Claude Code is inspiration, not the target

Claude Code-style systems show the value of combining:

```text
skills
tools
agents
sub-agents
permissions
context
memory
workflow execution
```

But Claude Code is not treated as a perfect design.

Areas to improve:

```text
skill quality standard
tool permission clarity
sub-agent boundaries
memory/context efficiency
evaluation and observation
workflow learning
experience reuse
```

## Decision 4 — LLM and runtime have different roles

Core distinction:

```text
LLM = reasoning intelligence
Capability Runtime = wisdom, experience and operating discipline
```

The LLM thinks.

The runtime provides:

```text
learned methods
safe tool use
role structure
agent/sub-agent boundaries
memory/context discipline
evaluation rules
accumulated experience
```

## Decision 5 — Skill, tool and agent are separate concepts

Skill:

```text
reusable learned method
```

Tool:

```text
controlled action surface
```

Agent:

```text
role/profile that owns a task, decision area or review responsibility
```

Sub-agent:

```text
narrow delegated worker with bounded context and bounded permissions
```

## Decision 6 — Agent/sub-agent distinction is useful only for boundaries

Use sub-agents for:

```text
bounded delegation
permission isolation
context isolation
parallel investigation
specialized verification
risk isolation
```

Avoid sub-agents for:

```text
cosmetic naming
unnecessary role multiplication
complexity without isolation benefit
```

## Decision 7 — Memory/context should be notes-first

Full context should not be sent into every call by default.

Accepted model:

```text
conversation/runtime trace
→ distilled notes
→ relevant active notes
→ working context
```

Raw trace is evidence.

Distilled notes are experience.

Active context is selected, not dumped wholesale.

## Decision 8 — Distillation beats pruning as the default

Pruning removes.

Distillation preserves meaning.

Preferred rule:

```text
distill first
prune only after useful meaning has been preserved
```

## Decision 9 — Notes must evolve

Notes should not be static summaries.

They should support:

```text
create
update
merge
mark stale
retire
link to replacement
promote to active context
```

This is closer to human memory than storing every raw conversation in the prompt.

## Decision 10 — Runtime should learn from workflow outcomes

Capability Runtime should observe:

```text
which skill worked
which tool was useful
which agent/sub-agent performed well
which context helped
which memory note was reused
which gate failed
which artifact mattered
```

The result of a run should become experience, not just output.

## Decision 11 — External tools and agents map into the runtime

External tools, code agents or custom agents should not define the Nexus contract.

They should map into the Capability Runtime model.

Accepted direction:

```text
external output
→ mapping layer
→ Capability Runtime contract
→ evaluation
→ distilled memory
```

## Decision 12 — Current roadmap implication

The next phase should be:

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

## One-line summary

```text
Nexus hosts the system.
LLM thinks.
Capability Runtime provides akıl, tecrübe, yöntem, izin, bağlam ve değerlendirme disiplini.
```