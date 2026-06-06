# Governance Engine — Runtime/Refactor Plan (PLANNING ONLY)

> **Status:** PLANNING ONLY. This document describes *how* a future Nexus AI
> governance-resolution engine **would** work. It implements **nothing**. No
> runtime code, no product refactor, no connector integration, no deploy/publish,
> no main-branch merge, and no plugin registry are produced or implied here
> (doc 21 §3 non-goals; doc 22 §9 prohibited-until-approval list).
>
> **Gate:** This plan is one of the doc 21 §5 required outputs. It may NOT be
> acted on until the owner records
> `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (doc 22 §7). See
> §11 (Owner-approval dependency) — that dependency is a hard precondition, not a
> footnote.

Source of scope: **doc 21 §8 — "Governance engine plan requirements"**:
Global/Pipeline/Team/Stage/Core Ability/Skill/Tool governance resolution;
blocker/major/advisory severity handling; policy-bypass prevention; owner-decision
boundary. This plan reads from `configs/nexus-ai/governance/` and references the
concrete blueprint artifacts it builds on.

---

## 1. Purpose and one-line definition

The **governance engine** is the (future, not-yet-built) component that, given a
single gate decision in a pipeline run, **resolves** the full set of governance
rules that apply to that decision across the seven governance layers, **evaluates**
each rule's `pass_condition` / `fail_condition`, **classifies** the outcome by
severity, and **renders a deterministic verdict** (`pass` / `fail` /
`pass_with_recorded_risk`) that no actor can override.

It is the runtime expression of the project's core governance principle
(doc 06 §1):

```text
AI can do the work.
AI can propose a decision.
But a pass / approve / release decision is invalid without evidence + policy.
Prompt does not replace policy.
Team Lead does not replace policy.
LLM council does not replace policy.
```

The engine is therefore **deterministic by construction**: it consumes machine-
readable rule contracts and machine-readable run facts, and emits a verdict. It
does not "reason about" whether a gate should pass; it evaluates declared
conditions. (LLM/council outputs may *produce* the facts and evidence the engine
consumes, but they never *substitute* for the verdict — doc 06 §14 anti-pattern
"LLM output ile gate pass etmek".)

### What the engine is NOT (boundaries it must preserve)

| Boundary | Locked rule | Why it matters to the engine |
|---|---|---|
| **Governance != Audit** (D-007/D-008) | The engine evaluates **governance** (Policy / Gates / Permissions / Risk Rules). It **references** audit schemas by id; it never defines, owns, or writes them. | The engine *requires* evidence/trace records (via `required_evidence` / `required_trace`) but the audit/evidence store (see `audit-evidence-store-plan.md`) is the component that persists them. |
| **Evidence != Trace** (D-008; K-…) | `required_evidence` is satisfied only by Evidence-family schemas; `required_trace` only by Trace-family schemas. The two are never merged. | A trace record can never satisfy an `evidence_required` rule (doc 06 §10) and vice-versa. The engine enforces the split when it checks satisfaction. |
| **Core Ability != Agent** (D-003/D-004/K-003/K-004) | `[Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]` are a capability layer, never agents, never team members, never owners/approvers. | The engine never accepts a Core Ability as a gate `owner`, `approver`, or `escalation` target. Core Abilities appear only as *governed subjects* (core_ability scope) or via `uses_core_abilities`. |
| **Supervisor != Team Lead** (D-006/K-006) | Supervisor (Core Ability) is never any `*_team_lead`. | The no-self-approval fallback reviewer is the owning pipeline's `*_team_lead`, which is never Supervisor. |
| **Skill != Tool** | Skill governance and tool governance are distinct layers. | They are resolved from different config dirs (`governance/skill/` vs `governance/tool/`) and never collapsed. |
| **Plugin cancelled** (D-002/K-001) | No plugin concept, ever. | The engine carries `plugin_absent` as a standing global guard that *asserts absence*; it never manages a plugin (there is nothing to manage). No plugin registry. |

---

## 2. Blueprint artifacts this plan builds on (concrete inputs)

The engine is a **reader** of the already-authored, on-disk governance blueprint.
It introduces no new governance truth; it operationalizes what exists.

### 2.1 Governance config layers (the engine's primary inputs)

`configs/nexus-ai/governance/` — the applicable governance layers authored in
Phase E (doc 19). Each file already carries the doc 19 §4 *profile contract* and
the doc 19 §5 *rule contract*, so the engine can evaluate them directly:

| Scope | On-disk source(s) | Profile/contract notes |
|---|---|---|
| **global** | `governance/global.yaml` | 8 first-class global profiles: `plugin_absent`, `no_secret_exposure`, `no_policy_bypass`, `trace_required`, `raw_credential_redaction`, `high_risk_action_default_deny`, `no_self_approval`, `evidence_required`. Contains `severity_vocabulary`, `on_fail_action_vocabulary`, `rework_route_vocabulary`, and a `registry_to_config_map` with `alias_resolution`. |
| **pipeline** | `governance/pipeline/{sdlc,research,activation,operations,knowledge,skill_governance}.yaml` | e.g. `sdlc.yaml` `sdlc_pipeline_governance` carries the SDLC §7 minimums as evaluable rules; `activation.yaml` carries `owner_activation_decision_gate` (the human/owner boundary — §10). |
| **team** | `governance/team/{sdlc,research,activation,operations,knowledge,skill_governance}.yaml` | role-separation rules (developer ≠ approver, QA cannot self-clear, release manager cannot pass a failed gate, `*_team_lead` cannot bypass). |
| **stage** | `governance/stage/sdlc-stages.yaml` | one stage-scope profile **per SDLC stage** (31), each with rules **derived from the stage contract's gates + `on_fail` + `rework_route`** (the file documents its derivation method). |
| **core_ability** | `governance/core-ability/core-abilities.yaml` | exactly 8 profiles (one per locked Core Ability) with the doc 19 §8 risk ordering (`OS`/`Web` high; `Memory` medium; reasoning abilities low). |
| **skill** | `governance/skill/skills.yaml` | per-skill profiles enforcing **locked semantics** (`prism` = brainstorming/divergence only; `verification-loop` = bug/defect finding only) and `no_unread_skill_binding`. |
| **tool** | `governance/tool/tools.yaml` | per-tool profiles enforcing the side-effect rule (sandbox / timeout / allowed callers / trace / risk level). |

### 2.2 Supporting blueprint artifacts (referenced, not owned by the engine)

- `configs/nexus-ai/governance_profiles.yaml` — the Phase C **registry/catalog**
  ("what governance exists"; the `governance/` layers implement "how it applies").
  The engine uses the registry's `alias_resolution` to canonicalize `*_policy`
  spellings (e.g. `no_self_approval_policy` → `no_self_approval`).
- `configs/nexus-ai/sdlc_pipeline.yaml` + `sdlc_pipeline_runtime_rules.yaml` —
  the pipeline's `uses_governance_profiles`, `blocking_conditions`,
  `routing_invariants`, `anti_patterns`, and `locked_decision_guards`. The engine
  treats the runtime-rules `anti_patterns` as **must-never-occur invariants**
  (e.g. `self_approval_gate`, `release_candidate_without_policy_gate`,
  `supervisor_as_team_lead`, `plugin_stage`).
- `configs/nexus-ai/stages/sdlc/*.yaml` (31 stage contracts) — the single source
  of truth for each stage's gates, `on_fail`, and `rework_route`. The engine does
  not re-derive routing; it reads what the stage-scope governance already mirrored
  from these contracts.
- `configs/nexus-ai/audit_schemas.yaml` + `configs/nexus-ai/schemas/*.json` — the
  **audit** registry the engine *references by id* for `required_evidence` /
  `required_trace` (canonical examples confirmed on disk:
  `sdlc_pipeline_evidence_schema` (type `evidence_schema`),
  `stage_gate_trace_schema` (type `trace_schema`)). The engine never defines these.
- Conceptual specs: `docs/ai-sdlc-factory/03-governance-and-audit-layering.md`
  (the 7-layer split + Evidence/Trace split), `06-governance-policy-evidence.md`
  (blocker vs advisory policies, no-self-approval matrix, approval model,
  risk-acceptance limits, anti-patterns), `19-governance-audit-readiness-plan.md`
  (§4 profile contract, §5 rule contract, §14 validation).

### 2.3 Sibling runtime/refactor plans this engine coordinates with

(All planning-only; doc 21 §5.) The governance engine does not own these
responsibilities — it **calls into / is called by** them:

- `pipeline-runner-plan.md` — invokes the engine at each gate (the runner owns
  stage transition and `on_pass`/`on_fail`/`rework_route` *execution*; the engine
  owns the *verdict and routing instruction*).
- `pipeline-run-state-model.md` — supplies the run facts the engine evaluates
  against and stores the verdicts.
- `shared-registry-loader-plan.md` — loads + validates the governance configs and
  resolves aliases before the engine consumes them.
- `audit-evidence-store-plan.md` — persists the Evidence/Trace records the engine
  requires and checks for presence.
- `tool-permission-system-plan.md` — the tool-scope specialization of the engine's
  `high_risk_action_default_deny` posture (sandbox/permission enforcement).
- `model-provider-resolver-plan.md` / `context-memory-resolver-plan.md` — supply
  the model/context governance facts the core-ability/tool layers reference.
- `executor-integration-plan.md` — how an executor surfaces the engine's verdicts
  in completion reports.

---

## 3. The seven-layer resolution model

### 3.1 Layer order (most general → most specific)

```text
1. Global         (governance/global.yaml)               — applies to everything
2. Pipeline       (governance/pipeline/<pipeline>.yaml)  — this run's pipeline
3. Team           (governance/team/<team>.yaml)          — the team owning the run
4. Stage          (governance/stage/<...>.yaml)          — the current stage
5. Core Ability   (governance/core-ability/...)          — any ability invoked at this gate
6. Skill          (governance/skill/skills.yaml)         — any skill activated at this gate
7. Tool           (governance/tool/tools.yaml)           — any tool called at this gate
```

This is exactly the layering locked in D-007 and doc 03 §2. The engine resolves
**all** applicable layers for a decision — it is **additive composition**, not
"pick one layer".

### 3.2 Resolution algorithm (declarative description — no code)

For a given **gate decision request** (pipeline_id, team_id, stage_id, gate_id,
the artifact being adjudicated, the producer, the proposed approver, and the set
of core-abilities/skills/tools invoked in producing the decision), the engine
would conceptually:

1. **Collect candidate profiles per layer.** For each of the 7 layers, select the
   profiles whose `applies_to` matches the decision context:
   - Global: always all 8 (they declare `applies_to: all_*`).
   - Pipeline: the profile(s) for `pipeline_id`.
   - Team: the profile(s) for `team_id`.
   - Stage: the profile for `stage_id` (and the gate within it).
   - Core Ability / Skill / Tool: the profile for each ability/skill/tool actually
     invoked at this gate (empty set if none invoked).
2. **Canonicalize ids via alias resolution.** Map every `*_policy` / alias
   spelling to its first-class id using
   `governance/global.yaml#registry_to_config_map.alias_resolution` (and the
   registry's `alias_resolution`). A profile referenced under two spellings is
   **one** profile, deduplicated by canonical id.
3. **Flatten to a rule set.** Expand each selected profile into its `rules[]`
   (doc 19 §5 contract). The unit of evaluation is the **rule**, not the profile.
4. **Filter by `required_when`.** Drop rules whose `required_when` predicate is
   false for this decision (e.g. a conditional gate whose applicability is false is
   *vacuously satisfied*; a tool rule when no tool was called does not apply).
5. **Evaluate each applicable rule.** Compute `pass_condition` and
   `fail_condition` against the run facts. Each rule yields `pass`, `fail`, or
   `not_applicable`. (The conditions are *declarative predicates* in the configs;
   formalizing the predicate language is itself a downstream task — see §12 OQ-1.)
6. **Check evidence/trace satisfaction per rule.** A rule's outcome is only valid
   if its `evidence_required` (Evidence-family ids) and `trace_required`
   (Trace-family ids) are present in the audit store for this decision. Missing
   required evidence ⇒ the rule **fails** (the global `evidence_required` rule
   `every_gate_decision_has_evidence`); missing required trace ⇒ the global
   `trace_required` rule fails. **Evidence and trace are checked against their own
   families only** (Evidence != Trace).
7. **Classify and aggregate by severity** (see §4).
8. **Render the verdict and routing instruction** (see §5).
9. **Emit a governance-evaluation trace** (see §6) — the engine's own evaluation
   is itself a governed, traced action (`trace_required`).

### 3.3 Layer-precedence rule: stricter wins; lower layers may only *add*, never *weaken*

Because composition is additive and the global layer contains `no_policy_bypass`,
a more-specific layer can **add** rules and **tighten** severity, but it can
**never relax or remove** a higher layer's blocking rule.

```text
effective_outcome(decision) =
    PASS  iff  every applicable rule across all 7 layers is pass-or-not_applicable
              AND no blocker rule failed
    else FAIL (if any blocker failed)
    else PASS_WITH_RECORDED_RISK (if the only failures are advisory; see §4)
```

There is **no** "override token", no precedence by which a lower layer marks a
higher-layer blocker satisfied. Any attempt to do so is itself caught by
`no_policy_bypass` (§7). This is the structural reason the engine cannot be talked
out of a verdict.

### 3.4 Worked example (illustrative; reads real configs)

Decision: *can stage `code_review` (#12) of the SDLC pipeline pass?*

- **Global**: `no_self_approval` (`producer_is_not_sole_approver`),
  `evidence_required` (`every_gate_decision_has_evidence`), `trace_required`,
  `plugin_absent`, etc. — all selected.
- **Pipeline** (`governance/pipeline/sdlc.yaml`): `sdlc_no_self_approval`,
  `sdlc_evidence_required`, `sdlc_no_blocking_policy_failure`.
- **Team** (`governance/team/sdlc.yaml`): `sdlc_developer_cannot_approve_own_code`
  (`code_review.owner_agent == code_reviewer_agent`,
  `!= engineering_agent`, reviewer did not mutate the changeset).
- **Stage** (`governance/stage/sdlc-stages.yaml`): the stage-12 profile's
  `code_review_gate` rule (pass_condition derived from the stage contract;
  `on_fail`/`rework_route` = `implementation`, per `12-code-review.yaml`).
- **Core Ability**: if `Coder` was invoked, its core-ability profile applies.
- **Skill / Tool**: any skill/tool used by the reviewer applies.

The engine flattens these, evaluates them, and (e.g.) if
`engineering_agent` is recorded as the approver of its own changeset, the team
rule and the global `no_self_approval` rule **both** fail as `blocker` ⇒ verdict
`FAIL`, routing `rework_route: implementation`, with a `governance_gate_evaluation`
trace and the failing rule ids recorded.

---

## 4. Severity handling: blocker / major / advisory (and informational)

### 4.1 Severity vocabulary (closed; from the configs)

`governance/global.yaml#severity_vocabulary` and doc 19 §5:

```text
blocker | major | advisory | informational
```

### 4.2 Per-severity engine behavior

| Severity | Engine behavior on rule FAIL | `on_fail` action vocabulary used | Can it be auto-accepted? |
|---|---|---|---|
| **blocker** | The gate **cannot pass**. Verdict = `FAIL`. The decision is halted and routed per the rule's `rework_route`. | `block_stage` / `block_release` (doc 06 §2 canonical `block_stage`) | **Never.** Doc 06 §13: critical security risk, blocker bug, missing evidence, unknown skill semantics cannot be auto-accepted. |
| **major** | Default-blocks **unless** the governance config *explicitly* declares the gate accepts an *owned* acceptance for that specific rule. Absent an explicit, owned, documented acceptance, a `major` fail is treated as blocking for the gate it guards. | `block_stage` (default) or `record_risk` only where an owned acceptance path is declared | Only with an **owner-assigned, expiring, evidence-linked** acceptance (doc 06 §13 advisory-acceptance conditions applied to the specific rule). Never silently. |
| **advisory** | Does **not** block. Verdict can be `PASS_WITH_RECORDED_RISK`. The engine writes the finding into the residual-risk set / evidence (it is *recorded*, not ignored). | `record_risk` | Yes, but **recorded**: doc 06 §4 advisory policies feed risk/evidence; doc 06 §13 requires the risk be explicit, owner-assigned, given an expiry/review date, and bound to release evidence. |
| **informational** | Non-blocking; surfaced for attention. | `flag_for_review` | n/a (no risk to accept) |

### 4.3 Aggregate verdict from a set of evaluated rules

```text
if any applicable blocker rule == fail          -> FAIL          (block_stage/block_release)
elif any applicable major rule == fail
        without an owned, documented acceptance  -> FAIL          (treated as blocking)
elif only advisory/informational fails remain    -> PASS_WITH_RECORDED_RISK
else                                             -> PASS
```

`PASS_WITH_RECORDED_RISK` is a first-class verdict so that advisory findings are
never silently dropped — they must materialize as recorded residual risk with an
owner and an expiry (doc 06 §13). The release-candidate boundary additionally
requires `residual_risk_recorded` (doc 06 §12), so unrecorded advisory debt
cannot reach a release.

### 4.4 Severity is **declared, not inferred**

The engine reads `severity` from each rule's contract field; it never *guesses* a
severity. Stage-scope conditional gates may declare `severity: major` explicitly
(the stage-governance file records this); everything else defaults to `blocker`
per the SDLC convention. This keeps severity auditable: a reviewer can trace any
blocking decision back to a declared `severity` in a named config file.

---

## 5. Verdict and routing output

For each gate decision the engine produces a **verdict record** (a structured
result the pipeline runner consumes; the *shape* is defined by the audit/evidence
layer, not here):

```text
verdict:
  decision_context: { pipeline_id, team_id, stage_id, gate_id, producer_agent_id, approver_agent_id }
  evaluated_rules:               # one entry per applicable rule
    - rule_id
      source_layer               # global|pipeline|team|stage|core_ability|skill|tool
      source_config              # e.g. governance/team/sdlc.yaml
      canonical_profile_id       # after alias resolution
      severity
      outcome                    # pass | fail | not_applicable
      evidence_satisfied         # bool (Evidence-family only)
      trace_satisfied            # bool (Trace-family only)
  aggregate: PASS | FAIL | PASS_WITH_RECORDED_RISK
  on_fail_action: block_stage | block_release | record_risk | flag_for_review | none
  rework_route: <stage_id> | originating_stage | relevant_failed_stage | none
  recorded_risks: [ ... ]        # advisory/owned-major acceptances, each with owner + expiry
  trace_ref: <governance_gate_evaluation trace id>
```

The **routing instruction** (`rework_route`) is read from the failing rule, which
in turn mirrors the **stage contract** (`configs/nexus-ai/stages/sdlc/*.yaml`) —
the engine does not invent routes. Routes are validated against the
`rework_route_vocabulary` (global) and the `routing_invariants` /
`allowed_rework_routes` in `sdlc_pipeline_runtime_rules.yaml` /
`pipeline_contract_standard.yaml`. The **pipeline runner** (separate plan)
*executes* the route; the engine only *instructs*.

---

## 6. The engine's own evaluation is governed and traced

Per the global `trace_required` profile (`every_governed_action_traced`), a policy
evaluation is itself a governed action and must emit a trace record. The engine
therefore always writes a **governance-evaluation trace** (the SDLC pipeline
governance already names `governance_gate_evaluation_trace` in
`governance/pipeline/sdlc.yaml#required_trace`). This makes the engine itself
auditable: every verdict has a trace showing which rules were selected, their
outcomes, and the resulting routing — closing the loop on "no untraced governed
action" (doc 06 §3 `no_silent_mutation` / §10 trace definition).

Note the family discipline: the evaluation trace is a **Trace-family** record; the
verdict's *evidence* requirements are satisfied by **Evidence-family** records.
The engine never lets one stand in for the other.

---

## 7. Policy-bypass prevention (doc 21 §8: "policy bypass prevention")

This is the engine's central security property. It is enforced structurally, not
by good behavior.

### 7.1 The invariant

Global profile `no_policy_bypass` (`governance/global.yaml`), rules
`no_blocking_gate_override` and `no_prompt_or_council_gate_pass`:

```text
No actor — including any *_team_lead orchestrator, an LLM council, or a prompt —
may override, skip, or force-"pass" a blocking governance gate.
A gate may not be marked pass on the basis of prompt content or an LLM/council
opinion alone, with no satisfied pass_condition + evidence.
```

Reinforced at every layer: pipeline (`sdlc_no_blocking_policy_failure`), team
(`sdlc_no_failed_gate_bypass`, `forbidden_resolution`), and the runtime
`anti_patterns` (`self_approval_gate`, `release_candidate_without_policy_gate`).

### 7.2 How the engine makes bypass *structurally impossible*

1. **No override input exists.** The engine's verdict is a pure function of
   (applicable rules) × (run facts) × (evidence/trace presence). There is no
   parameter, flag, role, or token that can set a failed blocker to "pass." The
   absence of such an input is the primary defense.
2. **Verdict precedes and gates the transition.** The pipeline runner is planned
   to call the engine and **must not** transition a stage on anything other than a
   `PASS` / `PASS_WITH_RECORDED_RISK` verdict. A `FAIL` verdict yields only a
   `rework_route`, never a forward transition.
3. **Identity-based self-approval block.** `no_self_approval` (global + every
   layer) rejects `producer_agent_id == approver_agent_id`. The fallback approver
   is the owning pipeline's `*_team_lead` — **never** Supervisor (Core Ability),
   never the producer.
4. **Team Lead has no elevated authority.** Every team profile encodes
   `cannot_override_gate: true` and lists `team_lead_override_of_failed_gate` under
   `forbidden_resolution`. The engine treats a recorded team-lead "pass" of an
   unsatisfied blocker as a *violation of `no_policy_bypass`*, i.e. a new blocker
   failure — not a successful override.
5. **LLM/council cannot pass a gate.** `no_prompt_or_council_gate_pass` requires
   `gate_pass_backed_by_satisfied_condition_and_evidence == true`. A council
   verdict with no satisfied `pass_condition` + evidence fails this rule. Council
   output may be *evidence input*, never the *gate decision*.
6. **Plugin/silent-mutation guards always on.** `plugin_absent`,
   `no_silent_mutation`, and `high_risk_action_default_deny` run on every
   decision; they cannot be deselected.
7. **Anti-patterns are invariants.** The engine treats every
   `sdlc_pipeline_runtime_rules.yaml#anti_patterns` entry as a must-never-occur
   condition; detecting one is itself a blocker.

### 7.3 Bypass-attempt handling

A detected bypass attempt is **not** a recoverable advisory: the engine emits a
`FAIL` verdict, an `on_fail` of `block_stage`/`block_release`, records a
policy-bypass-attempt trace, and escalates to `governance_owner` (the escalation
target declared in `no_policy_bypass`). It is never auto-accepted (doc 06 §13).

---

## 8. Owner-decision boundary (doc 21 §8: "owner decision boundary")

This is the **one** place where a human/owner decision is a *legitimate* gate
input — and it must be carefully separated from the autonomous self-approval the
engine forbids. Conflating the two would be a locked-decision error.

### 8.1 The distinction (locked)

```text
no_self_approval          = an AUTONOMOUS-AGENT constraint:
                            a producing AGENT may not be the sole approver of its
                            own output (producer_agent_id != approver_agent_id).

owner_activation_decision = a HUMAN/OWNER AUTHORITY gate:
                            an explicit human/owner decision record is REQUIRED
                            for a specific high-consequence transition. This is
                            NOT an agent approving itself; it is a human acting as
                            the authority the system is designed to defer to.
```

`governance/pipeline/activation.yaml` encodes exactly this: rule
`activation_owner_decision_required_for_public` enforces **both**
`owner_activation_decision_gate` (human authority) **and** `no_self_approval` (the
agent that ran the pilot cannot self-promote to public). The engine must therefore
treat an owner-decision gate as:

- **Satisfiable only by a recorded owner decision** (e.g.
  `owner_activation_decision_recorded == true`), backed by an owner-decision trace
  (`owner_decision_trace`) and evidence — not by any agent/council output.
- **Still subject to `no_self_approval` and all other blockers** — the owner gate
  *adds* a human requirement; it does not *waive* the autonomous-governance rules.
  (An owner cannot, via this gate, bypass a failed blocker either — that would be
  `no_policy_bypass`. The owner decision authorizes a transition that is
  *otherwise* permitted; it is not an override of failed governance.)

### 8.2 Where owner-decision gates legitimately appear

- **Activation pipeline** (`governance/pipeline/activation.yaml`):
  `public_activation_decision` / `owner_activation_decision_gate` — public/GA
  activation requires an owner decision. (Carried as INFO item R17(b) in the
  implementation-readiness review: confirm this human gate is *deliberately*
  permitted under the otherwise "no-human governance" framing — it is, by design,
  the bounded exception.)
- **This planning series itself** — the meta owner-decision boundary in §11.

### 8.3 What the engine must never do at an owner boundary

- Never let an **agent** stand in for the owner (that collapses the human/owner
  gate into self-approval).
- Never let a recorded owner decision **mark a failed blocker as passed**
  (that is `no_policy_bypass`).
- Never let **Supervisor** (Core Ability) act as the owner or the team-lead at an
  owner boundary (K-006).

---

## 9. Determinism, validation, and the "engine reads configs" contract

### 9.1 Determinism requirements

- **Closed vocabularies.** `severity`, `on_fail` action, and `rework_route` are
  drawn from the closed vocabularies declared in `governance/global.yaml` and the
  pipeline contract standard. The engine rejects any rule using an out-of-vocab
  value at load time (a config error, surfaced by the shared-registry loader).
- **Total functions.** Every rule has `pass_condition` AND `fail_condition` (the
  §5 contract). The engine treats a rule that is neither pass nor fail under the
  facts as `not_applicable` only when `required_when` is false; an
  *indeterminate* applicable rule is a config defect, not a silent pass.
- **No hidden state.** A verdict depends only on declared inputs; re-evaluating
  the same decision with the same facts yields the same verdict.

### 9.2 Load-time validation the engine relies on (doc 19 §14)

The shared-registry loader (separate plan) must, before the engine runs, confirm:

```text
Every governance profile declares a known scope (one of the 7).
Every rule has a severity from the closed vocabulary.
Every blocker rule has an on_fail behavior.
required_evidence references only Evidence-family ids; required_trace only Trace-family ids (never merged).
No plugin governance is introduced (plugin_absent asserts absence only).
Every alias resolves to exactly one first-class id (alias_resolution is total and unambiguous).
Every referenced audit-schema id and rework_route id exists (closes the dangling-id gaps — see §12 OQ).
```

These are exactly the self-validation invariants the Phase E config files already
assert about themselves (`self_validation` / `validation_self_check` blocks); the
engine simply refuses to run against configs that fail them.

---

## 10. Non-goals (re-stated for this engine specifically)

This plan does **not**, and the future engine described here must not be taken to:

- write or imply any runtime code (this is a plan; doc 21 §3, doc 22 §9);
- define, own, or persist audit/evidence/trace schemas (that is the audit/evidence
  store; Governance != Audit);
- own stage transition, `on_pass`/`on_fail` *execution*, or run-state persistence
  (that is the pipeline runner / run-state model);
- introduce a plugin concept, plugin governance, or plugin registry (D-002/K-001);
- convert any Core Ability into an agent, owner, approver, or team-lead, or treat
  Supervisor as a team-lead (D-003/D-004/D-006/K-003/K-004/K-006);
- merge Governance with Audit, or Evidence with Trace (D-007/D-008);
- merge Skill with Tool;
- grant any actor (team lead, council, prompt, even owner) a path to bypass a
  failed blocking gate;
- be deployed, merged to `main`, published, or claimed production-ready
  (doc 22 §9).

---

## 11. Owner-approval dependency (HARD precondition — explicit)

This plan is a **planning artifact only**. It is governed by the same stop-rule
and readiness gate as the rest of the series.

- **Upstream dependency met:** `reviews/implementation-readiness-review.md` is
  **PASS_WITH_FINDINGS with zero blocking findings**, satisfying the doc 21 §2
  precondition ("Implementation readiness review PASS or PASS_WITH_FINDINGS
  without blocking findings"). All 9 doc 22 §6 hard blockers are CLEAR.
- **This plan + its siblings** (doc 21 §5) must all exist, then be reviewed via
  `reviews/runtime-refactor-plan-review.md` (doc 21 §10; doc 22 §5).
- **The final gate is the OWNER, not this document.** Per doc 22 §6 item 10 and
  doc 22 §7, *no* implementation/refactor — and specifically **no building of the
  governance engine described here** — may begin until the owner records:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  ```

  Until that decision exists, the only permitted next step (doc 22 §8) is the
  *Runtime / Refactor Implementation Planning Handoff*, which itself is **not**
  writing code — it is preparing implementation workpackages. The alternative
  owner outcome `OWNER_DECISION: HOLD_FOR_MORE_REVIEW` keeps everything in
  planning.
- **"owner approval missing" is itself a doc 22 §6 hard blocker.** The engine
  must therefore never be materialized on the strength of this plan alone; the
  owner decision is a precondition of *any* work that turns this plan into code.

This dependency mirrors, at the meta level, the very owner-decision boundary the
engine enforces at runtime (§8): a human/owner authority gate that no autonomous
process may self-satisfy.

---

## 12. Open questions (carried into `runtime-refactor-plan-review.md`)

These are inherited, non-blocking reconciliation items relevant to the engine.
None blocks completing this *plan*; each must be resolved before the engine is
*built* (i.e., before/at the owner-approval handoff).

1. **Predicate language for `pass_condition`/`fail_condition`.** The §5 conditions
   are currently declarative prose/pseudo-predicates (e.g.
   `producer_agent_id != approver_agent_id`, `open_blocker_bug_count == 0`).
   Before any engine is built, a *formal, restricted predicate vocabulary* (over a
   named set of run-fact fields) must be specified so conditions are mechanically
   evaluable and verifiably total. **This plan deliberately stops at "declarative
   contract"; it does not design the predicate engine.**
2. **Dangling audit-schema ids the engine references.** Several `required_trace` /
   `required_evidence` tokens used by the governance layers are not yet defined as
   items in `audit_schemas.yaml` — notably `stage_gate_decision_trace`
   (review item **R2**; already flagged in `governance/global.yaml` open_questions)
   and the generic trace family `tool_call_trace_schema` /
   `model_invocation_trace_schema` / etc. plus `evidence_item_schema` (review item
   **R1**). Either register them (status: candidate) or record explicit aliases
   (e.g. `stage_gate_decision_trace` → `stage_gate_trace_schema`) so the engine's
   evidence/trace presence check resolves to real schema ids.
3. **Undefined scope-level governance profiles the engine would select.**
   `tool_call_governance`, `model_invocation_governance`, `context_access_governance`,
   `skill_must_have_semantic_extraction_before_binding`, and a few `*_governance`
   variants are referenced by sibling registries but do not yet resolve in
   `governance_profiles.yaml` (review item **R3**). Register as candidates or as
   aliases of canonical profiles so layer-2..7 selection is total.
4. **`gate_result_schema` as a first-class item.** The audit §12 type vocabulary
   lists `gate_result_schema`, but no standalone item is defined; gate outcomes
   currently ride on `related_gate` + count fields and `release_evidence_schema`
   (governance-audit-readiness-review OQ-2). Decide whether the engine's verdict
   should bind to a dedicated `gate_result_schema` (Evidence-family) or continue to
   reference existing schemas.
5. **6 SDLC required gates mapped by name, not literal `rule_id`** (review item
   **R6**). The engine's "all required gates satisfied" check would be more
   robustly machine-verifiable with an explicit `satisfies_required_gate:`
   annotation / rollup→component alias map, so the gate→rule link does not depend
   on name matching.
6. **Confirm the activation owner/human gate under "no-human governance"**
   (review item **R17(b)**). The engine's owner-decision handling (§8) assumes
   `public_activation_decision` / `owner_activation_decision_gate` is a
   *deliberately permitted* bounded human exception. Confirm this framing so the
   engine treats it as a legitimate authority gate, not a `no_self_approval` /
   `no_policy_bypass` violation.

---

## 13. Summary

The governance engine is a deterministic, config-driven resolver that composes the
seven governance layers (global → pipeline → team → stage → core-ability → skill →
tool) into a single per-gate verdict, classifies failures by the closed severity
vocabulary (blocker blocks; un-owned major blocks; advisory records risk;
informational flags), and makes policy bypass structurally impossible by having no
override input, by enforcing `no_self_approval` / `no_policy_bypass` at every
layer, and by treating any "team-lead/council/prompt passed it" as a fresh blocker.
It references — but never owns — the audit Evidence/Trace records (Evidence !=
Trace), never touches Core Abilities as agents (Supervisor != Team Lead), and
respects exactly one legitimate human input: the bounded **owner-decision
boundary**, kept strictly distinct from autonomous self-approval. Per doc 22 §6–§7,
**none of this is built until the owner records
`OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`.**
