# 19 — Governance and Audit Implementation Readiness Plan

Bu doküman, Governance ve Audit katmanlarını uygulanabilir config standardına taşımayı planlar.

## 1. Objective

Governance ve Audit kavramlarını yalnız prose olmaktan çıkarıp, pipeline/team/stage/core ability/skill/tool seviyesinde uygulanabilir sözleşmelere dönüştürmek.

## 2. Dependency

Başlamadan önce:

```text
Pipeline Catalog draft complete
Shared Registry baseline complete
Team / Agent / Sub-agent catalogs draft complete
```

## 3. Governance layers

```text
Global Governance
Pipeline Governance
Team Governance
Stage Governance
Core Ability Governance
Skill Governance
Tool Governance
```

## 4. Governance profile contract

Her governance profile şu alanlara sahip olmalıdır:

```yaml
governance_profile_id:
scope:
purpose:
applies_to:
severity_default:
rules:
required_evidence:
required_trace:
owner:
escalation:
```

## 5. Rule contract

Her rule şu alanlara sahip olmalıdır:

```yaml
rule_id:
description:
severity:
required_when:
pass_condition:
fail_condition:
on_fail:
rework_route:
evidence_required:
trace_required:
```

## 6. Global Governance minimum

```text
plugin_absent
no_secret_exposure
no_policy_bypass
trace_required
raw_credential_redaction
high_risk_action_default_deny
```

## 7. SDLC Pipeline Governance minimum

```text
development_completion_requires_all_required_gates
release_candidate_requires_development_completion
blocker_bug_zero
critical_security_zero
supply_chain_required
agentic_safety_required
applicable_conditional_gates_required
```

## 8. Core Ability Governance minimum

```text
Supervisor governance
Coder governance
Memory governance
Web governance
OS governance
Vision governance
Audio governance
Creative governance
```

OS and Web must have higher default risk than pure reasoning abilities.

## 9. Skill Governance minimum

```text
prism usage rules
verification-loop usage rules
sentinel usage rules
llm-council usage rules
gap-audit usage rules
```

Required locked semantics:

```text
prism = brainstorming / divergent thinking
verification-loop = bug / defect finding
```

## 10. Tool Governance minimum

Tools with side effects must define:

```text
sandbox requirement
timeout
allowed callers
trace requirement
risk level
```

## 11. Audit layers

Audit must preserve:

```text
Evidence != Trace
Decision Evidence != Tool Trace
Pipeline Evidence != Stage Evidence
```

## 12. Audit schema contract

Every audit schema must include:

```yaml
audit_schema_id:
type:
applies_to:
required_fields:
producer:
consumer:
retention:
redaction_rules:
```

## 13. Outputs

Claude Code should generate:

```text
configs/nexus-ai/governance/global.yaml
configs/nexus-ai/governance/pipeline/*.yaml
configs/nexus-ai/governance/team/*.yaml
configs/nexus-ai/governance/stage/*.yaml
configs/nexus-ai/governance/core-ability/*.yaml
configs/nexus-ai/governance/skill/*.yaml
configs/nexus-ai/governance/tool/*.yaml
configs/nexus-ai/audit/evidence_schemas/*.yaml
configs/nexus-ai/audit/trace_schemas/*.yaml
docs/ai-sdlc-factory/reviews/governance-audit-readiness-review.md
```

## 14. Validation

Claude Code must check:

```text
Every governance profile references a known scope.
Every rule has severity.
Every blocker rule has on_fail behavior.
Every audit schema preserves evidence/trace distinction.
No plugin governance is introduced.
```

## 15. Exit criteria

```text
Governance configs exist for all required layers.
Audit schemas exist for evidence and trace.
SDLC required gates can be evaluated from configs.
No blocking review findings remain.
```
