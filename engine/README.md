# Capability OS — Engine (workbench)

The local **workbench** for authoring, validating, and test-running `.pipeline` packages.

> **Stays here — not shipped to Nexus.** This is producer-side dev tooling. The production
> runtime (import, content-fingerprint, dedup/share, marketplace pull) is **Nexus's** job —
> see [`../docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md`](../docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md)
> and [`NEXUS_INTEGRATION_PLAN.md`](../docs/nexus-ai-orchestration-model/packaging/NEXUS_INTEGRATION_PLAN.md).

## Tools

| Tool | What it does |
|---|---|
| `package_pipeline.py` | Reads a pipeline def + the Shared Registry → emits a self-contained `.pipeline` package (manifest + components + gates + evidence + stages). |
| `validate_package.py` | Checks a package conforms to the format (manifest, contract fields, all parts present, D-016 19 gates, evidence/trace, every stage). |
| `run_pipeline.py` | Loads a package and runs it end-to-end with a **mock** agent loop (observe→think→act), enforces the gates, emits evidence + trace, prints a verdict. |
| `select_pipeline.py` | **(T1)** Deterministic intent→pipeline selector via `configs/nexus-ai/pipeline_selection_contract.yaml`; ambiguous → defer to orchestrator/owner. |
| `build_catalog.py` | Scans `packages/` → `packages/INDEX.yaml` (the pull catalog a host/Nexus acquires from). |
| `run_trials.py` | **(T2)** Runs `trials/*.trial.yaml` golden cases (intent → expected pipeline + package shape). |

## Usage

```bash
python3 engine/package_pipeline.py                              # 1. produce the sdlc package
python3 engine/validate_package.py packages/sdlc-pipeline       # 2. validate it
python3 engine/run_pipeline.py    packages/sdlc-pipeline        # 3. run it (mock) -> PASS
python3 engine/run_pipeline.py    packages/sdlc-pipeline --skip requirements   # gate enforcement bites -> FAIL
python3 engine/select_pipeline.py --intent "bir SaaS MVP yap"   # T1: intent -> pipeline + package
python3 engine/build_catalog.py                                 # build the pull catalog (packages/INDEX.yaml)
python3 engine/run_trials.py                                    # T2: run acceptance fixtures (5/5)
```

Requires Python 3 + PyYAML. Run outputs go to `engine/runs/` (gitignored).

## Real vs mock (v0)

- **Real:** the orchestration loop (stages in order, all 6 pipelines); **gate enforcement for every pipeline** — sdlc via its explicit gate→producer map (D-016 19), the other 5 **derived** from each package's stage contracts (skip a producing stage → its gate FAILs); evidence/trace emission; package self-containment + validation.
- **Mock:** the agent "work" itself (deterministic stubs — no LLM, no network).

## The MetaGPT transfer

- v0 brings MetaGPT's **observe→think→act** agent loop + **ActionNode-style structured output** as the stage executor.
- NCO keeps the edge MetaGPT lacks: **governance / gates / evidence travel inside the package** and are enforced at run time.
- **v1 (next):** real LLM calls, a **code-execution sandbox** (DataInterpreter-style write→run→self-debug), dynamic planning, and **AFlow-style** workflow self-optimization.

## Latest sdlc run

`sdlc_pipeline` → 31/31 stages · **19/19 always-required gates PASS** · 19 evidence + 5 trace · **VERDICT: PASS**.
