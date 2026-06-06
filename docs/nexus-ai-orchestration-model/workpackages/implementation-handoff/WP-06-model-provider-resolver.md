# WP-06 — Model / Provider Profile Resolver (IMPLEMENTATION WORKPACKAGE SPEC)

> **This is a workpackage SPECIFICATION, not an execution.** It describes WHAT a future
> execution phase would build for the model/provider profile resolver and HOW that build would
> be validated. Writing this spec is **not** building the resolver. Per doc
> [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md)
> §8, this artifact belongs to the *Runtime / Refactor Implementation Planning Handoff* phase,
> which prepares implementation workpackages — it does **not** write runtime code. Actually
> executing this workpackage (producing runtime code) requires a **further, separate, explicit
> owner decision** and is out of scope here.
>
> **Target of a future build:** a FUTURE Nexus runtime workspace (to be decided later). This
> workpackage does **not** modify the existing `nexus` app code, does **not** touch `main`, and
> the `nexus` branch never merges to `main`.
>
> **Contract:** doc [`../20-executor-workflow-standard-plan.md`](../../legacy/20-executor-workflow-standard-plan.md)
> §4 (workpackage fields) + §5 (completion report) + §6 (global forbidden actions), extended
> with `depends_on` for build sequencing.

---

```yaml
workpackage_id: WP-06-model-provider-resolver

executor: Codex

reviewer: ChatGPT            # issues PASS | PASS_WITH_FINDINGS | BLOCKED (doc 20 §7). Reviewer != Owner.

depends_on:
  # Build-sequencing dependencies (other workpackage ids). This WP MUST NOT be built before both
  # of these are completed, reviewed (no blocking findings), and their outputs are available, per
  # the resolver plan §8 seams.
  - WP-01   # shared-registry-loader — loads + parses model_provider_profiles.yaml, validates the
            #         parse, builds the alias index, and populates the inverse `used_by` edges the
            #         resolver depends on. The resolver consumes the loaded registry; it does not
            #         re-parse YAML. (model-provider-resolver-plan.md §8 row 1;
            #         shared-registry-loader-plan.md)
  - WP-02   # core-abilities-alignment — provides the per-Core-Ability `model_provider_profiles:`
            #         bindings (Supervisor/Coder/Vision/Memory bound; Web/OS bound to none;
            #         Audio/Creative bound to candidates) and the never_agent / Supervisor!=team_lead
            #         invariants the resolver's §4.2(2) Core-Ability key relies on.
            #         (model-provider-resolver-plan.md §8 last row; core-abilities-alignment.md)

objective: >-
  Specify the resolver component that, given a requester (a Core Ability, or a pipeline
  role/stage in a pipeline run) plus a task intent, returns the SINGLE Model / Provider Profile
  that requester is permitted to use — together with that profile's `resource_limits` and
  `fallback_policy`, plus its `governance_profiles`, its `audit_schemas`
  (`model_invocation_trace_schema`), and a `resolution_path` trace. The resolver is a pure
  read/resolve component: it reads `model_provider_profiles.yaml` (via the WP-01 loader) and the
  Core-Ability bindings (WP-02), applies the registry-data-driven precedence (stage > Core
  Ability > pipeline) with alias normalization, carries `resource_limits` and `fallback_policy`
  through verbatim, and emits a resolution trace. It selects an ABSTRACT profile
  (`provider_type` / `model_family` capability classes) — never a vendor SKU — and performs no
  governance adjudication, no audit persistence, no tool granting, and no model invocation.
  Source of truth: the resolver runtime/refactor PLAN
  (`docs/ai-sdlc-factory/runtime-refactor-plan/model-provider-resolver-plan.md`).

mandatory_context:
  # Locked decisions the resolver MUST preserve (resolver plan §3; model_provider_profiles.yaml
  # locked_decision_compliance). These are non-negotiable constraints on any build of this WP.
  - "Core Abilities [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] are CONSUMERS of
     profiles, never resolution TARGETS in the registry, and are never converted to agents.
     The resolver reads a Core Ability's binding; it never treats the Core Ability as a profile."
  - "Supervisor != team lead. Resolving `supervisor_routing_model` (routing/orchestration
     reasoning) must never imply Supervisor holds a `team_lead` role."
  - "Skill != Tool; Governance != Audit; Evidence != Trace. The resolver returns a model/provider
     profile (not a skill/tool); the profile's `governance_profiles` (rules) go to the governance
     engine and its `audit_schemas` (the `model_invocation_trace_schema` TRACE) go to the audit
     store — never merged."
  - "No plugin path, ever: no plugin profile, no plugin resolution branch."
  - "Engine-agnostic: the resolver returns an ABSTRACT profile (`provider_type`/`model_family`
     capability classes). It does NOT choose a vendor SKU. Vendor binding is a later, owner-gated,
     out-of-scope concern."
  - "Registry != Usage: a profile EXISTING does not grant a requester that profile. The resolver
     enforces the usage edge (`used_by` + per-stage/per-role `uses_model_provider_profiles`)."
  - "The resolver NEVER invents a profile and NEVER falls back to 'any reasoning model'. If no
     binding resolves, that is an error to surface — except the one documented Web/OS
     caller-profile fall-through. No silent pick on ambiguity."
  - "Owner-approval boundary: `escalation: human_owner` is an owner/human decision boundary the
     resolver may SURFACE but must NEVER auto-resolve into another model. Candidate ratification
     and the two name collisions are owner/registry (Phase-E) decisions the resolver consumes,
     never makes."
  - "This WP spec authorizes nothing executable. Building the resolver requires a further explicit
     owner decision (doc 22 §7) beyond the APPROVE_IMPLEMENTATION_PLANNING_HANDOFF that authorized
     this handoff phase."

canonical_sources:
  # Primary source of truth for this component:
  - docs/ai-sdlc-factory/runtime-refactor-plan/model-provider-resolver-plan.md   # THE plan; defines inputs, precedence, alias rules, resource_limits/status/fallback handling, seams, open items
  # Registry + binding configs the resolver reads:
  - configs/nexus-ai/model_provider_profiles.yaml                                 # the registry: 8 canonical + 13 candidate profiles, resource_limits, fallback_policy, used_by, aliases, provider_type_vocabulary, reconciliation (alias map + name_collisions_requiring_phase_e_decision), locked_decision_compliance
  - configs/nexus-ai/core_abilities.yaml                                          # per-Core-Ability `model_provider_profiles:` bindings; Web/OS bind none; referenced_candidates; never_agent / Supervisor!=team_lead invariants
  - configs/nexus-ai/stages/sdlc/                                                 # 31 SDLC stage contracts: per-stage `uses_model_provider_profiles` + inline NON-CANONICAL reconciliation annotations (authoritative per-stage used_by for the SDLC pipeline)
  - configs/nexus-ai/sdlc_pipeline.yaml                                           # pipeline-level `uses_model_provider_profiles`
  - configs/nexus-ai/pipeline_catalog.yaml                                        # per-pipeline `uses_model_provider_profiles` for the 5 non-SDLC pipelines (markdown authoritative; YAML variants recorded as aliases)
  - docs/ai-sdlc-factory/pipeline-catalog/                                        # markdown-authoritative per-pipeline profile usage (pipeline-catalog-review F-1)
  - configs/nexus-ai/governance_profiles.yaml                                     # the `governance_profiles` each profile points at (notably model_invocation_governance) — handed to the governance engine, not adjudicated here
  - configs/nexus-ai/audit_schemas.yaml                                           # `model_invocation_trace_schema` — the TRACE schema (Evidence != Trace) handed to the audit store, not persisted here
  - docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md                                 # §7.6 canonical 8-profile registry + 19 legacy names that collapse onto it (alias map the resolver must honour)
  - docs/ai-sdlc-factory/reviews/implementation-readiness-review.md              # §3 reconciliation backlog: model-resolver-relevant dangling-ref items (R1/R3) + name collisions — inputs to resolve during materialization
  # Sibling plans this resolver plugs into at its seams (resolver plan §8):
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md     # WP-01 dependency: loaded registry + alias index + populated used_by
  - docs/ai-sdlc-factory/runtime-refactor-plan/core-abilities-alignment.md        # WP-02 dependency: per-ability model_provider_profiles bindings
  - docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md          # receives the resolved profile's governance_profiles
  - docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md       # persists the model_invocation_trace payload the resolver produces
  - docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md     # gates tools for a `tool_use: enabled` profile; resolver only reports the capability
  - docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md    # parallel resolver sharing the requester-key shape
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md            # consumes concurrency + on_unavailable semantics the resolver surfaces
  # Governing / boundary docs:
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md                    # workpackage + completion-report contract; global forbidden actions
  - docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md                # planning-only mandate + non-goals
  - docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md                 # readiness gate, owner-decision boundary, prohibited-until-approval list
  - docs/ai-sdlc-factory/00-decision-log.md                                       # locked decisions (no plugin; Skill!=Tool; Governance!=Audit; Evidence!=Trace; nexus never merges to main)

required_outputs:
  # DESCRIBE the modules/artifacts a future build would produce — names + responsibilities only.
  # NO code appears in this spec, and the build target is a FUTURE runtime workspace (TBD),
  # NOT the existing nexus app. Each item states WHAT it is and WHAT it is responsible for.

  - name: resolver_request_contract
    kind: interface_definition
    responsibility: >-
      Define the resolver INPUT shape — `requester_kind` (core_ability | pipeline_role | stage),
      `requester_id`, `pipeline_id`, `stage_id`, `task_intent` (a capability_scope hint), and
      `run_context_ref` (opaque handle, used only for governance/audit binding). Encodes the
      requester-key shape shared with the context/memory resolver (WP for that resolver).
      Source: resolver plan §4.1.

  - name: resolved_binding_contract
    kind: interface_definition
    responsibility: >-
      Define the resolver OUTPUT shape — a read-only resolved binding carrying `profile_id`,
      `status` (canonical | candidate), `provider_type`, `model_family` (abstract class, not a
      vendor SKU), `resource_limits`, `fallback_policy`, `governance_profiles`, `audit_schemas`
      (`[model_invocation_trace_schema]`), and `resolution_path` (an ordered trace of how the id
      was reached). No mutation, no invocation. Source: resolver plan §4.1.

  - name: alias_normalizer
    kind: module
    responsibility: >-
      Resolve any incoming profile token to its canonical id BEFORE `used_by` matching, using the
      WP-01 alias index sourced from each profile's `aliases:` plus
      `reconciliation.legacy_sdlc_names_reconciled_to_canonical` and
      `reconciliation.yaml_catalog_variants_recorded_as_aliases`. Records BOTH the incoming token
      and the canonical id in `resolution_path`. MUST fail loudly on a one-to-many alias that is
      not disambiguated by `stage_id`/`task_intent` (e.g. `contract_analysis_model` ->
      {architecture_reasoning_model, sdlc_reasoning_profile}); never choose arbitrarily.
      Source: resolver plan §4.3.

  - name: precedence_resolver
    kind: module
    responsibility: >-
      Pick the MOST SPECIFIC binding by the registry-data-driven precedence (resolver plan §4.2):
      (1) stage binding (highest) — chosen id MUST appear in the stage's
      `uses_model_provider_profiles`; when a stage binds >1 profile (e.g. stage 18, 20, 23,
      code_review) disambiguate by matching `task_intent` to each candidate's `capability_scope`,
      and on absent/ambiguous intent RETURN the ambiguity (no silent pick); (2) Core Ability
      binding — the id in that ability's `core_abilities.yaml` `model_provider_profiles:`; (3)
      pipeline binding — pipeline-level profiles (e.g. `supervisor_routing_model`) when no stage
      narrows it. Every step recorded in `resolution_path`. Never invents a profile; never falls
      back to "any reasoning model".

  - name: web_os_fallthrough_handler
    kind: module
    responsibility: >-
      Implement the ONE intentional cross-key rule: Web and OS Core Abilities bind NO profile
      (`core_abilities.yaml` Web/OS `model_provider_profiles: []`); for them the resolver falls
      through to the CALLING STAGE's profile (Web/OS reason with the caller's model). This
      fall-through MUST be explicit in `resolution_path` and is the only permitted "no
      ability-level binding" path — distinct from an unresolved-binding error. Source: resolver
      plan §4.2(2).

  - name: usage_edge_guard
    kind: module
    responsibility: >-
      Enforce Registry != Usage as a guardrail (not a selector): after a candidate id is chosen,
      verify the requester is inside that profile's `used_by` (the inverse edge populated by
      WP-01). A mismatch is a referential-integrity ERROR that is surfaced — never auto-granted.
      Source: resolver plan §4.2(4), §3.6.

  - name: resource_limits_passthrough
    kind: module
    responsibility: >-
      Carry the profile's `resource_limits` ({context_window, max_output_tokens, tool_use,
      concurrency, and image_input where present}) through VERBATIM as abstract classes
      (standard/large/small, pipeline_default/high, enabled) — never expand to numeric vendor
      budgets (that mapping is out of scope, owner-gated). Report `tool_use` capability ONLY (a
      `tool_use: enabled` profile is necessary-but-not-sufficient; the tool-permission system, not
      this resolver, grants tools). Surface `concurrency` as advisory metadata for the pipeline
      runner. Refuse to route an image-bearing request to a profile lacking `image_input`.
      Source: resolver plan §4.4.

  - name: status_handler
    kind: module
    responsibility: >-
      Apply the canonical-vs-candidate rule: canonical profiles resolve normally; candidate
      profiles resolve ONLY when the registry already records the requester's `used_by` edge, and
      the resolved binding is flagged `status: candidate` so the governance engine can apply
      candidate-stricter handling. Resolving a candidate MUST NOT silently ratify it (ratification
      is a Phase-E owner/registry decision per each profile's `overlap.recommendation`).
      Source: resolver plan §4.5.

  - name: fallback_policy_interpreter
    kind: module
    responsibility: >-
      Carry `fallback_policy{on_unavailable, degraded_mode, escalation}` VERBATIM and enforce its
      safety semantics (resolver plan §4.6): never rewrite `escalate_immediately` (live-incident
      operations profiles) into `queue_and_retry`; preserve non-`none` `degraded_mode` values
      exactly (`supervisor_routing_model: conservative_routing`, `incident_triage_model:
      conservative_high_severity`) and for every `degraded_mode: none` profile refuse to substitute
      a different profile as a "degraded" alternative; carry the
      `coder_engineering_model -> sdlc_reasoning_profile` escalation's "non-code-critical steps
      only" constraint forward; and detect/refuse any fallback that would violate `degraded_mode:
      none` (e.g. routing a `security_analysis_model` request to a generic model).

  - name: escalation_chain_reporter
    kind: module
    responsibility: >-
      REPORT (not invoke) the escalation target, following encoded chains without creating a cycle
      (cycle detection required). The resolver may report `escalation: human_owner` (the five
      profiles `supervisor_routing_model`, `security_analysis_model`, `release_reasoning_model`,
      `incident_triage_model`, `operations_analysis_model`) but MUST NEVER auto-resolve a
      `human_owner` escalation into another model — it is an owner/human decision boundary that the
      governance engine + owner enact. Source: resolver plan §4.6, §6.

  - name: resolution_path_tracer
    kind: module
    responsibility: >-
      Produce the `resolution_path` — the ordered trace of how `profile_id` was reached (incoming
      token -> canonical id, precedence step taken, Web/OS fall-through if any, applied
      `resource_limits`, any fallback considered). This trace is the PAYLOAD for the
      `model_invocation_trace` record; the resolver produces the payload and hands it off — it does
      NOT persist it (that is the audit/evidence store, WP for that store). Source: resolver plan
      §4.1, §7.

  - name: referential_integrity_flagger
    kind: module
    responsibility: >-
      Refuse to MASK the known registry hazards (resolver plan §7, §9; readiness review R1/R3):
      flag (never silently drop) a dangling `model_invocation_governance` reference until it is
      registered/aliased; ERROR (never default) on the undefined `audio_model` /
      `creative_generation_model` ids bound by Audio/Creative; canonicalize `memory_reasoning_profile`
      to `knowledge_reasoning_profile` (it exists only as an alias); and treat the two name
      collisions (`operations_analysis_model`, `learning_reflection_model`) as AMBIGUOUS (refuse a
      silent pick) until the Phase-E rename/split is decided.

  - name: governance_audit_handoff_adapter
    kind: module
    responsibility: >-
      Attach the resolved profile's `governance_profiles` to the binding and hand them to the
      governance engine (WP for the governance engine) for blocker/major/advisory evaluation; and
      emit the `model_invocation_trace` payload for the audit/evidence store (WP for that store).
      The resolver adjudicates no governance and persists no trace; it keeps `governance_profiles`
      (rules) and `audit_schemas` (TRACE) strictly distinct (Governance != Audit; Evidence !=
      Trace). Source: resolver plan §7, §8.

  - name: resolver_spec_document
    kind: documentation
    responsibility: >-
      A build-facing spec/README (in the FUTURE runtime workspace) that restates the resolver's
      pure read/resolve contract, the precedence/alias/fallback rules, the locked-decision
      guardrails, the seams with sibling components, and the carried-in materialization items
      (resolver plan §9) — so the build is traceable back to
      `model-provider-resolver-plan.md` and this workpackage. No code; documentation only.

required_validations:
  # HOW a future build of this WP would be validated. These are checks the build must satisfy and
  # the reviewer would confirm; they assert behaviour against real registry data, not code style.
  - "Determinism: for any fixed request + fixed registry snapshot, the resolver returns exactly one
     `profile_id` OR a single explicit ambiguity/error — never a random or order-dependent pick."
  - "Precedence correctness: stage binding overrides Core Ability binding overrides pipeline
     binding (resolver plan §4.2), verified against real bindings (e.g. Coder -> coder_engineering_model;
     supervisor routing resolves at pipeline level)."
  - "Multi-profile-stage disambiguation: for stages binding >1 profile (18, 20, 23, code_review),
     a matching `task_intent` selects the right profile by `capability_scope`, and an absent/ambiguous
     intent yields a returned ambiguity (NO silent pick)."
  - "Alias normalization: every alias in `model_provider_profiles.yaml` (and the two reconciliation
     maps) resolves to its canonical id with both tokens recorded in `resolution_path`; one-to-many
     aliases not disambiguated by stage/intent fail loudly."
  - "Web/OS fall-through: Web and OS requests resolve to the CALLING STAGE's profile, recorded
     explicitly in `resolution_path`; this is distinguished from an unresolved-binding error."
  - "Usage-edge guard: a chosen id whose `used_by` does not include the requester yields a
     referential-integrity error, not an auto-grant (Registry != Usage)."
  - "resource_limits passthrough: limits are carried verbatim as abstract classes (no numeric
     expansion); `tool_use` is reported only (never granted); an image-bearing request to a profile
     lacking `image_input` is refused."
  - "status handling: candidate profiles resolve only with a recorded `used_by` edge and are flagged
     `status: candidate`; resolving a candidate does not ratify it."
  - "fallback_policy fidelity: `on_unavailable` (queue_and_retry vs escalate_immediately),
     `degraded_mode` (incl. the non-`none` values), and `escalation` are carried verbatim; no silent
     downgrade for any `degraded_mode: none` profile; `escalate_immediately` is never rewritten to a
     retry."
  - "escalation reporting: escalation targets are reported (never invoked); `human_owner` escalations
     are surfaced and never auto-resolved into another model; escalation-chain following detects and
     refuses cycles."
  - "Referential-integrity hazards surfaced not masked: dangling `model_invocation_governance` flagged;
     undefined `audio_model`/`creative_generation_model` error (not default); `memory_reasoning_profile`
     canonicalized to `knowledge_reasoning_profile`; the two name collisions treated as ambiguous."
  - "Engine-agnostic: no output ever names a concrete vendor model/provider/SKU; `provider_type` and
     `model_family` remain abstract classes from `provider_type_vocabulary`."
  - "Separation of concerns: no governance verdict, no trace persistence, no tool grant, no model
     invocation, no scheduling, and no escalation ENACTMENT occurs inside the resolver (all are
     handed to the sibling components per resolver plan §8)."
  - "Dependency precondition: the build consumes the WP-01 loaded registry (validated parse + alias
     index + populated `used_by`) and the WP-02 Core-Ability bindings; it does not re-parse YAML or
     re-derive bindings."
  - "Locked-decision compliance: Core Abilities are never treated as profiles/agents; Supervisor is
     never implied to be team lead; no plugin branch exists; Skill!=Tool / Governance!=Audit /
     Evidence!=Trace are preserved (validated against `model_provider_profiles.yaml`
     locked_decision_compliance)."

forbidden_actions:
  # GLOBAL executor forbidden actions — MUST appear in every WP (doc 20 §6; doc 07 §10; doc 22 §9;
  # task GLOBAL FORBIDDEN ACTIONS):
  - write to the main branch
  - merge (the nexus branch NEVER merges to main; no PR into main)
  - start runtime implementation or product refactor without a further explicit owner approval
  - add any connector / deploy / publish (no Nexus publish, no production deploy)
  - introduce a plugin (no plugin registry, no plugin profile, no plugin resolution branch)
  - self-approve (the executor never substitutes for the reviewer or the owner)
  - claim production readiness
  # WP-06-specific forbidden actions (resolver plan §3, §4, §6):
  - choose, name, or wire any concrete vendor model / provider / inference SKU (engine-agnostic;
    vendor binding is later and owner-gated)
  - invoke any model, or enact any escalation (including any `human_owner` escalation)
  - adjudicate governance, persist any audit/trace record, or grant any tool
  - invent a profile, or fall back to "any reasoning model" when no binding resolves
  - silently pick a profile on an ambiguous multi-profile stage or a one-to-many alias
  - silently downgrade a `degraded_mode: none` profile, or rewrite `escalate_immediately` into a
    retry
  - ratify a candidate profile, or resolve either name collision
    (`operations_analysis_model`, `learning_reflection_model`) — these are Phase-E owner/registry
    decisions
  - treat a Core Ability as a profile/agent, or imply Supervisor holds the team_lead role
  - mask any referential-integrity hazard (dangling `model_invocation_governance`; undefined
    `audio_model`/`creative_generation_model`; `memory_reasoning_profile`-as-alias) by defaulting
    instead of flagging/erroring
  - modify the existing nexus app code, or modify any blueprint config / plan as part of building
    this resolver (the resolver READS the registry; it does not edit it)

completion_report_format:
  # Mirrors doc 20 §5. The executor returns this after a (future, separately-approved) build.
  workpackage_id: WP-06-model-provider-resolver
  executor: Codex
  status: PASS | PASS_WITH_FINDINGS | BLOCKED
  files_created: [ ]          # list every artifact produced (each must be referenced here)
  files_modified: [ ]
  validation_summary: ""      # results against the required_validations above
  blocking_findings: [ ]
  major_findings: [ ]
  minor_findings: [ ]
  open_questions: [ ]
  needs_chatgpt_review: true
```

---

## Carried-in materialization items (non-blocking inputs to a future build)

These come from the resolver plan §9 and the readiness backlog. They are **inputs to resolve
before/while the resolver is built**, not work done in this spec. They are reproduced so the
executing phase does not lose them:

1. `model_invocation_governance` is referenced but not yet defined as a `governance_profiles.yaml`
   item (readiness R3) — register/alias before wiring; until then the resolver flags it.
2. `audio_model` / `creative_generation_model` are bound by Audio/Creative but not defined as
   registry items — define or trim the bindings; the resolver errors (not defaults) on the
   undefined id.
3. `memory_reasoning_profile` exists only as an alias of `knowledge_reasoning_profile` — reconcile
   the Memory↔knowledge naming (readiness R10/R11); §4.3 normalization canonicalizes it.
4. Two name collisions (`operations_analysis_model`, `learning_reflection_model`) — Phase-E
   rename/split required before either is unambiguously resolvable.
5. Candidate overlaps/consolidation (`risk_analysis_model` vs `security_analysis_model`;
   `incident_triage_model` vs `defect_analysis_model`; multiple general-reasoning candidates;
   `script_safety_analysis_model` vs `security_analysis_model`) — each profile's
   `overlap.recommendation` defers to Phase E; the resolver consumes the decision.
6. Two-profile-stage disambiguation contract — finalize how `task_intent` maps to
   `capability_scope` for stages 18/20/23/code_review so disambiguation is machine-checkable.
7. Abstract→concrete `resource_limits` mapping table — defined only at/after vendor binding
   (out of scope here, owner-gated).

---

## Boundary statement

This is a documentation/blueprint **workpackage specification** produced under the executor
workflow standard (doc 20) during the Implementation Planning Handoff phase (doc 22 §8). It
describes WHAT a future Model / Provider Profile resolver would be built to do and HOW that build
would be validated; it **does not** implement a resolver, **does not** write runtime code, **does
not** select any vendor model, **does not** modify the existing `nexus` app or any blueprint
config, and **does not** authorize implementation, refactor, connector integration, deploy,
publish, `main`-branch merge, or any plugin registry. Executing this workpackage requires a
**further explicit owner decision** beyond the handoff approval, and the `nexus` branch never
merges to `main`.
