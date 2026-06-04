# Pipeline Catalog Review — Phase B / doc 16 Exit Criteria

**Scope:** Review of the 5 new pipeline catalog entries produced in the Pipeline Catalog
Expansion phase (doc `16-pipeline-catalog-expansion-plan.md`) against the Pipeline Definition
Contract in `07-pipeline-contract-standard.md` section 2 and the doc-16 §11 exit criteria.

**Reviewer artifact type:** documentation / blueprint review. No runtime code, no merge, no deploy.

**Inputs reviewed:**

- `docs/ai-sdlc-factory/07-pipeline-contract-standard.md` (contract source — §2 = 24 required fields, ordered)
- `docs/ai-sdlc-factory/16-pipeline-catalog-expansion-plan.md` (the plan + exit criteria)
- `docs/ai-sdlc-factory/pipeline-catalog/README.md` (catalog index)
- `docs/ai-sdlc-factory/pipeline-catalog/research-pipeline.md`
- `docs/ai-sdlc-factory/pipeline-catalog/activation-pipeline.md`
- `docs/ai-sdlc-factory/pipeline-catalog/operations-pipeline.md`
- `docs/ai-sdlc-factory/pipeline-catalog/skill-governance-pipeline.md`
- `docs/ai-sdlc-factory/pipeline-catalog/knowledge-memory-pipeline.md`
- `configs/nexus-ai/pipeline_catalog.yaml`

**Verdict: PASS_WITH_FINDINGS.**

All five new pipelines satisfy every doc-16 §11 exit criterion and every locked decision. No
pipeline is missing the contract, and no locked-decision breach exists — so this is **not BLOCKED**.
Findings are internal-consistency issues (markdown definition docs vs. the embedded
`definition_contract` blocks in the catalog YAML diverge) plus a large set of newly-introduced
governance/audit/tool/model/context names that Phase C (registry) and Phase E (governance/audit)
must formalize. None of these block Phase B closure; they are reconciliation work for the next
phases.

---

## 1. Exit-criteria checklist (doc 16 §11)

| Exit criterion | Result | Evidence |
| --- | --- | --- |
| Each pipeline follows `07` §2 contract (all 24 fields, in order) | PASS | All 5 markdown docs emit exactly the 24 §2 fields in canonical order; all 5 YAML `definition_contract` blocks also carry all 24 fields in order. |
| Each pipeline lists shared usage fields (all 7 `uses_*` present) | PASS | Each markdown doc has 7/7 `uses_*` fields populated; none empty (no `[]` needed because every list has content). |
| Each pipeline has governance + audit profile placeholders | PASS | Every pipeline lists ≥3 `uses_governance_profiles` and ≥2 `uses_audit_schemas`, with a §3 "placeholders" subsection flagging new names for Phase C/E. |
| Each pipeline states whether team / team-lead is required | PASS | Each doc explicitly states `required_team_type` + `required_team_lead_role` and a §3 note that a team IS required and the lead is not Supervisor. |
| No pipeline introduces a plugin | PASS | Every "plugin" string in the 5 docs + YAML is a negation ("no plugin", "plugin cancelled", `no_plugin: true`). Zero plugin introductions. |
| `status: draft` (task requirement) | PASS | All 5 markdown docs: `status: draft`. YAML catalog summary + `definition_contract`: `status: draft` for all 5. |
| Catalog YAML lists SDLC + 5 new + candidates | PASS | `pipelines:` = `[sdlc_pipeline, research_pipeline, activation_pipeline, operations_pipeline, skill_governance_pipeline, knowledge_memory_pipeline]`; `candidate_pipelines:` = `[content, data_processing, model_inference, customer_support, business_strategy]`. SDLC carries `is_existing: true` + `do_not_regenerate: true` and is referenced, not regenerated. |

---

## 2. Per-pipeline results table

Legend: ✔ = pass. All checks below evaluate the **markdown catalog entry** (the authoritative
definition per doc 16 §10), cross-referenced with the YAML where relevant.

| # | Pipeline (markdown) | (1) `07` §2 all 24 fields, ordered | (2) all 7 `uses_*` present | (3) governance + audit placeholders | (4) team / team-lead stated | (5) no plugin | (6) `status: draft` | owner_agent per stage | team-lead ≠ Supervisor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `research_pipeline` | ✔ (24/24, exact order) | ✔ (7/7) | ✔ 4 gov / 3 audit | ✔ `research_team` / `research_team_lead` | ✔ | ✔ | ✔ (10 stages, 10 owner_agents) | ✔ |
| 2 | `activation_pipeline` | ✔ (24/24, exact order) | ✔ (7/7) | ✔ 7 gov / 5 audit | ✔ `activation_team` / `activation_team_lead` | ✔ | ✔ | ✔ (7 stages, 7 owner_agents) | ✔ |
| 3 | `operations_pipeline` | ✔ (24/24, exact order) | ✔ (7/7) | ✔ 7 gov / 7 audit | ✔ `operations_team` / `operations_team_lead` | ✔ | ✔ | ✔ (6 stages, 6 owner_agents) | ✔ |
| 4 | `skill_governance_pipeline` | ✔ (24/24, exact order) | ✔ (7/7) | ✔ 9 gov / 6 audit | ✔ `skill_governance_team` / `skill_governance_team_lead` | ✔ | ✔ | ✔ (7 stages, 7 owner_agents) | ✔ |
| 5 | `knowledge_memory_pipeline` | ✔ (24/24, exact order) | ✔ (7/7) | ✔ 3 gov / 2 audit | ✔ `knowledge_team` / `knowledge_team_lead` | ✔ | ✔ | ✔ (6 stages, 6 owner_agents) | ✔ |

**Concept-boundary compliance (all 5):** `Skill != Tool`, `Governance != Audit`,
`Evidence != Trace` are explicitly preserved in each doc's preamble and §3. `owner_agent` values
are snake_case Agent roles in every stage; Core Abilities `[Supervisor, Coder, Vision, Audio,
Creative, Memory, Web, OS]` appear only under `uses_core_abilities`, never as agents. SDLC is
referenced (e.g. Activation consumes the SDLC release candidate; Operations consumes SDLC
`RUNBOOK`/`ROLLBACK_PLAN`), never regenerated.

**Skill canonicality (all 5):** Every skill used is in the canonical set
(`prism, verification-loop, sentinel, llm-council, fmea, adr-builder, gap-audit, prompt-fidelity,
calibrate, refraction, fermi-decompose, bayesian-update`). **No non-canonical skill is introduced.**
Locked semantics honored: `prism` is used only for divergence/brainstorming (research
`scope_and_questions`; skill-governance option-expansion) and `verification-loop` only for
bug/defect finding (skill-governance `script_reference_audit`, operations forward-fix
confirmation). Activation and Knowledge/Memory explicitly state they do **not** bind `prism` or
`verification-loop` because neither divergence nor defect-hunting fits those lifecycles.

---

## 3. Findings (non-blocking)

### F-1 (MAJOR — Phase C must reconcile) — Markdown definition docs diverge from the YAML `definition_contract` blocks

The five markdown docs are the authoritative definitions (doc 16 §10), but the catalog YAML
embeds a **second, differently-shaped** `definition_contract` per pipeline that does not match.
Both forms are individually contract-valid (24 fields, ordered), but they disagree on content.
This must be reconciled before Phase C registry formalization so the registry is sourced from a
single truth.

| Pipeline | Field | Markdown (authoritative) | YAML `definition_contract` / summary | Note |
| --- | --- | --- | --- | --- |
| research | stages / stage_count | 10 stages (intake, scope_and_questions, source_discovery, source_reliability_assessment, claim_extraction, claim_evidence_mapping, cross_validation, uncertainty_reporting, synthesis, completion) | 6 stages (research_intake, source_discovery, source_reliability_assessment, claim_evidence_mapping, uncertainty_synthesis, research_report_finalization); `stage_count: 6` | 3-way mismatch: README §3 says **10**, YAML says **6**, MD has **10**. |
| research | owner_domain | `research_and_knowledge` | `research_intelligence` | |
| research | audit schema | `stage_gate_trace_schema` | `research_trace_schema` | Different trace-schema name. |
| activation | stages / stage_count | 7 stages (adds `activation_intake`, `activation_completion` bookends) | 5 stages (drops both bookends); `stage_count: 5` | README §3 says **7**; YAML says **5**. |
| activation | owner_domain | `activation_and_release_operations` | `release_activation` | |
| activation | tools | `activation_flag_controller`, `cohort_selector`, `rollback_executor`, `telemetry_reader`, `policy_query` (+writers) | `feature_flag_controller`, `activation_state_writer`, `rollback_plan_checker` (+writers) | Tool sets differ entirely. |
| operations | owner_domain | `operations_reliability` | `operations_reliability` (match) | OK |
| operations | tools / gov / audit | richer set (e.g. `incident_intake_tool`, `alert_correlator`, `incident_severity_required_gate`, `mitigation_plan_required_gate`) | reduced set (`incident_intake_recorder`, `incident_response_governance`, `rollback_required_gate`) | Naming + granularity differ. |
| skill_governance | stages / stage_count | 7 stages (adds `skill_deprecation_update`) | 6 stages; `stage_count: 6` | README §3 says **6**; MD has **7** (intake→…→activation_decision + deprecation_update). |
| knowledge_memory | required_team_type / lead | `knowledge_team` / `knowledge_team_lead` | `knowledge_memory_team` / `knowledge_memory_team_lead` | README §3 matches MD (`knowledge_team`). YAML differs. |
| knowledge_memory | owner_domain | `knowledge_management` | `knowledge_memory` | |
| knowledge_memory | tools / gov / audit | `memory_ingestor`, `redaction_required_gate`, `memory_provenance_schema`, etc. | `memory_search`, `memory_validity_gate`, `memory_ingestion_evidence_schema`, etc. | Naming differs. |

**Recommendation:** In Phase C, pick the markdown docs as the single source of truth (they are the
fuller, contract-complete definitions with per-stage detail and §3 placeholder rationale), then
regenerate the YAML `definition_contract` blocks + catalog-summary `stage_count` and the README §3
table from them. Alternatively, collapse the YAML to a *summary-only* catalog that references each
markdown doc (as it already does for SDLC via `definition_doc` + `do_not_regenerate`) instead of
embedding a divergent second contract.

### F-2 (MINOR) — README §3 stage counts vs markdown

README §3 lists Research = 10 and Activation = 7 (matches the markdown docs) but Skill Governance =
6 while the skill-governance markdown defines **7** stages (it adds a 7th `skill_deprecation_update`
lifecycle stage, declared conditional). README §3 note already hedges that Operations / Skill
Governance counts were "derived from doc 16 §7–§8 draft scope (6 stages) and finalize when the
definition doc is written." Now that the doc is written with 7 stages, update README §3 to 7 for
Skill Governance. (Operations = 6 is consistent everywhere.)

### F-3 (MINOR) — SDLC catalog-summary `status` field value

In `pipeline_catalog.yaml` the SDLC entry uses `status: draft-0.1` (line 76) where every other
catalog summary uses `status: <word>` and a separate `version`. The README §3 labels SDLC
`reference (stable)`. This is a cosmetic field-value smell (a version string placed in a status
field) on the **referenced, do-not-regenerate** SDLC entry — not a contract violation and not in
scope to regenerate. Flag for Phase C tidy-up: set SDLC summary `status` to a word (e.g. `stable`
or `reference`) consistent with the README.

### F-4 (INFO) — Activation public-activation "human/owner" decision gate

Activation §2.5 `public_activation_decision` and the purpose text describe a "human/owner decision
gate" where "the authorizing actor is the human owner, not an autonomous agent." This is internally
consistent and matches doc 16 §6 (`owner_activation_decision_gate`) and the repo's no-self-approval
posture, but it is the one place a pipeline asserts a human-in-the-loop authority. Worth an explicit
confirmation in Phase E governance that an owner/human gate is permitted under the "no-human
governance" framing used elsewhere (the docs treat it as an *owner decision record* gate, which
reads consistent, but it deserves a deliberate sign-off).

---

## 4. Consolidated newly-introduced names for Phase C (registry) / Phase E (governance + audit)

These names are referenced by the catalog entries but are **not yet** in the Shared Registry.
They must be formalized in Phase C (`17-shared-registry-formalization-plan.md`) and, for
governance/audit, Phase E (`19-governance-audit-readiness-plan.md`). Names already
canonical/shared are listed under "reused" and do **not** need new registration.

> Note: where the markdown doc and YAML disagree (see F-1), the **markdown** name is treated as
> authoritative and listed here; the divergent YAML-only variants are flagged in F-1, not
> double-counted below.

### 4.1 New governance profiles (Governance != Audit)

- **Cross-pipeline / shared (new bindings of canonical policy families):** `no_self_approval_policy`,
  `evidence_required_policy` — used by all 5; treat as canonical-policy bindings, confirm naming in
  Phase E (research doc flags these as naming variants of `no_self_approval` / `evidence_required`).
- **Research:** `research_source_governance`, `citation_required_gate`.
- **Activation:** `activation_pipeline_governance`, `preview_required_gate`, `pilot_evidence_gate`,
  `rollback_required_gate`, `owner_activation_decision_gate`.
- **Operations:** `operations_pipeline_governance`, `incident_severity_required_gate`,
  `mitigation_plan_required_gate`, `rollback_runbook_evidence_gate`, `postmortem_required_gate`.
- **Skill Governance:** `skill_governance_pipeline_governance`, `skill_semantic_required_gate`,
  `script_reference_audit_gate`, `misuse_warning_required_gate`, `skill_binding_proposal_gate`,
  `skill_activation_decision_gate`, `locked_semantics_enforcement_policy`.
- **Knowledge / Memory:** `memory_source_governance`, `validity_window_required_gate`,
  `redaction_required_gate`.

### 4.2 New audit schemas (Evidence != Trace)

- **Reused canonical:** `stage_gate_trace_schema` (all 5 markdown docs reuse it for gate-decision
  traces; defined by SDLC).
- **Research:** `source_evidence_schema`, `claim_evidence_schema`.
- **Activation:** `activation_evidence_schema`, `activation_decision_evidence_schema`,
  `rollback_readiness_evidence_schema`, `activation_transition_trace_schema`.
- **Operations:** `incident_evidence_schema`, `severity_classification_evidence_schema`,
  `mitigation_plan_evidence_schema`, `rollback_fix_evidence_schema`, `postmortem_evidence_schema`,
  `operational_learning_evidence_schema`.
- **Skill Governance:** `skill_governance_evidence_schema`, `skill_semantic_extract_schema`,
  `script_audit_evidence_schema`, `skill_misuse_warning_schema`, `skill_binding_decision_schema`,
  `skill_governance_trace_schema`.
- **Knowledge / Memory:** `memory_provenance_schema`.

### 4.3 New tools (Skill != Tool — these are tools, register in Phase C)

- **Reused/shared (assumed existing):** `web_search`, `web_fetch`, `artifact_writer`,
  `evidence_writer`, `evidence_reader`, `memory_write`, `policy_query`, `runbook_executor`,
  `rollback_executor` — confirm canonical status in Phase C.
- **Research (new):** `source_reliability_checker`, `claim_mapper`.
- **Activation (new):** `activation_flag_controller`, `cohort_selector`, `telemetry_reader`.
- **Operations (new):** `incident_intake_tool`, `monitoring_query_tool`, `alert_correlator`,
  `severity_classifier_tool`, `mitigation_plan_builder`, `postmortem_builder`.
- **Skill Governance (new):** `skill_package_reader`, `skill_semantic_extractor`,
  `script_static_analyzer`, `reference_index_builder`, `skill_binding_proposer`.
- **Knowledge / Memory (new):** `memory_ingestor`, `source_classifier`, `summary_writer`,
  `validity_window_calculator`, `retrieval_profile_writer`, `expiration_scanner`, `redaction_tool`,
  `provenance_recorder`.

### 4.4 New model / provider profiles

- **Reused/shared:** `supervisor_routing_model` (all 5).
- **Research:** `research_reasoning_profile`, `source_evaluation_model`.
- **Activation:** `activation_reasoning_model`, `risk_analysis_model`.
- **Operations:** `incident_triage_model`, `operations_analysis_model`, `postmortem_reasoning_model`,
  `learning_reflection_model`.
- **Skill Governance:** `skill_governance_reasoning_profile`, `skill_semantic_extraction_model`,
  `script_safety_analysis_model`.
- **Knowledge / Memory:** `knowledge_reasoning_profile`, `summarization_model`.

### 4.5 New context / memory profiles

- **Research:** `research_run_context`, `source_corpus_context_pack`, `claim_evidence_context_pack`.
- **Activation:** `activation_run_context`, `preview_context_pack`, `pilot_evidence_context_pack`,
  `activation_decision_context_pack`.
- **Operations:** `operations_run_context`, `incident_context_pack`, `operations_context_pack`,
  `postmortem_context_pack`, `learning_context_pack`.
- **Skill Governance:** `skill_governance_run_context`, `skill_semantic_context_pack`,
  `skill_registry_context_pack`.
- **Knowledge / Memory:** `knowledge_run_context`, `memory_candidate_context_pack`,
  `retrieval_profile_context_pack`.

### 4.6 New team / team-lead roles (for Phase D team/agent catalog + Phase C registry)

All five `*_team` / `*_team_lead` role names are new and proposed by this phase; none is Supervisor.
`research_team` / `research_team_lead`; `activation_team` / `activation_team_lead`;
`operations_team` / `operations_team_lead`; `skill_governance_team` / `skill_governance_team_lead`;
`knowledge_team` / `knowledge_team_lead` (markdown authoritative — note YAML uses
`knowledge_memory_team*`, see F-1). Plus the per-stage `owner_agent` roles (e.g.
`research_intake_agent`, `cross_validation_agent`, `activation_owner_decision_agent`,
`incident_response_agent`, `skill_librarian_agent`, `memory_expiration_agent`) which Phase D must
catalog.

### 4.7 Non-canonical skill / policy-name flags

- **No non-canonical skill is introduced** by any pipeline. All skills are canonical.
- `no_self_approval_policy` and `evidence_required_policy` are governance-profile *names* that read
  as bindings of the canonical `no_self_approval` / `evidence_required` policy families (the
  research doc explicitly calls them "naming variants"). Phase E should either standardize on the
  canonical bare names or formally register the `_policy` binding names so the registry is
  unambiguous.

---

## 5. Locked-decision compliance summary

| Locked decision | Status |
| --- | --- |
| Plugin cancelled / never reintroduced | UPHELD — only negations appear; `no_plugin: true` in YAML. |
| Top structure = Nexus AI Orchestration Model; each pipeline = one catalog entry | UPHELD — README and YAML both frame it this way; 6 entries + 5 candidates. |
| SDLC already done — reference, do not regenerate | UPHELD — SDLC carries `is_existing: true` + `do_not_regenerate: true`; consumed as upstream by Activation/Operations. |
| Core Abilities are NOT agents | UPHELD — Core Abilities appear only under `uses_core_abilities`. |
| `owner_agent` = snake_case Agent role | UPHELD — every stage names a snake_case Agent `owner_agent`. |
| `team_lead` = pipeline-specific `*_team_lead`, not Supervisor | UPHELD — all 5 leads are `*_team_lead`; each §3 states it is not Supervisor. |
| Skill != Tool, Governance != Audit, Evidence != Trace | UPHELD — preserved in every doc. |
| Shared Registry + Usage Mapping (list shared items each pipeline uses) | UPHELD — all 7 `uses_*` populated per pipeline; §3 placeholder lists + open-question flags present. |
| Canonical skills preferred; non-canonical flagged | UPHELD — all skills canonical; locked `prism`/`verification-loop` semantics honored. |
| `status: draft` | UPHELD — all 5 entries `status: draft`. |

No locked-decision breach. No pipeline is missing the contract. Therefore the verdict is
**PASS_WITH_FINDINGS**, not BLOCKED.

---

## 6. Recommended actions before Phase C closure

1. **Reconcile F-1**: make the markdown docs the single source of truth and regenerate
   YAML `definition_contract` blocks + `stage_count` + README §3 from them — or convert the YAML to
   a summary-only catalog that references each markdown `definition_doc` (mirroring the SDLC entry).
2. **Fix F-2**: update README §3 Skill Governance stage count to 7.
3. **Fix F-3**: normalize the SDLC catalog-summary `status` to a word consistent with the README.
4. **Carry §4 lists into Phase C** (registry) and the governance/audit subsets into Phase E.
5. **Confirm F-4** (owner/human activation gate) explicitly in Phase E governance.
