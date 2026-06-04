# Blueprint Index — Nexus AI Orchestration Model

Navigable index of the whole **Nexus AI Orchestration Model** blueprint and its single
**SDLC Pipeline** contract corpus. This is documentation/blueprint only — no runtime code, no
merge, no deploy. Every link below is repo-relative to this file's directory
(`docs/ai-sdlc-factory/`) unless it points into `configs/` (then it is repo-relative from root).

**Top structure is the Nexus AI Orchestration Model.** The SDLC Pipeline is ONE pipeline under
it, not the top of the model. The Core Abilities (Supervisor, Coder, Vision, Audio, Creative,
Memory, Web, OS) are a shared capability layer — they are NOT agents and NOT team members, and
never appear as an `owner_agent`. Plugin is cancelled and appears nowhere as a concept/field.

**Locked boundaries (carried in every layer):** Plugin yok · Pipeline != Team · Agent != Core
Ability · Team Lead != Supervisor · Skill != Tool · Governance != Audit · Evidence != Trace.

---

## 0. How to read this blueprint

Canonical reading order (from [`README.md`](README.md)):

1. [`00-decision-log.md`](00-decision-log.md) — locked decisions D-001..D-010 + D-016
2. [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) — locked decisions D-011..D-015
3. [`01-nexus-ai-operating-model.md`](01-nexus-ai-operating-model.md)
4. [`02-concept-boundaries.md`](02-concept-boundaries.md)
5. [`03-governance-and-audit-layering.md`](03-governance-and-audit-layering.md)
6. [`04-open-discussion-items.md`](04-open-discussion-items.md)
7. [`04a-open-discussion-updates.md`](04a-open-discussion-updates.md)
8. [`05-shared-registry-and-usage-mapping.md`](05-shared-registry-and-usage-mapping.md)
9. [`06-sdlc-coverage-gap-audit.md`](06-sdlc-coverage-gap-audit.md)
10. [`06a-sdlc-mandatory-gates-decision.md`](06a-sdlc-mandatory-gates-decision.md)
11. [`06b-sdlc-agentic-safety-and-remaining-gates.md`](06b-sdlc-agentic-safety-and-remaining-gates.md)
12. [`07-pipeline-contract-standard.md`](07-pipeline-contract-standard.md)
13. [`08-sdlc-pipeline-contract.md`](08-sdlc-pipeline-contract.md)
14. [`sdlc-stages/`](sdlc-stages/) — per-stage prose contracts
15. [`configs/nexus-ai/stages/sdlc/`](../../configs/nexus-ai/stages/sdlc/) — generated machine-readable stage YAMLs

> **Two parallel numbering series exist in this directory.** The canonical reading order above
> uses the *named* concept series (e.g. `01-nexus-ai-operating-model.md`). An **earlier/legacy**
> series shares the same `01..08` numeric prefixes but with different slugs (e.g.
> `01-core-definitions.md`, `05-pipeline-model.md`). The legacy series is still authoritative for
> some deep detail (notably `05-pipeline-model.md` for rework routing / iteration / anti-patterns,
> which the runtime-rules config is generated from), but where the two disagree the **named
> canonical series + the generated configs win**. Both series are indexed in §1 and labelled.

---

## 1. Concept documents (`docs/ai-sdlc-factory/`)

### 1a. Decision logs (locked decisions)

| Doc | Title | Holds |
|-----|-------|-------|
| [`00-decision-log.md`](00-decision-log.md) | Decision Log | D-001 .. D-010, D-016 |
| [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) | Shared Registry Decision Addendum | D-011 .. D-015 |
| [`README.md`](README.md) | Discussion & design package overview | Locked-decision summary, concept families, reading order |

### 1b. Canonical concept series (named slugs — the reading-order series)

| # | Doc | Subject |
|---|-----|---------|
| 01 | [`01-nexus-ai-operating-model.md`](01-nexus-ai-operating-model.md) | Hierarchical + functional model of all concepts |
| 02 | [`02-concept-boundaries.md`](02-concept-boundaries.md) | What must NOT be merged (the 7 boundaries) |
| 03 | [`03-governance-and-audit-layering.md`](03-governance-and-audit-layering.md) | Governance vs Audit layer separation |
| 04 | [`04-open-discussion-items.md`](04-open-discussion-items.md) | Open architecture questions |
| 04a | [`04a-open-discussion-updates.md`](04a-open-discussion-updates.md) | Open-items update after registry decision |
| 05 | [`05-shared-registry-and-usage-mapping.md`](05-shared-registry-and-usage-mapping.md) | Shared Registry + Usage Mapping rule (all 7 categories) |
| 06 | [`06-sdlc-coverage-gap-audit.md`](06-sdlc-coverage-gap-audit.md) | SDLC coverage / gap audit |
| 06a | [`06a-sdlc-mandatory-gates-decision.md`](06a-sdlc-mandatory-gates-decision.md) | Three quality areas locked as mandatory/conditional gates |
| 06b | [`06b-sdlc-agentic-safety-and-remaining-gates.md`](06b-sdlc-agentic-safety-and-remaining-gates.md) | Agentic-safety + remaining gate families |
| 07 | [`07-pipeline-contract-standard.md`](07-pipeline-contract-standard.md) | Reusable pipeline + stage contract standard |
| 08 | [`08-sdlc-pipeline-contract.md`](08-sdlc-pipeline-contract.md) | Standard applied to the SDLC Pipeline (first draft) |

### 1c. Legacy concept series (earlier same-number slugs)

These predate the canonical series and the Phase A registry. Kept for detail/provenance; the
generated stage YAMLs cite them as `legacy doc 05` / `05-pipeline-model §…` where load-bearing.

| # | Doc | Subject | Notes |
|---|-----|---------|-------|
| 01 | [`01-core-definitions.md`](01-core-definitions.md) | Core concept definitions | Uses old "AI SDLC Factory" framing |
| 02 | [`02-necessity-and-deduplication.md`](02-necessity-and-deduplication.md) | Necessity + de-duplication; "Plugin → removed" | Plugin-cancellation rationale |
| 03 | [`03-skill-semantic-extraction.md`](03-skill-semantic-extraction.md) | How skill packages are read/classified before binding | Feeds stage 03 |
| 04 | [`04-team-agent-subagent-model.md`](04-team-agent-subagent-model.md) | Team / Team Lead / Agent / Sub-agent model | Lists out-of-scope `plugin_manager_agent` |
| 05 | [`05-pipeline-model.md`](05-pipeline-model.md) | Full pipeline model: rework routing, iteration policy, anti-patterns | **Source of `sdlc_pipeline_runtime_rules.yaml`** |
| 06 | [`06-governance-policy-evidence.md`](06-governance-policy-evidence.md) | No-human governance: deterministic rules, evidence, trace | Defines `no_plugin_core` policy |
| 07 | [`07-executor-workpackages.md`](07-executor-workpackages.md) | Executor work-package definitions (Codex/Claude/Antigravity) | Predecessor of `workpackages/` |
| 08 | [`08-open-discussion-items.md`](08-open-discussion-items.md) | Open architecture questions (earlier list) | |

### 1d. Reviews, registry standard, completion (post-contract)

| # | Doc | Subject |
|---|-----|---------|
| 09 | [`09-sdlc-stage-contract-review.md`](09-sdlc-stage-contract-review.md) | First consistency review of the stage-contract set |
| 10 | [`10-sdlc-stage-contract-second-review.md`](10-sdlc-stage-contract-second-review.md) | Second review: verifies §09 findings closed by `sdlc-stages/06` |
| 11 | [`11-artifact-registry-standard.md`](11-artifact-registry-standard.md) | Canonical artifact/evidence naming standard |
| 12 | [`12-completion-review-for-contract-work.md`](12-completion-review-for-contract-work.md) | Completion review of the contract work |
| — | [`README-updates-after-contract-work.md`](README-updates-after-contract-work.md) | Canonical index addendum (09–12, configs, stage prose, workpackages) |

---

## 2. SDLC stage prose contracts (`docs/ai-sdlc-factory/sdlc-stages/`)

Human-readable stage contracts grouped into five phases, plus a canonical corrections override.
These are the prose source the generated YAMLs in §3 are reconciled against. Index/standard:
[`sdlc-stages/README.md`](sdlc-stages/README.md).

| File | Phase | Stages covered |
|------|-------|----------------|
| [`sdlc-stages/01-foundation-and-requirements.md`](sdlc-stages/01-foundation-and-requirements.md) | Foundation & Requirements | intake, domain_risk_profile, skill_semantic_extraction, requirements, requirements_review |
| [`sdlc-stages/02-design-risk-and-planning.md`](sdlc-stages/02-design-risk-and-planning.md) | Design, Risk & Planning | architecture, architecture_review, security_privacy_design, premortem_fmea, planning |
| [`sdlc-stages/03-build-review-and-test.md`](sdlc-stages/03-build-review-and-test.md) | Build, Review & Test | implementation, code_review, test_generation, test_execution, verification_loop_bug_finding |
| [`sdlc-stages/04-validation-and-product-gates.md`](sdlc-stages/04-validation-and-product-gates.md) | Validation & Product Gates | security_validation, supply_chain_sbom_license, ai_agent_safety_evaluation, privacy_data_lifecycle, api_contract, data_migration, accessibility_ux, performance_resilience, cost_resource, backup_restore_dr |
| [`sdlc-stages/05-completion-release-and-learning.md`](sdlc-stages/05-completion-release-and-learning.md) | Completion, Release & Learning | operations_readiness, evidence_graph_build, development_completion, release_candidate, refraction_learning |
| [`sdlc-stages/06-canonical-corrections-and-overrides.md`](sdlc-stages/06-canonical-corrections-and-overrides.md) | Corrections | Canonical overrides that close §09 review findings (cited by YAML headers) |

---

## 3. Generated machine-readable stage YAMLs (`configs/nexus-ai/stages/sdlc/`)

The canonical 31-stage SDLC Pipeline. **All 31 contract files exist (`01`–`31`)** and each
contains all 7 usage-mapping fields and the full stage-contract field set. Directory index:
[`configs/nexus-ai/stages/sdlc/README.md`](../../configs/nexus-ai/stages/sdlc/README.md).

> The file number `NN-` is the canonical pipeline order; `stage_id` is the snake_case routing id.
> `(conditional)` = stage carries an `applicability_decision` / `required_when` block and may be skipped.

| # | File | `stage_id` | `owner_agent` |
|---|------|-----------|---------------|
| 01 | [`01-intake.yaml`](../../configs/nexus-ai/stages/sdlc/01-intake.yaml) | `intake` | product_requirements_agent |
| 02 | [`02-domain-risk-profile.yaml`](../../configs/nexus-ai/stages/sdlc/02-domain-risk-profile.yaml) | `domain_risk_profile` | domain_risk_agent |
| 03 | [`03-skill-semantic-extraction.yaml`](../../configs/nexus-ai/stages/sdlc/03-skill-semantic-extraction.yaml) | `skill_semantic_extraction` | skill_librarian_agent |
| 04 | [`04-requirements.yaml`](../../configs/nexus-ai/stages/sdlc/04-requirements.yaml) | `requirements` | product_requirements_agent |
| 05 | [`05-requirements-review.yaml`](../../configs/nexus-ai/stages/sdlc/05-requirements-review.yaml) | `requirements_review` | **sdlc_team_lead** (no-self-approval gate) |
| 06 | [`06-architecture.yaml`](../../configs/nexus-ai/stages/sdlc/06-architecture.yaml) | `architecture` | architecture_agent |
| 07 | [`07-architecture-review.yaml`](../../configs/nexus-ai/stages/sdlc/07-architecture-review.yaml) | `architecture_review` | **sdlc_team_lead** (no-self-approval gate) |
| 08 | [`08-security-privacy-design.yaml`](../../configs/nexus-ai/stages/sdlc/08-security-privacy-design.yaml) | `security_privacy_design` | security_privacy_agent |
| 09 | [`09-premortem-fmea.yaml`](../../configs/nexus-ai/stages/sdlc/09-premortem-fmea.yaml) | `premortem_fmea` | risk_agent |
| 10 | [`10-planning.yaml`](../../configs/nexus-ai/stages/sdlc/10-planning.yaml) | `planning` | planning_agent |
| 11 | [`11-implementation.yaml`](../../configs/nexus-ai/stages/sdlc/11-implementation.yaml) | `implementation` | engineering_agent |
| 12 | [`12-code-review.yaml`](../../configs/nexus-ai/stages/sdlc/12-code-review.yaml) | `code_review` | code_reviewer_agent |
| 13 | [`13-test-generation.yaml`](../../configs/nexus-ai/stages/sdlc/13-test-generation.yaml) | `test_generation` | qa_agent |
| 14 | [`14-test-execution.yaml`](../../configs/nexus-ai/stages/sdlc/14-test-execution.yaml) | `test_execution` | qa_agent |
| 15 | [`15-verification-loop-bug-finding.yaml`](../../configs/nexus-ai/stages/sdlc/15-verification-loop-bug-finding.yaml) | `verification_loop_bug_finding` | qa_agent |
| 16 | [`16-security-validation.yaml`](../../configs/nexus-ai/stages/sdlc/16-security-validation.yaml) | `security_validation` | security_validation_agent |
| 17 | [`17-supply-chain-sbom-license.yaml`](../../configs/nexus-ai/stages/sdlc/17-supply-chain-sbom-license.yaml) | `supply_chain_sbom_license` | supply_chain_agent |
| 18 | [`18-ai-agent-safety-evaluation.yaml`](../../configs/nexus-ai/stages/sdlc/18-ai-agent-safety-evaluation.yaml) | `ai_agent_safety_evaluation` | agentic_safety_agent |
| 19 | [`19-privacy-data-lifecycle-validation.yaml`](../../configs/nexus-ai/stages/sdlc/19-privacy-data-lifecycle-validation.yaml) | `privacy_data_lifecycle_validation` _(conditional)_ | privacy_agent |
| 20 | [`20-api-contract-compatibility-validation.yaml`](../../configs/nexus-ai/stages/sdlc/20-api-contract-compatibility-validation.yaml) | `api_contract_compatibility_validation` _(conditional)_ | contract_validation_agent |
| 21 | [`21-domain-regulatory-compliance-validation-if-applicable.yaml`](../../configs/nexus-ai/stages/sdlc/21-domain-regulatory-compliance-validation-if-applicable.yaml) | `domain_regulatory_compliance_validation_if_applicable` _(conditional)_ | compliance_agent |
| 22 | [`22-data-migration-validation-if-applicable.yaml`](../../configs/nexus-ai/stages/sdlc/22-data-migration-validation-if-applicable.yaml) | `data_migration_validation_if_applicable` _(conditional)_ | data_migration_agent |
| 23 | [`23-accessibility-ux-validation-if-applicable.yaml`](../../configs/nexus-ai/stages/sdlc/23-accessibility-ux-validation-if-applicable.yaml) | `accessibility_ux_validation_if_applicable` _(conditional)_ | ux_accessibility_agent |
| 24 | [`24-performance-resilience.yaml`](../../configs/nexus-ai/stages/sdlc/24-performance-resilience.yaml) | `performance_resilience` | performance_resilience_agent |
| 25 | [`25-cost-resource-governance.yaml`](../../configs/nexus-ai/stages/sdlc/25-cost-resource-governance.yaml) | `cost_resource_governance` _(conditional)_ | cost_resource_agent |
| 26 | [`26-backup-restore-dr-validation-if-applicable.yaml`](../../configs/nexus-ai/stages/sdlc/26-backup-restore-dr-validation-if-applicable.yaml) | `backup_restore_dr_validation_if_applicable` _(conditional)_ | operations_readiness_agent |
| 27 | [`27-operations-readiness.yaml`](../../configs/nexus-ai/stages/sdlc/27-operations-readiness.yaml) | `operations_readiness` | operations_readiness_agent |
| 28 | [`28-evidence-graph-build.yaml`](../../configs/nexus-ai/stages/sdlc/28-evidence-graph-build.yaml) | `evidence_graph_build` | evidence_graph_agent |
| 29 | [`29-development-completion.yaml`](../../configs/nexus-ai/stages/sdlc/29-development-completion.yaml) | `development_completion` | release_manager_agent |
| 30 | [`30-release-candidate.yaml`](../../configs/nexus-ai/stages/sdlc/30-release-candidate.yaml) | `release_candidate` | release_manager_agent |
| 31 | [`31-refraction-learning.yaml`](../../configs/nexus-ai/stages/sdlc/31-refraction-learning.yaml) | `refraction_learning` | memory_curator_agent |

**Conditional stages (7):** 19, 20, 21, 22, 23, 25, 26 — each gated by an
`applicability_decision.required_when` expression and skipped (control passes to the same
`on_pass` successor) when not applicable.

**No-self-approval:** review/gate stages never have the same `owner_agent` as the author of the
artifact they review. Where no dedicated reviewer role exists the gate is owned by
`sdlc_team_lead` (Supervisor != sdlc_team_lead) — stages `requirements_review` (05) and
`architecture_review` (07), plus the `development_completion_pass` re-attestation inside
`release_candidate` (30, `attested_by: sdlc_team_lead`).

**Forward path** is the single linear chain in canonical order; **rework** routes back to the
upstream stage that owns the root cause (never forward). Terminals: `done`,
`relevant_failed_stage`, `block_and_report`. Every stage sets `max_iterations: 3`. See the
routing/iteration summary in
[`configs/nexus-ai/stages/sdlc/README.md`](../../configs/nexus-ai/stages/sdlc/README.md) and the
enforcement rules in
[`configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`](../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml).

---

## 4. Pipeline-level configs (`configs/nexus-ai/`)

| File | Role |
|------|------|
| [`configs/nexus-ai/sdlc_pipeline.yaml`](../../configs/nexus-ai/sdlc_pipeline.yaml) | Canonical SDLC pipeline definition — 31-stage list, pipeline-level shared-registry usage, `required_gates.always` / `required_gates.conditional` |
| [`configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`](../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml) | Cross-stage runtime rules: rework routing table, iteration policy, anti-patterns (generated from legacy `05-pipeline-model.md` §5–§7) |
| [`configs/nexus-ai/pipeline_contract_standard.yaml`](../../configs/nexus-ai/pipeline_contract_standard.yaml) | Machine-readable baseline contract for all Nexus AI pipelines (required fields + shared-usage fields) |
| [`configs/nexus-ai/artifact_registry.yaml`](../../configs/nexus-ai/artifact_registry.yaml) | Canonical UPPER_SNAKE artifact/evidence names + naming rules + release-evidence-required sets |

---

## 5. JSON Schemas (`configs/nexus-ai/schemas/`)

Validation contracts for the YAML configs above. How-to:
[`configs/nexus-ai/validation/README.md`](../../configs/nexus-ai/validation/README.md).

| Schema | Validates | Title |
|--------|-----------|-------|
| [`stage_contract.schema.json`](../../configs/nexus-ai/schemas/stage_contract.schema.json) | each `stages/sdlc/NN-*.yaml` | Nexus AI SDLC Pipeline Stage Contract |
| [`pipeline_definition.schema.json`](../../configs/nexus-ai/schemas/pipeline_definition.schema.json) | `sdlc_pipeline.yaml` | Nexus AI Pipeline Definition Contract |
| [`pipeline_run.schema.json`](../../configs/nexus-ai/schemas/pipeline_run.schema.json) | a pipeline run instance | Nexus AI Pipeline Run Contract |
| [`artifact_registry.schema.json`](../../configs/nexus-ai/schemas/artifact_registry.schema.json) | `artifact_registry.yaml` | Nexus AI Artifact Registry |
| [`evidence_item.schema.json`](../../configs/nexus-ai/schemas/evidence_item.schema.json) | an evidence item (decision proof) | Nexus AI Evidence Item Contract |
| [`trace_item.schema.json`](../../configs/nexus-ai/schemas/trace_item.schema.json) | a trace item (process history) | Nexus AI Trace Item |

> Evidence and Trace schemas are kept deliberately distinct (D-008): evidence = decision proof,
> trace = process history.

---

## 6. Roadmap & continuation plans (13–22)

Post-SDLC-completion planning series. Index addendum:
[`README-updates-after-roadmap-plans.md`](README-updates-after-roadmap-plans.md). Execution order
is 13 → 22; `22` is the stop-rule doc that ends the planning series.

| # | Doc | Subject |
|---|-----|---------|
| 13 | [`13-sdlc-completion-full-execution-plan.md`](13-sdlc-completion-full-execution-plan.md) | Full plan to take SDLC from design-ready to contract-ready + reviewed |
| 14 | [`14-post-sdlc-continuation-plan.md`](14-post-sdlc-continuation-plan.md) | Work after SDLC completion |
| 15 | [`15-master-roadmap-and-dependency-map.md`](15-master-roadmap-and-dependency-map.md) | Master roadmap + dependency map |
| 16 | [`16-pipeline-catalog-expansion-plan.md`](16-pipeline-catalog-expansion-plan.md) | Cataloguing non-SDLC pipeline types |
| 17 | [`17-shared-registry-formalization-plan.md`](17-shared-registry-formalization-plan.md) | Make the Shared Registry machine-readable |
| 18 | [`18-team-agent-subagent-catalog-plan.md`](18-team-agent-subagent-catalog-plan.md) | Team / Agent / Sub-agent catalogues |
| 19 | [`19-governance-audit-readiness-plan.md`](19-governance-audit-readiness-plan.md) | Governance + Audit implementation readiness |
| 20 | [`20-executor-workflow-standard-plan.md`](20-executor-workflow-standard-plan.md) | Executor workflow standard |
| 21 | [`21-runtime-refactor-planning-only-plan.md`](21-runtime-refactor-planning-only-plan.md) | Planning-only rule before any runtime/refactor |
| 22 | [`22-final-stop-rule-and-readiness-gate.md`](22-final-stop-rule-and-readiness-gate.md) | Final stop rule + readiness gate (ends the planning series) |

---

## 7. Executor work-packages (`docs/ai-sdlc-factory/workpackages/`)

Hand-offs to executor agents (Codex / Claude Code / Antigravity). Index:
[`workpackages/README.md`](workpackages/README.md).

| WP | Doc | Executor focus |
|----|-----|----------------|
| 01 | [`workpackages/01-codex-machine-readable-contracts.md`](workpackages/01-codex-machine-readable-contracts.md) | Codex: machine-readable contracts |
| 02 | [`workpackages/02-claude-code-skill-and-agent-review.md`](workpackages/02-claude-code-skill-and-agent-review.md) | Claude Code: skill + agent review |
| 03 | [`workpackages/03-antigravity-blueprint-assembly-and-visuals.md`](workpackages/03-antigravity-blueprint-assembly-and-visuals.md) | Antigravity: blueprint assembly + visuals |
| 04 | [`workpackages/04-final-cross-review.md`](workpackages/04-final-cross-review.md) | Final cross-review |
| 05 | [`workpackages/05-claude-code-sdlc-completion-execution.md`](workpackages/05-claude-code-sdlc-completion-execution.md) | Claude Code: SDLC completion execution hand-off |

---

## 8. Execution reports (`docs/ai-sdlc-factory/execution/`)

| Doc | Subject |
|-----|---------|
| [`execution/phase-0-context-lock-report.md`](execution/phase-0-context-lock-report.md) | Phase A pre-flight context lock — verifies no locked-decision conflict, no plugin reintroduction, no Core Ability used as Agent, Supervisor != SDLC Team Lead, Shared Registry + Usage Mapping intact. Records the agent-role naming drift and no-self-approval fallback as Phase A authoring inputs. |

---

## 9. Reviews & diagrams

Both directories are now populated. The earlier stage-contract reviews (`09`/`10`/`12`) remain in
§1d; the cross-cutting review artifacts and the rendered blueprint diagrams (WP-03, Antigravity)
live here.

### 9a. Reviews (`docs/ai-sdlc-factory/reviews/`)

| Doc | Subject |
|-----|---------|
| [`reviews/sdlc-contract-consistency-audit.md`](reviews/sdlc-contract-consistency-audit.md) | Consistency audit across the SDLC pipeline definition, stage YAMLs and contract docs |
| [`reviews/claude-code-skill-agent-review.md`](reviews/claude-code-skill-agent-review.md) | Skill + Agent review (WP-02): Skill != Tool, Core Ability != Agent boundaries |
| [`reviews/final-cross-review-summary.md`](reviews/final-cross-review-summary.md) | Final cross-review summary (WP-04) across the blueprint corpus |

### 9b. Diagrams (`docs/ai-sdlc-factory/diagrams/`)

Mermaid (`.mmd`) source diagrams for the blueprint.

| Diagram | Subject |
|---------|---------|
| [`diagrams/nexus-ai-operating-model.mmd`](diagrams/nexus-ai-operating-model.mmd) | Nexus AI Orchestration Model — top-level operating model (SDLC is one pipeline under it) |
| [`diagrams/sdlc-pipeline-flow.mmd`](diagrams/sdlc-pipeline-flow.mmd) | 31-stage SDLC pipeline flow: on_pass backbone + main rework routes (owners per stage YAMLs) |
| [`diagrams/shared-registry-usage-map.mmd`](diagrams/shared-registry-usage-map.mmd) | Shared Registry + Usage Mapping across the 7 shared categories |
| [`diagrams/governance-audit-layering.mmd`](diagrams/governance-audit-layering.mmd) | Governance vs Audit layering (Governance != Audit; Evidence != Trace) |

---

## 10. Persisted memory (`.memory/`) and repo note

- [`.memory/`](../../.memory/) holds the session memory the context-lock report reviewed:
  `0001-session-summary.md`, `0002-locked-decisions.md` (K-001..K-012, mirroring D-001..D-015),
  `0003-sdlc-research-baseline.md`, `0004-next-actions.md`, `README.md`.
- The repository-root [`README.md`](../../README.md) is an unrelated AI-Studio app scaffold and
  is **not** part of this blueprint; the blueprint's own README is
  [`docs/ai-sdlc-factory/README.md`](README.md).

---

## 11. Decision map — D-001 .. D-016 → source doc

Every locked decision and where it is defined. D-001..D-010 and D-016 are defined in the Decision Log;
D-011..D-015 in the Shared Registry addendum. The blueprint [`README.md`](README.md) also
summarizes the full set.

| Decision | Statement (short) | Source doc |
|----------|-------------------|-----------|
| D-001 | Top structure is **Nexus AI Orchestration Model**; SDLC is one pipeline, not the top (NOT "AI SDLC Factory"). | [`00-decision-log.md`](00-decision-log.md) |
| D-002 | **Plugin cancelled** — not in core scope; core concepts are Pipeline/Team/Team Lead/Agent/Sub-agent/Core Ability/Skill/Tool/Governance/Audit/Evidence/Trace. | [`00-decision-log.md`](00-decision-log.md) |
| D-003 | **Core Abilities** = Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS — these names are no longer called agents. | [`00-decision-log.md`](00-decision-log.md) |
| D-004 | Core Abilities are **not** members of any team; they are Nexus AI's shared capability layer, each with its own model/engine/config. | [`00-decision-log.md`](00-decision-log.md) |
| D-005 | **Team hierarchy:** Team → Team Lead → Agents → Sub-agents (and direct sub-agents). | [`00-decision-log.md`](00-decision-log.md) |
| D-006 | **Supervisor != SDLC Team Lead.** Supervisor is a Core Ability; SDLC Team Lead is the role running the SDLC team/run. | [`00-decision-log.md`](00-decision-log.md) |
| D-007 | **Governance is not blind-merged** — Global/Pipeline/Team/Stage/Core Ability/Skill/Tool governance layers stay distinct. | [`00-decision-log.md`](00-decision-log.md) |
| D-008 | **Audit is not blind-merged** — Evidence (decision proof) != Trace (process history); both under Audit but kept separate. | [`00-decision-log.md`](00-decision-log.md) |
| D-009 | **Pipeline != Pipeline Run** — definition/template vs the actual executed instance. | [`00-decision-log.md`](00-decision-log.md) |
| D-010 | **Pipelines are plural** under Nexus AI (SDLC, Research, Activation, Operations, …). | [`00-decision-log.md`](00-decision-log.md) |
| D-011 | **Shared Registry != Usage Mapping** — "what exists" vs "who/which pipeline/stage/agent uses it"; the repeat is a usage relationship, not ownership. | [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) |
| D-012 | The Shared-Registry-+-Usage-Mapping rule applies to **all 7 shared categories** (Core Abilities, Skills, Tools, Governance Profiles, Audit Schemas, Model/Provider Profiles, Context/Memory Profiles). | [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) |
| D-013 | In the main hierarchy a **Skill appears by name only**; skill package contents live in the skill inventory/audit doc. | [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) |
| D-014 | **Core Ability sub-operations appear separately as Tools** (Skill != Tool); the Core Ability name is in the registry, its callable ops are in the Tool registry + usage mapping. | [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) |
| D-015 | **Model/Provider and Context/Memory profiles must be visible** in both the Shared Registry and the usage context. | [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md) |
| D-016 | **Canonical always-required SDLC gate set** — 19 always gates = doc 06 §8 base ∪ 06a ∪ 06b (incl. `risk_register_reviewed`, `performance_resilience_pass_or_accepted`, `agentic_safety_eval_pass`); doc 06 §8 = doc 08 §4 = `sdlc_pipeline.yaml` `required_gates.always`. | [`00-decision-log.md`](00-decision-log.md) |

---

## 12. Status notes (as of this index)

- **All 31 stage YAMLs (`01`–`31`) exist** in `configs/nexus-ai/stages/sdlc/`, all conform to the
  stage-contract standard, and all carry the 7 usage-mapping fields. The "Open items" at the
  bottom of [`configs/nexus-ai/stages/sdlc/README.md`](../../configs/nexus-ai/stages/sdlc/README.md)
  are **stale**: they claim stages `30`/`31` and `sdlc_pipeline_runtime_rules.yaml` are not
  authored, but all three now exist (authored after that README). The stage-README table and
  routing/governance summary remain accurate.
- `reviews/` and `diagrams/` are now **populated** (see §9): `reviews/` holds
  `sdlc-contract-consistency-audit.md`, `claude-code-skill-agent-review.md` and
  `final-cross-review-summary.md`; `diagrams/` holds `nexus-ai-operating-model.mmd`,
  `sdlc-pipeline-flow.mmd`, `shared-registry-usage-map.mmd` and `governance-audit-layering.mmd`.
