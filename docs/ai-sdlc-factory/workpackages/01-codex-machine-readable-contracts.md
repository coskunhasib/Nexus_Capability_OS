# WP-01 — Codex Machine-readable Contracts

## Executor

```text
Codex
```

## Objective

Markdown/YAML-block sözleşmeleri makine-okunabilir YAML/JSON dosyalarına dönüştürmek ve şema doğrulaması için hazırlamak.

## Inputs

```text
docs/ai-sdlc-factory/07-pipeline-contract-standard.md
docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md
docs/ai-sdlc-factory/sdlc-stages/*
docs/ai-sdlc-factory/11-artifact-registry-standard.md
configs/nexus-ai/artifact_registry.yaml
configs/nexus-ai/pipeline_contract_standard.yaml
configs/nexus-ai/sdlc_pipeline.yaml
```

## Expected outputs

```text
configs/nexus-ai/stages/sdlc/*.yaml
configs/nexus-ai/schemas/pipeline_definition.schema.json
configs/nexus-ai/schemas/pipeline_run.schema.json
configs/nexus-ai/schemas/stage_contract.schema.json
configs/nexus-ai/schemas/artifact_registry.schema.json
configs/nexus-ai/validation/README.md
```

## Required rules

```text
Shared usage fields must be present on every stage.
Conditional gates must include applicability_decision.
No plugin fields may be introduced.
Core Abilities must not be converted into agents.
Stage routes must match canonical correction overrides.
```

## Local checks

```text
YAML parse pass
JSON schema parse pass
No missing shared usage fields
No unknown stage referenced by on_pass/on_fail/rework_route
No release_candidate before development_completion
```

## Completion report

Return:

```yaml
workpackage_id: WP-01
executor: Codex
status:
files_created:
files_modified:
gates_passed:
gates_failed:
open_questions:
needs_review:
```
