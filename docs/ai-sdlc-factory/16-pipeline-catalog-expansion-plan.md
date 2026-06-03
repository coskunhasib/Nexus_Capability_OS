# 16 — Pipeline Catalog Expansion Plan

Bu doküman, SDLC dışındaki Nexus AI pipeline türlerinin nasıl kataloglanacağını planlar.

## 1. Objective

SDLC Pipeline tamamlandıktan sonra aynı contract standardıyla diğer pipeline türlerini planlamak.

## 2. Dependency

Başlamadan önce:

```text
13-sdlc-completion-full-execution-plan.md tamamlanmalı.
SDLC final cross-review blocking finding içermemeli.
```

## 3. Initial Pipeline Catalog

İlk katalog aşağıdaki pipeline’ları içermelidir:

```text
SDLC Pipeline
Research Pipeline
Activation Pipeline
Operations Pipeline
Skill Governance Pipeline
Knowledge / Memory Pipeline
```

Aday / sonraki pipeline’lar:

```text
Content Pipeline
Data Processing Pipeline
Model / Inference Pipeline
Customer Support Pipeline
Business / Strategy Pipeline
```

## 4. Required contract per pipeline

Her pipeline şu alanlara sahip olmalıdır:

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

## 5. Research Pipeline draft scope

Purpose:

```text
Kaynaklı araştırma, kaynak güvenilirliği, claim/evidence mapping ve belirsizlik raporu üretmek.
```

Likely uses:

```text
Core Abilities: Web, Memory, Supervisor
Skills: prism, llm-council, calibrate, gap-audit
Tools: web_search, web_fetch, source_reliability_checker, claim_mapper
Governance: research_source_governance, citation_required_gate
Audit: source_evidence_schema, claim_evidence_schema
```

## 6. Activation Pipeline draft scope

Purpose:

```text
Özellik / capability / pipeline aktivasyonunu staged şekilde yönetmek.
```

Likely stages:

```text
superadmin_preview
pilot_activation
pilot_evidence_review
public_activation_decision
rollback_readiness
```

Likely governance:

```text
preview_required_gate
pilot_evidence_gate
rollback_required_gate
owner_activation_decision_gate
```

## 7. Operations Pipeline draft scope

Purpose:

```text
Incident, monitoring, runbook, rollback, postmortem ve operational learning yönetmek.
```

Likely stages:

```text
incident_intake
severity_classification
mitigation_plan
rollback_or_fix
postmortem
learning_update
```

## 8. Skill Governance Pipeline draft scope

Purpose:

```text
Skill keşfi, semantic extraction, safety audit, binding, deprecation ve update yönetmek.
```

Likely stages:

```text
skill_intake
skill_semantic_extraction
script_reference_audit
misuse_warning_generation
skill_binding_proposal
skill_activation_decision
```

## 9. Knowledge / Memory Pipeline draft scope

Purpose:

```text
Memory ingestion, summarization, validity, expiration, retrieval profile ve context pack yönetmek.
```

Likely stages:

```text
memory_intake
source_classification
summary_generation
validity_window_assignment
retrieval_profile_update
memory_expiration_review
```

## 10. Outputs

Claude Code üretmeli:

```text
docs/ai-sdlc-factory/pipeline-catalog/README.md
docs/ai-sdlc-factory/pipeline-catalog/research-pipeline.md
docs/ai-sdlc-factory/pipeline-catalog/activation-pipeline.md
docs/ai-sdlc-factory/pipeline-catalog/operations-pipeline.md
docs/ai-sdlc-factory/pipeline-catalog/skill-governance-pipeline.md
docs/ai-sdlc-factory/pipeline-catalog/knowledge-memory-pipeline.md
configs/nexus-ai/pipeline_catalog.yaml
```

## 11. Exit criteria

```text
Each pipeline follows 07-pipeline-contract-standard.md.
Each pipeline lists shared usage fields.
Each pipeline has governance and audit profile placeholders.
Each pipeline states whether team/team lead is required.
No pipeline introduces plugin.
```
