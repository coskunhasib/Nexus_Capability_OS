# 04 — Team / Agent / Sub-agent Modeli

Bu doküman, AI SDLC Factory içinde takım, agent, sub-agent ve Team Lead ilişkisini tam kapsamlı ama tekrarsız şekilde tanımlar.

## 1. Tasarım hedefi

Hedef şudur:

```text
Tek global orkestrasyon
+ pasif team boundary
+ aktif agent rolleri
+ sınırlı ve gerekçeli sub-agent kullanımı
```

Bu modelde hiçbir yapı diğerinin işini tekrar etmez.

## 2. Üst seviye organizasyon

```text
AI SDLC Factory
│
├── Team Lead / Orchestrator
│
├── Product & Requirements Team
├── Architecture Team
├── Security & Risk Team
├── Engineering Team
├── Review & Verification Team
├── Release & Operations Team
└── Skill Governance Team
```

## 3. Team Lead / Orchestrator

### Tanım

Team Lead, bütün pipeline akışını yöneten tek global orkestratördür.

### Sorumlulukları

```text
user/product goal almak
domain ve risk profilini seçmek
pipeline graph’ı başlatmak
stage owner agent atamak
handoff packet üretmek
skill aktivasyonunu koordine etmek
policy/evidence durumunu kontrol etmek
fail durumunda rework route seçmek
executor work package üretmek
final review checklist hazırlamak
```

### Yasakları

```text
kod yazamaz
kendi kararını onaylayamaz
policy gate bypass edemez
production/deploy/destructive tool kullanamaz
secret okuyamaz
reviewer yerine geçemez
```

### Contract

```yaml
id: team_lead_orchestrator
type: team_lead
team: orchestration
mission: AI SDLC Factory pipeline’ını uçtan uca orkestre eder.
may:
  - choose_pipeline
  - assign_stage_owner
  - create_handoff_packet
  - request_rework
  - query_policy
  - inspect_evidence
  - produce_executor_workpackage
must_not:
  - implement_code
  - approve_own_decision
  - bypass_blocking_gate
  - read_secret
  - deploy_production
outputs:
  - PIPELINE_RUN_PLAN.md
  - HANDOFF_PACKET.json
  - REWORK_DECISION.json
  - EXECUTOR_WORKPACKAGE.md
```

## 4. Teams

Team aktif çalışan nesne değildir. Team, ownership ve policy boundary’dir.

### 4.1 Product & Requirements Team

```yaml
id: product_requirements_team
purpose: Ürün hedefi, kullanıcı ihtiyacı, gereksinim, NFR ve kabul kriterlerini yönetir.
agents:
  - product_manager_agent
  - requirements_agent
owns_stages:
  - intake
  - domain_risk_profile
  - requirements
  - requirements_review
blocks:
  - missing_acceptance_criteria
  - unresolved_requirement_ambiguity
  - prompt_fidelity_failure
```

### 4.2 Architecture Team

```yaml
id: architecture_team
purpose: Sistem mimarisi, mimari kararlar, veri/API/deployment tasarımını yönetir.
agents:
  - architecture_agent
  - api_design_subagent
  - data_model_subagent
owns_stages:
  - architecture
  - architecture_review
  - adr_builder
blocks:
  - missing_adr
  - unaddressed_nfr
  - unsafe_architecture_decision
```

### 4.3 Security & Risk Team

```yaml
id: security_risk_team
purpose: Güvenlik, gizlilik, tehdit modeli, premortem ve risk analizini yönetir.
agents:
  - security_architect_agent
  - threat_modeling_subagent
  - security_scan_interpreter_subagent
owns_stages:
  - security_privacy_design
  - premortem_fmea
  - security_validation
blocks:
  - critical_security_finding
  - missing_threat_model
  - unaccepted_privacy_risk
```

### 4.4 Engineering Team

```yaml
id: engineering_team
purpose: Ürün kodu, test edilebilir tasarım, migration ve teknik implementasyonu yönetir.
agents:
  - tech_lead_agent
  - backend_dev_agent
  - frontend_dev_agent
  - db_dev_agent
  - ml_ai_dev_agent
owns_stages:
  - planning
  - implementation
blocks:
  - unbuildable_code
  - unsafe_migration
  - implementation_out_of_scope
```

### 4.5 Review & Verification Team

```yaml
id: review_verification_team
purpose: Kod review, test üretimi, test çalıştırma, verification-loop ve defect sweep’i yönetir.
agents:
  - code_reviewer_agent
  - qa_lead_agent
  - test_generation_subagent
  - bug_hunter_subagent
owns_stages:
  - code_review
  - test_generation
  - test_execution
  - verification_loop_bug_finding
blocks:
  - failed_tests
  - open_blocker_bug
  - major_regression_risk
```

### 4.6 Release & Operations Team

```yaml
id: release_operations_team
purpose: Development completion, release candidate, operations readiness ve post-release hazırlığı yönetir.
agents:
  - release_manager_agent
  - sre_ops_agent
owns_stages:
  - operations_readiness
  - development_completion
  - release_candidate
blocks:
  - missing_runbook
  - missing_rollback_plan
  - incomplete_release_evidence
```

### 4.7 Skill Governance Team

```yaml
id: skill_governance_team
purpose: Skill paketlerini okur, semantik çıkarır, script risklerini değerlendirir ve skill-stage binding’i yönetir.
agents:
  - skill_librarian_agent
  - skill_semantic_extractor_subagent
  - skill_runtime_safety_agent
owns_stages:
  - skill_semantic_extraction
  - skill_selection
  - skill_runtime_validation
blocks:
  - unknown_skill_semantics
  - unsafe_skill_script
  - missing_skill_inventory
```

## 5. Agent kataloğu

### 5.1 Product Manager Agent

```yaml
id: product_manager_agent
team: product_requirements_team
mission: Ürün hedefini, problem tanımını, kullanıcı segmentlerini ve başarı metriklerini çıkarır.
skills:
  - prism
  - prompt-fidelity
tools:
  - artifact_writer
  - evidence_writer
outputs:
  - PRODUCT_BRIEF.md
  - SUCCESS_METRICS.md
reviewed_by:
  - requirements_agent
  - team_lead_orchestrator
forbidden:
  - implementation
  - release_approval
```

### 5.2 Requirements Agent

```yaml
id: requirements_agent
team: product_requirements_team
mission: Fonksiyonel gereksinim, NFR, acceptance criteria ve trace başlangıcını üretir.
skills:
  - prism
  - prompt-fidelity
  - gap-audit
tools:
  - artifact_writer
  - evidence_writer
outputs:
  - REQUIREMENTS_SPEC.md
  - NFR_CATALOG.md
  - ACCEPTANCE_CRITERIA.md
blocks:
  - missing_acceptance_criteria
  - ambiguous_requirements
```

### 5.3 Architecture Agent

```yaml
id: architecture_agent
team: architecture_team
mission: Gereksinimlere uygun mimariyi, trade-off’ları ve ADR kayıtlarını üretir.
skills:
  - prism
  - llm-council
  - sentinel
  - adr-builder
tools:
  - diagram_generator
  - artifact_writer
outputs:
  - ARCHITECTURE.md
  - ADR_INDEX.md
  - SYSTEM_CONTEXT.mmd
reviewed_by:
  - security_architect_agent
  - tech_lead_agent
```

### 5.4 Security Architect Agent

```yaml
id: security_architect_agent
team: security_risk_team
mission: Threat model, security requirements, privacy risk ve abuse case çıkarır.
skills:
  - sentinel
  - fmea
  - llm-council
  - gap-audit
tools:
  - artifact_writer
  - evidence_writer
outputs:
  - THREAT_MODEL.md
  - SECURITY_REQUIREMENTS.md
  - PRIVACY_RISK_REGISTER.md
blocks:
  - missing_threat_model
  - critical_unmitigated_risk
```

### 5.5 Tech Lead Agent

```yaml
id: tech_lead_agent
team: engineering_team
mission: Teknik planı, görev bölüşümünü, implementasyon sınırlarını ve teknik riskleri yönetir.
skills:
  - gap-audit
  - llm-council
tools:
  - repo_reader
  - artifact_writer
outputs:
  - IMPLEMENTATION_PLAN.md
  - TASK_BREAKDOWN.md
reviewed_by:
  - architecture_agent
  - security_architect_agent
```

### 5.6 Developer Agents

```yaml
ids:
  - backend_dev_agent
  - frontend_dev_agent
  - db_dev_agent
  - ml_ai_dev_agent
team: engineering_team
mission: Kendi alanındaki kodu ve alan testlerini üretir.
skills:
  - context-pack-builder
  - gap-audit
tools:
  - repo_reader
  - repo_writer
  - test_runner
outputs:
  - code_changes
  - local_tests
  - implementation_notes
forbidden:
  - approve_own_work
  - bypass_code_review
  - production_deploy
```

### 5.7 Code Reviewer Agent

```yaml
id: code_reviewer_agent
team: review_verification_team
mission: Kod değişikliklerini doğruluk, bakım, güvenlik, test ve mimari uyum açısından inceler.
skills:
  - verification-loop
  - gap-audit
  - prompt-fidelity
tools:
  - repo_diff_reader
  - artifact_writer
outputs:
  - CODE_REVIEW_REPORT.md
blocks:
  - unsafe_code_change
  - missing_tests
  - architecture_violation
forbidden:
  - mutate_reviewed_code
```

### 5.8 QA Lead Agent

```yaml
id: qa_lead_agent
team: review_verification_team
mission: Test stratejisi, test kapsamı, bug finding ve verification kararlarını yönetir.
skills:
  - verification-loop
  - gap-audit
tools:
  - test_runner
  - coverage_parser
outputs:
  - TEST_STRATEGY.md
  - TEST_EXECUTION_REPORT.json
  - BUG_FINDING_REPORT.md
blocks:
  - failed_tests
  - open_blocker_bug
```

### 5.9 Release Manager Agent

```yaml
id: release_manager_agent
team: release_operations_team
mission: Development completion ve release candidate evidence paketini yönetir.
skills:
  - release-readiness-judge
  - gap-audit
  - prompt-fidelity
tools:
  - evidence_reader
  - policy_query
  - artifact_writer
outputs:
  - DEVELOPMENT_COMPLETION_REPORT.md
  - RELEASE_CANDIDATE_REPORT.md
blocks:
  - incomplete_evidence
  - failed_blocking_gate
```

### 5.10 Skill Librarian Agent

```yaml
id: skill_librarian_agent
team: skill_governance_team
mission: Skill paketlerini envanterler, canonical source seçer ve semantic extraction sürecini yönetir.
skills:
  - skill-architect
  - gap-audit
tools:
  - skill_package_reader
  - artifact_writer
outputs:
  - SKILL_INVENTORY.md
  - SKILL_SEMANTIC_CATALOG.yaml
blocks:
  - unknown_skill_purpose
  - unsafe_skill_package
```

## 6. Sub-agent kataloğu

### 6.1 Skill Semantic Extractor Sub-agent

```yaml
id: skill_semantic_extractor_subagent
parent_agent: skill_librarian_agent
mission: Her skill’in primary purpose, category, trigger, not_for ve misuse warning alanlarını çıkarır.
skills:
  - skill-architect
tools:
  - skill_package_reader
outputs:
  - SKILL_SEMANTIC_EXTRACT.json
returns_to:
  - skill_librarian_agent
```

### 6.2 Bug Hunter Sub-agent

```yaml
id: bug_hunter_subagent
parent_agent: qa_lead_agent
mission: verification-loop ile bug/defect sweep yürütür.
skills:
  - verification-loop
tools:
  - repo_diff_reader
  - test_runner
  - defect_tracker
outputs:
  - BUG_FINDING_REPORT.json
  - BUG_FINDING_REPORT.md
blocks_release_when:
  - open_blocker_bug_count > 0
```

### 6.3 Threat Modeling Sub-agent

```yaml
id: threat_modeling_subagent
parent_agent: security_architect_agent
mission: Abuse case, trust boundary, data flow ve threat model çıkarır.
skills:
  - sentinel
  - fmea
tools:
  - artifact_writer
outputs:
  - THREAT_MODEL.md
  - ABUSE_CASES.md
```

### 6.4 API Design Sub-agent

```yaml
id: api_design_subagent
parent_agent: architecture_agent
mission: API boundary, contract, versioning ve error model önerir.
skills:
  - prism
  - adr-builder
tools:
  - openapi_validator
  - artifact_writer
outputs:
  - API_CONTRACT.yaml
  - API_DESIGN_NOTES.md
```

### 6.5 Data Model Sub-agent

```yaml
id: data_model_subagent
parent_agent: architecture_agent
mission: Veri modeli, ownership, retention ve migration risklerini çıkarır.
skills:
  - fmea
  - gap-audit
tools:
  - artifact_writer
outputs:
  - DATA_MODEL.md
  - DATA_RISK_NOTES.md
```

### 6.6 Test Generation Sub-agent

```yaml
id: test_generation_subagent
parent_agent: qa_lead_agent
mission: Gereksinim ve kod değişikliklerine göre test üretim planı çıkarır.
skills:
  - gap-audit
  - verification-loop
tools:
  - test_writer
  - coverage_parser
outputs:
  - TEST_PLAN.md
  - GENERATED_TESTS_SUMMARY.md
```

### 6.7 Security Scan Interpreter Sub-agent

```yaml
id: security_scan_interpreter_subagent
parent_agent: security_architect_agent
mission: Scanner çıktısını normalize eder, false positive/real risk ayrımı yapar.
skills:
  - scanner-result-normalizer
  - calibrate
tools:
  - scanner_report_reader
outputs:
  - SECURITY_SCAN_INTERPRETATION.md
  - SECURITY_FINDINGS_NORMALIZED.json
```

### 6.8 Evidence Trace Sub-agent

```yaml
id: evidence_trace_subagent
parent_agent: release_manager_agent
mission: Requirement → design → code → test → gate → release candidate zincirini kurar.
skills:
  - evidence-graph-builder
tools:
  - evidence_reader
  - artifact_writer
outputs:
  - EVIDENCE_GRAPH.json
  - TRACEABILITY_MATRIX.md
```

## 7. Gerekli olmayan roller

Şu roller başlangıç/tam çekirdek içinde gereksizdir:

```text
architecture_team_lead_agent
security_team_lead_agent
qa_team_lead_agent
release_team_lead_agent
plugin_manager_agent
simple_file_writer_agent
readme_only_agent
```

Neden:

```text
team lead çoğalması yaratır
stage owner modeli yeterlidir
plugin kapsam dışıdır
küçük işler mevcut agent içinde kalır
```

## 8. Review bağımsızlığı

Aşağıdaki kurallar zorunludur:

```text
Developer Agent kendi kodunu onaylayamaz.
Code Reviewer Agent reviewed code’u değiştiremez.
QA Lead test sonucunu değiştiremez.
Security Architect security finding’i policy dışı kapatamaz.
Release Manager failed gate’i pass yapamaz.
Team Lead blocker gate’i bypass edemez.
```

## 9. Open discussion

Tartışılacak tek ana nokta:

```text
Team pasif ownership/policy boundary olarak kalıyor mu?
```

Benim önerim:

```text
Evet. Team aktif runtime object olmamalı.
Tek global Team Lead yeterli.
Stage owner agent’lar alan liderliği sağlar.
```
