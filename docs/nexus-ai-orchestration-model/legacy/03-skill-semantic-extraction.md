# 03 — Skill Semantic Extraction

Bu doküman, skill paketlerinin pipeline’a bağlanmadan önce nasıl okunacağını ve semantik olarak nasıl sınıflandırılacağını tanımlar.

Bu aşama zorunludur. Çünkü skill’in amacı yanlış okunursa bütün agent/pipeline kurgusu yanlış bağlanır.

## 1. Neden zorunlu?

Daha önce iki kritik semantik hata riski oluştu:

```text
prism → standalone intake/readiness skill gibi yorumlandı
verification-loop → genel readiness checklist gibi yorumlandı
```

Doğru yorum:

```text
prism = brainstorming / divergent thinking skill
verification-loop = bug / defect finding skill
```

Bu bilgi skill dosyalarından çıkarılabilirdi. Bu yüzden bundan sonra her skill için önce semantic extraction yapılmadan hiçbir bağlama yapılmayacak.

## 2. Okunacak dosyalar

Her skill için şu dosyalar tek tek incelenir:

```text
SKILL.md
scripts/**
references/**
assets/**
README / metadata / frontmatter / yardımcı dosyalar
```

Sadece `SKILL.md` okumak yeterli değildir. Script ve reference dosyaları skill’in gerçek kullanım amacını, handoff ilişkisini ve yan etkilerini gösterebilir.

## 3. Çıkarılacak zorunlu alanlar

Her skill için şu kayıt üretilir:

```yaml
skill_id:
canonical_source:
version_or_hash:
primary_purpose:
semantic_category:
trigger_phrases:
used_by_agents:
used_in_stages:
allowed_as_subskill_of:
not_for:
inputs:
outputs:
scripts:
references:
assets:
side_effects:
required_tools:
risk_level:
misuse_warnings:
explicit_handoffs:
implicit_handoffs:
evidence_files_read:
confidence:
open_questions:
```

## 4. Semantik kategoriler

Başlangıç kategorileri:

```text
divergence
multi_perspective_review
premortem_risk
verification_defect_discovery
failure_mode_analysis
architecture_decision
completeness_audit
intent_fidelity
editing_refinement
skill_governance
confidence_calibration
belief_update
learning_refraction
argument_analysis
counterargument_strengthening
problem_decomposition
```

## 5. Mevcut kritik skill semantik kararları

### prism

```yaml
skill_id: prism
semantic_category: divergence
primary_purpose: brainstorming / ideation / divergent thinking
used_by_agents:
  - requirements_agent
  - architecture_agent
  - llm_council_agent
  - security_risk_agent
allowed_as_subskill_of:
  - llm-council
  - sentinel
not_for:
  - bug_finding
  - final_release_approval
  - general_readiness_gate
misuse_warnings:
  - Prism karar vermez; seçenek alanını genişletir.
  - Prism bug finding skill’i değildir.
  - Prism tek başına release gate değildir.
```

### verification-loop

```yaml
skill_id: verification-loop
semantic_category: verification_defect_discovery
primary_purpose: bug / defect finding and verification sweep
used_by_agents:
  - qa_lead_agent
  - bug_hunter_subagent
  - code_reviewer_agent
used_in_stages:
  - verification_loop_bug_finding
  - post_fix_regression_review
not_for:
  - ideation
  - architecture brainstorming
  - general project readiness only
misuse_warnings:
  - Verification-loop test runner’ın yerine geçmez.
  - Verification-loop genel release checklist değildir.
  - Verification-loop bug-free garantisi vermez; residual risk üretir.
```

### sentinel

```yaml
skill_id: sentinel
semantic_category: premortem_risk
primary_purpose: decision stress test / premortem / adversarial foresight
allowed_subskills:
  - prism
used_in_stages:
  - architecture_review
  - security_privacy_design
  - premortem_fmea
  - release_candidate_review
not_for:
  - implementation
  - final approval by itself
```

### llm-council

```yaml
skill_id: llm-council
semantic_category: multi_perspective_review
primary_purpose: multi-perspective decision review and verdict synthesis
allowed_subskills:
  - prism
used_in_stages:
  - council_review
  - architecture_review
  - release_candidate_review
not_for:
  - direct code execution
  - policy bypass
```

## 6. Skill dependency graph

Önerilen temel ilişki:

```text
prism
  ├── used_by: llm-council
  ├── used_by: sentinel
  ├── used_by: requirements exploration
  └── used_by: architecture option generation

llm-council
  └── may_call: prism before decision review

sentinel
  └── may_call: prism during premortem / mirror / counterfactual phases

verification-loop
  └── runs_after: test_execution + code_review
```

## 7. Skill bağlama kuralı

Bir skill pipeline’a ancak şu koşullar sağlanırsa bağlanabilir:

```text
semantic_category belirlenmiş
primary_purpose belirlenmiş
not_for alanı yazılmış
used_by_agents belirlenmiş
used_in_stages belirlenmiş
scripts/reference/assets envanteri çıkarılmış
misuse_warnings yazılmış
confidence >= agreed_threshold
```

## 8. Skill okuma kabul kriterleri

Semantic extraction doğru sayılırsa:

```text
SKILL.md okunmuş olmalı
scripts/ varsa listelenmiş olmalı
references/ varsa başlık ve amaçları çıkarılmış olmalı
assets/ varsa listelenmiş olmalı
trigger ve anti-trigger yazılmış olmalı
skill-agent-stage bağlama gerekçeli olmalı
misuse warning bulunmalı
kaynak dosya hash veya path bilgisi tutulmalı
```

## 9. Çıktılar

Bu stage sonunda şu dosyalar üretilir:

```text
SKILL_SEMANTIC_CATALOG.yaml
SKILL_SCRIPT_INVENTORY.yaml
SKILL_REFERENCE_INDEX.yaml
SKILL_DEPENDENCY_GRAPH.mmd
SKILL_MISUSE_WARNINGS.md
SKILL_STAGE_BINDING_PROPOSAL.yaml
```

## 10. Open questions

Tartışma için açık noktalar:

```text
Skill semantic extraction ayrı sub-agent tarafından mı yapılmalı?
Skill Librarian Agent mı owner olmalı?
Skill Runtime Safety Agent bu aşamada mı devreye girmeli?
Prism sadece subskill mi kalmalı, yoksa requirements/architecture exploration aşamasında doğrudan da kullanılmalı mı?
```

Benim önerim:

```text
Owner: skill_librarian_agent
Sub-agent: skill_semantic_extractor_subagent
Reviewer: skill_runtime_safety_agent + team_lead_orchestrator
```