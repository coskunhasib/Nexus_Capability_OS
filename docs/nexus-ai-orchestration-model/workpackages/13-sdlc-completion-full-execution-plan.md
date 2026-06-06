# 13 — SDLC Completion Full Execution Plan

Bu doküman, SDLC Pipeline’ı `conceptual/design-ready` seviyesinden `contract-ready + independently reviewed` seviyesine taşımak için tüm kalan işi fazlara böler.

Birincil executor:

```text
Claude Code
```

Denetleyici:

```text
ChatGPT
```

## 1. Current status

Mevcut durum:

```text
SDLC conceptual coverage: complete
SDLC stage contracts: complete with canonical corrections
Artifact registry standard: baseline complete
Machine-readable baseline configs: baseline complete
Executor workpackages: defined
Final reviewed readiness: not complete
```

SDLC için kategori eksikleri büyük ölçüde kapandı. Kalan iş artık yeni SDLC alanı eklemek değil, sözleşmeleri makine-okunabilir, denetlenebilir ve executor-ready hale getirmektir.

## 2. Non-goals

Bu plan kapsamında yapılmayacaklar:

```text
runtime implementation
connector integration
Nexus publish
deploy
plugin registry
production automation
main branch merge
```

## 3. Phase 0 — Context lock and memory reload

### Objective

Claude Code çalışmaya başlamadan önce mevcut bağlamı doğru yüklemek.

### Inputs

```text
.memory/README.md
.memory/0001-session-summary.md
.memory/0002-locked-decisions.md
.memory/0003-sdlc-research-baseline.md
.memory/0004-next-actions.md
docs/ai-sdlc-factory/README.md
```

### Tasks

```text
1. .memory dosyalarını oku.
2. Kilitli kararları çıkar.
3. Plugin iptal kararını doğrula.
4. Core Abilities / SDLC Team ayrımını doğrula.
5. Shared Registry + Usage Mapping kuralını doğrula.
```

### Outputs

```text
docs/ai-sdlc-factory/execution/phase-0-context-lock-report.md
```

### Exit criteria

```text
No locked decision conflict.
No plugin reintroduction.
No Core Ability → Agent confusion.
```

## 4. Phase 1 — Machine-readable SDLC stage contracts

### Objective

Markdown/YAML-block stage sözleşmelerini makine-okunabilir YAML dosyalarına dönüştürmek.

### Inputs

```text
docs/ai-sdlc-factory/07-pipeline-contract-standard.md
docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md
docs/ai-sdlc-factory/sdlc-stages/*.md
docs/ai-sdlc-factory/sdlc-stages/06-canonical-corrections-and-overrides.md
configs/nexus-ai/pipeline_contract_standard.yaml
configs/nexus-ai/sdlc_pipeline.yaml
```

### Tasks

```text
1. Her stage için ayrı YAML dosyası oluştur.
2. 06-canonical-corrections-and-overrides.md içindeki override’ları inline canonical hale getir.
3. domain_regulatory_compliance_validation_if_applicable stage’ini stage YAML setine ekle.
4. Conditional stage’lere applicability_decision alanı ekle.
5. Stage on_pass / on_fail / rework_route alanlarını doğrula.
6. Shared usage alanlarının tamamını her stage’de görünür tut.
```

### Outputs

```text
configs/nexus-ai/stages/sdlc/01-intake.yaml
configs/nexus-ai/stages/sdlc/02-domain-risk-profile.yaml
configs/nexus-ai/stages/sdlc/...
configs/nexus-ai/stages/sdlc/31-refraction-learning.yaml
configs/nexus-ai/stages/sdlc/README.md
```

### Exit criteria

```text
Every stage has all required fields.
Every route points to a known stage or canonical terminal state.
Every conditional stage has applicability_decision.
Every stage has uses_core_abilities, uses_skills, uses_tools, uses_governance_profiles, uses_audit_schemas, uses_model_provider_profiles, uses_context_memory_profiles.
```

## 5. Phase 2 — JSON schemas and validation rules

### Objective

Pipeline, run, stage, artifact, evidence ve trace sözleşmeleri için JSON schema dosyaları üretmek.

### Inputs

```text
configs/nexus-ai/pipeline_contract_standard.yaml
configs/nexus-ai/artifact_registry.yaml
configs/nexus-ai/sdlc_pipeline.yaml
configs/nexus-ai/stages/sdlc/*.yaml
```

### Tasks

```text
1. pipeline_definition.schema.json üret.
2. pipeline_run.schema.json üret.
3. stage_contract.schema.json üret.
4. artifact_registry.schema.json üret.
5. evidence_item.schema.json üret.
6. trace_item.schema.json üret.
7. Validation README oluştur.
```

### Outputs

```text
configs/nexus-ai/schemas/pipeline_definition.schema.json
configs/nexus-ai/schemas/pipeline_run.schema.json
configs/nexus-ai/schemas/stage_contract.schema.json
configs/nexus-ai/schemas/artifact_registry.schema.json
configs/nexus-ai/schemas/evidence_item.schema.json
configs/nexus-ai/schemas/trace_item.schema.json
configs/nexus-ai/validation/README.md
```

### Exit criteria

```text
Schemas parse as JSON.
Required fields match pipeline_contract_standard.yaml.
No schema introduces plugin.
No schema converts Core Abilities into Agents.
```

## 6. Phase 3 — SDLC contract consistency audit

### Objective

Makine-okunabilir SDLC sözleşmelerinin tutarlılığını denetlemek.

### Tasks

```text
1. Stage count check.
2. Unknown route check.
3. Missing shared usage field check.
4. Conditional gate/applicability check.
5. Required artifact existence check.
6. Development completion gate producer check.
7. Release evidence coverage check.
8. Plugin absence check.
9. Core Ability/Agent boundary check.
```

### Outputs

```text
docs/ai-sdlc-factory/reviews/sdlc-contract-consistency-audit.md
```

### Exit criteria

```text
No blocking findings.
Major findings either resolved or explicitly documented with follow-up.
```

## 7. Phase 4 — Claude Code independent skill and agent review

### Objective

Skill semantiği, agent/sub-agent rol ayrımı, Core Ability kullanımı ve SDLC stage bağlarının bağımsız incelenmesi.

### Inputs

```text
.memory/*
docs/ai-sdlc-factory/**
configs/nexus-ai/**
```

### Tasks

```text
1. prism kullanımını doğrula.
2. verification-loop kullanımını doğrula.
3. sentinel / llm-council / fmea / gap-audit bağlarını kontrol et.
4. Core Ability yanlışlıkla Agent yapılmış mı kontrol et.
5. Supervisor, SDLC Team Lead yerine geçmiş mi kontrol et.
6. Stage owner agent ve sub-agent hiyerarşisini kontrol et.
```

### Outputs

```text
docs/ai-sdlc-factory/reviews/claude-code-skill-agent-review.md
```

### Exit criteria

```text
No blocking semantic mismatch.
No plugin reintroduction.
No Core Ability / Agent confusion.
```

## 8. Phase 5 — Blueprint assembly and diagrams

### Objective

Tüm blueprint’i takip edilebilir hale getirmek; index, traceability ve diyagramlar oluşturmak.

### Tasks

```text
1. BLUEPRINT_INDEX.md oluştur.
2. TRACEABILITY_OVERVIEW.md oluştur.
3. Nexus AI operating model Mermaid diyagramı oluştur.
4. SDLC pipeline flow Mermaid diyagramı oluştur.
5. Shared Registry + Usage Mapping diyagramı oluştur.
6. Governance/Audit layering diyagramı oluştur.
```

### Outputs

```text
docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
docs/ai-sdlc-factory/diagrams/nexus-ai-operating-model.mmd
docs/ai-sdlc-factory/diagrams/sdlc-pipeline-flow.mmd
docs/ai-sdlc-factory/diagrams/shared-registry-usage-map.mmd
docs/ai-sdlc-factory/diagrams/governance-audit-layering.mmd
```

### Exit criteria

```text
Every major decision points to a source document.
Every SDLC stage points to a contract file.
Every shared category appears in registry and usage form.
```

## 9. Phase 6 — Final cross-review

### Objective

Tüm sözleşme, config, review ve diyagram çıktılarının final değerlendirmesini yapmak.

### Tasks

```text
1. Contract completeness review.
2. Stage route review.
3. Artifact registry review.
4. Skill/agent/core ability boundary review.
5. Governance/audit review.
6. Executor output review.
```

### Outputs

```text
docs/ai-sdlc-factory/reviews/final-cross-review-summary.md
```

### Verdict format

```text
PASS
PASS_WITH_FINDINGS
BLOCKED
```

## 10. Completion definition

SDLC Completion Plan bitmiş sayılırsa:

```text
All stage YAMLs exist.
All schemas exist.
Consistency audit has no blocking findings.
Claude Code review has no blocking findings.
Blueprint index and diagrams exist.
Final cross-review is PASS or PASS_WITH_FINDINGS with no blocking findings.
```

## 11. Execution order

```text
Phase 0
Phase 1
Phase 2
Phase 3
Phase 4
Phase 5
Phase 6
```

## 12. Review ownership

Claude Code executes.

ChatGPT reviews.

No runtime/refactor/connector/deploy begins until final cross-review completes.
