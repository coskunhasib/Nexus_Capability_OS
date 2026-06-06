# AI Studio Hierarchy Visualization Prompt

Use this prompt to generate a hierarchy visualization for the Nexus AI Orchestration Model.

```text
Nexus AI Orchestration Model için üstten en alta kadar tam hiyerarşi görselleştirmesi oluştur.

Bu görsel yalnızca SDLC Pipeline’ı göstermemeli. SDLC, Nexus AI altındaki pipeline türlerinden sadece biridir. Görselin ana amacı, Nexus AI’ın tüm ana hiyerarşik yapısını, Mission System’i, paylaşılan registry sistemini, pipeline sistemini, team/agent/sub-agent yapısını, core abilities ayrımını, skills/tools ayrımını, coordination system’i, governance ve audit ayrımını, ayrıca SDLC Pipeline’ı detaylı örnek olarak göstermektir.

Tasarım dili, stil, renk, layout, ikon, yön, yerleşim ve görsel metafor açısından serbestsin. Ancak kavramsal hiyerarşi ve ayrımlar korunmalı.

EN ÜST SEVİYE:

Nexus AI Orchestration Model

Ana sistem aileleri:

1. Mission System
2. Shared Registry System
3. Pipeline System
4. Team System
5. Core Abilities Layer
6. Skills and Tools Layer
7. Coordination System
8. Governance System
9. Audit System

ÖNEMLİ AYRIMLAR:

- Nexus AI Orchestration Model en üst yapıdır.
- Mission, kullanıcı hedefinden doğan yönetilen çalışma kabıdır.
- Mission, tek uzun agent session değildir.
- Mission, Pipeline Run değildir.
- Mission, bir veya birden fazla Pipeline Run içerebilir.
- SDLC üst yapı değildir; yalnızca bir pipeline türüdür.
- Plugin yoktur. Plugin registry, plugin marketplace veya plugin lifecycle gösterilmemelidir.
- Pipeline, Team değildir.
- Pipeline Definition, Pipeline Run değildir.
- Agent, Core Ability değildir.
- Core Abilities hiçbir Team’in üyesi değildir.
- Supervisor, SDLC Team Lead veya Mission Orchestrator değildir.
- Skill, Tool değildir.
- Governance, Audit değildir.
- Evidence, Trace değildir.
- Shared Registry ve Usage Mapping farklı şeylerdir.
- Shared Registry, Mission Shared State değildir.

1. MISSION SYSTEM

Mission System kullanıcıya en yakın üst çalışma katmanıdır.

Kullanıcı teknik olarak pipeline başlatmaz. Kullanıcı hedef verir. Nexus bu hedefi bir Mission’a dönüştürür.

Mission kullanıcıya “Çalışma” olarak gösterilebilir.

Mission System altında göster:

- Mission Intake
- Mission Scoping
- Mission Plan
- Validation Contract
- Owner Plan Approval
- Mission Execution
- Mission Validation Loop
- Mission Control
- Mission Analytics
- Mission Completion Decision
- Mission Learning

Mission yapısı:

Mission
├── mission goal
├── scoped plan
├── assumptions / constraints / non-goals
├── milestones
├── features
├── selected pipelines
├── pipeline runs
├── assigned teams
├── Mission Orchestrator
├── Workers
├── Validators
├── Validation Contract
├── Mission Shared State
├── Structured Handoffs
├── Mission Control
├── Mission Analytics
├── Evidence Index
├── Trace Timeline
└── Learning Record

Mission ile Pipeline Run ilişkisi:

Mission
└── Pipeline Runs
    ├── Research Pipeline Run
    ├── SDLC Pipeline Run
    ├── Activation Pipeline Run
    ├── Operations Pipeline Run
    └── Knowledge / Memory Pipeline Run

Mission üç rol mimarisi:

Mission Orchestrator
├── Workers
└── Validators

Mission Orchestrator, Supervisor değildir.
Workers, işi üreten uzmanlardır.
Validators, bağımsız kontrol uzmanlarıdır.

Validation Contract kullanıcıya “Başarı Kriterleri” olarak gösterilir.
Structured Handoff kullanıcıya “Teslim Raporu” olarak gösterilir.
Mission Shared State kullanıcıya “Ortak Çalışma Durumu” olarak gösterilir.
Mission Control kullanıcıya “Çalışma Merkezi” olarak gösterilir.
Mission Analytics kullanıcıya “Çalışma Özeti” olarak gösterilir.

2. SHARED REGISTRY SYSTEM

Shared Registry = sistemde ne var?

Alt kategoriler:

- Core Abilities Registry
- Skills Registry
- Tools Registry
- Governance Profiles Registry
- Audit Schemas Registry
- Model / Provider Profiles Registry
- Context / Memory Profiles Registry

Core Abilities:

- Supervisor
- Coder
- Vision
- Audio
- Creative
- Memory
- Web
- OS

Core Abilities agent değildir. Team üyesi değildir. Ortak kabiliyet katmanıdır.

Skills örnekleri:

- prism
- verification-loop
- sentinel
- llm-council
- fmea
- adr-builder
- gap-audit
- prompt-fidelity
- calibrate
- refraction
- fermi-decompose
- bayesian-update

Skill = yöntem / protokol.
Tool = çağrılabilir operasyon.

Tools örnekleri:

- web_search
- web_fetch
- file_read
- file_write
- shell_exec
- repo_read
- repo_write
- test_runner
- scanner_runner
- sbom_generator
- license_checker
- evidence_writer
- trace_writer
- policy_query
- model_invoke

Usage Mapping ayrı gösterilmeli:

Usage Mapping = hangi pipeline / stage / team / agent hangi registry öğelerini kullanıyor?

3. PIPELINE SYSTEM

Pipeline System:

- Pipeline Catalog
- Pipeline Definition
- Pipeline Run

Pipeline Catalog içinde birden fazla pipeline göster:

- SDLC Pipeline — 31 stage — sdlc_team — sdlc_team_lead
- Research Pipeline — 10 stage — research_team — research_team_lead
- Activation Pipeline — 7 stage — activation_team — activation_team_lead
- Operations Pipeline — 6 stage — operations_team — operations_team_lead
- Skill Governance Pipeline — 7 stage — skill_governance_team — skill_governance_team_lead
- Knowledge / Memory Pipeline — 6 stage — knowledge_team — knowledge_team_lead

Candidate pipelines:

- Content Pipeline
- Data Processing Pipeline
- Model / Inference Pipeline
- Customer Support Pipeline
- Business / Strategy Pipeline

Pipeline Definition = süreç şablonu.
Pipeline Run = bu şablonun gerçek çalıştırılan örneği.

4. TEAM SYSTEM

Genel team hiyerarşisi:

Team
└── Team Lead
    ├── Agents
    │   └── Sub-agents
    └── Direct Sub-agents

Team türleri:

- SDLC Team
- Research Team
- Activation Team
- Operations Team
- Skill Governance Team
- Knowledge Team

Supervisor ≠ Team Lead.
Supervisor bir Core Ability’dir.
Team Lead bir Team rolüdür.

5. COORDINATION SYSTEM

Team System = kim var?
Coordination System = bunlar nasıl birlikte çalışıyor?

Coordination System altında beş pattern göster:

1. Delegation
2. Creator-Verifier
3. Controlled Direct Communication
4. Negotiation / Arbitration
5. Broadcast / Event Bus

Mission içinde bunlar şöyle birleşir:

- Delegation: Orchestrator workers ve validators görevlendirir.
- Creator-Verifier: Worker üretir, Validator kontrol eder.
- Broadcast: Validation Contract ve Mission Shared State ilgili herkese duyurulur.
- Negotiation / Arbitration: Orchestrator handoff’ları inceler, kabul eder, reddeder veya yeniden scope eder.
- Controlled Direct Communication: Agent görüşmeleri sadece trace edilen message bus üzerinden olur.

6. GOVERNANCE SYSTEM

Governance = policy, gates, permissions, risk rules.

Katmanlar:

- Global Governance
- Pipeline Governance
- Team Governance
- Stage Governance
- Core Ability Governance
- Skill Governance
- Tool Governance
- Mission Governance

Governance tool çağrılarını, stage geçişlerini, gate sonuçlarını, self-approval yasağını, validation contract zorunluluğunu, owner decision gereksinimlerini, serial-first scheduling’i ve release hareketlerini kontrol eder.

7. AUDIT SYSTEM

Audit System iki parçadır:

- Evidence
- Trace

Evidence = karar kanıtı.
Trace = işlem geçmişi.

Mission içindeki audit unsurları:

- Validation Contract evidence
- Structured Handoff reports
- Mission progress evidence
- Worker traces
- Validator traces
- Gate decisions
- Mission completion evidence

8. SDLC PIPELINE — DETAYLI ÖRNEK

SDLC Pipeline, Nexus AI içindeki pipeline türlerinden yalnızca biridir. Mission içinde bir Pipeline Run olarak çalışabilir.

SDLC Pipeline amacı:
Sıfırdan ürün seviyesine yazılım geliştirme sürecini no-human governance ile yürütmek.

SDLC Pipeline 31 canonical stage’den oluşur:

1. intake — product_requirements_agent
2. domain_risk_profile — domain_risk_agent
3. skill_semantic_extraction — skill_librarian_agent
4. requirements — product_requirements_agent
5. requirements_review — sdlc_team_lead — no-self-approval gate
6. architecture — architecture_agent
7. architecture_review — sdlc_team_lead — no-self-approval gate
8. security_privacy_design — security_privacy_agent
9. premortem_fmea — risk_agent
10. planning — planning_agent
11. implementation — engineering_agent
12. code_review — code_reviewer_agent
13. test_generation — qa_agent
14. test_execution — qa_agent
15. verification_loop_bug_finding — qa_agent
16. security_validation — security_validation_agent
17. supply_chain_sbom_license — supply_chain_agent
18. ai_agent_safety_evaluation — agentic_safety_agent
19. privacy_data_lifecycle_validation — privacy_agent — conditional
20. api_contract_compatibility_validation — contract_validation_agent — conditional
21. domain_regulatory_compliance_validation_if_applicable — compliance_agent — conditional
22. data_migration_validation_if_applicable — data_migration_agent — conditional
23. accessibility_ux_validation_if_applicable — ux_accessibility_agent — conditional
24. performance_resilience — performance_resilience_agent
25. cost_resource_governance — cost_resource_agent — conditional
26. backup_restore_dr_validation_if_applicable — operations_readiness_agent — conditional
27. operations_readiness — operations_readiness_agent
28. evidence_graph_build — evidence_graph_agent
29. development_completion — release_manager_agent
30. release_candidate — release_manager_agent
31. refraction_learning — memory_curator_agent

9. RUNTIME GAP LAYER

Görselde ayrı bir runtime-readiness / gap layer olarak göster:

P0 zorunlu runtime bileşenleri:

- Mission System
- Validation Contract
- Structured Handoff Contract
- Mission Shared State
- Runtime Execution Kernel
- Shared Registry Loader
- Registry Resolver
- Policy Enforcement Point
- Tool Permission System
- Tool Sandbox
- Secret / Credential Boundary
- Evidence Store
- Trace Store
- Pipeline Run State Model
- Owner Decision Registry
- Runtime Workpackage Execution Contract

P1 ilk çalışan Mission + SDLC run için:

- Pipeline Runner
- Agent Invocation Contract
- Agent Message Bus
- Coordination System Enforcement
- Execution Scheduling Policy
- Gate Evaluator
- Rework / Iteration Engine
- Model Router
- Context / Memory Resolver
- Fresh Validator Context

P2 profesyonel seviye için:

- Mission Control View
- Mission Analytics
- Decision Arbitration Layer
- Prompt / Instruction Registry
- Agent Evaluation Harness
- Memory Validity / Conflict Resolver
- Resource & Budget Manager
- Risk Acceptance Contract
- Dashboard / Control Plane

P3 ölçek ve entegrasyon için:

- Cross-Pipeline Orchestration
- Tenant / Workspace Boundary
- External Nexus Integration Boundary
- Contract Versioning / Migration Policy
- Incident / Rollback Automation
- Runtime Definition of Done
- Mission Template Catalog
- Mission History Search

10. HARD NEGATIVE CONSTRAINTS

Görselde şunlar yapılmamalı:

- Plugin gösterme.
- Plugin Registry gösterme.
- Mission’ı tek agent session gibi gösterme.
- SDLC’yi tüm sistem gibi gösterme.
- Supervisor’ı Mission Orchestrator veya Team Lead gibi gösterme.
- Core Abilities’i Team içine koyma.
- Agent’ı Core Ability gibi gösterme.
- Skill ve Tool’u birleştirme.
- Governance ve Audit’i birleştirme.
- Evidence ve Trace’i birleştirme.
- Pipeline ve Team’i aynı şey gibi gösterme.
- Mission Shared State ile Shared Registry’yi aynı şey gibi gösterme.

Final görsel şunu açıkça göstermeli:

Nexus AI Orchestration Model üst yapıdır.
Mission kullanıcı hedefinden doğan ana çalışma kabıdır.
Mission birden fazla Pipeline Run içerebilir.
SDLC yalnızca bir pipeline’dır.
Team sistemi pipeline run’a atanır.
Core Abilities ortak kabiliyet katmanıdır.
Skills yöntemdir; Tools operasyonlardır.
Coordination System agent’ların birlikte çalışma desenlerini tanımlar.
Governance izin ve gate’leri yönetir.
Audit evidence ve trace’i ayrı tutar.
Runtime gap layer, blueprint’in çalışır sisteme dönüşmesi için eksik yürütme bileşenlerini gösterir.
```
