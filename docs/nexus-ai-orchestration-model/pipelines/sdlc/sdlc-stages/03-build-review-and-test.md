# 03 — Build, Review and Test Stage Contracts

Bu dosya SDLC Pipeline’ın implementasyon, review, test ve bug finding aşamalarını tanımlar.

## 1. implementation

```yaml
stage_id: implementation
purpose: Planlanan kapsam dahilinde kod/artifact üretmek ve temel local doğrulamaları yapmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: engineering_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - context-pack-builder
  - gap-audit
uses_tools:
  - repo_reader
  - repo_writer
  - test_runner
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - implementation_governance
  - no_out_of_scope_change_gate
uses_audit_schemas:
  - implementation_evidence_schema
  - code_change_trace_schema
uses_model_provider_profiles:
  - coder_engineering_model
uses_context_memory_profiles:
  - implementation_context_pack
inputs:
  - IMPLEMENTATION_PLAN
  - HANDOFF_PACKETS
  - TASK_BREAKDOWN
outputs:
  - CODE_CHANGESET_SUMMARY
  - IMPLEMENTATION_NOTES
  - LOCAL_BUILD_RESULT
evidence:
  - CODE_CHANGESET_SUMMARY
  - LOCAL_BUILD_RESULT
trace:
  - code_change_trace
  - implementation_agent_trace
gates:
  - code_changes_present
  - no_out_of_scope_changes
  - local_build_pass
on_pass: code_review
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - out_of_scope_change
  - local_build_failure
```

## 2. code_review

```yaml
stage_id: code_review
purpose: Kod değişikliklerini doğruluk, mimari uyum, güvenlik, bakım ve test edilebilirlik açısından incelemek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: code_reviewer_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - Memory
  - OS
uses_skills:
  - verification-loop
  - gap-audit
  - prompt-fidelity
uses_tools:
  - repo_diff_reader
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - code_review_governance
  - no_self_approval_policy
uses_audit_schemas:
  - code_review_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - code_review_model
uses_context_memory_profiles:
  - code_review_context_pack
inputs:
  - CODE_CHANGESET_SUMMARY
  - REQUIREMENTS_SPEC
  - ARCHITECTURE_DOC
outputs:
  - CODE_REVIEW_REPORT
evidence:
  - CODE_REVIEW_REPORT
trace:
  - code_review_trace
gates:
  - no_critical_review_finding
  - tests_required_for_changed_behavior
  - architecture_violation_absent
on_pass: test_generation
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - critical_review_finding
  - missing_required_tests
  - architecture_violation
```

## 3. test_generation

```yaml
stage_id: test_generation
purpose: Gereksinim, risk, kod değişikliği ve bug history’ye göre test kapsamını üretmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: qa_agent
sub_agents:
  - test_generation_sub_agent
uses_core_abilities:
  - Coder
  - Memory
uses_skills:
  - verification-loop
  - gap-audit
uses_tools:
  - test_writer
  - coverage_parser
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - test_generation_governance
  - regression_scope_gate
uses_audit_schemas:
  - test_plan_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - test_generation_model
uses_context_memory_profiles:
  - test_generation_context_pack
inputs:
  - REQUIREMENTS_SPEC
  - CODE_CHANGESET_SUMMARY
  - CODE_REVIEW_REPORT
outputs:
  - TEST_PLAN
  - GENERATED_TESTS_SUMMARY
evidence:
  - TEST_PLAN
  - GENERATED_TESTS_SUMMARY
trace:
  - test_generation_trace
gates:
  - critical_paths_have_tests
  - regression_scope_defined
  - changed_behavior_has_tests
on_pass: test_execution
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - missing_critical_path_tests
  - undefined_regression_scope
```

## 4. test_execution

```yaml
stage_id: test_execution
purpose: Unit, integration, contract, e2e veya domain testlerini çalıştırmak ve sonuçları kanıtlamak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: qa_agent
sub_agents: []
uses_core_abilities:
  - Coder
  - OS
  - Memory
uses_skills:
  - gap-audit
uses_tools:
  - test_runner
  - coverage_parser
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - test_execution_governance
  - coverage_policy_gate
uses_audit_schemas:
  - test_execution_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - test_analysis_model
uses_context_memory_profiles:
  - test_execution_context_pack
inputs:
  - TEST_PLAN
  - GENERATED_TESTS_SUMMARY
  - CODE_CHANGESET_SUMMARY
outputs:
  - TEST_EXECUTION_REPORT
  - COVERAGE_REPORT
evidence:
  - TEST_EXECUTION_REPORT
  - COVERAGE_REPORT
trace:
  - test_runner_trace
  - coverage_parser_trace
gates:
  - tests_pass
  - coverage_policy_pass
  - flaky_tests_handled
on_pass: verification_loop_bug_finding
on_fail: implementation
rework_route: implementation
blocking_conditions:
  - test_failure
  - coverage_policy_failure
```

## 5. verification_loop_bug_finding

```yaml
stage_id: verification_loop_bug_finding
purpose: verification-loop skill’iyle bug/defect sweep yürütmek.
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
  - BUG_FINDING_GATE_RESULT
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
  - open_blocker_bug_count_greater_than_zero
  - open_major_bug_count_above_threshold
```
