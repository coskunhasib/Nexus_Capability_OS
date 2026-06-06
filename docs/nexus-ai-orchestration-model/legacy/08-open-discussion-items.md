# 08 — Açık Tartışma Konuları

Bu doküman, henüz kesinleştirilmeden tartışılması gereken mimari kararları listeler.

Kodlama, runtime, connector, Nexus veya deploy işlerine geçmeden önce bu konular netleşmelidir.

## 1. Team yapısı pasif boundary olarak kalacak mı?

### Önerilen karar

```text
Evet. Team aktif runtime object olmayacak.
```

### Gerekçe

Team’in çalışması gereksiz soyutlama yaratır. Çalışan birim agent’tır.

Doğru model:

```text
Team = ownership / policy / review boundary
Agent = çalışan rol
```

### Risk

Team aktif hale getirilirse:

```text
Team Lead çoğalması olur.
Sorumluluk bulanıklaşır.
Stage owner kim belirsizleşir.
Policy ownership ile runtime behavior karışır.
```

### Tartışma sorusu

```text
Team’i tamamen pasif boundary olarak kilitliyor muyuz?
```

Benim önerim: **evet**.

## 2. Tek global Team Lead yeterli mi?

### Önerilen karar

```text
Evet. Tek global Team Lead / Orchestrator olacak.
```

Stage owner agent’lar alan liderliği sağlar:

```text
architecture_agent = architecture stage owner
security_architect_agent = security stage owner
qa_lead_agent = verification stage owner
release_manager_agent = release candidate stage owner
```

### Neden ayrı team lead yok?

Ayrı lead’ler şu tekrarları yaratır:

```text
architecture_team_lead_agent ≈ architecture_agent
security_team_lead_agent ≈ security_architect_agent
qa_team_lead_agent ≈ qa_lead_agent
release_team_lead_agent ≈ release_manager_agent
```

### Tartışma sorusu

```text
Tek global Team Lead + stage owner agent modeli yeterli mi?
```

Benim önerim: **evet**.

## 3. Sub-agent sayısı nasıl sınırlandırılacak?

### Önerilen karar

Sub-agent açmak için aşağıdaki kriterlerden en az ikisi sağlanmalı:

```text
ayrı context gerekiyor
ayrı tool permission gerekiyor
paralel çalışabilir
çıktısı ayrı doğrulanabilir
tekrarlanan uzmanlık işi
ana agent context’ini kirletir
```

### Tartışma sorusu

```text
Bu kriterleri policy’ye bağlayalım mı?
```

Benim önerim: **evet**. Sub-agent patlamasını engellemek için zorunlu kural olmalı.

## 4. Skill Semantic Extraction ayrı stage olarak kalmalı mı?

### Önerilen karar

```text
Evet. Ayrı ve blocker stage olmalı.
```

### Gerekçe

Prism ve verification-loop örneği gösterdi ki, skill yanlış okunursa bütün pipeline yanlış bağlanabilir.

### Zorunlu çıktılar

```text
SKILL_SEMANTIC_CATALOG.yaml
SKILL_SCRIPT_INVENTORY.yaml
SKILL_REFERENCE_INDEX.yaml
SKILL_MISUSE_WARNINGS.md
SKILL_DEPENDENCY_GRAPH.mmd
```

### Tartışma sorusu

```text
Skill semantic extraction tamamlanmadan requirements stage’e geçiş bloklansın mı?
```

Benim önerim: **evet**.

## 5. Prism doğrudan stage skill’i olarak da kullanılmalı mı?

Prism için iki kullanım var:

```text
1. Sub-skill olarak llm-council ve sentinel içinde kullanım
2. Direct skill olarak requirements / architecture exploration’da kullanım
```

### Önerilen karar

```text
Prism hem sub-skill hem direct exploration skill olarak kullanılabilir.
```

Ama misuse warning zorunlu:

```text
Prism karar vermez.
Prism bug finding yapmaz.
Prism release readiness gate değildir.
```

### Tartışma sorusu

```text
Prism direct kullanımını requirements ve architecture ile sınırlayalım mı?
```

Benim önerim: **evet**.

## 6. Verification-loop sadece bug finding stage’inde mi çalışmalı?

### Önerilen karar

```text
Ana kullanımı verification_loop_bug_finding stage olmalı.
```

İkincil kullanım:

```text
code_review sırasında defect lens olarak kullanılabilir
post_fix_regression_review sırasında kullanılabilir
```

Ama şu yasak:

```text
verification-loop genel readiness checklist değildir
verification-loop test_runner yerine geçmez
verification-loop bug-free garantisi vermez
```

### Tartışma sorusu

```text
Verification-loop code_review içinde yardımcı skill olarak da kalsın mı?
```

Benim önerim: **evet, ama ana gate bug_finding stage’de olsun**.

## 7. Performance stage her domain için blocker mı olmalı?

### Seçenekler

```text
A) Her domain’de blocker
B) Risk profiline göre blocker/advisory
C) Sadece latency/resource-sensitive ürünlerde blocker
```

### Önerilen karar

```text
Risk profiline göre değişsin.
```

Örnek:

```text
web_saas: p95 latency ve load smoke blocker olabilir
internal_tool: advisory olabilir
embedded_edge: latency/resource blocker olmalı
ai_inference: GPU/VRAM/latency blocker olmalı
regulated_high_risk: domain metric blocker olmalı
```

### Tartışma sorusu

```text
Performance gate policy’si domain profile’a mı bağlansın?
```

Benim önerim: **evet**.

## 8. Major bug threshold ne olmalı?

### Seçenekler

```text
A) Major bug threshold her zaman 0
B) Risk profiline göre değişir
C) Major bug release’i bloklamaz ama residual risk ister
```

### Önerilen karar

```text
Blocker bug her zaman 0.
Major bug threshold risk profiline göre değişir.
```

Örnek:

```text
regulated_high_risk: major bug threshold = 0
commercial_product: major bug threshold = 0 veya explicit acceptance
prototype: explicit acceptance ile geçebilir
```

### Tartışma sorusu

```text
Commercial product için major bug threshold 0 mı olsun?
```

Benim önerim: **evet, production candidate için 0**.

## 9. Memory Curator tam çekirdekte kalmalı mı?

### Seçenekler

```text
A) Core içinde kalsın
B) Opsiyonel learning stage olsun
C) Tamamen sonra ele alınsın
```

### Önerilen karar

```text
Core içinde kalsın ama release’i bloklamasın.
```

### Gerekçe

No-human sistemin kendini iyileştirmesi için learning/refraction loop gerekir. Ama release candidate için blocker olmamalıdır.

### Tartışma sorusu

```text
Refraction/Learning stage advisory mi olsun?
```

Benim önerim: **evet**.

## 10. Evidence graph formatı ne olmalı?

### Seçenekler

```text
A) Basit JSON graph
B) JSON-LD benzeri graph
C) Markdown traceability matrix + JSON evidence item
```

### Önerilen karar

```text
Başlangıçta JSON graph + Markdown traceability matrix.
```

### Gerekçe

JSON-LD güçlü ama erken karmaşıklık yaratabilir. Makine-okunabilir JSON graph ve insan-okunabilir Markdown yeterli olur.

### Tartışma sorusu

```text
Evidence graph için ilk format JSON graph olarak kilitlensin mi?
```

Benim önerim: **evet**.

## 11. Tool registry çekirdekte ne kadar detaylı olmalı?

Plugin çıkıyor ama tool kalıyor.

### Önerilen karar

Tool registry core’da şu seviyede olmalı:

```text
tool id
purpose
input schema
output schema
side effects
allowed agents
forbidden agents
risk level
requires sandbox
requires policy gate
```

### Tartışma sorusu

```text
Tool registry hemen machine-readable YAML olarak hazırlanmalı mı?
```

Benim önerim: **evet**.

## 12. Executor ortamları nasıl sınırlandırılmalı?

### Önerilen karar

Codex / Claude Code / Antigravity sadece workpackage uygular.

Yapamazlar:

```text
mimari karar değiştirmek
plugin geri eklemek
team lead çoğaltmak
merge etmek
release yapmak
Nexus publish yapmak
production deploy yapmak
```

### Tartışma sorusu

```text
Executor’lara read/write izinleri workpackage bazında mı verilsin?
```

Benim önerim: **evet**.

## 13. Domain profile stage ne kadar detaylı olmalı?

### Önerilen karar

Domain/risk profile stage core içinde kalmalı.

Temel boyutlar:

```text
data_sensitivity
security_exposure
financial_impact
safety_impact
availability_requirement
performance_requirement
regulatory_requirement
deployment_target
autonomy_level
```

### Tartışma sorusu

```text
Domain profile output’u pipeline stage/gate seçimini otomatik değiştirsin mi?
```

Benim önerim: **evet**.

## 14. Tartışma öncelik sırası

Önce tartışılması gerekenler:

```text
1. Team pasif boundary mi?
2. Tek global Team Lead mi?
3. Sub-agent açma kriterleri yeterli mi?
4. Skill Semantic Extraction blocker mı?
5. Prism direct kullanım sınırı ne?
6. Verification-loop code_review içinde yardımcı skill olarak kalsın mı?
7. Performance/major bug thresholds risk profiline göre mi?
```

## 15. Şu an kilitlemeye hazır kararlar

Benim kilitlemeye hazır gördüğüm kararlar:

```text
Plugin yok.
Team pasif boundary.
Tek global Team Lead.
Skill ≠ Agent.
Tool ≠ Skill.
Pipeline deterministic graph.
Policy prompt’tan üstün.
Evidence zorunlu.
Nexus/deploy core dışında.
Prism = brainstorming.
Verification-loop = bug finding.
```
