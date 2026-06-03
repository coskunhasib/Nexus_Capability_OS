# 05 — Completion, Release and Learning Stage Contracts

Bu dosya SDLC Pipeline’ın operations readiness, evidence graph, development completion, release candidate ve learning aşamalarını tanımlar.

## 1. operations_readiness

```yaml
stage_id: operations_readiness
purpose: Runbook, rollback, observability, incident hazırlığı ve operasyonel kabul koşullarını tamamlamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: operations_readiness_agent
sub_agents: []
uses_core_abilities:
  - OS
  - Memory
  - Web
  - Coder
uses_skills:
  - gap-audit
  - sentinel
uses_tools:
  - runbook_checker
  - observability_plan_checker
  - rollback_validator
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - operations_readiness_governance
  - runbook_required_gate
  - observability_required_gate
uses_audit_schemas:
  - operations_readiness_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - operations_analysis_model
uses_context_memory_profiles:
  - operations_context_pack
inputs:
  - DR_READINESS_REPORT
  - ROLLBACK_VALIDATION_REPORT
  - PERFORMANCE_REPORT
outputs:
  - RUNBOOK
  - ROLLBACK_PLAN
  - OBSERVABILITY_PLAN
  - INCIDENT_RESPONSE_PLAN
evidence:
  - RUNBOOK
  - ROLLBACK_PLAN
  - OBSERVABILITY_PLAN
trace:
  - operations_readiness_trace
gates:
  - runbook_present
  - rollback_plan_present
  - observability_plan_present
  - incident_response_plan_present
on_pass: evidence_graph_build
on_fail: planning
rework_route: planning
blocking_conditions:
  - missing_runbook
  - missing_rollback_plan
  - missing_observability_plan
```

## 2. evidence_graph_build

```yaml
stage_id: evidence_graph_build
purpose: Requirement → design → code → test → gate → release candidate zincirini kurmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: evidence_graph_agent
sub_agents:
  - evidence_trace_sub_agent
uses_core_abilities:
  - Memory
  - OS
uses_skills:
  - evidence-graph-builder
  - gap-audit
uses_tools:
  - evidence_reader
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - evidence_graph_governance
  - traceability_required_gate
uses_audit_schemas:
  - evidence_graph_schema
  - traceability_matrix_schema
uses_model_provider_profiles:
  - evidence_graph_model
uses_context_memory_profiles:
  - evidence_graph_context_pack
inputs:
  - REQUIREMENTS_SPEC
  - ARCHITECTURE_DOC
  - CODE_CHANGESET_SUMMARY
  - TEST_EXECUTION_REPORT
  - BUG_FINDING_REPORT
  - SECURITY_SCAN_REPORT
  - RELEASE_EVIDENCE_INPUTS
outputs:
  - EVIDENCE_GRAPH
  - TRACEABILITY_MATRIX
evidence:
  - EVIDENCE_GRAPH
  - TRACEABILITY_MATRIX
trace:
  - evidence_graph_build_trace
gates:
  - evidence_graph_complete
  - no_orphan_critical_artifacts
  - traceability_matrix_complete
on_pass: development_completion
on_fail: relevant_failed_stage
rework_route: relevant_failed_stage
blocking_conditions:
  - missing_required_evidence
  - orphan_critical_artifact
  - broken_traceability
```

## 3. development_completion

```yaml
stage_id: development_completion
purpose: Geliştirmenin gerçekten tamamlanıp tamamlanmadığını required ve applicable conditional gates üzerinden belirlemek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: release_manager_agent
sub_agents: []
uses_core_abilities:
  - Supervisor
  - Memory
uses_skills:
  - release-readiness-judge
  - gap-audit
  - calibrate
uses_tools:
  - policy_query
  - evidence_reader
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - development_completion_governance
  - no_blocking_policy_failure_gate
uses_audit_schemas:
  - development_completion_evidence_schema
  - gate_decision_trace_schema
uses_model_provider_profiles:
  - release_reasoning_model
uses_context_memory_profiles:
  - development_completion_context_pack
inputs:
  - EVIDENCE_GRAPH
  - TRACEABILITY_MATRIX
  - ALL_STAGE_GATE_RESULTS
outputs:
  - DEVELOPMENT_COMPLETION_REPORT
  - DEVELOPMENT_COMPLETION_GATE_RESULT
evidence:
  - DEVELOPMENT_COMPLETION_REPORT
  - DEVELOPMENT_COMPLETION_GATE_RESULT
trace:
  - development_completion_trace
gates:
  - requirements_complete
  - nfr_coverage_complete
  - architecture_complete
  - security_privacy_design_complete
  - code_review_pass
  - tests_pass
  - verification_loop_bug_finding_pass
  - security_validation_pass
  - supply_chain_pass
  - agentic_safety_eval_pass
  - operations_readiness_pass
  - evidence_graph_complete
  - no_blocking_policy_failure
  - accessibility_pass_if_applicable
  - data_migration_pass_if_applicable
  - privacy_lifecycle_pass_if_applicable
  - api_contract_compatibility_pass_if_applicable
  - backup_restore_dr_pass_if_applicable
  - compliance_pass_if_applicable
  - cost_resource_governance_pass_if_applicable
on_pass: release_candidate
on_fail: relevant_failed_stage
rework_route: relevant_failed_stage
blocking_conditions:
  - any_required_gate_failed
  - missing_required_evidence
  - unresolved_blocker_finding
```

## 4. release_candidate

```yaml
stage_id: release_candidate
purpose: Development completion sonrası release candidate evidence paketini üretmek ve yayın/aktivasyon öncesi son SDLC kararını oluşturmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: release_manager_agent
sub_agents: []
uses_core_abilities:
  - Supervisor
  - Memory
uses_skills:
  - release-readiness-judge
  - prompt-fidelity
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_reader
  - evidence_writer
uses_governance_profiles:
  - release_candidate_governance
  - release_after_development_completion_gate
uses_audit_schemas:
  - release_evidence_schema
  - release_decision_trace_schema
uses_model_provider_profiles:
  - release_reasoning_model
uses_context_memory_profiles:
  - release_context_pack
inputs:
  - DEVELOPMENT_COMPLETION_REPORT
  - EVIDENCE_GRAPH
  - TRACEABILITY_MATRIX
outputs:
  - RELEASE_CANDIDATE_REPORT
  - RELEASE_EVIDENCE
evidence:
  - RELEASE_CANDIDATE_REPORT
  - RELEASE_EVIDENCE
trace:
  - release_candidate_trace
gates:
  - development_completion_pass
  - release_candidate_evidence_complete
  - no_blocking_policy_failure
on_pass: refraction_learning
on_fail: development_completion
rework_route: development_completion
blocking_conditions:
  - development_completion_not_passed
  - incomplete_release_evidence
```

## 5. refraction_learning

```yaml
stage_id: refraction_learning
purpose: Run’dan öğrenilenleri, hata örüntülerini, kararları, kalibrasyon notlarını ve gelecekteki iyileştirmeleri hafızaya almak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: memory_curator_agent
sub_agents: []
uses_core_abilities:
  - Memory
uses_skills:
  - refraction
  - bayesian-update
  - calibrate
uses_tools:
  - artifact_writer
  - evidence_writer
  - memory_write
uses_governance_profiles:
  - learning_governance
  - memory_update_governance
uses_audit_schemas:
  - learning_record_schema
  - memory_update_trace_schema
uses_model_provider_profiles:
  - learning_reflection_model
uses_context_memory_profiles:
  - learning_context_pack
inputs:
  - RELEASE_CANDIDATE_REPORT
  - DEVELOPMENT_COMPLETION_REPORT
  - REWORK_HISTORY
outputs:
  - LESSONS_LEARNED
  - MEMORY_UPDATE_PROPOSAL
  - FUTURE_IMPROVEMENT_BACKLOG
evidence:
  - LESSONS_LEARNED
  - MEMORY_UPDATE_PROPOSAL
trace:
  - learning_trace
  - memory_update_trace
gates:
  - learning_record_present
on_pass: done
on_fail: refraction_learning
rework_route: refraction_learning
blocking_conditions: []
optional_conditions:
  - learning_stage_is_not_release_blocker
```
