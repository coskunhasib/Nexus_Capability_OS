# AI Studio Hierarchy Visualization Prompt

Use this prompt to generate a hierarchy visualization for the Nexus AI Orchestration Model.

```text
Nexus AI Orchestration Model için üstten en alta kadar tam hiyerarşi görselleştirmesi oluştur.

Bu görsel yalnızca SDLC Pipeline’ı göstermemeli. SDLC, Nexus AI altındaki pipeline türlerinden sadece biridir. Görselin ana amacı, Nexus AI’ın tüm ana hiyerarşik yapısını, paylaşılan registry sistemini, pipeline sistemini, team/agent/sub-agent yapısını, core abilities ayrımını, skills/tools ayrımını, coordination system’i, governance ve audit ayrımını, ayrıca SDLC Pipeline’ı detaylı örnek olarak göstermektir.

Tasarım dili, stil, renk, layout, ikon, yön, yerleşim ve görsel metafor açısından serbestsin. Ancak kavramsal hiyerarşi ve ayrımlar korunmalı.

EN ÜST SEVİYE:

Nexus AI Orchestration Model

Ana sistem aileleri:

1. Shared Registry System
2. Pipeline System
3. Team System
4. Core Abilities Layer
5. Skills and Tools Layer
6. Coordination System
7. Governance System
8. Audit System

ÖNEMLİ AYRIMLAR:

- Nexus AI Orchestration Model en üst yapıdır.
- SDLC üst yapı değildir; yalnızca bir pipeline türüdür.
- Plugin yoktur. Plugin registry, plugin marketplace veya plugin lifecycle gösterilmemelidir.
- Pipeline, Team değildir.
- Pipeline Definition, Pipeline Run değildir.
- Agent, Core Ability değildir.
- Core Abilities hiçbir Team’in üyesi değildir.
- Supervisor, SDLC Team Lead değildir.
- Skill, Tool değildir.
- Governance, Audit değildir.
- Evidence, Trace değildir.
- Shared Registry ve Usage Mapping farklı şeylerdir.

1. SHARED REGISTRY SYSTEM

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

Usage Mapping alanları:

- uses_core_abilities
- uses_skills
- uses_tools
- uses_governance_profiles
- uses_audit_schemas
- uses_model_provider_profiles
- uses_context_memory_profiles

2. PIPELINE SYSTEM

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

Candidate pipelines ayrı gösterilebilir:

- Content Pipeline
- Data Processing Pipeline
- Model / Inference Pipeline
- Customer Support Pipeline
- Business / Strategy Pipeline

Pipeline Definition = süreç şablonu.
Pipeline Run = bu şablonun gerçek çalıştırılan örneği.

Pipeline Run şunları içerir:

- selected_pipeline
- assigned_team
- active_stage
- run_context
- governance_state
- evidence_state
- trace_state
- stage_results
- rework_history
- final_decision

3. TEAM SYSTEM

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

Team Lead rolleri:

- sdlc_team_lead
- research_team_lead
- activation_team_lead
- operations_team_lead
- skill_governance_team_lead
- knowledge_team_lead

Supervisor ≠ Team Lead.
Supervisor bir Core Ability’dir.
Team Lead bir Team rolüdür.

4. COORDINATION SYSTEM

Team System = kim var?
Coordination System = bunlar nasıl birlikte çalışıyor?

Coordination System altında beş pattern göster:

1. Delegation
   - Bir agent alt görevi başka agent’a veya sub-agent’a verir.
   - Örnek: SDLC Team Lead → Architecture Agent → Threat Modeling Sub-agent.

2. Creator-Verifier
   - Bir agent üretir, farklı agent kontrol eder.
   - Örnek: Engineering Agent kod yazar, Code Reviewer Agent kontrol eder.
   - Kendi işini onaylama yasaktır.

3. Controlled Direct Communication
   - Agent’lar doğrudan konuşabilir ama sadece kontrollü ve trace edilen message bus üzerinden.
   - Görünmez peer-to-peer state yok.
   - Secret paylaşımı yok.
   - Policy bypass yok.

4. Negotiation / Arbitration
   - Agent’lar trade-off önerir.
   - Son karar policy + evidence + gate ile verilir.
   - Blocking gate, agent görüşünden üstündür.

5. Broadcast / Event Bus
   - Önemli state değişiklikleri ilgili sistemlere duyurulur.
   - Örnek event’ler: stage_started, gate_failed, evidence_written, security_blocker_found, rework_required, release_blocked, owner_decision_required.

5. GOVERNANCE SYSTEM

Governance = policy, gates, permissions, risk rules.

Katmanlar:

- Global Governance
- Pipeline Governance
- Team Governance
- Stage Governance
- Core Ability Governance
- Skill Governance
- Tool Governance

Governance tool çağrılarını, stage geçişlerini, gate sonuçlarını, self-approval yasağını, risk acceptance kararlarını ve release hareketlerini kontrol eder.

6. AUDIT SYSTEM

Audit System iki parçadır:

- Evidence
- Trace

Evidence = karar kanıtı.
Trace = işlem geçmişi.

Evidence örnekleri:

- REQUIREMENTS_SPEC
- NFR_COVERAGE_REPORT
- ARCHITECTURE_DECISION
- ADR_RECORD
- THREAT_MODEL
- RISK_REGISTER
- TEST_REPORT
- BUG_FINDING_REPORT
- SECURITY_SCAN_REPORT
- SBOM_REPORT
- LICENSE_REPORT
- PERFORMANCE_REPORT
- OPERATIONS_READINESS_REPORT
- RELEASE_EVIDENCE
- DEVELOPMENT_COMPLETION_REPORT

Trace örnekleri:

- agent invocation
- sub-agent invocation
- skill activation
- tool call
- core ability invocation
- model invocation
- policy evaluation
- pipeline transition
- stage transition
- rework route
- iteration event
- broadcast event

7. SDLC PIPELINE — DETAYLI ÖRNEK

SDLC Pipeline, Nexus AI içindeki pipeline türlerinden yalnızca biridir.

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

SDLC always-required gates:

1. requirements_complete
2. nfr_coverage_complete
3. architecture_complete
4. adr_coverage_complete
5. security_privacy_design_complete
6. risk_register_reviewed
7. implementation_scope_clean
8. code_review_pass
9. tests_pass
10. verification_loop_bug_finding_pass
11. security_validation_pass
12. supply_chain_pass
13. license_pass
14. sbom_present
15. performance_resilience_pass_or_accepted
16. agentic_safety_eval_pass
17. operations_readiness_pass
18. evidence_graph_complete
19. no_blocking_policy_failure

SDLC conditional-required gates:

1. accessibility_pass_if_applicable
2. data_migration_pass_if_applicable
3. privacy_lifecycle_pass_if_applicable
4. api_contract_compatibility_pass_if_applicable
5. backup_restore_dr_pass_if_applicable
6. compliance_pass_if_applicable
7. cost_resource_governance_pass_if_applicable

SDLC karar formülü:

agent output
+ deterministic gates
+ evidence
+ trace
+ policy
= machine-verifiable stage decision

SDLC release hattı:

operations_readiness
→ evidence_graph_build
→ development_completion
→ release_candidate
→ refraction_learning

Release Candidate, Development Completion’dan önce gelmemelidir.

8. RUNTIME GAP LAYER

Görselde ayrı bir runtime-readiness / gap layer olarak göster:

P0 zorunlu runtime bileşenleri:

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

P1 ilk çalışan SDLC run için:

- Pipeline Runner
- Agent Invocation Contract
- Agent Message Bus
- Coordination System Enforcement
- Gate Evaluator
- Rework / Iteration Engine
- Model Router
- Context / Memory Resolver

P2 profesyonel seviye için:

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

9. HARD NEGATIVE CONSTRAINTS

Görselde şunlar yapılmamalı:

- Plugin gösterme.
- Plugin Registry gösterme.
- SDLC’yi tüm sistem gibi gösterme.
- Supervisor’ı Team Lead gibi gösterme.
- Core Abilities’i Team içine koyma.
- Agent’ı Core Ability gibi gösterme.
- Skill ve Tool’u birleştirme.
- Governance ve Audit’i birleştirme.
- Evidence ve Trace’i birleştirme.
- Pipeline ve Team’i aynı şey gibi gösterme.
- Pipeline Definition ve Pipeline Run’ı aynı şey gibi gösterme.

Final görsel şunu açıkça göstermeli:

Nexus AI Orchestration Model üst yapıdır.
SDLC yalnızca bir pipeline’dır.
Birden fazla pipeline vardır.
Team sistemi pipeline run’a atanır.
Core Abilities ortak kabiliyet katmanıdır.
Skills yöntemdir; Tools operasyonlardır.
Coordination System agent’ların birlikte çalışma desenlerini tanımlar.
Governance izin ve gate’leri yönetir.
Audit evidence ve trace’i ayrı tutar.
Runtime gap layer, blueprint’in çalışır sisteme dönüşmesi için eksik yürütme bileşenlerini gösterir.
```
