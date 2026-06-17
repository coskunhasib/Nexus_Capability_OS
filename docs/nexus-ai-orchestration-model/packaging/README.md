# Pipeline Packaging

Pipelines are packaged like Claude skills (`.skill` → `.pipeline`): **self-contained, portable, pullable** units. A host runtime (Nexus) imports a package and runs it.

This folder holds the **packaging standard** and the **Nexus handoff** material.

## Why
- **Portability:** anyone pulls the pipeline they need.
- **Clean integration:** when integrating into Nexus we hand over the **package + contracts**; the dev interface stays here.
- **Governance travels with the pipeline:** the package-declared gate set + evidence/trace are *inside* the package (MetaGPT/Atoms lack this).

## Responsibility split (short)
- **Us (Capability OS):** define the package **format**, **produce** packages, **label** each part (id + version), build a local **test tool**, and write the **consumer contract + reference plan** for Nexus.
- **Nexus (product runtime):** **import**, **compute the content fingerprint**, **dedup/share** common parts, **resolve** deps against the Shared Registry. *(We never pre-assign fingerprints — the consumer computes them.)*

## Contents (building incrementally)
| File | What | Status |
|---|---|---|
| [`PIPELINE_PACKAGE_FORMAT.md`](./PIPELINE_PACKAGE_FORMAT.md) | The `.pipeline` package format spec | **draft-0.1** |
| [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md) | What Nexus must do on import (import/fingerprint/dedup/resolve) | **draft-0.1** |
| [`NEXUS_INTEGRATION_PLAN.md`](./NEXUS_INTEGRATION_PLAN.md) | Reference/sample implementation plan for the Nexus side | **draft-0.1** |
| [`PRE_INTEGRATION_PHASE_PLAN.md`](./PRE_INTEGRATION_PHASE_PLAN.md) | Mandatory phase gate before Nexus product integration starts | **active** |
| [`MAIN_NEXUS_READ_ONLY_AUDIT.md`](./MAIN_NEXUS_READ_ONLY_AUDIT.md) | Phase 3 read-only socket audit of the main Nexus product repo | **complete** |
| [`CONSUMER_RUNTIME_DESIGN_LOCK.md`](./CONSUMER_RUNTIME_DESIGN_LOCK.md) | Phase 4 consumer runtime decisions before product-repo coding | **complete** |
| [`PIPELINE_DEFINITION_GAP.md`](./PIPELINE_DEFINITION_GAP.md) | Historical package-definition gap audit; now resolved for all catalog pipelines | **resolved** |
| [`RESEARCH_PILOT_BOUNDARY.md`](./RESEARCH_PILOT_BOUNDARY.md) | First pilot boundary: research package import/run contract | **draft-0.1** |
| [`RESEARCH_PILOT_READINESS_REPORT.md`](./RESEARCH_PILOT_READINESS_REPORT.md) | Producer-side readiness evidence for the first pilot handoff | **producer-ready** |

Related (in this repo):
- `packages/INDEX.yaml` — pull catalog for all 13 packaged catalog pipelines.
- `packages/main-product-pipeline/` — packaged orchestration-level main product journey.
- `packages/research-pipeline/` — the recommended first Nexus pilot package (30 components, 14 gates, 11 stages).
- Specialist packages include SDLC, discovery, activation, operations, skill-governance,
  knowledge-memory, content, data-processing, model-inference, customer-support, and
  business-strategy.
- `engine/` — the local "is this package valid / does it run" test tool (our workbench; **stays here**, not shipped).

First pilot handoff set:
- `packages/research-pipeline/`
- `PRE_INTEGRATION_PHASE_PLAN.md`
- `MAIN_NEXUS_READ_ONLY_AUDIT.md`
- `CONSUMER_RUNTIME_DESIGN_LOCK.md`
- `RESEARCH_PILOT_BOUNDARY.md`
- `RESEARCH_PILOT_READINESS_REPORT.md`

## Roadmap (owner-directed, 2026-06-07)
1. Build a working skeleton via the MetaGPT → Capability OS transfer.
2. Run it on the first example pipeline: **`sdlc_pipeline`**.
3. **Last:** discuss integrating into the final product repo (Nexus) — **only with explicit owner approval**.

> Scope guard: this is the isolated `nexus` branch. Documentation/spec + an owner-authorized skeleton only. No merge into `main`; final-repo integration is a separate, owner-approved step.
