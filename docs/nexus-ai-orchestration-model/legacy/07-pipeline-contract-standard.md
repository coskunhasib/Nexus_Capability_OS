# 07 — Pipeline Contract Standard

Bu doküman, Nexus AI içindeki tüm pipeline’lar için tekrar kullanılabilir sözleşme standardını tanımlar.

Amaç:

```text
SDLC Pipeline oluştururken öğrendiklerimizi standartlaştırmak
Gelecekte Research, Activation, Operations ve diğer pipeline’ların aynı kaliteyle kurulmasını sağlamak
Pipeline tanımı ile pipeline run’ı ayırmak
Shared Registry + Usage Mapping kuralını tüm pipeline’lara zorunlu kılmak
```

## 1. Standart kapsam

Bu standart tüm pipeline türleri için geçerlidir:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
Content Pipeline
Data / Knowledge Pipeline
future pipelines
```

## 2. Pipeline Definition Contract

Her pipeline definition şu alanlara sahip olmalıdır:

```yaml
pipeline_id:
name:
purpose:
version:
status:
owner_domain:
required_team_type:
required_team_lead_role:
applicable_domains:
risk_profiles:
stages:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
entry_criteria:
exit_criteria:
blocking_conditions:
allowed_rework_routes:
required_evidence:
required_trace:
```

## 3. Pipeline Run Contract

Her pipeline run şu alanlara sahip olmalıdır:

```yaml
run_id:
pipeline_id:
pipeline_version:
run_goal:
run_status:
selected_pipeline:
assigned_team:
team_lead:
active_stage:
completed_stages:
blocked_stages:
run_context:
governance_state:
evidence:
trace:
used_core_abilities:
used_skills:
used_tools:
used_governance_profiles:
used_audit_schemas:
used_model_provider_profiles:
used_context_memory_profiles:
open_questions:
blocking_findings:
next_action:
```

## 4. Pipeline Stage Contract

Her stage şu alanlara sahip olmalıdır:

```yaml
stage_id:
name:
purpose:
owner_team:
team_lead:
owner_agent:
sub_agents:
uses_core_abilities:
uses_skills:
uses_tools:
uses_governance_profiles:
uses_audit_schemas:
uses_model_provider_profiles:
uses_context_memory_profiles:
inputs:
outputs:
evidence:
trace:
gates:
on_pass:
on_fail:
rework_route:
blocking_conditions:
optional_conditions:
conditional_required_gates:
```

## 5. Shared Registry + Usage Mapping requirement

Her pipeline, stage, team, team lead, agent ve sub-agent kullanımlarında şu kategorileri açıkça göstermelidir:

```text
uses Core Abilities
uses Skills
uses Tools
uses Governance Profiles
uses Audit Schemas
uses Model / Provider Profiles
uses Context / Memory Profiles
```

Bu alanlar boşsa bile boş olarak görünmelidir.

Örnek:

```yaml
uses_core_abilities: []
uses_skills: []
uses_tools: []
uses_governance_profiles: []
uses_audit_schemas: []
uses_model_provider_profiles: []
uses_context_memory_profiles: []
```

## 6. Team Contract

Her pipeline team şu alanlara sahip olmalıdır:

```yaml
team_id:
team_type:
pipeline_id:
team_lead:
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

## 7. Team Lead Contract

Her team lead şu alanlara sahip olmalıdır:

```yaml
team_lead_id:
team_id:
pipeline_id:
mission:
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

## 8. Agent Contract

Her agent şu alanlara sahip olmalıdır:

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

## 9. Sub-agent Contract

Her sub-agent şu alanlara sahip olmalıdır:

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

## 10. Gate Contract

Her gate şu alanlara sahip olmalıdır:

```yaml
gate_id:
name:
scope:
severity:
required_when:
inputs:
pass_condition:
fail_condition:
evidence_required:
trace_required:
on_pass:
on_fail:
rework_route:
owner:
```

Severity değerleri:

```text
blocker
major
advisory
informational
```

## 11. Evidence Contract

Her evidence item şu alanlara sahip olmalıdır:

```yaml
evidence_id:
type:
produced_by:
related_pipeline:
related_run:
related_stage:
related_agent:
related_sub_agent:
related_gate:
source_artifacts:
summary:
status:
created_at:
```

## 12. Trace Contract

Her trace item şu alanlara sahip olmalıdır:

```yaml
trace_id:
type:
actor:
action:
related_pipeline:
related_run:
related_stage:
related_skill:
related_tool:
related_core_ability:
input_refs:
output_refs:
status:
timestamp:
```

## 13. Conditional gate rule

Koşullu gate açık yazılmalıdır.

Örnek:

```yaml
accessibility_ux_validation:
  required_when: product_has_ui == true

data_migration_validation:
  required_when: data_model_changed == true or migration_changed == true

api_contract_validation:
  required_when: api_changed == true or public_interface_changed == true
```

## 14. Pipeline completeness rule

Bir pipeline tam tanımlı sayılmaz, eğer:

```text
stage listesi yoksa
team/team lead ilişkisi yoksa
shared usage alanları yoksa
governance profile yoksa
audit schema yoksa
pass/fail/rework route yoksa
required evidence yoksa
conditional gates görünür değilse
```

## 15. Standardization rule

SDLC Pipeline’dan öğrenilen sözleşme standardı tüm pipeline’lar için temel kabul edilir.

Ancak her pipeline kendi özel governance, audit, team ve evidence ihtiyaçlarını tanımlayabilir.

Doğru yaklaşım:

```text
shared standard
+ pipeline-specific specialization
```

Yanlış yaklaşım:

```text
her pipeline için sıfırdan farklı format
veya
her pipeline’a SDLC formatını kör uygulamak
```

## 16. Next step

Bu standarttan sonra hazırlanacak ilk özel sözleşme:

```text
SDLC Pipeline Definition
SDLC Pipeline Run Contract
SDLC Stage Contracts
```
