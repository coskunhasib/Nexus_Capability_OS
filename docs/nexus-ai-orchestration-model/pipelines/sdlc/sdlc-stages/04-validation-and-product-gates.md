# 04 — Validation and Product Gate Stage Contracts

Bu dosya SDLC Pipeline’ın security, supply chain, agentic safety, privacy, contract, migration, accessibility, performance, cost ve DR gate aşamalarını tanımlar.

## 1. security_validation

```yaml
stage_id: security_validation
purpose: Security scanner sonuçlarını, secret risklerini ve code/dependency güvenlik bulgularını değerlendirmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: security_agent
sub_agents:
  - security_scan_interpreter_sub_agent
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - scanner-result-normalizer
  - calibrate
  - gap-audit
uses_tools:
  - scanner_runner
  - scanner_report_reader
  - secret_scanner
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - security_validation_governance
  - no_critical_security_findings_gate
  - no_secret_leak_gate
uses_audit_schemas:
  - security_scan_evidence_schema
  - security_finding_trace_schema
uses_model_provider_profiles:
  - security_analysis_model
uses_context_memory_profiles:
  - security_validation_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - TEST_EXECUTION_REPORT
outputs:
  - SECURITY_SCAN_REPORT
  - SECURITY_FINDINGS_NORMALIZED
evidence:
  - SECURITY_SCAN_REPORT
  - SECURITY_FINDINGS_NORMALIZED
trace:
  - scanner_runner_trace
  - security_interpretation_trace
gates:
  - no_critical_security_findings
  - no_high_security_findings_without_acceptance
  - no_secret_leak
on_pass: supply_chain_sbom_license
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - critical_security_finding
  - secret_leak
```

## 2. supply_chain_sbom_license

```yaml
stage_id: supply_chain_sbom_license
purpose: Dependency, SBOM, lisans ve package risklerini doğrulamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: supply_chain_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - Web
  - OS
uses_skills:
  - gap-audit
  - calibrate
uses_tools:
  - dependency_scanner
  - sbom_generator
  - license_checker
  - package_reputation_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - supply_chain_governance
  - license_compliance_governance
  - sbom_required_gate
uses_audit_schemas:
  - sbom_evidence_schema
  - license_report_schema
  - supply_chain_trace_schema
uses_model_provider_profiles:
  - supply_chain_analysis_model
uses_context_memory_profiles:
  - supply_chain_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - DEPENDENCY_MANIFESTS
outputs:
  - SBOM
  - LICENSE_REPORT
  - DEPENDENCY_RISK_REPORT
  - SUPPLY_CHAIN_GATE_RESULT
evidence:
  - SBOM
  - LICENSE_REPORT
  - DEPENDENCY_RISK_REPORT
trace:
  - dependency_scan_trace
  - sbom_generation_trace
gates:
  - supply_chain_pass
  - license_pass
  - sbom_present
on_pass: ai_agent_safety_evaluation
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - forbidden_license
  - critical_dependency_risk
  - missing_sbom
```

## 3. ai_agent_safety_evaluation

```yaml
stage_id: ai_agent_safety_evaluation
purpose: Agentic davranış, prompt injection, tool misuse, context poisoning ve evidence integrity risklerini test etmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: agentic_safety_agent
sub_agents: []
uses_core_abilities:
  - Supervisor
  - Coder
  - Memory
  - Web
  - OS
uses_skills:
  - verification-loop
  - sentinel
  - llm-council
  - calibrate
  - gap-audit
uses_tools:
  - prompt_injection_tester
  - tool_misuse_tester
  - context_poisoning_tester
  - evidence_consistency_checker
  - agent_permission_auditor
  - eval_runner
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - agentic_safety_governance
  - tool_misuse_governance
  - context_safety_governance
  - evidence_integrity_gate
uses_audit_schemas:
  - agentic_eval_evidence_schema
  - prompt_injection_test_schema
  - tool_misuse_trace_schema
  - evidence_integrity_report_schema
uses_model_provider_profiles:
  - agentic_safety_eval_model
uses_context_memory_profiles:
  - agentic_safety_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - TOOL_PERMISSION_MAP
  - CONTEXT_POLICY
outputs:
  - AGENTIC_SAFETY_EVAL_REPORT
  - PROMPT_INJECTION_TEST_REPORT
  - TOOL_MISUSE_TEST_REPORT
  - CONTEXT_POISONING_TEST_REPORT
  - EVIDENCE_INTEGRITY_REPORT
evidence:
  - AGENTIC_SAFETY_EVAL_REPORT
  - EVIDENCE_INTEGRITY_REPORT
trace:
  - agentic_eval_trace
  - tool_misuse_test_trace
gates:
  - agentic_safety_eval_pass
  - evidence_integrity_pass
  - no_unsafe_tool_delegation
on_pass: privacy_data_lifecycle_validation
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - prompt_injection_bypass
  - unsafe_tool_misuse
  - hallucinated_evidence
```

## 4. privacy_data_lifecycle_validation

```yaml
stage_id: privacy_data_lifecycle_validation
purpose: Veri minimizasyonu, saklama, silme, anonimleştirme, export, audit log ve tenant izolasyonu kontrollerini yapmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: privacy_agent
sub_agents: []
uses_core_abilities:
  - Memory
  - Coder
  - OS
uses_skills:
  - gap-audit
  - fmea
  - sentinel
uses_tools:
  - data_inventory_checker
  - retention_policy_checker
  - deletion_flow_checker
  - tenant_isolation_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - privacy_lifecycle_governance
  - data_retention_gate
  - tenant_isolation_gate
uses_audit_schemas:
  - privacy_evidence_schema
  - data_lifecycle_report_schema
  - tenant_isolation_report_schema
uses_model_provider_profiles:
  - privacy_analysis_model
uses_context_memory_profiles:
  - privacy_context_pack
inputs:
  - DATA_INVENTORY
  - PRIVACY_RISK_REGISTER
outputs:
  - DATA_LIFECYCLE_REPORT
  - RETENTION_POLICY_REPORT
  - TENANT_ISOLATION_REPORT
  - PRIVACY_GATE_RESULT
evidence:
  - DATA_LIFECYCLE_REPORT
  - TENANT_ISOLATION_REPORT
trace:
  - privacy_validation_trace
gates:
  - privacy_lifecycle_pass_if_applicable
  - tenant_isolation_pass_if_applicable
on_pass: api_contract_compatibility_validation
on_fail: security_privacy_design
rework_route: security_privacy_design
blocking_conditions:
  - unmitigated_personal_data_risk
  - tenant_isolation_gap
```

## 5. api_contract_compatibility_validation

```yaml
stage_id: api_contract_compatibility_validation
purpose: API, event, SDK veya public interface değişikliklerinde contract ve compatibility risklerini doğrulamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: contract_validation_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - Web
uses_skills:
  - gap-audit
  - verification-loop
  - adr-builder
uses_tools:
  - openapi_validator
  - asyncapi_validator
  - contract_test_runner
  - breaking_change_detector
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - api_contract_governance
  - breaking_change_gate
  - compatibility_gate
uses_audit_schemas:
  - api_contract_evidence_schema
  - compatibility_report_schema
uses_model_provider_profiles:
  - contract_analysis_model
uses_context_memory_profiles:
  - api_contract_context_pack
inputs:
  - API_CONTRACTS
  - CODE_CHANGESET_SUMMARY
outputs:
  - API_CONTRACT_REPORT
  - BREAKING_CHANGE_REPORT
  - CONTRACT_TEST_REPORT
  - COMPATIBILITY_GATE_RESULT
evidence:
  - API_CONTRACT_REPORT
  - CONTRACT_TEST_REPORT
trace:
  - contract_validation_trace
gates:
  - api_contract_compatibility_pass_if_applicable
  - no_unapproved_breaking_change
on_pass: data_migration_validation_if_applicable
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - unapproved_breaking_change
  - contract_test_failure
```

## 6. data_migration_validation_if_applicable

```yaml
stage_id: data_migration_validation_if_applicable
purpose: Veri modeli, migration, rollback, data integrity ve tenant isolation risklerini doğrulamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: data_migration_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - fmea
  - gap-audit
  - verification-loop
uses_tools:
  - migration_checker
  - schema_diff_checker
  - rollback_validator
  - data_integrity_checker
  - test_runner
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - data_migration_governance
  - rollback_required_gate
  - data_integrity_gate
uses_audit_schemas:
  - migration_evidence_schema
  - data_integrity_report_schema
  - rollback_validation_schema
uses_model_provider_profiles:
  - data_migration_analysis_model
uses_context_memory_profiles:
  - data_migration_context_pack
inputs:
  - DATA_MODEL_CHANGE_REPORT
  - MIGRATION_FILES
outputs:
  - MIGRATION_VALIDATION_REPORT
  - ROLLBACK_VALIDATION_REPORT
  - DATA_INTEGRITY_REPORT
evidence:
  - MIGRATION_VALIDATION_REPORT
  - ROLLBACK_VALIDATION_REPORT
trace:
  - migration_validation_trace
gates:
  - data_migration_pass_if_applicable
  - rollback_validation_pass_if_applicable
on_pass: accessibility_ux_validation_if_applicable
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - unsafe_migration
  - rollback_missing
  - data_integrity_failure
```

## 7. accessibility_ux_validation_if_applicable

```yaml
stage_id: accessibility_ux_validation_if_applicable
purpose: UI varsa erişilebilirlik, temel UX akışı, hata/boş durum ve kullanılabilirlik doğrulaması yapmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: ux_accessibility_agent
sub_agents: []
uses_core_abilities:
  - Vision
  - Coder
  - Memory
  - Web
uses_skills:
  - gap-audit
  - prompt-fidelity
uses_tools:
  - accessibility_auditor
  - ux_flow_checker
  - contrast_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - accessibility_governance
  - ux_validation_governance
  - ui_release_gate
uses_audit_schemas:
  - accessibility_evidence_schema
  - ux_validation_report_schema
uses_model_provider_profiles:
  - ux_accessibility_model
uses_context_memory_profiles:
  - ux_accessibility_context_pack
inputs:
  - UI_CHANGESET_SUMMARY
  - PRODUCT_BRIEF
outputs:
  - ACCESSIBILITY_REPORT
  - UX_VALIDATION_REPORT
  - UI_RELEASE_GATE_RESULT
evidence:
  - ACCESSIBILITY_REPORT
  - UX_VALIDATION_REPORT
trace:
  - accessibility_validation_trace
gates:
  - accessibility_pass_if_applicable
  - ux_validation_pass_if_applicable
on_pass: performance_resilience
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - accessibility_blocker
  - critical_ux_flow_failure
```

## 8. performance_resilience

```yaml
stage_id: performance_resilience
purpose: Latency, throughput, resource budget, capacity, failure behavior ve resiliency kontrollerini yapmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: performance_resilience_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - fmea
  - gap-audit
  - calibrate
uses_tools:
  - benchmark_runner
  - resource_budget_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - performance_governance
  - resilience_governance
uses_audit_schemas:
  - performance_evidence_schema
  - resilience_report_schema
uses_model_provider_profiles:
  - performance_analysis_model
uses_context_memory_profiles:
  - performance_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - NFR_CATALOG
outputs:
  - PERFORMANCE_REPORT
  - RESILIENCE_REPORT
evidence:
  - PERFORMANCE_REPORT
  - RESILIENCE_REPORT
trace:
  - performance_validation_trace
gates:
  - performance_resilience_pass_or_accepted
  - resilience_risks_accepted_or_mitigated
on_pass: cost_resource_governance
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - performance_budget_failure
  - unaccepted_resilience_risk
```

## 9. cost_resource_governance

```yaml
stage_id: cost_resource_governance
purpose: Token, model, GPU, CPU, RAM, storage, CI time, retry loop ve inference maliyetlerini kontrol etmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: cost_resource_agent
sub_agents: []
uses_core_abilities:
  - Supervisor
  - Coder
  - Memory
  - OS
uses_skills:
  - fermi-decompose
  - calibrate
  - gap-audit
uses_tools:
  - resource_budget_checker
  - cost_estimator
  - benchmark_runner
  - quota_policy_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - cost_resource_governance
  - resource_budget_gate
  - quota_governance
uses_audit_schemas:
  - cost_evidence_schema
  - resource_budget_report_schema
uses_model_provider_profiles:
  - cost_resource_analysis_model
uses_context_memory_profiles:
  - cost_resource_context_pack
inputs:
  - PERFORMANCE_REPORT
  - RESOURCE_USAGE_DATA
outputs:
  - COST_ESTIMATE_REPORT
  - RESOURCE_BUDGET_REPORT
  - QUOTA_POLICY_REPORT
  - RESOURCE_GATE_RESULT
evidence:
  - COST_ESTIMATE_REPORT
  - RESOURCE_BUDGET_REPORT
trace:
  - cost_resource_trace
gates:
  - cost_resource_governance_pass_if_applicable
on_pass: backup_restore_dr_validation_if_applicable
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - unbounded_cost_risk
  - resource_budget_failure
```

## 10. backup_restore_dr_validation_if_applicable

```yaml
stage_id: backup_restore_dr_validation_if_applicable
purpose: Production/persistent data varsa backup, restore, DR, rollback, RTO/RPO hazırlığını doğrulamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: operations_readiness_agent
sub_agents: []
uses_core_abilities:
  - OS
  - Memory
  - Coder
uses_skills:
  - sentinel
  - fmea
  - gap-audit
uses_tools:
  - backup_plan_checker
  - restore_test_runner
  - dr_runbook_checker
  - rollback_validator
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - backup_restore_governance
  - disaster_recovery_gate
  - rollback_required_gate
uses_audit_schemas:
  - backup_restore_evidence_schema
  - dr_validation_schema
  - rollback_validation_schema
uses_model_provider_profiles:
  - operations_analysis_model
uses_context_memory_profiles:
  - backup_restore_context_pack
inputs:
  - DATA_INTEGRITY_REPORT
  - RUNBOOK_DRAFT
  - ROLLBACK_PLAN_DRAFT
outputs:
  - BACKUP_PLAN
  - RESTORE_TEST_REPORT
  - DR_READINESS_REPORT
  - ROLLBACK_VALIDATION_REPORT
evidence:
  - RESTORE_TEST_REPORT
  - DR_READINESS_REPORT
trace:
  - backup_restore_validation_trace
gates:
  - backup_restore_dr_pass_if_applicable
  - rollback_validation_pass_if_applicable
on_pass: operations_readiness
on_fail: planning
rework_route: planning
blocking_conditions:
  - missing_restore_evidence
  - missing_rollback_validation
```
