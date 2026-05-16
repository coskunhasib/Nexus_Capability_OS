# Repository Instructions for AI Assistants

Before proposing or editing code, read:

```text
AGENTS.md
docs/ai-entrypoint.md
docs/nexus-data-contract-roadmap.md
docs/post-roadmap-backlog.md
docs/verification-contract.md
docs/runtime-security-policy.md
```

Current active roadmap item:

```text
33. Nexus data contract discovery
```

Key rule:

```text
Do not guess hidden Nexus data fields.
Build the Nexus-owned data contract before implementing result ingestion.
External tool outputs must map into the Nexus contract, not define it.
```

Baseline verification:

```bash
npm run build
npm run check:generated
```
