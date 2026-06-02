# 07 — Executor Workpackages

Bu doküman, Codex / Claude Code / Antigravity gibi uygulayıcı agent ortamlarına verilecek iş paketlerini tanımlar.

Bu ortamlar mimari karar sahibi değildir. Rolleri şudur:

```text
Planı uygula.
Artifact üret.
Sözleşmeye uy.
Evidence üret.
Kendi işini onaylama.
```

## 1. Çalışma modeli

```text
ChatGPT
  → mimari planı ve workpackage’leri hazırlar
  → executor ortamlarına görev verir
  → üretilen çıktıları review eder
  → eksik/gap varsa rework ister

Codex / Claude Code / Antigravity
  → kendilerine verilen workpackage’i uygular
  → dosya üretir/değiştirir
  → test/validasyon çalıştırır
  → evidence raporu üretir
  → merge/release kararı vermez
```

## 2. Genel workpackage formatı

Her iş paketi şu alanları içermelidir:

```yaml
id:
title:
executor:
objective:
context:
inputs:
expected_outputs:
allowed_files:
forbidden_files:
allowed_tools:
forbidden_actions:
skills_to_use:
quality_gates:
evidence_required:
review_checklist:
completion_signal:
```

## 3. Executor seçimi

### 3.1 Claude Code

Claude Code için önerilen işler:

```text
skill paketlerini detaylı okuma
SKILL.md + scripts + references + assets analizleri
sub-agent prompt/contract hazırlama
skill semantic extraction
misuse warning çıkarma
handoff ilişkilerini yorumlama
```

Neden:

```text
skill ve sub-agent kavramlarıyla güçlü çalışır
uzun doküman ve reference analizi için uygundur
```

### 3.2 Codex

Codex için önerilen işler:

```text
schema üretimi
YAML/JSON contract üretimi
pipeline graph dosyaları
repo convention dosyaları
AGENTS.md / task instructions
policy/evidence modelinin uygulanabilir dosyalara dönüştürülmesi
```

Neden:

```text
repo içi kod/dosya düzenleme için uygundur
sözleşme ve test üretimi için uygundur
```

### 3.3 Antigravity

Antigravity için önerilen işler:

```text
paralel workstream yürütme
artifact bazlı task izleme
workspace bazlı üretim ve doğrulama
çoklu agent koordinasyonu
flow/diagram/UI takip işleri
```

Neden:

```text
birden fazla workspace ve agent akışını gözlemlemeye uygundur
```

## 4. Workpackage-001 — Skill Semantic Extraction

```yaml
id: WP-001
executor: Claude Code
title: Full skill semantic extraction
objective: Tüm skill paketlerini tek tek okuyup semantic catalog üret.
inputs:
  - Skill-Ekosistemi.zip
  - ilk-skiller-bunlar-bunun-disinda-varsa.zip
  - docs/ai-sdlc-factory/03-skill-semantic-extraction.md
expected_outputs:
  - SKILL_SEMANTIC_CATALOG.yaml
  - SKILL_SCRIPT_INVENTORY.yaml
  - SKILL_REFERENCE_INDEX.yaml
  - SKILL_MISUSE_WARNINGS.md
  - SKILL_DEPENDENCY_GRAPH.mmd
quality_gates:
  - every_skill_has_primary_purpose
  - every_skill_has_not_for
  - prism_bound_as_divergence
  - verification_loop_bound_as_bug_finding
forbidden_actions:
  - execute_untrusted_script_live
  - map_skill_without_reading_references
```

Review criteria:

```text
Prism brainstorming olarak okunmuş mu?
Prism’in llm-council ve Sentinel içi kullanımı işlenmiş mi?
Verification-loop bug/defect finding olarak okunmuş mu?
Sentinel premortem/risk skill’i olarak sınıflanmış mı?
Her skill için misuse warning var mı?
```

## 5. Workpackage-002 — Agent/Sub-agent Contracts

```yaml
id: WP-002
executor: Codex
title: Agent and sub-agent contract files
objective: Team/agent/sub-agent sözleşmelerini makine-okunabilir YAML dosyalarına dönüştür.
inputs:
  - docs/ai-sdlc-factory/04-team-agent-subagent-model.md
expected_outputs:
  - configs/ai-sdlc-factory/team_catalog.yaml
  - configs/ai-sdlc-factory/agent_catalog.yaml
  - configs/ai-sdlc-factory/sub_agent_catalog.yaml
  - configs/ai-sdlc-factory/agent_boundary_matrix.yaml
quality_gates:
  - no_plugin_reference
  - single_global_team_lead
  - team_is_passive_boundary
  - no_self_approval_rules_present
forbidden_actions:
  - create_team_specific_lead_agents
  - turn_skills_into_agents
```

Review criteria:

```text
Team’ler runtime worker gibi modellenmemiş mi?
Sub-agent sayısı gerekçeli mi?
Stage owner agent’lar net mi?
Team Lead policy bypass yetkisi almamış mı?
```

## 6. Workpackage-003 — Pipeline Graph and Rework Routing

```yaml
id: WP-003
executor: Codex
title: Deterministic pipeline graph
objective: Pipeline stage graph’ını YAML ve Mermaid olarak üret.
inputs:
  - docs/ai-sdlc-factory/05-pipeline-model.md
expected_outputs:
  - configs/ai-sdlc-factory/pipeline_graph.yaml
  - configs/ai-sdlc-factory/rework_routing_table.yaml
  - diagrams/ai-sdlc-factory/pipeline_graph.mmd
  - diagrams/ai-sdlc-factory/pipeline_state_machine.mmd
quality_gates:
  - every_stage_has_owner_agent
  - every_stage_has_on_pass_on_fail
  - every_stage_has_evidence_required
  - no_publication_before_release_candidate
forbidden_actions:
  - make_pipeline_llm_chat_flow
  - use_team_as_stage_owner
```

Review criteria:

```text
Verification-loop bug finding stage olarak geçiyor mu?
Skill semantic extraction requirements’tan önce mi?
Development completion release candidate’dan önce mi?
Nexus/deploy core pipeline dışında mı?
```

## 7. Workpackage-004 — Policy and Evidence Schema

```yaml
id: WP-004
executor: Codex
title: Policy gate and evidence schema
objective: Policy ve evidence modelini makine-okunabilir schema/config haline getir.
inputs:
  - docs/ai-sdlc-factory/06-governance-policy-evidence.md
expected_outputs:
  - configs/ai-sdlc-factory/policies.yaml
  - configs/ai-sdlc-factory/evidence_schema.yaml
  - schemas/ai-sdlc-factory/evidence_item.schema.json
  - schemas/ai-sdlc-factory/policy_gate.schema.json
quality_gates:
  - no_self_approval_policy_present
  - evidence_required_policy_present
  - release_after_development_completion_policy_present
  - critical_security_zero_policy_present
forbidden_actions:
  - make_policy_advisory_only
  - omit_blocker_severity
```

Review criteria:

```text
Policy prompt’tan üstün mü?
Evidence graph requirement → release candidate zincirini kuruyor mu?
Trace ve evidence ayrımı net mi?
Risk acceptance kuralları yazılmış mı?
```

## 8. Workpackage-005 — Unified Documentation Assembly

```yaml
id: WP-005
executor: Antigravity
title: Blueprint assembly and visual tracking
objective: Tüm doküman, config, diagram ve workpackage çıktılarının izlenebilir tek haritasını üret.
inputs:
  - docs/ai-sdlc-factory/**
  - configs/ai-sdlc-factory/**
  - diagrams/ai-sdlc-factory/**
expected_outputs:
  - docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
  - docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
  - diagrams/ai-sdlc-factory/end_to_end_map.mmd
  - docs/ai-sdlc-factory/REVIEW_PACKET.md
quality_gates:
  - every_decision_has_document_reference
  - every_component_has_owner
  - every_stage_has_evidence
  - no_unresolved_duplicate_concept
forbidden_actions:
  - add_new_architecture_without_decision_log
  - reintroduce_plugin_core
```

Review criteria:

```text
Tüm dosyalar tek haritadan takip edilebiliyor mu?
Açık tartışma konuları ayrı listelenmiş mi?
Karar verilen konular ile tartışılacak konular karışmamış mı?
```

## 9. Workpackage-006 — Final Review Preparation

```yaml
id: WP-006
executor: Claude Code + Codex
mode: independent_parallel_review
title: Independent blueprint critique
objective: Blueprint’i iki farklı executor ile bağımsız eleştir.
inputs:
  - docs/ai-sdlc-factory/**
  - configs/ai-sdlc-factory/**
expected_outputs:
  - REVIEW_CLAUDE.md
  - REVIEW_CODEX.md
  - REVIEW_DIFF_SUMMARY.md
quality_gates:
  - duplicate_concepts_identified
  - missing_contracts_identified
  - skill_semantic_errors_identified
  - pipeline_policy_gaps_identified
```

Bu workpackage implementasyon değil, review içindir.

## 10. Executor genel yasakları

Tüm executor ortamları için yasaklar:

```text
main branch’e yazmak
merge yapmak
release yapmak
Nexus publish yapmak
production deploy yapmak
plugin registry eklemek
Team Lead sayısını artırmak
verification-loop’u readiness checklist yapmak
prism’i bug finding skill yapmak
skill script’lerini live çalıştırmak
```

## 11. Executor completion signal

Her executor işi bitirdiğinde şu formatta rapor üretir:

```yaml
workpackage_id:
executor:
status:
files_created:
files_modified:
gates_passed:
gates_failed:
assumptions:
open_questions:
risks:
needs_review:
```

## 12. Benim review checklist’im

Ben şu sorularla review edeceğim:

```text
Plugin geri sızmış mı?
Team runtime object olmuş mu?
Tek global Team Lead korunmuş mu?
Stage owner agent mı?
Sub-agent gerekçeleri var mı?
Skill semantic extraction yeterli mi?
Prism doğru bağlanmış mı?
Verification-loop doğru bağlanmış mı?
Policy blocker kuralları korunmuş mu?
Evidence graph var mı?
Publication/deploy core pipeline dışı mı?
```
