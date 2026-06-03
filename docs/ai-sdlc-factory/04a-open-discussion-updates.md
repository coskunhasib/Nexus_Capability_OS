# 04a — Open Discussion Updates

Bu ek doküman, shared registry ve usage mapping kararından sonra açık tartışma listesini günceller.

## Closed decisions

Aşağıdaki kararlar artık açık tartışma değildir:

```text
Plugin iptal.
Üst yapı Nexus AI Orchestration Model.
SDLC yalnızca pipeline türlerinden biridir.
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS = Core Abilities.
Core Abilities team değildir.
Team → Team Lead → Agent → Sub-agent hiyerarşisi geçerlidir.
Governance kör birleştirilmez.
Audit kör birleştirilmez.
Shared Registry ve Usage Mapping ayrıdır.
Shared kullanım kuralı tüm ortak kategoriler için geçerlidir.
Skill ana hiyerarşide yalnız adıyla görünür.
```

## Shared usage rule status

Aşağıdaki ortak kategoriler için kural kilitlidir:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

Her biri shared registry’de listelenir ve kullanıldığı pipeline, stage, team, team lead, agent veya sub-agent altında tekrar gösterilir.

## Remaining open topics

Hâlâ tartışılacak başlıklar:

```text
Pipeline Catalog kapsamı
Pipeline Run sözleşmesi
Team gerektirme eşiği
Direct Sub-agent kuralı
Core Ability erişim kuralı
Skill Governance owner’ı
Model / Provider Profile sözleşmesi
Context / Memory Profile sözleşmesi
Evidence graph formatı
Pipeline-specific governance dosya düzeni
LLM_Calismalari refactor sonrası yeniden gözden geçirme noktaları
```

## Next recommended discussion

Sıradaki tartışma başlığı:

```text
Pipeline Catalog ve Pipeline Run sözleşmesi nasıl tanımlanmalı?
```

Bu başlık çözülmeden agent/sub-agent kataloğu ve pipeline uygulama iş paketlerine geçilmemelidir.
