# AI Agent Entry Point

This file is the required first-read guide for any AI agent, Nexus-side integrator, coding assistant or automation agent entering this repository.

## Read this first

Before changing code, creating schemas or implementing integrations, read these documents in order:

```text
1. AI_ENTRYPOINT.md
2. docs/ai-entrypoint.md
3. docs/nexus-unknown-mode.md
4. docs/nexus-capability-runtime-philosophy.md
5. docs/memory-context-distillation-plan.md
6. docs/post-roadmap-backlog.md
7. docs/verification-contract.md
8. docs/runtime-security-policy.md
```

## Current rule

```text
Nexus is the host system.
Capability Runtime is the embedded wisdom / experience / operating-discipline layer.
LLM provides reasoning intelligence.
The runtime provides skills, tools, agents/sub-agents, memory, context and evaluation.
```

## Current next item

```text
33. Capability Runtime data model discovery
```

Expected output:

```text
docs/nexus-data-contract-inventory.md
```

## Memory/context rule

```text
Use notes-first memory.
Distill conversations and runtime traces into living notes.
Send only relevant active notes into working context.
Update, merge or retire notes as they become stale.
```

## Safe working pattern

```text
read entrypoint
read roadmap
identify current item
make one focused branch
update docs/backlog before merge
run npm run build && npm run check:generated
wait for CI
merge only when green
```

## Verification baseline

```bash
npm run build
npm run check:generated
```

The full verification map is documented in:

```text
docs/verification-contract.md
```