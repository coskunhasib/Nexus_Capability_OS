# 06b — SDLC Agentic Safety and Remaining Gates Decision

Bu doküman, SDLC kapsamındaki kalan önemli gate ailelerini görünür hale getirir.

Bu alanlar yeni konu değildir. Yazılım geliştirme standardı araştırmasında vardı; ancak SDLC Pipeline sözleşmesinde açık gate / evidence olarak ayrıca gösterilmelidir.

## Decision

Aşağıdaki alanlar SDLC Pipeline içinde görünür gate olarak yer almalıdır:

```text
AI / Agent Safety & Evaluation
Domain / Regulatory Compliance Validation
Privacy / Data Lifecycle Validation
Backup / Restore / Disaster Recovery Validation
API / Contract Compatibility Validation
Cost / Resource Governance
```

## 1. AI / Agent Safety & Evaluation

### Status

```text
required_for_nexus_ai_and_agentic_features
```

### Purpose

AI / agentic sistemlerde klasik appsec kontrollerine ek olarak agent davranışı, tool kullanımı, context güvenliği ve evidence doğruluğu test edilir.

### Required when

```text
always_required_for_nexus_ai_sdlc
or feature_uses_agents == true
or feature_uses_tools == true
or feature_uses_llm_context == true
```

### Uses Core Abilities

```text
Supervisor
Coder
Memory
Web
OS
```

### Uses Skills

```text
verification-loop
sentinel
llm-council
calibrate
gap-audit
```

### Uses Tools

```text
prompt_injection_tester
tool_misuse_tester
context_poisoning_tester
evidence_consistency_checker
agent_permission_auditor
eval_runner
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
agentic_safety_governance
tool_misuse_governance
context_safety_governance
evidence_integrity_gate
```

### Uses Audit Schemas

```text
agentic_eval_evidence_schema
prompt_injection_test_schema
tool_misuse_trace_schema
evidence_integrity_report_schema
```

### Required evidence

```text
AGENTIC_SAFETY_EVAL_REPORT
PROMPT_INJECTION_TEST_REPORT
TOOL_MISUSE_TEST_REPORT
CONTEXT_POISONING_TEST_REPORT
EVIDENCE_INTEGRITY_REPORT
```

## 2. Domain / Regulatory Compliance Validation

### Status

```text
conditional_required
```

### Required when

```text
regulated_domain == true
or contractual_compliance_required == true
or public_sector_or_enterprise_requirements_present == true
```

### Purpose

Ürünün hedef alanına göre yasal, kurumsal, güvenlik ve domain standardı gereklilikleri kontrol edilir.

### Uses Core Abilities

```text
Memory
Web
Coder
```

### Uses Skills

```text
gap-audit
llm-council
calibrate
```

### Uses Tools

```text
compliance_matrix_builder
requirements_trace_checker
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
domain_compliance_governance
regulatory_traceability_gate
```

### Uses Audit Schemas

```text
compliance_matrix_schema
regulatory_evidence_schema
```

### Required evidence

```text
COMPLIANCE_MATRIX
REGULATORY_TRACEABILITY_REPORT
COMPLIANCE_GATE_RESULT
```

## 3. Privacy / Data Lifecycle Validation

### Status

```text
conditional_required
```

### Required when

```text
personal_data_processed == true
or sensitive_data_processed == true
or tenant_data_processed == true
or audit_log_contains_user_data == true
```

### Purpose

Veri minimizasyonu, saklama, silme, anonimleştirme, export, audit log ve tenant izolasyonu kontrolleri yapılır.

### Uses Core Abilities

```text
Memory
Coder
OS
```

### Uses Skills

```text
gap-audit
fmea
sentinel
```

### Uses Tools

```text
data_inventory_checker
retention_policy_checker
deletion_flow_checker
tenant_isolation_checker
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
privacy_lifecycle_governance
data_retention_gate
tenant_isolation_gate
```

### Uses Audit Schemas

```text
privacy_evidence_schema
data_lifecycle_report_schema
tenant_isolation_report_schema
```

### Required evidence

```text
DATA_INVENTORY
DATA_LIFECYCLE_REPORT
RETENTION_POLICY_REPORT
TENANT_ISOLATION_REPORT
PRIVACY_GATE_RESULT
```

## 4. Backup / Restore / Disaster Recovery Validation

### Status

```text
conditional_required
```

### Required when

```text
production_release_candidate == true
or persistent_data_exists == true
or availability_requirement_present == true
```

### Purpose

Yedekleme, geri yükleme, RTO/RPO, runbook, rollback ve disaster recovery readiness doğrulanır.

### Uses Core Abilities

```text
OS
Memory
Coder
```

### Uses Skills

```text
sentinel
fmea
gap-audit
```

### Uses Tools

```text
backup_plan_checker
restore_test_runner
dr_runbook_checker
rollback_validator
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
backup_restore_governance
disaster_recovery_gate
rollback_required_gate
```

### Uses Audit Schemas

```text
backup_restore_evidence_schema
dr_validation_schema
rollback_validation_schema
```

### Required evidence

```text
BACKUP_PLAN
RESTORE_TEST_REPORT
DR_READINESS_REPORT
ROLLBACK_VALIDATION_REPORT
```

## 5. API / Contract Compatibility Validation

### Status

```text
conditional_required
```

### Required when

```text
api_changed == true
or event_contract_changed == true
or sdk_or_client_contract_changed == true
or public_interface_changed == true
```

### Purpose

API, event, SDK veya public interface değişikliklerinin geriye uyumluluk, contract, versioning ve client etkisi açısından doğrulanmasıdır.

### Uses Core Abilities

```text
Coder
Memory
Web
```

### Uses Skills

```text
gap-audit
verification-loop
adr-builder
```

### Uses Tools

```text
openapi_validator
asyncapi_validator
contract_test_runner
breaking_change_detector
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
api_contract_governance
breaking_change_gate
compatibility_gate
```

### Uses Audit Schemas

```text
api_contract_evidence_schema
compatibility_report_schema
```

### Required evidence

```text
API_CONTRACT_REPORT
BREAKING_CHANGE_REPORT
CONTRACT_TEST_REPORT
COMPATIBILITY_GATE_RESULT
```

## 6. Cost / Resource Governance

### Status

```text
conditional_required
```

### Required when

```text
ai_or_compute_heavy_feature == true
or gpu_cpu_memory_budget_relevant == true
or external_provider_cost_relevant == true
or retry_loop_or_parallel_execution_present == true
```

### Purpose

Token, model, GPU, CPU, RAM, storage, CI time, retry loop ve inference maliyetleri kontrol edilir.

### Uses Core Abilities

```text
Supervisor
Coder
Memory
OS
```

### Uses Skills

```text
fermi-decompose
calibrate
gap-audit
```

### Uses Tools

```text
resource_budget_checker
cost_estimator
benchmark_runner
quota_policy_checker
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
cost_resource_governance
resource_budget_gate
quota_governance
```

### Uses Audit Schemas

```text
cost_evidence_schema
resource_budget_report_schema
```

### Required evidence

```text
COST_ESTIMATE_REPORT
RESOURCE_BUDGET_REPORT
QUOTA_POLICY_REPORT
RESOURCE_GATE_RESULT
```

## Development Completion impact

Development Completion gate setine şu maddeler eklenir:

```text
agentic_safety_eval_pass
compliance_pass_if_applicable
privacy_lifecycle_pass_if_applicable
backup_restore_dr_pass_if_applicable
api_contract_compatibility_pass_if_applicable
cost_resource_governance_pass_if_applicable
```

## Release Candidate impact

Release Candidate evidence setine şu artifact’lar eklenir:

```text
AGENTIC_SAFETY_EVAL_REPORT
PROMPT_INJECTION_TEST_REPORT
TOOL_MISUSE_TEST_REPORT
CONTEXT_POISONING_TEST_REPORT
COMPLIANCE_MATRIX_IF_APPLICABLE
REGULATORY_TRACEABILITY_REPORT_IF_APPLICABLE
DATA_LIFECYCLE_REPORT_IF_APPLICABLE
BACKUP_RESTORE_DR_REPORT_IF_APPLICABLE
API_CONTRACT_REPORT_IF_APPLICABLE
COST_RESOURCE_REPORT_IF_APPLICABLE
```

## Rule

Bu alanlar görünür gate/evidence olarak bağlanmadan SDLC Pipeline tam kapsamlı sayılmaz.
