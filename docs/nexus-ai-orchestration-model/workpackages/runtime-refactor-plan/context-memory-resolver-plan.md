# Context / Memory Profile Resolver — Planning-Only Plan

- **Doc id:** `runtime-refactor-plan/context-memory-resolver-plan`
- **Phase:** G/H (runtime/refactor PLANNING). Realizes one of the ten planning areas in
  `docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md` §4
  ("Context/memory profile resolver plan") and the required output named in doc 21 §5
  (`docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md`).
- **Nature:** **PLANNING ONLY.** This document describes *how a future runtime would resolve
  context/memory profiles per pipeline run and per agent.* It does **not** implement anything.
  **No runtime code, no product refactor, no connector integration, no deploy/publish, no
  main-branch merge, no plugin registry** (doc 21 §3). Every statement below is a plan for a future
  component, not a description of an existing one.
- **Status:** DRAFT — depends on the explicit owner-approval gate (see §11) before any of it may be
  built.

---

## 1. Objective

Plan a single future runtime component — the **Context / Memory Profile Resolver** (hereafter "the
resolver") — whose job is to take a pipeline run (and, within it, a specific agent at a specific
stage) and produce the **bounded, governed working-context view** that run/agent is allowed to see.

The resolver is the runtime counterpart of the already-locked
`configs/nexus-ai/context_memory_profiles.yaml` registry. It does not invent context policy; it
*evaluates* the policy that registry already declares. Concretely, for each profile it must honor:

- `source_priority` — the ordered list of where working context is hydrated from;
- `retention` — how long the resolved context lives;
- `validity_window` — when the resolved context stops being valid;
- `retrieval_rules` — what may be read, and the scoping/isolation constraints;
- `redaction_rules` — what must be stripped/masked before exposure.

This plan defines the resolver's inputs, outputs, resolution order, boundaries, failure behavior,
and the artifacts it would emit — at the level of a design contract, not an implementation.

### 1.1 Scope

In scope (to plan):
- Resolving a **run context** (`scope: run`) once per pipeline run.
- Resolving a **stage/agent context pack** (`scope: stage_pack`) per stage activation / per agent.
- Applying `source_priority`, `retention`, `validity_window`, `retrieval_rules`, `redaction_rules`
  from `context_memory_profiles.yaml`.
- The boundary and hand-off between the resolver and the **Memory Core Ability**.

Out of scope (planned elsewhere or out of phase):
- Building the Memory Core Ability itself, or any durable knowledge store
  (`core-abilities-alignment.md`, and the live Knowledge / Memory Pipeline — not this doc).
- The governance decision engine that the resolver *calls* (planned in
  `runtime-refactor-plan/governance-engine-plan.md`).
- The audit/evidence persistence the resolver *writes to* (planned in
  `runtime-refactor-plan/audit-evidence-store-plan.md`).
- The shared-registry loader that *parses* `context_memory_profiles.yaml` (planned in
  `runtime-refactor-plan/shared-registry-loader-plan.md`).
- The model/provider resolution, which is a **sibling** resolver, not this one
  (`runtime-refactor-plan/model-provider-resolver-plan.md`).

---

## 2. The one boundary this plan must never blur: Memory ability vs context profile

This is the single most important constraint in the whole plan, and it is a locked decision
(`.memory/0002-locked-decisions.md`; `docs/ai-sdlc-factory/02-concept-boundaries.md`;
`context_memory_profiles.yaml` `memory_vs_context_rule`):

| | **Memory Core Ability** | **Context / Memory Profile** |
|---|---|---|
| What it is | A **capability** (one of the 8 Core Abilities) that *persists and retrieves* durable knowledge. | A **governed view of state** a run/agent is *allowed to see* this run. |
| Owned by | `configs/nexus-ai/core_abilities.yaml` (id `memory`, `never_agent: true`). | `configs/nexus-ai/context_memory_profiles.yaml`. |
| Lifetime | Durable across runs (subject to the Knowledge/Memory Pipeline's lifecycle). | Bounded by `retention` / `validity_window` (usually `run_scoped`). |
| Role in resolution | A **source** the resolver may read from (it appears as a low-priority `durable_memory_*` entry in `source_priority`). | The **thing the resolver produces**. |

**Resolver rules that enforce the boundary (plan-level):**

1. The resolver **produces context packs; it never *is* Memory.** Calling the resolver must never be
   described, logged, or surfaced as "calling Memory."
2. When a profile's `source_priority` contains a `durable_memory_*` entry (e.g.
   `durable_memory_prior_runs`, `durable_memory_operational_baselines`), the resolver obtains that
   slice **by invoking the Memory Core Ability's retrieval operation** (owned by the Tools Registry
   per `core_abilities.yaml`), bounded by that ability's own `memory_access_governance`. The resolver
   does not read a durable store directly.
3. **Durable memory is advisory.** Every SDLC profile lists `durable_memory_*` *last* in
   `source_priority` and several explicitly forbid `auto_satisfy_a_gate_from_prior_run_memory`
   (e.g. `sdlc_run_context.forbidden_usage`). The resolver must mark memory-sourced slices as
   advisory provenance and must never let them satisfy a gate.
4. The resolver **never persists**. Curating/persisting durable knowledge is the Knowledge / Memory
   Pipeline's job via the Memory Core Ability (`learning_context_pack.retrieval_rules:
   learning_persisted_via_memory_core_ability_not_inline`). The resolver is read-and-assemble only.
5. A resolved context pack is **never** an agent, team member, skill, or tool
   (`memory_vs_context_rule.context_profiles_are_not`; every profile's `forbidden_usage` ends with
   `exposed_as_an_agent_team_skill_or_tool`).

---

## 3. Inputs the resolver consumes (plan)

All inputs already exist as blueprint artifacts; the resolver reads them, it does not own them.

1. **The profile registry** — `configs/nexus-ai/context_memory_profiles.yaml`, made available by the
   shared-registry loader (`shared-registry-loader-plan.md`). The 26 profiles (9 canonical + 17
   candidate) are the resolver's rule source. The resolver must honor `status`: a `candidate`
   profile resolves only for the pipeline that owns it and must be flagged as not-yet-ratified.
2. **The active pipeline run** — the run-state object planned in
   `runtime-refactor-plan/pipeline-run-state-model.md`: run id, the pipeline id, the
   domain/risk profile, conditional-gate flags, and (for the Operations Pipeline) the incident id.
   These drive `retrieval_rules` such as `redact_pii_per_domain_risk_profile` and run/incident
   isolation.
3. **The resolution request** — *who is asking and for what*:
   - `pipeline_id` (e.g. `sdlc_pipeline`, `research_pipeline`, `operations_pipeline`),
   - `scope` (`run` or `stage_pack`),
   - `stage_id` (for `stage_pack`),
   - `agent_id` / `sub_agent_id` (the requesting agent, for per-agent scoping and audit).
4. **The usage mapping** — each profile's `used_by` (and the `stage:<id>@<pipeline>` qualifier
   convention) is authoritative for *which* profile a given (pipeline, stage) is entitled to. The
   resolver resolves only profiles whose `used_by` admits the requester; anything else is denied
   (see §6.4).
5. **Current-run produced artifacts** — the evidence graph, prior stage outputs, and produced
   reports referenced as the *high-priority* `current_run_*` entries in each profile's
   `source_priority`. These come from the audit/evidence store + run state, not from this resolver.
6. **The governance verdict** — for any access the governance engine
   (`governance-engine-plan.md`) is the authority; the resolver calls it and obeys it (see §7).
7. **The Memory Core Ability retrieval interface** — for the `durable_memory_*` source slices only
   (see §2 rule 2).

---

## 4. Output the resolver produces (plan)

A **Resolved Context View** (RCV) — an in-memory, run-scoped object the requesting agent receives.
Planned shape (conceptual; not a schema to implement now):

- `resolved_for`: { `run_id`, `pipeline_id`, `scope`, `stage_id?`, `agent_id?` }.
- `profile_id` + `profile_status` (canonical/candidate) + `profile_version`.
- `slices[]`: each hydrated slice with `source` (which `source_priority` entry it came from),
  `provenance` (`current_run` | `upstream_referenced` | `durable_memory_advisory`), and a
  `redaction_applied` marker.
- `retention` + `validity_window` (copied verbatim from the profile) + `expires_at` /
  `valid_for` derived from them.
- `isolation_key`: the run id (or incident id) used to enforce run/incident-scoped isolation.
- `denied[]`: any requested-but-denied source slices, with the reason (governance, scope, redaction).

**The RCV is ephemeral.** It is *not* written to any durable store by the resolver. Only the
**trace** of *what the resolver did* is persisted (see §8) — to the audit store, via the
`context_usage_trace_schema` every profile already names. The RCV carries no raw secrets (§6.3).

---

## 5. Resolution order (the resolver's core algorithm — described, not coded)

For a single resolution request, the planned ordered procedure is:

1. **Identify the profile.** From (`pipeline_id`, `scope`, `stage_id`) pick the profile whose
   `used_by` admits the requester. If `scope: run`, this is the pipeline's `*_run_context`
   (e.g. `sdlc_run_context`). If `scope: stage_pack`, it is the stage's entitled pack.
   - Resolve `aliases`: if the requester names a legacy/alias id (e.g. `code_review_context_pack`),
     map it to its canonical profile via the registry's `aliases` field and record the alias used.
2. **Authorize the profile.** Call the governance engine with the profile's `governance_profiles`
   (e.g. `context_access_governance`, `no_secret_read_policy`, `no_self_approval_policy`). A
   `blocker` verdict denies resolution outright. (§7)
3. **Hydrate by `source_priority`, in order.** Walk the profile's `source_priority` list top to
   bottom. For each entry:
   - `current_run_*` / `*_artifacts` → read from run state / audit-evidence store.
   - an upstream profile name (e.g. `requirements_context_pack` inside
     `architecture_context_pack`) → resolve that profile *first* and compose its (already-redacted)
     slices in — never re-derive, never widen its scope.
   - an upstream-pipeline reference (e.g. `sdlc_release_candidate_evidence` in
     `activation_run_context`) → read the referenced evidence; **do not regenerate the SDLC run**
     (`forbidden_usage: regenerate_the_sdlc_pipeline`).
   - a `durable_memory_*` entry → call the Memory Core Ability retrieval (§2 rule 2), tag the slice
     `durable_memory_advisory`.
   - **Order is semantic:** earlier sources are authoritative; later sources (especially memory)
     are advisory and must never override or auto-satisfy. The resolver preserves source rank in
     `slices[].source` so downstream gate logic can refuse advisory-only support.
4. **Apply `retrieval_rules`.** Enforce each rule on the assembled set, e.g.
   `run_scoped_isolation: true` (reject any slice keyed to a different run/incident),
   `tool_permission_map_and_context_policy_are_authoritative_for_tool_access`,
   `binding_context_must_not_be_read_before_semantics_complete` (skill bridge),
   `every_load_bearing_claim_must_have_mapped_evidence` (research). A violated rule drops or denies
   the offending slice and is recorded in `denied[]`.
5. **Apply `redaction_rules` — last, before exposure.** Strip/mask per the profile, e.g.
   `no_raw_secrets` (always), `redact_pii_per_domain_risk_profile`,
   `mask_credential_material_in_threat_model`, `blameless_redact_individual_identities`
   (postmortem), `preserve_source_provenance` (research — a *keep* rule, the inverse: provenance
   must survive redaction). Redaction is mandatory and non-bypassable (§6.3).
6. **Stamp `retention` + `validity_window`.** Copy them verbatim onto the RCV and compute
   `expires_at` (e.g. `run_scoped` → discard at run close; `incident_scoped` → discard at incident
   close; `durable_with_review` for postmortems → not discarded by the resolver, handed to Memory).
7. **Emit the RCV + write the usage trace** (§8). Return the RCV to the requester.

This order is invariant: **authorize → hydrate by priority → retrieval-filter → redact → stamp →
trace.** Redaction is always the last transform before the view is handed out.

---

## 6. Boundaries, invariants, and hard "never"s (plan)

These are derived directly from `forbidden_usage` / `retrieval_rules` / `redaction_rules` across the
registry and from the locked decisions. The resolver must structurally guarantee them.

### 6.1 Run / incident isolation
- One run can never read another run's run context (`run_scoped_isolation: true`,
  `forbidden_usage: shared_across_different_runs`). For Operations, `incident_scoped_isolation` and
  `forbidden_usage: shared_across_unrelated_incidents` apply.
- The `isolation_key` on every RCV is the enforcement point; cross-key slices are denied.

### 6.2 Advisory memory never satisfies a gate
- `durable_memory_*` slices are tagged advisory; the resolver refuses to present them as gate-
  satisfying evidence (`auto_satisfy_a_gate_from_prior_run_memory` is forbidden;
  `prior_run_memory_is_advisory_only`). Gate evaluation is the governance engine's job; the resolver
  just guarantees the provenance tag is truthful so the gate logic can enforce it.

### 6.3 No raw secrets — ever (blocker policy)
- `no_raw_secrets` is on **every** profile; the security pack adds the strictest form
  (`no_secret_read_policy`, `mask_credential_material_in_threat_model`). The resolver must apply
  redaction as a **mandatory final stage** that cannot be skipped, disabled per-call, or deferred.
  A redaction failure is a hard deny, not a degraded pass.

### 6.4 Entitlement, not ambient authority
- A requester gets only profiles whose `used_by` admits it. There is no "read any context" path.
  Unentitled requests are denied and traced — they are not silently widened.

### 6.5 No regeneration of upstream pipelines
- When a profile references upstream-pipeline evidence (Activation→SDLC, Operations→SDLC), the
  resolver **reads the referenced evidence** and never triggers the upstream pipeline
  (`regenerate_the_sdlc_pipeline` is forbidden in `activation_run_context`,
  `operations_run_context`, `learning_context_pack`).

### 6.6 No exposure as agent/team/skill/tool
- A resolved view is data. The resolver must never register, name, or surface an RCV (or itself, or
  a profile) as an agent, team member, skill, or tool. Plugin remains cancelled forever — no plugin
  context pack, no plugin resolution path.

### 6.7 Candidate-status honesty
- `candidate` profiles (the 17 non-SDLC ones) resolve only for their owning pipeline and are flagged
  `not-yet-ratified` on the RCV, so downstream consumers and reviewers know the source is a draft
  (Phase C/E reconciliation debt, see §10).

---

## 7. Relationship to the governance engine (plan)

The resolver is an **enforcement point that delegates the decision**:

- For every profile it resolves, the resolver calls the governance engine
  (`governance-engine-plan.md`) with that profile's `governance_profiles`.
- Severity handling follows doc 21 §8: a **blocker** verdict denies resolution; **major/advisory**
  verdicts are recorded on the RCV/trace but do not by themselves block (subject to the engine's
  rules). The resolver never overrides a governance verdict (`no_policy_bypass`).
- The resolver does **not** evaluate gates and does **not** make owner decisions; those are the
  governance engine's and the human owner's boundaries respectively. The resolver only guarantees
  truthful provenance/scoping so those authorities can decide correctly.

Governance ≠ Audit (locked): the engine *decides*; the audit store (§8) *records*. The resolver
touches both but conflates neither.

---

## 8. Relationship to the audit / evidence store (plan)

- Every resolution emits a **usage trace** to the audit store
  (`runtime-refactor-plan/audit-evidence-store-plan.md`) using the
  **`context_usage_trace_schema`** that nearly every profile names under `audit_schemas`
  (and the relevant pipeline `*_trace_schema`, e.g. `stage_gate_trace_schema`,
  `activation_transition_trace_schema`).
  - **Reconciliation note:** `context_usage_trace_schema` is named by the profiles in
    `context_memory_profiles.yaml` but is **not yet defined as an `id` in
    `configs/nexus-ai/audit_schemas.yaml`** (which currently defines `stage_gate_trace_schema`,
    `memory_update_trace_schema`, `gate_decision_trace_schema`, etc.). This is open audit-name
    reconciliation debt (§10) — it must be defined/aliased in the audit registry before the
    resolver's trace write can resolve. The resolver plan depends on that name landing; it does not
    define it here.
- The trace records: which profile (and alias, if any), which slices, their provenance, what was
  denied and why, the isolation key, and the requesting agent — i.e. *which agent read/wrote which
  context slice* (`sdlc_run_context.audit_schemas` intent).
- **Trace ≠ Evidence** (locked). The resolver writes **traces** (records of context access). It does
  not mint evidence items; producing evidence is the stages' job. The resolver may *read* evidence
  as a source (§3.5) but never *authors* it.
- The RCV itself is not persisted; only the trace is. This keeps ephemeral working context out of
  the durable store while keeping the access fully auditable.

---

## 9. Per-pipeline considerations the resolver must accommodate (plan)

The registry already encodes pipeline-specific behavior; the resolver must support all of it without
special-casing in policy (policy stays in the YAML):

| Pipeline | Resolver must honor |
|---|---|
| **SDLC** | `sdlc_run_context` as the always-on backbone for ~all 31 stages; the 8 canonical packs; alias→canonical mapping for the many reconciled legacy pack names (§5.1). |
| **Research** | `preserve_source_provenance` survives redaction; `load_bearing_claims_must_resolve_to_mapped_evidence`; `unscored_source_must_not_enter_synthesis`; producer ≠ sole validator (enforced via governance, not by collapsing roles). |
| **Activation** | upstream SDLC release evidence is **referenced, not regenerated**; staged scope ordering (preview→pilot→public); the public-activation decision is a **human/owner** gate recorded as evidence, never self-approved. |
| **Operations** | `incident_scoped` retention + `single_incident_lifecycle` validity; one incident per pack; `postmortem_context_pack` is `durable_with_review` and **blameless** redaction; `learning_context_pack` persists via Memory, not inline. |
| **Skill Governance** | `until_skill_version_or_hash_changes` validity (re-resolve on hash change); `binding_context_must_not_be_read_before_semantics_complete`; locked prism/verification-loop semantics are immutable; scripts in candidate packages are **flagged, never executed**. |
| **Knowledge / Memory** | `validity_window_required_gate` — no retained item without a window; `redact_sensitive_content_before_summarization_or_storage`; this pipeline **governs what Memory may remember** but does not make Memory an agent (§2). |

---

## 10. Dependencies on other runtime-refactor plans and open reconciliation debt

**Sibling plans this resolver depends on** (all doc 21 §5 outputs; none may be built yet):
- `shared-registry-loader-plan.md` — parses `context_memory_profiles.yaml` and resolves
  `aliases` / `used_by`.
- `pipeline-run-state-model.md` — supplies run id, domain/risk profile, conditional-gate/incident
  state (the isolation key).
- `governance-engine-plan.md` — the authority the resolver calls for every access (§7).
- `audit-evidence-store-plan.md` — where usage traces are written (§8).
- `core-abilities-alignment.md` — the Memory Core Ability retrieval interface the resolver uses for
  `durable_memory_*` slices (§2).
- `model-provider-resolver-plan.md` — the **sibling** resolver; both are invoked per run/agent but
  are distinct components (context view vs model/provider selection).

**Open reconciliation debt the resolver inherits** (from `context_memory_profiles.yaml`
`open_questions`; non-blocking, to be resolved before materialization):
- `learning_context_pack` **name collision** (SDLC-31 alias on `release_context_pack` vs the
  distinct Operations live-ops learning pack). The resolver must disambiguate by `pipeline_id`
  until Phase E decides whether to rename the Operations item
  (`operations_learning_context_pack`).
- `operations_context_pack` is **reused** as both the SDLC operations-readiness pack and the live
  Operations Pipeline pack. The resolver must treat the one canonical id correctly in both
  lifecycles until a split is decided.
- Governance/audit **name reconciliation** must be aligned in `governance_profiles.yaml` /
  `audit_schemas.yaml` so the resolver's calls resolve cleanly. In particular:
  `context_usage_trace_schema` is named by the context profiles but is **not yet an `id` in
  `audit_schemas.yaml`** (§8); and the `*_policy` governance names (e.g. `no_self_approval_policy`,
  `evidence_required_policy`) are bindings of the bare canonical policies (`no_self_approval`,
  `evidence_required`) and must be registered as aliases. The resolver depends on these landing.
- `domain_risk_context_pack` confirmation into the locked SDLC base-pack set.
- The `stage:<id>@<pipeline>` `used_by` qualifier convention must be confirmed in the Phase C
  shared-registry review so the resolver's entitlement check is enforceable.
- `skill_semantic_context_pack` ratifying owner (Skill Governance Pipeline) confirmation.

These are recorded as risks to carry forward; **none authorizes any build.**

---

## 11. Owner-approval dependency (explicit)

This plan is gated. Per `docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md` §2/§10/§11
and `docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md` §6/§7, and consistent with the
`implementation-readiness-review.md` verdict (PASS_WITH_FINDINGS; item 10 owner approval **pending**
as the final gate):

1. **Producing this plan is allowed now.** It is a planning-only document and changes no code.
2. **Building the resolver is NOT allowed** until:
   - all ten runtime/refactor plan docs (doc 21 §5) exist, **and**
   - `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` exists with a PASS /
     PASS_WITH_FINDINGS verdict and no blocking finding (doc 21 §10), **and**
   - the human owner explicitly approves the transition — the
     `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` gate named in doc 22 §7.
3. Until that owner decision is recorded, this resolver remains a **paper design only.** No part of
   §3–§9 may be implemented, wired to a connector, deployed, merged to `main`, or turned into a
   plugin.

**The owner-approval gate is a hard precondition for implementation and is not satisfied by this
document or by any review.**

---

## 12. Exit criteria for this plan (doc-level)

- [x] This file exists at `docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md`.
- [x] It is planning-only: no code, no schema to execute, no runtime change.
- [x] It keeps the Memory Core Ability vs context-profile boundary explicit and enforced (§2).
- [x] It covers `source_priority`, `retention`, `validity_window`, `retrieval_rules`,
      `redaction_rules` from `context_memory_profiles.yaml` (§5).
- [x] It references the concrete blueprint artifacts it builds on (registry, sibling plans, reviews).
- [x] It makes the owner-approval dependency explicit (§11).
- [ ] Folded into `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` once all ten plan
      docs are written (doc 21 §10) — **out of scope for this single doc.**
