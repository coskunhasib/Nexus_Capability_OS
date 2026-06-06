# 06 — Canonical Corrections and Overrides

Bu dosya, `09-sdlc-stage-contract-review.md` bulgularını kapatmak için canonical düzeltmeleri tanımlar.

Bu dosyadaki düzeltmeler, önceki `sdlc-stages/*` dosyalarına ek/override kabul edilir.

## 1. Added stage — domain_regulatory_compliance_validation_if_applicable

```yaml
stage_id: domain_regulatory_compliance_validation_if_applicable
purpose: Regulated/domain-specific/contractual compliance gereksinimlerini doğrulamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: compliance_agent
sub_agents: []
required_when:
  - regulated_domain == true
  - contractual_compliance_required == true
  - public_sector_or_enterprise_requirements_present == true
applicability_decision: COMPLIANCE_APPLICABILITY_DECISION
uses_core_abilities:
  - Memory
  - Web
  - Coder
uses_skills:
  - gap-audit
  - llm-council
  - calibrate
uses_tools:
  - compliance_matrix_builder
  - requirements_trace_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - domain_compliance_governance
  - regulatory_traceability_gate
uses_audit_schemas:
  - compliance_matrix_schema
  - regulatory_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - compliance_reasoning_model
uses_context_memory_profiles:
  - compliance_context_pack
inputs:
  - DOMAIN_PROFILE_DECISION
  - REQUIREMENTS_SPEC
  - SECURITY_REQUIREMENTS
  - PRIVACY_RISK_REGISTER
outputs:
  - COMPLIANCE_APPLICABILITY_DECISION
  - COMPLIANCE_MATRIX
  - REGULATORY_TRACEABILITY_REPORT
  - COMPLIANCE_GATE_RESULT
evidence:
  - COMPLIANCE_APPLICABILITY_DECISION
  - COMPLIANCE_MATRIX
  - REGULATORY_TRACEABILITY_REPORT
  - COMPLIANCE_GATE_RESULT
trace:
  - compliance_validation_trace
gates:
  - compliance_pass_if_applicable
  - regulatory_traceability_pass_if_applicable
on_pass: data_migration_validation_if_applicable
on_fail: security_privacy_design   # reconciled to operative value (stage 21 YAML + runtime_rules by_stage); was `requirements` in this doc
rework_route: security_privacy_design   # reconciled to operative value (stage 21 YAML + runtime_rules by_stage); was `requirements` in this doc
blocking_conditions:
  - unresolved_regulatory_requirement
  - missing_compliance_traceability
```

## 2. Stage route override

`api_contract_compatibility_validation` route güncellemesi:

```yaml
stage_id: api_contract_compatibility_validation
on_pass: domain_regulatory_compliance_validation_if_applicable
```

`domain_regulatory_compliance_validation_if_applicable` sonrası route:

```yaml
on_pass: data_migration_validation_if_applicable
```

Bu düzeltme ile `06b` içindeki `Domain / Regulatory Compliance Validation` gate’i stage contract setine bağlanır.

## 3. Planning output override

`planning` stage outputs alanına şu çıktılar eklenir:

```yaml
outputs_add:
  - OPERATIONAL_READINESS_DRAFTS
  - RUNBOOK_DRAFT
  - ROLLBACK_PLAN_DRAFT
```

Gerekçe:

```text
backup_restore_dr_validation_if_applicable stage’i RUNBOOK_DRAFT ve ROLLBACK_PLAN_DRAFT girdilerini bekliyor.
```

Bu output’lar planning stage tarafından üretilmelidir.

## 4. Implementation output override

`implementation` stage outputs alanına şu conditional çıktılar eklenir:

```yaml
outputs_add:
  - DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE
  - MIGRATION_FILES_IF_APPLICABLE
  - API_CONTRACTS_IF_APPLICABLE
  - UI_CHANGESET_SUMMARY_IF_APPLICABLE
  - RESOURCE_USAGE_DATA_IF_APPLICABLE
  - TOOL_PERMISSION_MAP
  - CONTEXT_POLICY
```

Gerekçe:

Sonraki validation stage’leri bu girdileri bekler:

```text
data_migration_validation_if_applicable
api_contract_compatibility_validation
accessibility_ux_validation_if_applicable
cost_resource_governance
ai_agent_safety_evaluation
```

## 5. Data migration input override

`data_migration_validation_if_applicable` inputs alanı şu şekilde standardize edilir:

```yaml
inputs:
  - DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE
  - MIGRATION_FILES_IF_APPLICABLE
```

Önceki `DATA_MODEL_CHANGE_REPORT` ve `MIGRATION_FILES` isimleri canonical olarak `_IF_APPLICABLE` suffix’iyle kullanılır.

## 6. Conditional applicability decision standard

Koşullu tüm stage’ler applicability decision üretmeli veya tüketmelidir.

Standart alan:

```yaml
applicability_decision:
```

Canonical decisions:

```text
COMPLIANCE_APPLICABILITY_DECISION
PRIVACY_LIFECYCLE_APPLICABILITY_DECISION
API_CONTRACT_APPLICABILITY_DECISION
DATA_MIGRATION_APPLICABILITY_DECISION
ACCESSIBILITY_UX_APPLICABILITY_DECISION
BACKUP_RESTORE_DR_APPLICABILITY_DECISION
COST_RESOURCE_APPLICABILITY_DECISION
```

## 7. Conditional stage applicability mapping

```yaml
privacy_data_lifecycle_validation:
  applicability_decision: PRIVACY_LIFECYCLE_APPLICABILITY_DECISION

api_contract_compatibility_validation:
  applicability_decision: API_CONTRACT_APPLICABILITY_DECISION

domain_regulatory_compliance_validation_if_applicable:
  applicability_decision: COMPLIANCE_APPLICABILITY_DECISION

data_migration_validation_if_applicable:
  applicability_decision: DATA_MIGRATION_APPLICABILITY_DECISION

accessibility_ux_validation_if_applicable:
  applicability_decision: ACCESSIBILITY_UX_APPLICABILITY_DECISION

cost_resource_governance:
  applicability_decision: COST_RESOURCE_APPLICABILITY_DECISION

backup_restore_dr_validation_if_applicable:
  applicability_decision: BACKUP_RESTORE_DR_APPLICABILITY_DECISION
```

## 8. Pipeline-level usage mapping override

`08-sdlc-pipeline-contract.md` pipeline-level usage mapping, stage-level kullanılan shared öğelerin union’ı olarak yorumlanır.

Aşağıdaki araçlar pipeline-level `uses_tools` listesine eklenmiş sayılır:

```text
compliance_matrix_builder
requirements_trace_checker
prompt_injection_tester
tool_misuse_tester
context_poisoning_tester
evidence_consistency_checker
agent_permission_auditor
eval_runner
backup_plan_checker
restore_test_runner
dr_runbook_checker
cost_estimator
quota_policy_checker
package_reputation_checker
retention_policy_checker
deletion_flow_checker
tenant_isolation_checker
schema_diff_checker
data_integrity_checker
breaking_change_detector
```

Aşağıdaki governance profiles pipeline-level `uses_governance_profiles` listesine eklenmiş sayılır:

```text
domain_compliance_governance
regulatory_traceability_gate
api_contract_governance
breaking_change_gate
compatibility_gate
backup_restore_governance
disaster_recovery_gate
cost_resource_governance
resource_budget_gate
quota_governance
```

Aşağıdaki audit schemas pipeline-level `uses_audit_schemas` listesine eklenmiş sayılır:

```text
compliance_matrix_schema
regulatory_evidence_schema
api_contract_evidence_schema
compatibility_report_schema
backup_restore_evidence_schema
dr_validation_schema
cost_evidence_schema
resource_budget_report_schema
```

## 9. Development Completion gate override

Development Completion gate seti şu gate’i kesin içerir:

```text
compliance_pass_if_applicable
```

Bu gate’in üreticisi:

```text
domain_regulatory_compliance_validation_if_applicable
```

## 10. Release Candidate evidence override

Release Candidate conditional evidence setine şunlar kesin eklenir:

```text
COMPLIANCE_APPLICABILITY_DECISION
COMPLIANCE_MATRIX_IF_APPLICABLE
REGULATORY_TRACEABILITY_REPORT_IF_APPLICABLE
COMPLIANCE_GATE_RESULT_IF_APPLICABLE
```

## 11. Resolution mapping to review findings

```text
BF-001 resolved by sections 1, 2, 9, 10.
MF-001 resolved by section 3.
MF-002 resolved by sections 6 and 7.
MF-003 resolved by sections 4 and 5.
MF-004 resolved by section 8.
NF-001 addressed by section 6.
```

## 12. Canonical rule

Bu dosyadaki correction/override kayıtları ikinci review tamamlanana kadar canonical kabul edilir.

İkinci review sonrası bu düzeltmeler istenirse ana stage dosyalarına inline taşınabilir.
