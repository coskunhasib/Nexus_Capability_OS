# 06 — Governance / Policy / Evidence Modeli

Bu doküman, AI SDLC Factory içinde no-human governance için gereken deterministik kural, evidence ve trace modelini tanımlar.

Temel ilke:

```text
AI işi yapabilir.
AI karar önerebilir.
Ama release / pass / approve kararı evidence + policy olmadan geçerli değildir.
```

## 1. Governance katmanları

```text
Agent Instruction
  ↓
Skill Method
  ↓
Tool Permission
  ↓
Pipeline Contract
  ↓
Policy Gate
  ↓
Evidence Graph
  ↓
Release Candidate Decision
```

Önemli kural:

```text
Prompt policy’nin yerine geçmez.
Team Lead policy’nin yerine geçmez.
LLM council policy’nin yerine geçmez.
```

## 2. Policy nedir?

Policy, agent/LLM çıktısından bağımsız olarak değerlendirilebilen deterministik kuraldır.

Örnek policy:

```yaml
id: no_self_approval
description: Bir agent kendi ürettiği çıktıyı onaylayamaz.
severity: blocker
evaluate:
  condition: producer_agent_id != approver_agent_id
on_fail:
  action: block_stage
```

## 3. Bloklayıcı policy kuralları

Aşağıdaki kurallar core kapsamda blocker’dır:

```yaml
policies:
  - id: no_self_approval
    severity: blocker
    rule: producer_agent_id != approver_agent_id

  - id: no_policy_bypass
    severity: blocker
    rule: team_lead_cannot_override_blocking_gate

  - id: evidence_required
    severity: blocker
    rule: every_gate_decision_requires_evidence

  - id: no_unread_skill_binding
    severity: blocker
    rule: skill_must_have_semantic_extraction_before_binding

  - id: no_plugin_core
    severity: blocker
    rule: plugin_must_not_be_required_by_core_pipeline

  - id: no_secret_read
    severity: blocker
    rule: agents_cannot_read_raw_secrets

  - id: no_silent_mutation
    severity: blocker
    rule: no_environment_or_repo_mutation_without_explicit_tool_and_trace

  - id: no_destructive_action_without_gate
    severity: blocker
    rule: destructive_tools_require_explicit_policy_and_evidence

  - id: blocker_bug_zero
    severity: blocker
    rule: open_blocker_bug_count == 0

  - id: critical_security_zero
    severity: blocker
    rule: critical_security_finding_count == 0

  - id: release_after_development_completion
    severity: blocker
    rule: release_candidate_requires_development_completion_pass
```

## 4. Advisory policy kuralları

Advisory kurallar release’i otomatik bloklamaz ama risk/evidence’a işlenir.

```yaml
advisory_policies:
  - id: major_bug_threshold
    rule: open_major_bug_count <= configured_threshold

  - id: confidence_calibrated
    rule: confidence_scores_must_include_rationale

  - id: documentation_drift
    rule: changed_behavior_requires_docs_update

  - id: residual_risk_recorded
    rule: known_residual_risks_must_be_explicit
```

## 5. Approval modeli

Approval insan onayı değildir. Approval şu kombinasyondur:

```text
stage output exists
+ reviewer output exists
+ policy gate pass
+ evidence exists
+ trace exists
= machine approval
```

## 6. No self-approval matrisi

| Producer | Reviewer / Approver |
|---|---|
| product_manager_agent | requirements_agent + team_lead_orchestrator |
| requirements_agent | architecture_agent + prompt_fidelity gate |
| architecture_agent | security_architect_agent + tech_lead_agent |
| security_architect_agent | code_reviewer_agent + release_manager_agent |
| developer_agent | code_reviewer_agent + qa_lead_agent |
| code_reviewer_agent | qa_lead_agent |
| qa_lead_agent | release_manager_agent |
| bug_hunter_subagent | qa_lead_agent + policy gate |
| release_manager_agent | policy engine + evidence auditor |
| team_lead_orchestrator | policy engine; self-approval yok |

## 7. Evidence nedir?

Evidence, bir kararın dayandığı makine-okunabilir kanıttır.

Evidence artifact olabilir ama her artifact evidence değildir.

```text
Artifact = üretilen dosya / çıktı
Evidence = karar için kullanılan, hash’lenmiş, stage/agent/gate ilişkili kanıt kaydı
```

Örnek:

```text
TEST_EXECUTION_REPORT.json artifact’tır.
Bu raporu tests_pass gate’ine bağlayan kayıt evidence’tır.
```

## 8. Evidence item şeması

```yaml
evidence_item:
  id:
  type:
  stage_id:
  producer_agent_id:
  reviewer_agent_id:
  related_skill_ids:
  related_tool_ids:
  input_artifacts:
    - path:
      sha256:
  output_artifacts:
    - path:
      sha256:
  gate_results:
    - gate_id:
      status:
      severity:
      rationale:
  trace_ids:
    -
  related_requirements:
    -
  related_risks:
    -
  related_decisions:
    -
  timestamp:
  status:
```

## 9. Evidence graph

Evidence graph şu ilişkiyi kurar:

```text
Requirement
  → Architecture Decision
  → Implementation Change
  → Test Result
  → Verification-loop Bug Finding
  → Security Validation
  → Operations Readiness
  → Development Completion
  → Release Candidate
```

Graph node türleri:

```text
requirement
decision
risk
skill_activation
tool_call
code_change
test_result
bug_finding
security_finding
performance_result
operations_artifact
gate_decision
release_candidate
```

Graph edge türleri:

```text
satisfies
implements
verifies
mitigates
blocks
approves
reviews
produces
uses_skill
uses_tool
```

## 10. Trace nedir?

Trace, ne olduğunun işlem kaydıdır.

Trace şunları içerir:

```text
agent invocation
sub-agent invocation
skill activation
tool call
handoff event
policy evaluation
rework route
```

Trace evidence değildir ama evidence’ın üretim yolunu kanıtlar.

## 11. Development completion gate

Development completion ancak şu gate’ler pass ise geçer:

```yaml
development_completion_required_gates:
  - requirements_complete
  - skill_semantics_complete
  - architecture_complete
  - security_privacy_design_complete
  - implementation_complete
  - code_review_pass
  - tests_pass
  - verification_loop_bug_finding_pass
  - security_validation_pass
  - performance_resilience_pass_or_accepted
  - operations_readiness_pass
  - evidence_graph_complete
  - no_blocker_policy_failure
```

## 12. Release candidate gate

Release candidate, development completion’dan sonra gelir.

```yaml
release_candidate_required_gates:
  - development_completion_pass
  - release_evidence_complete
  - no_blocking_policy_failure
  - residual_risk_recorded
  - rollback_plan_present
  - runbook_present
```

Nexus / publication / deploy bu aşamadan sonra opsiyoneldir.

## 13. Risk acceptance

No-human governance içinde risk acceptance tamamen serbest bırakılamaz.

Kurallar:

```text
critical security risk otomatik kabul edilemez.
blocker bug otomatik kabul edilemez.
missing evidence otomatik kabul edilemez.
unknown skill semantics otomatik kabul edilemez.
```

Advisory risk kabul edilebilir ama şu şartlarla:

```text
risk explicit yazılır
owner atanır
expiry veya review tarihi yazılır
release evidence’a bağlanır
```

## 14. Policy anti-patterns

Yasaklar:

```text
LLM output ile gate pass etmek
Team Lead override ile release yapmak
Evidence’sız approval üretmek
Reviewer agent’a code mutation yetkisi vermek
Developer agent’a own approval vermek
Skill semantic extraction olmadan skill bağlamak
Verification-loop bulgularını advisory diye geçiştirmek
Critical scanner finding’i gerekçesiz kabul etmek
```

## 15. Açık tartışma

Tartışılacak noktalar:

```text
Major bug threshold 0 mı olmalı, yoksa risk profiline göre mi değişmeli?
Performance gate her profile için blocker mı advisory mi?
Risk acceptance tamamen policy’ye mi bağlı kalmalı, yoksa council review da evidence olarak kullanılmalı mı?
Evidence graph JSON-LD benzeri graph formatına mı dönmeli?
```
