# Model / Provider Profile Resolver — Runtime/Refactor Plan (PLANNING ONLY)

- **Doc id:** `runtime-refactor-plan/model-provider-resolver-plan.md`
- **Phase:** G/H — runtime/refactor **planning** (doc `21-runtime-refactor-planning-only-plan.md`
  §4 "Model/provider profile resolver plan", §5 required output line
  `docs/ai-sdlc-factory/runtime-refactor-plan/model-provider-resolver-plan.md`).
- **Type:** documentation / blueprint **plan**. This document describes **how a future runtime
  would resolve a Model / Provider Profile** for a Core Ability or a pipeline role/stage. It is a
  PLAN ONLY.
- **Status of this plan:** draft, pending the `runtime-refactor-plan-review.md` review verdict
  (doc 21 §10) and the owner decision (doc 22 §7).

> **HARD NON-GOALS (doc 21 §3 / doc 22 §9).** This plan does **not**, and must not be read as
> authorizing: any runtime code change, any product refactor, any connector/provider/SDK
> integration, any model invocation, any vendor SKU selection, any deploy/publish, any
> main-branch merge, or any plugin registry. No resolver is built here. Nothing in this document
> selects a concrete vendor model — `provider_type` / `model_family` remain abstract capability
> classes per `model_provider_profiles.yaml` l.64-67, and concrete vendor binding is explicitly a
> later (Phase E+/runtime) concern that is out of scope.

---

## 1. Purpose and scope

The Model / Provider System is system family #9 of the Nexus AI Orchestration Model
(`01-nexus-ai-operating-model.md` §11): *"Model / Provider Profiles specify the model, provider or
inference profile used by Core Abilities or pipeline roles."* The Shared Registry that answers
*"which profiles exist?"* already exists as a blueprint artifact —
`configs/nexus-ai/model_provider_profiles.yaml` (8 canonical + 13 candidate profiles, Phase C /
doc 17 §9).

This plan specifies the **resolver**: the future runtime component that, given a *requester* (a
Core Ability, or a pipeline role/stage in a pipeline run) plus a *task intent*, would return the
**single Model / Provider Profile** that requester is permitted to use — together with that
profile's `resource_limits` and `fallback_policy`. It is the read-side counterpart of the
"Shared registry loader plan" (doc 21 §4): the loader makes the registry available; the resolver
answers *"for this requester, right now, which profile applies, with what limits and what
fallback?"*

**In scope (planning):**
- The resolution **inputs**, **keys**, and **precedence order** for picking a profile per Core
  Ability / pipeline role / stage.
- How `resource_limits` would be carried through to the (future) model-invocation boundary.
- How `fallback_policy` (`on_unavailable`, `degraded_mode`, `escalation`) would be interpreted,
  including the escalation chains already encoded in the registry.
- The registry referential-integrity hazards the resolver must refuse to paper over.
- The governance / audit obligations the resolver participates in.
- The explicit owner-approval dependency before any of this is built.

**Out of scope (non-goals, restated):** building the resolver; choosing vendors; wiring providers;
defining `model_invocation_governance` as a runtime engine (that is the "Governance engine plan",
doc 21 §8); persisting the model-invocation trace (that is the "Audit/evidence store plan",
doc 21 §9). This plan **references** those plans at their seams but does not implement them.

---

## 2. Blueprint artifacts this plan builds on

This plan is derivative; it must not invent profiles, fields, or bindings. Concrete artifacts it
builds on (read as the authoritative inputs to any future resolver):

| Artifact | What this plan consumes from it |
|---|---|
| `configs/nexus-ai/model_provider_profiles.yaml` | The registry itself: 8 canonical + 13 candidate profiles, each with `id`, `status`, `provider_type`, `model_family`, `capability_scope`, **`resource_limits`**, **`fallback_policy`**, `governance_profiles`, `audit_schemas`, `allowed_usage`/`forbidden_usage`, `used_by{pipelines,stages,core_abilities}`, `aliases`, `overlap`. Also `provider_type_vocabulary`, `naming_rules`, the `reconciliation` block (alias map + `name_collisions_requiring_phase_e_decision`), and `locked_decision_compliance`. |
| `configs/nexus-ai/core_abilities.yaml` | Per-Core-Ability `model_provider_profiles:` bindings (Supervisor→`supervisor_routing_model`, Coder→`coder_engineering_model`, Vision→`vision_model`, Memory→`memory_reasoning_profile`; Audio/Creative bind candidate `audio_model`/`creative_generation_model`; Web/OS bind **none** — they reason with the *calling stage's* profile). Also the `referenced_candidates.model_provider_profiles` ratification list and the `core_ability_is_never_agent` / `supervisor_is_never_team_lead` invariants. |
| `configs/nexus-ai/stages/sdlc/*.yaml` (31 contracts) + `sdlc_pipeline.yaml` | Per-stage `uses_model_provider_profiles` and the inline NON-CANONICAL reconciliation annotations that the registry collapsed into `aliases`. These are the authoritative per-stage `used_by` for the SDLC pipeline. |
| `configs/nexus-ai/pipeline_catalog.yaml` + `docs/ai-sdlc-factory/pipeline-catalog/*.md` | Per-pipeline `uses_model_provider_profiles` for the 5 non-SDLC pipelines (markdown authoritative per pipeline-catalog-review F-1; YAML `definition_contract` variants recorded as `aliases`). |
| `configs/nexus-ai/governance_profiles.yaml` + `configs/nexus-ai/governance/` | The `governance_profiles` each profile points at (notably `model_invocation_governance`), resolved by the separate **Governance engine plan**. |
| `configs/nexus-ai/audit_schemas.yaml` + `configs/nexus-ai/audit/trace_schemas/` | `model_invocation_trace_schema` — the **TRACE** schema every profile carries (`Evidence != Trace`), persisted by the separate **Audit/evidence store plan**. |
| `docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md` §7.6 | Canonical 8-profile registry + the 19 finer-grained legacy names that collapse onto it — the source of the alias map the resolver must honour. |
| `docs/ai-sdlc-factory/reviews/implementation-readiness-review.md` §3 | The consolidated non-blocking reconciliation backlog. This plan inherits the model-resolver-relevant items (R1/R3 dangling refs; the name collisions) as **inputs to resolve during materialization**, not as work done here. |
| Companion plans (doc 21 §4): `shared-registry-loader-plan.md`, `governance-engine-plan.md`, `audit-evidence-store-plan.md`, `tool-permission-system-plan.md`, `context-memory-resolver-plan.md`, `core-abilities-alignment.md` | The seams this resolver plan plugs into (see §9). |

---

## 3. Locked-decision guardrails for the resolver

Any future resolver MUST preserve these (locked decisions; `model_provider_profiles.yaml`
`locked_decision_compliance`):

1. **Core Abilities are consumers, never items.** `[Supervisor, Coder, Vision, Audio, Creative,
   Memory, Web, OS]` *consume* profiles; they are never resolution **targets** in the registry and
   are never converted to agents. Canonical names are preserved verbatim. The resolver reads a
   Core Ability's `model_provider_profiles:` binding; it never treats the Core Ability as a profile.
2. **Supervisor != team lead.** `supervisor_routing_model` is routing/orchestration reasoning for
   the Supervisor Core Ability. Resolving it must never imply Supervisor holds a `team_lead` role.
3. **Skill != Tool; Governance != Audit; Evidence != Trace.** The resolver returns a *model/provider
   profile*, not a skill or tool. The profile's `governance_profiles` (rules) and `audit_schemas`
   (the `model_invocation_trace_schema` TRACE) stay distinct and are handed to the governance engine
   and audit store respectively — never merged.
4. **No plugin path, ever.** There is no plugin profile and no plugin resolution branch.
5. **Engine-agnostic.** The resolver returns an *abstract* profile (`provider_type`/`model_family`
   capability classes). It does **not** choose a vendor SKU. Vendor binding is a later concern,
   deliberately excluded here.
6. **Registry != Usage.** The registry says a profile *exists*; `used_by` + the per-stage/per-role
   `uses_model_provider_profiles` say *who may use it*. The resolver enforces the usage edge; it
   does not grant a requester a profile merely because the profile exists.

---

## 4. Resolution model (planned)

### 4.1 Resolver inputs

A future `resolve_model_provider_profile(request)` would take:

```text
request:
  requester_kind:  core_ability | pipeline_role | stage          # what is asking
  requester_id:    e.g. Coder | sdlc_team_lead | code_review      # which one
  pipeline_id:     e.g. sdlc_pipeline | operations_pipeline | null
  stage_id:        e.g. code_review | severity_classification | null
  task_intent:     a capability_scope hint (e.g. code_review_reasoning, severity_classification)
  run_context_ref: opaque handle to the pipeline-run state (for governance/audit binding only)
```

The resolver returns a **resolved profile binding** (a read-only view; no mutation, no invocation):

```text
resolved:
  profile_id:        the single chosen canonical profile id
  status:            canonical | candidate                         # candidate => see §4.5
  provider_type:     reasoning_llm | code_llm | vision_llm | routing_llm
  model_family:      abstract capability class (NOT a vendor SKU)
  resource_limits:   { context_window, max_output_tokens, tool_use, concurrency, [image_input] }
  fallback_policy:   { on_unavailable, degraded_mode, escalation }
  governance_profiles: [...]      # handed to the Governance engine (doc 21 §8)
  audit_schemas:     [model_invocation_trace_schema]   # handed to the Audit store (doc 21 §9)
  resolution_path:   ordered trace of how this id was reached (for the model_invocation_trace)
```

### 4.2 Resolution keys and precedence (planned)

The registry encodes the *authoritative* binding in three places; a profile must be reachable from
all that apply, and the resolver picks the **most specific** binding. Proposed precedence
(most specific wins; every step is registry-data-driven, no hard-coding):

1. **Stage binding (highest precedence).** If `stage_id` is set, the chosen id MUST appear in that
   stage's `uses_model_provider_profiles`. Many stages bind **two** profiles (e.g. stage 18
   `ai_agent_safety_evaluation` → `security_analysis_model` + `defect_analysis_model`; stage 23 →
   `vision_model` + `sdlc_reasoning_profile`). When a stage binds more than one, `task_intent` is
   matched against each candidate's `capability_scope` to disambiguate; if `task_intent` is absent
   or ambiguous, the resolver does **not** guess — it returns the ambiguity for an explicit choice
   (no silent pick). This is recorded in `resolution_path`.
2. **Core Ability binding.** If `requester_kind == core_ability`, the id MUST be the one in that
   ability's `core_abilities.yaml` `model_provider_profiles:` (e.g. Coder→`coder_engineering_model`).
   Web/OS bind **none** by design — for those, the resolver falls through to the *calling stage's*
   profile (Web/OS reason with the caller's model; `core_abilities.yaml` l.489/564). This fall-through
   is the one intentional cross-key rule and must be explicit in `resolution_path`.
3. **Pipeline binding.** Pipeline-level profiles (notably `supervisor_routing_model`, listed under
   every pipeline's `used_by.pipelines`) apply when no stage-level binding narrows it — e.g.
   Supervisor routing is pipeline-level (`used_by.stages: []`).
4. **`used_by` cross-check (guardrail, not a selector).** Whatever id is chosen, the resolver
   verifies the requester is inside the profile's `used_by` (the inverse edge). A mismatch is a
   referential-integrity error, surfaced — never auto-granted (Registry != Usage, §3.6).

> The resolver **never** invents a profile and **never** falls back to "any reasoning model". If no
> binding resolves, that is an error to surface (and, for Web/OS, the documented caller-profile
> fall-through), not a default.

### 4.3 Alias normalization (planned)

`model_provider_profiles.yaml` records two alias classes the resolver MUST normalize **before**
matching `used_by`:

- **Legacy SDLC `*_analysis_model` / finer-grained names** that collapsed onto a canonical id
  (e.g. `code_review_model` → `coder_engineering_model`; `ux_accessibility_model` →
  `vision_model`/`sdlc_reasoning_profile`). Source of truth: each profile's `aliases:` plus the
  `reconciliation.legacy_sdlc_names_reconciled_to_canonical` map.
- **Divergent catalog-YAML `*_profile` variants** of a markdown-authoritative id (e.g.
  `activation_reasoning_profile` → `activation_reasoning_model`; `operations_reasoning_profile` →
  the four operations candidates; `memory_reasoning_profile` → `knowledge_reasoning_profile`;
  `skill_analysis_model` → the three skill-governance candidates). Source:
  `reconciliation.yaml_catalog_variants_recorded_as_aliases`.

Planned rule: the resolver resolves any incoming alias to its canonical id first, records both the
incoming token and the canonical id in `resolution_path`, then proceeds. It must **fail loudly**
on a one-to-many alias that is *not* disambiguated by `stage_id`/`task_intent` (e.g.
`contract_analysis_model` → `{architecture_reasoning_model, sdlc_reasoning_profile}`), rather than
choosing arbitrarily.

### 4.4 `resource_limits` handling (planned)

Each profile carries `resource_limits` (e.g. `coder_engineering_model`: `context_window: large`,
`max_output_tokens: large`, `tool_use: enabled`, `concurrency: pipeline_default`; `vision_model`
additionally `image_input: enabled`; `supervisor_routing_model`: `max_output_tokens: small`,
`concurrency: high`). Planned handling:

- These are **abstract** sizing/behaviour classes (`standard`/`large`/`small`,
  `pipeline_default`/`high`, `enabled`), **not** numeric vendor budgets. The resolver passes them
  through verbatim on the resolved binding; the (future, out-of-scope) model-invocation layer maps
  the abstract class to a concrete budget when a vendor is bound — that mapping is **not** defined
  here.
- `tool_use` on the resolved profile is an **input** to the separate **Tool permission system
  plan** (doc 21 §4): a profile with `tool_use: enabled` is *necessary but not sufficient* for tool
  calls — the tool-permission layer still gates which tools that requester may call. The resolver
  does not grant tool access; it only reports the profile's `tool_use` capability.
- `concurrency` (`pipeline_default` vs `high`) is advisory metadata for the pipeline runner's
  scheduling (doc 21 §7); the resolver surfaces it but does not schedule.
- `image_input` is present only on vision-capable profiles; the resolver must not route an
  image-bearing request to a profile lacking it (and `vision_model.fallback_policy.degraded_mode:
  none` forbids a non-visual substitute — see §4.6).

### 4.5 `status` handling — canonical vs candidate (planned)

The registry holds **8 canonical** and **13 candidate** profiles. Planned rule:

- **Canonical** profiles resolve normally.
- **Candidate** profiles (all 5 non-SDLC pipelines' profiles, plus Audio/Creative's
  `audio_model`/`creative_generation_model`) resolve **only** when the requester is a candidate
  pipeline/role for which the registry already records the `used_by` edge, and the resolved binding
  is flagged `status: candidate` so the governance engine can apply candidate-stricter handling.
- Resolving a candidate profile MUST NOT silently ratify it. Ratification is a Phase-E/registry
  decision (`overlap.recommendation` per profile), not a resolver action.

### 4.6 `fallback_policy` handling (planned)

Every profile carries `fallback_policy{on_unavailable, degraded_mode, escalation}`. The resolver is
the component that knows these values; the planned interpretation:

- **`on_unavailable`** — `queue_and_retry` (most profiles) vs `escalate_immediately` (the
  live-incident operations profiles `incident_triage_model`, `operations_analysis_model`). The
  resolver returns this verbatim; the pipeline runner/invocation layer (out of scope here) enacts
  the queue-vs-escalate behaviour. The resolver must **not** rewrite `escalate_immediately` into a
  retry — that distinction is safety-relevant (live-incident path must not silently queue).
- **`degraded_mode`** — almost always `none`, meaning **do not silently downgrade**. Three
  meaningful non-`none` values exist and the resolver must preserve them exactly:
  `supervisor_routing_model: conservative_routing`, `incident_triage_model:
  conservative_high_severity`. For every `degraded_mode: none` profile (security, vision, coder,
  release, defect, general reasoning, …), the resolver MUST NOT substitute a different profile as a
  "degraded" alternative — the registry author has explicitly forbidden silent downgrade for those.
- **`escalation`** — a chain the resolver must be able to follow without creating a cycle. Encoded
  chains include: most specialised profiles → `sdlc_reasoning_profile` (generic reasoning fallback
  for *non-critical* steps only); `coder_engineering_model` → `sdlc_reasoning_profile`;
  security/release → `human_owner`; `supervisor_routing_model` → `human_owner`;
  `incident_triage_model`/`operations_analysis_model` → `human_owner`; candidate chains such as
  `risk_analysis_model` → `activation_reasoning_model`, `source_evaluation_model` →
  `research_reasoning_profile`. Planned rules:
  - The resolver may **report** the escalation target; it does **not** itself invoke the target or
    a human. `escalation: human_owner` is an **owner/human decision boundary** — the resolver
    surfaces it; enacting it is a governance-engine + owner concern (see §6, §8).
  - `coder_engineering_model.fallback_policy.escalation: sdlc_reasoning_profile` is annotated
    *"generic reasoning fallback for non-code-critical steps only"* — the resolver must carry that
    constraint forward so the (future) invocation layer does not fall back on a code-critical step.
  - The resolver MUST detect and refuse a fallback that would violate `degraded_mode: none` (e.g.
    it must not silently route a `security_analysis_model` request to `sdlc_reasoning_profile` —
    that profile's escalation is `human_owner`, not a generic model).

---

## 5. Worked resolution examples (planned, illustrative only)

These illustrate the planned precedence/alias/fallback rules against real registry data. No code;
no invocation.

1. **Coder Core Ability authoring code.** `requester_kind=core_ability, requester_id=Coder` →
   §4.2(2) Core Ability binding → `coder_engineering_model` (canonical). `resource_limits`:
   `context_window: large`, `tool_use: enabled`. `fallback_policy`: `on_unavailable:
   queue_and_retry`, `degraded_mode: none`, `escalation: sdlc_reasoning_profile` *(non-code-critical
   steps only)*. `used_by` cross-check passes (`core_abilities:[Coder]`).
2. **SDLC stage `code_review` (two-profile stage).** `stage_id=code_review` binds
   `{sdlc_reasoning_profile, coder_engineering_model}`. `task_intent=code_review_reasoning` matches
   `coder_engineering_model.capability_scope` → chosen; the gate-decision step
   (`task_intent=gate_decision`) would instead match `sdlc_reasoning_profile`. No silent pick when
   intent is absent.
3. **SDLC stage 23 `accessibility_ux_validation_if_applicable` with an image.** Binds
   `{vision_model, sdlc_reasoning_profile}`. Image-bearing request → must route to `vision_model`
   (`image_input: enabled`); `sdlc_reasoning_profile` is reserved for the general gate decision.
   `vision_model.degraded_mode: none` forbids a non-visual substitute on unavailability →
   `on_unavailable: queue_and_retry`, `escalation: sdlc_reasoning_profile` for the *non-visual* gate
   portion only.
4. **Web Core Ability fetching + reasoning.** Web binds **no** profile (`core_abilities.yaml`
   l.489). §4.2(2) fall-through → resolve the **calling stage's** profile (e.g. the stage that
   requested the fetch uses `sdlc_reasoning_profile`). Fall-through is recorded explicitly in
   `resolution_path`.
5. **Operations pipeline `severity_classification`.** Binds `incident_triage_model` (candidate).
   `status: candidate` flagged. `on_unavailable: escalate_immediately` (NOT queued — live-incident),
   `degraded_mode: conservative_high_severity`, `escalation: human_owner` (surfaced, not enacted by
   the resolver).
6. **Legacy alias inbound.** A caller passes the legacy `test_generation_model` → §4.3
   normalizes to `coder_engineering_model`; both recorded in `resolution_path`; then proceed as (1).

---

## 6. Owner-approval dependency (explicit)

This plan is **gated** and produces nothing executable. The owner-approval dependency is explicit
and multi-layered:

1. **No build without the planning review + owner decision.** Per doc 21 §10–§11 and doc 22 §7, the
   runtime/refactor plan documents (this file among them) must first be reviewed by
   `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md`, and then the owner must issue
   `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (vs `HOLD_FOR_MORE_REVIEW`). Until that
   decision exists, **no resolver may be implemented** and even the approved next phase is
   "Implementation Planning Handoff", not code (doc 22 §8). The `implementation-readiness-review.md`
   already records owner approval (item 10) as the **pending final gate**, explicitly *not* yet
   given.
2. **`escalation: human_owner` is an owner decision boundary, not an automation target.** Five
   profiles escalate to `human_owner` (`supervisor_routing_model`, `security_analysis_model`,
   `release_reasoning_model`, `incident_triage_model`, `operations_analysis_model`). A future
   resolver may *surface* this target; it must **never** auto-resolve a `human_owner` escalation
   into another model. Routing a `human_owner`-escalation case is an explicit human/owner gate
   (consistent with doc 06 owner-decision boundary and `governance/global.yaml`).
3. **Candidate ratification is owner/registry-gated, not resolver-gated (§4.5).** Promoting any of
   the 13 candidate profiles to canonical, and resolving the two **name collisions**
   (`operations_analysis_model`, `learning_reflection_model` — `reconciliation.
   name_collisions_requiring_phase_e_decision`), are Phase-E registry decisions requiring owner
   sign-off (R5/R6 disposition). The resolver consumes the *outcome*; it does not decide it.
4. **Vendor binding stays owner-gated and out of scope.** Choosing the concrete model/provider/SKU
   behind an abstract profile (and any connector wiring) is explicitly prohibited until approval
   (doc 22 §9) and is not designed here.

---

## 7. Governance and audit obligations the resolver participates in

- **Governance (rules) — handed off, not implemented here.** Every profile lists
  `governance_profiles` (e.g. `model_invocation_governance`, plus profile-specific gates such as
  `security_validation_gate`, `verification_loop_bug_gate`, `incident_severity_required_gate`). The
  resolver attaches these to the resolved binding and hands them to the **Governance engine plan**
  (doc 21 §8) for blocker/major/advisory evaluation, policy-bypass prevention, and the owner-decision
  boundary. The resolver itself does not adjudicate governance.
- **Audit (TRACE) — handed off, not implemented here.** Every profile's `audit_schemas` is exactly
  `[model_invocation_trace_schema]` — a **TRACE** schema (`Evidence != Trace`). A model-invocation
  TRACE record (including the resolver's `resolution_path`, chosen `profile_id`, applied
  `resource_limits`, and any fallback taken) would be persisted by the **Audit/evidence store
  plan** (doc 21 §9). The resolver produces the trace *payload*; it does not own the store.
- **Referential-integrity hazards the resolver MUST refuse to mask (carried from the readiness
  backlog; resolved during materialization, not here):**
  - **`model_invocation_governance` is referenced 21× but not yet defined** as an item in
    `governance_profiles.yaml` (readiness review R3). A resolver wired today would attach a dangling
    governance id. Plan: the Governance engine + Shared registry loader must register/alias it
    before any resolver goes live; until then the resolver must **flag**, not silently drop, the
    unresolved governance reference.
  - **`audio_model` and `creative_generation_model` are bound by the Audio/Creative Core Abilities
    (via `core_abilities.yaml` `referenced_candidates`) but are NOT defined as profile items** in
    `model_provider_profiles.yaml`. Resolving for Audio/Creative would today hit an undefined id.
    Plan: either define these candidate profiles or trim the bindings before enabling Audio/Creative
    resolution; the resolver must error (not default) on the undefined id.
  - **`memory_reasoning_profile` (Memory Core Ability binding) exists in the registry only as an
    *alias* of `knowledge_reasoning_profile`**, not as a top-level profile item. A resolver
    following Memory's binding reaches an alias; §4.3 normalization must canonicalize it to
    `knowledge_reasoning_profile` — and the Memory↔knowledge naming must be reconciled at the
    registry level (related to readiness R10/R11 naming debt).
  - **The two name collisions** (`operations_analysis_model` = legacy alias of
    `release_reasoning_model` *and* a distinct operations candidate; `learning_reflection_model` =
    legacy alias of `sdlc_reasoning_profile` *and* a distinct operations candidate) make those two
    tokens ambiguous. The resolver MUST treat them as ambiguous (refuse a silent pick) until the
    Phase-E rename/split is decided.

---

## 8. Boundaries and seams with sibling plans

| Concern | Owned by | This plan's role |
|---|---|---|
| Loading + parsing the registry, building the alias index | `shared-registry-loader-plan.md` | Consumes the loaded registry + alias map; assumes the loader has validated parse + populated `used_by`. |
| Evaluating `governance_profiles` (blocker/major/advisory, policy-bypass, owner boundary) | `governance-engine-plan.md` (doc 21 §8) | Hands the resolved profile's `governance_profiles` to it; does not adjudicate. |
| Persisting the `model_invocation_trace` | `audit-evidence-store-plan.md` (doc 21 §9) | Produces the trace payload incl. `resolution_path`; does not persist. |
| Deciding which **tools** a `tool_use: enabled` profile may actually call | `tool-permission-system-plan.md` (doc 21 §4) | Reports `tool_use` capability only; never grants tool access. |
| Resolving the requester's **context/memory** profile | `context-memory-resolver-plan.md` (doc 21 §4) | Parallel resolver; shares the requester key shape but resolves a different registry. |
| Scheduling / stage transitions / `on_pass`/`on_fail` | `pipeline-runner-plan.md` (doc 21 §7) | Surfaces `concurrency` + `on_unavailable` semantics for the runner; does not schedule. |
| Keeping Core Ability names/bindings aligned (never agents) | `core-abilities-alignment.md` (doc 21 §6) | Relies on its per-ability `model_provider_profiles:` bindings as the §4.2(2) source. |

The resolver is deliberately a **pure read/resolve** component in this design: inputs in →
resolved binding + resolution trace out. All side effects (governance verdicts, trace persistence,
tool grants, invocation, scheduling, escalation enactment) belong to the sibling plans above.

---

## 9. Open items carried into materialization (non-blocking)

These are inherited from the registry's `overlap`/`reconciliation` blocks and the readiness-review
backlog; they are **inputs to resolve before a resolver is built**, not work performed in this
planning doc:

1. **`model_invocation_governance` undefined** (readiness R3) — register/alias before wiring.
2. **`audio_model` / `creative_generation_model` undefined as items** — define or trim the
   Audio/Creative bindings.
3. **`memory_reasoning_profile` exists only as an alias** of `knowledge_reasoning_profile` —
   reconcile the Memory↔knowledge naming (related R10/R11).
4. **Two name collisions** (`operations_analysis_model`, `learning_reflection_model`) — Phase-E
   rename/split decision required before either is unambiguously resolvable.
5. **Candidate overlaps / consolidation** — `risk_analysis_model` vs `security_analysis_model`;
   `incident_triage_model` vs `defect_analysis_model`; the several general-reasoning candidates vs a
   single shared `general_reasoning_profile`; `script_safety_analysis_model` vs
   `security_analysis_model`. Each profile's `overlap.recommendation` says "decide in Phase E"; the
   resolver consumes whichever decision lands.
6. **Two-profile-stage disambiguation contract** — finalize how `task_intent` maps to
   `capability_scope` for the multi-profile stages (18, 20, 23, code_review) so disambiguation is
   machine-checkable rather than convention.
7. **Abstract→concrete `resource_limits` mapping table** — to be defined only at/after vendor
   binding (out of scope here, owner-gated).

---

## 10. Exit criteria for this plan (doc 21 §11)

- [x] This plan document exists at the doc 21 §5 path.
- [x] No code changed; no resolver implemented; no model invoked; no vendor chosen.
- [x] No runtime implementation started; no connector/deploy/merge/plugin introduced.
- [x] References the concrete blueprint artifacts it builds on (§2).
- [x] Makes the owner-approval dependency explicit (§6) — including `human_owner` escalation as a
      decision boundary and candidate/collision ratification as owner/registry-gated.
- [ ] Reviewed by `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` (Phase H
      deliverable — pending).
- [ ] Owner decision `APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` recorded (doc 22 §7 — pending).

---

## 11. Boundary statement

This is a documentation/blueprint **planning** artifact produced under the executor workflow
standard (doc 20) and the doc 21 planning-only mandate. It describes how a future Model / Provider
Profile resolver *would* work; it does **not** implement one, does **not** select any vendor model,
does **not** authorize implementation, refactor, connector integration, deploy, publish,
main-branch merge, or any plugin registry, and operates entirely upstream of the doc 22 §7
owner-decision line.
