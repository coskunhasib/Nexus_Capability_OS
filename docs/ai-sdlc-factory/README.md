# AI SDLC Factory — Tartışma ve Tasarım Paketi

Bu klasör, **tam kapsamlı AI yazılım geliştirme fabrikası** için tartışma öncesi kararları, kavram ayrımlarını ve uygulayıcı agent ortamlarına verilecek görev planını içerir.

Bu branch bilinçli olarak `nexus` adıyla oluşturuldu ve **merge edilmemek üzere** dokümantasyon/tartışma alanı olarak kullanılmalıdır.

## Kapsam

Bu paket kod implementasyonu değildir. Amaç şudur:

- skill / tool / agent / sub-agent / team / team lead / pipeline kavramlarını netleştirmek,
- birbirinin yerine geçen veya tekrar eden yapıları ayıklamak,
- tüm çekirdek yapıyı eksiksiz ama tekrarsız tanımlamak,
- Codex / Antigravity / Claude Code gibi uygulayıcı ortamlara verilecek iş planını hazırlamak,
- daha sonra yapılacak işi review edebilmek için kabul kriterlerini belirlemek.

## Ana karar

`plugin` şu an çekirdek kapsamda değildir.

Bizim çekirdeğimiz:

```text
Skill
Tool
Agent
Sub-agent
Team
Team Lead / Orchestrator
Pipeline
Policy
Evidence
Trace
```

## Okuma sırası

1. [`00-decision-log.md`](00-decision-log.md)
2. [`01-core-definitions.md`](01-core-definitions.md)
3. [`02-necessity-and-deduplication.md`](02-necessity-and-deduplication.md)
4. [`03-skill-semantic-extraction.md`](03-skill-semantic-extraction.md)
5. [`04-team-agent-subagent-model.md`](04-team-agent-subagent-model.md)
6. [`05-pipeline-model.md`](05-pipeline-model.md)
7. [`06-governance-policy-evidence.md`](06-governance-policy-evidence.md)
8. [`07-executor-workpackages.md`](07-executor-workpackages.md)
9. [`08-open-discussion-items.md`](08-open-discussion-items.md)

## Tartışılacak ana konu

En kritik karar:

> Team yapısını sadece pasif ownership/policy boundary olarak tutup, ayrı takım lead agent’larını kaldırıyor muyuz?

Benim önerim: **evet**.

```text
Tek global Team Lead / Orchestrator
+ stage owner agent’lar
+ sınırlı ve gerekçeli sub-agent’lar
```

## Uygulama yasağı

Bu doküman seti onaylanmadan:

- runtime yazılmayacak,
- connector bağlanmayacak,
- Nexus publish tasarlanmayacak,
- deploy akışı açılmayacak,
- plugin registry kurulmayacak.
