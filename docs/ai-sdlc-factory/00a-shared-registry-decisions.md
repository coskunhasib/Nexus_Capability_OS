# 00a — Shared Registry Decision Addendum

Bu ek karar dokümanı, shared registry ve kullanım yerinde tekrar gösterim kuralını kilitler.

## D-011 — Shared Registry ve Usage Mapping ayrıdır

Ortak kullanılan öğeler iki yerde görünmelidir:

```text
Shared Registry = sistemde ne var?
Usage Mapping = kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Bu tekrar sahiplik değildir. Bu tekrar kullanım ilişkisini görünür kılar.

## D-012 — Kural tüm ortak kategoriler için geçerlidir

Bu kural yalnızca Skills için değildir. Aşağıdaki tüm ortak kategorilere uygulanır:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

Her kategori shared registry’de listelenir ve kullanıldığı pipeline/team/stage/agent altında tekrar gösterilir.

## D-013 — Skill ana hiyerarşide yalnız adıyla görünür

Skill paketleri kendi içinde dosya ve kaynaklar içerebilir. Ana hiyerarşik modelde yalnız skill adı gösterilir.

Doğru:

```text
Skills
  - prism
  - verification-loop
  - sentinel
```

Skill içeriği skill inventory / audit dokümanında tutulur.

## D-014 — Core Ability alt işlemleri Tool olarak ayrıca görünür

Core Ability adı shared registry’de görünür. Alt çağrılabilir işlemler Tool Registry’de ve kullanım yerinde görünür.

Örnek:

```text
Core Abilities
  - Web

Tools
  - web_search
  - web_fetch

Research Agent
  uses Core Abilities:
    - Web
  uses Tools:
    - web_search
    - web_fetch
```

## D-015 — Model / Provider ve Context / Memory profilleri görünür olmalıdır

Core Abilities kendi model/provider profillerini kullanabilir. Pipeline Run ve Agent’lar kendi context/memory profillerini kullanabilir.

Bu profiller shared registry’de ve kullanım bağlamında gösterilir.