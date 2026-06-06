# 00 — Decision Log

Bu doküman Nexus AI Orchestration Model için kilitlenen kararları kaydeder.

## D-001 — Üst yapı Nexus AI’dır

SDLC üst yapı değildir. SDLC, Nexus AI altında çalışacak pipeline türlerinden biridir.

Doğru üst ad:

```text
Nexus AI Orchestration Model
```

Yanlış üst ad:

```text
AI SDLC Factory
```

## D-002 — Plugin iptal

Plugin çekirdek kapsamda yoktur.

Kullanılacak çekirdek kavramlar:

```text
Pipeline
Team
Team Lead
Agent
Sub-agent
Core Ability
Skill
Tool
Governance
Audit
Evidence
Trace
```

## D-003 — Core Abilities

Aşağıdaki isimler korunur:

```text
Supervisor
Coder
Vision
Audio
Creative
Memory
Web
OS
```

Bu listeye artık agent denmez. Bunlar:

```text
Core Abilities
```

## D-004 — Core Abilities team değildir

Core Abilities hiçbir team’in üyesi değildir.

Core Abilities, Nexus AI’ın ortak kabiliyet katmanıdır.

Her Core Ability kendi modeline, motoruna, yapılandırmasına veya çalışma biçimine sahip olabilir.

## D-005 — Team hiyerarşisi

Team altında Team Lead bulunur. Team Lead altında agent ve sub-agent yapıları bulunur.

Genel hiyerarşi:

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

## D-006 — Supervisor ve SDLC Team Lead aynı şey değildir

```text
Supervisor = Core Ability
SDLC Team Lead = SDLC Team’i ve SDLC Pipeline Run’ını yöneten rol
```

Supervisor gerektiğinde kullanılabilir ama SDLC Team Lead’in yerine geçmez.

## D-007 — Governance kör birleştirilmez

Policy, gate, permission ve risk rule kavramları Governance ailesi altında toplanır.

Ama özel katmanları korunur:

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

## D-008 — Audit kör birleştirilmez

Evidence ve Trace aynı şey değildir.

```text
Evidence = karar kanıtı
Trace = işlem geçmişi
```

İkisi Audit ailesi altında gruplanır ama ayrı kalır.

## D-009 — Pipeline ve Pipeline Run ayrılır

```text
Pipeline = süreç tanımı / şablon
Pipeline Run = bu şablonun gerçek çalıştırılan örneği
```

## D-010 — Pipeline türleri çoğul olacaktır

Nexus AI altında birden çok pipeline olacaktır.

Örnekler:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
```

## D-016 — Tek yetkili always-required SDLC gate seti (doc 06 §8 = doc 08 §4)

SDLC pipeline’ın her zaman gerekli (always-required) gate seti tek bir canonical küme
olarak kilitlenir. Bu küme 19 gate içerir ve şu üç kararın birleşimidir:

```text
doc 06 §8  → taban minimum gate seti
doc 06a    → supply_chain_pass, license_pass, sbom_present (+ accessibility / data_migration conditional)
doc 06b    → agentic_safety_eval_pass (+ 5 conditional), "Development Completion impact"
```

Numara notu: D-011..D-015 `00a-shared-registry-decisions.md`’de tahsis edildiği için bu
karar global seride bir sonraki numara olan **D-016**’dır.

Canonical (makine-okunabilir) kaynak:

```text
configs/nexus-ai/sdlc_pipeline.yaml → required_gates.always
```

doc 06 §8 ve doc 08 §4 bu kümenin insan-okunabilir yansımalarıdır ve artık **birebir aynı**
listeyi (aynı sıra) verir.

Kilitlenen 19 always-required gate:

```text
requirements_complete
nfr_coverage_complete
architecture_complete
adr_coverage_complete
security_privacy_design_complete
risk_register_reviewed
implementation_scope_clean
code_review_pass
tests_pass
verification_loop_bug_finding_pass
security_validation_pass
supply_chain_pass
license_pass
sbom_present
performance_resilience_pass_or_accepted
agentic_safety_eval_pass
operations_readiness_pass
evidence_graph_complete
no_blocking_policy_failure
```

Koşullu (conditional-required) 7 gate bu always kümenin dışındadır ve değişmemiştir:

```text
accessibility_pass_if_applicable
data_migration_pass_if_applicable
privacy_lifecycle_pass_if_applicable
api_contract_compatibility_pass_if_applicable
backup_restore_dr_pass_if_applicable
compliance_pass_if_applicable
cost_resource_governance_pass_if_applicable
```

Uzlaştırma (giderilen anlaşmazlık): doc 06 §8 daha önce 06b’nin eklediği
`agentic_safety_eval_pass`’i içermiyordu; daha eski bir doc 08 §4 taslağı ise iki always-on
BLOCKER gate `risk_register_reviewed` (stage 9 premortem_fmea) ve
`performance_resilience_pass_or_accepted` (stage 24 performance_resilience) gate’lerini
atlıyordu. Bu üç gate’in tamamı canonical kümeye dahildir; üçü de
severity: blocker / required_when: always olarak yönetilir
(`configs/nexus-ai/governance/stage/sdlc-stages.yaml`; sırasıyla stage 9 / 24 / 18) ve
stage-29 development_completion rollup’ında
(`configs/nexus-ai/stages/sdlc/29-development-completion.yaml`) yer alır.
`agentic_safety_eval_pass`, doc 06b “Development Completion impact” kararı uyarınca AI-agent
safety stage’i (stage 18 ai_agent_safety_evaluation) tarafından üretilen always-required bir
gate’tir.

Config hizalaması: iki blocker gate, `sdlc_pipeline.yaml required_gates.always`’e ve stage-29
gate listesine eklenerek rollup boşluğu kapatıldı (always 17 → 19; stage-29 toplam 26 = 19
always + 7 conditional). `sdlc_pipeline_runtime_rules.yaml` `required_gate_producers` map’i her
always-required gate’i üreten stage’e bağlar.

Kapsam: bu bir planlama/doküman uzlaştırmasıdır; runtime kod yoktur. nexus branch izole
kalır — main’e merge edilmez.
