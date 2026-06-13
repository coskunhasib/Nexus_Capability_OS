# Knowledge / Memory Pipeline — Catalog Definition

> **⚠️ SUPERSEDED (2026-06-13) — this markdown is no longer authoritative.** The authoritative, machine-readable definition of this pipeline is now `configs/nexus-ai/knowledge_memory_pipeline.yaml` + its `stages/<...>/` contracts (professional-grade upgrade; **7 stages**). This draft is retained for narrative/history only. See `configs/nexus-ai/pipeline_catalog.yaml` for the authoritative summary catalog.

This document is one catalog entry inside the **Nexus AI Orchestration Model**. It defines the
Knowledge / Memory Pipeline using the **Pipeline Definition Contract** from
`docs/ai-sdlc-factory/07-pipeline-contract-standard.md` (section 2).

It is a documentation / blueprint artifact. It defines a pipeline; it does not run one and it does
not deploy anything.

## Locked-decision notes for this entry

- **Memory stays a Core Ability.** This pipeline governs the *knowledge lifecycle* (ingest →
  classify → summarize → set validity → update retrieval → review expiry). It does **not** promote
  the `Memory` Core Ability into an agent. The Core Abilities
  `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` remain abilities, not agents.
- **owner_agent values are snake_case Agent roles**, never Core Abilities and never the team lead.
- **team_lead is pipeline-specific**: `knowledge_team_lead` (not `Supervisor`).
- **Skill ≠ Tool**, **Governance ≠ Audit**, **Evidence ≠ Trace** are kept distinct throughout.
- Skills used are canonical: `gap-audit`, `calibrate`, `refraction`, `bayesian-update`
  (semantics: `prism` = brainstorming/divergence, `verification-loop` = bug/defect finding — neither
  is needed by this lifecycle pipeline, so neither is claimed).
- No plugin concept is referenced or reintroduced.
- SDLC is referenced, not regenerated. The shared contract standard it produced
  (`07-pipeline-contract-standard.md`) is the template this entry follows.

---

## 1. Pipeline Definition Contract

```yaml
pipeline_id: knowledge_memory_pipeline
name: Knowledge / Memory Pipeline
purpose: >
  Govern the knowledge / memory lifecycle for Nexus AI: ingest candidate memory, classify its
  source, summarize it, assign a validity window, update the affected retrieval profile, and review
  expiration. Memory remains a Core Ability; this pipeline curates what that ability is allowed to
  remember, for how long, and how it is retrieved. It does not turn Memory into an agent.
version: draft-0.1
status: draft
owner_domain: knowledge_management
required_team_type: knowledge_team
required_team_lead_role: knowledge_team_lead
applicable_domains:
  - knowledge_base
  - long_term_memory
  - retrieval_augmented_context
  - context_pack_curation
  - reference_corpus
risk_profiles:
  - internal_knowledge
  - shared_operational_memory
  - sensitive_or_regulated_knowledge
  - external_sourced_knowledge

stages:
  - memory_intake
  - source_classification
  - summary_generation
  - validity_window_assignment
  - retrieval_profile_update
  - memory_expiration_review

uses_core_abilities:
  - Memory
  - Supervisor
  - Web

uses_skills:
  - gap-audit
  - calibrate
  - refraction
  - bayesian-update

uses_tools:
  - memory_ingestor
  - source_classifier
  - summary_writer
  - validity_window_calculator
  - retrieval_profile_writer
  - expiration_scanner
  - redaction_tool
  - provenance_recorder
  - artifact_writer
  - evidence_writer

uses_governance_profiles:
  - memory_source_governance
  - validity_window_required_gate
  - redaction_required_gate

uses_audit_schemas:
  - memory_provenance_schema
  - stage_gate_trace_schema

uses_model_provider_profiles:
  - knowledge_reasoning_profile
  - summarization_model
  - supervisor_routing_model

uses_context_memory_profiles:
  - knowledge_run_context
  - memory_candidate_context_pack
  - retrieval_profile_context_pack

entry_criteria:
  - candidate_memory_item_present
  - candidate_origin_reference_present
  - target_knowledge_scope_declared

exit_criteria:
  - source_classification_complete
  - summary_generated_and_calibrated
  - validity_window_assigned
  - retrieval_profile_updated_or_explicitly_skipped
  - expiration_review_outcome_recorded
  - memory_provenance_evidence_complete

blocking_conditions:
  - source_classification_missing
  - unredacted_sensitive_content_detected
  - validity_window_missing
  - provenance_record_missing
  - retrieval_profile_update_without_validity_window

allowed_rework_routes:
  - source_classification -> memory_intake
  - summary_generation -> source_classification
  - validity_window_assignment -> source_classification
  - retrieval_profile_update -> validity_window_assignment
  - memory_expiration_review -> validity_window_assignment

required_evidence:
  - MEMORY_INTAKE_RECORD
  - SOURCE_CLASSIFICATION_REPORT
  - MEMORY_SUMMARY
  - VALIDITY_WINDOW_DECISION
  - RETRIEVAL_PROFILE_UPDATE_REPORT
  - MEMORY_EXPIRATION_REVIEW_REPORT
  - MEMORY_PROVENANCE_RECORD

required_trace:
  - memory_intake_trace
  - source_classification_trace
  - summary_generation_skill_activation_trace
  - validity_window_assignment_trace
  - retrieval_profile_update_trace
  - memory_expiration_review_trace
```

---

## 2. Per-stage definitions

Each stage below lists its **purpose**, its **owner_agent** (a snake_case Agent role — not a Core
Ability, not the team lead), the **key gates** it must clear, and **on_pass / on_fail** routing.
`Memory` appears as a used Core Ability inside stages, which is the correct relationship: agents
*use* the Memory ability; the ability is never the owner.

### 2.1 memory_intake

- **Purpose:** Receive a candidate memory item plus its origin reference, normalize it into a
  candidate record, and confirm minimum intake metadata before anything is classified or stored.
- **owner_agent:** `knowledge_intake_agent`
- **Uses (mapping):** Core Abilities `[Memory]`; Tools `[memory_ingestor, provenance_recorder,
  artifact_writer, evidence_writer]`; Governance `[memory_source_governance]`; Audit
  `[memory_provenance_schema]`.
- **Key gates:**
  - `intake_metadata_complete` (blocker) — candidate item, origin reference, and target knowledge
    scope are all present.
  - `provenance_seed_recorded` (blocker) — an initial provenance record exists for the candidate.
- **on_pass:** `source_classification`
- **on_fail:** reject the candidate and stop intake (no downstream stage runs for an item that
  cannot be provenance-seeded).

### 2.2 source_classification

- **Purpose:** Classify the candidate's source — origin type, trust tier, sensitivity, and whether
  redaction is required — so that every later decision (summary framing, validity window, retrieval
  exposure) inherits a governed classification.
- **owner_agent:** `source_classification_agent`
- **Uses (mapping):** Core Abilities `[Memory, Web]`; Skills `[gap-audit]` (find missing or
  inconsistent source attributes); Tools `[source_classifier, redaction_tool, provenance_recorder,
  evidence_writer]`; Governance `[memory_source_governance, redaction_required_gate]`; Audit
  `[memory_provenance_schema, stage_gate_trace_schema]`.
- **Key gates:**
  - `source_trust_tier_assigned` (blocker) — a trust tier is recorded.
  - `sensitivity_classified` (blocker) — sensitivity level is recorded.
  - `redaction_applied_if_required` (blocker, conditional: `required_when:
    sensitivity_requires_redaction == true`) — sensitive content is redacted before it can be
    summarized or stored.
- **on_pass:** `summary_generation`
- **on_fail:** `memory_intake` (re-collect or correct the candidate / its origin reference).

### 2.3 summary_generation

- **Purpose:** Produce a faithful, well-scoped summary of the (already classified, already redacted)
  memory item, calibrated so that stated confidence matches actual support in the source.
- **owner_agent:** `memory_summarization_agent`
- **Uses (mapping):** Core Abilities `[Memory]`; Skills `[calibrate]` (confidence calibration of the
  summary); Tools `[summary_writer, provenance_recorder, artifact_writer, evidence_writer]`;
  Governance `[memory_source_governance]`; Audit `[memory_provenance_schema, stage_gate_trace_schema]`;
  Model/Provider `[summarization_model]`.
- **Key gates:**
  - `summary_grounded_in_source` (blocker) — the summary cites / links the classified source; no
    unsupported additions.
  - `summary_confidence_calibrated` (major) — `calibrate` outcome recorded; over/under-confident
    summaries are routed back.
- **on_pass:** `validity_window_assignment`
- **on_fail:** `source_classification` (a summary that cannot be grounded usually signals a
  classification or redaction problem upstream).

### 2.4 validity_window_assignment

- **Purpose:** Assign how long this memory is considered valid — a validity window with a start, an
  expiry / review horizon, and the rationale — using source trust tier and decay expectations.
- **owner_agent:** `validity_window_agent`
- **Uses (mapping):** Core Abilities `[Memory]`; Skills `[bayesian-update]` (update validity /
  staleness expectation as evidence accrues); Tools `[validity_window_calculator,
  provenance_recorder, evidence_writer]`; Governance `[validity_window_required_gate]`; Audit
  `[memory_provenance_schema, stage_gate_trace_schema]`.
- **Key gates:**
  - `validity_window_present` (blocker) — every retained memory has an explicit validity window;
    "no window" is not an allowed state.
  - `validity_rationale_recorded` (major) — the basis for the chosen window (trust tier, decay
    assumption) is recorded as evidence.
- **on_pass:** `retrieval_profile_update`
- **on_fail:** `source_classification` (an un-assignable window usually means the source tier /
  sensitivity is unresolved).

### 2.5 retrieval_profile_update

- **Purpose:** Update the affected retrieval profile / context pack so the curated memory becomes
  retrievable under the right scope, with exposure bounded by its sensitivity and validity window.
- **owner_agent:** `retrieval_profile_agent`
- **Uses (mapping):** Core Abilities `[Memory]`; Skills `[gap-audit]` (detect retrieval coverage
  gaps or conflicts after the update); Tools `[retrieval_profile_writer, provenance_recorder,
  evidence_writer]`; Governance `[memory_source_governance, validity_window_required_gate]`; Audit
  `[memory_provenance_schema, stage_gate_trace_schema]`; Context/Memory
  `[retrieval_profile_context_pack]`.
- **Key gates:**
  - `update_bound_to_validity_window` (blocker) — no profile update is written for a memory that has
    no validity window (mirrors the `retrieval_profile_update_without_validity_window` blocking
    condition).
  - `sensitivity_exposure_consistent` (blocker) — retrieval exposure does not exceed the
    classified sensitivity (e.g. sensitive memory is not placed into a broadly-readable profile).
- **on_pass:** `memory_expiration_review`
- **on_fail:** `validity_window_assignment` (re-derive or correct the window before exposing the
  memory).

### 2.6 memory_expiration_review

- **Purpose:** Review memories whose validity window has reached its horizon: decide refresh,
  re-validate, downgrade, or expire/retire — and feed lifecycle learning back into how windows are
  set. This is the recurring "knowledge does not silently rot" stage.
- **owner_agent:** `memory_expiration_agent`
- **Uses (mapping):** Core Abilities `[Memory]`; Skills `[refraction]` (lifecycle / learning
  reflection on what expired and why), `[bayesian-update]` (revise staleness expectation); Tools
  `[expiration_scanner, retrieval_profile_writer, provenance_recorder, evidence_writer]`; Governance
  `[validity_window_required_gate, memory_source_governance]`; Audit `[memory_provenance_schema,
  stage_gate_trace_schema]`.
- **Key gates:**
  - `expiration_outcome_recorded` (blocker) — every reviewed item gets an explicit outcome
    (refreshed / re-validated / downgraded / expired); silent retention is not allowed.
  - `expired_memory_retired_from_retrieval` (blocker, conditional: `required_when: outcome ==
    expired`) — expired memory is removed from the active retrieval profile.
- **on_pass:** pipeline run complete (memory provenance evidence is finalized).
- **on_fail:** `validity_window_assignment` (reopen the window decision for items that should be
  refreshed / re-validated rather than expired).

---

## 3. Team, team lead, and governance / audit placeholders

### 3.1 Required team and team lead

- **required_team_type:** `knowledge_team`
- **required_team_lead_role:** `knowledge_team_lead`

The `knowledge_team_lead` is the pipeline-specific orchestration role for this pipeline. It routes
between stages, requests rework along the allowed routes, and checks governance / evidence state. It
is **not** `Supervisor` and it is **not** one of the Core Abilities. Consistent with the core model,
the team lead orchestrates and cannot bypass a gate, approve its own output, or expose memory that
fails a blocking gate. The stage owner agents listed in section 2 are the workers; the `Memory`
Core Ability is *used by* those agents and is never an owner.

### 3.2 Governance placeholders (new — to be formalized in Phase E)

- `memory_source_governance` — governs source admissibility, trust tiers, and sensitivity handling
  across the lifecycle.
- `validity_window_required_gate` — enforces that every retained memory carries a validity window
  and that retrieval updates are bound to it.
- `redaction_required_gate` — enforces redaction of sensitive content before summarization, storage,
  or retrieval exposure.

### 3.3 Audit placeholder (new — to be formalized in Phase E)

- `memory_provenance_schema` — the evidence/provenance schema capturing origin reference, source
  classification, summary linkage, validity window, retrieval-profile changes, and expiration
  outcome for each memory item. (`stage_gate_trace_schema` is reused from the existing shared audit
  registry.)

### 3.4 Shared Registry + Usage Mapping note

Per `05-shared-registry-and-usage-mapping.md`, every shared item this pipeline uses appears in the
pipeline-level `uses_*` lists (section 1) **and** again under the specific stage that uses it
(section 2). Reuse of existing shared items (`artifact_writer`, `evidence_writer`,
`stage_gate_trace_schema`, `supervisor_routing_model`, and the canonical skills) is intentional and
does not imply re-ownership. Newly introduced names are enumerated in this entry's `open_questions`
for the later registry (Phase C) and governance (Phase E) phases.
