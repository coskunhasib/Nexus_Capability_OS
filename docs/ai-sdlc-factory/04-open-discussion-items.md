# 04 — Open Discussion Items

Bu doküman hâlâ tartışılması gereken konuları listeler.

## 1. Pipeline Catalog kapsamı

İlk katalogda hangi pipeline’lar bulunmalı?

Önerilen başlangıç:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
```

Açık soru:

```text
Content Pipeline ve Data/Knowledge Pipeline ilk katalogda olmalı mı?
```

## 2. Team zorunluluğu

Her pipeline run için team gerekli mi?

Öneri:

```text
Karmaşık pipeline run team gerektirir.
Basit pipeline run doğrudan daha az rolle çalışabilir.
```

Açık soru:

```text
Team gerektirme eşiği nasıl tanımlanacak?
```

## 3. Direct Sub-agent kuralı

Sub-agent çoğunlukla agent altında olmalı.

Ama bazı sub-agent’lar Team Lead tarafından doğrudan çağrılabilir.

Açık soru:

```text
Direct Sub-agent hangi durumlarda izinli olacak?
```

## 4. Core Abilities erişimi

Team Lead, Agent ve Sub-agent Core Abilities kullanabilir.

Açık soru:

```text
Core Ability erişimi pipeline/team/role bazlı permission ile mi sınırlandırılacak?
```

## 5. Skill Governance owner’ı

Skill semantiği, skill misuse ve skill binding’i kim yönetecek?

Öneri:

```text
Skill Governance, ayrı bir governance alanı olarak kalmalı.
```

Açık soru:

```text
Skill Governance bir team mi, yoksa governance layer içinde owner alanı mı olmalı?
```

## 6. SDLC Team Lead yetki sınırı

SDLC Team Lead pipeline’ı yönetir ama policy bypass edemez.

Açık soru:

```text
SDLC Team Lead hangi stage’lerde direct sub-agent çağırabilir?
```

## 7. Evidence graph formatı

Açık soru:

```text
İlk format JSON graph + Markdown traceability matrix mi olmalı?
```

## 8. Pipeline-specific governance formatı

Her pipeline kendi governance setine sahip olabilir.

Açık soru:

```text
Governance tanımları tek registry altında mı olmalı, yoksa pipeline klasörleri altında mı tutulmalı?
```

## 9. LLM_Calismalari referans rolü

`LLM_Calismalari` referans repo olarak kalacak.

Açık soru:

```text
Oradaki refactor pushlandıktan sonra bu blueprint hangi noktaları yeniden gözden geçirmeli?
```

## 10. Bir sonraki tartışma başlığı

Önerilen sıradaki tartışma:

```text
Pipeline Catalog ve Pipeline Run sözleşmesi nasıl tanımlanmalı?
```
