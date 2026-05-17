# AI Entrypoint

This repository has a required first-read path for AI agents and Nexus-side integrators.

Read these files before changing code or designing integrations:

```text
1. AGENTS.md
2. docs/ai-entrypoint.md
3. docs/nexus-unknown-mode.md
4. docs/nexus-capability-runtime-philosophy.md
5. docs/memory-context-distillation-plan.md
6. docs/post-roadmap-backlog.md
7. docs/verification-contract.md
8. docs/runtime-security-policy.md
```

Current active item:

```text
33. Capability Runtime data model discovery
```

Current framing:

```text
LLM = reasoning intelligence.
Nexus Capability Runtime = wisdom, experience and operating discipline.
```

Memory/context rule:

```text
Use notes-first memory.
Distill conversations and runtime traces into living notes.
Use only relevant active notes as working context.
Update, merge or retire notes when they become stale.
```

Next expected output:

```text
docs/nexus-data-contract-inventory.md
```

Baseline verification:

```bash
npm run build
npm run check:generated
```