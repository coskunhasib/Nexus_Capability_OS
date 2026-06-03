# 01 — Foundation and Requirements Stage Contracts

Bu dosya SDLC Pipeline’ın temel hazırlık ve gereksinim aşamalarını tanımlar.

## 1. intake

```yaml
stage_id: intake
purpose: Ürün hedefi, problem tanımı, kapsam ve başarı metriklerini netleştirmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: product_requirements_agent
sub_agents: []
uses_core_abilities:
  - Memory
  - Web
uses_skills:
  - prism
  - prompt-fidelity
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - intake_governance
  - prompt_fidelity_governance
uses_audit_schemas:
  - intake_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - sdlc_reasoning_profile
uses_context_memory_profiles:
  - intake_context_pack
inputs:
  - USER_GOAL
outputs:
  - PRODUCT_BRIEF
  - INITIAL_SCOPE
  - SUCCESS_METRICS
evidence:
  - PRODUCT_BRIEF
  - INITIAL_SCOPE
trace:
  - intake_agent_trace
gates:
  - product_goal_present
  - initial_scope_bounded
  - success_metrics_present
on_pass: domain_risk_profile
on_fail: intake
rework_route: intake
blocking_conditions:
  - missing_product_goal
  - unbounded_scope
```

## 2. domain_risk_profile

```yaml
stage_id: domain_risk_profile
purpose: Ürünün domain, veri hassasiyeti, güvenlik, regülasyon, availability, performance ve autonomy risk profilini belirlemek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: domain_risk_agent
sub_agents: []
uses_core_abilities:
  - Memory
  - Web
uses_skills:
  - fermi-decompose
  - calibrate
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - domain_risk_governance
uses_audit_schemas:
  - domain_risk_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - sdlc_reasoning_profile
uses_context_memory_profiles:
  - domain_risk_context_pack
inputs:
  - PRODUCT_BRIEF
  - INITIAL_SCOPE
outputs:
  - DOMAIN_PROFILE_DECISION
  - RISK_PROFILE
evidence:
  - DOMAIN_PROFILE_DECISION
  - RISK_PROFILE
trace:
  - domain_risk_agent_trace
gates:
  - domain_profile_selected
  - risk_profile_selected
  - conditional_gate_flags_initialized
on_pass: skill_semantic_extraction
on_fail: intake
rework_route: intake
blocking_conditions:
  - unknown_domain
  - unresolved_risk_class
```

## 3. skill_semantic_extraction

```yaml
stage_id: skill_semantic_extraction
purpose: Kullanılacak skill paketlerinin amaç, kategori, trigger, misuse warning ve stage binding bilgilerini çıkarmak.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: skill_librarian_agent
sub_agents:
  - skill_semantic_extractor_sub_agent
uses_core_abilities:
  - Memory
  - OS
uses_skills:
  - skill-architect
  - gap-audit
uses_tools:
  - skill_package_reader
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - skill_governance
  - skill_semantic_extraction_gate
uses_audit_schemas:
  - skill_semantic_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - sdlc_reasoning_profile
uses_context_memory_profiles:
  - skill_semantic_context_pack
inputs:
  - DOMAIN_PROFILE_DECISION
  - SKILL_PACKAGES
outputs:
  - SKILL_SEMANTIC_CATALOG
  - SKILL_MISUSE_WARNINGS
  - SKILL_STAGE_BINDING_PROPOSAL
evidence:
  - SKILL_SEMANTIC_CATALOG
  - SKILL_MISUSE_WARNINGS
trace:
  - skill_extraction_trace
gates:
  - all_selected_skills_have_semantics
  - misuse_warnings_present
  - prism_bound_as_divergence
  - verification_loop_bound_as_bug_finding
on_pass: requirements
on_fail: skill_semantic_extraction
rework_route: skill_semantic_extraction
blocking_conditions:
  - unknown_skill_semantics
  - missing_misuse_warning
```

## 4. requirements

```yaml
stage_id: requirements
purpose: Fonksiyonel gereksinimleri, NFR katalogunu, acceptance criteria ve trace başlangıcını üretmek.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: requirements_agent
sub_agents: []
uses_core_abilities:
  - Memory
  - Web
uses_skills:
  - prism
  - prompt-fidelity
  - gap-audit
uses_tools:
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - requirements_governance
  - acceptance_criteria_gate
uses_audit_schemas:
  - requirements_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - sdlc_reasoning_profile
uses_context_memory_profiles:
  - requirements_context_pack
inputs:
  - PRODUCT_BRIEF
  - DOMAIN_PROFILE_DECISION
  - SKILL_SEMANTIC_CATALOG
outputs:
  - REQUIREMENTS_SPEC
  - NFR_CATALOG
  - ACCEPTANCE_CRITERIA
  - REQUIREMENTS_TRACE_START
evidence:
  - REQUIREMENTS_SPEC
  - NFR_CATALOG
  - ACCEPTANCE_CRITERIA
trace:
  - requirements_agent_trace
gates:
  - requirements_present
  - nfr_catalog_present
  - acceptance_criteria_present
  - requirements_traceable
on_pass: requirements_review
on_fail: requirements
rework_route: requirements
blocking_conditions:
  - missing_acceptance_criteria
  - unresolved_requirement_ambiguity
```

## 5. requirements_review

```yaml
stage_id: requirements_review
purpose: Gereksinimlerin kullanıcı niyeti, kapsam, NFR, acceptance criteria ve traceability açısından doğrulanması.
owner_team: sdlc_team
team_lead: sdlc_team_lead
owner_agent: requirements_reviewer_agent
sub_agents: []
uses_core_abilities:
  - Memory
uses_skills:
  - prompt-fidelity
  - gap-audit
  - calibrate
uses_tools:
  - evidence_reader
  - artifact_writer
  - evidence_writer
uses_governance_profiles:
  - requirements_review_governance
  - prompt_fidelity_gate
uses_audit_schemas:
  - requirements_review_evidence_schema
  - stage_gate_trace_schema
uses_model_provider_profiles:
  - sdlc_reasoning_profile
uses_context_memory_profiles:
  - requirements_review_context_pack
inputs:
  - REQUIREMENTS_SPEC
  - NFR_CATALOG
  - ACCEPTANCE_CRITERIA
outputs:
  - REQUIREMENTS_REVIEW_REPORT
evidence:
  - REQUIREMENTS_REVIEW_REPORT
trace:
  - requirements_review_trace
gates:
  - prompt_fidelity_pass
  - no_major_requirement_gap
  - acceptance_criteria_reviewed
on_pass: architecture
on_fail: requirements
rework_route: requirements
blocking_conditions:
  - prompt_fidelity_failure
  - major_requirement_gap
```
