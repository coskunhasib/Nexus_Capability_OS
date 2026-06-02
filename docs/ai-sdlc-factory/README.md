# AI SDLC Factory — Tartışma ve Tasarım Paketi

Bu klasör, **tam kapsamlı AI yazılım geliştirme fabrikası** için tartışma öncesi kararları, kavram ayrımlarını ve uygulayıcı agent ortamlarına verilecek görev planını içerir.

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

`LLM_Calismalari` reposu gerektiğinde mevcut Nexus yapısı, agent/skill/team/refactor durumu ve Codex çıktıları için incelenir. Ancak bu blueprint’in çalışma branch’i bu repodaki `nexus` branch’idir.

## Kilitli kararlar

```text
Plugin kesin iptal.
```

```text
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS
= Core Abilities
```

```text
Core Abilities, SDLC Team’in parçası değildir.
Core Abilities bağımsız kabiliyet katmanıdır.
Her Core Ability kendi modeline / motoruna / çalışma biçimine sahip olabilir.
```

```text
SDLC tarafını yöneten rolün adı: SDLC Team Lead
Supervisor, SDLC Team Lead değildir.
```

## Güncel kavram seti

```text
Core Abilities
SDLC Team
SDLC Team Lead
SDLC Agent
SDLC Sub-agent
Skill
Tool
Pipeline
Policy
Evidence
Trace
```

## Ana model

```text
Core Abilities
  - Supervisor
  - Coder
  - Vision
  - Audio
  - Creative
  - Memory
  - Web
  - OS

SDLC Team
  - SDLC Team Lead
  - SDLC Agents
  - SDLC Sub-agents
  - Skills
  - Tools
  - Pipeline
  - Policy
  - Evidence
```

## Temel ayrımlar

```text
Core Ability != Agent
Core Ability != SDLC Team member
Supervisor != SDLC Team Lead
Skill != Agent
Tool != Skill
Plugin yok
```

## Okuma sırası

1. [`00-decision-log.md`](00-decision-log.md)
2. [`01-core-abilities-and-sdlc-team.md`](01-core-abilities-and-sdlc-team.md)
3. [`02-concept-model.md`](02-concept-model.md)
4. [`03-open-discussion-items.md`](03-open-discussion-items.md)

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