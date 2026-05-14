# 04 — Team Compiler Rules

## Amaç

Team Compiler, kullanıcı intent'inden uygun macro pipeline, micro pipeline, agent profile, skill/tool/plugin seti ve quality gate kombinasyonunu üretir.

## Compiler akışı

```text
Intent Intake
  → Problem Classification
  → Macro Pipeline Selection
  → Micro Pipeline Selection
  → Team Profile Assembly
  → Capability Pack Selection
  → Gate Injection
  → Memory/Context Contract Binding
  → Execution Plan Skeleton
```

## Intent classification fields

```yaml
intent:
  domain: software | firmware | optics | hvac | water | mechanical | market | content | health | agriculture | ai-automation
  target_output: code | report | design | prototype | bom | rfq | analysis | dashboard | workflow
  risk_level: low | medium | high | safety-critical
  evidence_need: low | medium | high
  freshness_need: stable | current | live
  platform: web | mobile | desktop | mcu | cloud | edge | document | physical-system
  stack_hint: optional
  constraints:
    - budget
    - timeline
    - safety
    - manufacturing
    - privacy
```

## Team assembly rule

Her team üç katmandan oluşur:

```text
Core roles
  - requirement-extractor
  - system/planning role
  - spec-compliance-reviewer
  - memory-curator

Domain roles
  - iş tipine özgü implementer/researcher/designer roller

Review roles
  - quality, safety, security, evidence veya release reviewer
```

## Örnek kurallar

### Web SaaS MVP

```yaml
if:
  domain: software
  platform: web
  target_output: working_product
then:
  macro_pipeline: software-development
  micro_pipelines:
    - frontend-web
    - backend-api
    - database
    - qa-automation
    - devops
  team:
    - requirement-extractor
    - system-architect
    - frontend-web-engineer
    - backend-api-engineer
    - database-engineer
    - qa-automation-engineer
    - security-reviewer
    - release-agent
    - memory-curator
  gates:
    - spec-compliance
    - api-contract-fit
    - test-evidence
    - security-review
    - release-readiness
```

### STM32 HVAC Driver

```yaml
if:
  domain: firmware
  platform: mcu
  stack_hint: stm32
  contains: hvac
then:
  macro_pipeline: firmware-pcb-embedded-control
  micro_pipelines:
    - stm32-firmware
    - hvac-driver-circuits
    - bench-test-validation
  team:
    - requirement-extractor
    - embedded-architect
    - firmware-engineer
    - hardware-interface-reviewer
    - safety-reviewer
    - testbench-engineer
    - documentation-agent
    - memory-curator
  gates:
    - electrical-safety
    - timing
    - isolation
    - bench-evidence
    - release-readiness
```

### Agentic System

```yaml
if:
  domain: ai-automation
  contains: agentic | tool | memory | context
then:
  macro_pipeline: software-development
  micro_pipelines:
    - agentic-system
    - ai-app-llm-app
    - qa-automation
  team:
    - agent-architect
    - tool-designer
    - memory-engineer
    - context-engineer
    - eval-engineer
    - guardrail-engineer
    - prompt-safety-auditor
    - observability-engineer
  gates:
    - tool-trust
    - memory-policy-fit
    - context-budget
    - eval-coverage
    - prompt-safety
```

## Conflict resolution

1. Safety-critical > speed.
2. Evidence need high ise research/evidence gates zorunludur.
3. Freshness need current/live ise web/research profile eklenir.
4. Physical system varsa safety/reliability reviewer eklenir.
5. Tool/plugin içeren agentic sistemlerde trust/permission gates zorunludur.
6. UI içeren her işte frontend-quality veya UX/UI review gate eklenir.

## Compiler output contract

```yaml
compiled_team:
  intent_summary: string
  selected_macro_pipeline: id
  selected_micro_pipelines: id[]
  selected_profiles: id[]
  selected_capability_packs: id[]
  injected_gates: id[]
  memory_policy: id
  context_policy: id
  missing_inputs: string[]
  risks: string[]
  next_execution_stage: id
```
