# SDLC Stage Contracts

Bu klasör, `08-sdlc-pipeline-contract.md` dosyasındaki SDLC Pipeline taslağını stage-by-stage sözleşmelere böler.

Amaç:

```text
Her SDLC stage için owner, usage mapping, gate, evidence, trace, pass/fail ve rework route alanlarını görünür kılmak.
```

## Standart

Her stage, `../07-pipeline-contract-standard.md` içindeki `Pipeline Stage Contract` formatına uymalıdır.

Her stage şu ortak kullanım kategorilerini açıkça göstermelidir:

```text
uses_core_abilities
uses_skills
uses_tools
uses_governance_profiles
uses_audit_schemas
uses_model_provider_profiles
uses_context_memory_profiles
```

Bu alanlar boşsa bile boş bırakılmış olarak görünmelidir.

## Dosyalar

```text
01-foundation-and-requirements.md
02-design-risk-and-planning.md
03-build-review-and-test.md
04-validation-and-product-gates.md
05-completion-release-and-learning.md
```

## Stage grupları

### 01 — Foundation and Requirements

```text
intake
domain_risk_profile
skill_semantic_extraction
requirements
requirements_review
```

### 02 — Design, Risk and Planning

```text
architecture
architecture_review
security_privacy_design
premortem_fmea
planning
```

### 03 — Build, Review and Test

```text
implementation
code_review
test_generation
test_execution
verification_loop_bug_finding
```

### 04 — Validation and Product Gates

```text
security_validation
supply_chain_sbom_license
ai_agent_safety_evaluation
privacy_data_lifecycle_validation
api_contract_compatibility_validation
data_migration_validation_if_applicable
accessibility_ux_validation_if_applicable
performance_resilience
cost_resource_governance
backup_restore_dr_validation_if_applicable
```

### 05 — Completion, Release and Learning

```text
operations_readiness
evidence_graph_build
development_completion
release_candidate
refraction_learning
```

## Tamlık kuralı

SDLC Stage Contracts tamamlanmış sayılmaz, eğer herhangi bir stage için şu alanlar eksikse:

```text
owner_agent
uses_core_abilities
uses_skills
uses_tools
uses_governance_profiles
uses_audit_schemas
uses_model_provider_profiles
uses_context_memory_profiles
gates
evidence
trace
on_pass
on_fail
rework_route
```

## Next step

Bu klasör tamamlandıktan sonra sıradaki iş, bu contract’lardan makine-okunabilir YAML/JSON şemalarını ve Codex / Claude Code / Antigravity workpackage’lerini üretmektir.
