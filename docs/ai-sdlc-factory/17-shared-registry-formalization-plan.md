# 17 — Shared Registry Formalization Plan

Bu doküman, Nexus AI Shared Registry katmanının makine-okunabilir hale getirilmesini planlar.

## 1. Objective

Shared Registry altında yer alan tüm ortak kategorileri ayrı registry dosyalarına dönüştürmek.

Shared categories:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

## 2. Dependency

Başlamadan önce:

```text
SDLC Completion Execution complete
Pipeline Catalog draft complete
```

## 3. Registry rule

Her registry item şu alanlara sahip olmalıdır:

```yaml
id:
name:
type:
status:
purpose:
owner_domain:
allowed_usage:
forbidden_usage:
governance_profiles:
audit_schemas:
notes:
```

## 4. Core Abilities Registry

Output:

```text
configs/nexus-ai/core_abilities.yaml
```

Canonical entries:

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

Required fields:

```yaml
id:
category: core_ability
model_provider_profiles:
exposed_tools:
governance_profiles:
audit_schemas:
allowed_callers:
forbidden_usage:
```

Rules:

```text
Core Ability must not be listed as Agent.
Supervisor must not be listed as Team Lead.
```

## 5. Skills Registry

Output:

```text
configs/nexus-ai/skills_registry.yaml
```

Canonical skill examples:

```text
prism
verification-loop
sentinel
llm-council
fmea
adr-builder
gap-audit
prompt-fidelity
calibrate
refraction
```

Rules:

```text
Skill appears by name in main hierarchy.
Skill internals remain in skill inventory/audit docs.
Every skill must have semantic_category, primary_purpose, allowed_usage, forbidden_usage.
```

## 6. Tools Registry

Output:

```text
configs/nexus-ai/tools_registry.yaml
```

Required fields:

```yaml
id:
category: tool
provided_by_core_ability:
input_schema:
output_schema:
side_effects:
risk_level:
requires_sandbox:
governance_profiles:
audit_schemas:
allowed_callers:
```

## 7. Governance Profiles Registry

Output:

```text
configs/nexus-ai/governance_profiles.yaml
```

Types:

```text
global
pipeline
team
stage
core_ability
skill
tool
```

## 8. Audit Schemas Registry

Output:

```text
configs/nexus-ai/audit_schemas.yaml
```

Types:

```text
evidence_schema
trace_schema
decision_record_schema
gate_result_schema
```

## 9. Model / Provider Profiles Registry

Output:

```text
configs/nexus-ai/model_provider_profiles.yaml
```

Required fields:

```yaml
id:
used_by:
provider_type:
model_family:
capability_scope:
resource_limits:
fallback_policy:
governance_profiles:
audit_schemas:
```

## 10. Context / Memory Profiles Registry

Output:

```text
configs/nexus-ai/context_memory_profiles.yaml
```

Required fields:

```yaml
id:
scope:
used_by:
source_priority:
retention:
validity_window:
retrieval_rules:
redaction_rules:
governance_profiles:
audit_schemas:
```

## 11. Validation

Claude Code must check:

```text
Every shared category has a registry file.
Every registry item has status.
Every registry item has at least one usage mapping or status candidate.
No plugin registry exists.
Core Ability / Agent boundary preserved.
```

## 12. Outputs

```text
configs/nexus-ai/core_abilities.yaml
configs/nexus-ai/skills_registry.yaml
configs/nexus-ai/tools_registry.yaml
configs/nexus-ai/governance_profiles.yaml
configs/nexus-ai/audit_schemas.yaml
configs/nexus-ai/model_provider_profiles.yaml
configs/nexus-ai/context_memory_profiles.yaml
docs/ai-sdlc-factory/reviews/shared-registry-formalization-review.md
```

## 13. Exit criteria

```text
All registry files exist.
All registry files parse.
No category is only described in prose.
Usage mapping rule is enforceable from registry data.
```
