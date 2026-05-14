# 03 — Profile Taxonomy

## Amaç

Profile taxonomy, Team Compiler'ın hangi iş tipi için hangi agent profillerini seçeceğini belirler. Profil aileleri soyut kategorilerdir; gerçek yürütme somut `AgentProfile` kayıtlarıyla yapılır.

## Profile families

| Family | Rolü |
|---|---|
| Strategy & Product | Problem, kapsam, roadmap, requirement çıkarımı |
| Research & Intelligence | Teknik, akademik, vendor, pazar, regülasyon araştırması |
| Architecture & System Design | Sistem sınırı, interface, ADR, modülerlik |
| Software Engineering | Uygulama geliştirme, integration, DB, QA automation |
| Hardware / Embedded / Firmware | MCU, driver, PCB, testbench, safety |
| AI / Agent / Automation | LLM app, agent, tool, memory, context, eval |
| Data / Analytics | ETL, metrics, BI, eval data, experiment |
| Security / Privacy / Trust | Threat model, permission, prompt/tool trust |
| QA / Verification / Review | Spec review, code quality, ultrareview, edge cases |
| DevOps / Platform / Release | CI/CD, deploy, rollback, observability |
| Documentation / Knowledge / Memory | Docs, changelog, handoff, memory curator |
| UX / UI / Design | UX flow, UI design, design system, accessibility |

## Agent profile schema

```yaml
profile_id: frontend-web-engineer
family: software-engineering
domain: frontend
platform: web
stack_variant: generic
status: draft | active | deprecated
mission:
  - Ürün gereksinimini UI bileşenlerine ve state davranışına çevirir.
does:
  - component tree çıkarır
  - UI state modelini kurar
  - API contract ile ekranı eşler
does_not:
  - backend iş mantığını sahiplenmez
  - product scope kararı vermez
inputs:
  - product_brief
  - ux_flow
  - api_contract
outputs:
  - implemented_ui
  - ui_state_matrix
  - frontend_handoff
required_skills:
  - frontend-quality-gate
  - spec-compliance-review
allowed_tools:
  - code_editor
  - browser_preview
  - test_runner
restricted_tools:
  - privileged_environment_access
quality_gates:
  - ui-state-coverage
  - accessibility-baseline
handoff_in:
  - ux-flow-designer
  - backend-api-engineer
handoff_out:
  - qa-automation-engineer
  - release-engineer
memory_policy:
  save:
    - design decisions
    - reusable component patterns
  do_not_save:
    - temporary implementation guesses
context_policy:
  working_set:
    - current component files
    - api contract
failure_modes:
  - güzel ama gereksinimi karşılamayan UI
  - mock data ile çalışıp gerçek API ile kırılma
  - loading/empty/error state eksikliği
eval_cases:
  - missing_api_contract_case
  - mobile_responsive_break_case
```

## Core profile set — v0

İlk ürün çekirdeği için minimum profil seti:

```text
Universal
  - requirement-extractor
  - system-architect
  - planning-agent
  - spec-compliance-reviewer
  - code-quality-reviewer
  - memory-curator
  - context-manager
  - security-reviewer
  - documentation-agent
  - release-agent

Software
  - frontend-web-engineer
  - backend-api-engineer
  - database-engineer
  - mobile-engineer
  - qa-automation-engineer
  - devops-engineer

Embedded / Hardware
  - firmware-engineer
  - embedded-linux-engineer
  - hardware-interface-reviewer

AI / Agentic
  - llm-app-engineer
  - agent-orchestrator
  - tool-designer
  - eval-engineer
  - guardrail-engineer
```

## Profil tasarım kuralları

1. Her profil `does` ve `does_not` içermelidir.
2. Her profil en az bir input ve bir output sözleşmesi taşımalıdır.
3. Her profil için failure modes yazılmalıdır.
4. Profil aileleri role classification içindir; yürütmede somut agent profile kullanılmalıdır.
5. Stack özelleştirmesi profilin üçüncü katmanıdır: domain → platform → stack.
