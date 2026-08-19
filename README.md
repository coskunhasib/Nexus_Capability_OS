# Nexus Capability OS — RETIRED ACTIVE WORKSPACE

> **Retired for active Nexus development as of 2026-08-19.**  
> Canonical implementation repository: `coskunhasib/LLM_Calismalari`.  
> Do not create new pipelines, feature branches, development-note branches, agent work branches or implementation PRs in this repository.
>
> Canonical long-lived work lines:
> - Investment: `coskunhasib/LLM_Calismalari@feature/nexus-investment-pipeline`
> - Nexus development notes: `coskunhasib/LLM_Calismalari@nexus-gelistirme-notlari`
> - Inference optimization: `coskunhasib/LLM_Calismalari@nexus/inference-optimization`
>
> This repository remains only as historical/archive material until separately deleted or archived at the GitHub repository level.

---

# Historical README

This repository was the isolated `nexus` branch workspace for the Nexus AI
Orchestration Model / Capability OS package layer.

It is not a React/Vite app. The previous local visualization/demo shell has
been removed so this repo stays focused on orchestration contracts, packages,
and producer-side verification.

## Primary Areas

- `configs/nexus-ai/` — canonical pipeline, stage, registry, governance, audit,
  and runtime-rule configuration.
- `packages/` — self-contained `.pipeline` packages produced from the shared
  registry and pipeline definitions.
- `engine/` — local producer-side workbench for packaging, validation, mock
  runs, chain checks, catalog building, and intent-selection trials.
- `docs/nexus-ai-orchestration-model/` — canonical documentation, packaging
  contracts, readiness reports, and phase-gate plans.

## Historical Gate

Before moving between pre-integration phases, the historical workflow updated:

```text
docs/nexus-ai-orchestration-model/packaging/PRE_INTEGRATION_PHASE_PLAN.md
```

The historical rule was: no phase may start until the previous phase is marked
complete with evidence in that document.

## Historical Producer Checks

```bash
for pkg in packages/*-pipeline; do python3 engine/validate_package.py "$pkg"; done
for pkg in packages/*-pipeline; do python3 engine/run_pipeline.py "$pkg"; done
python3 engine/run_trials.py

python3 engine/validate_package.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
python3 engine/run_pipeline.py packages/research-pipeline
```
