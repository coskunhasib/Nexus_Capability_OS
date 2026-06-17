# Pipeline Definition Gap — resolved

> Status: **RESOLVED 2026-06-17** — all catalog pipelines now have
> machine-readable YAML definitions, per-stage contracts, built packages, and
> pull-catalog entries (`packages/INDEX.yaml` = **13 packages**).

## What

The prior gap was that some catalog entries had no machine-readable definition
or package. That is no longer true.

Packaged catalog:

| pipeline | stages | definition today |
|---|---:|---|
| main_product_pipeline | 9 | YAML + stage contracts + package |
| sdlc_pipeline | 31 | YAML + stage contracts + package |
| product_discovery_pipeline | 7 | YAML + stage contracts + package |
| research_pipeline | 11 | YAML + stage contracts + package |
| activation_pipeline | 8 | YAML + stage contracts + package |
| operations_pipeline | 7 | YAML + stage contracts + package |
| skill_governance_pipeline | 8 | YAML + stage contracts + package |
| knowledge_memory_pipeline | 7 | YAML + stage contracts + package |
| content_pipeline | 5 | YAML + stage contracts + package |
| data_processing_pipeline | 5 | YAML + stage contracts + package |
| model_inference_pipeline | 5 | YAML + stage contracts + package |
| customer_support_pipeline | 5 | YAML + stage contracts + package |
| business_strategy_pipeline | 5 | YAML + stage contracts + package |

## Why It Matters

The packager (`engine/package_pipeline.py`) consumes a **machine-readable**
pipeline definition with `uses_*`, `stages`, `required_gates`,
`required_evidence`, and `required_trace`. All catalog pipelines now satisfy
that input contract.

## Verification

```bash
for pkg in packages/*-pipeline; do python3 engine/validate_package.py "$pkg"; done
for pkg in packages/*-pipeline; do python3 engine/run_pipeline.py "$pkg"; done
python3 engine/run_trials.py
```

`pipeline_selection_contract.yaml` now has no
`orchestration_defined_not_yet_packaged`, `defined_markdown_only_not_yet_packaged`,
or `candidate_not_defined` entries.
