# Pipeline Catalog — Nexus AI Orchestration Model

Bu klasör, **Nexus AI Orchestration Model** altındaki pipeline türlerinin katalog dizinidir.

Üst yapı **AI SDLC Factory değil**, **Nexus AI Orchestration Model**'dir. SDLC, bu modelin altındaki pipeline türlerinden yalnızca biridir. Her pipeline, kataloğun bir girdisidir (one catalog entry per pipeline).

> Bu klasör dokümantasyon/blueprint alanıdır. Runtime kodu, connector, deploy veya merge içermez. Pipeline definition (tanım) ile pipeline run (çalışma örneği) ayrıdır; burada yalnızca pipeline definition'lar kataloglanır.

> **⚠️ SUPERSEDED (2026-06-13).** Bu klasördeki markdown definition'lar **artık authoritative değildir** — taslak dönemi metinleridir. Her pipeline'ın authoritative tanımı makine-okunabilir YAML'dadır: `configs/nexus-ai/<pipeline>.yaml` + `stages/<pipeline>/*.yaml`. Authoritative özet katalog: `configs/nexus-ai/pipeline_catalog.yaml`. Profesyonel-grade geçişte 5 pipeline genişletildi ve **7.** olarak `product_discovery_pipeline` eklendi; aşağıdaki tablo bu yeni gerçeğe göre güncellendi.

## 1. Kataloğun amacı

Pipeline Catalog şu soruyu cevaplar:

```text
Nexus AI içinde hangi tanımlı pipeline türleri vardır?
```

Pipeline Catalog:

- Her pipeline türünü tek bir katalog girdisi olarak listeler.
- Her pipeline'ın hangi shared öğeleri (Core Abilities, Skills, Tools, Governance Profiles, Audit Schemas, Model / Provider Profiles, Context / Memory Profiles) kullandığını **Usage Mapping** ile referanslar.
- Her pipeline'ın kendi tanım dokümanına bağlanır.

Pipeline Catalog bir **pipeline run** değildir. Run, bir pipeline şablonunun gerçek çalışma örneğidir ve ayrı olarak (Pipeline Run Contract) tutulur.

## 2. Contract standardı referansı

Bu katalogdaki **tüm** pipeline'lar tek bir tekrar kullanılabilir sözleşme standardını izler:

- [`../07-pipeline-contract-standard.md`](../07-pipeline-contract-standard.md) — Pipeline Contract Standard

Pipeline Definition Contract zorunlu alanları (sıralı, `07` §2):

```text
pipeline_id
name
purpose
version
status
owner_domain
required_team_type
required_team_lead_role
applicable_domains
risk_profiles
stages
uses_core_abilities
uses_skills
uses_tools
uses_governance_profiles
uses_audit_schemas
uses_model_provider_profiles
uses_context_memory_profiles
entry_criteria
exit_criteria
blocking_conditions
allowed_rework_routes
required_evidence
required_trace
```

Kurallar (`07` §5, §14, §15 ve kilitli kararlar):

- Her `uses_*` alanı **mevcut** olmalıdır; boşsa `[]` olarak görünür (Shared Registry + Usage Mapping kuralı).
- Her pipeline `required_team_type` ve `required_team_lead_role` alanlarını açıkça belirtir.
- `required_team_lead_role`, pipeline'a özel bir `*_team_lead` rolüdür. **Supervisor bir Core Ability'dir ve team lead değildir.**
- Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` **agent değildir**; pipeline'lar bunları yalnızca `uses_core_abilities` altında kullanır.
- Kavram sınırları korunur: `Skill != Tool`, `Governance != Audit`, `Evidence != Trace`, `Registry != Usage`. Plugin yoktur.
- Doğru yaklaşım: `shared standard + pipeline-specific specialization`. SDLC formatı diğer pipeline'lara körlemesine kopyalanmaz.

## 3. Katalog (7 pipeline)

Aşağıdaki tablo güncel katalogdur (authoritative: `configs/nexus-ai/pipeline_catalog.yaml`). Stage sayıları profesyonel-grade geçiş sonrası **makine-okunabilir YAML def'lerinden** alınmıştır; Definition doc sütunu artık YAML'ı işaret eder.

| Pipeline | Status | Purpose (özet) | Team requirement (`required_team_type` / `required_team_lead_role`) | Stage count | Definition doc (authoritative) |
| --- | --- | --- | --- | --- | --- |
| **SDLC Pipeline** | reference (stable) | Sıfırdan ürün seviyesine yazılım geliştirmeyi no-human governance ile yürütmek. | `sdlc_team` / `sdlc_team_lead` | 31 | `configs/nexus-ai/sdlc_pipeline.yaml` + `stages/sdlc/` |
| **Product Discovery Pipeline** | draft | Ham fikri kill-friendly keşiften GO/NO_GO kararına götürmek; GO'da sdlc'ye PRODUCT_BRIEF devri (sdlc'nin ön-aşaması). NO_GO şerefli terminal. | `discovery_team` / `discovery_team_lead` | 7 | `configs/nexus-ai/product_discovery_pipeline.yaml` + `stages/product-discovery/` |
| **Research Pipeline** | draft | Kaynaklı araştırma, kaynak güvenilirliği, claim/evidence mapping ve belirsizlik raporu üretmek. | `research_team` / `research_team_lead` | 11 | `configs/nexus-ai/research_pipeline.yaml` + `stages/research/` |
| **Activation Pipeline** | draft | Özellik / capability / pipeline aktivasyonunu staged (preview → pilot → public) şekilde yönetmek. | `activation_team` / `activation_team_lead` | 8 | `configs/nexus-ai/activation_pipeline.yaml` + `stages/activation/` |
| **Operations Pipeline** | draft | Incident, monitoring, runbook, rollback, postmortem ve operational learning yönetmek. | `operations_team` / `operations_team_lead` | 7 | `configs/nexus-ai/operations_pipeline.yaml` + `stages/operations/` |
| **Skill Governance Pipeline** | draft | Skill keşfi, semantic extraction, safety audit, binding, deprecation ve update yönetmek. | `skill_governance_team` / `skill_governance_team_lead` | 8 | `configs/nexus-ai/skill_governance_pipeline.yaml` + `stages/skill-governance/` |
| **Knowledge / Memory Pipeline** | draft | Memory ingestion, summarization, validity, expiration, retrieval profile ve context pack yönetmek. | `knowledge_team` / `knowledge_team_lead` | 7 | `configs/nexus-ai/knowledge_memory_pipeline.yaml` + `stages/knowledge-memory/` |

Notlar:

- **Status**: SDLC dışındaki 5 pipeline'ın definition'ı bu fazda `draft` statüsündedir. SDLC referans pipeline olduğu için ayrı tutulur (aşağıya bakınız).
- **Stage count**: Research / Activation / Knowledge-Memory / Skill Governance için stage sayıları ilgili definition doc'larından (bu fazda yazılan `research-pipeline.md`, `activation-pipeline.md`, `knowledge-memory-pipeline.md`, `skill-governance-pipeline.md`) alınmıştır. Skill Governance, definition doc'u yazıldığında 7 stage olarak kesinleşmiştir (`skill_intake` … `skill_deprecation_update`); §1 + §2.1–2.7. Operations için stage sayısı `16-pipeline-catalog-expansion-plan.md` §7'deki draft scope listesinden (6 stage) türetilmiştir ve ilgili definition doc yazıldığında kesinleşir. Activation ve Research, `16` §5–§6'daki draft scope'a göre intake/completion bookend stage'leri eklediği için daha yüksek stage sayısına sahiptir.
- **Definition doc bağlantıları** (`research-pipeline.md` … `knowledge-memory-pipeline.md`), `16-pipeline-catalog-expansion-plan.md` §10'da tanımlı çıktı dosyalarıdır ve bu Pipeline Catalog Expansion fazında ayrı sub-task'larda üretilir. `operations-pipeline.md` ve `skill-governance-pipeline.md` henüz yazılmamış olabilir (forward reference).
- **Team requirement**: SDLC dışındaki tüm `*_team` / `*_team_lead` rol adları bu faz tarafından önerilmiş yeni adlardır ve registry/governance fazlarında (C / E) onaylanmak üzere open question olarak işaretlenmiştir. Hiçbiri Supervisor değildir.

## 4. SDLC referans / en olgun pipeline

**SDLC Pipeline**, contract standardının (`07`) çıktığı ve en eksiksiz tanımlanmış pipeline'dır. Diğer pipeline'lar için referans örnektir.

SDLC zaten tamamlanmıştır ve bu fazda **yeniden üretilmez** — yalnızca referans verilir. SDLC tanımı şurada bulunur:

- [`../08-sdlc-pipeline-contract.md`](../../pipelines/sdlc/08-sdlc-pipeline-contract.md) — SDLC Pipeline Definition (uygulanmış contract)
- [`../../../configs/nexus-ai/stages/sdlc/`](../../../../configs/nexus-ai/stages/sdlc/README.md) — 31 stage için makine-okunabilir per-stage contract dosyaları (`01-intake.yaml` … `31-refraction-learning.yaml`)

Tamamlayıcı SDLC referansları:

- [`../sdlc-stages/`](../../pipelines/sdlc/sdlc-stages/README.md) — okunabilir stage sözleşmeleri (parçalara ayrılmış)
- [`../06-sdlc-coverage-gap-audit.md`](../../pipelines/sdlc/06-sdlc-coverage-gap-audit.md), [`../06a-sdlc-mandatory-gates-decision.md`](../../pipelines/sdlc/06a-sdlc-mandatory-gates-decision.md), [`../06b-sdlc-agentic-safety-and-remaining-gates.md`](../../pipelines/sdlc/06b-sdlc-agentic-safety-and-remaining-gates.md) — kapsam ve mandatory gate kararları

> SDLC'nin contract'ı bu katalogdaki tüm `draft` pipeline'lar için kalite çıtasıdır: deterministik stage graph, owner agent (snake_case Agent rolü) + pipeline'a özel `*_team_lead`, görünür gate / pass / fail / rework route, ve eksiksiz Shared Registry + Usage Mapping.

## 5. Aday / gelecek pipeline'lar (candidate / future)

Aşağıdaki pipeline'lar henüz katalog girdisi değildir; aday olarak izlenir (`16-pipeline-catalog-expansion-plan.md` §3 *Aday / sonraki pipeline'lar*). Bunlar yazıldığında aynı `07` contract standardını izleyecek, kendi `*_team` / `*_team_lead` rollerini tanımlayacak ve plugin içermeyecektir.

- **Content Pipeline** — içerik üretimi, redaksiyon ve yayın-öncesi gate'ler.
- **Data Processing Pipeline** — veri ingestion, dönüşüm, kalite ve şema doğrulama.
- **Model / Inference Pipeline** — model seçimi, eval, inference profili ve maliyet yönetimi.
- **Customer Support Pipeline** — destek talebi intake, triage, çözüm ve eskalasyon.
- **Business / Strategy Pipeline** — strateji, karar ve iş seviyesi planlama akışları.

## 6. İlgili dokümanlar

- [`../07-pipeline-contract-standard.md`](../07-pipeline-contract-standard.md) — Pipeline Contract Standard (tüm pipeline'lar için zorunlu)
- [`../05-pipeline-model.md`](../05-pipeline-model.md) — Pipeline modeli (stage graph ilkeleri)
- [`../05-shared-registry-and-usage-mapping.md`](../05-shared-registry-and-usage-mapping.md) — Shared Registry + Usage Mapping kuralı
- [`../01-nexus-ai-operating-model.md`](../../01-nexus-ai-operating-model.md) — Nexus AI Orchestration Model (üst yapı)
- [`../16-pipeline-catalog-expansion-plan.md`](../16-pipeline-catalog-expansion-plan.md) — Pipeline Catalog Expansion planı (bu kataloğun kaynağı)
