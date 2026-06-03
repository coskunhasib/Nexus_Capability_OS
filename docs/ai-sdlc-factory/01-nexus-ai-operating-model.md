# 01 — Nexus AI Operating Model

Bu doküman Nexus AI içindeki kavramların hiyerarşik ve işlevsel ilişkisini tanımlar.

## 1. Üst yapı

```text
Nexus AI
```

Nexus AI, SDLC’den daha geniştir. SDLC yalnızca bir pipeline türüdür.

## 2. Ana sistem aileleri

```text
Nexus AI

1. Pipeline System
2. Team System
3. Capability System
4. Method System
5. Execution System
6. Governance System
7. Audit System
```

## 3. Pipeline System

Pipeline System iki parçadan oluşur:

```text
Pipeline Catalog
Pipeline Run
```

### Pipeline Catalog

Tanımlı süreç şablonlarıdır.

Örnek:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
```

### Pipeline Run

Bir pipeline şablonunun gerçek çalışma örneğidir.

Örnek:

```text
X ürünü için SDLC Pipeline Run
Y konu başlığı için Research Pipeline Run
Z özelliği için Activation Pipeline Run
```

Pipeline Run şunları içerir:

```text
selected_pipeline
assigned_team
active_stage
context
governance_state
evidence
trace
```

## 4. Team System

Team, pipeline run için çalışan organizasyondur.

Temel hiyerarşi:

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

Her pipeline için aynı team yapısı zorunlu değildir. Karmaşık pipeline’lar team gerektirir. Basit pipeline run’ları daha az rolle çalışabilir.

## 5. Capability System

Capability System, Nexus AI’ın ortak kabiliyet katmanıdır.

```text
Core Abilities
├── Supervisor
├── Coder
├── Vision
├── Audio
├── Creative
├── Memory
├── Web
└── OS
```

Core Abilities team değildir. Agent değildir. SDLC Team üyesi değildir.

Team Lead, Agent veya Sub-agent ihtiyaç duyduğunda Core Abilities kullanabilir.

## 6. Method System

Method System, Skills katmanıdır.

Skill bir yöntem, protokol veya çalışma paketi sağlar.

Örnek:

```text
prism
verification-loop
sentinel
llm-council
fmea
adr-builder
gap-audit
```

Skill agent değildir. Tool değildir.

## 7. Execution System

Execution System, Tools katmanıdır.

Tool gerçek çağrılabilir işlemdir.

Örnek:

```text
file_read
file_write
shell_exec
web_fetch
test_runner
repo_diff_reader
scanner_runner
```

Tool skill değildir.

## 8. Governance System

Governance System kural, izin, gate ve risk yönetimidir.

Katmanları:

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Skill Governance
Tool Governance
```

Governance tek bir düz policy dosyası değildir. Her pipeline kendi özel governance kurallarına sahip olabilir.

## 9. Audit System

Audit System kanıt ve izleme ailesidir.

```text
Evidence
Trace
```

Evidence karar kanıtıdır. Trace işlem geçmişidir.

## 10. Genel ilişki

```text
Pipeline tanımlar.
Pipeline Run çalışır.
Team atanır.
Team Lead yönetir.
Agents/Sub-agents üretir.
Core Abilities destekler.
Skills yöntem sağlar.
Tools işlem yapar.
Governance sınırlar.
Audit kanıtlar.
```

## 11. Birleşmemesi gerekenler

```text
Pipeline != Team
Team Lead != Supervisor
Agent != Core Ability
Skill != Tool
Governance != Audit
Evidence != Trace
```
