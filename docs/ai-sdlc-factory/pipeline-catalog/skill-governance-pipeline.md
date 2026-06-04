# Skill Governance Pipeline — Catalog Definition

Bu doküman, Nexus AI Orchestration Model altındaki **Skill Governance Pipeline** için katalog girişidir (Phase B / doc 16, Initial Pipeline Catalog).

Bu giriş `07-pipeline-contract-standard.md` bölüm 2'deki Pipeline Definition Contract'ı birebir takip eder. Pipeline, Nexus AI altındaki katalog girişlerinden biridir; üst yapı SDLC değil, Nexus AI Orchestration Model'dir.

Bağlam ve kilitli kararlar:

- Bu pipeline, skill paketlerinin keşfedilmesi, semantik olarak çıkarılması, script/reference güvenlik denetimi, misuse-warning üretimi, binding önerisi ve aktivasyon kararını yönetir.
- **Anti-pattern (engellenir): semantik çıkarım yapılmadan binding.** Skill semantic extraction her binding'den önce zorunludur (bkz. `03-skill-semantic-extraction.md` bölüm 7).
- **Locked skill semantics enforced:** `prism = brainstorming / divergence`, `verification-loop = bug / defect finding`. Bu pipeline başka skill'lerin semantiğini değiştiremez; yalnız kayıt altına alır ve doğrular.
- Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` agent değildir; ortak kabiliyet katmanıdır.
- `owner_agent` her stage için snake_case bir Agent rolüdür. `required_team_lead_role` pipeline'a özel bir `*_team_lead` rolüdür ve Supervisor değildir.
- Skill != Tool, Governance != Audit, Evidence != Trace ayrımları korunur.
- Plugin kapsam dışıdır ve hiçbir yerde yeniden tanımlanmaz.

---

## 1. Pipeline Definition Contract

Aşağıdaki YAML, `07-pipeline-contract-standard.md` bölüm 2 alanlarının tümünü, belirtilen sırayla içerir. Her `uses_*` alanı mevcuttur (boşsa `[]`).

```yaml
pipeline_id: skill_governance_pipeline
name: Skill Governance Pipeline
purpose: >
  Skill paketlerinin keşfi, zorunlu semantic extraction, script/reference güvenlik
  denetimi, misuse-warning üretimi, skill-stage binding önerisi, aktivasyon kararı ve
  deprecation/update yönetimini no-human governance ile yürütmek. Hiçbir skill,
  semantic extraction tamamlanmadan ve misuse-warning üretilmeden binding'e veya
  aktivasyona geçemez. prism = brainstorming, verification-loop = bug-finding olarak
  locked semantics enforce edilir.
version: draft-0.1
status: draft
owner_domain: skill_governance
required_team_type: skill_governance_team
required_team_lead_role: skill_governance_team_lead
applicable_domains:
  - skill_lifecycle
  - capability_registry
  - agent_skill_binding
  - skill_runtime_safety
  - shared_registry_maintenance
risk_profiles:
  - new_skill_intake
  - script_bearing_skill
  - high_privilege_skill
  - locked_semantics_skill
  - deprecation_or_update

stages:
  - skill_intake
  - skill_semantic_extraction
  - script_reference_audit
  - misuse_warning_generation
  - skill_binding_proposal
  - skill_activation_decision
  - skill_deprecation_update

uses_core_abilities:
  - Supervisor
  - Memory
  - OS
  - Coder
  - Web

uses_skills:
  - gap-audit
  - fmea
  - calibrate
  - llm-council
  - sentinel
  - prism
  - verification-loop

uses_tools:
  - skill_package_reader
  - skill_semantic_extractor
  - script_static_analyzer
  - reference_index_builder
  - skill_binding_proposer
  - artifact_writer
  - evidence_writer

uses_governance_profiles:
  - skill_governance_pipeline_governance
  - skill_semantic_required_gate
  - script_reference_audit_gate
  - misuse_warning_required_gate
  - skill_binding_proposal_gate
  - skill_activation_decision_gate
  - locked_semantics_enforcement_policy
  - no_self_approval_policy
  - evidence_required_policy

uses_audit_schemas:
  - skill_governance_evidence_schema
  - skill_semantic_extract_schema
  - script_audit_evidence_schema
  - skill_misuse_warning_schema
  - skill_binding_decision_schema
  - skill_governance_trace_schema

uses_model_provider_profiles:
  - skill_governance_reasoning_profile
  - skill_semantic_extraction_model
  - script_safety_analysis_model
  - supervisor_routing_model

uses_context_memory_profiles:
  - skill_governance_run_context
  - skill_semantic_context_pack
  - skill_registry_context_pack

entry_criteria:
  - SKILL_GOVERNANCE_RUN_GOAL present
  - SKILL_SOURCE_REFERENCE present (canonical_source or candidate package path/hash)
  - skill_governance_team assigned with skill_governance_team_lead

exit_criteria:
  - SKILL_SEMANTIC_EXTRACT produced and skill_semantic_required_gate passed
  - SCRIPT_REFERENCE_AUDIT_REPORT produced and script_reference_audit_gate passed
  - SKILL_MISUSE_WARNINGS produced and misuse_warning_required_gate passed
  - SKILL_BINDING_PROPOSAL produced (binding never precedes semantics)
  - SKILL_ACTIVATION_DECISION recorded (activate / hold / deprecate) via skill_activation_decision_gate
  - EVIDENCE and TRACE complete for every executed stage

blocking_conditions:
  - skill_semantics_unknown
  - binding_proposed_without_semantics
  - unsafe_skill_script_unmitigated
  - missing_misuse_warnings
  - locked_semantics_violation
  - self_approval_of_activation_decision

allowed_rework_routes:
  - skill_binding_proposal -> skill_semantic_extraction
  - misuse_warning_generation -> script_reference_audit
  - script_reference_audit -> skill_semantic_extraction
  - skill_activation_decision -> skill_binding_proposal
  - skill_semantic_extraction -> skill_intake

required_evidence:
  - SKILL_INVENTORY_ENTRY
  - SKILL_SEMANTIC_EXTRACT
  - SCRIPT_REFERENCE_AUDIT_REPORT
  - SKILL_REFERENCE_INDEX
  - SKILL_MISUSE_WARNINGS
  - SKILL_BINDING_PROPOSAL
  - SKILL_ACTIVATION_DECISION

required_trace:
  - skill_package_read_trace
  - skill_semantic_extraction_trace
  - script_static_analysis_trace
  - misuse_warning_generation_trace
  - skill_binding_proposal_trace
  - skill_activation_decision_trace
  - gate_evaluation_trace
```

---

## 2. Per-stage definitions

Her stage için: purpose, owner_agent (snake_case Agent rolü), key gates ve on_pass / on_fail routing belirtilir. Owner ve sub-agent rolleri `04-team-agent-subagent-model.md` bölüm 4.7'deki `skill_governance_team` kataloğundan gelir. Stage'ler `07-pipeline-contract-standard.md` bölüm 4 (Stage Contract) alanlarının özetlenmiş halidir.

### 2.1 skill_intake

- **purpose:** Aday skill paketini envantere alır, `canonical_source`, sürüm/hash ve risk profilini kaydeder. SKILL.md dışında `scripts/**`, `references/**`, `assets/**` ve metadata varlığını tespit eder (yalnız envanter; semantik henüz çıkarılmaz).
- **owner_agent:** `skill_librarian_agent`
- **key gates:** `skill_intake_inventory_complete` (advisory→blocker if package unreadable). Üretmesi gereken: `SKILL_INVENTORY_ENTRY`.
- **on_pass:** `skill_semantic_extraction`
- **on_fail:** rework `skill_intake` (paket okunamadı / canonical_source belirsiz)

### 2.2 skill_semantic_extraction

- **purpose:** Skill'in `primary_purpose`, `semantic_category`, `trigger_phrases`, `not_for`, `inputs/outputs`, `explicit/implicit_handoffs` ve ilk `misuse_warnings` taslağını çıkarır. **Bu stage zorunludur ve her binding'den önce gelmelidir.** `prism` yalnız brainstorming/divergence amacıyla (kategori/handoff seçenek alanını genişletmek için) kullanılır — karar vermez; `calibrate` confidence üretir. Locked semantics burada doğrulanır: `prism`=divergence, `verification-loop`=verification_defect_discovery olarak kaydedilmelidir.
- **owner_agent:** `skill_semantic_extractor_subagent` (parent: `skill_librarian_agent`)
- **key gates:** `skill_semantic_required_gate` (blocker) — `semantic_category`, `primary_purpose`, `not_for`, `used_by_agents`, `used_in_stages` ve `confidence >= threshold` üretilmeden geçilemez; `locked_semantics_enforcement_policy` (blocker) — prism/verification-loop semantiği değiştirilirse fail. Üretmesi gereken: `SKILL_SEMANTIC_EXTRACT`.
- **on_pass:** `script_reference_audit`
- **on_fail:** rework `skill_intake` (eksik envanter) veya stage içi yeniden çıkarım

### 2.3 script_reference_audit

- **purpose:** `scripts/**` ve `references/**` üzerinde statik güvenlik/yan-etki denetimi yapar; tehlikeli side-effect, gizli tool çağrısı, sandbox-dışı yürütme veya policy bypass riskini çıkarır. `verification-loop` burada **yalnız defect/bug-finding semantiğiyle** (script defect sweep) kullanılır; `fmea` ile script failure mode'ları çıkarılır. Reference dosyaları indekslenir (`SKILL_REFERENCE_INDEX`).
- **owner_agent:** `skill_runtime_safety_agent`
- **key gates:** `script_reference_audit_gate` (blocker) — `unsafe_skill_script_unmitigated` varsa fail; `reference_index_complete` (major). Üretmesi gereken: `SCRIPT_REFERENCE_AUDIT_REPORT`, `SKILL_REFERENCE_INDEX`.
- **on_pass:** `misuse_warning_generation`
- **on_fail:** rework `skill_semantic_extraction` (semantik yanlış okunmuş, side-effect beklenmeyen) veya stage içi mitigation talebi

### 2.4 misuse_warning_generation

- **purpose:** Semantik ve script denetimine dayanarak skill için açık `misuse_warnings` üretir (ör. "prism karar vermez", "verification-loop release garantisi değildir", "bu skill bug-finding için değildir"). Bu uyarılar binding ve aktivasyonun ön koşuludur. `sentinel` ile yanlış-kullanım senaryoları premortem edilir.
- **owner_agent:** `skill_runtime_safety_agent`
- **key gates:** `misuse_warning_required_gate` (blocker) — boş veya eksik misuse-warning ile geçilemez; her locked-semantics skill için en az bir `not_for` uyarısı zorunludur. Üretmesi gereken: `SKILL_MISUSE_WARNINGS`.
- **on_pass:** `skill_binding_proposal`
- **on_fail:** rework `script_reference_audit` (yeni risk bulgusu uyarı gerektiriyor)

### 2.5 skill_binding_proposal

- **purpose:** Skill'i hangi agent/sub-agent ve hangi stage'lere bağlanabileceğini önerir (`allowed_as_subskill_of`, `used_by_agents`, `used_in_stages`). **Semantik + script audit + misuse-warning tamamlanmadan binding önerilemez (anti-pattern: binding without semantics).** `prism` yalnız aday binding seçeneklerini çoğaltmak (divergence) için kullanılır; `llm-council` öneriyi çok-perspektifli inceler. Bu stage karar üretmez, **öneri** üretir.
- **owner_agent:** `skill_librarian_agent`
- **key gates:** `skill_binding_proposal_gate` (blocker) — `binding_proposed_without_semantics` ise fail (upstream semantic/audit/misuse evidence yoksa geçilemez). Üretmesi gereken: `SKILL_BINDING_PROPOSAL`.
- **on_pass:** `skill_activation_decision`
- **on_fail:** rework `skill_semantic_extraction` (semantik yetersiz, binding gerekçelendirilemiyor)

### 2.6 skill_activation_decision

- **purpose:** Skill'in aktive edileceğine, beklemeye alınacağına (hold) veya deprecate/update edileceğine dair kararı kaydeder. Karar evidence'a dayanır ve self-approval yapılamaz; öneren ile karar veren ayrışır (`no_self_approval_policy`).
- **owner_agent:** `skill_runtime_safety_agent` (review independence: `skill_librarian_agent`'ın önerisini onaylar/ret eder)
- **key gates:** `skill_activation_decision_gate` (blocker) — eksik evidence veya `self_approval_of_activation_decision` ile pass edilemez; `locked_semantics_enforcement_policy` (blocker) yeniden değerlendirilir. Üretmesi gereken: `SKILL_ACTIVATION_DECISION`.
- **on_pass:** `skill_deprecation_update` (lifecycle takibi) veya pipeline exit (activate kararı için exit_criteria sağlanır)
- **on_fail:** rework `skill_binding_proposal` (binding revize edilmeli)

### 2.7 skill_deprecation_update

- **purpose:** Mevcut/aktif skill'lerin deprecation veya sürüm güncellemesini yönetir; sürüm/hash değişiminde semantik yeniden doğrulama gerekip gerekmediğine karar verir ve registry tutarlılığını korur. Conditional stage: yalnız `risk_profiles` içinde `deprecation_or_update` aktifse veya `version_or_hash` değiştiyse çalışır.
- **owner_agent:** `skill_librarian_agent`
- **key gates:** `skill_deprecation_required_gate` (major) — sürüm/hash değiştiyse `skill_semantic_required_gate` yeniden tetiklenir; `conditional_required_when: deprecation_or_update == true or version_or_hash_changed == true`.
- **on_pass:** pipeline exit (lifecycle güncellendi)
- **on_fail:** rework `skill_semantic_extraction` (yeni sürüm yeniden semantik çıkarım gerektiriyor)

---

## 3. Required team / team-lead and governance + audit placeholders

### 3.1 Team ve team-lead

- **required_team_type:** `skill_governance_team` — `04-team-agent-subagent-model.md` bölüm 4.7'de tanımlıdır; pasif ownership/policy boundary'dir, runtime aktif nesne değildir.
- **required_team_lead_role:** `skill_governance_team_lead` — bu pipeline'a özel bir `*_team_lead` rolüdür. Supervisor Core Ability'si **değildir** ve onun yerine geçmez (D-006). Team Lead skill aktivasyon kararını koordine eder ama blocker gate bypass edemez ve aktivasyon kararını tek başına self-approve edemez.
- Stage owner agent'ları (snake_case): `skill_librarian_agent` (owner agent), `skill_semantic_extractor_subagent` (parent: skill_librarian_agent), `skill_runtime_safety_agent` (review independence + activation decision).

### 3.2 Governance placeholders (Governance != Audit)

Bu pipeline aşağıdaki governance profillerini referanslar; yeni tanımlananlar Phase C (registry) ve Phase E (governance) için aşağıda open_questions altında flag'lenmiştir:

- `skill_governance_pipeline_governance` — pipeline seviyesi politika.
- `skill_semantic_required_gate` — semantik çıkarım olmadan ilerleme yok.
- `script_reference_audit_gate` — unsafe script mitigasyonsuz geçemez.
- `misuse_warning_required_gate` — misuse-warning olmadan binding/aktivasyon yok.
- `skill_binding_proposal_gate` — binding without semantics engellenir.
- `skill_activation_decision_gate` — evidence'lı, self-approval'sız karar.
- `locked_semantics_enforcement_policy` — prism=brainstorming, verification-loop=bug-finding korunur.
- `no_self_approval_policy`, `evidence_required_policy` — global/paylaşılan politikalar (önceden tanımlı ailelerle uyumlu).

### 3.3 Audit placeholders (Evidence != Trace)

Audit ailesi Evidence ve Trace'i ayrı tutar. Bu pipeline aşağıdaki audit şemalarını referanslar (yeni olanlar flag'li):

- Evidence şemaları: `skill_governance_evidence_schema`, `skill_semantic_extract_schema`, `script_audit_evidence_schema`, `skill_misuse_warning_schema`, `skill_binding_decision_schema`.
- Trace şeması: `skill_governance_trace_schema` (skill_package_read / semantic_extraction / script_static_analysis / misuse_warning / binding_proposal / activation_decision / gate_evaluation trace'leri).

### 3.4 Shared Registry + Usage Mapping notu

Yukarıdaki tüm `uses_*` öğeleri Shared Registry'de mevcut sayılır ve burada (pipeline kullanım bağlamında) tekrar gösterilmiştir (`05-shared-registry-and-usage-mapping.md` bölüm 1). Bu tekrar sahiplik değil, kullanım ilişkisidir. SDLC Pipeline yeniden üretilmemiştir; yalnız contract standardı ve skill_governance_team kataloğu referans alınmıştır.
