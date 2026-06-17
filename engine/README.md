# Capability OS — Engine (workbench)

The local **workbench** for authoring, validating, and test-running `.pipeline` packages.

> **Stays here — not shipped to Nexus.** This is producer-side dev tooling. The production
> runtime (import, content-fingerprint, dedup/share, marketplace pull) is **Nexus's** job —
> see [`../docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md`](../docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md),
> [`../docs/nexus-ai-orchestration-model/packaging/CONSUMER_RUNTIME_DESIGN_LOCK.md`](../docs/nexus-ai-orchestration-model/packaging/CONSUMER_RUNTIME_DESIGN_LOCK.md)
> and [`../docs/nexus-ai-orchestration-model/packaging/NEXUS_INTEGRATION_PLAN.md`](../docs/nexus-ai-orchestration-model/packaging/NEXUS_INTEGRATION_PLAN.md).

## Tools

| Tool | What it does |
|---|---|
| `package_pipeline.py` | Reads a pipeline def + the Shared Registry → emits a self-contained `.pipeline` package (manifest + components + gates + evidence + stages). |
| `validate_package.py` | Checks a package conforms to the format (manifest, contract fields, all parts present, package-declared gates, evidence/trace, every stage). |
| `run_pipeline.py` | Loads a package and runs it end-to-end with a **mock** agent loop (observe→think→act), enforces the gates, emits evidence + trace, prints a verdict. |
| `run_chain.py` | **(chain)** Runs a multi-pipeline handoff chain (`chains/*.chain.yaml`) and asserts each handoff artifact is produced upstream **and** declared as an input downstream — proves the orchestration model is whole end-to-end, not just per-pipeline. |
| `select_pipeline.py` | **(T1)** Deterministic intent→pipeline selector via `configs/nexus-ai/pipeline_selection_contract.yaml`; ambiguous → defer to orchestrator/owner. |
| `build_catalog.py` | Scans `packages/` → `packages/INDEX.yaml` (the pull catalog a host/Nexus acquires from). |
| `run_trials.py` | **(T2)** Runs `trials/*.trial.yaml` golden cases (intent → expected pipeline + package shape). |

## Usage

```bash
python3 engine/package_pipeline.py                              # 1. produce the sdlc package
python3 engine/validate_package.py packages/sdlc-pipeline       # 2. validate it
python3 engine/run_pipeline.py    packages/sdlc-pipeline        # 3. run it (mock) -> PASS
python3 engine/run_pipeline.py    packages/sdlc-pipeline --skip requirements   # gate enforcement bites -> FAIL
python3 engine/run_chain.py                                     # prove the discovery->sdlc handoff chain
python3 engine/select_pipeline.py --intent "bir SaaS MVP yap"   # T1: intent -> pipeline + package
python3 engine/build_catalog.py                                 # build the pull catalog (packages/INDEX.yaml)
python3 engine/run_trials.py                                    # T2: run acceptance fixtures (11/11)
```

Requires Python 3 + PyYAML. Run outputs go to `engine/runs/` (gitignored).

## Real vs mock (v0)

- **Real:** the orchestration loop (stages in order, all 13 catalog pipelines); **gate enforcement for every pipeline** via its explicit gate→producer map where present and derived fallback from each package's stage contracts (skip a producing stage → its gate FAILs); **cross-pipeline handoff proof** (`run_chain.py`: discovery GO → sdlc); evidence/trace emission; package self-containment + **coherence validation** (required-evidence coverage + gate-producer coverage).
- **Mock:** the agent "work" itself (deterministic stubs — no LLM, no network).

## The MetaGPT transfer

- v0 brings MetaGPT's **observe→think→act** agent loop + **ActionNode-style structured output** as the stage executor.
- NCO keeps the edge MetaGPT lacks: **governance / gates / evidence travel inside the package** and are enforced at run time.
- **v1 (next):** real LLM calls, a **code-execution sandbox** (DataInterpreter-style write→run→self-debug), dynamic planning, and **AFlow-style** workflow self-optimization.

## Latest run state

**13 catalog pipelines packaged** (main-product, sdlc, product-discovery, research, activation, operations, skill-governance, knowledge-memory, content, data-processing, model-inference, customer-support, business-strategy) — all **validate + run PASS**.
- `sdlc_pipeline` → 31/31 stages · 19/19 always-gates.
- `main_product_pipeline` → 9/9 stages · 11/11 always-gates.
- `product_discovery_pipeline` → 7/7 · 12/12 — front-runs sdlc: a raw idea enters discovery first; a GO hands off PRODUCT_BRIEF (verify-fidelity at sdlc intake).
- New specialist packages (`content`, `data_processing`, `model_inference`, `customer_support`, `business_strategy`) each validate/run with 5 stages and 7 always-gates.
- Chain `discovery→sdlc` **PASS** · trials **11/11**.
