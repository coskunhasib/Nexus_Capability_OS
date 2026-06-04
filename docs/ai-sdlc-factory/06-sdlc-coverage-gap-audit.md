# 06 — SDLC Coverage / Gap Audit

Bu doküman, SDLC Pipeline tarafında eksik kalmaması gereken alanları kontrol eder.

Amaç:

```text
SDLC Pipeline’ın yalnız high-level bir süreç olarak kalmasını engellemek
Başta yapılan yazılım geliştirme standartları araştırmasını SDLC kapsamına bağlamak
Eksik stage / gate / evidence / governance bırakmamak
```

## 1. SDLC neden kritik?

Kullanıcı, yazılım geliştirme işlerinin insan tarafından değil AI tarafından yapılacağını belirtti. Bu nedenle SDLC Pipeline, klasik insan ekibinin sezgisel olarak yaptığı kontrolleri makine-okunabilir stage, gate, evidence ve trace yapısına dönüştürmelidir.

## 2. SDLC araştırma temeli

SDLC kapsamı şu araştırma ailelerinden türetilmiştir:

```text
Software lifecycle
System lifecycle
Requirements engineering
Architecture description
Product quality model
Source code quality
Testing
Verification and validation
Documentation
Secure SDLC
Application security
Supply chain security
Accessibility
Human-centered design
Risk management
Quality management
Operations / SRE
Compliance / domain-specific standards
```

## 3. SDLC stage coverage matrix

| Stage | Gerekli mi? | Neden gerekli? | Durum |
|---|---:|---|---|
| Intake | Evet | Ürün hedefi, problem, kapsam ve başarı metriği çıkarılır. | Required |
| Domain / Risk Profile | Evet | Pipeline sertliği domain/risk profiline göre ayarlanır. | Required |
| Skill Semantic Extraction | Evet | Skill yanlış bağlanırsa pipeline yanlış çalışır. | Required |
| Requirements | Evet | Fonksiyonel ve non-functional gereksinimler yazılır. | Required |
| Requirements Review | Evet | Belirsizlik, acceptance criteria ve kullanıcı niyeti kontrol edilir. | Required |
| Architecture | Evet | Sistem sınırları, kalite hedefleri ve teknik yapı belirlenir. | Required |
| Architecture Review | Evet | Trade-off, ADR, güvenlik ve NFR uyumu denetlenir. | Required |
| Security / Privacy Design | Evet | Threat model, data/privacy, auth ve abuse case çıkarılır. | Required |
| Premortem / FMEA | Evet | Failure mode ve riskler önceden aranır. | Required |
| Planning | Evet | Handoff, task breakdown, context pack ve executor planı hazırlanır. | Required |
| Implementation | Evet | Kod / artifact üretimi yapılır. | Required |
| Code Review | Evet | Doğruluk, bakım, güvenlik ve mimari uyum kontrol edilir. | Required |
| Test Generation | Evet | Risk ve gereksinim bazlı test kapsamı üretilir. | Required |
| Test Execution | Evet | Unit/integration/contract/e2e/performance smoke çalışır. | Required |
| Verification-loop Bug Finding | Evet | verification-loop ile defect sweep yapılır. | Required |
| Security Validation | Evet | SAST/SCA/secret/container/IaC/API scanner sonuçları yorumlanır. | Required |
| Supply Chain / SBOM / License | Evet | Dependency, SBOM, lisans, provenance kontrolleri yapılır. | Required |
| Performance / Resilience | Evet | Latency, resource, capacity, failure behavior ve resiliency kontrol edilir. | Required |
| Accessibility / UX Validation | Koşullu ama önemli | UI/kullanıcı etkileşimi varsa erişilebilirlik ve UX doğrulanır. | Conditional Required |
| Data / Migration Validation | Koşullu ama önemli | Veri modeli, migration, rollback ve veri kaybı riski varsa zorunlu. | Conditional Required |
| Operations Readiness | Evet | Runbook, rollback, observability, incident hazırlığı yapılır. | Required |
| Evidence Graph Build | Evet | Requirement → design → code → test → gate → release trace kurulur. | Required |
| Development Completion | Evet | Geliştirme gerçekten tamam mı gate setiyle belirlenir. | Required |
| Release Candidate | Evet | Development completion sonrası release candidate evidence oluşturulur. | Required |
| Refraction / Learning | Evet ama blocker değil | Öğrenme, kalibrasyon, post-run lesson üretir. | Advisory Required |

## 4. Eksik görünen stage adayları

Önceki SDLC listelerinde açıkça ayrı stage olarak görünmeyebilecek ama kapsama alınması gereken başlıklar:

```text
Supply Chain / SBOM / License
Accessibility / UX Validation
Data / Migration Validation
```

Bunlar ayrı stage olabilir veya mevcut stage’lerin alt gate’i olabilir. Ancak coverage matrix içinde görünür olmalıdır.

## 5. Shared usage mapping zorunluluğu

Her SDLC stage şu ortak kategorileri açıkça göstermelidir:

```text
uses Core Abilities
uses Skills
uses Tools
uses Governance Profiles
uses Audit Schemas
uses Model / Provider Profiles
uses Context / Memory Profiles
```

## 6. Stage contract template

Her SDLC stage şu formatla tanımlanmalıdır:

```yaml
stage_id:
purpose:
owner_team:
team_lead:
owner_agent:
sub_agents:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
inputs:
outputs:
evidence:
trace:
gates:
on_pass:
on_fail:
rework_route:
blocking_conditions:
```

## 7. SDLC no-human governance minimumları

SDLC’de her stage decision şu koşulları sağlamalıdır:

```text
stage output exists
required evidence exists
required trace exists
governance gate evaluated
blocking findings handled
rework route defined
```

## 8. Development Completion için minimum gate seti

Development Completion pass olabilmesi için aşağıdaki her zaman gerekli
(always-required) gate’lerin tamamı pass olmalıdır:

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

Ayrıca, ilgili upstream applicability kararı `true` olduğunda şu koşullu
(conditional-required) gate’ler de değerlendirilip pass (ya da sahipli/dokümante
kabul) olmalıdır:

```text
accessibility_pass_if_applicable
data_migration_pass_if_applicable
privacy_lifecycle_pass_if_applicable
api_contract_compatibility_pass_if_applicable
backup_restore_dr_pass_if_applicable
compliance_pass_if_applicable
cost_resource_governance_pass_if_applicable
```

> **Reconciliation (karar günlüğü D-016).** Yukarıdaki always-required set (19 gate),
> doc 08 §4 “Mandatory gates” (always) listesi ve
> `configs/nexus-ai/sdlc_pipeline.yaml` → `required_gates.always` ile **birebir
> aynıdır** (aynı sıra). Canonical, makine-okunabilir kaynak budur; doc 06 §8 ve
> doc 08 §4 onun insan-okunabilir yansımalarıdır. Set, bu doküman ailesindeki üç
> kararın birleşimidir: doc 06 §8 tabanı + doc 06a (`supply_chain_pass`,
> `license_pass`, `sbom_present`) + doc 06b (`agentic_safety_eval_pass`, “Development
> Completion impact”). Bu §8 listesi önceden 06b’nin eklediği
> `agentic_safety_eval_pass`’i içermiyordu; D-016 bu boşluğu kapatır. Üç gate
> özellikle vurgulanır — iki always-on BLOCKER gate `risk_register_reviewed` (stage 9
> premortem_fmea) ve `performance_resilience_pass_or_accepted` (stage 24
> performance_resilience), ve `agentic_safety_eval_pass` (stage 18
> ai_agent_safety_evaluation); üçü de severity: blocker / required_when: always olarak
> yönetilir (`configs/nexus-ai/governance/stage/sdlc-stages.yaml`) ve stage-29
> development_completion rollup’ında
> (`configs/nexus-ai/stages/sdlc/29-development-completion.yaml`) yer alır. Yukarıdaki
> conditional set de doc 08 §4 “Conditional required” / `required_gates.conditional`
> ile aynıdır (06a + 06b’den türetilmiştir).

## 9. Release Candidate için minimum evidence seti

```text
REQUIREMENTS_SPEC
NFR_CATALOG
ARCHITECTURE_DECISION / ADR
THREAT_MODEL
RISK_REGISTER
IMPLEMENTATION_SUMMARY
CODE_REVIEW_REPORT
TEST_EXECUTION_REPORT
BUG_FINDING_REPORT
SECURITY_SCAN_REPORT
SBOM
LICENSE_REPORT
PERFORMANCE_REPORT
ACCESSIBILITY_REPORT_IF_APPLICABLE
DATA_MIGRATION_REPORT_IF_APPLICABLE
RUNBOOK
ROLLBACK_PLAN
OBSERVABILITY_PLAN
EVIDENCE_GRAPH
DEVELOPMENT_COMPLETION_REPORT
RELEASE_CANDIDATE_REPORT
```

## 10. SDLC gap verdict

Mevcut tartışma modelinde SDLC ana omurgası doğru yöndedir, ancak aşağıdaki üç alan özellikle görünür hale getirilmelidir:

```text
Supply Chain / SBOM / License
Accessibility / UX Validation
Data / Migration Validation
```

Bunlar eklenmeden SDLC tam kapsamlı sayılmamalıdır.

## 11. Sonraki adım

SDLC Pipeline için ayrı bir `Pipeline Catalog + Pipeline Run + Stage Contract` dokümanı hazırlanmalı ve bu audit’teki tüm stage/gate/evidence alanları o sözleşmeye bağlanmalıdır.
