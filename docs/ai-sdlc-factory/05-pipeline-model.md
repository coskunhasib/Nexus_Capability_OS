# 05 — Pipeline Modeli

Bu doküman, Nexus AI SDLC Pipeline’ının nasıl tanımlanacağını açıklar.

Pipeline, agent’ların rastgele konuşma sırası değildir. Pipeline, deterministik bir stage graph’tır.

## 0. Durum ve reconciliation notu

> **Bu doküman erken nesil detaylı taslaktır.** Kanonik SDLC stage seti `06-sdlc-coverage-gap-audit.md`, `08-sdlc-pipeline-contract.md` ve `configs/nexus-ai/sdlc_pipeline.yaml` ile **31 stage**'e genişletilmiştir (buradaki 23 stage + gap-audit eklentileri; `skill_selection`, `skill_semantic_extraction` içine katlanmıştır).
>
> Bu dokümanın **korunması gereken benzersiz katkıları** makine-okunabilir config'lere taşınır:
> - **§5 Rework routing table** + **§6 Iteration policy** + **§7 Anti-patterns** → `configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`
> - Per-stage owner/gate/route detayı → `configs/nexus-ai/stages/sdlc/*.yaml` (07 stage-contract formatı + 7 kategorilik usage mapping ile)
>
> **Bildirilmemiş skill'ler** (`skill-architect`, `skill-router`, `steelman`, `handoff-designer`, `context-pack-builder`, `scanner-result-normalizer`, `evidence-graph-builder`, `release-readiness-judge`) shared registry formalization (doc 17 / `skills_registry.yaml`) sırasında kanonik karşılıklarına eşlenir ya da registry'ye eklenir.
>
> **Rol notu:** Review stage'leri (`requirements_review`, `architecture_review`) yazan agent'tan **farklı** bir owner'a (reviewer / `sdlc_team_lead` gate) verilir — no-self-approval kuralı. Team Lead yönetir, owner agent çalıştırır.

## 1. Pipeline ilkeleri

```text
Pipeline = stage graph + owner + input + skill + tool + output + gate + rework route + evidence
```

Temel ilkeler:

```text
Pipeline deterministic olmalıdır.
Team Lead pipeline’ı çalıştırır ama değiştirmez.
Policy gate Team Lead’den üstündür.
Her stage owner agent ile çalışır.
Team stage owner olamaz.
Fail eden stage doğru rework route’a döner.
Evidence üretmeyen stage tamamlanmış sayılmaz.
```

## 2. Stage contract

Her stage şu sözleşmeye sahip olmalıdır:

```yaml
id:
name:
purpose:
owner_agent:
sub_agents:
required_inputs:
optional_inputs:
skills:
tools:
outputs:
gates:
on_pass:
on_fail:
rework_route:
evidence_required:
policy_rules:
max_iterations:
```

## 3. Ana pipeline graph

Önerilen tam çekirdek pipeline:

```text
1. intake
2. domain_risk_profile
3. skill_semantic_extraction
4. skill_selection
5. requirements
6. requirements_review
7. architecture
8. architecture_review
9. security_privacy_design
10. premortem_fmea
11. planning
12. implementation
13. code_review
14. test_generation
15. test_execution
16. verification_loop_bug_finding
17. security_validation
18. performance_resilience
19. operations_readiness
20. evidence_graph_build
21. development_completion
22. release_candidate
23. refraction_learning
```

Publication / Nexus / deploy bu çekirdek pipeline’ın içinde değildir.

Doğru sonrası:

```text
release_candidate
  → optional_publication
  → optional_deployment
```

## 4. Stage detayları

### 4.1 intake

```yaml
id: intake
owner_agent: product_manager_agent
purpose: Ürün hedefini, kullanıcı problemini ve başlangıç kapsamını netleştirir.
skills:
  - prism
  - prompt-fidelity
tools:
  - artifact_writer
outputs:
  - PRODUCT_BRIEF.md
  - INITIAL_SCOPE.md
gates:
  - product_goal_present
  - scope_initially_bounded
on_pass: domain_risk_profile
on_fail: intake
```

### 4.2 domain_risk_profile

```yaml
id: domain_risk_profile
owner_agent: team_lead_orchestrator
purpose: Ürünün domain, risk, veri hassasiyeti, güvenlik ve regülasyon profilini belirler.
skills:
  - fermi-decompose
  - calibrate
tools:
  - artifact_writer
outputs:
  - DOMAIN_PROFILE_DECISION.json
  - RISK_PROFILE.md
gates:
  - domain_profile_selected
  - risk_profile_selected
on_pass: skill_semantic_extraction
on_fail: intake
```

### 4.3 skill_semantic_extraction

```yaml
id: skill_semantic_extraction
owner_agent: skill_librarian_agent
sub_agents:
  - skill_semantic_extractor_subagent
purpose: Kullanılacak skill paketlerinin anlamını, trigger’larını, misuse risklerini ve stage bağlarını çıkarır.
skills:
  - skill-architect
  - gap-audit
tools:
  - skill_package_reader
outputs:
  - SKILL_SEMANTIC_CATALOG.yaml
  - SKILL_SCRIPT_INVENTORY.yaml
  - SKILL_REFERENCE_INDEX.yaml
  - SKILL_MISUSE_WARNINGS.md
gates:
  - all_selected_skills_have_semantics
  - misuse_warnings_present
  - skill_scripts_inventory_present
on_pass: skill_selection
on_fail: skill_semantic_extraction
```

### 4.4 skill_selection

```yaml
id: skill_selection
owner_agent: skill_librarian_agent
purpose: Domain/risk profiline göre hangi skill’lerin hangi stage’de kullanılacağını seçer.
skills:
  - skill-router
  - gap-audit
tools:
  - artifact_writer
outputs:
  - SKILL_STAGE_BINDING_PROPOSAL.yaml
  - SKILL_AGENT_BINDING_MATRIX.md
gates:
  - prism_bound_as_divergence_skill
  - verification_loop_bound_as_bug_finding
  - no_skill_without_semantics
on_pass: requirements
on_fail: skill_semantic_extraction
```

### 4.5 requirements

```yaml
id: requirements
owner_agent: requirements_agent
purpose: Fonksiyonel gereksinim, NFR ve kabul kriterlerini üretir.
skills:
  - prism
  - prompt-fidelity
  - gap-audit
tools:
  - artifact_writer
outputs:
  - REQUIREMENTS_SPEC.md
  - NFR_CATALOG.md
  - ACCEPTANCE_CRITERIA.md
gates:
  - acceptance_criteria_present
  - nfr_catalog_present
  - requirements_traceable
on_pass: requirements_review
on_fail: intake
```

### 4.6 requirements_review

```yaml
id: requirements_review
owner_agent: team_lead_orchestrator
purpose: Requirements çıktısının kullanıcı niyeti ve kapsamla uyumunu denetler.
skills:
  - prompt-fidelity
  - gap-audit
tools:
  - evidence_reader
outputs:
  - REQUIREMENTS_REVIEW_REPORT.md
gates:
  - prompt_fidelity_pass
  - no_major_requirement_gap
on_pass: architecture
on_fail: requirements
```

### 4.7 architecture

```yaml
id: architecture
owner_agent: architecture_agent
sub_agents:
  - api_design_subagent
  - data_model_subagent
purpose: Mimari seçenekleri, sistem sınırları, API/veri/deployment yaklaşımını üretir.
skills:
  - prism
  - llm-council
  - adr-builder
  - sentinel
tools:
  - diagram_generator
  - artifact_writer
outputs:
  - ARCHITECTURE.md
  - SYSTEM_CONTEXT.mmd
  - ADR_INDEX.md
gates:
  - architecture_addresses_nfrs
  - adr_present_for_major_decisions
on_pass: architecture_review
on_fail: requirements
```

### 4.8 architecture_review

```yaml
id: architecture_review
owner_agent: architecture_agent
purpose: Mimari kararları güvenlik, performans, bakım ve domain uyumu açısından stres test eder.
skills:
  - llm-council
  - sentinel
  - steelman
tools:
  - artifact_writer
outputs:
  - ARCHITECTURE_REVIEW_REPORT.md
gates:
  - no_unresolved_architecture_risk
  - rejected_options_documented
on_pass: security_privacy_design
on_fail: architecture
```

### 4.9 security_privacy_design

```yaml
id: security_privacy_design
owner_agent: security_architect_agent
sub_agents:
  - threat_modeling_subagent
purpose: Threat model, privacy risk, abuse case ve security requirement üretir.
skills:
  - sentinel
  - fmea
  - gap-audit
tools:
  - artifact_writer
outputs:
  - THREAT_MODEL.md
  - SECURITY_REQUIREMENTS.md
  - PRIVACY_RISK_REGISTER.md
gates:
  - threat_model_present
  - privacy_risks_classified
  - authz_authn_strategy_present
on_pass: premortem_fmea
on_fail: architecture
```

### 4.10 premortem_fmea

```yaml
id: premortem_fmea
owner_agent: security_architect_agent
purpose: Failure mode, abuse case ve release öncesi riskleri yapılandırılmış şekilde inceler.
skills:
  - sentinel
  - prism
  - fmea
tools:
  - artifact_writer
outputs:
  - SENTINEL_PREMORTEM.md
  - FMEA_RISK_REGISTER.md
gates:
  - no_unaccepted_critical_risk
  - mitigation_owner_present
on_pass: planning
on_fail: architecture
```

### 4.11 planning

```yaml
id: planning
owner_agent: tech_lead_agent
purpose: Implementasyon planı, task breakdown ve execution work packages üretir.
skills:
  - handoff-designer
  - context-pack-builder
  - gap-audit
tools:
  - artifact_writer
outputs:
  - IMPLEMENTATION_PLAN.md
  - TASK_BREAKDOWN.md
  - EXECUTOR_WORKPACKAGES.md
gates:
  - tasks_trace_to_requirements
  - handoff_packets_complete
on_pass: implementation
on_fail: planning
```

### 4.12 implementation

```yaml
id: implementation
owner_agent: tech_lead_agent
purpose: Codex / Claude Code / Antigravity gibi executor’ların implementasyon çıktısını alır ve stage evidence’a bağlar.
skills:
  - context-pack-builder
  - gap-audit
tools:
  - repo_reader
  - repo_writer
  - test_runner
outputs:
  - CODE_CHANGESET_SUMMARY.md
  - IMPLEMENTATION_NOTES.md
gates:
  - code_changes_present
  - no_out_of_scope_changes
  - local_build_pass
on_pass: code_review
on_fail: implementation
```

### 4.13 code_review

```yaml
id: code_review
owner_agent: code_reviewer_agent
purpose: Kod değişikliklerini doğruluk, mimari uyum, güvenlik ve test edilebilirlik açısından inceler.
skills:
  - verification-loop
  - gap-audit
  - prompt-fidelity
tools:
  - repo_diff_reader
  - artifact_writer
outputs:
  - CODE_REVIEW_REPORT.md
gates:
  - no_critical_review_finding
  - tests_required_for_changed_behavior
on_pass: test_generation
on_fail: implementation
```

### 4.14 test_generation

```yaml
id: test_generation
owner_agent: qa_lead_agent
sub_agents:
  - test_generation_subagent
purpose: Gereksinim, değişiklik ve risklere göre test üretir veya test planlar.
skills:
  - verification-loop
  - gap-audit
tools:
  - test_writer
  - artifact_writer
outputs:
  - TEST_PLAN.md
  - GENERATED_TESTS_SUMMARY.md
gates:
  - critical_paths_have_tests
  - regression_scope_defined
on_pass: test_execution
on_fail: implementation
```

### 4.15 test_execution

```yaml
id: test_execution
owner_agent: qa_lead_agent
purpose: Unit, integration, contract, e2e veya domain testlerini çalıştırır.
skills:
  - gap-audit
tools:
  - test_runner
  - coverage_parser
outputs:
  - TEST_EXECUTION_REPORT.json
  - COVERAGE_REPORT.md
gates:
  - tests_pass
  - coverage_policy_pass
on_pass: verification_loop_bug_finding
on_fail: implementation
```

### 4.16 verification_loop_bug_finding

```yaml
id: verification_loop_bug_finding
owner_agent: qa_lead_agent
sub_agents:
  - bug_hunter_subagent
purpose: verification-loop skill’iyle bug/defect sweep yürütür.
skills:
  - verification-loop
tools:
  - repo_diff_reader
  - test_runner
  - defect_tracker
outputs:
  - BUG_FINDING_REPORT.json
  - BUG_FINDING_REPORT.md
gates:
  - open_blocker_bugs_zero
  - open_major_bugs_below_threshold
on_pass: security_validation
on_fail: implementation
```

### 4.17 security_validation

```yaml
id: security_validation
owner_agent: security_architect_agent
sub_agents:
  - security_scan_interpreter_subagent
purpose: Güvenlik scanner sonuçlarını, secret risklerini, dependency ve code risklerini değerlendirir.
skills:
  - scanner-result-normalizer
  - calibrate
  - gap-audit
tools:
  - scanner_runner
  - scanner_report_reader
outputs:
  - SECURITY_SCAN_REPORT.md
  - SECURITY_FINDINGS_NORMALIZED.json
gates:
  - no_critical_security_findings
  - no_high_security_findings_without_acceptance
  - no_secret_leak
on_pass: performance_resilience
on_fail: implementation
```

### 4.18 performance_resilience

```yaml
id: performance_resilience
owner_agent: tech_lead_agent
purpose: Performans, kaynak bütçesi, resiliency ve failure behavior kontrolü yapar.
skills:
  - fmea
  - gap-audit
tools:
  - benchmark_runner
  - artifact_writer
outputs:
  - PERFORMANCE_REPORT.md
  - RESILIENCE_REPORT.md
gates:
  - performance_budget_pass
  - resilience_risks_accepted_or_mitigated
on_pass: operations_readiness
on_fail: architecture
```

### 4.19 operations_readiness

```yaml
id: operations_readiness
owner_agent: sre_ops_agent
purpose: Runbook, rollback, observability, backup/restore ve incident hazırlığı üretir.
skills:
  - gap-audit
  - sentinel
tools:
  - artifact_writer
outputs:
  - RUNBOOK.md
  - ROLLBACK_PLAN.md
  - OBSERVABILITY_PLAN.md
gates:
  - runbook_present
  - rollback_plan_present
  - observability_plan_present
on_pass: evidence_graph_build
on_fail: planning
```

### 4.20 evidence_graph_build

```yaml
id: evidence_graph_build
owner_agent: release_manager_agent
sub_agents:
  - evidence_trace_subagent
purpose: Requirement → design → code → test → security → gate → release candidate zincirini kurar.
skills:
  - evidence-graph-builder
  - gap-audit
tools:
  - evidence_reader
  - artifact_writer
outputs:
  - EVIDENCE_GRAPH.json
  - TRACEABILITY_MATRIX.md
gates:
  - evidence_graph_complete
  - no_orphan_critical_artifacts
on_pass: development_completion
on_fail: relevant_failed_stage
```

### 4.21 development_completion

```yaml
id: development_completion
owner_agent: release_manager_agent
purpose: Geliştirmenin gerçekten tamamlanıp tamamlanmadığını gate setiyle belirler.
skills:
  - release-readiness-judge
  - gap-audit
tools:
  - policy_query
  - evidence_reader
outputs:
  - DEVELOPMENT_COMPLETION_REPORT.md
  - DEVELOPMENT_COMPLETION_REPORT.json
gates:
  - requirements_complete
  - architecture_complete
  - tests_pass
  - bug_finding_pass
  - security_validation_pass
  - operations_ready
  - evidence_graph_complete
on_pass: release_candidate
on_fail: relevant_failed_stage
```

### 4.22 release_candidate

```yaml
id: release_candidate
owner_agent: release_manager_agent
purpose: Development completion sonrası release candidate evidence paketini üretir.
skills:
  - release-readiness-judge
  - prompt-fidelity
tools:
  - artifact_writer
  - evidence_reader
outputs:
  - RELEASE_CANDIDATE_REPORT.md
  - RELEASE_EVIDENCE.md
gates:
  - release_candidate_evidence_complete
  - no_blocking_policy_failure
on_pass: refraction_learning
on_fail: development_completion
```

### 4.23 refraction_learning

```yaml
id: refraction_learning
owner_agent: memory_curator_agent
purpose: Bu run’dan öğrenilenleri, hataları, kararları ve kalibrasyon notlarını proje hafızasına işler.
skills:
  - refraction
  - bayesian-update
  - calibrate
tools:
  - artifact_writer
outputs:
  - LESSONS_LEARNED.md
  - MEMORY_UPDATE_PROPOSAL.md
gates:
  - learning_record_present
on_pass: done
on_fail: refraction_learning
```

## 5. Rework routing table

```yaml
requirement_gap: requirements
prompt_fidelity_failure: requirements
architecture_risk: architecture
unaddressed_nfr: architecture
security_design_gap: security_privacy_design
critical_fmea_risk: architecture
implementation_failure: implementation
code_review_failure: implementation
test_failure: implementation
bug_finding_failure: implementation
security_scan_failure: implementation
performance_failure: architecture
operations_readiness_failure: planning
evidence_gap: relevant_failed_stage
development_completion_failure: relevant_failed_stage
```

## 6. Iteration policy

```yaml
default_max_iterations_per_stage: 3
max_total_rework_cycles: 8
on_iteration_limit_exceeded:
  action: block_and_report
  output: REWORK_LIMIT_EXCEEDED.md
```

No-human sistemde sonsuz loop yasaktır.

## 7. Pipeline anti-patterns

Yasaklar:

```text
Pipeline’ı agent sohbeti gibi tasarlamak
Team’i stage owner yapmak
Plugin stage eklemek
Nexus/deploy’u development completion öncesi stage yapmak
Verification-loop’u test_execution yerine kullanmak
Skill semantic extraction olmadan skill binding yapmak
Policy gate olmadan release candidate üretmek
```

## 8. Açık tartışma

Tartışılacak noktalar:

```text
Stage sayısı 23 olarak mı kalmalı, yoksa requirements_review ve architecture_review gibi review stage’leri owner stage içine mi gömülmeli?
Memory Curator Agent tam çekirdekte kalmalı mı?
Performance stage her domain’de zorunlu mu, yoksa risk profiline göre mi mandatory olmalı?
```
