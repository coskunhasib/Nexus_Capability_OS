# WP-07 — Context / Memory Profile Resolver (Implementation Workpackage Spec)

> **Nature.** This is an **implementation WORKPACKAGE SPEC**, produced in the
> *Runtime / Refactor Implementation Planning Handoff* phase (doc 22 §8) under the recorded
> `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (2026-06-04).
> **Writing this spec is NOT executing it.** It describes *what a future executor would build and how
> that build would be validated* — it contains **no runtime code**, implements nothing, merges
> nothing, deploys nothing. Actually executing this workpackage (producing runtime code) is a
> **separate, future, separately-approved** phase and is explicitly out of scope here.
>
> **Locked context (not this workpackage's to revisit — it enforces them):** Plugin is cancelled
> forever; the eight Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]`
> are **not** agents; Supervisor is **not** an SDLC team lead; **Skill ≠ Tool**;
> **Governance ≠ Audit**; **Evidence ≠ Trace**; `nexus` **never** merges to `main`. The
> implementation target is a **future Nexus runtime workspace (to be decided later)** — this
> workpackage does **not** modify the existing `nexus` app code and does **not** touch `main`.

This document follows the **Workpackage Contract** of
[`../20-executor-workflow-standard-plan.md`](../../legacy/20-executor-workflow-standard-plan.md) §4
(`workpackage_id, executor, reviewer, objective, mandatory_context, canonical_sources,
required_outputs, required_validations, forbidden_actions, completion_report_format`), plus the
`depends_on` field added for build sequencing per the implementation-handoff contract (doc 20 §4
extended). The machine-readable form of the contract is
[`../executor-standard/completion-report-schema.md`](../../legacy/executor-standard/completion-report-schema.md) §2.

---

## Workpackage Contract (doc 20 §4 + `depends_on`)

```yaml
# ---------------------------------------------------------------------------------------------
# Workpackage Contract — doc 20 §4 (+ depends_on)
# Implementation Planning Handoff (doc 22 §8). SPEC ONLY — describes the build, is not the build.
# ---------------------------------------------------------------------------------------------

workpackage_id: WP-07-context-memory-resolver

executor: Codex

reviewer: ChatGPT            # reviewer / auditor / plan owner (doc 20 §3). Owner = final decision maker.

depends_on:
  - WP-01                    # shared-registry-loader workpackage. WP-07 cannot be executed until WP-01
                             # is complete + reviewed: the resolver READS the parsed
                             # context_memory_profiles.yaml (profiles, `aliases`, `used_by`, `status`)
                             # through the loader; it never parses the registry itself.
                             # See runtime-refactor-plan/README.md (loader = the 7 shared registries)
                             # and context-memory-resolver-plan.md §3.1 / §10.

objective: >-
  Specify the build of the future Context / Memory Profile Resolver: a single runtime component that,
  for a given pipeline run (and a specific agent at a specific stage), resolves the bounded, governed
  working-context view that run/agent is allowed to see — by EVALUATING the policy already declared in
  configs/nexus-ai/context_memory_profiles.yaml (source_priority, retention, validity_window,
  retrieval_rules, redaction_rules) — while keeping the Memory Core Ability strictly distinct from a
  context profile (the resolver PRODUCES context packs; it never IS Memory).

# -------------------------------------------------------------------------------------------------
# mandatory_context — the executor MUST load all of this before producing any output.
# -------------------------------------------------------------------------------------------------
mandatory_context:
  - .memory/0002-locked-decisions.md                                  # locked decisions (plugin cancelled, etc.)
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md        # the workpackage + completion-report contract
  - docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md     # §7 owner gate, §8 allowed next phase, §9 prohibited-until-approval
  - docs/ai-sdlc-factory/02-concept-boundaries.md                     # Memory-ability vs context-profile, Governance≠Audit, Evidence≠Trace
  - docs/ai-sdlc-factory/03-governance-and-audit-layering.md          # Governance decides / Audit records
  - docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md   # the SOURCE-OF-TRUTH design plan for THIS component
  - docs/ai-sdlc-factory/runtime-refactor-plan/README.md              # how the ten runtime plans relate; WP↔plan map
  - configs/nexus-ai/context_memory_profiles.yaml                     # the policy registry the resolver evaluates (does not own)

# -------------------------------------------------------------------------------------------------
# canonical_sources — the authoritative sources the build is DERIVED FROM and BOUND TO.
#   Source of truth for this component = its runtime/refactor PLAN doc + the relevant blueprint configs.
# -------------------------------------------------------------------------------------------------
canonical_sources:
  # Primary plan (source of truth for WHAT this component is):
  - docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md
  # The policy registry this resolver evaluates (the rule source):
  - configs/nexus-ai/context_memory_profiles.yaml
  # Adjacent registries the resolver depends on / calls / writes to (it reads them, never owns them):
  - configs/nexus-ai/core_abilities.yaml          # the Memory Core Ability (id `memory`, never_agent: true) retrieval interface
  - configs/nexus-ai/governance_profiles.yaml     # the governance profiles the resolver passes to the governance engine
  - configs/nexus-ai/audit_schemas.yaml           # the trace schema the resolver writes through (context_usage_trace_schema — see reconciliation debt)
  # Sibling runtime/refactor plans WP-07 composes with (do NOT build them here — referenced for the interface boundary):
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md   # WP-01: parses the registry, resolves aliases/used_by
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md      # supplies run id, domain/risk profile, conditional-gate/incident state (isolation key)
  - docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md        # the decision authority the resolver calls (Governance ≠ Audit)
  - docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md     # where usage traces are written (Trace ≠ Evidence)
  - docs/ai-sdlc-factory/runtime-refactor-plan/core-abilities-alignment.md      # the Memory Core Ability retrieval interface for durable_memory_* slices
  - docs/ai-sdlc-factory/runtime-refactor-plan/model-provider-resolver-plan.md  # the SIBLING resolver (model/provider selection) — distinct component, kept separate

# -------------------------------------------------------------------------------------------------
# required_outputs — the modules/artifacts the executor must BUILD, described by NAME + RESPONSIBILITY.
#   These DESCRIBE what to build; they are NOT code and contain NO code. Module/file names are
#   indicative placeholders for the future runtime workspace (path layout to be fixed at execution time).
#   Every output realizes the design in context-memory-resolver-plan.md (sections cited inline).
# -------------------------------------------------------------------------------------------------
required_outputs:

  - name: context_memory_resolver_module
    responsibility: >-
      The resolver's public entry point. Accepts a resolution request
      {pipeline_id, scope (run|stage_pack), stage_id?, agent_id/sub_agent_id?} plus the active run-state
      handle, and returns one Resolved Context View (RCV). Owns the invariant resolution order from
      plan §5: authorize -> hydrate-by-priority -> retrieval-filter -> redact -> stamp -> trace.
      It orchestrates the sub-modules below; it holds NO policy of its own (policy lives in the YAML).
    realizes: context-memory-resolver-plan.md §1, §4, §5

  - name: profile_selection_and_alias_module
    responsibility: >-
      Given (pipeline_id, scope, stage_id), select the single profile the requester is entitled to:
      the pipeline's `*_run_context` for scope=run, or the stage's entitled `*_context_pack` for
      scope=stage_pack. Resolve `aliases` (legacy/alias id -> canonical profile) via the registry the
      loader (WP-01) exposes, and record which alias was used. Honor `status`: a `candidate` profile
      resolves ONLY for its owning pipeline and is flagged not-yet-ratified on the RCV. Does NOT widen
      scope and does NOT invent profiles.
    realizes: context-memory-resolver-plan.md §3.1, §3.4, §5(1), §6.7

  - name: entitlement_check_module
    responsibility: >-
      Enforce `used_by`-based entitlement (including the `stage:<id>@<pipeline>` qualifier convention):
      a requester gets ONLY profiles whose `used_by` admits it. There is no "read any context" path;
      unentitled requests are denied (not silently widened) and the denial is recorded for the trace.
    realizes: context-memory-resolver-plan.md §3.4, §6.4

  - name: governance_authorization_adapter
    responsibility: >-
      For every profile resolved, call the governance engine (built separately) with that profile's
      `governance_profiles` (e.g. context_access_governance, no_secret_read_policy,
      no_self_approval_policy) and OBEY the verdict: a `blocker` verdict denies resolution outright;
      major/advisory verdicts are recorded on the RCV/trace but do not by themselves block. This
      adapter NEVER evaluates gates, NEVER makes owner decisions, and NEVER overrides a verdict
      (no_policy_bypass). It is the enforcement point that DELEGATES the decision (Governance ≠ Audit).
    realizes: context-memory-resolver-plan.md §7, §6.2

  - name: source_priority_hydration_engine
    responsibility: >-
      Walk a profile's `source_priority` list top-to-bottom and assemble slices, preserving source rank
      on each slice so downstream gate logic can distinguish authoritative from advisory support.
      Per entry kind: `current_run_*`/`*_artifacts` -> read from run state / audit-evidence store;
      an upstream profile name -> resolve THAT profile first and compose its already-redacted slices
      (never re-derive, never widen its scope); an upstream-PIPELINE evidence reference -> read the
      referenced evidence and NEVER regenerate the upstream pipeline; a `durable_memory_*` entry ->
      obtain it through the Memory Core Ability retrieval adapter (below) and tag it
      `durable_memory_advisory`. Earlier sources are authoritative; later sources (especially memory)
      are advisory and must never override or auto-satisfy.
    realizes: context-memory-resolver-plan.md §5(3), §3.5, §6.5

  - name: memory_core_ability_retrieval_adapter
    responsibility: >-
      The ONLY path by which the resolver obtains `durable_memory_*` slices. It invokes the Memory Core
      Ability's retrieval operation (owned by the Tools Registry per core_abilities.yaml), bounded by
      that ability's own memory_access_governance, and tags every returned slice
      `durable_memory_advisory`. It NEVER reads a durable store directly and NEVER persists. This
      adapter is the structural guarantee of the Memory-ability-vs-context-profile boundary: calling
      the resolver is never surfaced, logged, or described as "calling Memory."
    realizes: context-memory-resolver-plan.md §2 (rules 1,2,4), §6.2

  - name: retrieval_rules_filter
    responsibility: >-
      Apply each profile's `retrieval_rules` to the assembled slice set, e.g. run_scoped_isolation
      (reject any slice keyed to a different run/incident),
      tool_permission_map_and_context_policy_are_authoritative_for_tool_access,
      binding_context_must_not_be_read_before_semantics_complete (skill bridge),
      every_load_bearing_claim_must_have_mapped_evidence / unscored_source_must_not_enter_synthesis
      (research). A violated rule drops or denies the offending slice and records it in the RCV's
      denied[] list with the reason.
    realizes: context-memory-resolver-plan.md §5(4), §6.1

  - name: redaction_enforcement_stage
    responsibility: >-
      The MANDATORY, non-bypassable FINAL transform before any view is handed out. Apply each profile's
      `redaction_rules`: no_raw_secrets (always, every profile), redact_pii_per_domain_risk_profile,
      mask_credential_material_in_threat_model, blameless_redact_individual_identities (postmortem),
      and honor preserve_source_provenance as a KEEP rule (provenance must survive redaction, research).
      Redaction cannot be skipped, disabled per-call, or deferred; a redaction failure is a HARD DENY,
      not a degraded pass. The RCV that leaves this stage carries no raw secrets.
    realizes: context-memory-resolver-plan.md §5(5), §6.3

  - name: resolved_context_view_model
    responsibility: >-
      The in-memory, run-scoped RCV the requester receives. Describes (not as a schema to enforce now)
      the fields named in plan §4: resolved_for {run_id, pipeline_id, scope, stage_id?, agent_id?};
      profile_id + profile_status (canonical|candidate) + profile_version; slices[] each with source,
      provenance (current_run | upstream_referenced | durable_memory_advisory) and a redaction_applied
      marker; retention + validity_window (copied verbatim) + derived expires_at/valid_for; isolation_key
      (run id, or incident id for Operations); denied[] with reasons. The RCV is EPHEMERAL — the resolver
      never writes it to any durable store.
    realizes: context-memory-resolver-plan.md §4

  - name: retention_validity_stamping_module
    responsibility: >-
      Copy `retention` + `validity_window` verbatim onto the RCV and derive lifetime: run_scoped ->
      discard at run close; incident_scoped -> discard at incident close; durable_with_review
      (postmortems) -> NOT discarded by the resolver, handed to Memory (the resolver still does not
      persist). Computes expires_at / valid_for; re-resolution triggers (e.g.
      until_skill_version_or_hash_changes) are surfaced as part of the stamped lifetime.
    realizes: context-memory-resolver-plan.md §5(6), §9 (Skill Governance, Operations rows)

  - name: usage_trace_emitter
    responsibility: >-
      After producing the RCV, write ONE usage trace to the audit-evidence store via the
      `context_usage_trace_schema` (and the relevant pipeline `*_trace_schema`). The trace records:
      which profile (and alias, if any), which slices, their provenance, what was denied and why, the
      isolation key, and the requesting agent — i.e. which agent read/wrote which context slice. It
      writes TRACES only (Trace ≠ Evidence): it never mints evidence items. The RCV itself is not
      persisted; only the trace is. NOTE the reconciliation dependency: `context_usage_trace_schema`
      is named by the profiles but is not yet an `id` in audit_schemas.yaml (see open_questions) — this
      emitter depends on that name landing and must not invent or alias it itself.
    realizes: context-memory-resolver-plan.md §8, §10

  - name: boundary_invariant_guards
    responsibility: >-
      A cross-cutting set of structural guards that make the plan §6 "never"s impossible by
      construction (not merely by convention): run/incident isolation via isolation_key (no cross-key
      slice); advisory memory can never be presented as gate-satisfying; no_raw_secrets is enforced as
      a mandatory final stage; entitlement is required (no ambient authority); upstream pipelines are
      read, never regenerated; an RCV (or the resolver, or a profile) is NEVER registered/named/surfaced
      as an agent, team member, skill, or tool; and there is NO plugin context pack and NO plugin
      resolution path (plugin stays cancelled forever).
    realizes: context-memory-resolver-plan.md §2 (rules 1,3,5), §6.1–§6.7

  - name: per_pipeline_behavior_notes
    responsibility: >-
      Documentation (within the built module's own docs/spec, not in chat) recording how the resolver
      accommodates each pipeline WITHOUT special-casing policy (policy stays in YAML): SDLC backbone +
      8 canonical packs + alias mapping; Research provenance-survives-redaction + load-bearing-claim
      evidence + producer≠sole-validator (via governance); Activation reads-not-regenerates SDLC
      evidence + staged scope + human/owner public-activation gate; Operations incident_scoped +
      single-incident lifecycle + blameless durable_with_review postmortem + learning-persists-via-Memory;
      Skill Governance until_skill_version_or_hash_changes re-resolution + binding-after-semantics +
      flag-never-execute scripts; Knowledge/Memory validity_window_required_gate + redact-before-store.
    realizes: context-memory-resolver-plan.md §9

  - name: wp07_completion_report
    responsibility: >-
      The completion report for WP-07, returned in the doc 20 §5 format (see completion_report_format
      below). Long outputs live in repo files of the future runtime workspace; this report indexes every
      module/artifact built and the result of every required_validation. It sets needs_chatgpt_review: true
      and stops at the review gate. It does NOT claim production readiness.
    realizes: 20-executor-workflow-standard-plan.md §5; executor-standard/completion-report-schema.md §3

# -------------------------------------------------------------------------------------------------
# required_validations — checks the executor MUST run and STATE before reporting.
#   (Stated here as the validation CONTRACT for the future build; running them is the execution phase.)
# -------------------------------------------------------------------------------------------------
required_validations:
  # Resolution-order correctness
  - resolution_order_invariant: >-
      Prove the order is always authorize -> hydrate-by-priority -> retrieval-filter -> redact -> stamp
      -> trace, and that redaction is ALWAYS the last transform before the RCV is handed out.
  - source_priority_rank_preserved: >-
      Every assembled slice carries its `source_priority` rank; earlier=authoritative, later=advisory;
      no later source overrides or auto-satisfies an earlier one.
  # Memory boundary
  - memory_vs_context_boundary: >-
      durable_memory_* slices are obtained ONLY via the Memory Core Ability retrieval adapter, are
      tagged durable_memory_advisory, and are never presentable as gate-satisfying. The resolver is
      never surfaced/logged/described as "calling Memory" and never persists.
  # Isolation
  - run_incident_isolation: >-
      A resolution keyed to run/incident A can never include a slice keyed to run/incident B; cross-key
      slices are denied and recorded in denied[]. Operations uses incident_scoped isolation.
  # Secrets / redaction
  - redaction_is_mandatory_final_and_nonbypassable: >-
      no_raw_secrets is applied on every profile as a final stage that cannot be skipped/disabled/deferred;
      a redaction failure is a hard deny, not a degraded pass; the emitted RCV contains no raw secrets.
  - provenance_survives_redaction_where_required: >-
      preserve_source_provenance (research) is honored as a KEEP rule — provenance is not stripped.
  # Entitlement
  - entitlement_required_no_ambient_authority: >-
      Only profiles whose `used_by` admits the requester resolve; unentitled requests are denied and
      traced, never silently widened; the stage:<id>@<pipeline> qualifier is respected.
  # Governance delegation
  - governance_verdict_obeyed: >-
      Every resolution calls the governance engine with the profile's governance_profiles; a blocker
      denies resolution; no verdict is ever overridden (no_policy_bypass); the resolver evaluates no
      gates and makes no owner decisions.
  # Audit / trace
  - usage_trace_written_trace_not_evidence: >-
      Each resolution emits exactly one usage trace via context_usage_trace_schema recording profile,
      alias, slices, provenance, denials, isolation_key, requesting agent; the resolver writes traces
      only and mints no evidence; the RCV is not persisted, only the trace is.
  # No upstream regeneration
  - no_upstream_pipeline_regeneration: >-
      Upstream-pipeline evidence references (Activation->SDLC, Operations->SDLC) are READ; the upstream
      pipeline is never triggered/regenerated.
  # Candidate honesty + alias mapping
  - candidate_flagging_and_alias_mapping: >-
      candidate profiles resolve only for their owning pipeline and are flagged not-yet-ratified;
      alias ids map to their canonical profile and the alias used is recorded.
  # Locked-invariant guards (mechanical)
  - locked_invariants_hold: >-
      No plugin concept anywhere (no plugin context pack / resolution path); no Core Ability treated as
      an agent; no RCV/profile/resolver surfaced as agent/team/skill/tool; Governance≠Audit and
      Evidence≠Trace preserved in the module boundaries.
  # Hand-off / contract conformance
  - depends_on_satisfied: >-
      WP-01 (shared-registry-loader) is complete + reviewed and exposes parsed profiles/aliases/used_by
      before WP-07 execution begins; the resolver consumes the registry through the loader, not directly.
  - completion_report_conforms: >-
      The WP-07 completion report conforms to doc 20 §5 / completion-report-schema.md §3 (status
      vocabulary, findings partitioned by severity, files referenced, needs_chatgpt_review: true).

# -------------------------------------------------------------------------------------------------
# forbidden_actions — GLOBAL executor prohibitions (doc 20 §6 / doc 22 §9) apply in full, plus the
#   component-specific "never"s from the resolver plan §2/§6. ANY one is an immediate stop.
# -------------------------------------------------------------------------------------------------
forbidden_actions:
  # --- Global executor forbidden actions (doc 20 §6) — present in EVERY workpackage ---
  - write_to_main_branch
  - merge                                            # nexus stays isolated from main; never merge/PR into main
  - start_runtime_or_refactor_without_further_owner_approval   # executing this WP needs a SEPARATE owner decision
  - add_connector_deploy_or_publish
  - introduce_a_plugin                               # plugin is cancelled forever — no plugin registry/concept/field
  - self_approve                                     # never substitute for owner approval / never approve own work
  - claim_production_readiness
  # --- Component-specific forbidden actions (context-memory-resolver-plan.md §2/§6) ---
  - be_or_be_called_memory                           # the resolver PRODUCES context packs; it never IS Memory (§2 rule 1)
  - read_a_durable_memory_store_directly             # durable_memory_* only via the Memory Core Ability adapter (§2 rule 2)
  - persist_anything                                 # read-and-assemble only; never persists; only the trace is written (§2 rule 4)
  - let_advisory_memory_satisfy_a_gate               # durable_memory_* is advisory-only, never gate-satisfying (§6.2)
  - skip_disable_or_defer_redaction                  # redaction is mandatory, final, non-bypassable; failure = hard deny (§6.3)
  - widen_scope_or_grant_ambient_context_access      # entitlement only via used_by; no "read any context" path (§6.4)
  - regenerate_an_upstream_pipeline                  # upstream evidence is read, never regenerated (§6.5)
  - expose_rcv_profile_or_resolver_as_agent_team_skill_or_tool   # a resolved view is data, never a role/skill/tool (§6.6)
  - override_a_governance_verdict                    # the engine decides; the resolver obeys (no_policy_bypass) (§7)
  - evaluate_gates_or_make_owner_decisions           # not the resolver's authority (§7)
  - mint_evidence_items                              # the resolver writes traces, not evidence (Trace ≠ Evidence) (§8)
  - define_or_alias_context_usage_trace_schema_itself   # depends on that audit name landing; does not define it here (§8, §10)
  - embed_policy_in_code                             # policy stays in context_memory_profiles.yaml; the resolver only evaluates it

# -------------------------------------------------------------------------------------------------
# completion_report_format — the contract the executor returns in (doc 20 §5).
# -------------------------------------------------------------------------------------------------
completion_report_format:
  schema: docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5
  required_fields:                # doc 20 §5 — every field present; empty lists appear as []
    - workpackage_id              # MUST equal WP-07-context-memory-resolver
    - executor                    # Codex
    - status                      # PASS | PASS_WITH_FINDINGS | BLOCKED
    - files_created
    - files_modified              # MUST contain nothing on main
    - validation_summary          # one line per required_validation above + result
    - blocking_findings           # non-empty <=> status BLOCKED
    - major_findings
    - minor_findings
    - open_questions              # kept SEPARATE from decisions
    - needs_chatgpt_review        # true
```

---

## Notes for the reviewer (not part of the contract fields)

- **Source of truth.** The component's design authority is
  [`../runtime-refactor-plan/context-memory-resolver-plan.md`](../runtime-refactor-plan/context-memory-resolver-plan.md);
  every `required_outputs` entry cites the plan section it realizes. This spec adds no new policy — it
  packages the plan as a buildable workpackage. Policy itself stays in
  `configs/nexus-ai/context_memory_profiles.yaml`.
- **Why `depends_on: [WP-01]`.** Per the plan §3.1/§10 and
  [`../runtime-refactor-plan/README.md`](../runtime-refactor-plan/README.md), the shared-registry
  loader (WP-01) is what parses `context_memory_profiles.yaml` and resolves `aliases` / `used_by`. The
  resolver reads the registry **through** that loader and must not parse it itself; therefore WP-07
  cannot be executed until WP-01 is complete and reviewed. (Sibling runtime components —
  governance-engine, audit-evidence-store, Memory Core Ability alignment, pipeline-run-state model, and
  the model/provider **sibling** resolver — are interfaces WP-07 *composes with*; their own
  workpackages sequence them, and they are referenced here only for the boundary, not built by WP-07.)
- **Spec ≠ execution.** Producing this file is allowed under the recorded
  `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (doc 22 §7–§8). Actually building any
  module listed in `required_outputs` (producing runtime code) requires a **further explicit owner
  decision** and is out of scope here (doc 22 §9; plan §11). The global `forbidden_actions` above hold
  unconditionally.
```
