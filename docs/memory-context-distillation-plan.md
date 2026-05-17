# Memory / Context Distillation Plan

This document defines the memory and context direction for Nexus Capability Runtime.

## Core idea

```text
Do not send the full conversation every time.
Distill each interaction into living notes.
Use only relevant notes as active context.
Update notes iteratively when they become stale, wrong or no longer useful.
```

## Why this matters

Full-context forwarding is simple but inefficient.

It creates:

```text
high token cost
large irrelevant context
higher chance of stale facts being reused
lower signal-to-noise ratio
poor long-term learning
```

A notes-first memory system is closer to human working behavior:

```text
we do not replay every conversation in full
we carry lessons, decisions, patterns and open questions
we update those notes when reality changes
```

## Memory layers

### 1. Raw trace

Purpose:

```text
audit trail
source evidence
replay/debug only
```

Default behavior:

```text
not sent into every LLM call
not treated as working context
used only through references or targeted retrieval
```

### 2. Distilled note

Purpose:

```text
carry durable meaning from conversations and runtime events
```

Contains:

```text
decisions
preferences
lessons learned
failure causes
successful patterns
skill/tool/agent observations
artifact meaning
open questions
constraints
```

### 3. Active working context

Purpose:

```text
small context bundle selected for the current task
```

Contains:

```text
only relevant active notes
current task state
current constraints
current open questions
needed source refs
```

### 4. Retired note

Purpose:

```text
keep history without polluting active context
```

Used when:

```text
note became stale
decision was replaced
preference changed
project direction changed
lesson is no longer useful
```

## Note format

A distilled note should be structured enough to update later.

Suggested shape:

```text
note_id
topic
note_type: decision | preference | lesson | failure | pattern | constraint | open_question | artifact_summary
summary
source_refs[]
confidence: low | medium | high
status: active | stale | retired
created_at
last_updated
stale_reason optional
replaces[] optional
related_notes[] optional
```

## Distillation flow

```text
conversation / runtime event / review output
→ extract meaningful facts, decisions, failures and open questions
→ compare with existing notes
→ create, update, merge or retire notes
→ select relevant active notes for the next task
→ keep raw trace out of active context unless specifically needed
```

## Note update operations

```text
create_note
update_note
merge_notes
retire_note
mark_stale
link_notes
promote_to_active_context
```

## Context selection policy

Before an LLM call, build context from:

```text
current user request
current task packet
relevant active notes
recent unresolved open questions
required artifacts or summaries
```

Avoid sending:

```text
full conversation transcript
full runtime logs
irrelevant old decisions
retired notes
raw artifacts when summaries/refs are enough
```

## Distillation versus pruning

```text
Pruning cuts content.
Distillation converts content into reusable experience.
```

Use pruning only after a distilled note exists, or when content is pure duplicate/noise.

## Staleness rules

A note becomes stale when:

```text
new user instruction contradicts it
new architecture decision replaces it
implementation proves it wrong
it is no longer relevant to the current Nexus direction
its source was temporary/mock-only
```

Stale notes should not vanish immediately. Prefer:

```text
mark stale
record stale_reason
link replacement note
retire when no longer useful
```

## Research-aligned references

This design aligns with several memory/context directions:

```text
MemGPT — virtual context management and memory tiers
A-MEM — agentic memory, Zettelkasten-style linked notes and memory evolution
ACON — optimized context compression for long-horizon agents
AgeMem — memory operations as agent actions across long-term and short-term memory
```

The practical lesson:

```text
Use memory as an evolving note system, not a giant prompt buffer.
```

## Roadmap impact

This plan expands item 38:

```text
38. Memory/context distillation model
```

Definition of done for item 38:

```text
Define note schema.
Define note lifecycle.
Define distillation operations.
Define active context selection.
Define stale/retired note behavior.
Define how review/runtime outputs become notes.
Define verification fixtures for create/update/retire flows.
```

## Future implementation files

Likely files:

```text
src/memoryNoteModel.ts
src/contextSelection.ts
src/memoryDistillation.ts
schemas/memory-note.schema.json
samples/memory-notes/*.json
scripts/verify-memory-distillation.ts
docs/memory-context-distillation.md
```

## Verification goal

Future verifier should prove:

```text
new notes can be created from review/runtime output
existing notes can be updated instead of duplicated
stale notes can be retired
active context contains only relevant active notes
raw trace is not included by default
```

Suggested script:

```bash
npm run verify:memory-distillation
```