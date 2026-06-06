# 02 — Design, Risk and Planning Stage Contracts

Bu dosya SDLC Pipeline’ın mimari, güvenlik/risk ve planlama aşamalarını tanımlar.

## 1. architecture

```yaml
stage_id: architecture
purpose: Sistem sınırları, mimari seçenekler, API/veri/deployment yaklaşımı ve ana teknik kararları üretmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: architecture_agent
sub_agents:
  - api_design_sub_agent
  - data_model_sub_agent
uses_core_abilities:
  - Coder
  - Memory
  - Web
uses_skills:
  - prism
  - llm-council
  - adr-builder
  - gap-audit
uses_tools:
  - diagram_generator
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - architecture_governance
  - adr_required_gate
uses_audit_schemas:
  - architecture_evidence_schema
  - decision_trace_schema
uses_model_provider_profiles:
  - architecture_reasoning_model
uses_context_memory_profiles:
  - architecture_context_pack
inputs:
  - REQUIREMENTS_SPEC
  - NFR_CATALOG
  - DOMAIN_PROFILE_DECISION
outputs:
  - ARCHITECTURE_DOC
  - SYSTEM_CONTEXT_DIAGRAM
  - ADR_INDEX
evidence:
  - ARCHITECTURE_DOC
  - ADR_INDEX
trace:
  - architecture_agent_trace
gates:
  - architecture_addresses_nfrs
  - adr_present_for_major_decisions
  - system_boundaries_defined
on_pass: architecture_review
on_fail: requirements
rework_route: requirements
blocking_conditions:
  - unaddressed_nfr
  - missing_critical_adr
```

## 2. architecture_review

```yaml
stage_id: architecture_review
purpose: Mimariyi trade-off, güvenlik, performans, bakım ve domain uyumu açısından stres test etmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: architecture_reviewer_agent
sub_agents: []
uses_core_abilities:
  - Memory
  - Web
uses_skills:
  - llm-council
  - sentinel
  - steelman
  - calibrate
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - architecture_review_governance
  - architecture_risk_gate
uses_audit_schemas:
  - architecture_review_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - architecture_review_model
uses_context_memory_profiles:
  - architecture_review_context_pack
inputs:
  - ARCHITECTURE_DOC
  - ADR_INDEX
  - NFR_CATALOG
outputs:
  - ARCHITECTURE_REVIEW_REPORT
evidence:
  - ARCHITECTURE_REVIEW_REPORT
trace:
  - architecture_review_trace
gates:
  - no_unresolved_architecture_risk
  - rejected_options_documented
  - architecture_review_pass
on_pass: security_privacy_design
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - unresolved_architecture_risk
  - missing_tradeoff_rationale
```

## 3. security_privacy_design

```yaml
stage_id: security_privacy_design
purpose: Threat model, privacy risk, data lifecycle, auth/authz, abuse case ve security requirements üretmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: security_privacy_agent
sub_agents:
  - threat_modeling_sub_agent
uses_core_abilities:
  - Memory
  - Web
  - Coder
uses_skills:
  - sentinel
  - fmea
  - gap-audit
uses_tools:
  - data_inventory_checker
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - security_privacy_governance
  - threat_model_required_gate
  - privacy_lifecycle_governance
uses_audit_schemas:
  - threat_model_evidence_schema
  - privacy_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - security_reasoning_model
uses_context_memory_profiles:
  - security_privacy_context_pack
inputs:
  - ARCHITECTURE_DOC
  - REQUIREMENTS_SPEC
  - DOMAIN_PROFILE_DECISION
outputs:
  - THREAT_MODEL
  - SECURITY_REQUIREMENTS
  - DATA_INVENTORY
  - PRIVACY_RISK_REGISTER
evidence:
  - THREAT_MODEL
  - DATA_INVENTORY
  - PRIVACY_RISK_REGISTER
trace:
  - security_privacy_trace
gates:
  - threat_model_present
  - privacy_risks_classified
  - authz_authn_strategy_present
  - data_lifecycle_visible
on_pass: premortem_fmea
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - missing_threat_model
  - unclassified_privacy_risk
  - missing_auth_strategy
```

## 4. premortem_fmea

```yaml
stage_id: premortem_fmea
purpose: Failure mode, abuse case, edge cases ve release öncesi riskleri yapılandırılmış şekilde incelemek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: risk_agent
sub_agents: []
uses_core_abilities:
  - Memory
uses_skills:
  - sentinel
  - prism
  - fmea
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - risk_review_governance
  - fmea_required_gate
uses_audit_schemas:
  - risk_register_schema
  - premortem_evidence_schema
uses_model_provider_profiles:
  - risk_reasoning_model
uses_context_memory_profiles:
  - risk_context_pack
inputs:
  - ARCHITECTURE_DOC
  - THREAT_MODEL
  - PRIVACY_RISK_REGISTER
outputs:
  - SENTINEL_PREMORTEM
  - FMEA_RISK_REGISTER
evidence:
  - SENTINEL_PREMORTEM
  - FMEA_RISK_REGISTER
trace:
  - premortem_fmea_trace
gates:
  - no_unaccepted_critical_risk
  - mitigation_owner_present
  - risk_register_reviewed
on_pass: planning
on_fail: architecture
rework_route: architecture
blocking_conditions:
  - unaccepted_critical_risk
  - missing_mitigation_owner
```

## 5. planning

```yaml
stage_id: planning
purpose: Implementasyon planı, task breakdown, handoff paketleri ve executor work package taslaklarını üretmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: planning_agent
sub_agents: []
uses_core_abilities:
  - Supervisor
  - Memory
  - Coder
uses_skills:
  - handoff-designer
  - context-pack-builder
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - planning_governance
  - handoff_completeness_gate
uses_audit_schemas:
  - planning_evidence_schema
  - handoff_trace_schema
uses_model_provider_profiles:
  - planning_reasoning_model
uses_context_memory_profiles:
  - planning_context_pack
inputs:
  - REQUIREMENTS_SPEC
  - ARCHITECTURE_DOC
  - THREAT_MODEL
  - FMEA_RISK_REGISTER
outputs:
  - IMPLEMENTATION_PLAN
  - TASK_BREAKDOWN
  - HANDOFF_PACKETS
  - EXECUTOR_WORKPACKAGE_DRAFTS
evidence:
  - IMPLEMENTATION_PLAN
  - TASK_BREAKDOWN
  - HANDOFF_PACKETS
trace:
  - planning_agent_trace
gates:
  - tasks_trace_to_requirements
  - handoff_packets_complete
  - implementation_scope_bounded
on_pass: implementation
on_fail: planning
rework_route: planning
blocking_conditions:
  - untraceable_task
  - missing_handoff_packet
  - unbounded_implementation_scope
```
