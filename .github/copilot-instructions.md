# Repository Instructions for AI Assistants

Before proposing or editing code, read:

```text
AGENTS.md
AI_ENTRYPOINT.md
docs/ai-entrypoint.md
docs/nexus-unknown-mode.md
docs/nexus-capability-runtime-philosophy.md
docs/memory-context-distillation-plan.md
docs/post-roadmap-backlog.md
docs/verification-contract.md
docs/runtime-security-policy.md
```

Current active roadmap item:

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

Baseline verification:

```bash
npm run build
npm run check:generated
```