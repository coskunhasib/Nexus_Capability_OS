# AI Entrypoint

This repository has a required first-read path for AI agents and Nexus-side integrators.

Read these files before changing code or designing integrations:

```text
1. AGENTS.md
2. docs/ai-entrypoint.md
3. docs/nexus-data-contract-roadmap.md
4. docs/post-roadmap-backlog.md
5. docs/verification-contract.md
6. docs/runtime-security-policy.md
```

Current active item:

```text
33. Nexus data contract discovery
```

Current rule:

```text
Build the Nexus-owned data contract before implementing result ingestion.
Do not guess hidden Nexus fields.
Do not let external tool output define the Nexus contract.
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
