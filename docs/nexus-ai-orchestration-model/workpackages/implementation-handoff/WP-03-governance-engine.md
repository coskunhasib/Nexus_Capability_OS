# WP-03 — Governance Engine (Implementation Workpackage Spec)

> **PLANNING ARTIFACT — WORKPACKAGE SPECIFICATION ONLY.**
> This document is a *workpackage spec*. It describes **what** a future, separately
> approved execution phase **would build** for the Nexus AI governance engine and
> **how** that build would be validated. Authoring this spec is **not** executing
> it. This document contains **no runtime code** and authorizes **none**.
>
> **Gate:** Per doc 22 §6–§8 and doc 21 §11, the governance engine described by the
> source plan may not be built until the owner records
> `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`. That approval covers
> the *planning handoff* (producing this and sibling WP specs). **Executing** this
> workpackage — turning the spec into runtime code — requires a **further, separate,
> explicit owner decision** and is out of scope here.
>
> **Implementation target:** a **FUTURE Nexus runtime workspace** to be decided
> later. This workpackage does **not** modify the existing nexus app code and does
> **not** touch `main`. The `nexus` branch stays isolated from `main`.

---

## Workpackage contract (doc 20 §4 + `depends_on`)

```yaml
workpackage_id: WP-03-governance-engine
executor: Codex
reviewer: ChatGPT            # doc 20 §3 reviewer/auditor; verdict per doc 20 §7
depends_on:
  - WP-01                     # shared-registry loader: loads + validates governance
                              # configs and resolves aliases BEFORE the engine reads
                              # them (governance-engine-plan.md §2.3, §9.2). The engine
                              # consumes already-loaded, already-validated, alias-
                              # canonicalized profiles; it must not re-implement load
                              # or alias resolution. WP-03 cannot be executed until the
                              # WP-01 loader contract (config access + alias_resolution
                              # + load-time invariants) is available to build against.
```

---

### objective

Build the **deterministic, config-driven governance engine**: the component that,
for a single gate decision in a pipeline run, **resolves** the full set of
governance rules that apply across the **seven governance layers**
(global → pipeline → team → stage → core-ability → skill → tool), **evaluates**
each rule's declared `pass_condition` / `fail_condition` against supplied run
facts, **classifies** failures by the closed severity vocabulary, and **renders a
deterministic verdict** (`PASS` / `FAIL` / `PASS_WITH_RECORDED_RISK`) plus a
routing instruction that **no actor can override**.

Scope, drawn verbatim from the source plan (doc 21 §8 governance-engine
requirements):

- **Seven-layer resolution** — additive composition of all applicable layers;
  stricter wins; a lower layer may *add* and *tighten* but never *relax or remove*
  a higher layer's blocking rule (governance-engine-plan.md §3).
- **Severity handling** — `blocker` / `major` / `advisory` / `informational`:
  blocker blocks; un-owned `major` blocks; `advisory` records risk
  (`PASS_WITH_RECORDED_RISK`); `informational` flags. Severity is **declared,
  not inferred** (plan §4).
- **Policy-bypass prevention** — bypass is **structurally impossible**: the verdict
  is a pure function of (applicable rules) × (run facts) × (evidence/trace presence)
  with **no override input, flag, role, or token**; any "team-lead / council /
  prompt passed it" is a fresh `blocker` (plan §7).
- **Owner-decision boundary** — the one legitimate human/owner gate input, kept
  strictly distinct from autonomous self-approval; an owner decision *adds* a human
  requirement and never *waives* a failed blocker (plan §8).

The engine **reads** `configs/nexus-ai/governance/` (the 7 applicable layers). It
introduces **no new governance truth**; it operationalizes what already exists on
disk.

---

### mandatory_context

The executor MUST internalize and stay within these before producing anything:

- **Locked decisions (never violate):**
  - **No plugin, ever.** `plugin_absent` is a standing guard that *asserts absence*;
    there is nothing to manage and **no plugin registry** is introduced (D-002/K-001).
  - **Core Abilities `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]`
    are NOT agents**, never team members, never owners/approvers/escalation targets.
    They appear only as *governed subjects* (core_ability scope) or via
    `uses_core_abilities` (D-003/D-004/K-003/K-004).
  - **Supervisor != Team Lead.** The no-self-approval fallback reviewer is the owning
    pipeline's `*_team_lead`, which is **never** Supervisor (D-006/K-006).
  - **Skill != Tool.** Resolved from different dirs (`governance/skill/` vs
    `governance/tool/`); never collapsed.
  - **Governance != Audit.** The engine evaluates governance only; it **references**
    audit schemas by id and never defines, owns, or persists them (D-007/D-008).
  - **Evidence != Trace.** `required_evidence` is satisfied **only** by
    Evidence-family schema ids; `required_trace` **only** by Trace-family schema ids;
    the two families are never merged or substituted for one another (D-008).
- **The verdict is deterministic by construction.** The engine does **not** "reason
  about" whether a gate should pass; it evaluates declared conditions. LLM/council
  output may *produce* facts/evidence the engine consumes but **never substitutes**
  for the verdict (plan §1; doc 06 §14 anti-pattern "LLM output ile gate pass etmek").
- **Boundary ownership (what the engine does NOT own):** the engine does **not** own
  config loading / alias resolution (WP-01 / shared-registry loader), stage
  transition or `on_pass`/`on_fail`/`rework_route` *execution* or run-state
  persistence (pipeline runner / run-state model), or the persistence/definition of
  Evidence/Trace records (audit/evidence store). The engine *instructs*; siblings
  *execute* and *persist* (plan §2.3, §10).
- **Owner-approval precondition.** Executing this WP (writing the engine's code)
  requires the doc 22 §7 owner decision; this spec does not grant it (plan §11).
- **Branch isolation.** Output of any future execution targets a separate future
  Nexus runtime workspace; the existing nexus app and `main` are untouched.

---

### canonical_sources

Source of truth for this component (read these; do not re-derive their content):

- **Primary component plan (authoritative for WHAT/HOW):**
  - `docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md`
- **Governance config layers the engine reads (the 7 applicable layers):**
  - `configs/nexus-ai/governance/global.yaml`
    — 8 first-class global profiles (`plugin_absent`, `no_secret_exposure`,
    `no_policy_bypass`, `trace_required`, `raw_credential_redaction`,
    `high_risk_action_default_deny`, `no_self_approval`, `evidence_required`);
    `severity_vocabulary`, `on_fail_action_vocabulary`, `rework_route_vocabulary`;
    `registry_to_config_map.alias_resolution`; `self_validation` invariants.
  - `configs/nexus-ai/governance/pipeline/{sdlc,research,activation,operations,knowledge,skill_governance}.yaml`
    — pipeline-scope profiles; `activation.yaml` carries the
    `owner_activation_decision_gate` / `public_activation_decision` owner boundary
    and `owner_decision_trace`.
  - `configs/nexus-ai/governance/team/{sdlc,research,activation,operations,knowledge,skill_governance}.yaml`
    — role-separation rules; `forbidden_resolution`
    (`team_lead_override_of_failed_gate`,
    `supervisor_core_ability_acts_as_team_lead`); `cannot_override_gate`.
  - `configs/nexus-ai/governance/stage/sdlc-stages.yaml`
    — one stage-scope profile per SDLC stage, rules derived from each stage
    contract's gates + `on_fail` + `rework_route`; `severity: major` declared on
    conditional gates.
  - `configs/nexus-ai/governance/core-ability/core-abilities.yaml`
    — exactly 8 profiles (one per locked Core Ability) with risk ordering.
  - `configs/nexus-ai/governance/skill/skills.yaml`
    — per-skill profiles enforcing locked semantics (`prism` = brainstorming/
    divergence; `verification-loop` = bug/defect finding) and `no_unread_skill_binding`.
  - `configs/nexus-ai/governance/tool/tools.yaml`
    — per-tool profiles (sandbox / timeout / allowed callers / trace / risk level).
- **Supporting blueprint configs (referenced, not owned):**
  - `configs/nexus-ai/governance_profiles.yaml` — Phase C registry/catalog
    ("what governance exists") + its `alias_resolution`.
  - `configs/nexus-ai/sdlc_pipeline.yaml` + `configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`
    — `uses_governance_profiles`, `blocking_conditions`, `routing_invariants`,
    `anti_patterns` (treated as must-never-occur invariants:
    `self_approval_gate`, `release_candidate_without_policy_gate`,
    `supervisor_as_team_lead`, `plugin_stage`), `locked_decision_guards`.
  - `configs/nexus-ai/stages/sdlc/*.yaml` — 31 stage contracts: the single source of
    truth for each stage's gates, `on_fail`, `rework_route` (the engine reads what
    stage-scope governance mirrored; it does not re-derive routing).
  - `configs/nexus-ai/audit_schemas.yaml` + `configs/nexus-ai/schemas/*.json` — the
    audit registry the engine **references by id** for evidence/trace presence
    checks. Confirmed ids: `sdlc_pipeline_evidence_schema` (Evidence-family);
    `stage_gate_trace_schema`, `gate_decision_trace_schema`, `owner_decision_trace`
    (Trace-family). The engine never defines these.
- **Conceptual specs (definitions / invariants):**
  - `docs/ai-sdlc-factory/03-governance-and-audit-layering.md` — the 7-layer split +
    Evidence/Trace split.
  - `docs/ai-sdlc-factory/06-governance-policy-evidence.md` — blocker vs advisory
    policies, no-self-approval matrix, approval model, risk-acceptance limits
    (§13), release-candidate boundary (§12), anti-patterns (§14).
  - `docs/ai-sdlc-factory/19-governance-audit-readiness-plan.md` — §4 profile
    contract, §5 rule contract, §14 validation invariants.
- **Sibling plans this engine coordinates with (interfaces only; do not re-implement):**
  - `docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md` (WP-01)
  - `docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md`
  - `docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md`
  - `docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md`
  - `docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md`
- **Governing process docs:**
  - `docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md` (§4 contract, §5
    completion report, §6 forbidden actions).
  - `docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md`,
    `docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md`.

---

### required_outputs

The executor produces the **modules/artifacts described below** (names +
responsibilities). **These descriptions are specifications, not code; no code is
written by authoring this spec, and the artifacts themselves are produced only by a
separately approved execution phase into the future Nexus runtime workspace.** Each
artifact maps to a numbered section of `governance-engine-plan.md`.

1. **`governance_engine` module (core resolver/evaluator)** — the top-level
   component exposing a single conceptual operation "evaluate one gate decision →
   verdict." Responsibility: orchestrate the §3.2 pipeline (collect → canonicalize →
   flatten → filter → evaluate → check evidence/trace → classify → render → emit
   trace) and return the §5 verdict record. Owns no config loading and no
   persistence; depends on the WP-01 loader and the audit-store interface. (plan §1,
   §3.2)

2. **`gate_decision_request` input contract** — a documented, typed description of
   the engine's input: `pipeline_id`, `team_id`, `stage_id`, `gate_id`, the artifact
   being adjudicated, `producer_agent_id`, proposed `approver_agent_id`, and the sets
   of core-abilities / skills / tools invoked at this gate (each set possibly empty).
   Responsibility: define exactly which run facts the engine consumes so its output
   is a pure function of declared inputs. (plan §3.2)

3. **`layer_resolver` (seven-layer profile selector)** — selects, per layer, the
   profiles whose `applies_to` matches the decision context: global = always all 8;
   pipeline = profile(s) for `pipeline_id`; team = for `team_id`; stage = for
   `stage_id` and gate; core-ability/skill/tool = for each ability/skill/tool
   actually invoked (empty set when none). Responsibility: produce the candidate
   profile set across all 7 layers — additive, not "pick one." (plan §3.1, §3.2 step 1)

4. **`alias_canonicalizer` (adapter over WP-01 alias resolution)** — maps every
   `*_policy` / alias spelling to its first-class canonical id using
   `governance/global.yaml#registry_to_config_map.alias_resolution` and the registry
   `alias_resolution`, then **deduplicates profiles by canonical id**. Responsibility:
   ensure a profile referenced under two spellings is **one** profile. It **consumes**
   the WP-01 loader's resolution; it does **not** re-implement alias resolution.
   (plan §3.2 step 2)

5. **`rule_flattener`** — expands each selected profile into its `rules[]` so the
   **unit of evaluation is the rule, not the profile**. Responsibility: yield the flat
   applicable-rule set carrying each rule's full doc 19 §5 contract fields. (plan §3.2
   step 3)

6. **`applicability_filter` (`required_when` evaluator)** — drops rules whose
   `required_when` predicate is false for this decision (e.g. a conditional gate that
   does not apply is *vacuously satisfied*; a tool rule when no tool was called does
   not apply). Responsibility: mark non-applicable rules `not_applicable` rather than
   passing or failing them. (plan §3.2 step 4)

7. **`rule_evaluator` (declared-predicate evaluator)** — for each applicable rule,
   computes `pass_condition` / `fail_condition` against the supplied run facts,
   yielding `pass` / `fail` / `not_applicable`. Responsibility: enforce that an
   *indeterminate applicable rule is a config defect, not a silent pass* (total
   functions, §9.1). **Note:** the formal restricted predicate language over the
   run-fact field set is itself a downstream design task (OQ-1 / plan §12 OQ-1); this
   artifact's spec documents the evaluator's *contract and totality requirement*, and
   it is built only once that predicate vocabulary is fixed. (plan §3.2 step 5, §9.1)

8. **`evidence_trace_satisfaction_checker`** — for each rule, confirms its
   `evidence_required` (Evidence-family ids) and `trace_required` (Trace-family ids)
   are present in the audit store for this decision, via the audit/evidence-store
   interface. Responsibility: enforce **family discipline** — Evidence checked only
   against Evidence-family, Trace only against Trace-family, never substituted;
   missing required evidence ⇒ the rule **fails** (global `every_gate_decision_has_evidence`),
   missing required trace ⇒ the global `trace_required` rule fails. (plan §2.1, §3.2
   step 6, §6)

9. **`severity_classifier` + `verdict_aggregator`** — classify each failed rule by
   its **declared** `severity` and aggregate to the single verdict:
   `FAIL` if any applicable blocker failed; `FAIL` if any applicable `major` failed
   **without** an owner-assigned, expiring, evidence-linked acceptance for that
   specific rule; `PASS_WITH_RECORDED_RISK` if only advisory/informational fails
   remain; else `PASS`. Responsibility: severity is **read, never guessed**;
   `PASS_WITH_RECORDED_RISK` is first-class so advisory findings materialize as
   recorded residual risk (owner + expiry), never silently dropped. (plan §4)

10. **`policy_bypass_guard` (structural-bypass-prevention component)** — the engine's
    central security property. Responsibilities: (a) ensure **no override input
    exists** anywhere in the engine's surface (no flag/role/token can set a failed
    blocker to pass); (b) treat a recorded team-lead/council/prompt "pass" of an
    unsatisfied blocker as a **fresh `no_policy_bypass` blocker failure**, not a
    successful override; (c) keep `plugin_absent`, `no_silent_mutation`,
    `high_risk_action_default_deny` always-on and non-deselectable; (d) treat every
    `sdlc_pipeline_runtime_rules.yaml#anti_patterns` entry as a must-never-occur
    invariant whose detection is itself a blocker; (e) on a detected bypass attempt,
    yield `FAIL` + `block_stage`/`block_release`, record a policy-bypass-attempt trace,
    and escalate to `governance_owner` (never auto-accepted). (plan §7)

11. **`self_approval_check`** — enforces `producer_agent_id != approver_agent_id` for
    review/validation/decision gates (and role-distinct variant where roles are
    structurally separated). Responsibility: the fallback approver is the owning
    pipeline's `*_team_lead` and **never Supervisor**; the producer can never be the
    sole approver. (plan §3.4, §7; global `no_self_approval`)

12. **`owner_decision_boundary_handler`** — handles the one legitimate human/owner
    gate. Responsibilities: an owner-decision gate is **satisfiable only by a recorded
    owner decision** (e.g. `owner_activation_decision_recorded == true`) backed by an
    `owner_decision_trace` and evidence — **never** by agent/council output; the owner
    gate **remains subject to `no_self_approval` and all other blockers** (it *adds* a
    human requirement, never *waives* one); an owner decision may **never** mark a
    failed blocker as passed (that is `no_policy_bypass`); **Supervisor** may never act
    as owner or team-lead at an owner boundary. (plan §8)

13. **`verdict_record` output contract** — the structured §5 result the pipeline
    runner consumes: `decision_context`, `evaluated_rules[]` (each with `rule_id`,
    `source_layer`, `source_config`, `canonical_profile_id`, `severity`, `outcome`,
    `evidence_satisfied`, `trace_satisfied`), `aggregate`, `on_fail_action`,
    `rework_route`, `recorded_risks[]` (each with owner + expiry), `trace_ref`.
    Responsibility: describe the verdict's **shape contract** (the engine *fills* it;
    the audit/evidence layer *defines* any persisted schema — Governance != Audit).
    (plan §5)

14. **`routing_instruction_resolver`** — reads `rework_route` from the failing rule
    (which mirrors the stage contract) and validates it against the global
    `rework_route_vocabulary` and the `routing_invariants` / `allowed_rework_routes`
    in `sdlc_pipeline_runtime_rules.yaml` / pipeline contract standard. Responsibility:
    **the engine instructs the route; it never invents or executes it** (the pipeline
    runner executes). (plan §5)

15. **`governance_evaluation_trace_emitter`** — emits the engine's own
    `governance_gate_evaluation` **Trace-family** record for every verdict (a policy
    evaluation is itself a governed action under `trace_required`). Responsibility:
    record which rules were selected, their outcomes, and the resulting routing —
    making the engine itself auditable — while never letting a trace record satisfy an
    evidence requirement. (plan §6)

16. **`load_time_invariant_assertions` (engine-side preconditions over WP-01)** — the
    documented set of invariants the engine **requires the WP-01 loader to have
    confirmed before the engine runs**, and refuses to run without: every profile has
    a known scope (one of the 7); every rule has a closed-vocabulary `severity`; every
    blocker rule has an `on_fail`; `required_evidence` references only Evidence-family
    ids and `required_trace` only Trace-family ids (never merged); no plugin governance
    is introduced; every alias resolves to exactly one first-class id; every referenced
    audit-schema id and `rework_route` id exists. Responsibility: the engine
    **refuses to run** against configs that fail these (it relies on, but re-asserts,
    the loader's checks). (plan §9.2)

17. **`open_questions_register` (engine-build preconditions)** — a documented carry-
    forward of the plan §12 reconciliation items that must be resolved **before the
    engine is built** (formal predicate language; dangling audit-schema ids such as
    `stage_gate_decision_trace`; undefined `*_governance` profiles; `gate_result_schema`
    decision; required-gate `satisfies_required_gate` annotation; activation owner-gate
    confirmation). Responsibility: ensure none of these is silently assumed resolved.
    (plan §12)

18. **`WP-03 design/specification document`** — a single repo document (in the future
    runtime workspace) capturing the above module boundaries, the §3.2 resolution
    algorithm as the engine's reference behavior, the §5 verdict contract, and the
    interfaces consumed from WP-01 and the audit/runner/run-state siblings. Long
    output goes to a repo file, not chat (doc 20 §8). Responsibility: be the
    buildable, reviewable engineering spec the executor and reviewer work against.
    **This document defines behavior; it is not the running engine.**

> **None of the above contains source code.** Each item is a named module/artifact
> with a stated responsibility. Producing the actual code for these artifacts is the
> job of a future, separately approved execution phase (see the gate note at the top
> and `forbidden_actions` below).

---

### required_validations

The build (when later executed) and this spec's acceptance MUST be validated
against the following. Failures are recorded per severity; blocking findings stop
the workpackage.

- **V1 — Seven-layer additive composition.** Confirm the design resolves **all**
  applicable layers (global + pipeline + team + stage + core-ability + skill + tool),
  not a single layer; confirm composition is additive and a lower layer can only
  *add*/*tighten*, never *relax/remove*, a higher-layer blocking rule. (plan §3.1, §3.3)
- **V2 — No override input exists.** Adversarially confirm there is **no** parameter,
  flag, role, or token anywhere in the engine surface that can set a failed blocker
  to `pass`. The absence of such an input is the primary bypass defense. (plan §7.2.1)
- **V3 — Bypass attempts become blockers.** Confirm a recorded team-lead / council /
  prompt "pass" of an unsatisfied blocker yields a **fresh `no_policy_bypass` blocker
  failure** with `FAIL` + `block_stage`/`block_release` + escalation to
  `governance_owner`, never a successful override; confirm a bypass attempt is never
  auto-accepted. (plan §7.2.4, §7.3; doc 06 §13)
- **V4 — Self-approval rejected; fallback is `*_team_lead`, never Supervisor.**
  Confirm `producer_agent_id == approver_agent_id` fails; confirm the fallback
  reviewer is the owning pipeline's `*_team_lead`; confirm **Supervisor is never** an
  approver/owner/team-lead. (plan §3.4, §7.2.3; K-006)
- **V5 — Owner-decision boundary kept distinct from self-approval.** Confirm an
  owner-decision gate is satisfiable **only** by a recorded owner decision +
  `owner_decision_trace` + evidence (never agent/council output); confirm it remains
  subject to all other blockers and **cannot** mark a failed blocker passed; confirm
  no agent (incl. Supervisor) can stand in for the owner. (plan §8; activation.yaml)
- **V6 — Severity is declared, never inferred.** Confirm severity is read from each
  rule's contract field; confirm the §4.3 aggregation (blocker blocks; un-owned major
  blocks; advisory → `PASS_WITH_RECORDED_RISK`; informational flags); confirm an
  out-of-vocabulary severity is rejected. (plan §4.2–§4.4)
- **V7 — `PASS_WITH_RECORDED_RISK` records residual risk.** Confirm advisory/owned-
  major acceptances materialize as recorded risk with **owner + expiry**, and that the
  release-candidate boundary additionally requires `residual_risk_recorded` so
  unrecorded advisory debt cannot reach a release. (plan §4.3; doc 06 §12–§13)
- **V8 — Evidence != Trace family discipline.** Confirm `required_evidence` is checked
  only against Evidence-family ids and `required_trace` only against Trace-family ids;
  confirm a trace can never satisfy an evidence requirement and vice-versa; confirm
  missing required evidence/trace fails the corresponding global rule. (plan §2.1, §6,
  §3.2 step 6)
- **V9 — Audit-schema references resolve and are referenced-only.** Confirm every
  referenced evidence/trace id exists in `audit_schemas.yaml` / `schemas/*.json`
  (`sdlc_pipeline_evidence_schema`, `stage_gate_trace_schema`,
  `gate_decision_trace_schema`, `owner_decision_trace`); confirm the engine **defines
  none** (Governance != Audit). Unresolved ids in plan §12 OQ-2 (e.g.
  `stage_gate_decision_trace`) must be registered or aliased **before build**, not
  silently passed. (plan §2.1, §9.2, §12)
- **V10 — Determinism / totality.** Confirm re-evaluating the same decision with the
  same facts yields the same verdict (no hidden state); confirm every applicable rule
  resolves to `pass`/`fail`/`not_applicable` and an *indeterminate applicable* rule is
  treated as a **config defect**, not a silent pass; confirm closed vocabularies for
  `severity`, `on_fail`, `rework_route` are enforced at load time. (plan §9.1–§9.2)
- **V11 — Anti-patterns are invariants.** Confirm every
  `sdlc_pipeline_runtime_rules.yaml#anti_patterns` entry (`self_approval_gate`,
  `release_candidate_without_policy_gate`, `supervisor_as_team_lead`, `plugin_stage`)
  is treated as must-never-occur, and detection of any is itself a blocker. (plan §7.2.7)
- **V12 — Routing is read, not invented; instructed, not executed.** Confirm
  `rework_route` is read from the failing rule (mirroring the stage contract),
  validated against the `rework_route_vocabulary` / `routing_invariants`, and that the
  engine **only instructs** — the pipeline runner executes. (plan §5)
- **V13 — Engine evaluation is itself traced.** Confirm every verdict emits a
  `governance_gate_evaluation` Trace-family record showing selected rules, outcomes,
  and routing. (plan §6)
- **V14 — Locked-decision guards.** Confirm: no plugin concept/field/stage/registry is
  introduced (`plugin_absent` asserts absence only); no Core Ability is treated as an
  agent/owner/approver/team-lead; Skill and Tool layers stay separate; Governance and
  Audit stay separate; Evidence and Trace stay separate. (plan §1, §10; doc 22 §6)
- **V15 — Boundary ownership respected.** Confirm the engine does **not** implement
  config loading / alias resolution (WP-01), stage-transition / `on_fail` execution /
  run-state persistence (runner / run-state model), or Evidence/Trace
  definition/persistence (audit store); confirm it consumes their interfaces only.
  (plan §2.3, §10)
- **V16 — No code / no execution in this WP spec.** Confirm this workpackage spec and
  any design output contain **no runtime code** and that no engine code is produced
  absent the further owner decision (doc 22 §6–§8). (plan §11; doc 21 §3)

---

### forbidden_actions

**Global executor forbidden actions (doc 20 §6) — apply to every workpackage:**

```text
write to main branch
merge
runtime implementation without a further explicit owner approval
start a product refactor without a further explicit owner approval
add connector / deploy / publish
introduce a plugin / plugin registry
self-approve (substitute for owner approval)
claim production readiness
```

**WP-03-specific forbidden actions (governance-engine-plan.md §10 non-goals):**

```text
write or imply runtime code in this spec (this is a workpackage specification)
define, own, or persist any audit/evidence/trace schema (Governance != Audit)
own stage transition, on_pass/on_fail/rework_route EXECUTION, or run-state
  persistence (that is the pipeline runner / run-state model — the engine only
  renders a verdict + routing instruction)
re-implement config loading or alias resolution (that is WP-01 / the shared-
  registry loader — the engine consumes its already-loaded, alias-canonicalized
  profiles)
introduce a plugin concept, plugin governance, or plugin registry (D-002/K-001)
treat any Core Ability as an agent, owner, approver, escalation target, or team
  lead; treat Supervisor as a team lead (D-003/D-004/D-006/K-003/K-004/K-006)
merge Governance with Audit, or Evidence with Trace; let a trace satisfy an
  evidence requirement or vice-versa (D-007/D-008)
merge the Skill layer with the Tool layer
add ANY override input/flag/role/token, or grant any actor (team lead, council,
  prompt, or even owner) a path to mark a FAILED blocking gate as passed
infer or guess a rule's severity (severity is declared, read-only)
invent or execute a rework_route (read it from the failing rule; the runner
  executes it)
auto-accept a blocker, a bypass attempt, missing evidence, or unknown skill
  semantics (doc 06 §13)
begin building the engine before OWNER_DECISION:
  APPROVE_IMPLEMENTATION_PLANNING_HANDOFF AND the further, separate execution
  approval; modify the existing nexus app code or touch main
```

---

### completion_report_format

The executor returns a completion report in the doc 20 §5 format:

```yaml
workpackage_id: WP-03-governance-engine
executor: Codex
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:          # repo paths of artifacts/specs produced (future runtime workspace)
files_modified:         # repo paths modified (NEVER main; NEVER existing nexus app code)
validation_summary:     # per-check result for V1..V16 above (pass / fail / n.a. + note)
blocking_findings:      # any locked-decision breach, any override path, any code emitted
major_findings:         # un-owned major gaps, unresolved interface contracts
minor_findings:         # advisory/style/doc gaps
open_questions:         # incl. plan §12 OQ-1..OQ-6 carried as engine-build preconditions
needs_chatgpt_review: true
```

Reviewer (ChatGPT) returns a doc 20 §7 verdict (`PASS` / `PASS_WITH_FINDINGS` /
`BLOCKED`). Per doc 20 §7, **no implementation/refactor begins** until: the executor
completion report exists, the ChatGPT review exists, no blocking findings remain, and
**the owner approves the transition**.
