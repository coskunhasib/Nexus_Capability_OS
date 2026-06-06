# Final Adversarial QA — Consolidated Report (pre-commit)

**Date:** 2026-06-04 · **Branch:** `nexus` (isolated; never merges to main).
**Inputs:** the six dimension reports in `docs/ai-sdlc-factory/reviews/qa/`
(01 stage-contracts-and-routing · 02 cross-reference-integrity · 03 governance-audit-soundness ·
04 org-and-catalog-consistency · 05 plans-and-handoff · 06 regression-recent-edits),
plus an independent verification pass by this synthesizer.
**Mode:** read-only. No corpus file modified; no git run. Findings consolidated and de-duplicated.

**Mechanical baseline (already green upstream, not re-spent):** 81/81 `configs/nexus-ai` YAML parse;
6/6 JSON schemas valid; `sdlc_pipeline.yaml` validates with 0 errors; 0 Core-Ability-as-owner;
0 Supervisor-as-team_lead; 0 Evidence/Trace dir cross-contamination; 0 markdown dead links;
plugin invariant upheld. This report covers only what those checks cannot reach: **semantic +
cross-layer consistency.**

---

## 1. Summary table (dimension → status)

| # | Dimension | Source report | Status | Defects | Minor |
|---|-----------|---------------|--------|---------|-------|
| 01 | SDLC stage contracts & routing | qa/01 | MINOR_FINDINGS | 0 | 4 |
| 02 | Cross-reference integrity (7 reference families) | qa/02 | CLEAN (notes only) | 0 | 1 (+4 note) |
| 03 | Governance + audit config soundness | qa/03 | **DEFECTS** | **2** | 2 |
| 04 | Org & catalog bidirectional consistency | qa/04 | MINOR_FINDINGS | 0 | 5 |
| 05 | Plans & implementation-handoff | qa/05 | CLEAN | 0 | 0 (3 note) |
| 06 | Regression of recently-edited files | qa/06 | MINOR (regression residue) | 0 | 2 (+1 note) |
| — | **Consolidated** | this report | **FIX_FIRST** | **2** | **~12 distinct** |

**The verdict is driven entirely by dimension 03.** Five of six dimensions are clean-or-minor.
Dimension 03 surfaced two real, blocking gate-coverage defects that the synthesizer
**independently re-verified from the raw configs** (method + proof in §4).

---

## 2. Consolidated DEFECT list (must fix before commit)

Both defects share one root cause: `docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md` §4
("Mandatory gates") and `docs/ai-sdlc-factory/06-sdlc-coverage-gap-audit.md` §8 ("Development
Completion minimum gate set") are **not reconciled with each other**. doc 08 §4 *added*
`agentic_safety_eval_pass` but *dropped* two always-on blocker gates that doc 06 §8 still requires.
`configs/nexus-ai/sdlc_pipeline.yaml` mirrors doc 08 §4 verbatim and so inherited a **partial**
reconciliation — while still claiming (header line 34) that its completion criteria are "doc 06 §8
gate set." No reconciliation note anywhere states either gate was intentionally dropped from the
rollup (verified: the only "intentionally EXCLUDED" notes in stage 24 are about *skills*
prism/verification-loop, not about the gate).

### DEFECT-1 — `performance_resilience_pass_or_accepted` is in NO required-gate rollup (highest severity)
- **Producer:** `configs/nexus-ai/stages/sdlc/24-performance-resilience.yaml:131` (stage #24,
  **always-on**, no applicability_decision block).
- **Governance:** `configs/nexus-ai/governance/stage/sdlc-stages.yaml:2368-2372` —
  **severity: blocker, required_when: always**.
- **The hole:** absent from **BOTH** rollups that are supposed to enumerate the gate set a run must
  satisfy — `sdlc_pipeline.yaml required_gates` (`always` *and* `conditional`, lines 219-245) **AND**
  the aggregate readiness stage `stages/sdlc/29-development-completion.yaml` (`gates:` lines 153-178
  *and* `conditional_required_gates:` lines 194-201). Exhaustive corpus grep: it appears only in
  stage 24's own `gates:` and its governance rule — **nowhere else**.
- **Why it is a true defect, not a covered sub-gate:** in doc 06 §8 it sits at the *same top tier*
  as `operations_readiness_pass` and `evidence_graph_complete` (both of which ARE in the rollup),
  and there is **no parent summary gate** that covers it (grep for `performance_complete` /
  `performance_resilience_complete` → none). So a run could pass `development_completion` without
  this always-on blocker ever being aggregated. It is the inverse of a dangling edge: a real
  blocking producer with no consuming rollup.
- **Two internal contradictions confirm it is silent, not intentional:**
  1. `sdlc_pipeline.yaml:34` comment: completion criteria = "doc 06 §8 gate set" — but doc 06 §8
     (line 159) lists this gate and `required_gates.always` omits it.
  2. `stages/sdlc/29-development-completion.yaml:61` comment: gate set = "the UNION of doc 06 §8
     (always) + doc 08 §4 …" — but the actual `gates:` list omits this doc 06 §8 member.
- **Cross-report note:** qa/01 C12 ("no required rollup gate is dropped from the aggregation") is
  **not a contradiction** of this finding — C12 only checked the *forward* direction (is everything
  in `sdlc_pipeline.yaml` also in stage 29? yes) and missed the *reverse* (is every always-on
  blocker gate present in some rollup? no). C12's conclusion is true only relative to the already
  deficient `sdlc_pipeline.yaml` list.
- **Severity:** **DEFECT**. Also falsifies readiness-gate hard-blocker #8
  (`reviews/final-readiness-gate.md:56`: "SDLC required gate missing — CLEAR (24/24 gate
  config'ten değerlendirilebilir)"). This blocker is *not* evaluable from any aggregate.
- **Fix (either):** (a) add `performance_resilience_pass_or_accepted` to
  `sdlc_pipeline.yaml required_gates.always` **and** to `29-development-completion.yaml` `gates:`,
  aligning to doc 06 §8 + the stage-29 UNION claim; **or** (b) add an explicit, sourced
  "intentionally not a rollup gate" reconciliation note in both files. (a) is the correct fix —
  an always-on blocker should be in the readiness rollup.

### DEFECT-2 — `risk_register_reviewed` missing from `sdlc_pipeline.yaml required_gates` (lower blast radius)
- **Producer:** `configs/nexus-ai/stages/sdlc/09-premortem-fmea.yaml:79` (stage #9, **always-on**).
- **Governance:** `governance/stage/sdlc-stages.yaml:954-958` — **severity: blocker,
  required_when: always**.
- **The contradiction:** present in the aggregate `29-development-completion.yaml:158` **AND** in
  doc 06 §8 (line 150) **AND** governed as an always blocker — but **absent from
  `sdlc_pipeline.yaml required_gates.always`** (17 entries, lines 220-237). So
  `sdlc_pipeline.required_gates.always` ⊊ `development_completion.gates ∩ always`: the pipeline
  contract under-declares a gate its own aggregate correctly enforces, and again contradicts its
  own line-34 "doc 06 §8 gate set" header claim.
- **Why lower blast radius than DEFECT-1:** the dev_completion rollup *does* enforce it, so a run
  cannot silently pass with an unreviewed risk register. The defect is the
  **contract/aggregate disagreement** (and the false header claim), not a total coverage hole.
- **Severity:** **DEFECT** (internal contradiction between the pipeline contract and its own
  aggregate + a cited canonical source). Demote to MINOR only if the owner decides the
  pipeline-level `required_gates` list is deliberately a *subset* and records that decision.
- **Fix (either):** add `risk_register_reviewed` to `required_gates.always`, **or** record why the
  pipeline-level set deliberately omits a gate the aggregate enforces.

> **Independent-verification confidence:** HIGH. Both defects were reproduced by the synthesizer
> directly against the YAML (not taken on faith from qa/03): exhaustive `grep` for each gate
> corpus-wide, a programmatic bidirectional gate-coverage sweep
> (`required_gates` ↔ all 31 stage `gates:` ↔ stage-29 rollup), the doc 06 §8 ↔ doc 08 §4 ↔
> `sdlc_pipeline.always` symmetric diff (= {performance_resilience, risk_register} dropped;
> {agentic_safety_eval_pass} added), and a check that no parent summary gate covers performance.

---

## 3. Consolidated MINOR / cosmetic list (non-blocking; recommended in a follow-up sweep)

De-duplicated across the six reports (overlaps merged). None blocks commit.

**Stale index counts (qa/03 — independently re-verified):**
- **M-1** `audit/trace_schemas/_index.yaml:29-32` states "the registry contains exactly **9**"
  trace_schema items + `trace_schema_count: 9` and an evidence parenthetical of "**57**". The
  registry actually has **15** `type: trace_schema` and **58** evidence-family items (56
  evidence_schema + 2 decision_record_schema). The `9` is the *materialized-here* count mislabeled
  as the registry total; the catalog R5 block has the correct figures.
- **M-2** `audit/evidence_schemas/_index.yaml:107`
  `total_evidence_schema_items_in_catalog: 55` + "Values match the source registry one-to-one" —
  catalog actually has **56** evidence_schema items (the unmaterialized one is `evidence_item_schema`,
  status candidate). Field labeled "…in_catalog" holds the *materialized* (55) count.

**Doc/comment-vs-config staleness (qa/01 M-1, qa/04 F-1/F-2/F-3/F-4, qa/06 F-1/F-2):**
- **M-3** `sdlc-stages/06-canonical-corrections-and-overrides.md` §1 routes stage-21
  regulatory-compliance failure to `requirements`; the operative layer (stage 21 file +
  `sdlc_pipeline_runtime_rules.yaml by_stage`) uses `security_privacy_design` and explicitly
  reconciles the divergence. Stale doc line. (qa/01 MINOR-1)
- **M-4** `docs/ai-sdlc-factory/04-team-agent-subagent-model.md:582` (recently edited) set
  `evidence_trace_subagent.parent_agent = evidence_graph_agent`, but `evidence_graph_agent` is
  defined nowhere else in doc 04's (superseded) roster, leaving §6 half-reconciled (1 of 5 entries
  on canonical names, 4 on legacy names). Authoritative configs (stage 28, sub_agent_roles.yaml:549,
  agent_roles.yaml) all agree on `evidence_graph_agent` — no machine wiring affected. (qa/04 F-1)
- **M-5** `configs/nexus-ai/sub_agent_roles.yaml:544-545` and `stages/sdlc/28-evidence-graph-build.yaml`
  comments still say "team-model §6.8 *lists* parent_agent = release_manager_agent" (present tense),
  now stale after the M-4 edit. Data is correct; only the comment lags. (qa/04 F-2, qa/06 NOTE)
- **M-6** `configs/nexus-ai/team_lead_roles.yaml` OQ-TL-1 (line 543) and OQ-TL-3 (lines 632-641)
  describe RESOLVED states as still-open: OQ-TL-1 claims `pipeline_catalog.yaml` uses
  `knowledge_memory_team` (R10 changed it to `knowledge_team`; 0 occurrences remain); OQ-TL-3 asks
  for a shared-agent modeling decision that R12 already made. Stale tracking notes. (qa/04 F-3/F-4)
- **M-7** Skill-governance `stage_count` README vs catalog: `pipeline-catalog/README.md:79` still
  shows **6**; `pipeline_catalog.yaml:150` (and the markdown definition doc, 7 subsections) say **7**.
  Catalog is correct and annotates README's 6 as stale draft-scope. (qa/04 F-5a, qa/06 NOTE-3)
- **M-8** `configs/nexus-ai/team_templates.yaml:27` header says "All **9** sub-agents in scope are
  PARENTED"; body (line 829) + `sub_agent_roles.yaml` correctly say **8 distinct** (the "9"
  double-counts `skill_semantic_extractor_subagent`, which serves 2 pipelines). Cosmetic miscount.
  (qa/04 F-5b)
- **M-9** `pipeline_catalog.yaml` R9 collapse removed all `definition_contract` blocks, but ~32
  provenance comments across `governance_profiles.yaml` (×14), `context_memory_profiles.yaml` (×3),
  `model_provider_profiles.yaml`, and `governance/pipeline/{operations,skill_governance,knowledge}.yaml`
  still assert those alias tokens "reconcile a `pipeline_catalog.yaml` reference" that no longer
  exists. `model_provider_profiles.yaml:37` directly contradicts the catalog header (lines 11-14)
  by claiming live `definition_contract` blocks. Aliases themselves are still valid (markdown +
  governance/ referrers); only the *recorded justification* is now false. (qa/06 F-1)
- **M-10** `memory_write` status contradiction: R7 promoted it to `status: canonical`
  (`tools_registry.yaml:1600`; `core_abilities.yaml:453`), but the un-edited
  `stages/sdlc/31-refraction-learning.yaml:50` still calls it "NON-CANONICAL and DROPPED."
  Functionally reconcilable (stage 31 doesn't list `memory_write` in `uses_tools`; emits
  `MEMORY_UPDATE_PROPOSAL`; the tool's `used_by` is the operations pipeline) — but a reader gets
  opposite answers on "is memory_write canonical?" depending on the file. (qa/06 F-2)

**Registry cosmetics (qa/02):**
- **M-11** `governance_profiles.yaml` `no_policy_bypass` lists its own id in its own `aliases:`
  (self-referential alias; harmless for resolution). (qa/02 F-2)

**Cosmetic field-shape / naming nits in stage contracts (qa/01 — no correctness impact):**
- **M-12** `conditional_required_gates` list-item key varies across stages
  (`- gate_id:` vs `- gate:` vs inline `name:/required_when:`); not-applicable block spelled
  `on_not_applicable:` vs `when_not_applicable:`; applicability artifact key varies
  (`decision`/`artifact`/`decision_artifact`). All parse and validate. (qa/01 MINOR-3)
- **M-13** Mixed `_if_applicable` suffixing on conditional-stage gate names (e.g. stage 25 uses bare
  names, stages 20/21 mix). Conditionality is carried authoritatively by `required_when`
  expressions + `required_gate_producers`, not by the name suffix. (qa/01 MINOR-4)
- **M-14** `agent_roles.yaml agentic_safety_agent.outputs` trails the authoritative stage-18 file
  (omits `TOOL_MISUSE_TEST_REPORT`, `CONTEXT_POISONING_TEST_REPORT`). Stage file is canonical per
  its own header; catalog should mirror it. (qa/01 MINOR-2)
- **M-15** WP-06 / WP-07 doc H1 titles add the word "Profile" that the handoff README component
  column omits (same WP id, same plan file). Pure wording variance. (qa/05 N-1)

---

## 4. Notes (informational — design-intentional or status-gated; recorded so they are not re-run)

- **N-1 — Three live NAME COLLISIONS, all status `candidate` + Phase-E-deferred (qa/02 F-1).**
  `operations_analysis_model`, `learning_reflection_model` (model_provider_profiles.yaml) and
  `learning_context_pack` (context_memory_profiles.yaml) are each simultaneously a first-class
  *candidate* item AND a recorded alias of a different SDLC canonical. Verified `status: candidate`
  on all three. Not a defect: first-class id deterministically wins; every live consumer of the
  literal name is an operations-pipeline role intending the first-class item; the SDLC side never
  binds the colliding name as a value. Tracked in
  `model_provider_profiles.yaml reconciliation.name_collisions_requiring_phase_e_decision` and
  `context_memory_profiles.yaml open_questions`. Resolve by renaming the operations candidates in
  Phase E. (Forward-looking caveat: a runtime resolver must implement "first-class beats alias".)
- **N-2 — Cross-reference integrity is independently CLEAN (qa/02).** 2,578 forward `uses_*` refs
  resolve (0 dangling) and 0 reverse `used_by` back-refs dangle, re-confirmed after the recent edits.
  No lifecycle-dangling (no consumer references a deprecated item). Evidence≠Trace and
  Governance≠Audit alias families are kept distinct.
- **N-3 — `decision_records/` dir not yet created** — catalog status
  `placement_decided_pending_phase_e`; a consistent deferral, not a dangling claim. (qa/03)
- **N-4 — Plans & handoff are CLEAN (qa/05):** doc-20-§4 contract complete on all 10 WPs;
  `depends_on` is an acyclic DAG matching the README tiers; all `canonical_sources` paths exist;
  planning-only (no executable code); WP-05/08/09/10 label fixes + WP-10 canonical-source fix
  verified correct.
- **N-5 — Locked decisions: ALL UPHELD across every dimension.** No plugin (91 governance + all
  handoff `plugin` tokens are absence-guards/prohibitions); Core Abilities
  [Supervisor,Coder,Vision,Audio,Creative,Memory,Web,OS] never an Agent/owner/lead/parent/caller
  (grep-clean in authoritative configs); Supervisor never a team_lead; Skill≠Tool; Governance≠Audit;
  Evidence≠Trace (physical dir + type level); nexus never merges to main (restated in every plan).
  The `core_abilities.yaml` `display_name` addition is a label only — lowercase ids stay canonical.

---

## 5. Overall verdict

**FIX_FIRST.** Five of six QA dimensions are clean-or-cosmetic, cross-reference integrity and the
locked decisions are fully intact, and the recent edits introduced only non-blocking comment/status
drift. **But two real, independently-verified gate-coverage defects block commit:**

1. **DEFECT-1** — `performance_resilience_pass_or_accepted` (an always-on **blocker** gate) is in
   **no** required-gate rollup (`sdlc_pipeline.yaml` *and* `development_completion` both omit it),
   contradicting both files' own "doc 06 §8 gate set / UNION" claims and falsifying readiness-gate
   hard-blocker #8. A run can reach release-candidate without this blocker being aggregated.
2. **DEFECT-2** — `risk_register_reviewed` (always-on blocker) is missing from
   `sdlc_pipeline.yaml required_gates.always`, contradicting its own aggregate (which enforces it)
   and doc 06 §8.

Recommend fixing both (preferably by adding the gates to the deficient rollup[s], aligning to
doc 06 §8) **before** committing — and reconciling the doc 06 §8 vs doc 08 §4 split that is their
shared root cause. The ~12 MINOR items can follow in a separate cosmetic sweep; they do not block.

**OVERALL: FIX_FIRST**
