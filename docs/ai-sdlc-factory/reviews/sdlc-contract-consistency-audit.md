# SDLC Contract Consistency Audit (Doc 13 — Phase 3)

**Scope:** Static consistency audit of the machine-readable SDLC pipeline contracts in
`configs/nexus-ai/`. Blueprint/documentation only — no runtime, no merge, no deploy.

**Artifacts under test**
- `configs/nexus-ai/stages/sdlc/01-*.yaml` … `31-*.yaml` (stage contracts)
- `configs/nexus-ai/schemas/*.json` (6 JSON Schemas, Draft 2020-12)
- `configs/nexus-ai/sdlc_pipeline.yaml` (pipeline definition)
- Supporting: `configs/nexus-ai/artifact_registry.yaml`,
  `configs/nexus-ai/pipeline_contract_standard.yaml`,
  `configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`,
  `configs/nexus-ai/validation/README.md`

**Method:** Read all 31 stage files and the schema/registry/pipeline files; ran scripted
cross-file checks (route resolution, usage-field presence, conditional structure, gate/evidence
producer mapping, plugin grep, Core-Ability/Agent boundary) and validated every stage file plus
the artifact registry against their JSON Schemas with `jsonschema` (Draft 2020-12).

**Verdict: PASS_WITH_FINDINGS.** No blocker check failed. All 9 mandated checks pass. Findings
are pre-existing documentation/reconciliation issues (most already recorded in
`configs/nexus-ai/validation/README.md` "Open items"), not contract defects.

> **Resolution update (2026-06-05).** The non-blocking findings in this audit reflect the corpus
> state at the time of writing. The diagram / index / stage-27 / stage-README / doc-08 staleness
> items (mirrored in `final-cross-review-summary.md` as F1/X1/X2/F2/F3/F5) were fixed afterward
> (Phase A cleanup + D-016) and re-verified against the live files on 2026-06-05. Findings are
> retained below as the original audit record; the current verified state is in
> [`final-cross-review-summary.md`](final-cross-review-summary.md) ("Resolution update") and
> [`claude-code-sdlc-completion-summary.md`](claude-code-sdlc-completion-summary.md) §4.

**Severity legend:** blocker = breaks a locked invariant / fails a mandated check; major =
real inconsistency a reviewer must reconcile; minor = cosmetic / stale-doc / comment-only.

---

## Per-check results

### Check 1 — Exactly 31 stage files — PASS
`configs/nexus-ai/stages/sdlc/` contains exactly **31** `*.yaml` contract files, numbered
`01`–`31`, each with a unique `stage_id`. No missing, extra, duplicate, or misnumbered stage.
The 31 `stage_id`s match `sdlc_pipeline.yaml` `stages:` 1:1 in canonical order
(`intake` … `refraction_learning`).

### Check 2 — Route resolution — PASS
Every `on_pass`, `on_fail`, and `rework_route` across all 31 stages resolves to either a known
`stage_id` or a canonical terminal (`done`, `relevant_failed_stage`, `block_and_report`). The
applicability skip-forward routes (`on_not_applicable` / `route` / `when_not_applicable` inside
conditional stages) also all resolve. Terminal usage is correct: `refraction_learning.on_pass =
done`; aggregate stages (`evidence_graph_build`, `development_completion`,
`accessibility_ux_validation_if_applicable`) use `relevant_failed_stage`.

### Check 3 — All 7 usage-mapping fields present — PASS
All 31 stages declare all seven arrays (`uses_core_abilities`, `uses_skills`, `uses_tools`,
`uses_governance_profiles`, `uses_audit_schemas`, `uses_model_provider_profiles`,
`uses_context_memory_profiles`). None is empty `[]` — every stage genuinely populated all seven.
Mechanically confirmed by schema validation (all seven are in the stage schema `required` set).

### Check 4 — Conditional stages have applicability_decision + conditional_required_gates — PASS
Exactly the 7 canonical conditional stages carry an `applicability_decision` block — stages
**19, 20, 21, 22, 23, 25, 26** (`privacy_data_lifecycle_validation`,
`api_contract_compatibility_validation`,
`domain_regulatory_compliance_validation_if_applicable`,
`data_migration_validation_if_applicable`, `accessibility_ux_validation_if_applicable`,
`cost_resource_governance`, `backup_restore_dr_validation_if_applicable`). For each:
- `applicability_decision` is present, contains a `required_when` expression, and appears
  **right after `purpose`** (field-order invariant holds).
- `conditional_required_gates` is present and **non-empty**.
- No non-conditional stage carries an `applicability_decision`.

The 7 pipeline-level conditional gate names in `sdlc_pipeline.yaml` `required_gates.conditional`
are all declared by their stages. Stages additionally declare 10 finer-grained `*_if_applicable`
sub-gates (e.g. `restore_test_pass_if_applicable`, `ux_validation_pass_if_applicable`) that roll
up under the pipeline-level names — legitimate, not a mismatch.

> Note (minor): `applicability_decision` uses slightly different inner key names across the 7
> stages (`decision` vs `artifact` vs `decision_artifact`; `on_not_applicable` vs
> `when_not_applicable`). All carry the required `required_when`, and `stage_contract.schema.json`
> deliberately permits this variance. Harmonizing the inner key names would aid readability but is
> not required.

### Check 5 — development_completion & release_candidate required evidence present — PASS
- **development_completion (#29)** declares `evidence: [DEVELOPMENT_COMPLETION_REPORT,
  DEVELOPMENT_COMPLETION_GATE_RESULT]` and consumes the upstream gate/evidence backbone
  (`EVIDENCE_GRAPH`, `TRACEABILITY_MATRIX`, `ALL_STAGE_GATE_RESULTS`, plus the core evidence
  artifacts). Its gate list is the union of doc 08 §4 mandatory gates + the 7 conditional gates,
  exactly matching the canonical contract.
- **release_candidate (#30)** declares `evidence: [RELEASE_CANDIDATE_REPORT, RELEASE_EVIDENCE,
  RELEASE_CANDIDATE_GATE_RESULT]` and consumes the full `release_evidence_required` set as inputs
  (see Check 7). Its `gates` include `development_completion_pass` (re-attested by `sdlc_team_lead`),
  `release_candidate_evidence_complete`, `release_evidence_internally_consistent`,
  `no_blocking_policy_failure`.

Both stages' required evidence is present and well-formed.

### Check 6 — Producers exist for development_completion gates — PASS (with naming note)
`development_completion` aggregates 25 gates. Every gate has an upstream producing stage. Mapping
verified gate-by-gate; representative examples:
`security_privacy_design_complete`←security_privacy_design, `code_review_pass`←code_review,
`tests_pass`←test_execution, `security_validation_pass`←security_validation,
`supply_chain_pass`/`license_pass`/`sbom_present`←supply_chain_sbom_license,
`agentic_safety_eval_pass`←ai_agent_safety_evaluation, `operations_readiness_pass`←operations_readiness,
`evidence_graph_complete`←evidence_graph_build, and the 7 `*_pass_if_applicable`←their conditional stages.

**Naming-traceability note (major, by-design):** Six aggregate gate names in
`development_completion` are **rollup identifiers** that do not appear verbatim in any single
producing stage's `gates` list:
`requirements_complete`, `nfr_coverage_complete`, `architecture_complete`, `adr_coverage_complete`,
`verification_loop_bug_finding_pass`, `cost_resource_governance_pass_if_applicable`.
Each is semantically satisfied by a real upstream stage emitting finer-grained gates — e.g.
`requirements_complete` ← requirements (`requirements_present`, `nfr_catalog_present`,
`acceptance_criteria_present`, `requirements_traceable`) + requirements_review;
`architecture_complete`/`adr_coverage_complete` ← architecture (`architecture_addresses_nfrs`,
`adr_present_for_major_decisions`, …) + architecture_review;
`verification_loop_bug_finding_pass` ← verification_loop_bug_finding (`open_blocker_bugs_zero`, …);
`cost_resource_governance_pass_if_applicable` ← cost_resource_governance (`cost_estimate_within_budget`,
`resource_budget_pass`, `quota_policy_pass`).
This is **consistent with the canonical contract** — `sdlc_pipeline.yaml` `required_gates.always`
and `docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md` §4 use these exact aggregate names. The
producing stages exist; only an explicit rollup→component gate-alias map is missing. Not a blocker
(the design intends these as aggregate gate IDs), but documenting the alias map would make the
producer relationship mechanically checkable rather than semantic.

### Check 7 — Release evidence coverage — PASS
`artifact_registry.yaml` `release_evidence_required` (the authoritative set: 19 `core` + 8
`conditional` = 27 artifacts) was cross-referenced against stage outputs:
- **All 27 release-evidence artifacts have exactly one producing stage** (clean, unambiguous
  lineage). E.g. `SBOM`/`LICENSE_REPORT`←supply_chain_sbom_license,
  `BUG_FINDING_REPORT`←verification_loop_bug_finding, `EVIDENCE_GRAPH`←evidence_graph_build, and
  every conditional item←its conditional stage.
- **release_candidate inputs cover the entire set.** All 19 core items are inputs except
  `RELEASE_CANDIDATE_REPORT` (correctly — it is release_candidate's own output, not an input).
  All 8 conditional items are present in release_candidate inputs.

### Check 8 — No plugin anywhere — PASS
No `plugin` token appears as a data key or value introducing a plugin concept in any stage,
schema, the registry, the pipeline definition, or the runtime rules. Every occurrence of the
string is a **negative guard**: the `plugin_stage` anti-pattern entry in
`sdlc_pipeline_runtime_rules.yaml`; schema clauses `"plugin": false`, `not.required:[plugin]`,
the `forbiddenPlugin`/`no_plugin_guard` `$defs`, and case-insensitive `propertyNames` bans; and
"Plugin is cancelled" comment prose. The locked decision is actively enforced, not violated.

### Check 9 — No Core Ability as owner_agent; Supervisor not as team lead — PASS
- **owner_agent:** no stage's `owner_agent` is a Core Ability. All 25 distinct owner values are
  canonical snake_case Agent roles, or `sdlc_team_lead` for the two no-self-approval review-gate
  fallbacks (`requirements_review`, `architecture_review`). All owner roles are members of the
  Phase A canonical Agent-roles registry.
- **team_lead:** every stage `team_lead == sdlc_team_lead` (Supervisor is never team_lead).
- **owner_team:** every stage `owner_team == sdlc_team`.
- **sub_agents:** no Core Ability appears as a sub-agent.
- Core Abilities appear only inside `uses_core_abilities` arrays.

---

## Additional verification performed (beyond the 9 mandated checks)

- **JSON Schema validation (Draft 2020-12, `jsonschema` 4.25.1):**
  - All **31 stage contracts PASS** `stage_contract.schema.json` (field set, owner/team-lead
    not-a-Core-Ability, all 7 usage arrays, no-plugin, `applicability_decision.required_when`,
    routing shape).
  - `artifact_registry.yaml` **PASSES** `artifact_registry.schema.json`.
  - All 6 schema files are well-formed JSON.
- **Evidence != Trace family:** every stage's `uses_audit_schemas` lists both an evidence-type and
  a trace-type schema; no evidence schema is listed as a trace type or vice-versa.
- **Locked skill semantics:**
  - `verification-loop` is used only in defect-finding stages — verification_loop_bug_finding (#15),
    ai_agent_safety_evaluation (#18, adversarial injection/tool-misuse defect sweep),
    data_migration_validation (#22, migration defect finding). Never a readiness checklist, never a
    test_execution replacement.
  - `prism` is used only in ideation/design stages — intake, requirements, architecture,
    premortem_fmea, planning. Divergent/brainstorming only.
- **No-self-approval cross-check (review/validation stages):** every review/validation stage's
  `owner_agent` differs from the author of the artifact it adjudicates. Three same-owner input
  adjacencies exist and are each correctly handled (see findings F4–F5 below).

---

## Findings (non-blocking)

**F1 — `sdlc_pipeline.yaml` does not validate against `pipeline_definition.schema.json` (MAJOR).**
The pipeline definition is a reduced form: it is **missing 8 schema-required fields**
(`applicable_domains`, `risk_profiles`, `entry_criteria`, `exit_criteria`, `blocking_conditions`,
`allowed_rework_routes`, `required_evidence`, `required_trace`) and adds 2 keys the schema does not
define (`required_gates`, `canonical_docs`). Because `pipeline_definition.schema.json` uses
`additionalProperties: false`, validation fails (confirmed: 8 `is a required property` errors).
Already recorded in `configs/nexus-ai/validation/README.md` "Open items." Reconcile by extending
the definition file or relaxing/extending the schema. *(File: `configs/nexus-ai/sdlc_pipeline.yaml`.)*

**F2 — Stage index README is stale (MINOR).**
`configs/nexus-ai/stages/sdlc/README.md` still says "29 of the 31 canonical stages have contract
files (`01`–`29`)" and marks stages `30`/`31` as "_(file pending)_ … Contract file not yet
authored." Both files now exist (`30-release-candidate.yaml`, `31-refraction-learning.yaml`).
Refresh the index. Already noted in the validation README "Open items."

**F3 — doc 08 §7 vs artifact_registry release-evidence divergence: PERFORMANCE_REPORT (MAJOR).**
`docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md` §7 lists `PERFORMANCE_REPORT` in the
release-candidate minimum evidence set, but the authoritative
`artifact_registry.yaml` `release_evidence_required.core` does **not** include it, and
`release_candidate.yaml` inputs omit it. The contract files consistently follow the registry (their
stated source of truth), so the machine-readable set is internally consistent;
`PERFORMANCE_REPORT` is still produced (performance_resilience) and consumed downstream
(operations_readiness #27, cost_resource_governance #25), so it is captured in the evidence graph.
Reconcile doc 08 §7 with the registry (add to `core`, or strike from doc 08). Same class: doc 08 §7
uses some non-registry artifact names (`ARCHITECTURE_DECISION / ADR`, `RISK_REGISTER`,
`IMPLEMENTATION_SUMMARY`) that map to canonical `ADR_INDEX`, `FMEA_RISK_REGISTER`,
`CODE_CHANGESET_SUMMARY` — prose-vs-registry naming, not a contract defect.

**F4 — Same-owner input adjacencies, all mitigated (MINOR, already flagged in-contract).**
The no-self-approval cross-check surfaced three review/validation stages that consume an input
authored by their own `owner_agent`. None is an unhandled self-approval:
- `release_candidate` (release_manager_agent) consumes `DEVELOPMENT_COMPLETION_REPORT` /
  `DEVELOPMENT_COMPLETION_GATE_RESULT` authored by release_manager_agent (#29). **Mitigated:** the
  `development_completion_pass` re-attestation gate is `attested_by: sdlc_team_lead`
  (`conditional_required_gates`), and the header documents this + flags it in open_questions.
- `verification_loop_bug_finding` (qa_agent) consumes `TEST_EXECUTION_REPORT` / `COVERAGE_REPORT`
  authored by qa_agent (#14). These are read-only context; the artifact actually gated is the
  changeset (authored by engineering_agent ≠ qa_agent). The #14 header already flags the shared
  qa_agent ownership for governance review.
- `operations_readiness` (operations_readiness_agent) consumes `DR_READINESS_REPORT` /
  `ROLLBACK_VALIDATION_REPORT` authored by operations_readiness_agent (#26). These are read-only
  inputs; the stage authors its own ops package and gates on `operations_readiness_pass`. The #27
  header documents the #26/#27 same-owner adjacency and flags it in open_questions.

**F5 — Comment-only factual error in `27-operations-readiness.yaml` (MINOR).**
A header comment (~line 31) states `DR_READINESS_REPORT` / `ROLLBACK_VALIDATION_REPORT` are
"authored upstream by performance_resilience_agent (#26)." Stage #26
(`backup_restore_dr_validation_if_applicable`) actual `owner_agent` is **operations_readiness_agent**,
not performance_resilience_agent. Machine-readable fields are all correct; only the comment is
wrong. Correct the comment to avoid masking the (mitigated) #26/#27 same-owner relationship in F4.

**F6 — Non-canonical registry references (INFORMATIONAL — already flagged in-contract).**
Several stages reference skills/tools/profiles outside the Phase A locked registry, each carried
from legacy docs, inline-annotated `NON-CANONICAL`, and (per the stage headers) flagged for
open_questions / registry formalization. They do not affect any of the 9 checks. Examples:
- Skills: `skill-architect` (#03), `handoff-designer` / `context-pack-builder` (#10, #11),
  `scanner-result-normalizer` (#16), `evidence-graph-builder` (#28), `release-readiness-judge`
  (#29, #30). All permitted by the task's "legacy doc 05 skill" allowance with open_questions.
- Tools: `package_reputation_checker` (#17); `data_inventory_checker` / `retention_policy_checker`
  / `deletion_flow_checker` / `tenant_isolation_checker` (#19); `ux_flow_checker` /
  `contrast_checker` (#23); `rollback_validator` (#26, #27); `observability_plan_checker` /
  `incident_runbook_checker` (#27).
- Context pack: `skill_semantic_context_pack` (#03); audit schemas: various stage-appropriate
  `*_evidence_schema` / `*_report_schema` names beyond the locked base list.
These should be tracked into the shared-registry formalization plan
(`docs/ai-sdlc-factory/17-shared-registry-formalization-plan.md`) but are not consistency
violations under the audited checks.

---

## Summary table

| # | Check | Result | Severity of issues |
|---|---|---|---|
| 1 | Exactly 31 stage files | PASS | — |
| 2 | All routes resolve to a stage_id or canonical terminal | PASS | — |
| 3 | All 7 usage-mapping fields present | PASS | — |
| 4 | Conditional stages: applicability_decision + conditional_required_gates | PASS | minor (inner key-name variance) |
| 5 | development_completion & release_candidate required evidence present | PASS | — |
| 6 | Producers exist for development_completion gates | PASS | major (rollup→component gate-alias map undocumented) |
| 7 | Release evidence coverage | PASS | — |
| 8 | No plugin anywhere | PASS | — |
| 9 | No Core Ability as owner_agent; Supervisor not team lead | PASS | — |
| + | All 31 stage files validate vs `stage_contract.schema.json` | PASS | — |
| + | `sdlc_pipeline.yaml` vs `pipeline_definition.schema.json` | FAIL (known) | major (F1) |

**Overall verdict: PASS_WITH_FINDINGS** — every mandated consistency check passes; the 31 stage
contracts are internally consistent, schema-valid, and honor the locked decisions. Open findings
are documentation/reconciliation items (F1–F6), none of which fails an audited check or breaks a
locked invariant.
