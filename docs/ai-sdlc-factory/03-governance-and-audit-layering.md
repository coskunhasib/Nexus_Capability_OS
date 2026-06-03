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
Skill Governance
Tool Governance
```

## 3. Global Governance

Tüm Nexus AI için geçerli kurallardır.

Örnek:

```text
plugin yok
secret sızdırma yok
policy bypass yok
trace zorunlu
raw credential gösterme yok
destructive action default deny
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
  - verification-loop skill kullanılmalı
  - BUG_FINDING_REPORT üretilmeli
  - blocker bug count = 0 olmalı
```

## 7. Skill Governance

Skill kullanım kurallarıdır.

Örnek:

```text
prism
  - brainstorming için kullanılır
  - bug finding için kullanılmaz

verification-loop
  - bug/defect finding için kullanılır
  - genel readiness checklist değildir
```

## 8. Tool Governance

Tool çağrılarının yetki ve risk kurallarıdır.

Örnek:

```text
OS.shell_exec
  - sandbox required
  - timeout required
  - trace required
  - destructive command deny by default
```

## 9. Audit ailesi

Audit şu kavramları kapsar:

```text
Evidence
Trace
```

Ama Evidence ve Trace aynı şey değildir.

## 10. Evidence

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

## 11. Trace

Trace işlem geçmişidir.

Örnek:

```text
agent invocation trace
sub-agent invocation trace
skill activation trace
tool call trace
policy evaluation trace
pipeline transition trace
```

## 12. Pipeline özel evidence

Her pipeline kendi özel evidence setine sahip olabilir.

Örnek:

```text
SDLC Pipeline Evidence
  - REQUIREMENTS_SPEC
  - ARCHITECTURE_DECISION
  - TEST_REPORT
  - BUG_FINDING_REPORT
  - SECURITY_SCAN_REPORT
  - DEVELOPMENT_COMPLETION_REPORT
  - RELEASE_EVIDENCE

Research Pipeline Evidence
  - SOURCE_LIST
  - SOURCE_RELIABILITY_REPORT
  - CLAIM_EVIDENCE_MAP
  - UNCERTAINTY_REPORT

Activation Pipeline Evidence
  - PREVIEW_RESULT
  - PILOT_RESULT
  - ACTIVATION_DECISION
  - ROLLBACK_PLAN
```

## 13. Sonuç

Doğru model:

```text
Governance
  - genel aile
  - alt katmanlar korunur

Audit
  - genel aile
  - Evidence ve Trace ayrımı korunur
```

Yanlış model:

```text
Tüm policy/gate/permission kavramlarını tek dosyada eritmek
Evidence ve trace’i aynı kayıt türü yapmak
Her pipeline’a aynı governance setini zorla uygulamak
```
