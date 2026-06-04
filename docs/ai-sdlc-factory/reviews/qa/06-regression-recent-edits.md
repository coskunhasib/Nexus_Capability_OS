# QA-06 — Regression Check of Recently-Edited Files (Final Adversarial QA)

Scope: regression-check the files touched by the reconciliation sweep + label fixes
(audit_schemas.yaml, governance_profiles.yaml, tools_registry.yaml, core_abilities.yaml,
agent_roles.yaml, pipeline_catalog.yaml, sdlc_pipeline_runtime_rules.yaml,
model_provider_profiles.yaml, docs 04, implementation-handoff WP-05/08/09/10). Read-only.
Mechanical baseline (YAML parse, JSON schema validity, dead-link, plugin invariant, owner/team-lead
guards, Evidence/Trace dir separation) was already verified CLEAN and is NOT re-checked here. This
pass targets SEMANTIC + CROSS-LAYER consistency and REGRESSIONS introduced by the edits.

Classification legend: DEFECT (must fix before commit) / MINOR (non-blocking) / NOTE.

---

## Summary verdict

No DEFECT found. Two real regression-residues, both **MINOR** (stale provenance / stale status
wording introduced by the edits; no machine-checkable invariant broken, no locked-decision violation,
no dangling id-resolution, no duplicate id). Everything the task asked to confirm was verified
correct on the load-bearing (machine-checkable) data.

---

## Per-finding list

### FINDING 1 — MINOR (regression). Stale `pipeline_catalog.yaml` provenance after the summary-only (R9) collapse
**Files:** configs/nexus-ai/governance_profiles.yaml, context_memory_profiles.yaml,
model_provider_profiles.yaml, governance/pipeline/{operations,skill_governance,knowledge}.yaml
(7 files; ~32 comment/provenance sites).

**What:** The R9 collapse made `pipeline_catalog.yaml` summary-only and **removed all per-pipeline
`definition_contract` blocks** (catalog header lines 11-14 state this explicitly). Those blocks were
the ONLY place the "divergent catalog-YAML variant" tokens lived. After the collapse, the catalog
contains ZERO occurrences of all 13 such tokens (verified): `incident_response_governance`,
`skill_governance_profile`, `skill_safety_gate`, `skill_binding_gate`, `memory_governance_profile`,
`memory_validity_gate`, `memory_expiration_gate`, `development_completion_gate`,
`skill_inventory_context_pack`, `knowledge_memory_run_context`, `memory_corpus_context_pack`,
`memory_reasoning_profile`, `research_pipeline_governance`.

But the registries that absorbed those tokens as aliases still carry provenance comments asserting
they originate from / are referenced by pipeline_catalog.yaml, e.g.:
- governance_profiles.yaml ×14: `# F-1 / OQ-GOV-4: catalog-YAML name (pipeline_catalog.yaml); MD canonical: ...`
  and repeated notes "...recorded under aliases so the **pipeline_catalog.yaml reference resolves**."
- context_memory_profiles.yaml ×3: `# catalog YAML variant (pipeline_catalog.yaml); markdown name is canonical (review F-1)`.
- model_provider_profiles.yaml: line 37 references "`pipeline_catalog.yaml` definition_contract blocks
  (divergent YAML variants recorded under aliases)" — a **direct contradiction** with the catalog
  header (lines 11-14), which says those definition_contract blocks were removed; plus line 1088
  (`memory_reasoning_profile # pipeline_catalog.yaml variant (F-1)`).
- governance/pipeline/{operations,skill_governance,knowledge}.yaml each list pipeline_catalog.yaml in
  their reference sources "(... alias)".

**Why it is NOT a DEFECT:** The locked id-resolution invariant is "every *referenced* id resolves to a
first-class item or a recorded alias." That still holds — these aliases now simply have no live
referrer (the reverse of a dangling reference, which is harmless to resolution). No first-class id,
no machine-checkable binding, and no gate/pipeline reference is broken. The aliases also remain valid
for the OTHER, still-live referrers (the markdown definition_docs + the governance/ subfolder copies).

**Why it is still a real regression:** the *recorded justification* for these aliases is now false
("reconciles a pipeline_catalog.yaml reference" — there is no such reference anymore), and
model_provider_profiles.yaml line 37 contradicts the catalog header head-to-head. This is exactly the
kind of cross-layer wording drift the collapse introduced.

**Suggested fix (non-blocking):** reword the ~32 provenance comments to say the variant originated in
the *former* catalog definition_contract block (now removed; markdown authoritative), or drop the
"(pipeline_catalog.yaml)" attribution. The aliases themselves should be KEPT (still serve markdown +
governance/ referrers). Fix model_provider_profiles.yaml line 37 to not claim live
definition_contract blocks.

---

### FINDING 2 — MINOR (regression). `memory_write` status contradiction: R7 made it canonical, stage-31 still calls it "NON-CANONICAL and DROPPED"
**Files:** configs/nexus-ai/tools_registry.yaml + core_abilities.yaml (edited) vs
configs/nexus-ai/stages/sdlc/31-refraction-learning.yaml (NOT edited).

**What:** The R7 reconciliation promoted `memory_write` to `status: canonical` (tools_registry.yaml
line 1600; rationale: exposed_tool of the locked-canonical Memory ability). core_abilities.yaml even
lists allowed_usage `persist_curated_learning_and_memory_items_via_memory_write` (line 453). But the
un-edited stage-31 contract still states (line 50): "The legacy `memory_write` tool is NON-CANONICAL
and is DROPPED: persisting the curated learning [is] a proposal, not a direct memory mutation" — and
its open_questions flags it "in case a dedicated memory-write tool/governance is later formalized"
(which has now happened in R7, but stage 31 was not updated).

**Why it is NOT a DEFECT:** the two are functionally reconcilable. Stage 31 does NOT list memory_write
in its `uses_tools` (lines 106-110: evidence_reader/defect_tracker/artifact_writer/evidence_writer
only) and emits MEMORY_UPDATE_PROPOSAL instead. memory_write's `used_by` is `operations_pipeline.
learning_update`, a different consumer. So no binding collides; no machine-checkable reference breaks.

**Why it is still a real regression:** a reader gets opposite answers to "is memory_write canonical?"
depending on file (canonical in the edited registries vs "NON-CANONICAL" in stage 31). The edit
changed the tool's global status without updating the stage that asserts the old status.

**Suggested fix (non-blocking):** update the stage-31 comment to: memory_write is now canonical (R7)
but is intentionally not used by stage 31, which remains a proposer (MEMORY_UPDATE_PROPOSAL); resolve
the related open_question.

---

### FINDING 3 — NOTE (pre-existing, not a regression). README skill-governance stage_count = 6 vs catalog/markdown = 7
**Files:** docs/ai-sdlc-factory/pipeline-catalog/README.md (line 79) vs pipeline_catalog.yaml (line 150)
+ skill-governance-pipeline.md (7 stage subsections, verified).

**What:** The README §3 table still lists Skill Governance Pipeline as 6 stages; the catalog YAML and
the authoritative markdown both have 7 (skill_intake..skill_deprecation_update). The catalog YAML
already carries an explicit comment that README's "6" is the stale draft-scope value and "7" is
authoritative. README is not in the edited set. Flagged for completeness only; the edited file
(catalog) is correct. (NOTE, not blocking.)

---

## Items explicitly verified CORRECT (the task's confirm-list)

- **audit_schemas.yaml candidate ids well-formed + referenced.** 28 candidate items; the 7
  reconciliation candidates (tool_call_trace_schema, evidence_item_schema, model_invocation_trace_schema,
  skill_activation_trace_schema, context_usage_trace_schema, core_ability_invocation_trace_schema,
  source_fetch_trace_schema) each carry full §3 + category fields, correct `type`, producer/consumer =
  snake_case Agent roles (never a Core Ability), and live `used_by`. No duplicate first-class id.
  All 16 aliases preserve **Evidence != Trace** (every `*_trace*` alias → trace_schema parent; every
  `*_evidence_schema` alias → evidence_schema parent). No alias collides with a first-class id.
- **governance_profiles.yaml candidate ids well-formed + referenced.** global_governance,
  model_invocation_governance, context_access_governance each carry ≥13 contract fields; their
  constituent governance_profiles all resolve to first-class ids. The F-1 pipeline aliases
  (incident_response_governance, skill_governance_profile, memory_source_governance variants, etc.)
  are recorded with same-family integrity. No duplicate first-class id.
- **tools_registry web_search / web_fetch / memory_write are canonical.** All three `status: canonical`
  (R7), justified as exposed_tools of the locked-canonical Web/Memory abilities, and listed in
  core_abilities.yaml exposed_tools (Web: web_search/web_fetch/web_scrape; Memory: ...memory_write...).
  Tool-count rollup updated consistently (canonical 46 / candidate 35). No Core Ability appears as an
  allowed_caller. (See Finding 2 for the stage-31 wording residue.)
- **core_abilities.yaml display_name added without breaking ids.** All 8 abilities keep lowercase
  canonical ids (supervisor/coder/vision/audio/creative/memory/web/os) and gained a capitalized
  `display_name`; id_to_display map is complete and correct; `every_item_has_display_name: true`.
  The locked set [Supervisor,Coder,Vision,Audio,Creative,Memory,Web,OS] is intact; none became an Agent.
- **agent_roles skill_librarian alias coherent.** `skill_librarian_agent` is the single canonical id;
  `skill_librarian_agent_skill_governance` is recorded ONLY as an alias + `also_serves` cross-team
  binding (0 separate top-level role). alias_of block well-formed. `total_distinct_agent_roles: 52`
  matches the 52 distinct agent_ids actually present (R12 53→52). Its nested sub_agent
  (skill_semantic_extractor_subagent) has parent_agent = skill_librarian_agent (consistent).
- **pipeline_catalog summary-only collapse lost no pipeline.** All 6 active pipelines + 5 candidate
  pipelines present (11 total). Each active entry has stage_count matching its authoritative
  definition_doc (research 10, activation 7, operations 6, skill-governance 7, knowledge-memory 6 —
  all verified against the markdown §2.x subsection counts and sdlc 31). definition_docs all exist.
  (The collapse's only residue is the cross-file provenance staleness in Finding 1.)
- **doc 04 §6.8 evidence_trace_subagent parent = evidence_graph_agent.** Confirmed (line 582, comment
  "Was release_manager_agent (corrected)"). The functional parent_agent is consistent across all three
  sources: doc 04 §6.8, sub_agent_roles.yaml line 549, and stage 28 contract line 87. NOTE: the
  explanatory comments in sub_agent_roles.yaml (lines 544-546) and stage 28 (lines 31-33) still say
  "team-model §6.8 lists parent_agent = release_manager_agent" — now stale after the doc-04 correction
  (the binding is right; only those two NOTE comments lag). Sub-MINOR; folded into the general
  comment-staleness theme.
- **sdlc_pipeline_runtime_rules.yaml required_gate_producers well-formed.** All 6 mapped gates exist in
  sdlc_pipeline.yaml required_gates with the correct tier (requirements_complete, nfr_coverage_complete,
  architecture_complete, adr_coverage_complete, verification_loop_bug_finding_pass = always;
  cost_resource_governance_pass_if_applicable = conditional). All 5 distinct producing_rules resolve to
  first-class governance_profiles.yaml ids AND appear in their stage's uses_governance_profiles. All
  satisfied_by_stage_gates exist in the producing stage's gates list. All producing_stages are
  canonical stage ids. The block's own invariants hold. CLEAN.
- **model_provider_profiles.yaml governance refs resolve.** All 12 distinct governance refs resolve
  (11 first-class + research_pipeline_governance as a recorded alias of research_source_governance).
  No dangling governance reference. (Provenance-wording residue per Finding 1.)
- **implementation-handoff WP-05/08/09/10 label fixes clean.** All `depends_on` cross-refs point to
  existing WP ids and match the README dependency table + tier ordering (WP-05←[01,02], WP-08←[01],
  WP-09←[03,04,08], WP-10←[09,05]); acyclic. WP-10's label-fix note correctly disambiguates the WP-05
  id from the legacy workpackage. No contradiction.

## Locked-decision spot-checks (all upheld)
- No plugin concept introduced by any edit (plugin_absent still global blocker; pipeline_catalog
  `no_plugin: true`).
- Core Abilities never owners/agents/callers; Supervisor never a team_lead (display_name change is a
  label only; lowercase id canonical).
- Skill != Tool (skill_activation_trace_schema kept distinct from tool_call_trace_schema).
- Governance != Audit (governance_profiles.yaml holds no *_evidence/*_trace schema as a first-class
  item; audit_schemas.yaml holds no governance profile).
- Evidence != Trace (all 16 audit aliases family-consistent).
