# Pipeline Definition Gap — markdown-only pipelines

> Status: **RESOLVED 2026-06-07; extended 2026-06-13** — the 5 *defined* pipelines below now have machine-readable YAML defs + stage contracts + built, validated packages, and a 7th pipeline (`product_discovery_pipeline`) was since authored YAML-native (`packages/INDEX.yaml` = **7 packages**). The procedure in this doc now applies only to the 5 catalog **candidate** pipelines (content / data_processing / model_inference / customer_support / business_strategy), which remain undefined.

## What
Only **`sdlc_pipeline`** has a machine-readable definition (`configs/nexus-ai/sdlc_pipeline.yaml` + `configs/nexus-ai/stages/sdlc/*.yaml`) and therefore a built `.pipeline` package.

The other **5 defined** pipelines exist only as **markdown** `definition_doc`s (under `docs/nexus-ai-orchestration-model/legacy/pipeline-catalog/`), not as machine-readable YAML:

| pipeline | stages | definition today |
|---|---|---|
| research_pipeline | 10 | markdown only |
| activation_pipeline | 7 | markdown only |
| operations_pipeline | 6 | markdown only |
| skill_governance_pipeline | 7 | markdown only |
| knowledge_memory_pipeline | 6 | markdown only |

(5 further pipelines — content, data_processing, model_inference, customer_support, business_strategy — are catalog **candidates**, not defined at all.)

## Why it matters
The packager (`engine/package_pipeline.py`) consumes a **machine-readable** pipeline definition (with `uses_*`, `stages`, `required_gates`, `required_evidence`/`required_trace`). It cannot package a markdown doc. So **"package the rest" is blocked** until each pipeline has a YAML definition + stage contracts like sdlc. The engine itself already generalizes — it packaged sdlc generically; the gap is **content (blueprint), not tooling.**

## Next blueprint task (before packaging the rest)
For each of the 5 defined pipelines, author:
1. `configs/nexus-ai/<pipeline>.yaml` — the Pipeline Definition Contract (`uses_*`, `stages`, `required_gates`, `required_evidence`/`required_trace`, entry/exit/blocking conditions, rework routes), mirroring `sdlc_pipeline.yaml`;
2. its per-stage contracts under `configs/nexus-ai/stages/<pipeline>/*.yaml`.

Then:
```bash
python3 engine/package_pipeline.py --pipeline configs/nexus-ai/<pipeline>.yaml   # produces packages/<pipeline>/
python3 engine/validate_package.py packages/<pipeline>                            # PASS
python3 engine/build_catalog.py                                                   # indexes it
# and fill the `package:` field for that pipeline in pipeline_selection_contract.yaml
```

Tracked in `pipeline_selection_contract.yaml` → `packaging_status` (`defined_markdown_only_not_yet_packaged`).
