# Operations Pipeline — Catalog Definition

> **⚠️ SUPERSEDED (2026-06-13) — this markdown is no longer authoritative.** The authoritative, machine-readable definition of this pipeline is now `configs/nexus-ai/operations_pipeline.yaml` + its `stages/<...>/` contracts (professional-grade upgrade; **7 stages**). This draft is retained for narrative/history only. See `configs/nexus-ai/pipeline_catalog.yaml` for the authoritative summary catalog.

This document is the catalog entry for the **Operations Pipeline** within the
**Nexus AI Orchestration Model**. It follows the Pipeline Definition Contract
defined in [`07-pipeline-contract-standard.md`](../07-pipeline-contract-standard.md)
section 2, and applies the Shared Registry + Usage Mapping rule from
[`05-shared-registry-and-usage-mapping.md`](../05-shared-registry-and-usage-mapping.md).

Scope: incident handling, monitoring, runbook execution, rollback/fix decisions,
postmortem, and operational learning for already-released / live capabilities.

Boundaries honored:

- This pipeline does **not** regenerate the SDLC Pipeline. It consumes SDLC
  release artifacts (`RUNBOOK`, `ROLLBACK_PLAN`, `OBSERVABILITY_PLAN`,
  `INCIDENT_RESPONSE_PLAN`) produced by the SDLC `operations_readiness` stage and
  references the SDLC Pipeline rather than reproducing it.
- It is one catalog entry under the Nexus AI Orchestration Model; it is not a
  plugin (plugin is cancelled and never reintroduced).
- The Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]`
  are abilities, not agents. Each stage `owner_agent` below is a snake_case Agent
  role. The pipeline `required_team_lead_role` is `operations_team_lead`, a
  pipeline-specific lead role, **not** the `Supervisor` Core Ability.
- Skill != Tool, Governance != Audit, Evidence != Trace are preserved throughout.

---

## 1. Pipeline Definition Contract

```yaml
pipeline_id: operations_pipeline
name: Operations Pipeline
purpose: >-
  Live-operations lifecycle for released Nexus AI capabilities: detect and intake
  incidents, classify severity, build a mitigation plan, decide and execute
  rollback-or-fix, run a mandatory postmortem, and feed operational learning back
  into memory and the SDLC. Consumes SDLC operations-readiness artifacts
  (RUNBOOK, ROLLBACK_PLAN, OBSERVABILITY_PLAN, INCIDENT_RESPONSE_PLAN); does not
  regenerate the SDLC Pipeline.
version: draft-0.1
status: draft
owner_domain: operations_reliability
required_team_type: operations_team
required_team_lead_role: operations_team_lead
applicable_domains:
  - software_product
  - saas
  - ai_agent_product
  - api_service
  - web_app
  - internal_tool
risk_profiles:
  - low_severity_incident
  - degraded_service
  - major_incident
  - critical_outage_or_safety_event

stages:
  - incident_intake
  - severity_classification
  - mitigation_plan
  - rollback_or_fix
  - postmortem
  - learning_update

uses_core_abilities:
  - Supervisor
  - Memory
  - OS
  - Web
  - Coder

uses_skills:
  - sentinel
  - fmea
  - gap-audit
  - refraction
  - bayesian-update
  - calibrate

uses_tools:
  - incident_intake_tool
  - monitoring_query_tool
  - alert_correlator
  - severity_classifier_tool
  - runbook_executor
  - rollback_executor
  - mitigation_plan_builder
  - postmortem_builder
  - artifact_writer
  - evidence_writer
  - evidence_reader
  - memory_write
  - policy_query

uses_governance_profiles:
  - operations_pipeline_governance
  - no_self_approval_policy
  - evidence_required_policy
  - incident_severity_required_gate
  - mitigation_plan_required_gate
  - rollback_runbook_evidence_gate
  - postmortem_required_gate

uses_audit_schemas:
  - incident_evidence_schema
  - severity_classification_evidence_schema
  - mitigation_plan_evidence_schema
  - rollback_fix_evidence_schema
  - postmortem_evidence_schema
  - operational_learning_evidence_schema
  - stage_gate_trace_schema

uses_model_provider_profiles:
  - supervisor_routing_model
  - incident_triage_model
  - operations_analysis_model
  - postmortem_reasoning_model
  - learning_reflection_model

uses_context_memory_profiles:
  - operations_run_context
  - incident_context_pack
  - operations_context_pack
  - postmortem_context_pack
  - learning_context_pack

entry_criteria:
  - incident_signal_received  # alert, monitoring breach, page, or human/agent report
  - target_capability_is_released  # operations applies to live, post-SDLC capabilities
  - operations_team_assigned
  - operations_team_lead_assigned

exit_criteria:
  - incident_resolved_or_mitigated
  - severity_classification_recorded
  - rollback_or_fix_outcome_recorded
  - postmortem_completed_for_qualifying_incidents
  - operational_learning_recorded
  - no_blocking_policy_failure

blocking_conditions:
  - missing_severity_classification
  - missing_mitigation_plan_for_active_incident
  - rollback_or_fix_lacks_runbook_or_rollback_evidence
  - postmortem_missing_for_required_severity
  - self_approved_resolution  # actor approving its own mitigation/postmortem
  - missing_required_evidence

allowed_rework_routes:
  - severity_classification -> incident_intake
  - mitigation_plan -> severity_classification
  - rollback_or_fix -> mitigation_plan
  - postmortem -> rollback_or_fix
  - learning_update -> postmortem

required_evidence:
  - INCIDENT_RECORD
  - SEVERITY_CLASSIFICATION_REPORT
  - MITIGATION_PLAN
  - ROLLBACK_OR_FIX_REPORT
  - POSTMORTEM_REPORT
  - OPERATIONAL_LEARNING_RECORD

required_trace:
  - incident_intake_trace
  - severity_classification_trace
  - mitigation_plan_trace
  - rollback_or_fix_trace
  - postmortem_trace
  - learning_update_trace
  - stage_gate_decision_trace
```

> Conditional note (per section 13 of the contract standard): `postmortem` is
> **mandatory** for `major_incident` and `critical_outage_or_safety_event`
> severity profiles, and required-when `severity >= major OR rollback_executed == true`.
> For `low_severity_incident`, a lightweight postmortem record is still produced so
> that `learning_update` always has an input; it is not a release blocker but the
> `POSTMORTEM_REPORT` evidence item must exist.

---

## 2. Per-stage definitions

Each stage below lists its purpose, the `owner_agent` (a snake_case Agent role
under `operations_team`), the key gates, and `on_pass` / `on_fail` routing.
All gate names below appear in the `uses_governance_profiles` and the
`blocking_conditions` of the contract above.

### 2.1 incident_intake

- **Purpose:** Receive, deduplicate, and normalize an incident signal (alert,
  monitoring breach, page, or human/agent report) into a single `INCIDENT_RECORD`
  with timeline anchor, affected capability, and initial observations. Correlates
  alerts so duplicate signals collapse into one incident.
- **owner_agent:** `incident_intake_agent`
- **uses (mapping):** Core Abilities `Memory`, `OS`, `Web`; Skills `gap-audit`
  (completeness of the intake record); Tools `incident_intake_tool`,
  `monitoring_query_tool`, `alert_correlator`, `artifact_writer`, `evidence_writer`;
  Governance `operations_pipeline_governance`, `evidence_required_policy`; Audit
  `incident_evidence_schema`, `stage_gate_trace_schema`.
- **Key gates:** `incident_record_present`, `affected_capability_identified`,
  `duplicate_signals_correlated`.
- **on_pass:** `severity_classification`
- **on_fail:** `incident_intake` (re-collect signal / fill missing fields; loop
  until an actionable `INCIDENT_RECORD` exists)

### 2.2 severity_classification

- **Purpose:** Assign a severity level using failure-mode reasoning and blast-radius
  analysis. Severity classification is **mandatory** before any mitigation work
  may begin. Produces `SEVERITY_CLASSIFICATION_REPORT` with severity, blast radius,
  customer/safety impact, and confidence.
- **owner_agent:** `severity_classification_agent`
- **uses (mapping):** Core Abilities `Memory`, `Web`; Skills `fmea` (failure-mode
  and effect reasoning), `sentinel` (adversarial blast-radius foresight),
  `bayesian-update` (revise severity as evidence arrives), `calibrate` (confidence
  calibration of the severity estimate); Tools `severity_classifier_tool`,
  `monitoring_query_tool`, `artifact_writer`, `evidence_writer`; Governance
  `incident_severity_required_gate`, `operations_pipeline_governance`; Audit
  `severity_classification_evidence_schema`, `stage_gate_trace_schema`.
- **Key gates:** `severity_assigned` (blocker — satisfies
  `incident_severity_required_gate`), `blast_radius_estimated`,
  `severity_confidence_recorded`.
- **on_pass:** `mitigation_plan`
- **on_fail:** `incident_intake` (insufficient signal to classify; gather more
  evidence before classifying)

### 2.3 mitigation_plan

- **Purpose:** Produce an actionable `MITIGATION_PLAN` for the classified incident:
  candidate containment/mitigation options, chosen option with rationale, the
  rollback-vs-fix recommendation, and the runbook reference(s) to be executed. A
  mitigation plan is required for any active (non-resolved) incident.
- **owner_agent:** `mitigation_planning_agent`
- **uses (mapping):** Core Abilities `Supervisor`, `Memory`; Skills `sentinel`
  (premortem the mitigation before committing), `fmea` (rank options by failure
  mode), `gap-audit` (plan completeness vs runbook coverage); Tools
  `mitigation_plan_builder`, `runbook_executor` (dry-run / readiness check only at
  this stage), `evidence_reader` (reads SDLC `RUNBOOK` / `ROLLBACK_PLAN`),
  `artifact_writer`, `evidence_writer`; Governance `mitigation_plan_required_gate`,
  `operations_pipeline_governance`, `no_self_approval_policy`; Audit
  `mitigation_plan_evidence_schema`, `stage_gate_trace_schema`.
- **Key gates:** `mitigation_plan_present` (blocker — satisfies
  `mitigation_plan_required_gate`), `rollback_or_fix_decision_recommended`,
  `runbook_reference_resolved`.
- **on_pass:** `rollback_or_fix`
- **on_fail:** `severity_classification` (plan cannot be formed at the recorded
  severity; reclassify with new information)

### 2.4 rollback_or_fix

- **Purpose:** Execute the chosen path — roll back to a known-good state via the
  SDLC `ROLLBACK_PLAN`, or apply a forward fix via the `RUNBOOK` — and capture the
  outcome with execution evidence. Produces `ROLLBACK_OR_FIX_REPORT` and the
  decision/outcome record. Either path must be backed by runbook or rollback
  evidence.
- **owner_agent:** `incident_response_agent`
- **uses (mapping):** Core Abilities `OS`, `Coder`, `Memory`; Skills `verification-loop`
  *(only when a forward fix is applied — bug/defect confirmation that the fix
  resolves the incident defect)*, `sentinel` (pre-execution premortem of the
  rollback/fix step); Tools `rollback_executor`, `runbook_executor`,
  `monitoring_query_tool` (confirm recovery), `artifact_writer`, `evidence_writer`;
  Governance `rollback_runbook_evidence_gate`, `operations_pipeline_governance`,
  `no_self_approval_policy`; Audit `rollback_fix_evidence_schema`,
  `stage_gate_trace_schema`.
- **Key gates:** `rollback_or_fix_executed`, `runbook_or_rollback_evidence_present`
  (blocker — satisfies `rollback_runbook_evidence_gate`),
  `service_recovery_confirmed`.
- **on_pass:** `postmortem`
- **on_fail:** `mitigation_plan` (execution failed or recovery not confirmed;
  re-plan mitigation)

### 2.5 postmortem

- **Purpose:** Run a blameless postmortem: reconstruct the timeline, identify root
  cause(s) and contributing failure modes, and produce corrective/preventive
  actions. Postmortem is **mandatory** (always required for `major_incident` and
  `critical_outage_or_safety_event`; a lightweight `POSTMORTEM_REPORT` is still
  produced for lower severities so `learning_update` always has an input).
- **owner_agent:** `postmortem_agent`
- **uses (mapping):** Core Abilities `Memory`, `Supervisor`; Skills `fmea`
  (root-cause / failure-mode analysis), `gap-audit` (completeness of timeline,
  causes, and corrective actions), `calibrate` (confidence on root-cause claims);
  Tools `postmortem_builder`, `evidence_reader`, `artifact_writer`,
  `evidence_writer`; Governance `postmortem_required_gate`,
  `operations_pipeline_governance`, `no_self_approval_policy`; Audit
  `postmortem_evidence_schema`, `stage_gate_trace_schema`.
- **Key gates:** `postmortem_present` (blocker for required severities — satisfies
  `postmortem_required_gate`), `root_cause_identified`,
  `corrective_actions_defined`, `no_self_approved_postmortem`.
- **on_pass:** `learning_update`
- **on_fail:** `rollback_or_fix` (postmortem reveals the incident is not actually
  mitigated / recovery was illusory; return to response)

### 2.6 learning_update

- **Purpose:** Convert the postmortem into durable operational learning: update
  memory with lessons learned, propose runbook/rollback/observability
  improvements, and hand corrective actions back toward the SDLC Pipeline as a
  future-improvement backlog (referencing SDLC, not regenerating it). Produces
  `OPERATIONAL_LEARNING_RECORD`.
- **owner_agent:** `operational_learning_agent`
- **uses (mapping):** Core Ability `Memory`; Skills `refraction` (canonical
  learning/reflection skill), `bayesian-update` (update priors on incident
  likelihood), `calibrate` (calibrate future severity/effort estimates); Tools
  `memory_write`, `artifact_writer`, `evidence_writer`; Governance
  `operations_pipeline_governance`, `evidence_required_policy`; Audit
  `operational_learning_evidence_schema`, `stage_gate_trace_schema`.
- **Key gates:** `operational_learning_record_present`,
  `improvement_backlog_handed_off`.
- **on_pass:** `done`
- **on_fail:** `postmortem` (learning cannot be derived; the postmortem is
  incomplete and must be revised). `learning_update` is **not** an incident-resolution
  blocker — the incident is already mitigated by this point — but the
  `OPERATIONAL_LEARNING_RECORD` evidence item must exist for clean pipeline exit.

---

## 3. Team, team-lead, governance and audit placeholders

### 3.1 Required team and team lead

- **required_team_type:** `operations_team` — the ownership/responsibility boundary
  that runs this pipeline. It owns all six stages above and is distinct from the
  SDLC `sdlc_team` and the SDLC `release_operations_team` (which handles
  pre-release operations readiness, not live incident handling).
- **required_team_lead_role:** `operations_team_lead` — a pipeline-specific lead
  role. Per the locked decision and `02-concept-boundaries.md` section 4, this is
  **not** the `Supervisor` Core Ability. `operations_team_lead` may select routes,
  assign stage owners, request evidence, and route rework, but may not bypass any
  gate, may not approve its own work, and may not perform a `rollback_or_fix`
  execution itself (that is owned by `incident_response_agent`). The `Supervisor`
  Core Ability may be *used* for routing within the team but does not replace the
  `operations_team_lead` role.

### 3.2 Governance placeholders (Governance = what is allowed / what is blocked)

Pipeline-specific governance profiles introduced for this catalog entry:

- `operations_pipeline_governance` — umbrella governance for the pipeline.
- `incident_severity_required_gate` — severity classification is mandatory before
  mitigation begins.
- `mitigation_plan_required_gate` — an active incident must have a mitigation plan.
- `rollback_runbook_evidence_gate` — any rollback-or-fix must carry runbook or
  rollback execution evidence.
- `postmortem_required_gate` — postmortem mandatory (always for `major_incident` /
  `critical_outage_or_safety_event`).

Reused canonical (cross-pipeline) governance profiles: `no_self_approval_policy`,
`evidence_required_policy`.

### 3.3 Audit placeholders (Audit = what happened / what is the proof)

Pipeline-specific audit schemas introduced for this catalog entry:
`incident_evidence_schema`, `severity_classification_evidence_schema`,
`mitigation_plan_evidence_schema`, `rollback_fix_evidence_schema`,
`postmortem_evidence_schema`, `operational_learning_evidence_schema`. The
cross-pipeline `stage_gate_trace_schema` is reused for gate-decision traces.

Evidence vs Trace is preserved: the `required_evidence` items
(`INCIDENT_RECORD`, `SEVERITY_CLASSIFICATION_REPORT`, `MITIGATION_PLAN`,
`ROLLBACK_OR_FIX_REPORT`, `POSTMORTEM_REPORT`, `OPERATIONAL_LEARNING_RECORD`) are
decision evidence; the `required_trace` items (`*_trace`,
`stage_gate_decision_trace`) are the operation history that shows how that evidence
was produced.

### 3.4 Forward-phase note

All newly-introduced (non-canonical) governance profile, audit schema, tool,
model/provider profile, and context/memory profile names above are placeholders to
be formalized in later phases: Phase C (Shared Registry formalization, plan
[`17-shared-registry-formalization-plan.md`](../17-shared-registry-formalization-plan.md))
and Phase E (Governance / Audit readiness, plan
[`19-governance-audit-readiness-plan.md`](../19-governance-audit-readiness-plan.md)).
All skills used (`sentinel`, `fmea`, `gap-audit`, `refraction`, `bayesian-update`,
`calibrate`, and conditionally `verification-loop`) are canonical shared skills; no
non-canonical skill is introduced.
