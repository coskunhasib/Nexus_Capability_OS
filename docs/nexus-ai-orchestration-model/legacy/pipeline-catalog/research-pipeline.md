# Research Pipeline — Catalog Definition

This document is a **catalog entry** in the Nexus AI Orchestration Model. It defines the
Research Pipeline as a reusable process template that follows the Pipeline Definition Contract
in `docs/ai-sdlc-factory/07-pipeline-contract-standard.md` section 2.

It is a **definition**, not a run. Pipeline runs are described by section 3 of the standard.
Shared items (Core Abilities, Skills, Tools, Governance Profiles, Audit Schemas, Model/Provider
Profiles, Context/Memory Profiles) live in the Shared Registry; this entry only **references**
which of them the pipeline uses (Shared Registry + Usage Mapping rule).

Scope: sourced research — source discovery, source-reliability scoring, claim/evidence mapping,
cross-validation, uncertainty reporting, and synthesis.

> Locked decisions honored here: no plugin anywhere; Core Abilities
> `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` are **not agents**;
> `owner_agent` is always a snake_case **Agent** role; the team lead is a pipeline-specific
> `research_team_lead` role (**not** Supervisor); Skill != Tool; Governance != Audit;
> Evidence != Trace. SDLC is referenced, not regenerated.

---

## 1. Pipeline Definition Contract

```yaml
pipeline_id: research_pipeline
name: Research Pipeline
purpose: >
  Run sourced research with no-human governance: discover sources, score source reliability,
  extract claims, map claims to evidence, cross-validate findings with a separate role,
  report uncertainty, and synthesize a cited research output.
version: draft-0.1
status: draft
owner_domain: research_and_knowledge
required_team_type: research_team
required_team_lead_role: research_team_lead
applicable_domains:
  - market_research
  - technical_research
  - competitive_intelligence
  - literature_review
  - due_diligence
  - policy_and_regulatory_research
risk_profiles:
  - exploratory
  - decision_support
  - high_stakes_cited
  - regulated_or_high_risk

stages:
  - research_intake
  - scope_and_questions
  - source_discovery
  - source_reliability_assessment
  - claim_extraction
  - claim_evidence_mapping
  - cross_validation
  - uncertainty_reporting
  - synthesis
  - research_completion

uses_core_abilities:
  - Web
  - Memory
  - Supervisor

uses_skills:
  - prism
  - llm-council
  - calibrate
  - gap-audit
  - bayesian-update

uses_tools:
  - web_search
  - web_fetch
  - source_reliability_checker
  - claim_mapper
  - artifact_writer
  - evidence_writer
  - evidence_reader

uses_governance_profiles:
  - research_source_governance
  - citation_required_gate
  - no_self_approval_policy
  - evidence_required_policy

uses_audit_schemas:
  - source_evidence_schema
  - claim_evidence_schema
  - stage_gate_trace_schema

uses_model_provider_profiles:
  - research_reasoning_profile
  - supervisor_routing_model
  - source_evaluation_model

uses_context_memory_profiles:
  - research_run_context
  - source_corpus_context_pack
  - claim_evidence_context_pack

entry_criteria:
  - research_goal_present
  - research_questions_bounded_or_derivable
  - risk_profile_selected

exit_criteria:
  - all_research_questions_addressed_or_flagged
  - every_load_bearing_claim_has_mapped_evidence
  - every_used_source_has_reliability_score
  - cross_validation_completed_by_separate_role
  - uncertainty_report_present
  - citation_required_gate_pass
  - no_blocking_policy_failure
  - research_evidence_graph_complete

blocking_conditions:
  - load_bearing_claim_without_evidence_count > 0
  - unscored_source_used_in_synthesis == true
  - producer_role_is_sole_validator_of_own_source == true
  - uncited_claim_in_final_synthesis == true
  - critical_source_reliability_conflict_unresolved == true

allowed_rework_routes:
  scope_gap: scope_and_questions
  insufficient_sources: source_discovery
  source_reliability_failure: source_discovery
  unmapped_claim: claim_evidence_mapping
  cross_validation_conflict: claim_evidence_mapping
  uncertainty_underreported: uncertainty_reporting
  synthesis_not_supported_by_evidence: claim_evidence_mapping
  citation_gap: synthesis

required_evidence:
  - RESEARCH_BRIEF
  - RESEARCH_QUESTION_SET
  - SOURCE_INVENTORY
  - SOURCE_RELIABILITY_REPORT
  - CLAIM_REGISTER
  - CLAIM_EVIDENCE_MAP
  - CROSS_VALIDATION_REPORT
  - UNCERTAINTY_REPORT
  - RESEARCH_SYNTHESIS
  - CITATION_INDEX
  - RESEARCH_EVIDENCE_GRAPH
  - RESEARCH_COMPLETION_REPORT

required_trace:
  - web_search_tool_trace
  - web_fetch_tool_trace
  - source_reliability_checker_tool_trace
  - claim_mapper_tool_trace
  - skill_activation_trace
  - cross_validation_role_handoff_trace
  - gate_decision_trace
```

---

## 2. Per-stage detail

Each stage names its `owner_agent` (a snake_case **Agent** role under `research_team`,
managed by `research_team_lead`), key gates, and `on_pass` / `on_fail` routing.
No-self-approval is enforced structurally: the role that discovers/produces a source or claim
is **never** the sole role that validates it — `cross_validation` is owned by a different agent.

### 2.1 research_intake
- **purpose:** Capture the research goal, requester intent, decision the research must support, scope boundaries, and risk profile.
- **owner_agent:** `research_intake_agent`
- **key gates:** `research_goal_present`, `risk_profile_selected`, `scope_initially_bounded`
- **on_pass:** `scope_and_questions`
- **on_fail:** `research_intake`

### 2.2 scope_and_questions
- **purpose:** Decompose the goal into concrete, answerable research questions and sub-questions; mark which are load-bearing for the downstream decision. `prism` is used here for **divergence** — generating a diverse question set and candidate angles, not for validation.
- **owner_agent:** `research_scoping_agent`
- **uses skills:** `prism` (divergence), `gap-audit`
- **key gates:** `research_questions_bounded`, `load_bearing_questions_identified`, `no_major_question_gap`
- **on_pass:** `source_discovery`
- **on_fail:** `research_intake` (scope/goal mismatch) or re-run `scope_and_questions`

### 2.3 source_discovery
- **purpose:** Find candidate sources for each research question via web search and fetch; record provenance (URL, publisher, date, access timestamp) for every candidate.
- **owner_agent:** `source_discovery_agent`
- **uses core abilities:** `Web`, `Memory`
- **uses tools:** `web_search`, `web_fetch`, `artifact_writer`
- **key gates:** `each_question_has_candidate_sources`, `source_provenance_recorded`, `minimum_source_diversity_met`
- **on_pass:** `source_reliability_assessment`
- **on_fail:** `source_discovery` (insufficient sources) or `scope_and_questions` (question not researchable)

### 2.4 source_reliability_assessment
- **purpose:** Score each candidate source for reliability (authority, independence, recency, corroboration, bias signals) under `research_source_governance`. `calibrate` keeps reliability scores rationale-backed rather than asserted.
- **owner_agent:** `source_reliability_agent`
- **uses skills:** `calibrate`, `gap-audit`
- **uses tools:** `source_reliability_checker`, `evidence_writer`
- **key gates:** `every_candidate_source_scored`, `reliability_rationale_present`, `low_reliability_sources_flagged`
- **on_pass:** `claim_extraction`
- **on_fail:** `source_discovery` (need better sources) or re-run `source_reliability_assessment`

### 2.5 claim_extraction
- **purpose:** Extract atomic, checkable claims relevant to the research questions from the scored source corpus; tag each claim with its asserting source(s).
- **owner_agent:** `claim_extraction_agent`
- **uses tools:** `claim_mapper`, `artifact_writer`
- **key gates:** `claims_are_atomic_and_checkable`, `each_claim_linked_to_asserting_source`, `load_bearing_claims_tagged`
- **on_pass:** `claim_evidence_mapping`
- **on_fail:** `source_discovery` (claims rest on too few/weak sources) or re-run `claim_extraction`

### 2.6 claim_evidence_mapping
- **purpose:** Map every claim to its supporting and contradicting evidence across sources; record support strength and any conflicts. Produces `CLAIM_EVIDENCE_MAP`.
- **owner_agent:** `claim_evidence_agent`
- **uses skills:** `gap-audit`
- **uses tools:** `claim_mapper`, `evidence_writer`, `evidence_reader`
- **key gates:** `every_load_bearing_claim_has_mapped_evidence`, `contradictions_recorded`, `unsupported_claims_flagged`
- **on_pass:** `cross_validation`
- **on_fail:** `claim_evidence_mapping` (rework mapping) or `source_discovery` (evidence gap requires new sources)

### 2.7 cross_validation
- **purpose:** Independent verification by a **different** role: re-check source reliability scores and claim→evidence mappings, surface single-source claims, and resolve or escalate conflicts. This stage enforces the no-self-approval rule — a researcher must not solely validate their own source. `llm-council` is used here for cross-checked, multi-perspective adjudication.
- **owner_agent:** `cross_validation_agent` (distinct from `source_reliability_agent`, `claim_extraction_agent`, and `claim_evidence_agent`)
- **uses skills:** `llm-council`, `calibrate`
- **uses tools:** `source_reliability_checker`, `evidence_reader`, `artifact_writer`
- **uses governance:** `no_self_approval_policy`
- **key gates:** `validator_role_distinct_from_producer`, `single_source_claims_identified`, `no_unresolved_critical_source_conflict`
- **on_pass:** `uncertainty_reporting`
- **on_fail:** `claim_evidence_mapping` (mapping conflict) or `source_discovery` (corroboration missing)

### 2.8 uncertainty_reporting
- **purpose:** Quantify and document residual uncertainty per claim and per research question — confidence levels, evidence strength, contested points, and known gaps. `bayesian-update` adjusts confidence as corroborating/contradicting evidence accumulates.
- **owner_agent:** `uncertainty_reporting_agent`
- **uses skills:** `bayesian-update`, `calibrate`
- **uses tools:** `artifact_writer`, `evidence_writer`
- **key gates:** `uncertainty_report_present`, `confidence_levels_rationale_backed`, `contested_points_explicit`
- **on_pass:** `synthesis`
- **on_fail:** `uncertainty_reporting` or `claim_evidence_mapping` (uncertainty traces to a mapping gap)

### 2.9 synthesis
- **purpose:** Produce the final cited research synthesis answering the research questions, with every load-bearing statement traceable to mapped evidence and explicit uncertainty. The `citation_required_gate` blocks any uncited load-bearing claim.
- **owner_agent:** `research_synthesis_agent`
- **uses skills:** `gap-audit`
- **uses tools:** `artifact_writer`, `evidence_reader`
- **uses governance:** `citation_required_gate`
- **key gates:** `all_research_questions_addressed_or_flagged`, `no_uncited_load_bearing_claim`, `synthesis_consistent_with_uncertainty_report`
- **on_pass:** `research_completion`
- **on_fail:** `synthesis` (citation gap) or `claim_evidence_mapping` (synthesis claim not supported by evidence)

### 2.10 research_completion
- **purpose:** Final gate: assemble the research evidence graph, confirm all exit criteria and no-blocking-policy-failure, and emit the completion report. Analogous to SDLC `development_completion` but for research outputs (see `docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md`).
- **owner_agent:** `research_completion_agent`
- **uses skills:** `gap-audit`
- **uses tools:** `evidence_reader`, `artifact_writer`
- **uses governance:** `evidence_required_policy`, `no_self_approval_policy`
- **uses audit:** `source_evidence_schema`, `claim_evidence_schema`, `stage_gate_trace_schema`
- **key gates:** `research_evidence_graph_complete`, `cross_validation_completed_by_separate_role`, `citation_required_gate_pass`, `no_blocking_policy_failure`
- **on_pass:** `done`
- **on_fail:** `relevant_failed_stage` (route to the specific stage that produced the missing/failed evidence)

---

## 3. Required team / team-lead and governance + audit placeholders

**Team requirement.** This pipeline **requires** a team.
- `required_team_type: research_team`
- `required_team_lead_role: research_team_lead`

The `research_team_lead` is a **pipeline-specific role**, not the `Supervisor` Core Ability.
The team lead **runs** the pipeline (assigns agents, manages handoffs, enforces routing) but
does **not** override blocking policy gates and is **never** a stage `owner_agent`. Agents own
and execute stages; the team lead orchestrates. The `Supervisor` Core Ability may be used for
routing support, but it does not replace `research_team_lead`.

**No-self-approval (structural).** Source discovery, reliability scoring, claim extraction, and
claim→evidence mapping are owned by their respective agents; `cross_validation` is owned by a
**distinct** `cross_validation_agent`. A researcher cannot be the sole validator of their own
source — this is enforced by the `validator_role_distinct_from_producer` gate and the
`no_self_approval_policy` governance profile.

**Governance placeholders (this catalog entry references; formalized in later phases C/E):**
- `research_source_governance` — rules for what counts as an acceptable source, minimum reliability/diversity, and how low-reliability sources may be used. *(new)*
- `citation_required_gate` — blocks any uncited load-bearing claim in the final synthesis. *(new)*
- `no_self_approval_policy` — pipeline-level binding of the canonical `no_self_approval` policy (see `docs/ai-sdlc-factory/06-governance-policy-evidence.md` §2–§3); enforces producer-role != validator-role. *(naming variant of canonical `no_self_approval`)*
- `evidence_required_policy` — binding of the canonical `evidence_required` blocker policy: every gate decision requires evidence. *(naming variant of canonical `evidence_required`)*

**Audit placeholders (evidence/trace schemas; formalized in later phases):**
- `source_evidence_schema` — evidence record shape for a scored source (provenance, reliability score + rationale, related claims). *(new)*
- `claim_evidence_schema` — evidence record shape for a claim→evidence mapping (claim, supporting/contradicting evidence, support strength, confidence). *(new)*
- `stage_gate_trace_schema` — reused from the SDLC pipeline for gate-decision traces (canonical; defined in `docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md`).

> Governance != Audit and Evidence != Trace are preserved: governance profiles say what is
> allowed/blocked; audit schemas describe the evidence and trace records that prove what happened.

**New tools introduced** (to be registered in phase C registry): `source_reliability_checker`,
`claim_mapper`. `web_search`, `web_fetch`, `artifact_writer`, `evidence_writer`, and
`evidence_reader` are existing shared/canonical tools.

**Model/Provider and Context/Memory profiles introduced** (to be registered in phase C):
`research_reasoning_profile`, `source_evaluation_model`, `research_run_context`,
`source_corpus_context_pack`, `claim_evidence_context_pack`. `supervisor_routing_model` is an
existing shared profile.

All skills used (`prism`, `llm-council`, `calibrate`, `gap-audit`, `bayesian-update`) are
**canonical**. Locked semantics honored: `prism` = brainstorming/divergence (used in
`scope_and_questions`); `verification-loop` (bug/defect finding) is intentionally **not** used —
research cross-checking uses `llm-council` + `calibrate` + `gap-audit` instead.
