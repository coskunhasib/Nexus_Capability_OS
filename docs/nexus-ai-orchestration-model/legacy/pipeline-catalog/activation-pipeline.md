# Activation Pipeline — Catalog Definition

> **⚠️ SUPERSEDED (2026-06-13) — this markdown is no longer authoritative.** The authoritative, machine-readable definition of this pipeline is now `configs/nexus-ai/activation_pipeline.yaml` + its `stages/<...>/` contracts (professional-grade upgrade; **8 stages**). This draft is retained for narrative/history only. See `configs/nexus-ai/pipeline_catalog.yaml` for the authoritative summary catalog.

This is the catalog entry for the **Activation Pipeline** under the Nexus AI Orchestration Model. It follows the Pipeline Definition Contract in [`07-pipeline-contract-standard.md`](../07-pipeline-contract-standard.md) section 2 and applies the Shared Registry + Usage Mapping rule from [`05-shared-registry-and-usage-mapping.md`](../05-shared-registry-and-usage-mapping.md).

Scope: staged activation of a feature / capability / pipeline through **preview → pilot → public**, with rollback readiness and an owner decision gate. This is a **pipeline definition**, not a pipeline run. The SDLC Pipeline is referenced, not regenerated. No plugin is introduced. Core Abilities are capabilities, not agents. `team_lead` is the pipeline-specific `activation_team_lead` role, distinct from the `Supervisor` Core Ability.

---

## 1. Pipeline Definition Contract

```yaml
pipeline_id: activation_pipeline
name: Activation Pipeline
purpose: >
  Staged activation of a feature, capability, or pipeline through
  preview -> pilot -> public, with mandatory rollback readiness and a
  human/owner decision gate before any public activation. Promotes an
  already release-candidate artifact (produced by the SDLC Pipeline) into
  progressively wider exposure under no-self-approval governance.
version: draft-0.1
status: draft
owner_domain: activation_and_release_operations
required_team_type: activation_team
required_team_lead_role: activation_team_lead
applicable_domains:
  - feature_activation
  - capability_activation
  - pipeline_activation
  - saas
  - ai_agent_product
  - api_service
  - web_app
  - internal_tool
risk_profiles:
  - internal_preview
  - limited_pilot
  - public_general_availability
  - regulated_or_high_risk

stages:
  - activation_intake
  - superadmin_preview
  - pilot_activation
  - pilot_evidence_review
  - public_activation_decision
  - rollback_readiness
  - activation_completion

uses_core_abilities:
  - Supervisor
  - Memory
  - OS
  - Web

uses_skills:
  - sentinel
  - gap-audit
  - llm-council
  - calibrate
  - prompt-fidelity
  - refraction

uses_tools:
  - activation_flag_controller
  - cohort_selector
  - rollback_executor
  - telemetry_reader
  - artifact_writer
  - evidence_writer
  - evidence_reader
  - policy_query

uses_governance_profiles:
  - activation_pipeline_governance
  - no_self_approval_policy
  - evidence_required_policy
  - preview_required_gate
  - pilot_evidence_gate
  - rollback_required_gate
  - owner_activation_decision_gate

uses_audit_schemas:
  - activation_evidence_schema
  - activation_decision_evidence_schema
  - rollback_readiness_evidence_schema
  - stage_gate_trace_schema
  - activation_transition_trace_schema

uses_model_provider_profiles:
  - supervisor_routing_model
  - activation_reasoning_model
  - risk_analysis_model

uses_context_memory_profiles:
  - activation_run_context
  - preview_context_pack
  - pilot_evidence_context_pack
  - activation_decision_context_pack

entry_criteria:
  - target_artifact_is_release_candidate_or_higher
  - sdlc_release_candidate_evidence_present
  - activation_scope_defined
  - target_cohorts_defined
  - rollback_owner_assigned

exit_criteria:
  - requested_activation_stage_reached
  - activation_evidence_complete
  - rollback_plan_validated
  - owner_activation_decision_recorded_for_public_scope
  - no_blocking_policy_failure

blocking_conditions:
  - pilot_activation_attempted_without_superadmin_preview_pass
  - public_activation_attempted_without_pilot_evidence
  - public_activation_attempted_without_validated_rollback_plan
  - public_activation_without_owner_decision
  - self_approval_of_activation_decision
  - missing_release_candidate_evidence

allowed_rework_routes:
  - preview_failure: superadmin_preview
  - pilot_failure: pilot_activation
  - insufficient_pilot_evidence: pilot_evidence_review
  - rollback_not_ready: rollback_readiness
  - owner_decision_rejected: pilot_evidence_review
  - scope_or_intake_gap: activation_intake

required_evidence:
  - ACTIVATION_REQUEST
  - PREVIEW_RESULT
  - PILOT_RESULT
  - PILOT_EVIDENCE_REVIEW_REPORT
  - ROLLBACK_PLAN
  - ROLLBACK_READINESS_REPORT
  - ACTIVATION_DECISION
  - ACTIVATION_COMPLETION_REPORT

required_trace:
  - activation_transition_trace
  - preview_activation_trace
  - pilot_activation_trace
  - rollback_drill_trace
  - owner_decision_trace
  - policy_evaluation_trace
```

---

## 2. Per-stage detail

Each stage names its purpose, `owner_agent` (a snake_case Agent role under the `activation_team`, not a Core Ability), key gates, and `on_pass` / `on_fail` routing. The `activation_team_lead` orchestrates routing and may query policy state, but does not own a stage, approve its own decisions, or bypass any gate.

### 2.1 activation_intake

- **Purpose:** Capture the activation request; confirm the target is an SDLC release candidate (or higher) with required evidence; define activation scope, target cohorts, and the rollback owner. Establishes which staged scope (preview / pilot / public) is being requested.
- **owner_agent:** `activation_manager_agent`
- **Key gates:** `release_candidate_evidence_present`, `activation_scope_defined`, `rollback_owner_assigned`
- **on_pass:** `superadmin_preview`
- **on_fail:** `activation_intake` (request incomplete — missing scope, cohorts, or release-candidate evidence)

### 2.2 superadmin_preview

- **Purpose:** Activate the target in a restricted superadmin/internal-only context to confirm it behaves as expected before any external exposure. Smoke-checks behavior, telemetry wiring, and that the activation flag is controllable. Enforces `preview_required_gate` — no pilot may begin without a passing preview.
- **owner_agent:** `activation_manager_agent`
- **Key gates:** `preview_required_gate`, `preview_behaves_as_expected`, `telemetry_observable_in_preview`
- **on_pass:** `pilot_activation`
- **on_fail:** `superadmin_preview` (re-run preview), escalate to `activation_intake` if scope is wrong

### 2.3 pilot_activation

- **Purpose:** Activate the target for a bounded pilot cohort selected via the cohort selector. Collect real-usage telemetry and incident signals under controlled exposure. Pilot must run against a defined cohort with rollback reachable at all times.
- **owner_agent:** `pilot_activation_agent`
- **Key gates:** `pilot_cohort_bounded`, `pilot_telemetry_collected`, `rollback_reachable_during_pilot`
- **on_pass:** `pilot_evidence_review`
- **on_fail:** `pilot_activation` (re-scope or re-run pilot); if the pilot is unsafe, route to `rollback_readiness` to exercise rollback before retry

### 2.4 pilot_evidence_review

- **Purpose:** Independently review pilot evidence (telemetry, error rates, incidents, user signal) against activation acceptance thresholds. This is a separate-owner review — the reviewer is not the pilot owner (no self-approval). Enforces `pilot_evidence_gate`: public activation is impossible without sufficient pilot evidence.
- **owner_agent:** `activation_reviewer_agent`
- **Key gates:** `pilot_evidence_gate`, `pilot_acceptance_thresholds_met`, `no_unresolved_pilot_blocker`
- **on_pass:** `public_activation_decision`
- **on_fail:** `pilot_activation` (insufficient or failing evidence — return to pilot for more data or remediation)

### 2.5 public_activation_decision

- **Purpose:** The human/owner decision gate. The owner reviews pilot evidence, the validated rollback plan, and residual risk, then explicitly decides whether to authorize public (general-availability) activation. This decision is recorded as evidence and cannot be self-approved by any stage-owning agent. The decision gate must be satisfied **before** broad activation is executed; rollback readiness is confirmed in the next stage prior to completion.
- **owner_agent:** `activation_owner_decision_agent` (records and routes the human/owner decision; the authorizing actor is the human owner, not an autonomous agent)
- **Key gates:** `owner_activation_decision_gate`, `no_self_approval_policy`, `rollback_plan_present`
- **on_pass:** `rollback_readiness`
- **on_fail:** `pilot_evidence_review` (owner rejects or defers — return for more evidence or remediation before re-deciding)

### 2.6 rollback_readiness

- **Purpose:** Before completing public activation, validate that the rollback plan is real and executable: rollback owner assigned, rollback executor wired, rollback drill/dry-run performed, and recovery signals observable. Enforces `rollback_required_gate` — public activation cannot complete without a validated rollback path.
- **owner_agent:** `rollback_readiness_agent`
- **Key gates:** `rollback_required_gate`, `rollback_plan_validated`, `rollback_drill_passed`
- **on_pass:** `activation_completion`
- **on_fail:** `rollback_readiness` (fix and re-drill the rollback plan); block completion until rollback is proven

### 2.7 activation_completion

- **Purpose:** Execute the authorized activation at the approved scope, assemble the full activation evidence package and traceability, confirm all gates passed, and record completion. Captures activation lessons for memory (refraction) so future activations are calibrated.
- **owner_agent:** `activation_manager_agent`
- **Key gates:** `activation_evidence_complete`, `all_required_gates_passed`, `no_blocking_policy_failure`
- **on_pass:** `done`
- **on_fail:** route to the relevant failed stage (e.g. `rollback_readiness` or `pilot_evidence_review`) per `allowed_rework_routes`

---

## 3. Team, team-lead, governance and audit notes

### Required team and team-lead

- **required_team_type:** `activation_team`
- **required_team_lead_role:** `activation_team_lead`

The `activation_team_lead` is a pipeline-specific orchestration role. It selects routes, assigns stage owners, queries policy/evidence state, and performs rework routing — but it does **not** own a stage, write the activation artifact, approve its own decisions, or bypass any gate. It is **not** the `Supervisor` Core Ability; `Supervisor` may be used as a capability but never substitutes for `activation_team_lead`. Stage `owner_agent` values (`activation_manager_agent`, `pilot_activation_agent`, `activation_reviewer_agent`, `activation_owner_decision_agent`, `rollback_readiness_agent`) are Agent roles, not Core Abilities. The reviewer / decision owners are deliberately distinct from the pilot/activation owners to satisfy `no_self_approval_policy`.

### Governance placeholders

`activation_pipeline_governance` is the pipeline-level profile. Its core rules (consistent with `03-governance-and-audit-layering.md` §4): no pilot activation without a passing superadmin preview; no public activation without sufficient pilot evidence; a validated rollback plan is mandatory before public completion; and the public activation decision is a human/owner gate that cannot be self-approved. These are enforced through the gate-style profiles `preview_required_gate`, `pilot_evidence_gate`, `rollback_required_gate`, and `owner_activation_decision_gate`, layered on the shared `no_self_approval_policy` and `evidence_required_policy`. Each profile is listed both here (usage) and is expected in the Phase C / E shared governance registry (ownership).

### Audit placeholders

Audit keeps Evidence and Trace separate. **Evidence schemas:** `activation_evidence_schema` (reused from `03-governance-and-audit-layering.md` §13: PREVIEW_RESULT, PILOT_RESULT, ACTIVATION_DECISION, ROLLBACK_PLAN), plus `activation_decision_evidence_schema` and `rollback_readiness_evidence_schema` for the decision and rollback-readiness records. **Trace schemas:** `activation_transition_trace_schema` for stage transitions and the shared `stage_gate_trace_schema` for gate decisions. Required evidence items are decision artifacts; required trace items (e.g. `owner_decision_trace`, `rollback_drill_trace`) are process history that supports — but is distinct from — that evidence.

### Locked-decision compliance

- Plugin: not introduced anywhere.
- Top structure: catalog entry under the Nexus AI Orchestration Model.
- SDLC: referenced as the upstream producer of the release candidate, not regenerated.
- Core Abilities used as capabilities only (`Supervisor`, `Memory`, `OS`, `Web`); never as agents.
- `owner_agent` values are snake_case Agent roles; `team_lead` is `activation_team_lead`, not `Supervisor`.
- Skill ≠ Tool, Governance ≠ Audit, Evidence ≠ Trace boundaries preserved.
- Canonical skills used per locked semantics (`sentinel` = premortem/foresight, `prompt-fidelity`, `gap-audit`, `llm-council`, `calibrate`, `refraction`). `prism` (divergence) and `verification-loop` (bug finding) were intentionally not bound, as activation promotes an already-built artifact rather than brainstorming or hunting defects.
```
