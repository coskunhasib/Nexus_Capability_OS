# Final Adversarial QA — 01: SDLC Stage Contracts & Routing

**Scope:** the 31 SDLC stage contracts `configs/nexus-ai/stages/sdlc/01-*.yaml` … `31-*.yaml`.
**Mode:** read-only adversarial hunt for semantic / cross-layer defects (mechanical baseline already verified clean: YAML parse, schema validity, link integrity, plugin invariant, owner/lead invariants, evidence/trace dir separation).
**Date:** 2026-06-04. **Branch:** nexus (no merge to main).

**Hunt targets covered:**
1. on_pass / on_fail / rework_route pointing to a non-existent stage_id or non-canonical terminal.
2. The 7 usage-mapping fields missing/empty where required.
3. Conditional stages missing `applicability_decision` / `conditional_required_gates`.
4. Gates / evidence / trace that are placeholders or nonsensical; Evidence vs Trace contamination.
5. `owner_agent` not resolving to a real Agent role; Core-Ability-as-owner; Supervisor-as-lead.
6. Linear `on_pass` chain coverage of all 31 in canonical order.
7. Locked-decision violations (plugin, Core Abilities, Skill≠Tool, Governance≠Audit, Evidence≠Trace, no-self-approval).
8. Regressions vs the recent reconciliation/label edits.

**Result: STATUS: MINOR_FINDINGS (4).** Zero DEFECTs. Four MINOR / cross-layer notes (none blocking; the stage contracts themselves are internally and cross-layer consistent against `sdlc_pipeline.yaml`, `sdlc_pipeline_runtime_rules.yaml`, `agent_roles.yaml`, and the registries).

---

## Method / evidence base

- Authoritative references read in full: `pipeline_contract_standard.yaml` (stage_required_fields + 7 shared_usage_fields), `sdlc_pipeline.yaml` (canonical 31 stage_ids + required_gates), `sdlc_pipeline_runtime_rules.yaml` (`rework_routing_table.by_stage` + `routing_terminals` + `required_gate_producers`), `agent_roles.yaml` (valid Agent ids + authoritative-source header), `stages/sdlc/README.md` (canonical routing narrative), and the corrections doc `sdlc-stages/06-canonical-corrections-and-overrides.md`.
- Programmatic checks run over all 31 files: routing-target tally, `rework_route` vs runtime `by_stage` diff, evidence⊆outputs, all-7-usage-fields-non-empty, owner_agent resolution, applicability-block presence, and alias-aware resolution of every `uses_*` token against its registry.

---

## CLEAN results (verified, not assumed)

- **C1 — Linear `on_pass` chain (PASS).** The happy path forms a single chain covering all 31 stage_ids in exact canonical order `intake → … → refraction_learning → done`, terminating at the canonical `done` terminal. No gaps, no cycles, no skips. Matches `sdlc_pipeline.yaml stages:` order and README §"Forward path".
- **C2 — No dangling routing targets (PASS).** Every distinct `on_pass` / `on_fail` / `rework_route` value resolves either to one of the canonical 31 stage_ids or to a canonical terminal (`relevant_failed_stage`, `done`). `block_and_report` is correctly NOT used as a stage rework target (reserved for the iteration-limit per runtime rules). 0 unknown targets.
- **C3 — `rework_route` ≡ runtime `by_stage` table (PASS).** Diffed every stage's `rework_route` against `sdlc_pipeline_runtime_rules.yaml rework_routing_table.by_stage`: **0 mismatches across all 31**. The per-stage contract and the cross-stage runtime map agree exactly.
- **C4 — 7 usage-mapping fields (PASS).** All of `uses_core_abilities / uses_skills / uses_tools / uses_governance_profiles / uses_audit_schemas / uses_model_provider_profiles / uses_context_memory_profiles` are present and non-empty (no missing key, no inline `[]`) on all 31 stages.
- **C5 — All `uses_*` tokens resolve (PASS, alias-aware).** Every token in all 7 usage fields across all 31 stages resolves to an id (or registered alias) in the corresponding registry. Specifically: tools→`tools_registry.yaml`, audit→`audit_schemas.yaml`, model→`model_provider_profiles.yaml`, context→`context_memory_profiles.yaml`, skills→`skills_registry.yaml` (all 18 used skills present, including the formerly non-canonical `release-readiness-judge`, `scanner-result-normalizer`, `evidence-graph-builder`, `skill-architect`, `handoff-designer`, `context-pack-builder`), governance→`governance_profiles.yaml`. The only "near-miss" tokens `evidence_required_policy` / `no_self_approval_policy` are **registered aliases** of canonical `evidence_required` / `no_self_approval` (governance_profiles.yaml lines 397-398 / 469-470, `governance_alias_reconciliation`). 0 genuine dangling refs.
- **C6 — Conditional stages well-formed (PASS).** Exactly 7 stages carry a top-level `applicability_decision` block — {19 privacy, 20 api_contract, 21 compliance, 22 data_migration, 23 accessibility, 25 cost, 26 backup_restore} — and each also declares `conditional_required_gates` with explicit `required_when` expressions. The other 24 stages are always-on and carry no `applicability_decision`. No conditional stage is missing either field.
- **C7 — Skip-forward preserves linear order (PASS).** Each conditional stage's not-applicable route (`on_not_applicable` / `when_not_applicable.route` / `.on_pass`) equals that stage's own `on_pass` successor, so the linear order is preserved whether or not the conditional stage runs: 19→api_contract, 20→compliance, 21→data_migration, 22→accessibility, 23→performance, 25→backup_restore, 26→operations_readiness. All 7 correct.
- **C8 — owner_agent resolution (PASS).** 29/31 owner_agents resolve to a real Agent role in `agent_roles.yaml`. The 2 exceptions — stage 05 `requirements_review` and stage 07 `architecture_review` — are `owner_agent: sdlc_team_lead`, which is the **locked no-self-approval fallback** (a Team Lead, intentionally not an Agent). No Core Ability appears as an owner_agent; Supervisor is never an owner or the lead. Locked invariants upheld.
- **C9 — Evidence ≠ Trace, kept distinct (PASS).** evidence⊆outputs holds in all 31 files. Evidence entries are uniformly UPPER_SNAKE artifacts; trace entries are uniformly `*_trace` snake_case process records. No trace token appears in an `evidence:` list and vice-versa. Stage 28 (`evidence_graph_build`) — the highest-risk place to conflate — explicitly segregates evidence schemas (`evidence_graph_evidence_schema`, `traceability_matrix_schema`) from the trace schema (`stage_gate_trace_schema`) and states the lock in-file.
- **C10 — Locked skill semantics (PASS).** Stage 15 (`verification_loop_bug_finding`) binds `verification-loop` as bug/defect finding; stage 14 (`test_execution`) explicitly EXCLUDES `verification-loop` with an in-file comment. The `verification_loop_replaces_test_execution` anti-pattern is upheld. No `prism` misuse (used only as divergence). No placeholder/TODO/TBD/FIXME text anywhere (grep hits were all legitimate doc comments describing the locks).
- **C11 — No-self-approval on the release tail (PASS).** Stage 30 `release_candidate` is owned by `release_manager_agent`, which also owns stage 29 `development_completion`. The self-approval risk is correctly neutralized: the `development_completion_pass` re-attestation inside stage 30 is bound to `attested_by: sdlc_team_lead` in `conditional_required_gates` (line 225), matching the README narrative. The `release_after_development_completion_gate` enforces the locked `deploy_before_development_completion` order.
- **C12 — development_completion aggregation complete (PASS).** Stage 29's gate list contains all 17 `required_gates.always` and all 7 `required_gates.conditional` from `sdlc_pipeline.yaml` (plus `risk_register_reviewed` from premortem_fmea). No required rollup gate is dropped from the aggregation.

---

## Findings (classified)

### MINOR-1 — Stage 21 `rework_route`: doc-vs-config divergence (reconciled; not a defect)
- **Where:** `stages/sdlc/21-domain-regulatory-compliance-validation-if-applicable.yaml:156` `rework_route: security_privacy_design` vs `docs/ai-sdlc-factory/sdlc-stages/06-canonical-corrections-and-overrides.md:67` `rework_route: requirements`.
- **What:** The corrections doc routes a regulatory-compliance failure back to `requirements`; the stage file routes it to `security_privacy_design`.
- **Why MINOR (not DEFECT):** This conflict is **explicitly acknowledged and reconciled** in `sdlc_pipeline_runtime_rules.yaml` (`by_stage` line 210-212 comment + `open_questions`), which adopts the stage-file value (`security_privacy_design`) as primary. So the operative config layer (stage file + runtime rules) is self-consistent. The target is also semantically defensible: `compliance_agent` consumes `SECURITY_REQUIREMENTS` + `PRIVACY_RISK_REGISTER`, both authored by `security_privacy_design`. The divergence is a stale line in the corrections doc, not a routing break.
- **Suggested action (non-blocking):** update the corrections doc §1 `rework_route` to `security_privacy_design` (or add a one-line "superseded by stage file" note) so the doc layer matches the reconciled config.

### MINOR-2 — Stage 18 outputs are a superset of `agent_roles.yaml` `agentic_safety_agent.outputs`
- **Where:** `stages/sdlc/18-ai-agent-safety-evaluation.yaml` `outputs`/`evidence` include `TOOL_MISUSE_TEST_REPORT` and `CONTEXT_POISONING_TEST_REPORT`; `agent_roles.yaml` `agentic_safety_agent.outputs` (lines ~863-867) lists only `AGENTIC_SAFETY_EVAL_REPORT, PROMPT_INJECTION_TEST_REPORT, EVIDENCE_INTEGRITY_REPORT, AGENTIC_SAFETY_GATE_RESULT`.
- **What:** The stage declares two test-report outputs that the derived agent catalog omits.
- **Why MINOR (not DEFECT):** The **stage contract is internally consistent** (evidence⊆outputs holds) and `agent_roles.yaml`'s own header names the 31 stage files as the AUTHORITATIVE source for owner_agent outputs — so the stage file is canonical and the catalog should mirror it, not the reverse. The audit scope here (stage contracts) is correct; the discrepancy is a small lag in the recently-edited `agent_roles.yaml`.
- **Suggested action (non-blocking):** add `TOOL_MISUSE_TEST_REPORT` + `CONTEXT_POISONING_TEST_REPORT` to `agentic_safety_agent.outputs` in `agent_roles.yaml` to match the authoritative stage file. (Also: stage 20 lists `BREAKING_CHANGE_REPORT` in outputs but not in evidence — this is an intentional non-evidence output, evidence⊆outputs still holds; noted, no action.)

### MINOR-3 — `conditional_required_gates` field-shape varies across stages (cosmetic)
- **Where:** the list-item key differs: stage 25 uses `- gate_id:`, stage 30 uses `- gate:`, and stages 19/21/22/23 use the inline `name: / required_when:` shape under `conditional_required_gates`. Likewise the not-applicable block is spelled `on_not_applicable:` (19/23/25/26, as a map or scalar), `when_not_applicable:` (21/22), and the applicability artifact key is variously `decision` / `artifact` / `decision_artifact`.
- **What:** No single canonical shape for the conditional/applicability sub-fields.
- **Why MINOR:** Every variant parses and the pipeline validates (mechanical baseline). Each gate's `required_when` is present and correct, so conditionality is fully expressed regardless of key spelling. Purely a consistency/style nit.
- **Suggested action (non-blocking, optional):** if desired, normalize to one key shape (e.g. `- gate_id:` + `on_not_applicable:`) in a later sweep. Not required for correctness.

### MINOR-4 — Mixed `_if_applicable` suffixing on conditional-stage gate names (cosmetic)
- **Where:** conditional stages spell their gate names inconsistently: stage 19/22/23/26 use `*_pass_if_applicable` throughout, while stage 25 uses bare names (`cost_estimate_within_budget`, `resource_budget_pass`, `quota_policy_pass`) and stages 20/21 mix suffixed and bare (`no_unapproved_breaking_change`, `regulatory_requirement_traceable`, `compliance_applicability_decided`).
- **What:** A reader cannot tell from a gate name alone whether it is conditional.
- **Why MINOR (not DEFECT):** Conditionality is carried authoritatively by the `conditional_required_gates.required_when` expressions, not by the name suffix. Stage 25's three bare gates are correctly mapped to the pipeline rollup `cost_resource_governance_pass_if_applicable` via `sdlc_pipeline_runtime_rules.yaml required_gate_producers` (lines 155-166, `satisfied_by_stage_gates`). No gate is mis-tiered or unmapped.
- **Suggested action (non-blocking, optional):** cosmetic naming normalization only.

---

## Notes (informational, no action)

- **N1 — `on_fail` vs `rework_route` intentionally diverge on exactly 2 stages.** Stage 04 `requirements` (`on_fail: requirements`, `rework_route: intake`) and stage 23 `accessibility` (`on_fail: architecture`, `rework_route: relevant_failed_stage`). On all other 29 stages the two fields are equal. The divergence is the documented two-field model: `on_fail` = immediate re-entry, `rework_route` = root-cause owner/dynamic router. Consistent with README §"Rework path" ("requirements sends scope defects back to intake") and the runtime `by_stage` table. Not a defect.
- **N2 — Always-on stage 30 uses `conditional_required_gates`.** This is unusual (the field is typical of conditional stages) but is explicitly justified in-file (header lines 83-86): it binds the no-self-approval attestation owner and the applicable-only release-evidence gates. Internally coherent.
- **N3 — Stage 28 header mentions `evidence_trace_subagent.parent_agent = release_manager_agent` (team model §6.8) while stage 28 owner is `evidence_graph_agent` and its `sub_agents:` lists `evidence_trace_subagent`.** This is a cross-file annotation about sub-agent parenting in the team model, not a stage-contract field; the stage contract itself (owner + sub_agents + routing) is self-consistent. Out of scope for stage-contract routing; flagged only so the team-model reviewer can confirm the sub-agent parent mapping elsewhere.
- **N4 — `qa_agent` owns stages 13/14/15 and `operations_readiness_agent` owns 26/27.** Single-agent multi-stage ownership is legitimate (sequential authoring, not review-of-self): qa_agent is distinct from the changeset author (engineering_agent), so no self-approval issue on the verification spine; operations_readiness_agent authors drafts (26) then finalizes the readiness package (27). No conflict.

---

## Regression check vs recent edits

The reconciliation sweep touched `audit_schemas.yaml`, `governance_profiles.yaml`, `tools_registry.yaml`, `core_abilities.yaml`, `agent_roles.yaml`, `pipeline_catalog.yaml`, `sdlc_pipeline_runtime_rules.yaml`, `model_provider_profiles.yaml`; label fixes touched implementation-handoff WP-05/08/09/10. Against the stage contracts:
- All `uses_*` tokens (including the newly-formalized skills and the governance aliases produced by the sweep) still resolve — the sweep did not orphan any stage reference. (C5)
- `rework_route` values still match the post-sweep `sdlc_pipeline_runtime_rules.yaml by_stage` table exactly. (C3)
- `required_gate_producers` (added by the sweep) correctly maps to real stage gates for all 6 listed gates, including the stage-25 bare-named gates. (verified)
- The only sweep-related lag is MINOR-2 (agent_roles output list trails the authoritative stage file for one agent). No regression introduced into the stage contracts themselves.

**No regression detected in the 31 stage contracts.**

---

## Final status

**STATUS: MINOR_FINDINGS (4)** — 0 DEFECTs (nothing blocks commit). 4 MINOR items: 1 doc-vs-config divergence already reconciled in the operative layer (MINOR-1), 1 derived-catalog lag where the stage file is authoritative (MINOR-2), and 2 cosmetic field-shape/naming consistency nits (MINOR-3, MINOR-4). All are non-blocking and fixable in a follow-up; the stage contracts are internally and cross-layer consistent and uphold every locked decision.
