# 0001 — Session Summary

Bu dosya, mevcut sohbetin repo-safe özet hafızasıdır.

## Başlangıç bağlamı

Kullanıcı, sıfırdan ürün seviyesine yazılım geliştirme için gereken standartlar, kurallar ve süreçleri sordu. Önce kapsamlı bir SDLC / secure SDLC / kalite / test / operasyon / regülasyon standardı haritası çıkarıldı.

Ardından kullanıcı, tüm bu işleri insanların değil AI sistemlerinin yapacağını belirtti. Amaç, AI’ların profesyonel yazılım organizasyonu gibi çalışacağı skill / tool / agent / sub-agent / pipeline / team lead / team yapısını kurmak ve dokümante etmekti.

## Erken hata ve düzeltme

İlk cevaplarda odak yanlış şekilde çalışan prototype / runtime / connector / Nexus bridge paketlerine kaydı. Kullanıcı, asıl beklentinin uygulama değil, mimari kurgu ve bağlama dokümantasyonu olduğunu netleştirdi.

Bu nedenle yön değiştirildi:

```text
implementation prototype değil
Nexus AI Orchestration Model blueprint
```

## Repo çalışma alanı

Ana çalışma alanı:

```text
coskunhasib/Nexus_Capability_OS:nexus
```

Referans / bağlam kaynağı:

```text
coskunhasib/LLM_Calismalari
```

`LLM_Calismalari` gerektiğinde mevcut Nexus yapısı ve Codex refactor durumu için incelenecek. Çalışma branch’i `Nexus_Capability_OS:nexus`.

## Skill paketleri

Kullanıcı önceden geliştirdiği skill paketlerini verdi. İlk okuma yüzeysel kaldı. Sonra kullanıcı, skill paketlerinin yalnız talimat değil, `SKILL.md`, `scripts`, `references`, `assets` gibi parçalarıyla tam paket olduğunu hatırlattı.

Bu konuşmada kilitlenen iki semantik düzeltme:

```text
prism = brainstorming / divergent thinking
verification-loop = bug / defect finding
```

Bu bilgilerin skill dosyalarından çıkarılabilmesi gerekirdi; hata okuma derinliğindeydi. Bu yüzden Skill Semantic Extraction ayrı ve zorunlu bir aşama olarak ele alınmalı.

## Ana terminoloji evrimi

Önce `Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS` listesine agent deniyordu. Kullanıcı bunun doğru olmayabileceğini belirtti.

Son karar:

```text
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS
= Core Abilities
```

Bu isimler korunacak, sadece kategorileri değişecek.

## Üst model düzeltmesi

Önce üst ad yanlış şekilde `AI SDLC Factory` idi. Kullanıcı, SDLC’nin Nexus AI altında sadece bir pipeline olduğunu belirtti.

Son karar:

```text
Üst yapı = Nexus AI Orchestration Model
SDLC = Pipeline Catalog içindeki pipeline türlerinden biri
```

## Güncel ana model

```text
Nexus AI

1. Shared Registry
2. Pipeline System
3. Team System
4. Governance System
5. Audit System
```

Shared Registry şunları içerir:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

Team hiyerarşisi:

```text
Team
└── Team Lead
    ├── Agents
    │   └── Sub-agents
    └── Direct Sub-agents
```

## Shared Registry + Usage Mapping kuralı

Kullanıcı, ortak kategorideki bir öğenin sadece registry’de değil, kullanıldığı yerde de görünmesi gerektiğini belirtti.

Kilitli kural:

```text
Shared Registry = sistemde ne var?
Usage Mapping = kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Bu kural yalnız skill için değil, tüm ortak kategoriler için geçerlidir:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

## Uygulama yasağı

Bu doküman seti ve tartışma kararları onaylanmadan:

```text
runtime yazılmayacak
connector bağlanmayacak
Nexus publish tasarlanmayacak
deploy akışı açılmayacak
plugin registry kurulmayacak
mevcut agent/core ability/team yapısına doğrudan refactor yapılmayacak
```
