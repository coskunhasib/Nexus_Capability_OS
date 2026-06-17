# Pre-Integration Phase Plan

Status: active control document
Date created: 2026-06-17
Branch rule: `nexus` only; no `main` merge
Integration rule: do not start Nexus product integration from this repo

## Control Rule

This document is the phase gate for the pre-integration process.

No next phase may start until all of the following are true:

1. The current phase is marked `COMPLETE` in this document.
2. The evidence section for that phase is filled in.
3. The next phase is explicitly marked `ACTIVE`.
4. The update is committed or otherwise visible in the worktree before any next-phase work begins.

If this document is not updated, the process stops.

## Phase Status

| Phase | Name | Status | Owner | Purpose |
|---|---|---|---|---|
| 0 | Repo hygiene and old UI cleanup | COMPLETE | Capability OS repo | Removed obsolete local visualization/demo layer and confirmed the repo is package/orchestration-only. |
| 1 | Producer readiness freeze | COMPLETE | Capability OS repo | Research-pipeline handoff artifacts and producer-side contract are present after cleanup. |
| 2 | Final local producer verification | COMPLETE | Capability OS repo | Package validation and mock/negative gate checks passed after cleanup. |
| 3 | Main Nexus read-only audit | COMPLETE | Nexus product repo | Inspect integration sockets without implementing integration. |
| 4 | Consumer runtime design lock | COMPLETE | Nexus product repo | Freeze importer/fingerprint/dedup/gate/evidence/runner-hook design before coding. |
| 5 | Research pilot integration | BLOCKED_UNTIL_OWNER_START | Nexus product repo | First real integration; must not be started by Codex without explicit owner instruction. |
| 6 | Skill governance pilot | PENDING_AFTER_RESEARCH | Nexus product repo | Second pilot after research proves the consumer runtime seam. |
| 7 | SDLC pipeline pilot | PENDING_AFTER_SKILL_GOVERNANCE | Nexus product repo | Larger pilot after smaller consumer-runtime proofs. |
| 8 | Marketplace, zip envelope, multi-pipeline expansion | PENDING_LATER | Nexus product repo / Capability OS | Distribution and multi-pipeline scale work after real runtime proof. |
| 9 | Orchestrator pipeline routing hardening | PENDING_POST_INTEGRATION | Nexus product repo | After integration, mission_orchestrator must know all main/specialist/blueprint pipelines and route or redirect matured intent to the best matching pipeline. |

## Phase 0: Repo Hygiene And Old UI Cleanup

Status: COMPLETE

Goal:

Confirm whether the obsolete React/Vite visualization/demo layer still exists in
this repo and remove it if present.

Candidate cleanup targets:

- `index.html`
- `src/`
- `public/`
- `dist/`
- `node_modules/`
- Vite/React-only `package.json` scripts and dependencies
- UI-only config files, if present

Must preserve:

- `configs/`
- `packages/`
- `engine/`
- `docs/nexus-ai-orchestration-model/`
- research pilot handoff documents

Evidence to fill before completion:

```text
git status --short --branch:
2026-06-17:
UI/demo cleanup pending in worktree:
- deleted .env.example
- deleted index.html
- deleted package.json
- deleted package-lock.json
- deleted tsconfig.json
- deleted vite.config.ts
- deleted src/App.tsx
- deleted src/data.ts
- deleted src/index.css
- deleted src/main.tsx
- deleted docs/metagpt-vs-nexus-comparison.html
- removed untracked/generated public/
- removed untracked/generated dist/
- removed untracked/generated node_modules/
- updated README.md to describe Nexus Capability OS, not AI Studio/Vite app

removed_or_confirmed_absent:
2026-06-17:
`find` returned no remaining root-level UI/demo targets:
index.html, package.json, package-lock.json, vite.config.ts, tsconfig.json,
src/, public/, dist/, node_modules/.

preserved_core_paths:
2026-06-17:
configs/, packages/, engine/, and docs/nexus-ai-orchestration-model/ are present.

validation_after_cleanup:
2026-06-17:
No stale AI Studio/Vite app references found outside this control document for:
AI Studio app, GEMINI_API_KEY, npm run dev, react-example, @vitejs,
React19/TS/Vite SPA, metagpt-vs-nexus-comparison.
```

Exit criteria:

- obsolete UI/demo layer is removed or proven absent;
- Capability OS package/orchestration paths are preserved;
- worktree status is understood;
- this document is updated before Phase 1 recheck starts.

## Phase 1: Producer Readiness Freeze

Status: COMPLETE

Current artifacts:

- `packages/research-pipeline/`
- `docs/nexus-ai-orchestration-model/packaging/RESEARCH_PILOT_BOUNDARY.md`
- `docs/nexus-ai-orchestration-model/packaging/RESEARCH_PILOT_READINESS_REPORT.md`
- `docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md`
- `docs/nexus-ai-orchestration-model/packaging/NEXUS_INTEGRATION_PLAN.md`
- `docs/nexus-ai-orchestration-model/packaging/PIPELINE_PACKAGE_FORMAT.md`

Recheck required after Phase 0 because repo cleanup may change package metadata,
scripts, or worktree status.

Evidence to fill before confirming final completion:

```text
handoff_artifacts_present:
2026-06-17:
Confirmed present:
- packages/research-pipeline/
- RESEARCH_PILOT_BOUNDARY.md
- RESEARCH_PILOT_READINESS_REPORT.md
- CONSUMER_CONTRACT.md
- NEXUS_INTEGRATION_PLAN.md
- PIPELINE_PACKAGE_FORMAT.md

readiness_report_current:
2026-06-17:
RESEARCH_PILOT_READINESS_REPORT.md exists and still states producer-side
ready for owner-gated Nexus consumer pilot.

boundary_current:
2026-06-17:
RESEARCH_PILOT_BOUNDARY.md exists and remains linked from packaging README
and INTEGRATION_READINESS.md.
```

## Phase 2: Final Local Producer Verification

Status: COMPLETE

Required commands:

```bash
python3 engine/validate_package.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
python3 engine/run_pipeline.py packages/research-pipeline
git diff --check
```

Expected result:

- validation passes;
- normal mock run passes;
- negative run fails on `research_protocol_pre_registered`;
- final normal run passes;
- whitespace check is clean.

Evidence to fill before completion:

```text
validate_package:
2026-06-17 PASS:
45 checks ok, 1 accepted warning, 0 fail.
Accepted warning:
research_completion<-ALL_STAGE_GATE_RESULTS

normal_run:
2026-06-17 PASS:
research_pipeline package_version 1.0.0
11/11 stages completed
13/13 always-required gates PASS
1 conditional gate evaluated
16/16 evidence artifacts emitted
7 trace records

negative_gate_run:
2026-06-17 EXPECTED FAIL:
command: python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
10/11 stages completed
12/13 always-required gates PASS
failed gate: research_protocol_pre_registered
reason: producing stage 'research_protocol_design' did not complete

final_normal_run:
2026-06-17 PASS:
research_pipeline latest run left in passing state.

diff_check:
2026-06-17 PASS:
git diff --check returned clean.
```

## Producer Package Expansion Completion

Status: COMPLETE

Scope:

The original first-pilot handoff remains `research-pipeline`, but the producer
package set has now been expanded so every catalog pipeline is machine-readable
and packaged before Nexus product integration starts.

Evidence:

```text
package_catalog:
2026-06-17:
packages/INDEX.yaml reports package_count: 13.

packaged_pipelines:
2026-06-17:
- main_product_pipeline
- product_discovery_pipeline
- sdlc_pipeline
- research_pipeline
- activation_pipeline
- operations_pipeline
- skill_governance_pipeline
- knowledge_memory_pipeline
- content_pipeline
- data_processing_pipeline
- model_inference_pipeline
- customer_support_pipeline
- business_strategy_pipeline

selection_contract:
2026-06-17:
pipeline_selection_contract.yaml lists all 13 under packaging_status.packaged
and leaves orchestration_defined_not_yet_packaged,
defined_markdown_only_not_yet_packaged, and candidate_not_defined empty.

verification:
2026-06-17:
- for pkg in packages/*-pipeline; do python3 engine/validate_package.py "$pkg"; done
- for pkg in packages/*-pipeline; do python3 engine/run_pipeline.py "$pkg"; done
- python3 engine/run_trials.py

Result:
- validate_package.py PASS for all 13 packages.
- run_pipeline.py PASS for all 13 packages.
- run_trials.py PASS 11/11.

Validator external-input handling:
2026-06-17:
Known host/runtime aggregate inputs are explicitly allowlisted in
`engine/validate_package.py`: ALL_STAGE_GATE_RESULTS, DELETION_REQUEST,
RUNBOOK, ROLLBACK_PLAN, SKILL_PACKAGES, and REWORK_HISTORY.

Result:
- validate_package.py PASS for all 13 packages.
- 0 validator warnings across all 13 packages.
```

## Phase 3: Main Nexus Read-Only Audit

Status: COMPLETE

Rule:

Read only. No product repo modification. No integration implementation.

Audit questions:

- Where does package import belong?
- Where are Shared Registry / skill registry / tool registry boundaries?
- Are `web_research.py` and `web_search.py` the correct research socket?
- Where do evidence and trace records belong?
- Where is sandbox / credential boundary enforced?
- What existing runner/stage orchestration can host gate enforcement?

Evidence to fill before completion:

```text
audited_paths:
2026-06-17:
Read-only audit completed against `/Users/hasibcoskun/Documents/Nexus_Project`.
Product repo branch observed: `feat/ui-simplification-r1` ahead of origin by
4 commits, dirty before audit. No product repo files were modified.

Primary audited paths:
- .memory
- nexus-backend/main.py
- nexus-backend/app_bootstrap/routes.py
- nexus-backend/app_bootstrap/lifecycle.py
- nexus-backend/app_bootstrap/lifecycle_startup.py
- nexus-backend/app_bootstrap/lifecycle_wiring.py
- nexus-backend/models/pipeline.py
- nexus-backend/schemas/pipeline.py
- nexus-backend/routers/pipelines*.py
- nexus-backend/services/pipeline_engine*.py
- nexus-backend/services/cognitive_pipeline*.py
- nexus-backend/models/execution.py
- nexus-backend/models/cognitive_run.py
- nexus-backend/models/plan_review.py
- nexus-backend/services/plan_review*.py
- nexus-backend/services/permission_gate*.py
- nexus-backend/services/orchestration_timeline.py
- nexus-backend/services/task_orchestration*.py
- nexus-backend/services/controlled_routing_policy.py
- nexus-backend/models/skill.py
- nexus-backend/routers/agents_skills.py
- nexus-backend/services/skill_registry_truth*.py
- nexus-backend/services/agent_engine_skills.py
- nexus-backend/services/skills/web.py
- nexus-backend/services/skills/web_search.py
- nexus-backend/services/skills/web_research.py
- nexus-backend/services/skills/web_policy.py
- nexus-backend/services/skills/web_api.py
- nexus-backend/services/airgap_guard.py
- nexus-backend/services/review_evidence.py
- docs/security/credential-boundary-contract.md

Detailed audit document:
docs/nexus-ai-orchestration-model/packaging/MAIN_NEXUS_READ_ONLY_AUDIT.md

socket_map_confirmed:
2026-06-17:
Confirmed usable product-side sockets:
- Existing DB-backed pipeline API/runtime: `Pipeline`, `/pipelines`, `PipelineEngine`.
- Existing run records: `PipelineRunLog`, `CognitiveRunDetail`, execution-log routes.
- Existing blocking plan approval gate: `plan_review_gate` + `/pipelines/{id}/approve`.
- Existing skill registry/dispatch: `skills` table, `agent_engine_skills`, registry-truth reports.
- Existing research skill socket: `services/skills/web_research.py` and `web_search.py`,
  exported through `services/skills/web.py`.
- Existing network/sandbox-adjacent boundary: `airgap_guard` and web strict-mode policy.
- Existing report-only orchestrator/routing surface: task orchestration + controlled routing.

Important distinction:
`permission_gate` and task orchestration are report-only/no-op today. They are valid
design inputs, not enforceable package runtime gates yet.

missing_consumer_runtime_parts:
2026-06-17:
Main Nexus still needs consumer-specific runtime work before Phase 5 integration:
- `.pipeline` package importer.
- Nexus-computed content fingerprint and persistent import registry.
- Dedup/share and same-id/different-fingerprint conflict behavior.
- Package dependency resolver against the skill/shared registry.
- Package stage/gate/evidence loader.
- Package-to-Nexus runtime adapter.
- Enforceable package gate runner.
- Package evidence persistence contract.
- Research-pipeline adapter that calls `deep_research` / `web_search` without
  bypassing airgap or strict mock policy.
- Post-integration orchestrator catalog routing so matured intent can be routed
  to the correct main/specialist pipeline.
```

## Phase 4: Consumer Runtime Design Lock

Status: COMPLETE

Must define before implementation:

- importer interface;
- fingerprint canonicalization and storage;
- dedup/share conflict behavior;
- dependency resolver behavior;
- gate/evidence/trace loader behavior;
- runner hook behavior;
- completion report location;
- sandbox and credential boundaries.

Evidence to fill before completion:

```text
design_doc:
2026-06-17:
`CONSUMER_RUNTIME_DESIGN_LOCK.md` freezes the consumer-runtime design and
explicitly keeps product integration owner-gated.

accepted_interfaces:
2026-06-17:
- PackageImportRequest
- PackageImportResult
- PackageFingerprintRecord
- PackageComponentBinding
- PackageDependencyReport
- PackageGovernanceBundle
- PackageRunRequest
- PackageRunEvent
- PackageEvidenceRecord
- PackageCompletionReport

known_risks:
2026-06-17:
- Canonicalization drift if Nexus changes hash input rules without versioning.
- Existing `permission_gate` is report-only and cannot replace package gate
  enforcement yet.
- Package evidence persistence still needs an explicit Nexus-side mapping.
- Consumer must load package-declared gates and must not hard-code 19 gates.
- Phase 3 Nexus audit is a read-only snapshot and should be refreshed if
  integration is delayed.
- Orchestrator catalog routing is Phase 9 post-integration work, not Phase 4.
```

## Phase 5: Research Pilot Integration

Status: BLOCKED_UNTIL_OWNER_START

Rule:

Do not start this phase unless the owner explicitly says to start integration.

Goal:

Run `research-pipeline` inside the real Nexus consumer runtime with package
import, fingerprints, dependency resolution, gate enforcement, evidence, and
trace.

## Phase 6: Skill Governance Pilot

Status: PENDING_AFTER_RESEARCH

Start only after Phase 5 proves the consumer runtime seam.

## Phase 7: SDLC Pipeline Pilot

Status: PENDING_AFTER_SKILL_GOVERNANCE

Start only after smaller pilots harden the consumer runtime.

## Phase 8: Marketplace, Zip Envelope, Multi-Pipeline Expansion

Status: PENDING_LATER

Start only after real runtime proof exists. This phase covers distribution and
scale, not first integration readiness.

## Phase 9: Orchestrator Pipeline Routing Hardening

Status: PENDING_POST_INTEGRATION

Rule:

Do not do this before the first Nexus product integration proves package import,
gate/evidence loading and runner hooks. This is post-integration orchestration
runtime work.

Required behavior after integration:

- `mission_orchestrator` loads the available pipeline catalog at selection time.
- It knows all available main, specialist, and blueprint-level pipeline ids.
- It evaluates matured intent against pipeline selection rules.
- It routes or redirects work to the best matching pipeline when needed.
- It does not assume every idea belongs to `main_product_pipeline`.
- It preserves owner-visible rationale and required owner approval before
  starting or switching pipelines.
- It records pipeline selection / redirection rationale as trace.

Evidence to fill before completion:

```text
catalog_load_verified:
<fill>

selection_rule_runtime_verified:
<fill>

redirection_cases_verified:
<fill>

owner_approval_and_trace_verified:
<fill>
```
