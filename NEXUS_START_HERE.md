# Nexus Start Here

This repository must be readable by Nexus with zero prior context.

## Read first

Start with the roadmap, not implementation code:

```text
1. docs/nexus-data-contract-roadmap.md
2. docs/post-roadmap-backlog.md
3. docs/ai-entrypoint.md
4. AGENTS.md
5. docs/verification-contract.md
6. docs/runtime-security-policy.md
```

## Current situation

```text
The repo has adapter/runtime infrastructure.
The repo does not yet know the full real Nexus data model.
Therefore, Nexus result ingestion must not be implemented by guessing fields.
```

## Current active item

```text
33. Nexus data contract discovery
```

Expected next file:

```text
docs/nexus-data-contract-inventory.md
```

## What Nexus should do next

```text
1. Inventory existing Nexus-facing data surfaces.
2. Mark fields as canonical, adapter-derived, runtime-derived, UI-only, temporary or unknown.
3. Document unknown fields instead of inventing them.
4. Only after discovery, define the Nexus canonical result envelope.
```

## Do not skip to these yet

```text
Do not implement nexus-result-ingestion.ts yet.
Do not finalize result schemas yet.
Do not map code-agent output into Nexus yet.
Do not wire direct runtime mode yet.
```

## Simple project map

```text
Roadmap: docs/nexus-data-contract-roadmap.md
Active backlog: docs/post-roadmap-backlog.md
Verification: docs/verification-contract.md
Security: docs/runtime-security-policy.md
UI implementation state: docs/ui-runtime-implementation-plan.md
```

## Baseline verification

```bash
npm run build
npm run check:generated
```
