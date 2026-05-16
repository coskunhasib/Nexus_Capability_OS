# AI Agent Entry Point

This file is the required first-read guide for any AI agent, Nexus-side integrator, coding assistant or automation agent entering this repository.

## Read this first

Before changing code, creating schemas or implementing integrations, read these documents in order:

```text
1. docs/ai-entrypoint.md
2. docs/nexus-data-contract-roadmap.md
3. docs/post-roadmap-backlog.md
4. docs/verification-contract.md
5. docs/runtime-security-policy.md
6. docs/operator-run-result-ingestion-plan.md
```

## Current rule

```text
Do not implement Nexus result ingestion by guessing hidden Nexus data.
Do not treat any third-party runtime as the source of truth.
Treat Nexus as the integration owner.
Build an explicit Nexus data contract first.
```

## Current next item

```text
33. Nexus data contract discovery
```

Do not skip directly to result ingestion, direct runtime wiring, code-agent mapping or schema finalization before item 33 is completed.

## Safe working pattern

```text
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
