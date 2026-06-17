# Nexus Capability OS

This repository is the isolated `nexus` branch workspace for the Nexus AI
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

## Current Gate

Before moving between pre-integration phases, update:

```text
docs/nexus-ai-orchestration-model/packaging/PRE_INTEGRATION_PHASE_PLAN.md
```

The active rule is: no phase may start until the previous phase is marked
complete with evidence in that document.

## Useful Producer Checks

```bash
for pkg in packages/*-pipeline; do python3 engine/validate_package.py "$pkg"; done
for pkg in packages/*-pipeline; do python3 engine/run_pipeline.py "$pkg"; done
python3 engine/run_trials.py

python3 engine/validate_package.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
python3 engine/run_pipeline.py packages/research-pipeline
```
