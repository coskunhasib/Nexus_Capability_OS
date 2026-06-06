# Pipeline Packaging

Pipelines are packaged like Claude skills (`.skill` → `.pipeline`): **self-contained, portable, pullable** units. A host runtime (Nexus) imports a package and runs it.

This folder holds the **packaging standard** and the **Nexus handoff** material.

## Why
- **Portability:** anyone pulls the pipeline they need.
- **Clean integration:** when integrating into Nexus we hand over the **package + contracts**; the dev interface stays here.
- **Governance travels with the pipeline:** the 19-gate set (D-016) + evidence/trace are *inside* the package (MetaGPT/Atoms lack this).

## Responsibility split (short)
- **Us (Capability OS):** define the package **format**, **produce** packages, **label** each part (id + version), build a local **test tool**, and write the **consumer contract + reference plan** for Nexus.
- **Nexus (product runtime):** **import**, **compute the content fingerprint**, **dedup/share** common parts, **resolve** deps against the Shared Registry. *(We never pre-assign fingerprints — the consumer computes them.)*

## Contents (building incrementally)
| File | What | Status |
|---|---|---|
| [`PIPELINE_PACKAGE_FORMAT.md`](./PIPELINE_PACKAGE_FORMAT.md) | The `.pipeline` package format spec | **draft-0.1** |
| [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md) | What Nexus must do on import (import/fingerprint/dedup/resolve) | **draft-0.1** |
| [`NEXUS_INTEGRATION_PLAN.md`](./NEXUS_INTEGRATION_PLAN.md) | Reference/sample implementation plan for the Nexus side | **draft-0.1** |

Related (elsewhere in the repo, planned):
- `packages/sdlc/` — the first example package (the `sdlc_pipeline` packaged).
- `engine/` — the local "is this package valid / does it run" test tool (our workbench; **stays here**, not shipped).

## Roadmap (owner-directed, 2026-06-07)
1. Build a working skeleton via the MetaGPT → Capability OS transfer.
2. Run it on the first example pipeline: **`sdlc_pipeline`**.
3. **Last:** discuss integrating into the final product repo (Nexus) — **only with explicit owner approval**.

> Scope guard: this is the isolated `nexus` branch. Documentation/spec + an owner-authorized skeleton only. No merge into `main`; final-repo integration is a separate, owner-approved step.
