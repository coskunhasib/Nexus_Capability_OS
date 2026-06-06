# Stale Reference Sweep

This report documents the scan and cleanup of legacy references to `docs/ai-sdlc-factory` across the repository.

## Sweep Process

We developed a script:
```bash
npx tsx runtime/rewrite-config-links.ts
```

The script scanned:
- All `.yaml` and `.yml` configuration files under `configs/nexus-ai/`
- All `.md` session memory files under `.memory/`

It matched the pattern:
`docs/ai-sdlc-factory/<path>`

and replaced it with the new path from the migration map.

## Sweep Results

- **Configuration Files Sweep:** Updated 262 path references inside YAML files under `configs/nexus-ai/` (including stage contracts, agent roles, governance templates, context profiles, and registry settings).
- **Memory Parts Sweep:** Updated 18 path references inside `.memory/` files (ensuring all bootstrap logs and session updates point to the new canonical namespace).
- **Wildcard and Description Cleanups:** Manual/regex cleanup was applied to wildcards (e.g. `pipeline-catalog/*.md` and JSON schema description metadata fields) to ensure a complete transition.

## Stale Mentions Retained for Context
The following instances of the legacy name are intentionally retained:
1. Deprecation stubs at `docs/ai-sdlc-factory/**` (to describe the deprecation of the legacy directory).
2. Historical audit reports (`docs/nexus-ai-orchestration-model/28-namespace-and-scope-consistency-audit.md` and `docs/nexus-ai-orchestration-model/29-full-namespace-migration-workpackage.md`) describing the legacy state.
3. This migration report directory (`docs/nexus-ai-orchestration-model/migration/`).
