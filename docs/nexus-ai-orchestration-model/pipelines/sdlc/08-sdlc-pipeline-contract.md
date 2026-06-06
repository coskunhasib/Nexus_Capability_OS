# 08 — SDLC Pipeline Contract

Bu doküman, genel Pipeline Contract Standard’ın SDLC Pipeline’a uygulanmış ilk taslağıdır.

## 1. Pipeline Definition

```yaml
pipeline_id: sdlc_pipeline
name: SDLC Pipeline
purpose: Sıfırdan ürün seviyesine yazılım geliştirme sürecini no-human governance ile yürütmek.
version: draft-0.1
status: discussion
owner_domain: software_engineering
required_team_type: sdlc_team
required_team_lead_role: sdlc_team_lead
applicable_domains:
  - software_product
  - saas
  - ai_agent_product
  - api_service
  - web_app
  - internal_tool
risk_profiles:
  - prototype
  - internal_tool
  - commercial_product
  - regulated_or_high_risk
```

## 2. Pipeline-level usage mapping

```yaml
uses_core_abilities:
  - Supervisor
  - Coder
  - Memory
  - Web
  - OS
  - Vision

uses_skills:
  - prism
  - verification-loop
  - sentinel
  - llm-council
  - fmea
  - adr-builder
  - gap-audit
  - prompt-fidelity
  - calibrate
  - refraction
  - fermi-decompose
  - bayesian-update

uses_tools:
  - artifact_writer
  - evidence_writer
  - repo_diff_reader
  - test_runner
  - scanner_runner
  - dependency_scanner
  - sbom_generator
  - license_checker
  - accessibility_auditor
  - migration_checker
  - contract_test_runner
  - resource_budget_checker
  - compliance_matrix_builder
  - requirements_trace_checker
  - prompt_injection_tester
  - tool_misuse_tester
  - context_poisoning_tester
  - evidence_consistency_checker
  - agent_permission_auditor
  - eval_runner
  - backup_plan_checker
  - restore_test_runner
  - dr_runbook_checker
  - cost_estimator
  - quota_policy_checker

uses_governance_profiles:
  - sdlc_pipeline_governance
  - no_self_approval_policy
  - evidence_required_policy
  - agentic_safety_governance
  - supply_chain_governance
  - privacy_lifecycle_governance
  - data_migration_governance
  - domain_compliance_governance
  - release_candidate_governance

uses_audit_schemas:
  - sdlc_pipeline_evidence_schema
  - stage_gate_trace_schema
  - release_evidence_schema
  - compliance_matrix_schema
  - regulatory_evidence_schema

uses_model_provider_profiles:
  - sdlc_reasoning_profile
  - coder_engineering_model
  - supervisor_routing_model
  - architecture_reasoning_model
  - security_analysis_model
  - release_reasoning_model

uses_context_memory_profiles:
  - sdlc_run_context
  - requirements_context_pack
  - architecture_context_pack
  - implementation_context_pack
  - release_context_pack
```

## 3. Stage list

```text
intake
domain_risk_profile
skill_semantic_extraction
requirements
requirements_review
architecture
architecture_review
security_privacy_design
premortem_fmea
planning
implementation
code_review
test_generation
test_execution
verification_loop_bug_finding
security_validation
supply_chain_sbom_license
ai_agent_safety_evaluation
privacy_data_lifecycle_validation
api_contract_compatibility_validation
domain_regulatory_compliance_validation_if_applicable
data_migration_validation_if_applicable
accessibility_ux_validation_if_applicable
performance_resilience
cost_resource_governance
backup_restore_dr_validation_if_applicable
operations_readiness
evidence_graph_build
development_completion
release_candidate
refraction_learning
```

## 4. Mandatory gates

Always required for product-grade SDLC:

```text
requirements_complete
nfr_coverage_complete
architecture_complete
adr_coverage_complete
security_privacy_design_complete
risk_register_reviewed
implementation_scope_clean
code_review_pass
tests_pass
verification_loop_bug_finding_pass
security_validation_pass
supply_chain_pass
license_pass
sbom_present
performance_resilience_pass_or_accepted
agentic_safety_eval_pass
operations_readiness_pass
evidence_graph_complete
no_blocking_policy_failure
```

> Reconciliation vs doc 06 §8 (locked in decision log D-016): this always-required set is
> **identical** to doc 06 §8's always-required gate set and to
> `configs/nexus-ai/sdlc_pipeline.yaml` → `required_gates.always` — the same 19 gates in the
> same order. The canonical machine-readable source is `sdlc_pipeline.yaml required_gates.always`;
> doc 06 §8 and doc 08 §4 are its human-readable mirrors. The set is the union of three
> decisions in the doc-06 family: doc 06 §8 (base) + doc 06a (`supply_chain_pass`,
> `license_pass`, `sbom_present`) + doc 06b (`agentic_safety_eval_pass`, "Development Completion
> impact"). Three gates are called out: the two always-on BLOCKER gates `risk_register_reviewed`
> (produced by stage 9 premortem_fmea) and `performance_resilience_pass_or_accepted` (produced by
> stage 24 performance_resilience), plus `agentic_safety_eval_pass` (produced by stage 18
> ai_agent_safety_evaluation). All three are governed severity: blocker / required_when: always
> and are members of the stage-29 development_completion rollup. (An earlier doc 06 §8 omitted
> `agentic_safety_eval_pass` and an earlier doc 08 §4 draft omitted the two blocker gates; D-016
> resolves both so the two sections list the identical set.)

Conditional required:

```text
accessibility_pass_if_applicable
data_migration_pass_if_applicable
privacy_lifecycle_pass_if_applicable
api_contract_compatibility_pass_if_applicable
backup_restore_dr_pass_if_applicable
compliance_pass_if_applicable
cost_resource_governance_pass_if_applicable
```

## 5. Stage contract example — verification_loop_bug_finding

```yaml
stage_id: verification_loop_bug_finding
purpose: verification-loop skill’i ile bug/defect sweep yürütmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: qa_agent
sub_agents:
  - bug_hunter_sub_agent
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - verification-loop
uses_tools:
  - repo_diff_reader
  - test_runner
  - defect_tracker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - verification_loop_bug_gate
uses_audit_schemas:
  - bug_finding_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - defect_analysis_model
uses_context_memory_profiles:
  - verification_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - TEST_EXECUTION_REPORT
  - REQUIREMENTS_SPEC
outputs:
  - BUG_FINDING_REPORT
  - BUG_FINDING_GATE_RESULT
evidence:
  - BUG_FINDING_REPORT
trace:
  - verification_loop_skill_activation_trace
  - defect_tracker_tool_trace
gates:
  - open_blocker_bugs_zero
  - open_major_bugs_below_threshold
on_pass: security_validation
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - open_blocker_bug_count > 0
```

## 6. Development Completion minimum

Development Completion pass olabilmesi için `06`, `06a`, `06b` dokümanlarında belirtilen tüm required ve applicable conditional gates değerlendirilmiş olmalıdır.

## 7. Release Candidate minimum

Release Candidate, Development Completion pass olmadan üretilemez.

Minimum evidence set (canonical artifact names from
`configs/nexus-ai/artifact_registry.yaml` → `release_evidence_required.core`):

```text
REQUIREMENTS_SPEC
NFR_CATALOG
ARCHITECTURE_DOC
ADR_INDEX
THREAT_MODEL
FMEA_RISK_REGISTER
CODE_REVIEW_REPORT
TEST_EXECUTION_REPORT
BUG_FINDING_REPORT
SECURITY_SCAN_REPORT
SBOM
LICENSE_REPORT
AGENTIC_SAFETY_EVAL_REPORT
PERFORMANCE_REPORT
RUNBOOK
ROLLBACK_PLAN
OBSERVABILITY_PLAN
EVIDENCE_GRAPH
DEVELOPMENT_COMPLETION_REPORT
RELEASE_CANDIDATE_REPORT
```

> Naming reconciliation vs the artifact registry (earlier prose names → canonical names):
> `ARCHITECTURE_DECISION / ADR` → `ARCHITECTURE_DOC` + `ADR_INDEX`; `RISK_REGISTER` →
> `FMEA_RISK_REGISTER`. The prose-only `IMPLEMENTATION_SUMMARY` and `SUPPLY_CHAIN_GATE_RESULT`
> are not registry release-evidence items (the registry tracks `CODE_CHANGESET_SUMMARY` /
> `IMPLEMENTATION_NOTES` and `SUPPLY_CHAIN_GATE_RESULT` as stage artifacts, not in
> `release_evidence_required`), so they are dropped from the release-evidence set.
> `PERFORMANCE_REPORT` is retained as semantically required and is already the registry's
> exact name.

Conditional evidence (canonical artifact names from
`release_evidence_required.conditional`):

```text
COMPLIANCE_MATRIX_IF_APPLICABLE
REGULATORY_TRACEABILITY_REPORT_IF_APPLICABLE
DATA_LIFECYCLE_REPORT
API_CONTRACT_REPORT
MIGRATION_VALIDATION_REPORT
ACCESSIBILITY_REPORT
COST_ESTIMATE_REPORT
RESTORE_TEST_REPORT
```

> Conditional naming reconciliation (earlier prose names → canonical names):
> `ACCESSIBILITY_REPORT_IF_APPLICABLE` → `ACCESSIBILITY_REPORT`;
> `UX_VALIDATION_REPORT_IF_APPLICABLE` is covered by `accessibility_ux_validation` evidence
> and is not a separate registry release item; `DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE` /
> `DATA_INTEGRITY_REPORT_IF_APPLICABLE` fold into `MIGRATION_VALIDATION_REPORT`;
> `PRIVACY_LIFECYCLE_REPORT_IF_APPLICABLE` → `DATA_LIFECYCLE_REPORT`;
> `API_CONTRACT_REPORT_IF_APPLICABLE` → `API_CONTRACT_REPORT`;
> `BACKUP_RESTORE_DR_REPORT_IF_APPLICABLE` → `RESTORE_TEST_REPORT`;
> `COST_RESOURCE_REPORT_IF_APPLICABLE` → `COST_ESTIMATE_REPORT`; and
> `REGULATORY_TRACEABILITY_REPORT_IF_APPLICABLE` is added to match the registry set.

## 8. Remaining work

Bu taslak hâlâ stage-by-stage tam contract dosyası değildir. Sıradaki iş, her stage için `07-pipeline-contract-standard.md` formatında ayrı stage contract üretmektir.
