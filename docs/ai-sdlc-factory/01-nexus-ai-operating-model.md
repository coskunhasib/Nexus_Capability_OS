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

1. Shared Registry
2. Pipeline System
3. Team System
4. Capability System
5. Method System
6. Execution System
7. Governance System
8. Audit System
9. Model / Provider System
10. Context / Memory System
```

## 3. Shared Registry

Shared Registry, sistemde mevcut olan ortak öğeleri listeler.

```text
Shared Registry
├── Core Abilities
├── Skills
├── Tools
├── Governance Profiles
├── Audit Schemas
├── Model / Provider Profiles
└── Context / Memory Profiles
```

Shared Registry şu soruyu cevaplar:

```text
Sistemde ne var?
```

Shared Registry kullanım yeri değildir. Kullanım ilişkisi pipeline, stage, team, team lead, agent veya sub-agent altında ayrıca gösterilir.

## 4. Pipeline System

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

Pipeline Catalog, ilgili pipeline’ın hangi shared öğeleri kullanabileceğini referanslar.

Örnek:

```text
SDLC Pipeline
  uses Core Abilities:
    - Coder
    - Memory
    - Web
    - OS
  uses Skills:
    - prism
    - verification-loop
    - sentinel
    - llm-council
  uses Governance Profiles:
    - sdlc_pipeline_governance
  uses Audit Schemas:
    - sdlc_pipeline_evidence_schema
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
run_context
governance_state
evidence
trace
```

Pipeline Run, kullanılan shared öğeleri run bağlamında tekrar gösterir.

## 5. Team System

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

Team, shared öğelerin sahibi değildir. Team Lead, Agent ve Sub-agent bu öğeleri kullanır.

Örnek:

```text
SDLC Team Lead
  uses Core Abilities:
    - Supervisor
    - Memory
  uses Governance Profiles:
    - sdlc_team_governance
  uses Audit Schemas:
    - team_handoff_trace_schema
```

## 6. Capability System

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

Core Ability adı ana hiyerarşide yeterlidir. Kendi iç motoruna, modeline veya yapılandırmasına hiyerarşide inilmez.

Alt çağrılabilir işlemler Tool Registry’de görünür.

## 7. Method System

Method System, Skills katmanıdır.

Skill bir yöntem, protokol veya çalışma paketi sağlar.

Örnek:

```text
Skills
├── prism
├── verification-loop
├── sentinel
├── llm-council
├── fmea
├── adr-builder
└── gap-audit
```

Skill agent değildir. Tool değildir.

Skill ana hiyerarşide yalnız adıyla görünür. `scripts`, `references` veya benzeri paket içeriği ana hiyerarşide gösterilmez; bu ayrıntılar skill inventory / audit dokümanına aittir.

## 8. Execution System

Execution System, Tools katmanıdır.

Tool gerçek çağrılabilir işlemdir.

Örnek:

```text
Tools
├── file_read
├── file_write
├── shell_exec
├── web_fetch
├── test_runner
├── repo_diff_reader
└── scanner_runner
```

Tool skill değildir. Tool, ilgili Core Ability altında gruplanmış olabilir ama kullanım yerinde ayrıca görünür.

## 9. Governance System

Governance System kural, izin, gate ve risk yönetimidir.

Katmanları:

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

Governance tek bir düz policy dosyası değildir. Her pipeline kendi özel governance kurallarına sahip olabilir.

Governance Profiles shared registry’de listelenir ve kullanıldığı pipeline/stage/team/agent altında tekrar gösterilir.

## 10. Audit System

Audit System kanıt ve izleme ailesidir.

```text
Evidence
Trace
```

Evidence karar kanıtıdır. Trace işlem geçmişidir.

Audit Schemas shared registry’de listelenir ve kullanıldığı pipeline/stage/team/agent altında tekrar gösterilir.

## 11. Model / Provider System

Model / Provider Profiles, Core Abilities veya pipeline rolleri tarafından kullanılan model, provider veya inference profilini belirtir.

Örnek:

```text
Coder
  uses Model / Provider Profiles:
    - coder_engineering_model

Vision
  uses Model / Provider Profiles:
    - vision_model
```

## 12. Context / Memory System

Context / Memory Profiles, pipeline run ve role özel çalışma bağlamını tanımlar.

Örnek:

```text
SDLC Pipeline Run
  uses Context / Memory Profiles:
    - sdlc_run_context

Requirements Agent
  uses Context / Memory Profiles:
    - requirements_context_pack
```

Memory Core Ability olarak kalır; context ise run/agent çalışma bilgisidir.

## 13. Genel ilişki

```text
Shared Registry neyin mevcut olduğunu gösterir.
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

## 14. Birleşmemesi gerekenler

```text
Pipeline != Team
Team Lead != Supervisor
Agent != Core Ability
Skill != Tool
Governance != Audit
Evidence != Trace
Registry != Usage
```
