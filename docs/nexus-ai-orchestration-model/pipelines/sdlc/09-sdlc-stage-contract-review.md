# 09 — SDLC Stage Contract Review

Bu doküman, SDLC stage contract setinin ilk tutarlılık denetimidir.

Denetlenen alanlar:

```text
06-sdlc-coverage-gap-audit.md
06a-sdlc-mandatory-gates-decision.md
06b-sdlc-agentic-safety-and-remaining-gates.md
07-pipeline-contract-standard.md
08-sdlc-pipeline-contract.md
sdlc-stages/*
```

## Verdict

```text
PASS_WITH_FINDINGS
```

SDLC ana omurgası ve stage sözleşme formatı doğru yönde. Ancak tam kapsam iddiası için birkaç sözleşme boşluğu ve tutarlılık düzeltmesi gerekiyor.

## Blocking findings

### BF-001 — Domain / Regulatory Compliance stage eksik

`06b` dokümanı `Domain / Regulatory Compliance Validation` alanını görünür gate olarak kilitliyor.

Ancak `08-sdlc-pipeline-contract.md` stage listesinde ve `sdlc-stages/04-validation-and-product-gates.md` içinde buna karşılık gelen stage yok.

Eksik stage:

```text
domain_regulatory_compliance_validation_if_applicable
```

Gerekli evidence:

```text
COMPLIANCE_MATRIX
REGULATORY_TRACEABILITY_REPORT
COMPLIANCE_GATE_RESULT
```

Etkisi:

```text
compliance_pass_if_applicable gate’i Development Completion içinde var ama stage/evidence üreticisi yok.
```

Düzeltme:

```text
Validation/Product Gates grubuna domain_regulatory_compliance_validation_if_applicable stage’i eklenmeli.
08 stage listesi bu stage’i içermeli.
```

## Major findings

### MF-001 — Backup / Restore / DR input zinciri net değil

`backup_restore_dr_validation_if_applicable` şu girdileri bekliyor:

```text
DATA_INTEGRITY_REPORT
RUNBOOK_DRAFT
ROLLBACK_PLAN_DRAFT
```

Ancak mevcut upstream stage’lerde `RUNBOOK_DRAFT` ve `ROLLBACK_PLAN_DRAFT` açıkça üretilmiyor.

Etkisi:

```text
Backup/DR stage’i operasyonel kanıt üretmek için gerekli draft girdileri nereden alacağını bilmiyor.
```

Düzeltme seçenekleri:

```text
1. planning stage outputs içine RUNBOOK_DRAFT ve ROLLBACK_PLAN_DRAFT ekle.
2. operations_readiness öncesi ops_draft_preparation stage ekle.
3. backup_restore stage inputs alanını OPERATIONS_READINESS_DRAFTS olarak değiştir.
```

Öneri:

```text
planning stage outputs içine OPERATIONAL_READINESS_DRAFTS, RUNBOOK_DRAFT, ROLLBACK_PLAN_DRAFT eklenmeli.
```

### MF-002 — Conditional stage’ler için applicability evidence eksik

Aşağıdaki stage’ler koşullu:

```text
privacy_data_lifecycle_validation
api_contract_compatibility_validation
data_migration_validation_if_applicable
accessibility_ux_validation_if_applicable
backup_restore_dr_validation_if_applicable
domain_regulatory_compliance_validation_if_applicable
cost_resource_governance
```

Bazı stage adlarında `_if_applicable` var, bazılarında yok. Ayrıca applicability decision evidence adı standart değil.

Düzeltme:

Her conditional stage şu evidence çıktısını üretmeli veya kullanmalı:

```text
<STAGE>_APPLICABILITY_DECISION
```

Örnek:

```text
API_CONTRACT_APPLICABILITY_DECISION
DATA_MIGRATION_APPLICABILITY_DECISION
ACCESSIBILITY_UX_APPLICABILITY_DECISION
BACKUP_RESTORE_DR_APPLICABILITY_DECISION
COMPLIANCE_APPLICABILITY_DECISION
```

### MF-003 — Data / Migration stage input üreticisi net değil

`data_migration_validation_if_applicable` şu girdileri bekliyor:

```text
DATA_MODEL_CHANGE_REPORT
MIGRATION_FILES
```

Mevcut upstream stage’lerde `DATA_MODEL_CHANGE_REPORT` açıkça üretilmiyor.

Düzeltme:

`architecture` veya `implementation` stage output’larına şu eklenmeli:

```text
DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE
MIGRATION_FILES_IF_APPLICABLE
```

### MF-004 — Pipeline-level usage mapping yeni gate araçlarını tam yansıtmıyor

`08-sdlc-pipeline-contract.md` pipeline-level tools listesi bazı yeni gate araçlarını içeriyor ama tamamını kapsamıyor.

Eksik örnekler:

```text
compliance_matrix_builder
requirements_trace_checker
prompt_injection_tester
tool_misuse_tester
context_poisoning_tester
evidence_consistency_checker
backup_plan_checker
restore_test_runner
cost_estimator
quota_policy_checker
```

Düzeltme:

Pipeline-level usage mapping, stage-level kullanılan shared tool/profile setlerinin union’ı olacak şekilde güncellenmeli.

## Minor findings

### NF-001 — Stage adlandırmasında conditional suffix tutarsızlığı var

Bazı conditional stage’lerde `_if_applicable` suffix’i var, bazılarında yok.

Örnek:

```text
privacy_data_lifecycle_validation
api_contract_compatibility_validation
cost_resource_governance
```

Bu stage’ler de koşullu olabilir.

Öneri:

İsimleri değiştirmek şart değil, ancak her stage içinde `required_when` ve `applicability_decision` alanı zorunlu olmalı.

### NF-002 — Release evidence seti uzun ama doğru yönde

Release evidence seti kapsamlı. Ancak ileride dosya isimleri canonical artifact registry ile standartlaştırılmalı.

## Corrective action plan

Aşağıdaki düzeltmeler yapılmalı:

```text
1. domain_regulatory_compliance_validation_if_applicable stage’i ekle.
2. planning stage outputs’a operational readiness draftlarını ekle.
3. data migration input üreticilerini netleştir.
4. conditional stage applicability decision standardını ekle.
5. 08 pipeline-level usage mapping’i stage-level union’a göre güncelle.
6. README’ye review ve correction dokümanlarını ekle.
```

## Review conclusion

SDLC stage contract seti temel olarak doğru; ancak BF-001 düzeltilmeden SDLC kapsamı tam kapandı denmemeli.

Bu dokümandaki findings giderildikten sonra ikinci review çalıştırılmalıdır.
