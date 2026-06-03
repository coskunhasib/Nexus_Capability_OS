# 18 — Team / Agent / Sub-agent Catalog Plan

Bu doküman, Nexus AI pipeline run’larında kullanılacak Team, Team Lead, Agent ve Sub-agent kataloglarının nasıl oluşturulacağını planlar.

## 1. Objective

Pipeline-specific organizasyon rollerini makine-okunabilir sözleşmelere dönüştürmek.

## 2. Dependency

Başlamadan önce:

```text
Pipeline Catalog draft complete
Shared Registry baseline complete
SDLC stage contracts complete
```

## 3. Core hierarchy

```text
Team
└── Team Lead
    ├── Agents
    │   └── Sub-agents
    └── Direct Sub-agents
```

## 4. Team Template Contract

Her team template şu alanlara sahip olmalıdır:

```yaml
team_id:
team_type:
pipeline_id:
purpose:
team_lead_role:
agents:
direct_sub_agents:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
permissions:
forbidden_actions:
```

## 5. Team Lead Role Contract

```yaml
team_lead_id:
team_id:
pipeline_id:
mission:
responsibilities:
may_assign_agents:
may_call_direct_sub_agents:
may_use_core_abilities:
may_use_skills:
may_call_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_context_memory_profiles:
forbidden_actions:
blocking_limits:
```

## 6. Agent Role Contract

```yaml
agent_id:
team_id:
pipeline_id:
mission:
owned_stages:
inputs:
outputs:
sub_agents:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
permissions:
forbidden_actions:
blocking_conditions:
reviewed_by:
```

## 7. Sub-agent Role Contract

```yaml
sub_agent_id:
parent_agent:
team_lead_direct_call_allowed:
mission:
activation_conditions:
inputs:
outputs:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
permissions:
forbidden_actions:
returns_to:
blocks_when:
```

## 8. Required initial catalogs

Claude Code should generate:

```text
configs/nexus-ai/team_templates.yaml
configs/nexus-ai/team_lead_roles.yaml
configs/nexus-ai/agent_roles.yaml
configs/nexus-ai/sub_agent_roles.yaml
```

## 9. SDLC team minimum

SDLC Team must include at minimum:

```text
SDLC Team Lead
Product / Requirements Agent
Domain / Risk Agent
Skill Librarian Agent
Architecture Agent
Security / Privacy Agent
Risk Agent
Planning Agent
Engineering Agent
Code Reviewer Agent
QA Agent
Security Validation Agent
Supply Chain Agent
Agentic Safety Agent
Compliance Agent
Privacy Agent
Contract Validation Agent
Data Migration Agent
UX / Accessibility Agent
Performance / Resilience Agent
Cost / Resource Agent
Operations Readiness Agent
Evidence Graph Agent
Release Manager Agent
Memory Curator Agent
```

## 10. Required sub-agents

Initial SDLC sub-agents:

```text
Skill Semantic Extractor Sub-agent
API Design Sub-agent
Data Model Sub-agent
Threat Modeling Sub-agent
Security Scan Interpreter Sub-agent
Test Generation Sub-agent
Bug Hunter Sub-agent
Evidence Trace Sub-agent
```

## 11. Boundary rules

```text
Core Abilities must not appear in agent_roles.yaml.
Supervisor must not appear as SDLC Team Lead.
Sub-agent must have parent_agent unless explicitly direct-call allowed.
Agent cannot approve own work.
Reviewer cannot mutate reviewed artifact.
Release Manager cannot bypass failed governance gate.
```

## 12. Validation

Claude Code must check:

```text
Every SDLC stage has an owner_agent in agent_roles.yaml.
Every sub-agent reference exists in sub_agent_roles.yaml.
Every agent uses only known shared registry items.
No plugin field exists.
Core Ability boundary preserved.
```

## 13. Outputs

```text
configs/nexus-ai/team_templates.yaml
configs/nexus-ai/team_lead_roles.yaml
configs/nexus-ai/agent_roles.yaml
configs/nexus-ai/sub_agent_roles.yaml
docs/ai-sdlc-factory/reviews/team-agent-subagent-catalog-review.md
```

## 14. Exit criteria

```text
All role catalogs parse.
All SDLC stage owner agents exist.
No orphan sub-agents exist.
No Core Ability is listed as an Agent.
```
