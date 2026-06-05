# Nexus AI Orchestration Model — Tartışma ve Tasarım Paketi

Bu klasör, **Nexus AI** altında kurulacak pipeline / team / agent / sub-agent / core ability / skill / tool / coordination / governance / audit modelini tartışmak ve kilitlemek için hazırlanmıştır.

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

```text
Coordination System ayrı bir kavram ailesidir.
Team System = kimler var?
Coordination System = bu roller nasıl birlikte çalışır?
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

4. Core Abilities Layer
   - Supervisor
   - Coder
   - Vision
   - Audio
   - Creative
   - Memory
   - Web
   - OS

5. Skills and Tools Layer
   - Skills = methods / protocols
   - Tools = callable operations

6. Coordination System
   - Delegation
   - Creator-Verifier
   - Controlled Direct Communication
   - Negotiation / Arbitration
   - Broadcast / Event Bus

7. Governance System
   - Global Governance
   - Pipeline Governance
   - Team Governance
   - Stage Governance
   - Core Ability Governance
   - Skill Governance
   - Tool Governance

8. Audit System
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

## Coordination System

Coordination System, agent’ların birlikte çalışma desenlerini tanımlar. Team System’in yerine geçmez.

```text
Team System = kim var?
Coordination System = bunlar nasıl birlikte çalışıyor?
Pipeline System = hangi süreç çalışıyor?
Governance System = neye izin var?
Audit System = ne kanıtlandı / ne yaşandı?
```

Zorunlu coordination patterns:

```text
Delegation
Creator-Verifier
Controlled Direct Communication
Negotiation / Arbitration
Broadcast / Event Bus
```

Coordination System runtime davranışını tarif eder ama tek başına runtime implementation onayı değildir.

## Temel ayrımlar

```text
Pipeline != Team
Pipeline Definition != Pipeline Run
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
9. [`06-sdlc-coverage-gap-audit.md`](06-sdlc-coverage-gap-audit.md)
10. [`06a-sdlc-mandatory-gates-decision.md`](06a-sdlc-mandatory-gates-decision.md)
11. [`06b-sdlc-agentic-safety-and-remaining-gates.md`](06b-sdlc-agentic-safety-and-remaining-gates.md)
12. [`07-pipeline-contract-standard.md`](07-pipeline-contract-standard.md)
13. [`08-sdlc-pipeline-contract.md`](08-sdlc-pipeline-contract.md)
14. [`sdlc-stages/`](sdlc-stages/)
15. [`23-coordination-system-and-runtime-gap-closure.md`](23-coordination-system-and-runtime-gap-closure.md)
16. [`AI_STUDIO_HIERARCHY_PROMPT.md`](AI_STUDIO_HIERARCHY_PROMPT.md)

## SDLC stage contracts

SDLC stage sözleşmeleri okunabilir kalması için parçalara ayrıldı:

```text
sdlc-stages/01-foundation-and-requirements.md
sdlc-stages/02-design-risk-and-planning.md
sdlc-stages/03-build-review-and-test.md
sdlc-stages/04-validation-and-product-gates.md
sdlc-stages/05-completion-release-and-learning.md
```

## Machine-readable extension configs

```text
configs/nexus-ai/coordination_system.yaml
configs/nexus-ai/runtime_gap_closure.yaml
```

Bu iki dosya blueprint/config genişletmesidir; runtime kodu değildir.

## Uygulama yasağı

Bu doküman seti ve tartışma kararları onaylanmadan:

- runtime yazılmayacak,
- connector bağlanmayacak,
- Nexus publish tasarlanmayacak,
- deploy akışı açılmayacak,
- plugin registry kurulmayacak,
- mevcut agent/core ability/team yapısına doğrudan refactor yapılmayacak.

Runtime workpackage execution ayrıca ve açıkça onaylanmadan:

- runtime implementation başlatılmayacak,
- product refactor yapılmayacak,
- main branch merge yapılmayacak,
- production readiness iddiası kurulmayacak.

## Şimdiki hedef

Planlama/handoff tamamlandı. Yeni eklenen Coordination System ve Runtime Gap Closure katmanı, runtime execution başlamadan önce workpackage kapsamına yansıtılması gereken eksik koordinasyon ve runtime bileşenlerini netleştirir.
