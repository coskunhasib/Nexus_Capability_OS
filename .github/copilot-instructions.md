# Repository Instructions for AI Assistants

Before proposing or editing code, read:

```text
AGENTS.md
AI_ENTRYPOINT.md
docs/ai-entrypoint.md
docs/nexus-unknown-mode.md
docs/nexus-data-contract-roadmap.md
docs/post-roadmap-backlog.md
docs/verification-contract.md
docs/runtime-security-policy.md
```

Current active roadmap item:

```text
33. Nexus data contract discovery
```

Current mode:

```text
Nexus Unknown Mode is active.
First discover the Nexus-facing data contract.
Then define the canonical result envelope.
Then implement result ingestion.
```

Baseline verification:

```bash
npm run build
npm run check:generated
```