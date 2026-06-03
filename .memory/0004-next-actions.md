# 0004 — Next Actions

Bu dosya, mevcut tartışmanın sıradaki işlerini repo-safe hafıza olarak tutar.

## Öncelik 1 — SDLC coverage audit

Kullanıcı özellikle SDLC tarafında hiçbir eksik kalmamasını istedi.

Bu nedenle sıradaki ana iş:

```text
SDLC Pipeline Coverage / Gap Audit
```

Audit şunları kontrol etmeli:

```text
SDLC stage listesi eksiksiz mi?
Her stage owner/team/agent ihtiyacı tanımlı mı?
Her stage hangi Core Abilities kullanıyor?
Her stage hangi Skills kullanıyor?
Her stage hangi Tools kullanıyor?
Her stage hangi Governance Profiles kullanıyor?
Her stage hangi Audit Schemas / Evidence üretiyor?
Her stage hangi Model / Provider Profiles kullanıyor?
Her stage hangi Context / Memory Profiles kullanıyor?
Her stage için pass/fail/rework route var mı?
Her stage için no-human governance gate var mı?
```

## Öncelik 2 — Pipeline Catalog ve Pipeline Run sözleşmesi

SDLC coverage audit sonrası Pipeline Catalog ve Pipeline Run sözleşmesi ayrıntılandırılmalı.

Beklenen çıktılar:

```text
pipeline_catalog_contract
pipeline_run_contract
pipeline_stage_contract
usage_mapping_template
```

## Öncelik 3 — SDLC Pipeline detay modeli

SDLC Pipeline için her stage ayrı ayrı kullanım haritasına bağlanmalı.

Gerekli kullanım kategorileri:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

## Öncelik 4 — Team / Agent / Sub-agent kataloğu

Pipeline sözleşmesi ve SDLC coverage audit tamamlanmadan agent/sub-agent kataloğuna geçilmemeli.

## Öncelik 5 — Executor workpackages

Codex / Claude Code / Antigravity iş paketleri, ancak yukarıdaki sözleşmeler netleşince hazırlanmalı.

## Repo çalışma alanı

Ana çalışma alanı:

```text
coskunhasib/Nexus_Capability_OS:nexus
```

Referans repo:

```text
coskunhasib/LLM_Calismalari
```

## Uygulama yasağı

Şu aşamada kod/runtime/refactor yapılmaz.

Sadece dokümantasyon, kavram netleştirme, audit ve planlama yapılır.
