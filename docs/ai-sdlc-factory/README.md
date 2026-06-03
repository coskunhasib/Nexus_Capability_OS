# Nexus AI Orchestration Model — Tartışma ve Tasarım Paketi

Bu klasör, **Nexus AI** altında kurulacak pipeline / team / agent / sub-agent / core ability / skill / tool / governance / audit modelini tartışmak ve kilitlemek için hazırlanmıştır.

Bu branch bilinçli olarak `nexus` adıyla kullanılır ve **merge edilmemek üzere** dokümantasyon/tartışma alanıdır.

## Repo kaynakları

Ana çalışma alanı:

```text
coskunhasib/Nexus_Capability_OS:nexus
```

Referans / bağlam kaynağı:

```text
coskunhasib/LLM_Calismalari
```

`LLM_Calismalari` gerektiğinde mevcut Nexus yapısı, agent/skill/team/refactor durumu ve Codex çıktıları için incelenir. Bu blueprint’in çalışma branch’i `Nexus_Capability_OS:nexus` branch’idir.

## Kilitli kararlar

```text
Plugin kesin iptal.
```

```text
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS
= Core Abilities
```

```text
Core Abilities team değildir.
Core Abilities, Nexus AI’ın bağımsız ortak kabiliyet katmanıdır.
Her Core Ability kendi modeline / motoruna / çalışma biçimine sahip olabilir.
```

```text
SDLC, Nexus AI içindeki pipeline’lardan sadece biridir.
Üst yapı AI SDLC Factory değil, Nexus AI Orchestration Model’dir.
```

```text
Team Lead pipeline bağlamlıdır.
SDLC Pipeline için rol adı: SDLC Team Lead.
Supervisor, SDLC Team Lead değildir.
```

## Ana kavram aileleri

```text
Nexus AI

1. Shared Registry
   - Core Abilities
   - Skills
   - Tools
   - Governance Profiles
   - Audit Schemas
   - Model / Provider Profiles
   - Context / Memory Profiles

2. Pipeline System
   - Pipeline Catalog
   - Pipeline Run

3. Team System
   - Team
   - Team Lead
   - Agent
   - Sub-agent

4. Governance System
   - Global Governance
   - Pipeline Governance
   - Team Governance
   - Stage Governance
   - Core Ability Governance
   - Skill Governance
   - Tool Governance

5. Audit System
   - Evidence
   - Trace
```

## Shared Registry + Usage Mapping kuralı

Ortak kullanılan her kategori iki yerde görünür:

```text
Shared Registry: sistemde ne var?
Usage Mapping: kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Bu kural şunların tamamı için geçerlidir:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

Bu tekrar sahiplik değil, kullanım ilişkisi anlamına gelir.

## En önemli hiyerarşik kural

```text
Team
└── Team Lead
    ├── Agents
    │   └── Sub-agents
    └── Direct Sub-agents
```

SDLC özelinde:

```text
SDLC Team
└── SDLC Team Lead
    ├── SDLC Agents
    │   └── SDLC Sub-agents
    └── Direct SDLC Sub-agents
```

## Temel ayrımlar

```text
Pipeline != Team
Team Lead != Supervisor
Agent != Core Ability
Skill != Tool
Governance != Audit
Evidence != Trace
Plugin yok
```

## Okuma sırası

1. [`00-decision-log.md`](00-decision-log.md)
2. [`00a-shared-registry-decisions.md`](00a-shared-registry-decisions.md)
3. [`01-nexus-ai-operating-model.md`](01-nexus-ai-operating-model.md)
4. [`02-concept-boundaries.md`](02-concept-boundaries.md)
5. [`03-governance-and-audit-layering.md`](03-governance-and-audit-layering.md)
6. [`04-open-discussion-items.md`](04-open-discussion-items.md)
7. [`04a-open-discussion-updates.md`](04a-open-discussion-updates.md)
8. [`05-shared-registry-and-usage-mapping.md`](05-shared-registry-and-usage-mapping.md)

## Uygulama yasağı

Bu doküman seti ve tartışma kararları onaylanmadan:

- runtime yazılmayacak,
- connector bağlanmayacak,
- Nexus publish tasarlanmayacak,
- deploy akışı açılmayacak,
- plugin registry kurulmayacak,
- mevcut agent/core ability/team yapısına doğrudan refactor yapılmayacak.

## Şimdiki hedef

Önce kavram seti ve kararlar kilitlenecek. Ardından Codex / Antigravity / Claude Code için iş paketleri hazırlanacak.