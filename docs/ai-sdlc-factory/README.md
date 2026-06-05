# Nexus AI Orchestration Model — Tartışma ve Tasarım Paketi

Bu klasör, **Nexus AI** altında kurulacak mission / pipeline / team / agent / sub-agent / core ability / skill / tool / coordination / governance / audit modelini tartışmak ve kilitlemek için hazırlanmıştır.

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
Mission System ayrı ve üst kullanıcı-iş kavramıdır.
Mission = kullanıcı hedefinden doğan yönetilen çalışma kabı.
Mission tek uzun agent session değildir.
Mission, Pipeline Run değildir; bir veya daha fazla Pipeline Run içerebilir.
```

```text
Team Lead pipeline bağlamlıdır.
SDLC Pipeline için rol adı: SDLC Team Lead.
Supervisor, SDLC Team Lead değildir.
Mission Orchestrator / Süreç Yöneticisi de Supervisor değildir.
```

```text
Coordination System ayrı bir kavram ailesidir.
Team System = kimler var?
Coordination System = bu roller nasıl birlikte çalışır?
```

## Ana kavram aileleri

```text
Nexus AI

1. Mission System
   - Mission / Çalışma
   - Mission Orchestrator / Süreç Yöneticisi
   - Workers / Üreten Uzmanlar
   - Validators / Kontrol Uzmanları
   - Validation Contract / Başarı Kriterleri
   - Structured Handoffs / Teslim Raporları
   - Mission Shared State / Ortak Çalışma Durumu
   - Mission Control / Çalışma Merkezi
   - Mission Analytics / Çalışma Özeti

2. Shared Registry
   - Core Abilities
   - Skills
   - Tools
   - Governance Profiles
   - Audit Schemas
   - Model / Provider Profiles
   - Context / Memory Profiles

3. Pipeline System
   - Pipeline Catalog
   - Pipeline Definition
   - Pipeline Run

4. Team System
   - Team
   - Team Lead
   - Agent
   - Sub-agent

5. Core Abilities Layer
   - Supervisor
   - Coder
   - Vision
   - Audio
   - Creative
   - Memory
   - Web
   - OS

6. Skills and Tools Layer
   - Skills = methods / protocols
   - Tools = callable operations

7. Coordination System
   - Delegation
   - Creator-Verifier
   - Controlled Direct Communication
   - Negotiation / Arbitration
   - Broadcast / Event Bus

8. Governance System
   - Global Governance
   - Pipeline Governance
   - Team Governance
   - Stage Governance
   - Core Ability Governance
   - Skill Governance
   - Tool Governance
   - Mission Governance

9. Audit System
   - Evidence
   - Trace
```

## Mission System

Mission System kullanıcı hedefini çok adımlı, izlenebilir ve kanıtlı bir çalışmaya çevirir.

```text
Mission System = kullanıcı hedefini taşıyan üst çalışma kabı
Pipeline System = işin hangi süreç şablonuyla yürütüleceği
Team System = kimlerin çalışacağı
Coordination System = rollerin nasıl birlikte çalışacağı
Governance System = neye izin verileceği
Audit System = neyin kanıtlandığı / ne yaşandığı
```

Mission lifecycle:

```text
Describe goal
Scope through conversation
Approve plan
Write Validation Contract
Run Mission
Validate with independent validators
Update Mission Shared State
Produce Structured Handoffs
Show Mission Control
Record Mission Analytics
Complete / block / ask owner decision
Learn
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

Mission Shared State ile Shared Registry aynı şey değildir:

```text
Shared Registry = sistemdeki genel kabiliyet / profil / araç kataloğu
Mission Shared State = belirli bir Mission’da o anda olan şeyler
```

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

Mission özelinde sade rol grubu:

```text
Mission Orchestrator
├── Workers
└── Validators
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

## Mission-level runtime ilkeleri

```text
Validation Contract üretimden önce yazılır.
Validators adversarial by design çalışır.
Validators mümkünse fresh context ile kontrol yapar.
Her worker/validator Structured Handoff üretir.
Conflict-prone write işleri serial-first ilerler.
Read-only research ve independent validation kontrollü paralel olabilir.
Model seçimi role-based yapılır.
Mission Control varsayılan olarak kullanıcı dostu isimler gösterir.
Teknik ID’ler yalnız advanced/debug modunda görünür.
```

## Temel ayrımlar

```text
Mission != Pipeline Run
Mission != single long-running agent session
Pipeline != Team
Pipeline Definition != Pipeline Run
Team Lead != Supervisor
Mission Orchestrator != Supervisor
Agent != Core Ability
Skill != Tool
Governance != Audit
Evidence != Trace
Shared Registry != Mission Shared State
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
16. [`24-mission-system-and-user-facing-runtime-model.md`](24-mission-system-and-user-facing-runtime-model.md)
17. [`AI_STUDIO_HIERARCHY_PROMPT.md`](AI_STUDIO_HIERARCHY_PROMPT.md)
18. [`AI_STUDIO_USER_SIMULATION_PROMPT.md`](AI_STUDIO_USER_SIMULATION_PROMPT.md)

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
configs/nexus-ai/mission_system.yaml
configs/nexus-ai/validation_contract.yaml
configs/nexus-ai/structured_handoff_contract.yaml
configs/nexus-ai/execution_scheduling_policy.yaml
configs/nexus-ai/role_based_model_policy.yaml
configs/nexus-ai/mission_control_view.yaml
configs/nexus-ai/mission_shared_state.yaml
configs/nexus-ai/mission_analytics.yaml
configs/nexus-ai/owner_decision_registry.yaml
configs/nexus-ai/executor_override_policy.yaml
configs/nexus-ai/runtime_workpackage_execution_contract.yaml
configs/nexus-ai/user_facing_terminology.yaml
```

Bu dosyalar blueprint/config genişletmesidir; runtime kodu değildir.

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

Planlama/handoff tamamlandı. Coordination System ve Mission System ekleri, runtime execution başlamadan önce workpackage kapsamına yansıtılması gereken eksik koordinasyon, kullanıcı-facing çalışma, validation, handoff, scheduling, model routing, owner decision ve monitoring bileşenlerini netleştirir.
