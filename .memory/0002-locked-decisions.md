# 0002 — Locked Decisions

Bu dosya, konuşmada kilitlenen kararları repo-safe hafıza olarak tutar.

## K-001 — Plugin iptal

```text
Plugin kesin iptal.
```

Plugin registry, plugin marketplace veya plugin lifecycle şu aşamada çekirdek modelde yer almaz.

## K-002 — Üst yapı Nexus AI Orchestration Model

```text
Nexus AI Orchestration Model
```

SDLC üst yapı değildir. SDLC yalnızca Nexus AI altında bir pipeline türüdür.

## K-003 — Core Abilities

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

Bu listeye artık agent denmez. Kategori adı:

```text
Core Abilities
```

## K-004 — Core Abilities team değildir

Core Abilities hiçbir team’in parçası değildir.

Core Abilities, Nexus AI’ın bağımsız ortak kabiliyet katmanıdır.

Her Core Ability kendi modeline, motoruna, yapılandırmasına veya çalışma biçimine sahip olabilir.

## K-005 — Team hiyerarşisi

Team altında Team Lead bulunur. Team Lead altında Agent ve Sub-agent yapıları bulunur.

Genel model:

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

## K-006 — Supervisor ve SDLC Team Lead ayrı

```text
Supervisor = Core Ability
SDLC Team Lead = SDLC Team’i ve SDLC Pipeline Run’ını yöneten rol
```

Supervisor kullanılabilir ama SDLC Team Lead’in yerine geçmez.

## K-007 — Governance kör birleştirilmeyecek

Governance ailesi:

```text
Policy
Gates
Permissions
Risk Rules
```

Ama özel katmanlar korunur:

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

## K-008 — Audit kör birleştirilmeyecek

```text
Evidence = karar kanıtı
Trace = işlem geçmişi
```

İkisi Audit ailesi altında gruplanır ama ayrı kalır.

## K-009 — Shared Registry + Usage Mapping

Ortak kullanılan öğeler iki yerde görünür:

```text
Shared Registry = sistemde ne var?
Usage Mapping = kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Bu kural şu kategorilerin tamamı için geçerlidir:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

## K-010 — Skill ana hiyerarşide sadece adıyla görünür

Doğru:

```text
Skills
  - prism
  - verification-loop
  - sentinel
```

Yanlış:

```text
Skills
  - prism
    - SKILL.md
    - scripts/
    - references/
```

Skill içeriği skill inventory / audit dokümanlarında tutulur.

## K-011 — Web, OS, Memory Core Ability olarak kalır

Web, OS ve Memory Core Ability olarak kalır. Alt işlemleri Tool Registry’de görünür.

Örnek:

```text
Web
  uses Tools:
    - web_search
    - web_fetch

OS
  uses Tools:
    - file_read
    - shell_exec

Memory
  uses Tools:
    - memory_search
    - memory_write
```

## K-012 — SDLC eksiksizliği kritik

Sohbetin başında yazılım geliştirme döngüsüne dair kapsamlı araştırma yapıldı. SDLC Pipeline bu araştırma sonucunda ortaya çıktı.

SDLC tarafında eksik bırakılmamalıdır. SDLC kapsamı ayrı coverage / gap audit ile doğrulanacaktır.
