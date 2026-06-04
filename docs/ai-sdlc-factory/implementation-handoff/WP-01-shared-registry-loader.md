# WP-01 — Shared Registry Loader (Implementation Workpackage Spec)

> **Implementation Planning Handoff artifact** (doc 22 §8). This is a workpackage **spec** — it
> describes *what* the shared-registry-loader component must be built to do and *how* its build
> will be validated. **It contains no code and does not authorize writing any.** Authoring this
> spec is not executing it; producing the runtime modules named below is a separate, future,
> separately-approved execution step. The `nexus` branch stays isolated from `main`.

This spec is the implementation form of the planning-only design in
[`../runtime-refactor-plan/shared-registry-loader-plan.md`](../runtime-refactor-plan/shared-registry-loader-plan.md).
It follows the **Workpackage Contract** field set (doc 20 §4 —
[`../20-executor-workflow-standard-plan.md`](../20-executor-workflow-standard-plan.md) §4), plus
the `depends_on` field added for the implementation handoff. The completion report the executor
returns is governed by the **Completion Report Contract** (doc 20 §5) as formalized in
[`../executor-standard/completion-report-schema.md`](../executor-standard/completion-report-schema.md).

> **Locked context (not this workpackage's to revisit — it enforces them).** Plugin is cancelled
> (no plugin registry, ever). The eight Core Abilities `[Supervisor, Coder, Vision, Audio,
> Creative, Memory, Web, OS]` are **not** Agents (`Supervisor` is also **not** a team lead). Skill
> != Tool. Governance != Audit. Evidence != Trace. The Shared Registry ("what exists") + Usage
> Mapping ("who uses what") separation holds. `nexus` never merges to `main`. The implementation
> target is a **future** Nexus runtime workspace decided later — this workpackage does **not**
> modify the existing `nexus` app code and does **not** touch `main`.

---

```yaml
# ===========================================================================
# Workpackage Contract — doc 20 §4 (+ depends_on for the implementation handoff)
# Implementation Planning Handoff (doc 22 §8). SPEC ONLY — describes modules to be
# BUILT (names + responsibilities), contains no code, authorizes no execution.
# ===========================================================================

workpackage_id: WP-01-shared-registry-loader

executor: Codex

reviewer: ChatGPT            # reviewer / auditor / plan owner (doc 20 §3); Owner is final approver

depends_on: []               # foundation component — no upstream workpackages.
                             # Downstream WPs (governance engine, audit/evidence store, pipeline
                             # runner, run-state model, tool-permission system, model/provider
                             # resolver, context/memory resolver, core-abilities alignment) depend
                             # on THIS — see runtime-refactor-plan/shared-registry-loader-plan.md §9.

objective: >-
  Build the shared-registry loader: a component that loads and validates the SEVEN shared
  registries from configs/nexus-ai/, resolves every usage-site `uses_*` reference against them,
  and reconciles the declared aliases — the governance `*_policy` variants
  (no_self_approval_policy -> no_self_approval, evidence_required_policy -> evidence_required) and
  the Core Ability display_name <-> lowercase-id mapping (e.g. "Supervisor" <-> supervisor) — so it
  exposes a single typed lookup that every downstream runtime component depends on. The loader
  resolves each token to exactly ONE canonical id, carries each item's status (canonical /
  candidate / deprecated) and the alias trail, never crosses a category boundary, never places a
  Core Ability in an agent/team-lead slot, and never admits a plugin concept.

mandatory_context:           # the executor MUST load these before producing any output
  - .memory/*                                                   # locked decisions / memory (incl. nexus-never-merges-to-main)
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md  # workpackage (§4), completion report (§5), forbidden (§6), review gate (§7)
  - docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md  # owner-decision boundary (§7), allowed next phase (§8), prohibited-until-approval (§9), hard blockers (§6)
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md  # THE design this spec implements (load sequence, alias rules, candidate handling, invariants, consumer interfaces)
  - docs/ai-sdlc-factory/runtime-refactor-plan/README.md        # plan-set overview + owner-approval dependency (§1)
  - docs/ai-sdlc-factory/executor-standard/codex.md             # Codex executor profile: what it may/​must-not do, how it validates
  - docs/ai-sdlc-factory/executor-standard/completion-report-schema.md  # the completion-report contract this WP returns in

canonical_sources:           # authoritative sources the build is derived from / bound to (referenced, never modified)
  # Primary design source (source of truth for THIS component):
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md
  # The seven shared registries the loader loads (its input — "what exists"):
  - configs/nexus-ai/core_abilities.yaml            # registry_id: nexus_ai_core_abilities;           list key: core_abilities; 8 canonical abilities (names locked)
  - configs/nexus-ai/skills_registry.yaml           # registry_id: nexus_ai_skills_registry;          list key: skills
  - configs/nexus-ai/tools_registry.yaml            # registry_id: nexus_ai_tools_registry;           list key: tools
  - configs/nexus-ai/governance_profiles.yaml       # registry_id: nexus_ai_governance_profiles;      list key: governance_profiles; OWNS canonical policy ids + *_policy aliases
  - configs/nexus-ai/audit_schemas.yaml             # registry_id: nexus_ai_audit_schemas_registry;   list key: audit_schemas; carries governance_profile_aliases (corroborating)
  - configs/nexus-ai/model_provider_profiles.yaml   # registry_id: nexus_ai_model_provider_profiles;  list key: profiles
  - configs/nexus-ai/context_memory_profiles.yaml   # registry_id: nexus_ai_context_memory_profiles;  list key: profiles
  # Cross-referenced (NOT loaded as a shared category) — schema-owned field sets the loader cross-checks:
  - configs/nexus-ai/schemas/                        # the 6 JSON Schemas (draft 2020-12); validate INSTANCES, not the registries
  - configs/nexus-ai/validation/README.md            # cross-file invariants + usage-mapping checks + governance-only checks
  # Usage sites the loader RESOLVES against the registries (the "who uses what" side — read to check references, not to define existence):
  - configs/nexus-ai/stages/sdlc/                    # 31 SDLC stage contracts, each with the 7 uses_* arrays
  - configs/nexus-ai/sdlc_pipeline.yaml              # SDLC pipeline definition (reduced form — see open question 5)
  - configs/nexus-ai/pipeline_catalog.yaml           # pipeline catalog entries
  - docs/ai-sdlc-factory/pipeline-catalog/           # catalog prose (the 5 non-SDLC pipelines that use *_policy variants)
  - configs/nexus-ai/team_templates.yaml             # team/agent usage sites (resolved, never given ownership)
  - configs/nexus-ai/team_lead_roles.yaml
  - configs/nexus-ai/agent_roles.yaml
  - configs/nexus-ai/sub_agent_roles.yaml
  # Locked rules / decisions the loader enforces:
  - docs/ai-sdlc-factory/05-shared-registry-and-usage-mapping.md   # the Shared-Registry + Usage-Mapping rule (existence vs usage)
  - docs/ai-sdlc-factory/00a-shared-registry-decisions.md          # decisions D-011..D-015
  - docs/ai-sdlc-factory/17-shared-registry-formalization-plan.md  # registry item contract (§3), per-category fields (§4), status vocab + invariants (§11/§13)
  - docs/ai-sdlc-factory/06-governance-policy-evidence.md          # canonical governance policy ids (no_self_approval, evidence_required, ...)
  - docs/ai-sdlc-factory/01-nexus-ai-operating-model.md            # §6 the 8 Core Abilities
  - docs/ai-sdlc-factory/00-decision-log.md                        # locked decisions (K-001 no plugin, K-003/K-006 Core Abilities)

required_outputs:            # DESCRIBE the modules/artifacts to be BUILT (names + responsibilities). NO CODE in this spec.
                             # Target location is a FUTURE Nexus runtime workspace (decided later) — NOT this repo's nexus app, NOT main.
                             # Module/path names below are the executor's to finalize at build time; what is fixed is the RESPONSIBILITY each must carry.

  - artifact: registry_descriptor_table
    responsibility: >-
      The static descriptor of the seven registries — per category, the file path, expected
      `registry_id`, expected `shared_category`, and the correct top-level item-list key. MUST
      record that categories 1–5 use the category-named key (core_abilities / skills / tools /
      governance_profiles / audit_schemas) while categories 6–7 use the generic `profiles:` key;
      it must NOT assume a uniform key. Used by the identity check (plan §3 pass 2) and item
      indexing (pass 3). Hard-codes the SEVEN categories and their keys, never the item counts.

  - artifact: registry_file_parser
    responsibility: >-
      Loads each of the seven YAML files as a single-document object and fails fast on a parse
      error (plan §3 pass 1). Confirms each file's `registry_id` / `shared_category` match the
      descriptor (pass 2) so a file moved/renamed under the wrong category is rejected. Produces
      raw per-registry item lists for indexing. Does NOT execute anything, call a model, or touch
      a network/connector — this is static file loading only.

  - artifact: registry_item_index  (the "existence view", plan §2)
    responsibility: >-
      Per category, an index of every item by its canonical `id`, carrying `status`, the item-
      contract fields (doc 17 §3), the per-category fields (doc 17 §4), the declared `aliases`,
      and the item's own `used_by` block. Rejects duplicate ids within a category (ambiguous
      existence — plan §3 pass 3). This is the authoritative "what exists" record per category;
      it is NEVER populated from a usage site (plan §2: never infer existence from usage).

  - artifact: alias_table_builder  (plan §3 pass 4, §4)
    responsibility: >-
      Assembles the global read-time alias map so any usage token resolves to exactly one
      canonical id, from the THREE declared sources plus the Core Ability name<->id derivation:
      (a) the `aliases` list on each CANONICAL governance item — authoritative for the `*_policy`
      variants (governance_profiles.yaml: id `no_self_approval` carries alias
      `no_self_approval_policy`; id `evidence_required` carries alias `evidence_required_policy`);
      (b) core_abilities.yaml `policy_aliases:` (corroborating); (c) audit_schemas.yaml
      `governance_profile_aliases:` (corroborating). Merges all three; the governance registry's
      own `aliases` list is the tie-breaker of record (Governance != Audit; the policy is OWNED by
      governance). Rejects an alias that maps to two different canonical ids (alias collision ->
      blocker). Aliases are read-time normalization ONLY — they never rename stored data. Performs
      NO implicit/fuzzy/pluralizing/case-folding aliasing outside §4.1 and §4.2 (plan §4.3).

  - artifact: core_ability_name_id_map  (plan §4.2)
    responsibility: >-
      A bidirectional Core Ability display_name <-> lowercase-id map derived strictly from each
      core_abilities.yaml item's own `id` (lowercase snake, e.g. supervisor, os) and `name`
      (PascalCase display, e.g. Supervisor, OS) pair — NOT by lowercasing heuristics. A
      `uses_core_abilities` token (PascalCase display_name, the only place an ability name may
      appear) resolves to the item whose `name` equals it; internally keyed by the lowercase `id`.
      MUST carry each item's `never_agent: true` flag (and `never_team_lead: true` for Supervisor)
      so a downstream resolver cannot place an ability in an agent / owner_agent / sub_agent /
      team_lead slot. This map is case/identity only — it must NEVER bridge an ability into an
      agent role.

  - artifact: candidate_status_resolver  (plan §5)
    responsibility: >-
      Reads each item's `status` from the locked vocabulary {canonical, candidate, deprecated} and
      tags resolutions accordingly: `canonical` resolves normally; `candidate` resolves but is
      tagged `candidate-only` (ratification debt, surfaced — never auto-promoted); `deprecated`
      resolves with a warning (strict mode may downgrade a deprecated-only resolution to a
      finding). Status is owned by the item's OWN registry — a name another registry references as
      candidate does not set the owner's status. A missing `status` is a blocker.

  - artifact: cross_reference_reconciler  (plan §6)
    responsibility: >-
      Resolves each registry's cross-references (e.g. a Core Ability's governance_profiles /
      audit_schemas / model_provider_profiles / exposed_tools; a model profile's governance/audit
      refs) to the OWNING registry and validates the referenced id exists there and lands in the
      correct family (a uses_governance_profiles ref must hit governance, a uses_audit_schemas ref
      must hit audit — never the other way). Reconciles core_abilities.yaml `referenced_candidates`
      against each declared `owned_by` file and reports drift (present vs absent, status agree vs
      disagree) — informational; the owning registry stays authoritative for existence and status.

  - artifact: usage_resolution_view  (plan §2, §7)
    responsibility: >-
      For every usage site (31 stage contracts, sdlc_pipeline.yaml, pipeline catalog entries,
      team/agent roles), walks the SEVEN category-aligned `uses_*` arrays (uses_core_abilities,
      uses_skills, uses_tools, uses_governance_profiles, uses_audit_schemas,
      uses_model_provider_profiles, uses_context_memory_profiles), resolves each token through the
      alias table to a canonical id, and classifies it: `satisfied` (direct canonical id) /
      `aliased` (via §4 alias — records canonical id + alias used) / `candidate-only` (owner status
      candidate) / `wrong-family` (resolved in the wrong category — boundary violation) /
      `dangling` (resolves to nothing — registry drift). Never registers a usage-only name as
      existence; a dangling token is reported, not silently created.

  - artifact: load_time_invariant_gate  (plan §8)
    responsibility: >-
      Runs the registry-set invariants AFTER indexing + resolution, with severities from the
      registries' own hard_rules. At minimum the plan §8 set: (1) exactly one registry file per
      category with the expected registry_id/shared_category [blocker]; (2) every item has a status
      in {canonical,candidate,deprecated} [blocker]; (3) every item is used OR is a candidate — no
      canonical orphan [finding]; (4) no duplicate id within a category, no alias collision
      [blocker]; (5) exactly the EIGHT canonical Core Abilities, all status canonical, each
      never_agent: true, Supervisor never_team_lead: true [blocker]; (6) no Core Ability id/name
      appears as owner_agent / sub_agents / team_lead / produced_by / related_agent /
      related_sub_agent at any usage site [blocker]; (7) Supervisor never resolved into a team-lead
      slot [blocker]; (8) every uses_* token is satisfied/aliased/candidate-only — no dangling
      [finding], no wrong-family [blocker]; (9) family distinctness Skill!=Tool, Governance!=Audit,
      Evidence!=Trace [blocker]; (10) NO `plugin` key/value anywhere in the loaded registries or
      alias tables [blocker]. A blocker means the registry set is not loadable as a consistent
      graph — the loader refuses to hand a partial graph downstream; a finding means it loads with
      named ratification/drift debt.

  - artifact: typed_lookup_interface  (the loader's public contract — plan §2 outputs, §9 consumers)
    responsibility: >-
      The single typed lookup other components depend on. Exposes, per category, lookup of a
      canonical item by id and by alias/display-name; returns the resolved canonical id, the
      item's status, the alias trail used, the category, and the relevant per-category fields the
      consumers need (per plan §9: governance items with severity_default/scope/applies_to;
      evidence/trace/decision/gate schema ids kept in distinct families; tool items with
      risk_level/requires_sandbox/provided_by_core_ability/allowed_callers; model & context/memory
      `profiles` with used_by/fallback/retention/redaction; the 8 abilities with their bindings and
      never_agent/never_team_lead flags). Contract to ALL consumers: resolve to one canonical id,
      carry status, carry the alias trail, never cross a category boundary, never place a Core
      Ability in an agent/team-lead slot, never admit a plugin concept. The strict-vs-lenient load
      mode (open question 2) is surfaced here as a build decision, defaulting per the plan.

  - artifact: reconciliation_report_output
    responsibility: >-
      The structured output of a load run (plan §3 final paragraph): every alias applied, every
      candidate-only reference (ratification debt), every dangling reference (drift), every
      cross-reference drift, and the per-invariant result with severity. This is the human/review
      surface the downstream review gate reads; it is data/report, not an execution log.

  - artifact: loader_build_documentation
    responsibility: >-
      A README/build-notes artifact, in the future workspace, that maps each module above back to
      the section of shared-registry-loader-plan.md it implements, records the strict-vs-lenient
      mode decision, and restates the forbidden actions. Documentation of the build — it grants no
      execution authority and makes no production-readiness claim.

required_validations:        # checks the executor must run/state on the BUILT artifacts before reporting (static; no pipeline execution)
  - input_files_present: >-
      All seven registry files load and each matches its expected registry_id + shared_category +
      top-level list key per the descriptor table (plan §1/§3 pass 1–2). Categories 6–7 confirmed
      to use the `profiles:` key, 1–5 the category-named key.
  - existence_view_built: >-
      Every item is indexed by canonical id with status + item-contract fields + category fields +
      aliases + used_by; no duplicate id within any category (plan §3 pass 3).
  - alias_resolution_correct: >-
      no_self_approval_policy resolves to canonical no_self_approval, and evidence_required_policy
      to canonical evidence_required, with the canonical owner = governance_profiles.yaml and the
      reference marked `aliased`. The three alias sources are merged and AGREE; any disagreement is
      reported as an alias-collision blocker. No alias maps to two canonical ids. (plan §4.1, §8 #4)
  - core_ability_name_id_resolution: >-
      Each of the 8 PascalCase display names (Supervisor, Coder, Vision, Audio, Creative, Memory,
      Web, OS) resolves to its lowercase id (supervisor, coder, vision, audio, creative, memory,
      web, os) and back, derived from the registry's own id/name pairs (e.g. OS<->os), never by
      heuristic case-folding. never_agent / never_team_lead flags are carried. (plan §4.2, §8 #5)
  - candidate_handling: >-
      candidate-status items resolve but are tagged candidate-only and listed as ratification debt;
      none is auto-promoted. Owner registry is authoritative for status; referenced_candidates
      drift in core_abilities.yaml is reported, not trusted. Missing status => blocker. (plan §5, §6)
  - usage_resolution_complete: >-
      Every uses_* token across all 31 stage contracts + sdlc_pipeline.yaml + pipeline catalog +
      team/agent roles is classified satisfied / aliased / candidate-only / wrong-family / dangling;
      dangling tokens are recorded in open_questions (not silently registered); wrong-family is a
      boundary blocker. (plan §7, §8 #8)
  - family_distinctness: >-
      A token resolves only within its own category — Skill != Tool, Governance != Audit, Evidence
      != Trace are never bridged by name similarity or cross-family resolution. (plan §4.3, §8 #9)
  - core_ability_agent_boundary: >-
      No Core Ability id/name appears as owner_agent / sub_agents / team_lead / produced_by /
      related_agent / related_sub_agent at any resolved usage site, and Supervisor is never
      resolved into a team-lead slot. (plan §8 #6/#7; validation README §6)
  - plugin_absent: >-
      `plugin` appears as a data key/value NOWHERE in the loaded registries, alias tables, or any
      built artifact (only permissible inside forbid/guard prose). (plan §8 #10; K-001)
  - invariant_gate_runs: >-
      All plan §8 invariants execute and are reported with the correct severity (blocker vs
      finding); a blocker-severity failure causes the loader to refuse a partial graph rather than
      proceed.
  - typed_lookup_contract_satisfied: >-
      The typed lookup exposes, for each plan §9 consumer, resolution to a single canonical id with
      status + alias trail + category + the per-category fields that consumer needs; no consumer
      path can cross a category boundary or obtain a Core Ability in an agent/team-lead slot.
  - no_execution_performed: >-
      Validation is STATIC (file load + resolution + invariant checks). No pipeline is run, no
      stage executed, no model called, no connector hit, nothing deployed, nothing merged. (doc 22
      §9; Codex profile §6)

forbidden_actions:           # GLOBAL executor forbidden actions (doc 20 §6 / doc 22 §9) — apply to EVERY workpackage
  - write_to_main_branch                              # nexus stays isolated; nothing is written to main
  - merge                                             # no PR-merge, no fast-forward — nexus NEVER merges to main
  - start_runtime_or_refactor_without_further_owner_approval  # building the loader requires a SEPARATE explicit owner decision beyond this spec
  - add_connector_deploy_or_publish                   # no connector wiring, no deploy, no Nexus publish
  - introduce_plugin                                  # plugin is cancelled — no plugin registry/stage/concept/field/key
  - self_approve                                      # the executor never declares the review gate or readiness gate passed
  - claim_production_readiness                        # no production-readiness claim of any kind
  # --- component-specific (carry the plan's locked boundaries into the build) ---
  - modify_any_canonical_source                       # registries, schemas, plans, stage contracts are READ-ONLY inputs — never edited to make the loader pass
  - modify_existing_nexus_app_code                    # the target is a FUTURE runtime workspace, decided later — not this repo's nexus app
  - infer_existence_from_a_usage_site                 # a usage-only name is a dangling reference, reported — never registered as existence (plan §2)
  - auto_promote_a_candidate                          # candidate -> canonical is a future review/owner action, never the loader's (plan §5)
  - invent_an_alias_outside_the_declared_sources      # no fuzzy/pluralize/case-fold aliasing beyond §4.1 *_policy and §4.2 name<->id (plan §4.3)
  - place_a_core_ability_in_an_agent_or_team_lead_slot # name<->id map is case/identity only; never bridges an ability into owner_agent/sub_agent/team_lead; Supervisor is never a team lead (plan §4.2, §8)
  - cross_a_category_boundary_on_resolution           # keep Skill!=Tool, Governance!=Audit, Evidence!=Trace; a token resolves only in its own family (plan §4.3, §8 #9)
  - downgrade_or_silence_a_blocker_invariant          # never weaken/skip a plan §8 blocker to force a clean load; report it instead

completion_report_format:    # the executor returns the doc 20 §5 Completion Report Contract
  schema: docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5
  required_fields:           # (mirrors the schema; every field present, empty lists as [])
    - workpackage_id         # MUST equal WP-01-shared-registry-loader
    - executor               # Codex
    - status                 # PASS | PASS_WITH_FINDINGS | BLOCKED (any blocking finding => BLOCKED)
    - files_created          # every new artifact, by path, in the future runtime workspace
    - files_modified         # every changed file — MUST contain nothing on main and nothing in canonical_sources
    - validation_summary     # one line per required_validation above + its result
    - blocking_findings      # [] for PASS/PASS_WITH_FINDINGS; non-empty => BLOCKED
    - major_findings         # significant but non-blocking; carried forward
    - minor_findings         # cosmetic / stale-doc / comment-only
    - open_questions         # SEPARATE from decisions (e.g. dangling tokens, strict-vs-lenient mode, deprecation lifecycle)
    - needs_chatgpt_review   # true — a ChatGPT review is required before the review gate can open
```

---

## Review gate (doc 20 §7 / doc 22 §5–§7) — restated

This spec being authored does **not** open any gate. Even after `OWNER_DECISION:
APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (which authorized *preparing* this workpackage), **building
the loader is still not authorized**. Before any of the modules above are produced, all four
conditions must hold (doc 20 §7), and they apply again to the build step:

```text
1. Executor completion report exists.   (for the build workpackage)
2. ChatGPT review exists.               (verdict: PASS | PASS_WITH_FINDINGS | BLOCKED)
3. No blocking findings remain.
4. Owner approves the transition.       (a further explicit owner decision — beyond the handoff approval)
```

Until then, the doc 22 §9 prohibitions stand: no runtime code change, product refactor, connector
integration, Nexus publish, deploy, `main` merge, or production-readiness claim.

## Open questions (carried from the loader plan §11, non-blocking)

These are decisions the build step and its review must resolve; they do not block this spec.

1. **Alias source of truth.** Three places declare the `*_policy` mapping
   (`governance_profiles.aliases`, `core_abilities.policy_aliases`,
   `audit_schemas.governance_profile_aliases`). The plan picks the governance registry as
   authoritative; confirm whether the two corroborating copies should remain (documentary) or be
   generated/derived to avoid future drift.
2. **Strict vs lenient load mode.** Should a `candidate-only` resolution be acceptable at runtime,
   or only in a planning/"draft" load? The registries are `registry_status: draft`; a strict mode
   may reject candidate-only bindings once the corpus is ratified. The `typed_lookup_interface`
   must expose this as a build decision.
3. **Deprecated policy.** No `deprecated` items exist yet; the deprecation lifecycle
   (resolvable-with-warning vs hard-fail, and how `aliases` of a deprecated id behave) is undefined
   and should be specified before the first deprecation.
4. **`referenced_candidates` drift authority.** When `core_abilities.referenced_candidates`
   disagrees with the owning registry (status or presence), the plan reports it; confirm whether
   such drift is a blocker or a finding at load time.
5. **Reduced `sdlc_pipeline.yaml` shape.** `sdlc_pipeline.yaml` is a reduced pipeline-definition
   form that does not validate cleanly against `pipeline_definition.schema.json` as written; the
   loader resolves its `uses_*` arrays fine, but the definition/schema reconciliation is upstream
   debt affecting the pipeline-runner workpackage more than this one — flagged for cross-WP tracking.
6. **Target runtime workspace.** The future Nexus runtime workspace that will host these modules is
   not yet decided (per handoff scope). Module/path names above are responsibilities, not fixed
   locations; the build step finalizes them once the workspace is chosen by the owner.

---

*Implementation Planning Handoff artifact (doc 22 §8). Spec only — describes modules to be built,
contains no code, authorizes no execution. No runtime code, no product refactor, no connector
integration, no deploy/publish, no `main` merge, no plugin registry, no production-readiness claim.
The `nexus` branch stays isolated from `main`. Building the loader requires a further explicit owner
decision beyond the handoff approval.*
