# 06a — SDLC Mandatory Gates Decision

Bu doküman, SDLC araştırmasında yer alan ancak pipeline görünürlüğü eksik kalan üç kalite alanını zorunlu / koşullu zorunlu gate olarak kilitler.

## Decision

Aşağıdaki üç alan SDLC Pipeline içinde görünür gate olarak yer almalıdır:

```text
Supply Chain / SBOM / License
Accessibility / UX Validation
Data / Migration Validation
```

Bunlar yeni konu değildir. İlk SDLC araştırmasında vardı; ancak pipeline sözleşmesinde açık gate olarak yeterince görünür değildi.

## 1. Supply Chain / SBOM / License

### Status

```text
Required for product-grade SDLC.
```

### Purpose

Ürünün üçüncü parti bağımlılıklarını, açık kaynak lisanslarını, SBOM çıktısını ve dependency güvenlik risklerini kontrol eder.

### Required when

```text
always_required_for_product_grade_release_candidate
```

### Uses Core Abilities

```text
Coder
Memory
Web
OS
```

### Uses Skills

```text
gap-audit
calibrate
```

### Uses Tools

```text
dependency_scanner
sbom_generator
license_checker
package_reputation_checker
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
supply_chain_governance
license_compliance_governance
sbom_required_gate
```

### Uses Audit Schemas

```text
sbom_evidence_schema
license_report_schema
supply_chain_trace_schema
```

### Required evidence

```text
SBOM
LICENSE_REPORT
DEPENDENCY_RISK_REPORT
SUPPLY_CHAIN_GATE_RESULT
```

## 2. Accessibility / UX Validation

### Status

```text
conditional_required
```

### Required when

```text
product_has_ui == true
```

UI varsa zorunlu gate’tir. UI yoksa doğrudan accessibility gate zorunlu olmayabilir; fakat developer experience, API docs veya CLI usability ayrı değerlendirilir.

### Purpose

Kullanıcı arayüzünün kullanılabilirlik, erişilebilirlik, hata/boş durum, klavye kullanımı, kontrast ve temel UX akışlarını kontrol eder.

### Uses Core Abilities

```text
Vision
Coder
Memory
Web
```

### Uses Skills

```text
gap-audit
prompt-fidelity
```

### Uses Tools

```text
accessibility_auditor
ux_flow_checker
contrast_checker
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
accessibility_governance
ux_validation_governance
ui_release_gate
```

### Uses Audit Schemas

```text
accessibility_evidence_schema
ux_validation_report_schema
```

### Required evidence

```text
ACCESSIBILITY_REPORT
UX_VALIDATION_REPORT
UI_RELEASE_GATE_RESULT
```

## 3. Data / Migration Validation

### Status

```text
conditional_required
```

### Required when

```text
data_model_changed == true
or migration_changed == true
or persistent_data_affected == true
```

### Purpose

Veri modeli, migration, rollback, tenant izolasyonu, veri kaybı ve backward compatibility risklerini kontrol eder.

### Uses Core Abilities

```text
Coder
Memory
OS
```

### Uses Skills

```text
fmea
gap-audit
verification-loop
```

### Uses Tools

```text
migration_checker
schema_diff_checker
rollback_validator
data_integrity_checker
test_runner
artifact_writer
evidence_writer
```

### Uses Governance Profiles

```text
data_migration_governance
rollback_required_gate
data_integrity_gate
```

### Uses Audit Schemas

```text
migration_evidence_schema
data_integrity_report_schema
rollback_validation_schema
```

### Required evidence

```text
DATA_MODEL_CHANGE_REPORT
MIGRATION_VALIDATION_REPORT
ROLLBACK_VALIDATION_REPORT
DATA_INTEGRITY_REPORT
```

## Development Completion impact

Development Completion gate setine şu maddeler eklenir:

```text
supply_chain_pass
license_pass
sbom_present
accessibility_pass_if_applicable
data_migration_pass_if_applicable
```

## Release Candidate impact

Release Candidate evidence setine şu artifact’lar eklenir:

```text
SBOM
LICENSE_REPORT
SUPPLY_CHAIN_GATE_RESULT
ACCESSIBILITY_REPORT_IF_APPLICABLE
UX_VALIDATION_REPORT_IF_APPLICABLE
DATA_MODEL_CHANGE_REPORT_IF_APPLICABLE
MIGRATION_VALIDATION_REPORT_IF_APPLICABLE
ROLLBACK_VALIDATION_REPORT_IF_APPLICABLE
DATA_INTEGRITY_REPORT_IF_APPLICABLE
```

## Rule

Bu üç alan görünür gate/evidence olarak bağlanmadan SDLC Pipeline tam kapsamlı sayılmaz.
