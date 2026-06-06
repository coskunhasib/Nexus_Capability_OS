# 11 — Artifact Registry Standard

Bu doküman, Nexus AI pipeline’larında kullanılan artifact/evidence adlarını canonical hale getirir.

Amaç:

```text
Her pipeline aynı artifact isimlendirme disiplinini kullansın.
Evidence ve artifact karışmasın.
Development completion ve release candidate kararları tutarlı kanıt setlerine dayansın.
```

## 1. Artifact vs Evidence

```text
Artifact = üretilen dosya / çıktı
Evidence = bir gate veya karar için kullanılan kanıt kaydı
Trace = o artifact/evidence’ın nasıl üretildiğinin işlem izi
```

Bir artifact evidence olabilir, ama her artifact otomatik evidence değildir. Evidence olması için bir gate/decision ile ilişkilendirilmelidir.

## 2. Canonical naming rules

```text
UPPER_SNAKE_CASE kullanılır.
Stage output artifact’ları tekil ve açık isimlidir.
Conditional artifact’lar _IF_APPLICABLE suffix’i taşır.
Gate sonuçları _GATE_RESULT suffix’i taşır.
Applicability kararları _APPLICABILITY_DECISION suffix’i taşır.
Report artifact’ları _REPORT suffix’i taşır.
Trace artifact’ları _TRACE veya trace schema altında tutulur.
```

## 3. Required artifact groups

```text
product_and_scope
requirements
architecture
security_privacy
risk
planning
implementation
review_test_bugfinding
security_supply_chain_agentic
privacy_contract_data_ux_perf_ops
evidence_completion_release
learning
```

## 4. SDLC canonical artifact set

### Product and scope

```text
PRODUCT_BRIEF
INITIAL_SCOPE
SUCCESS_METRICS
DOMAIN_PROFILE_DECISION
RISK_PROFILE
```

### Skill semantics

```text
SKILL_SEMANTIC_CATALOG
SKILL_MISUSE_WARNINGS
SKILL_STAGE_BINDING_PROPOSAL
```

### Requirements

```text
REQUIREMENTS_SPEC
NFR_CATALOG
ACCEPTANCE_CRITERIA
REQUIREMENTS_TRACE_START
REQUIREMENTS_REVIEW_REPORT
```

### Architecture

```text
ARCHITECTURE_DOC
SYSTEM_CONTEXT_DIAGRAM
ADR_INDEX
ARCHITECTURE_REVIEW_REPORT
```

### Security and privacy design

```text
THREAT_MODEL
SECURITY_REQUIREMENTS
DATA_INVENTORY
PRIVACY_RISK_REGISTER
```

### Risk and planning

```text
SENTINEL_PREMORTEM
FMEA_RISK_REGISTER
IMPLEMENTATION_PLAN
TASK_BREAKDOWN
HANDOFF_PACKETS
EXECUTOR_WORKPACKAGE_DRAFTS
OPERATIONAL_READINESS_DRAFTS
RUNBOOK_DRAFT
ROLLBACK_PLAN_DRAFT
```

### Implementation and review

```text
CODE_CHANGESET_SUMMARY
IMPLEMENTATION_NOTES
LOCAL_BUILD_RESULT
DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE
MIGRATION_FILES_IF_APPLICABLE
API_CONTRACTS_IF_APPLICABLE
UI_CHANGESET_SUMMARY_IF_APPLICABLE
RESOURCE_USAGE_DATA_IF_APPLICABLE
TOOL_PERMISSION_MAP
CONTEXT_POLICY
CODE_REVIEW_REPORT
```

### Test and bug finding

```text
TEST_PLAN
GENERATED_TESTS_SUMMARY
TEST_EXECUTION_REPORT
COVERAGE_REPORT
BUG_FINDING_REPORT
BUG_FINDING_GATE_RESULT
```

### Security, supply chain, and agentic safety

```text
SECURITY_SCAN_REPORT
SECURITY_FINDINGS_NORMALIZED
SBOM
LICENSE_REPORT
DEPENDENCY_RISK_REPORT
SUPPLY_CHAIN_GATE_RESULT
AGENTIC_SAFETY_EVAL_REPORT
PROMPT_INJECTION_TEST_REPORT
TOOL_MISUSE_TEST_REPORT
CONTEXT_POISONING_TEST_REPORT
EVIDENCE_INTEGRITY_REPORT
```

### Compliance, privacy, data, UX, performance, and operations

```text
COMPLIANCE_APPLICABILITY_DECISION
COMPLIANCE_MATRIX_IF_APPLICABLE
REGULATORY_TRACEABILITY_REPORT_IF_APPLICABLE
COMPLIANCE_GATE_RESULT_IF_APPLICABLE
DATA_LIFECYCLE_REPORT
RETENTION_POLICY_REPORT
TENANT_ISOLATION_REPORT
PRIVACY_GATE_RESULT
API_CONTRACT_REPORT
BREAKING_CHANGE_REPORT
CONTRACT_TEST_REPORT
COMPATIBILITY_GATE_RESULT
MIGRATION_VALIDATION_REPORT
ROLLBACK_VALIDATION_REPORT
DATA_INTEGRITY_REPORT
ACCESSIBILITY_REPORT
UX_VALIDATION_REPORT
UI_RELEASE_GATE_RESULT
PERFORMANCE_REPORT
RESILIENCE_REPORT
COST_ESTIMATE_REPORT
RESOURCE_BUDGET_REPORT
QUOTA_POLICY_REPORT
RESOURCE_GATE_RESULT
BACKUP_PLAN
RESTORE_TEST_REPORT
DR_READINESS_REPORT
```

### Operations, completion, and release

```text
RUNBOOK
ROLLBACK_PLAN
OBSERVABILITY_PLAN
INCIDENT_RESPONSE_PLAN
EVIDENCE_GRAPH
TRACEABILITY_MATRIX
DEVELOPMENT_COMPLETION_REPORT
DEVELOPMENT_COMPLETION_GATE_RESULT
RELEASE_CANDIDATE_REPORT
RELEASE_EVIDENCE
```

### Learning

```text
LESSONS_LEARNED
MEMORY_UPDATE_PROPOSAL
FUTURE_IMPROVEMENT_BACKLOG
```

## 5. Evidence item standard

Her evidence item şu alanlara sahip olmalıdır:

```yaml
evidence_id:
artifact_id:
related_pipeline:
related_run:
related_stage:
related_gate:
producer:
reviewer:
status:
summary:
source_artifacts:
trace_refs:
created_at:
```

## 6. Artifact registry rule

Yeni stage veya pipeline eklenirken:

```text
1. Üreteceği artifact’lar registry’ye eklenir.
2. Hangi artifact’ın evidence olduğu belirtilir.
3. Conditional artifact ise condition belirtilir.
4. Release candidate’a girecekse release_evidence_required true olur.
5. Development completion gate’e bağlıysa development_completion_required true olur.
```

## 7. SDLC release evidence rule

Release Candidate üretilebilmesi için şu set tamamlanmış olmalıdır:

```text
Core required evidence
+ applicable conditional evidence
+ no blocking policy failure
+ development completion pass
```

Bu registry standardı tamamlanmadan machine-readable pipeline configs güvenilir sayılmaz.
