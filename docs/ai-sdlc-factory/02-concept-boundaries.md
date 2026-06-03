# 02 — Concept Boundaries

Bu doküman Nexus AI kavramlarının birbirinden farkını ve hangi kavramların birleşmemesi gerektiğini tanımlar.

## 1. Pipeline vs Team

```text
Pipeline = süreç tanımı
Team = bu süreci çalıştıran organizasyon
```

Pipeline aşamaları, geçişleri ve gate’leri tanımlar.

Team işi yapar.

## 2. Pipeline vs Pipeline Run

```text
Pipeline = şablon
Pipeline Run = gerçek çalıştırma örneği
```

Örnek:

```text
SDLC Pipeline = tanım
Feature-X SDLC Run = gerçek çalışma
```

## 3. Team Lead vs Supervisor

```text
Team Lead = belirli bir pipeline team’ini yöneten rol
Supervisor = Core Ability
```

SDLC özelinde:

```text
SDLC Team Lead != Supervisor
```

Supervisor kullanılabilir ama SDLC Team Lead’in yerine geçmez.

## 4. Agent vs Core Ability

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

## 5. Agent vs Sub-agent

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

## 6. Skill vs Tool

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

## 7. Governance vs Audit

```text
Governance = neye izin verilir / ne bloklanır?
Audit = ne oldu / kanıtı ne?
```

Governance kuraldır. Audit kayıttır.

## 8. Evidence vs Trace

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

## 9. Memory kavramı

Memory Core Ability olarak kalır.

Alt işlemleri tool olabilir:

```text
memory_search
memory_write
memory_summarize
context_recall
```

Memory sadece tool’a indirgenmez.

## 10. Web ve OS kavramı

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

## 11. Birleşmesi gereken üst aileler

Şunlar üst aile olarak gruplanabilir:

```text
Policy + Gates + Permissions + Risk Rules = Governance
Evidence + Trace = Audit
```

Ama alt türler korunur. Kör birleştirme yapılmaz.

## 12. Birleşmemesi gerekenler

```text
Pipeline ve Team birleşmez.
Team Lead ve Supervisor birleşmez.
Agent ve Core Ability birleşmez.
Skill ve Tool birleşmez.
Governance ve Audit birleşmez.
Evidence ve Trace birleşmez.
```

## 13. Gereklilik analizi

| Kavram | Gerekli mi? | Gerekçe |
|---|---:|---|
| Nexus AI | Evet | Tüm sistemi kapsayan üst yapı. |
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
| Plugin | Hayır | İptal edildi. |
