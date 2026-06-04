# 00 — Decision Log

Bu doküman Nexus AI Orchestration Model için kilitlenen kararları kaydeder.

## D-001 — Üst yapı Nexus AI’dır

SDLC üst yapı değildir. SDLC, Nexus AI altında çalışacak pipeline türlerinden biridir.

Doğru üst ad:

```text
Nexus AI Orchestration Model
```

Yanlış üst ad:

```text
AI SDLC Factory
```

## D-002 — Plugin iptal

Plugin çekirdek kapsamda yoktur.

Kullanılacak çekirdek kavramlar:

```text
Pipeline
Team
Team Lead
Agent
Sub-agent
Core Ability
Skill
Tool
Governance
Audit
Evidence
Trace
```

## D-003 — Core Abilities

Aşağıdaki isimler korunur:

```text
Supervisor
Coder
Vision
Audio
Creative
Memory
Web
OS
```

Bu listeye artık agent denmez. Bunlar:

```text
Core Abilities
```

## D-004 — Core Abilities team değildir

Core Abilities hiçbir team’in üyesi değildir.

Core Abilities, Nexus AI’ın ortak kabiliyet katmanıdır.

Her Core Ability kendi modeline, motoruna, yapılandırmasına veya çalışma biçimine sahip olabilir.

## D-005 — Team hiyerarşisi

Team altında Team Lead bulunur. Team Lead altında agent ve sub-agent yapıları bulunur.

Genel hiyerarşi:

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

## D-006 — Supervisor ve SDLC Team Lead aynı şey değildir

```text
Supervisor = Core Ability
SDLC Team Lead = SDLC Team’i ve SDLC Pipeline Run’ını yöneten rol
```

Supervisor gerektiğinde kullanılabilir ama SDLC Team Lead’in yerine geçmez.

## D-007 — Governance kör birleştirilmez

Policy, gate, permission ve risk rule kavramları Governance ailesi altında toplanır.

Ama özel katmanları korunur:

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

## D-008 — Audit kör birleştirilmez

Evidence ve Trace aynı şey değildir.

```text
Evidence = karar kanıtı
Trace = işlem geçmişi
```

İkisi Audit ailesi altında gruplanır ama ayrı kalır.

## D-009 — Pipeline ve Pipeline Run ayrılır

```text
Pipeline = süreç tanımı / şablon
Pipeline Run = bu şablonun gerçek çalıştırılan örneği
```

## D-010 — Pipeline türleri çoğul olacaktır

Nexus AI altında birden çok pipeline olacaktır.

Örnekler:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
```
