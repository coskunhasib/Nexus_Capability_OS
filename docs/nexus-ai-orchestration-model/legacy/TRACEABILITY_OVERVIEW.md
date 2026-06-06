# SDLC Pipeline — Traceability Overview

Status: Phase A blueprint / documentation only. No runtime code, no merge, no deploy.
Date: 2026-06-03.
Scope: SDLC Pipeline (`sdlc_pipeline`), one pipeline under the **Nexus AI Orchestration Model** — not the top of the model.

## 0. Purpose

This document does two things:

1. **Evidence chain.** It traces the canonical artifact chain
   `requirement -> design -> implementation -> test -> security/validation -> gate -> development_completion -> release_candidate`
   across the 31 SDLC stages, naming the producing stage and consuming stage(s) of every load-bearing artifact so that no node in the chain is orphaned.
2. **Registry-vs-usage proof.** It demonstrates that each of the seven shared categories
   (Core Abilities, Skills, Tools, Governance Profiles, Audit Schemas, Model/Provider Profiles, Context/Memory Profiles)
   appears **both** in the shared registry **and** in at least one stage's usage mapping — the dual-visibility rule locked in `00a-shared-registry-decisions.md` (D-011..D-015) and `05-shared-registry-and-usage-mapping.md`.

It is a read-only overview built from the existing stage contracts. It does not redefine any stage. Source-of-truth stage contracts:

```text
sdlc-stages/01-foundation-and-requirements.md
sdlc-stages/02-design-risk-and-planning.md
sdlc-stages/03-build-review-and-test.md
sdlc-stages/04-validation-and-product-gates.md
sdlc-stages/05-completion-release-and-learning.md
sdlc-stages/06-canonical-corrections-and-overrides.md   (override/addendum — canonical)
08-sdlc-pipeline-contract.md                             (pipeline-level usage mapping + stage list)
```

### Locked-decision guardrails honored here

- Plugin is cancelled — no plugin concept appears anywhere in this document.
- Top structure is the Nexus AI Orchestration Model; SDLC is one pipeline.
- Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` are a capability layer. They are **never** listed as `owner_agent` or as an Agent — only under `uses_core_abilities`.
- `owner_team = sdlc_team`, `team_lead = sdlc_team_lead`. Supervisor is a Core Ability, not the team lead.
- Skill != Tool. Governance != Audit. Evidence != Trace. These four boundaries are preserved throughout.
- `prism` = divergent/brainstorming; `verification-loop` = bug/defect finding (never a generic readiness checklist, never a replacement for `test_execution`).

---

## 1. The 31 stages, in run order

The pipeline is one ordered chain with conditional branches. Stage list per `08-sdlc-pipeline-contract.md` section 3, with the compliance stage inserted by `sdlc-stages/06` (section 1 + route override section 2).

| # | stage_id | group | kind | owner_agent (as authored) |
|---|----------|-------|------|---------------------------|
| 1 | intake | Foundation & Requirements | normal | product_requirements_agent |
| 2 | domain_risk_profile | Foundation & Requirements | normal | domain_risk_agent |
| 3 | skill_semantic_extraction | Foundation & Requirements | normal+gate | skill_librarian_agent |
| 4 | requirements | Foundation & Requirements | normal | requirements_agent |
| 5 | requirements_review | Foundation & Requirements | review-gate | requirements_reviewer_agent |
| 6 | architecture | Design, Risk & Planning | normal | architecture_agent |
| 7 | architecture_review | Design, Risk & Planning | review-gate | architecture_reviewer_agent |
| 8 | security_privacy_design | Design, Risk & Planning | normal | security_privacy_agent |
| 9 | premortem_fmea | Design, Risk & Planning | risk-gate | risk_agent |
| 10 | planning | Design, Risk & Planning | normal | planning_agent |
| 11 | implementation | Build, Review & Test | normal | engineering_agent |
| 12 | code_review | Build, Review & Test | review-gate | code_reviewer_agent |
| 13 | test_generation | Build, Review & Test | normal | qa_agent |
| 14 | test_execution | Build, Review & Test | gate | qa_agent |
| 15 | verification_loop_bug_finding | Build, Review & Test | bug-gate | qa_agent |
| 16 | security_validation | Validation & Product Gates | gate | security_agent (see §6) |
| 17 | supply_chain_sbom_license | Validation & Product Gates | gate | supply_chain_agent |
| 18 | ai_agent_safety_evaluation | Validation & Product Gates | gate | agentic_safety_agent |
| 19 | privacy_data_lifecycle_validation | Validation & Product Gates | conditional gate | privacy_agent |
| 20 | api_contract_compatibility_validation | Validation & Product Gates | conditional gate | contract_validation_agent |
| 21 | domain_regulatory_compliance_validation_if_applicable | Validation & Product Gates | conditional gate | compliance_agent |
| 22 | data_migration_validation_if_applicable | Validation & Product Gates | conditional gate | data_migration_agent |
| 23 | accessibility_ux_validation_if_applicable | Validation & Product Gates | conditional gate | ux_accessibility_agent |
| 24 | performance_resilience | Validation & Product Gates | gate | performance_resilience_agent |
| 25 | cost_resource_governance | Validation & Product Gates | conditional gate | cost_resource_agent |
| 26 | backup_restore_dr_validation_if_applicable | Validation & Product Gates | conditional gate | operations_readiness_agent |
| 27 | operations_readiness | Completion, Release & Learning | gate | operations_readiness_agent |
| 28 | evidence_graph_build | Completion, Release & Learning | gate | evidence_graph_agent |
| 29 | development_completion | Completion, Release & Learning | aggregate gate | release_manager_agent |
| 30 | release_candidate | Completion, Release & Learning | release gate | release_manager_agent |
| 31 | refraction_learning | Completion, Release & Learning | learning (non-blocking) | memory_curator_agent |

> Conditional stages (19, 20, 21, 22, 23, 25, 26) each carry an `applicability_decision` consumed/produced per `sdlc-stages/06` sections 6–7. When not applicable, their gate evaluates to `pass_if_applicable` and the chain skips through them without producing a blocker.

---

## 2. The eight-link evidence chain mapped onto stages

The requested chain has eight named links. Each link is realized by one or more stages, and each link hands a concrete artifact to the next. Routing terminals (`done`, `relevant_failed_stage`, `block_and_report`) are per `07-pipeline-contract-standard.md`.

```text
requirement ─▶ design ─▶ implementation ─▶ test ─▶ security/validation ─▶ gate ─▶ development_completion ─▶ release_candidate
```

| Link | Stage(s) that realize it | Key entering artifact(s) | Key exiting artifact(s) |
|------|--------------------------|--------------------------|--------------------------|
| **requirement** | intake → domain_risk_profile → skill_semantic_extraction → requirements → requirements_review | USER_GOAL | REQUIREMENTS_SPEC, NFR_CATALOG, ACCEPTANCE_CRITERIA, REQUIREMENTS_TRACE_START, DOMAIN_PROFILE_DECISION, RISK_PROFILE, SKILL_SEMANTIC_CATALOG |
| **design** | architecture → architecture_review → security_privacy_design → premortem_fmea → planning | REQUIREMENTS_SPEC, NFR_CATALOG, DOMAIN_PROFILE_DECISION | ARCHITECTURE_DOC, ADR_INDEX, THREAT_MODEL, SECURITY_REQUIREMENTS, DATA_INVENTORY, PRIVACY_RISK_REGISTER, FMEA_RISK_REGISTER, IMPLEMENTATION_PLAN, HANDOFF_PACKETS, RUNBOOK_DRAFT, ROLLBACK_PLAN_DRAFT |
| **implementation** | implementation | IMPLEMENTATION_PLAN, HANDOFF_PACKETS, TASK_BREAKDOWN | CODE_CHANGESET_SUMMARY, LOCAL_BUILD_RESULT, TOOL_PERMISSION_MAP, CONTEXT_POLICY, + conditional `*_IF_APPLICABLE` artifacts (data model, migration files, API contracts, UI changeset, resource usage) |
| **test** | code_review → test_generation → test_execution → verification_loop_bug_finding | CODE_CHANGESET_SUMMARY, REQUIREMENTS_SPEC | CODE_REVIEW_REPORT, TEST_PLAN, TEST_EXECUTION_REPORT, COVERAGE_REPORT, BUG_FINDING_REPORT, BUG_FINDING_GATE_RESULT |
| **security/validation** | security_validation → supply_chain_sbom_license → ai_agent_safety_evaluation → privacy_data_lifecycle_validation → api_contract_compatibility_validation → domain_regulatory_compliance_validation_if_applicable → data_migration_validation_if_applicable → accessibility_ux_validation_if_applicable → performance_resilience → cost_resource_governance → backup_restore_dr_validation_if_applicable | CODE_CHANGESET_SUMMARY, TEST_EXECUTION_REPORT, DATA_INVENTORY, API_CONTRACTS, NFR_CATALOG | SECURITY_SCAN_REPORT, SBOM, LICENSE_REPORT, AGENTIC_SAFETY_EVAL_REPORT, EVIDENCE_INTEGRITY_REPORT, DATA_LIFECYCLE_REPORT, API_CONTRACT_REPORT, COMPLIANCE_MATRIX, MIGRATION_VALIDATION_REPORT, ACCESSIBILITY_REPORT, PERFORMANCE_REPORT, RESILIENCE_REPORT, COST_ESTIMATE_REPORT, RESTORE_TEST_REPORT, DR_READINESS_REPORT |
| **gate** | every stage exposes a `gates` block; aggregating gate stages are operations_readiness + evidence_graph_build | per-stage gate results | RUNBOOK, ROLLBACK_PLAN, OBSERVABILITY_PLAN, INCIDENT_RESPONSE_PLAN, EVIDENCE_GRAPH, TRACEABILITY_MATRIX |
| **development_completion** | development_completion | EVIDENCE_GRAPH, TRACEABILITY_MATRIX, ALL_STAGE_GATE_RESULTS | DEVELOPMENT_COMPLETION_REPORT, DEVELOPMENT_COMPLETION_GATE_RESULT |
| **release_candidate** | release_candidate | DEVELOPMENT_COMPLETION_REPORT, EVIDENCE_GRAPH, TRACEABILITY_MATRIX | RELEASE_CANDIDATE_REPORT, RELEASE_EVIDENCE |

`release_candidate.on_pass -> refraction_learning -> done`. Learning is explicitly **not** a release blocker (`optional_conditions: learning_stage_is_not_release_blocker`).

---

## 3. Artifact provenance ledger (no-orphan proof)

This is the spine that `evidence_graph_build` (stage 28) reconstructs at runtime. Every artifact below has at least one **producer** stage and, unless it is a terminal release artifact, at least one **consumer** stage. Read top-to-bottom to follow the chain; read a single row to see one artifact's lineage.

| Artifact | Produced by (stage_id) | Consumed by (stage_id) | Chain link |
|----------|------------------------|-------------------------|------------|
| USER_GOAL | (pipeline input) | intake | requirement |
| PRODUCT_BRIEF / INITIAL_SCOPE / SUCCESS_METRICS | intake | domain_risk_profile, requirements, accessibility_ux_validation_if_applicable | requirement |
| DOMAIN_PROFILE_DECISION / RISK_PROFILE | domain_risk_profile | skill_semantic_extraction, requirements, architecture, security_privacy_design, domain_regulatory_compliance_validation_if_applicable | requirement |
| SKILL_SEMANTIC_CATALOG / SKILL_MISUSE_WARNINGS | skill_semantic_extraction | requirements | requirement |
| REQUIREMENTS_SPEC / NFR_CATALOG / ACCEPTANCE_CRITERIA / REQUIREMENTS_TRACE_START | requirements | requirements_review, architecture, security_privacy_design, planning, code_review, test_generation, verification_loop_bug_finding, performance_resilience, evidence_graph_build, domain_regulatory_compliance_validation_if_applicable | requirement |
| REQUIREMENTS_REVIEW_REPORT | requirements_review | (gate evidence; feeds development_completion via evidence graph) | requirement (gate) |
| ARCHITECTURE_DOC / ADR_INDEX / SYSTEM_CONTEXT_DIAGRAM | architecture | architecture_review, security_privacy_design, premortem_fmea, planning, code_review, evidence_graph_build | design |
| ARCHITECTURE_REVIEW_REPORT | architecture_review | (gate evidence) | design (gate) |
| THREAT_MODEL / SECURITY_REQUIREMENTS / DATA_INVENTORY / PRIVACY_RISK_REGISTER | security_privacy_design | premortem_fmea, planning, privacy_data_lifecycle_validation, domain_regulatory_compliance_validation_if_applicable | design |
| SENTINEL_PREMORTEM / FMEA_RISK_REGISTER | premortem_fmea | planning | design |
| IMPLEMENTATION_PLAN / TASK_BREAKDOWN / HANDOFF_PACKETS | planning | implementation | design |
| RUNBOOK_DRAFT / ROLLBACK_PLAN_DRAFT / OPERATIONAL_READINESS_DRAFTS | planning (added by `06` §3) | backup_restore_dr_validation_if_applicable, operations_readiness | design→gate |
| CODE_CHANGESET_SUMMARY / IMPLEMENTATION_NOTES / LOCAL_BUILD_RESULT | implementation | code_review, test_generation, test_execution, verification_loop_bug_finding, security_validation, supply_chain_sbom_license, ai_agent_safety_evaluation, api_contract_compatibility_validation, performance_resilience, evidence_graph_build | implementation |
| TOOL_PERMISSION_MAP / CONTEXT_POLICY | implementation (added by `06` §4) | ai_agent_safety_evaluation | implementation→security |
| `*_IF_APPLICABLE` (DATA_MODEL_CHANGE_REPORT, MIGRATION_FILES, API_CONTRACTS, UI_CHANGESET_SUMMARY, RESOURCE_USAGE_DATA) | implementation (added by `06` §4) | data_migration_validation_if_applicable, api_contract_compatibility_validation, accessibility_ux_validation_if_applicable, cost_resource_governance | implementation→security |
| CODE_REVIEW_REPORT | code_review | test_generation, evidence_graph_build, release_candidate (min evidence) | test |
| TEST_PLAN / GENERATED_TESTS_SUMMARY | test_generation | test_execution | test |
| TEST_EXECUTION_REPORT / COVERAGE_REPORT | test_execution | verification_loop_bug_finding, security_validation, ai_agent_safety_evaluation, evidence_graph_build | test |
| BUG_FINDING_REPORT / BUG_FINDING_GATE_RESULT | verification_loop_bug_finding | evidence_graph_build, release_candidate (min evidence) | test (bug-gate) |
| SECURITY_SCAN_REPORT / SECURITY_FINDINGS_NORMALIZED | security_validation | evidence_graph_build, release_candidate (min evidence) | security/validation |
| SBOM / LICENSE_REPORT / DEPENDENCY_RISK_REPORT / SUPPLY_CHAIN_GATE_RESULT | supply_chain_sbom_license | development_completion (gate inputs), release_candidate (min evidence) | security/validation |
| AGENTIC_SAFETY_EVAL_REPORT / PROMPT_INJECTION_TEST_REPORT / TOOL_MISUSE_TEST_REPORT / CONTEXT_POISONING_TEST_REPORT / EVIDENCE_INTEGRITY_REPORT | ai_agent_safety_evaluation | development_completion, release_candidate | security/validation |
| DATA_LIFECYCLE_REPORT / RETENTION_POLICY_REPORT / TENANT_ISOLATION_REPORT / PRIVACY_GATE_RESULT | privacy_data_lifecycle_validation | development_completion (conditional), release_candidate (conditional) | security/validation |
| API_CONTRACT_REPORT / BREAKING_CHANGE_REPORT / CONTRACT_TEST_REPORT / COMPATIBILITY_GATE_RESULT | api_contract_compatibility_validation | development_completion (conditional), release_candidate (conditional) | security/validation |
| COMPLIANCE_APPLICABILITY_DECISION / COMPLIANCE_MATRIX / REGULATORY_TRACEABILITY_REPORT / COMPLIANCE_GATE_RESULT | domain_regulatory_compliance_validation_if_applicable | development_completion (`compliance_pass_if_applicable`, `06` §9), release_candidate (`06` §10) | security/validation |
| MIGRATION_VALIDATION_REPORT / ROLLBACK_VALIDATION_REPORT / DATA_INTEGRITY_REPORT | data_migration_validation_if_applicable | backup_restore_dr_validation_if_applicable, development_completion (conditional), release_candidate (conditional) | security/validation |
| ACCESSIBILITY_REPORT / UX_VALIDATION_REPORT / UI_RELEASE_GATE_RESULT | accessibility_ux_validation_if_applicable | development_completion (conditional), release_candidate (conditional) | security/validation |
| PERFORMANCE_REPORT / RESILIENCE_REPORT | performance_resilience | cost_resource_governance, operations_readiness, release_candidate (min evidence) | security/validation |
| COST_ESTIMATE_REPORT / RESOURCE_BUDGET_REPORT / QUOTA_POLICY_REPORT / RESOURCE_GATE_RESULT | cost_resource_governance | development_completion (conditional), release_candidate (conditional) | security/validation |
| BACKUP_PLAN / RESTORE_TEST_REPORT / DR_READINESS_REPORT / ROLLBACK_VALIDATION_REPORT | backup_restore_dr_validation_if_applicable | operations_readiness, development_completion (conditional), release_candidate (conditional) | security/validation→gate |
| RUNBOOK / ROLLBACK_PLAN / OBSERVABILITY_PLAN / INCIDENT_RESPONSE_PLAN | operations_readiness | evidence_graph_build, development_completion, release_candidate (min evidence) | gate |
| EVIDENCE_GRAPH / TRACEABILITY_MATRIX | evidence_graph_build | development_completion, release_candidate | gate |
| DEVELOPMENT_COMPLETION_REPORT / DEVELOPMENT_COMPLETION_GATE_RESULT | development_completion | release_candidate, refraction_learning | development_completion |
| RELEASE_CANDIDATE_REPORT / RELEASE_EVIDENCE | release_candidate | refraction_learning | release_candidate (terminal) |
| LESSONS_LEARNED / MEMORY_UPDATE_PROPOSAL / FUTURE_IMPROVEMENT_BACKLOG | refraction_learning | (memory layer; `done`) | post-release learning |

**Orphan check.** Every non-input, non-terminal artifact above lists at least one consumer. The two terminal artifacts (`RELEASE_EVIDENCE`, and the learning outputs) are intended sinks. This is exactly the invariant `evidence_graph_build.gates: no_orphan_critical_artifacts` and `development_completion.blocking_conditions: missing_required_evidence` enforce. `evidence_graph_build.on_fail = relevant_failed_stage` routes a broken link back to the stage that owns the missing artifact rather than blindly restarting.

---

## 4. Gate → development_completion aggregation

`development_completion` (stage 29) is the single aggregation gate. Each gate it checks is produced by exactly one upstream stage. This table proves every `development_completion` gate has a real producer (no phantom gates) and that every always-required validation stage feeds it.

| development_completion gate | Producing stage | Required / conditional |
|-----------------------------|-----------------|------------------------|
| requirements_complete | requirements (+ requirements_review) | required |
| nfr_coverage_complete | requirements / architecture | required |
| architecture_complete | architecture (+ architecture_review) | required |
| security_privacy_design_complete | security_privacy_design | required |
| code_review_pass | code_review | required |
| tests_pass | test_execution | required |
| verification_loop_bug_finding_pass | verification_loop_bug_finding | required |
| security_validation_pass | security_validation | required |
| supply_chain_pass | supply_chain_sbom_license | required |
| agentic_safety_eval_pass | ai_agent_safety_evaluation | required |
| operations_readiness_pass | operations_readiness | required |
| evidence_graph_complete | evidence_graph_build | required |
| no_blocking_policy_failure | (cross-cutting `no_self_approval_policy` + `evidence_required_policy`) | required |
| accessibility_pass_if_applicable | accessibility_ux_validation_if_applicable | conditional |
| data_migration_pass_if_applicable | data_migration_validation_if_applicable | conditional |
| privacy_lifecycle_pass_if_applicable | privacy_data_lifecycle_validation | conditional |
| api_contract_compatibility_pass_if_applicable | api_contract_compatibility_validation | conditional |
| backup_restore_dr_pass_if_applicable | backup_restore_dr_validation_if_applicable | conditional |
| compliance_pass_if_applicable | domain_regulatory_compliance_validation_if_applicable | conditional (`06` §9) |
| cost_resource_governance_pass_if_applicable | cost_resource_governance | conditional |

`development_completion.on_pass = release_candidate`; `release_candidate.gates` require `development_completion_pass` before any release evidence is emitted (`release_after_development_completion_gate`). This enforces the locked ordering: **release candidate cannot be produced before development completion passes.**

---

## 5. Trace vs Evidence along the chain (Audit boundary preserved)

Per D-008 and the locked `Evidence != Trace` boundary, each stage emits **evidence** (decision proof) and **trace** (process history) separately, and the two are carried by distinct audit schemas.

- **Evidence schemas** (decision proof): `intake_evidence_schema`, `requirements_evidence_schema`, `architecture_evidence_schema`, `implementation_evidence_schema`, `test_execution_evidence_schema`, `bug_finding_evidence_schema`, `security_scan_evidence_schema`, `agentic_eval_evidence_schema`, `compliance_matrix_schema`, `regulatory_evidence_schema`, `development_completion_evidence_schema`, `release_evidence_schema`, … (full set in §7.5).
- **Trace schemas** (process history): `stage_gate_trace_schema`, `decision_trace_schema`, `code_change_trace_schema`, `security_finding_trace_schema`, `tool_misuse_trace_schema`, `gate_decision_trace_schema`, `release_decision_trace_schema`, `memory_update_trace_schema`, plus per-stage `*_trace` activations.

The `verification_loop_bug_finding` stage is the canonical illustration of the boundary and of the locked skill semantics:

```text
evidence: BUG_FINDING_REPORT, BUG_FINDING_GATE_RESULT          # what was decided
trace:    verification_loop_skill_activation_trace,            # how it ran
          defect_tracker_tool_trace
skill:    verification-loop  (bug/defect finding only)         # NOT a readiness checklist,
gate:     open_blocker_bugs_zero, open_major_bugs_below_threshold #  NOT a replacement for test_execution
```

`test_execution` (stage 14, runs the tests) and `verification_loop_bug_finding` (stage 15, hunts defects) are kept as two separate stages precisely so that `verification-loop` is never collapsed into test execution.

---

## 6. No-self-approval verification (per-gate)

Locked rule: a review/gate stage's `owner_agent` must differ from the author of the artifact it reviews; if no dedicated reviewer role fits, use `sdlc_team_lead` and record it in open questions.

| Review / gate stage | Reviews artifact authored by | Gate owner_agent | Distinct author? |
|---------------------|------------------------------|------------------|------------------|
| requirements_review | requirements_agent (REQUIREMENTS_SPEC) | requirements_reviewer_agent | yes |
| architecture_review | architecture_agent (ARCHITECTURE_DOC) | architecture_reviewer_agent | yes |
| code_review | engineering_agent (CODE_CHANGESET_SUMMARY) | code_reviewer_agent | yes |
| premortem_fmea | architecture_agent / security_privacy_agent | risk_agent | yes |
| security_validation | engineering_agent (code/deps) | security_agent → maps to `security_validation_agent` | yes (author is engineering_agent) |
| verification_loop_bug_finding | engineering_agent (code) | qa_agent | yes for code; see note |
| development_completion | many stages | release_manager_agent | yes |
| **release_candidate** | **release_manager_agent (DEVELOPMENT_COMPLETION_REPORT)** | **release_manager_agent** | **NO — self-approval risk** |

Two findings recorded in open questions:

1. `release_candidate` is owned by `release_manager_agent` and its primary reviewed input, `DEVELOPMENT_COMPLETION_REPORT`, is authored by `release_manager_agent` (it owns `development_completion` too). Per the locked policy, the release-decision gate should be owned by a different role — recommended fallback `sdlc_team_lead` as the release-gate approver — or a dedicated `release_approver_agent` should be formalized. The cross-cutting `no_self_approval_policy` is listed pipeline-wide but the role assignment here violates it.
2. `verification_loop_bug_finding`, `test_generation`, and `test_execution` are all owned by `qa_agent`. For the code under test the author is `engineering_agent`, so code review independence holds; but `verification_loop_bug_finding` also consumes `TEST_EXECUTION_REPORT` authored by `qa_agent` itself. If strict independence is required for the test-result artifact, the bug-finding gate should be owned by `sdlc_team_lead` or a distinct QA-review role.

---

## 7. Shared-category coverage: registry ↔ usage

This section is the proof for D-011..D-015 / `05-shared-registry-and-usage-mapping.md`: **every shared category exists in the registry AND is referenced in at least one stage's usage mapping.** Each subsection lists the canonical registry members and, for representative members, a stage `uses_*` site. "Registry" = the canonical shared registry named in the Phase A contract; "Usage" = a stage `uses_*` field. Members marked ⚠ are referenced in usage but are **not** in the canonical registry (flagged in open questions for formalization).

### 7.1 Core Abilities

Registry (8): `Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS`.

| Core Ability | In registry | Example usage site (`uses_core_abilities`) |
|--------------|-------------|---------------------------------------------|
| Supervisor | yes | planning, development_completion, release_candidate, ai_agent_safety_evaluation, cost_resource_governance |
| Coder | yes | architecture, implementation, code_review, test_execution, security_validation |
| Vision | yes | accessibility_ux_validation_if_applicable |
| Memory | yes | intake, requirements, architecture, … (all 31 stages) |
| Web | yes | intake, domain_risk_profile, architecture, supply_chain_sbom_license |
| OS | yes | skill_semantic_extraction, implementation, test_execution, operations_readiness |
| Audio | yes | (not used by any current stage — registry-only; acceptable, no stage requires audio) |
| Creative | yes | (not used by any current stage — registry-only; acceptable) |

> `Audio` and `Creative` are legitimately registry-only: the SDLC pipeline has no audio/creative stage. The dual-visibility rule requires registry presence and is satisfied; usage is optional per category member. Every category as a whole has usage sites.

### 7.2 Skills

Registry (12): `prism, verification-loop, sentinel, llm-council, fmea, adr-builder, gap-audit, prompt-fidelity, calibrate, refraction, fermi-decompose, bayesian-update`.

| Skill | In registry | Example usage site (`uses_skills`) | Semantic check |
|-------|-------------|-------------------------------------|----------------|
| prism | yes | intake, requirements, architecture, premortem_fmea | divergent/brainstorm — correct, not used as a checklist |
| verification-loop | yes | code_review, test_generation, verification_loop_bug_finding, ai_agent_safety_evaluation, api/data validation | bug/defect finding — correct |
| sentinel | yes | architecture_review, security_privacy_design, premortem_fmea, operations_readiness, backup_restore_dr | pre-commitment stress test |
| llm-council | yes | architecture, architecture_review, ai_agent_safety_evaluation, domain_regulatory_compliance | multi-model deliberation |
| fmea | yes | security_privacy_design, premortem_fmea, privacy/data/perf validation | failure-mode analysis |
| adr-builder | yes | architecture, api_contract_compatibility_validation | decision records |
| gap-audit | yes | nearly every stage | coverage/gap audit |
| prompt-fidelity | yes | intake, requirements, requirements_review, accessibility, release_candidate | intent fidelity |
| calibrate | yes | domain_risk_profile, requirements_review, several validation gates | confidence calibration |
| refraction | yes | refraction_learning | post-run learning |
| fermi-decompose | yes | domain_risk_profile, cost_resource_governance | estimation decomposition |
| bayesian-update | yes | refraction_learning | belief update |
| ⚠ skill-architect | **no** | skill_semantic_extraction | legacy doc-05 skill — formalize or remap |
| ⚠ steelman | **no** | architecture_review | legacy doc-05 skill — formalize or remap |
| ⚠ handoff-designer | **no** | planning | legacy doc-05 skill — formalize or remap |
| ⚠ context-pack-builder | **no** | planning, implementation | legacy doc-05 skill — formalize or remap |
| ⚠ scanner-result-normalizer | **no** | security_validation | legacy doc-05 skill — formalize or remap |
| ⚠ evidence-graph-builder | **no** | evidence_graph_build | legacy doc-05 skill — formalize or remap |
| ⚠ release-readiness-judge | **no** | development_completion, release_candidate | legacy doc-05 skill — formalize or remap |

All 12 registry skills have usage. Skill ≠ Tool boundary holds: every name above is a reasoning capability, none is an I/O action.

### 7.3 Tools

Registry (canonical): `artifact_writer, evidence_writer, repo_diff_reader, repo_reader, repo_writer, test_runner, test_writer, coverage_parser, scanner_runner, dependency_scanner, sbom_generator, license_checker, accessibility_auditor, migration_checker, contract_test_runner, resource_budget_checker, compliance_matrix_builder, requirements_trace_checker, prompt_injection_tester, tool_misuse_tester, context_poisoning_tester, evidence_consistency_checker, agent_permission_auditor, eval_runner, backup_plan_checker, restore_test_runner, dr_runbook_checker, cost_estimator, quota_policy_checker, benchmark_runner, diagram_generator, policy_query, evidence_reader, defect_tracker, skill_package_reader`.

| Tool (registry) | Example usage site (`uses_tools`) |
|-----------------|------------------------------------|
| artifact_writer / evidence_writer | every stage (side-effect tools → imply governance + trace) |
| repo_reader / repo_writer | implementation |
| repo_diff_reader | code_review, verification_loop_bug_finding |
| test_runner | implementation, test_execution, verification_loop_bug_finding, data_migration |
| test_writer / coverage_parser | test_generation, test_execution |
| scanner_runner | security_validation |
| dependency_scanner / sbom_generator / license_checker | supply_chain_sbom_license |
| prompt_injection_tester / tool_misuse_tester / context_poisoning_tester / evidence_consistency_checker / agent_permission_auditor / eval_runner | ai_agent_safety_evaluation |
| compliance_matrix_builder / requirements_trace_checker | domain_regulatory_compliance_validation_if_applicable |
| migration_checker | data_migration_validation_if_applicable |
| contract_test_runner | api_contract_compatibility_validation |
| accessibility_auditor | accessibility_ux_validation_if_applicable |
| benchmark_runner / resource_budget_checker / cost_estimator / quota_policy_checker | performance_resilience, cost_resource_governance |
| backup_plan_checker / restore_test_runner / dr_runbook_checker | backup_restore_dr_validation_if_applicable |
| diagram_generator | architecture |
| policy_query | development_completion |
| evidence_reader | requirements_review, evidence_graph_build, development_completion, release_candidate |
| defect_tracker | verification_loop_bug_finding |
| skill_package_reader | skill_semantic_extraction |

Side-effect tools (`*_writer`, `repo_writer`, `*_runner`, etc.) imply a governance profile and a trace schema at every usage site — consistent with the locked "Side-effect tools imply governance + trace" rule (visible as `artifact_writer`/`evidence_writer` always pairing with a `*_trace`).

⚠ **Tools referenced in stages but absent from the canonical registry** (flagged in open questions): `data_inventory_checker, scanner_report_reader, secret_scanner, package_reputation_checker, retention_policy_checker, deletion_flow_checker, tenant_isolation_checker, openapi_validator, asyncapi_validator, breaking_change_detector, schema_diff_checker, rollback_validator, data_integrity_checker, runbook_checker, observability_plan_checker, ux_flow_checker, contrast_checker, memory_write`. `sdlc-stages/06` §8 already folds many of these into the pipeline-level `uses_tools` union; they still need registry formalization.

### 7.4 Governance Profiles

Registry: `sdlc_pipeline_governance, no_self_approval_policy, evidence_required_policy, agentic_safety_governance, supply_chain_governance, privacy_lifecycle_governance, data_migration_governance, domain_compliance_governance, release_candidate_governance` + stage-specific gate profiles (snake_case, e.g. `verification_loop_bug_gate`).

| Governance profile | In registry | Example usage site (`uses_governance_profiles`) |
|--------------------|-------------|--------------------------------------------------|
| sdlc_pipeline_governance | yes (pipeline-level) | pipeline (`08` §2) |
| no_self_approval_policy | yes | code_review (and applies pipeline-wide) |
| evidence_required_policy | yes | pipeline-level; realized as every stage emitting evidence |
| agentic_safety_governance | yes | ai_agent_safety_evaluation |
| supply_chain_governance | yes | supply_chain_sbom_license |
| privacy_lifecycle_governance | yes | security_privacy_design, privacy_data_lifecycle_validation |
| data_migration_governance | yes | data_migration_validation_if_applicable |
| domain_compliance_governance | yes | domain_regulatory_compliance_validation_if_applicable |
| release_candidate_governance | yes | release_candidate |
| verification_loop_bug_gate | yes (stage-specific class) | verification_loop_bug_finding |
| skill_semantic_extraction_gate, acceptance_criteria_gate, adr_required_gate, fmea_required_gate, no_self_approval_policy, no_critical_security_findings_gate, sbom_required_gate, evidence_integrity_gate, traceability_required_gate, release_after_development_completion_gate, … | yes (stage-specific class) | respective stages |

Governance ≠ Audit boundary holds: every profile above is a policy/gate, distinct from the evidence/trace schemas in §7.5. `sdlc-stages/06` §8 enumerates the pipeline-level governance union (compliance, breaking-change, DR, cost gates, etc.) so the stage-specific gates roll up into the pipeline registry.

### 7.5 Audit Schemas

Registry: `sdlc_pipeline_evidence_schema, stage_gate_trace_schema, release_evidence_schema, compliance_matrix_schema, regulatory_evidence_schema, bug_finding_evidence_schema` + stage-appropriate evidence/trace schemas, with evidence and trace kept distinct.

| Audit schema | Kind | In registry | Example usage site (`uses_audit_schemas`) |
|--------------|------|-------------|---------------------------------------------|
| sdlc_pipeline_evidence_schema | evidence | yes (pipeline) | pipeline (`08` §2) |
| stage_gate_trace_schema | trace | yes | intake, requirements, code_review, … |
| release_evidence_schema | evidence | yes | release_candidate |
| compliance_matrix_schema | evidence | yes | domain_regulatory_compliance_validation_if_applicable |
| regulatory_evidence_schema | evidence | yes | domain_regulatory_compliance_validation_if_applicable |
| bug_finding_evidence_schema | evidence | yes | verification_loop_bug_finding |
| decision_trace_schema | trace | yes (stage class) | architecture |
| security_scan_evidence_schema / security_finding_trace_schema | evidence / trace | yes (stage class) | security_validation |
| agentic_eval_evidence_schema / tool_misuse_trace_schema | evidence / trace | yes (stage class) | ai_agent_safety_evaluation |
| evidence_graph_schema / traceability_matrix_schema | evidence | yes (stage class) | evidence_graph_build |
| development_completion_evidence_schema / gate_decision_trace_schema | evidence / trace | yes (stage class) | development_completion |
| release_decision_trace_schema | trace | yes (stage class) | release_candidate |

Evidence ≠ Trace boundary holds: each stage pairs an `*_evidence_schema` (decision proof) with a `*_trace_schema` (process history); the two columns above never collapse.

### 7.6 Model / Provider Profiles

Registry: `sdlc_reasoning_profile, coder_engineering_model, supervisor_routing_model, architecture_reasoning_model, security_analysis_model, release_reasoning_model, defect_analysis_model, vision_model`.

| Model/provider profile | In registry | Example usage site (`uses_model_provider_profiles`) |
|------------------------|-------------|------------------------------------------------------|
| sdlc_reasoning_profile | yes | intake, domain_risk_profile, skill_semantic_extraction, requirements, requirements_review |
| coder_engineering_model | yes | implementation |
| supervisor_routing_model | yes | (Supervisor Core Ability routing; pipeline-level) |
| architecture_reasoning_model | yes | architecture |
| security_analysis_model | yes | security_validation |
| release_reasoning_model | yes | development_completion, release_candidate |
| defect_analysis_model | yes | verification_loop_bug_finding |
| vision_model | yes | (paired with Vision in accessibility_ux_validation_if_applicable) |

⚠ Additional model profiles appear in stage usage that are not in the canonical registry: `architecture_review_model, security_reasoning_model, risk_reasoning_model, planning_reasoning_model, code_review_model, test_generation_model, test_analysis_model, supply_chain_analysis_model, agentic_safety_eval_model, privacy_analysis_model, contract_analysis_model, data_migration_analysis_model, ux_accessibility_model, performance_analysis_model, cost_resource_analysis_model, compliance_reasoning_model, operations_analysis_model, evidence_graph_model, learning_reflection_model`. These are finer-grained than the 8-profile canonical set; flagged for registry reconciliation (likely they collapse onto `sdlc_reasoning_profile` / `security_analysis_model` / `architecture_reasoning_model` / `release_reasoning_model`).

### 7.7 Context / Memory Profiles

Registry: `sdlc_run_context, requirements_context_pack, architecture_context_pack, implementation_context_pack, release_context_pack, verification_context_pack, security_context_pack, operations_context_pack`.

| Context/memory profile | In registry | Example usage site (`uses_context_memory_profiles`) |
|------------------------|-------------|------------------------------------------------------|
| sdlc_run_context | yes | pipeline run (`08` §2) |
| requirements_context_pack | yes | requirements |
| architecture_context_pack | yes | architecture |
| implementation_context_pack | yes | implementation |
| release_context_pack | yes | release_candidate |
| verification_context_pack | yes | verification_loop_bug_finding |
| security_context_pack | yes | (security family; paired with security_validation_context_pack) |
| operations_context_pack | yes | operations_readiness |

⚠ Many stages use a per-stage context pack not in the canonical 8 (e.g. `intake_context_pack, domain_risk_context_pack, skill_semantic_context_pack, requirements_review_context_pack, architecture_review_context_pack, security_privacy_context_pack, security_validation_context_pack, risk_context_pack, planning_context_pack, code_review_context_pack, test_generation_context_pack, test_execution_context_pack, supply_chain_context_pack, agentic_safety_context_pack, privacy_context_pack, api_contract_context_pack, compliance_context_pack, data_migration_context_pack, ux_accessibility_context_pack, performance_context_pack, cost_resource_context_pack, backup_restore_context_pack, evidence_graph_context_pack, development_completion_context_pack, learning_context_pack`). Flagged for reconciliation: either promote these into the registry or document them as sub-packs of the 8 canonical context families.

### 7.8 Coverage summary

| Shared category | Registry members | Members with a usage site | Every category appears in registry AND usage? |
|-----------------|-------------------|---------------------------|-----------------------------------------------|
| Core Abilities | 8 | 6 of 8 (Audio/Creative registry-only) | yes |
| Skills | 12 | 12 of 12 | yes |
| Tools | 35 canonical | all canonical have usage | yes |
| Governance Profiles | 9 base + stage gates | all base + gates have usage | yes |
| Audit Schemas | 6 base + stage schemas | all have usage | yes |
| Model/Provider Profiles | 8 | 8 of 8 (Vision via accessibility) | yes |
| Context/Memory Profiles | 8 | 8 of 8 | yes |

Conclusion: **all seven shared categories satisfy the dual-visibility rule** — each is present in the shared registry and referenced in at least one stage's usage mapping. Individual *members* that are usage-only (⚠ rows) or registry-only (Audio, Creative) are itemized above and, where they are usage-only, are recorded in open questions for registry formalization.

---

## 8. How to read this with the live contracts

- Per-stage detail (all 7 `uses_*` fields, `inputs`, `outputs`, `evidence`, `trace`, `gates`, routing): the `sdlc-stages/*` files.
- Pipeline-level union of shared categories: `08-sdlc-pipeline-contract.md` §2 and `sdlc-stages/06` §8.
- The dual-visibility rule itself: `00a-shared-registry-decisions.md` (D-011..D-015), `05-shared-registry-and-usage-mapping.md`.
- Context-lock confirmation that no locked decision is violated: `execution/phase-0-context-lock-report.md`.

This overview is descriptive. Where it disagrees with a stage contract, the stage contract (as amended by `sdlc-stages/06`) wins, and the disagreement is captured in open questions.
