# 02 — Concept Boundaries

Bu doküman Nexus AI kavramlarının birbirinden farkını ve hangi kavramların birleşmemesi gerektiğini tanımlar.

## 1. Registry vs Usage

```text
Registry = sistemde ne var?
Usage = kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Ortak kullanılan her kategori hem registry’de hem de kullanıldığı bağlamda görünür.

Bu kural şunların tamamına uygulanır:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

Bu tekrar sahiplik değildir; kullanım ilişkisidir.

## 2. Pipeline vs Team

```text
Pipeline = süreç tanımı
Team = bu süreci çalıştıran organizasyon
```

Pipeline aşamaları, geçişleri ve gate’leri tanımlar. Team işi yapar.

## 3. Pipeline vs Pipeline Run

```text
Pipeline = şablon
Pipeline Run = gerçek çalıştırma örneği
```

Örnek:

```text
SDLC Pipeline = tanım
Feature-X SDLC Run = gerçek çalışma
```

Pipeline Run, seçilen pipeline’ın kullandığı shared öğeleri kendi bağlamında tekrar gösterir.

## 4. Team Lead vs Supervisor

```text
Team Lead = belirli bir pipeline team’ini yöneten rol
Supervisor = Core Ability
```

SDLC özelinde:

```text
SDLC Team Lead != Supervisor
```

Supervisor kullanılabilir ama SDLC Team Lead’in yerine geçmez.

## 5. Agent vs Core Ability

```text
Agent = pipeline team altında sorumluluk sahibi rol
Core Ability = Nexus AI’ın ortak kabiliyeti
```

Örnek:

```text
Requirements Agent = Agent
Coder = Core Ability
```

Agent, Coder kabiliyetini kullanabilir. Ama Coder agent değildir.

Kullanım gösterimi:

```text
Engineering Agent
  uses Core Abilities:
    - Coder
    - Memory
  uses Skills:
    - verification-loop
  uses Tools:
    - test_runner
```

## 6. Agent vs Sub-agent

```text
Agent = ana sorumluluk rolü
Sub-agent = dar uzman görev rolü
```

Hiyerarşi:

```text
Team Lead
└── Agent
    └── Sub-agent
```

Bazı direct sub-agent’lar Team Lead tarafından doğrudan çağrılabilir.

## 7. Skill vs Tool

```text
Skill = yöntem / protokol
Tool = çağrılabilir işlem
```

Örnek:

```text
verification-loop = skill
test_runner = tool
```

Skill nasıl yapılacağını söyler. Tool işi çalıştırır.

Skill ana hiyerarşide yalnız adıyla görünür:

```text
Skills
  - prism
  - verification-loop
  - sentinel
```

Skill paket içeriği ana hiyerarşide gösterilmez; skill inventory / audit dokümanında tutulur.

## 8. Governance vs Audit

```text
Governance = neye izin verilir / ne bloklanır?
Audit = ne oldu / kanıtı ne?
```

Governance kuraldır. Audit kayıttır.

Governance ve Audit ortak sistem aileleridir; ancak kullanıldıkları pipeline/stage/team altında tekrar gösterilir.

## 9. Evidence vs Trace

```text
Evidence = karar kanıtı
Trace = işlem geçmişi
```

Örnek:

```text
BUG_FINDING_REPORT = evidence olabilir
verification-loop skill activation event = trace
```

Trace evidence’ı destekler ama evidence değildir.

## 10. Memory kavramı

Memory Core Ability olarak kalır.

Alt işlemleri tool olabilir:

```text
memory_search
memory_write
memory_summarize
context_recall
```

Memory sadece tool’a indirgenmez.

Memory’nin kullandığı model/provider ve context/memory profilleri ayrıca gösterilir.

## 11. Web ve OS kavramı

Web ve OS Core Ability olarak kalır.

Alt işlemleri tool’dur:

```text
Web
  - web_search
  - web_fetch
  - web_scrape

OS
  - file_read
  - file_write
  - shell_exec
  - process_run
```

Kullanım bağlamında hem Core Ability hem Tool görünür:

```text
Research Agent
  uses Core Abilities:
    - Web
  uses Tools:
    - web_search
    - web_fetch
```

## 12. Birleşmesi gereken üst aileler

Şunlar üst aile olarak gruplanabilir:

```text
Policy + Gates + Permissions + Risk Rules = Governance
Evidence + Trace = Audit
```

Ama alt türler korunur. Kör birleştirme yapılmaz.

## 13. Birleşmemesi gerekenler

```text
Pipeline ve Team birleşmez.
Team Lead ve Supervisor birleşmez.
Agent ve Core Ability birleşmez.
Skill ve Tool birleşmez.
Governance ve Audit birleşmez.
Evidence ve Trace birleşmez.
Registry ve Usage birleşmez.
```

## 14. Gereklilik analizi

| Kavram | Gerekli mi? | Gerekçe |
|---|---:|---|
| Nexus AI | Evet | Tüm sistemi kapsayan üst yapı. |
| Shared Registry | Evet | Ortak kullanılan şeylerin varlık kaydı gerekir. |
| Usage Mapping | Evet | Ortak öğelerin nerede kullanıldığını gösterir. |
| Pipeline Catalog | Evet | Birden fazla pipeline olacak. |
| Pipeline Run | Evet | Tanım ile gerçek çalışma ayrılmalı. |
| Team | Evet | Pipeline run için organizasyon gerekir. |
| Team Lead | Evet | Team’i yönetir. |
| Agent | Evet | Sorumluluk sahibi rol gerekir. |
| Sub-agent | Evet, sınırlı | Dar uzman görevler için gerekir. |
| Core Abilities | Evet | Nexus’un ortak kabiliyetleri. |
| Skills | Evet | Yöntem/protokol paketleri. |
| Tools | Evet | Çağrılabilir işlemler. |
| Governance | Evet | Kural ve izin sistemi. |
| Audit | Evet | Kanıt ve izleme sistemi. |
| Model / Provider Profiles | Evet | Core Abilities kendi model/motor profillerini kullanabilir. |
| Context / Memory Profiles | Evet | Pipeline run ve agent çalışma bağlamı görünür olmalı. |
| Plugin | Hayır | İptal edildi. |
