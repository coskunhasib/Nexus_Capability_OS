# 03 — Governance and Audit Layering

Bu doküman Governance ve Audit kavramlarının kör biçimde birleştirilmemesi için katman ayrımlarını tanımlar.

## 1. Governance ailesi

Governance şu kavramları kapsar:

```text
Policy
Gates
Permissions
Risk Rules
```

Ama bunların hepsi tek düzey değildir.

## 2. Governance katmanları

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

Governance Profiles shared registry’de listelenir ve kullanıldığı pipeline/team/stage/agent/core ability altında tekrar gösterilir.

## 3. Global Governance

Tüm Nexus AI için geçerli kurallardır.

Örnek:

```text
plugin yok
secret sızdırma yok
policy bypass yok
trace zorunlu
raw credential gösterme yok
high-risk action default deny
```

## 4. Pipeline Governance

Her pipeline kendi özel governance kurallarına sahip olabilir.

Örnek:

```text
SDLC Pipeline Governance
  - code review olmadan development completion yok
  - blocker bug varsa release candidate yok
  - security high/critical varsa geçiş yok

Research Pipeline Governance
  - kaynak güvenilirliği skoru zorunlu
  - citation/evidence zorunlu
  - belirsizlik açık yazılmalı

Activation Pipeline Governance
  - superadmin preview olmadan pilot activation yok
  - pilot evidence olmadan public activation yok
  - rollback planı zorunlu

Operations Pipeline Governance
  - incident severity sınıflandırması zorunlu
  - postmortem zorunlu
  - rollback/runbook evidence zorunlu
```

## 5. Team Governance

Team içi rol ve sorumluluk kurallarıdır.

Örnek:

```text
SDLC Team Governance
  - developer kendi kodunu approve edemez
  - QA test sonucunu manipüle edemez
  - Release Agent failed gate’i pass yapamaz

Research Team Governance
  - researcher kendi kaynağını tek başına doğrulayamaz
  - source validation ayrı yapılır
```

## 6. Stage Governance

Pipeline içindeki tek bir aşamanın kurallarıdır.

Örnek:

```text
verification_loop_bug_finding stage
  uses Governance Profiles:
    - verification_loop_bug_gate
  rules:
    - verification-loop skill kullanılmalı
    - BUG_FINDING_REPORT üretilmeli
    - blocker bug count = 0 olmalı
```

## 7. Core Ability Governance

Core Ability kullanım kurallarıdır. Her Core Ability aynı risk ve izin profiline sahip değildir.

Örnek:

```text
Coder
  uses Governance Profiles:
    - code_generation_governance

Web
  uses Governance Profiles:
    - web_access_governance

OS
  uses Governance Profiles:
    - system_access_governance

Memory
  uses Governance Profiles:
    - memory_access_governance
```

Bu profiller shared registry’de listelenir ve Core Ability altında tekrar gösterilir.

## 8. Skill Governance

Skill kullanım kurallarıdır.

Örnek:

```text
prism
  uses Governance Profiles:
    - brainstorming_skill_governance
  rules:
    - brainstorming için kullanılır
    - bug finding için kullanılmaz

verification-loop
  uses Governance Profiles:
    - defect_finding_skill_governance
  rules:
    - bug/defect finding için kullanılır
    - genel readiness checklist değildir
```

## 9. Tool Governance

Tool çağrılarının yetki ve risk kurallarıdır.

Örnek:

```text
shell_exec
  uses Governance Profiles:
    - sandbox_execution_governance
  rules:
    - sandbox required
    - timeout required
    - trace required
```

## 10. Audit ailesi

Audit şu kavramları kapsar:

```text
Evidence
Trace
```

Ama Evidence ve Trace aynı şey değildir.

Audit Schemas shared registry’de listelenir ve kullanıldığı pipeline/team/stage/agent/core ability/tool altında tekrar gösterilir.

## 11. Evidence

Evidence karar kanıtıdır.

Örnek:

```text
REQUIREMENTS_SPEC
ARCHITECTURE_DECISION
TEST_REPORT
BUG_FINDING_REPORT
SECURITY_SCAN_REPORT
DEVELOPMENT_COMPLETION_REPORT
RELEASE_EVIDENCE
```

## 12. Trace

Trace işlem geçmişidir.

Örnek:

```text
agent invocation trace
sub-agent invocation trace
skill activation trace
tool call trace
core ability invocation trace
model invocation trace
context usage trace
policy evaluation trace
pipeline transition trace
```

## 13. Pipeline özel evidence

Her pipeline kendi özel evidence setine sahip olabilir.

Örnek:

```text
SDLC Pipeline Evidence
  uses Audit Schemas:
    - sdlc_pipeline_evidence_schema
  evidence examples:
    - REQUIREMENTS_SPEC
    - ARCHITECTURE_DECISION
    - TEST_REPORT
    - BUG_FINDING_REPORT
    - SECURITY_SCAN_REPORT
    - DEVELOPMENT_COMPLETION_REPORT
    - RELEASE_EVIDENCE

Research Pipeline Evidence
  uses Audit Schemas:
    - research_claim_evidence_schema
  evidence examples:
    - SOURCE_LIST
    - SOURCE_RELIABILITY_REPORT
    - CLAIM_EVIDENCE_MAP
    - UNCERTAINTY_REPORT

Activation Pipeline Evidence
  uses Audit Schemas:
    - activation_evidence_schema
  evidence examples:
    - PREVIEW_RESULT
    - PILOT_RESULT
    - ACTIVATION_DECISION
    - ROLLBACK_PLAN
```

## 14. Usage mapping rule

Governance ve Audit de ortak kategorilerdir.

Bu nedenle iki yerde görünürler:

```text
Shared Registry
  - Governance Profiles
  - Audit Schemas

Usage Mapping
  - ilgili pipeline altında
  - ilgili team altında
  - ilgili stage altında
  - ilgili agent/sub-agent altında
  - ilgili core ability altında
  - ilgili tool altında
```

## 15. Sonuç

Doğru model:

```text
Governance
  - genel aile
  - alt katmanlar korunur
  - kullanıldığı bağlamda tekrar gösterilir

Audit
  - genel aile
  - Evidence ve Trace ayrımı korunur
  - kullanıldığı bağlamda tekrar gösterilir
```

Yanlış model:

```text
Tüm policy/gate/permission kavramlarını tek dosyada eritmek
Evidence ve trace’i aynı kayıt türü yapmak
Her pipeline’a aynı governance setini zorla uygulamak
Shared registry’de var diye kullanım yerinde göstermemek
```
