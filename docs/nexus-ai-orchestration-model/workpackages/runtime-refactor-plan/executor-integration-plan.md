# Executor Integration — Planning-Only Plan

- **Doc id:** `runtime-refactor-plan/executor-integration-plan`
- **Phase:** G/H (runtime/refactor PLANNING). Realizes the tenth planning area in
  [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md) §4
  ("Executor integration plan") and the required output named in doc 21 §5
  (`docs/ai-sdlc-factory/runtime-refactor-plan/executor-integration-plan.md`).
- **Nature:** **PLANNING ONLY.** This document describes *how the executor environments
  (Claude Code, Codex, Antigravity) would integrate with a future Nexus AI Orchestration Model
  runtime — and with the runtime/refactor effort that builds it — under the existing executor
  workflow standard.* It does **not** implement anything. **No runtime code, no product refactor,
  no connector integration, no deploy/publish, no main-branch merge, no plugin registry**
  (doc 21 §3). Every statement below is a plan for a future way of working, not a description of
  an existing integration.
- **Status:** DRAFT — depends on the explicit owner-approval gate (see §11) before any of it may be
  acted on.

> **What makes this plan different from its nine siblings.** The other nine runtime/refactor plans
> describe *components of the runtime* (a pipeline runner, a governance engine, an audit store, …).
> This plan describes the *way those components would be built and later operated* — the
> **executor → completion report → ChatGPT review → owner approval** contract applied to runtime
> work. It is the meta-plan that says: *when the owner eventually approves implementation, here is
> the workflow each implementation workpackage follows, and here is how executors plug into the
> running system without ever becoming part of it.*

---

## 1. Objective

Plan how the three executor environments named in the executor standard integrate with the future
Nexus AI Orchestration Model, in two distinct senses that this plan keeps separate:

1. **Build-time integration (the near edge).** How a future runtime/refactor effort would be
   *carried out* by executors — i.e. the workpackage → execution → completion report → ChatGPT
   review → owner-approval flow applied to building the nine runtime components (and refactoring
   the existing product to match the blueprint). This is the workflow that, once approved, would
   produce the pipeline runner, governance engine, audit store, resolvers, and so on.
2. **Run-time integration (the far edge).** How an executor environment would relate to the system
   *once it is running* — what an executor may invoke, what it may never become, and how its
   activity is governed and audited — so that an executor stays a **tool acting on the owner's
   behalf**, never an autonomous authority and never a unit inside the team/agent hierarchy.

In both senses the integration is constrained by the same contract. This plan does not invent that
contract; it *applies* the already-locked executor standard
([`../executor-standard/README.md`](../../legacy/executor-standard/README.md), and the per-executor profiles
and completion-report schema beside it) to the runtime/refactor context. It defines the inputs,
the flow, the boundaries, the failure behavior, and the artifacts — at the level of a design
contract, not an implementation.

### 1.1 Scope

In scope (to plan):
- The build-time workpackage flow for the nine runtime/refactor components and the product
  refactor, reusing the doc 20 §4 workpackage contract and the doc 20 §5 completion-report contract.
- The division of build-time labor across Claude Code / Codex / Antigravity per their profiles.
- The run-time relationship between an executor environment and the running system: invocation
  surface, governance/audit treatment, and the hard boundaries (executor ≠ agent, executor ≠ owner,
  executor ≠ reviewer).
- The explicit owner-approval dependency that gates the transition from "authoring these plans"
  (allowed) to "executing any of them" (not allowed) — restated and made load-bearing in §11.

Out of scope (planned elsewhere or out of phase):
- The runtime components themselves — pipeline runner
  ([`pipeline-runner-plan.md`](./pipeline-runner-plan.md)), run-state model
  ([`pipeline-run-state-model.md`](./pipeline-run-state-model.md)), shared-registry loader
  ([`shared-registry-loader-plan.md`](./shared-registry-loader-plan.md)), governance engine
  ([`governance-engine-plan.md`](./governance-engine-plan.md)), audit/evidence store
  ([`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md)), tool-permission system
  ([`tool-permission-system-plan.md`](./tool-permission-system-plan.md)), model/provider resolver
  ([`model-provider-resolver-plan.md`](./model-provider-resolver-plan.md)), context/memory resolver
  ([`context-memory-resolver-plan.md`](./context-memory-resolver-plan.md)), and Core Abilities
  alignment ([`core-abilities-alignment.md`](./core-abilities-alignment.md)). This plan integrates
  *with* them; it does not design them.
- The team/agent/sub-agent runtime behavior. Executors are not in that hierarchy (§2); the team
  catalogs are referenced only to draw the boundary, not to extend it.
- Any actual connector wiring to a Claude Code / Codex / Antigravity environment. Integration
  points may be **named** here; none is **connected** (doc 21 §3 non-goal 3).

---

## 2. The one boundary this plan must never blur: Executor vs Agent (and vs Reviewer, vs Owner)

This is the single most important constraint in the whole plan. An **executor environment** is not
an **Agent** in the Nexus AI team model, it is not the **reviewer**, and it is not the **owner**.
These are locked separations carried from the executor standard
([`../executor-standard/README.md`](../../legacy/executor-standard/README.md) §2) and the team/agent model
([`../04-team-agent-subagent-model.md`](../../legacy/04-team-agent-subagent-model.md);
[`../00-decision-log.md`](../../legacy/00-decision-log.md) K-005).

| | **Executor environment** (Claude Code / Codex / Antigravity) | **Agent** (team/agent hierarchy) |
|---|---|---|
| What it is | A **tool/workbench that acts on the owner's behalf** to produce artifacts and, eventually, runtime. | A **role inside a Team** that owns and executes a pipeline stage. |
| Defined by | [`../executor-standard/`](../../legacy/executor-standard/README.md) (the workflow standard + per-executor profiles). | [`../../../configs/nexus-ai/agent_roles.yaml`](../../../../configs/nexus-ai/agent_roles.yaml), under a `team_lead` in [`../../../configs/nexus-ai/team_templates.yaml`](../../../../configs/nexus-ai/team_templates.yaml). |
| Authority | None over decisions. Produces a completion report and **waits** at the review gate. | Owns its stage's output; still cannot self-approve, cannot mutate a reviewed artifact, cannot bypass a gate. |
| Relationship to runtime | **External** — drives or invokes the runtime from outside; is never a node *inside* a Pipeline Run. | **Internal** — is the runtime actor a stage activation resolves to. |

**Integration rules that enforce the boundary (plan-level):**

1. **An executor is never registered as an Agent, Team Lead, Sub-agent, Core Ability, Skill, or
   Tool.** It does not appear in `agent_roles.yaml`, `team_lead_roles.yaml`, `sub_agent_roles.yaml`,
   `team_templates.yaml`, `core_abilities.yaml`, `skills_registry.yaml`, or `tools_registry.yaml`.
   "Claude Code", "Codex", "Antigravity" are **environment** names, not roster entries. (This is why
   the Phase D catalogs contain none of them, and why the implementation-readiness review's
   Core-Ability-as-Agent scan would equally reject an executor masquerading as an agent.)
2. **An executor never occupies the reviewer or owner seat** (doc 20 §2). It authors; ChatGPT
   reviews; the owner decides. A `PASS` an executor writes about its *own* output is not a verdict;
   the verdict is the ChatGPT review, and the authorization is the owner decision (§11).
3. **Executor ≠ Supervisor Core Ability.** The Supervisor Core Ability
   ([`../../../configs/nexus-ai/core_abilities.yaml`](../../../../configs/nexus-ai/core_abilities.yaml),
   `never_agent: true`, `never_team_lead: true`) orchestrates *capability* inside the model; an
   executor orchestrates *artifact production* from outside. Naming one as the other is a blocking
   finding, not a convenience.
4. **Build-time and run-time stay distinct.** When an executor *builds* a component it is the
   producer of an artifact reviewed by ChatGPT and approved by the owner. When an executor
   *invokes* a running pipeline it is an external caller bounded by the tool-permission system and
   the governance engine. The two roles never collapse into "the executor runs the company."
5. **Plugin stays cancelled, forever.** No executor is integrated *as* a plugin, *through* a plugin
   registry, or by reintroducing any plugin concept (K-001). There is no executor-plugin, no
   executor marketplace, no executor lifecycle registry.

---

## 3. Inputs this integration consumes (plan)

All inputs already exist as blueprint artifacts; the integration reads/obeys them, it does not own
them.

1. **The executor workflow standard** — [`../executor-standard/README.md`](../../legacy/executor-standard/README.md)
   (the five roles §2, the workpackage flow + review gate §3, the global forbidden actions §4, the
   artifact rules §5, the owner-approval boundary §6) and the per-executor profiles beside it:
   [`../executor-standard/claude-code.md`](../../legacy/executor-standard/claude-code.md),
   [`../executor-standard/codex.md`](../../legacy/executor-standard/codex.md),
   [`../executor-standard/antigravity.md`](../../legacy/executor-standard/antigravity.md). This is the rule
   source; the integration evaluates it, it does not rewrite it.
2. **The machine-readable workpackage + completion-report schema** —
   [`../executor-standard/completion-report-schema.md`](../../legacy/executor-standard/completion-report-schema.md):
   the workpackage contract (doc 20 §4), the completion-report contract (doc 20 §5), the locked
   `status` vocabulary (`PASS` / `PASS_WITH_FINDINGS` / `BLOCKED`), the `needs_chatgpt_review` flag,
   and the four-condition review gate (doc 20 §7). Every runtime/refactor workpackage is issued and
   closed in this exact shape.
3. **The nine sibling runtime/refactor plans** — the doc 21 §5 plan set
   ([`README.md`](./README.md) §3) that this workflow would *execute* once approved. They are the
   `objective` / `canonical_sources` inputs of the future implementation workpackages; this plan
   does not duplicate their content, it points at them.
4. **The readiness gate** — [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md)
   §4 (execution-complete criteria, which explicitly lists "Executor workflow standard outputs"),
   §5 (required review verdicts), §6 (hard blockers), §7 (owner decision), §8 (allowed next phase),
   §9 (prohibited until approval). This is the authority for §11.
5. **The precondition review** — [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
   (verdict **PASS_WITH_FINDINGS**; 9/9 doc 22 §6 hard blockers CLEAR; item 10 owner approval the
   pending final gate). It cleared the corpus to begin *planning*; it authorizes no transition.
6. **The Phase F review of the standard itself** — [`../reviews/executor-standard-review.md`](../../reviews/executor-standard-review.md)
   (verdict **PASS_WITH_FINDINGS**, no blocking findings): evidence that the executor standard this
   plan builds on is itself reviewed and sound.
7. **The team/agent catalogs (boundary reference only)** —
   [`../../../configs/nexus-ai/agent_roles.yaml`](../../../../configs/nexus-ai/agent_roles.yaml),
   [`../../../configs/nexus-ai/team_lead_roles.yaml`](../../../../configs/nexus-ai/team_lead_roles.yaml),
   [`../../../configs/nexus-ai/sub_agent_roles.yaml`](../../../../configs/nexus-ai/sub_agent_roles.yaml),
   [`../../../configs/nexus-ai/team_templates.yaml`](../../../../configs/nexus-ai/team_templates.yaml).
   Read **only** to confirm the executor names are absent and must stay absent (§2 rule 1).
8. **The run-time authorities an invoking executor would obey** — the tool-permission system
   ([`tool-permission-system-plan.md`](./tool-permission-system-plan.md)) and the governance engine
   ([`governance-engine-plan.md`](./governance-engine-plan.md)), which decide what any caller may do,
   and the audit/evidence store ([`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md)),
   which records what it did.

---

## 4. Outputs this integration produces (plan)

There are two output families, matching the two integration senses in §1.

**Build-time outputs (per implementation workpackage):**
- A **runtime/refactor workpackage** (doc 20 §4 shape) issued by the plan owner to **one** executor
  and **one** reviewer, naming the `objective`, `mandatory_context`, `canonical_sources` (the
  relevant sibling plan + the registries it reads), `required_outputs`, `required_validations`,
  `forbidden_actions` (doc 20 §6 + doc 22 §6 inherited at minimum), and the
  `completion_report_format`.
- A **completion report** (doc 20 §5 shape) returned by that executor: `status`
  (`PASS` / `PASS_WITH_FINDINGS` / `BLOCKED`), `files_created` / `files_modified` listing **every**
  artifact touched, `validation_summary`, `blocking_findings` / `major_findings` / `minor_findings`,
  `open_questions` (kept separate from decisions), `needs_chatgpt_review: true`.
- The **artifacts the workpackage was for** — runtime code, refactored product files, tests,
  config — written to repo files on the working branch (never `main`), referenced in the report.
  *These artifacts are produced only after the §11 owner approval; this plan authorizes none of them.*

**Run-time outputs (when an executor invokes the running system):**
- An **invocation request** from the executor environment to the runtime, carried through the
  tool-permission system and authorized by the governance engine — never a privileged side-channel.
- A **trace** of that invocation written to the audit store (Trace ≠ Evidence): *which executor
  invoked what, when, under which authorization, with which result.* The executor does not mint
  evidence items; it produces traces of its own actions, consistent with the audit plan's
  Trace-vs-Evidence split.

Both families share one rule from doc 20 §8: **long outputs live in repo files, not chat**, and
every produced/changed file is referenced in the report. Nothing is asserted as "done in the
background."

---

## 5. Integration flow (the contract applied — described, not coded)

### 5.1 Build-time flow (one runtime/refactor workpackage)

This is the doc 20 §3 flow, instantiated for runtime/refactor work. It runs **per component / per
refactor unit**, and only after the §11 owner approval:

1. **Issue the workpackage.** The plan owner (ChatGPT) writes the doc 20 §4 contract for one unit of
   work — e.g. "implement the pipeline runner per
   [`pipeline-runner-plan.md`](./pipeline-runner-plan.md)" — choosing the executor by profile (§6) and
   naming a reviewer that is **not** the executor (no self-approval).
2. **Load mandatory context + lock check.** The executor loads `mandatory_context` and
   `canonical_sources` and confirms nothing conflicts with the locked decisions (plugin not
   reintroduced; no Core Ability treated as an Agent; Supervisor ≠ SDLC Team Lead; Shared Registry +
   Usage Mapping intact). A conflict → **BLOCKED** report, stop — exactly the
   [`../execution/phase-0-context-lock-report.md`](../../reviews/phase-0-context-lock-report.md)
   pattern.
3. **Execute.** The executor produces `required_outputs` as repo files on the working branch and
   runs `required_validations` (for runtime code these would be real tests/build checks; for config
   they remain the static schema/consistency checks Codex already runs). It records assumptions
   explicitly and keeps open questions separate from decisions.
4. **Return the completion report.** The executor emits exactly one doc 20 §5 report, listing every
   created/modified file, classifying findings by severity, and setting `needs_chatgpt_review: true`.
   Any forbidden-action demand is declined and surfaced as a `blocking_finding`, not performed.
5. **ChatGPT review.** The reviewer issues a verdict (`PASS` / `PASS_WITH_FINDINGS` / `BLOCKED`). A
   `BLOCKED` verdict or any unresolved blocking finding routes back through the rework loop; it never
   advances.
6. **Owner gate.** Even a clean review does **not**, on its own, authorize the *next* unit or the
   transition into production. The phase-level owner decision (§11; doc 22 §7) governs the move from
   planning into implementation/refactor as a whole.

The order is invariant: **issue → context-lock → execute → report → review → owner gate.** It is the
same loop Phases A–E ran to produce this very blueprint (§9), now pointed at runtime/refactor work
instead of documents.

### 5.2 Run-time flow (an executor invokes the running system)

Once a runtime exists (post-approval), an executor environment that needs to drive it does so as an
**external caller**, not as an internal actor:

1. **Request, don't reach in.** The executor issues an invocation request through the defined
   surface (the tool-permission system,
   [`tool-permission-system-plan.md`](./tool-permission-system-plan.md)) — it does not bypass
   permissions or call a Core Ability / Tool directly out of band.
2. **Governance authorizes.** The governance engine
   ([`governance-engine-plan.md`](./governance-engine-plan.md)) decides whether the invocation is
   permitted, applying blocker/major/advisory severity; a **blocker** denies it. The executor obeys;
   it never overrides a governance verdict (`no_policy_bypass`).
3. **Audit records.** The invocation and its outcome are written as a **trace** to the audit store
   ([`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md)). The executor's action is
   auditable as an operation; it is not laundered into evidence.
4. **No authority creep.** The executor cannot, through invocation, approve a gate, merge anything,
   deploy, publish, or stand in for the owner. The run-time surface grants *use*, never *authority*.

---

## 6. Per-executor division of build-time labor (plan)

The executor roster (doc 20 §3) divides runtime/refactor labor by environment strength, exactly as
their profiles already define. This plan assigns the nine sibling plans (and the refactor) to the
profile best suited, without changing any profile.

| Executor | Profile | Runtime/refactor build-time focus (illustrative; gated by §11) |
|---|---|---|
| **Claude Code** | [`../executor-standard/claude-code.md`](../../legacy/executor-standard/claude-code.md) | Primary implementer of component logic, refactor edits, and the accompanying docs/tests — the same primary-executor role it held for Phases A–E, now producing code instead of contracts. |
| **Codex** | [`../executor-standard/codex.md`](../../legacy/executor-standard/codex.md) | Repo-oriented contract/schema generation and **static validation** for the runtime config surface (schemas the runner/governance/audit components consume). *Codex generates and checks contracts; it does not run them* — and validation stays static, never pipeline execution. |
| **Antigravity** | [`../executor-standard/antigravity.md`](../../legacy/executor-standard/antigravity.md) | Assembly, diagrams, and the traceability overview kept in sync as the runtime takes shape — a **view** over the implemented system, never new contract semantics. |
| **ChatGPT** | (reviewer role) | Reviews every completion report; issues the verdict; owns the plan. Does **not** execute and does **not** approve transitions. |
| **Owner** | (decision role) | The only authority that approves the transition out of planning (§11). |

Constraint carried into every assignment: the executor stays a tool. None of these assignments
promotes an executor into a team/agent role (§2), and none is acted on before §11.

---

## 7. Relationship to the governance engine (plan)

Executor integration is **subject to** governance, in both senses:

- **Build-time:** the workpackage's `forbidden_actions` are the executor-facing edge of governance —
  they inherit the doc 20 §6 global prohibitions and the doc 22 §6 hard blockers. An executor that is
  asked to cross one declines and raises a `blocking_finding`; it does not negotiate the policy.
- **Run-time:** an invoking executor is just another caller the governance engine
  ([`governance-engine-plan.md`](./governance-engine-plan.md)) evaluates across the seven layers
  (Global / Pipeline / Team / Stage / Core Ability / Skill / Tool). A **blocker** verdict denies the
  invocation; **major/advisory** verdicts are recorded but do not by themselves block (subject to the
  engine's rules). The executor never overrides a verdict and never bypasses a gate.

Governance ≠ Audit (locked): the engine *decides*, the audit store (§8) *records*. The executor
touches both but conflates neither, and it is the *subject* of both — never the author of the policy
or the keeper of the record.

---

## 8. Relationship to the audit / evidence store (plan)

- Both build-time completion reports and run-time invocations are auditable. The completion report
  is itself the build-time record (every file referenced — doc 20 §8); run-time invocations emit a
  **trace** to the audit store ([`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md)).
- **Trace ≠ Evidence** (locked, K-008). An executor writes **traces** of *what it did* (operation
  history). It does **not** mint evidence items; producing evidence is the stages'/agents' job inside
  a run. An executor may *read* evidence where permitted, but never authors it by acting.
- The owner decision that authorizes a transition is itself recorded as a **decision record** in the
  audit store (the audit plan's decision-record family), so the §11 gate is provable, not implied.
- No hidden background work (doc 20 §8): what the audit store shows is what the executor did; nothing
  more is asserted.

---

## 9. Worked example — Phases A–E were already this exact integration (build-time)

This plan is not aspirational. **Phases A–E of this blueprint were executor integration in the
build-time sense**, run end to end, and are the canonical reference (see
[`../executor-standard/README.md`](../../legacy/executor-standard/README.md) §7 and the per-executor profiles'
worked examples):

- Claude Code generated the 31 SDLC stage contracts, the 6 JSON schemas, the 7 shared registries,
  the pipeline catalog, the team/agent catalogs, and the governance/audit configs — each as a
  workpackage, each returning a completion report with `PASS` or `PASS_WITH_FINDINGS`, findings
  carried forward.
- Codex-class work (schema generation + static consistency validation) and Antigravity-class work
  (`BLUEPRINT_INDEX.md`, `TRACEABILITY_OVERVIEW.md`, the `diagrams/*.mmd`) followed the same loop.
- ChatGPT reviewed (the corpus under [`../reviews/`](../../../ai-sdlc-factory/reviews)); **no** executor wrote to `main`,
  merged, deployed, or claimed production readiness; the owner-approval boundary sat downstream of
  every phase.

The runtime/refactor build-time flow (§5.1) is **the same loop pointed at code instead of
documents.** The only thing that changes after §11 approval is the *kind* of artifact produced
(runtime/refactor outputs rather than blueprint files); the contract — workpackage → completion
report → ChatGPT review → owner approval — is identical and already proven.

---

## 10. Dependencies on other runtime-refactor plans and open reconciliation debt

**Sibling plans this integration depends on / coordinates** (all doc 21 §5 outputs; none may be
built yet):
- All nine component plans (§1.1 *Out of scope*) — they are the `objective` of the future
  implementation workpackages this flow would issue.
- [`governance-engine-plan.md`](./governance-engine-plan.md) — the authority an invoking executor
  obeys at run-time, and the source of the `forbidden_actions` edge at build-time (§7).
- [`tool-permission-system-plan.md`](./tool-permission-system-plan.md) — the run-time invocation
  surface an executor uses (§5.2); Skill ≠ Tool is preserved through it.
- [`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md) — where build-time reports'
  decision records and run-time invocation traces are persisted (§8); Trace ≠ Evidence preserved.

**Open reconciliation debt this integration inherits** (non-blocking; to be resolved before any
materialization):
- **Build-time vs run-time invocation surface for executors is named here but not specified.** The
  exact mechanism by which Claude Code / Codex / Antigravity would call a running pipeline is
  deferred to the tool-permission system plan and the eventual implementation; this plan only fixes
  that it must go *through* permissions and governance, never around them.
- **Reviewer assignment for runtime code review.** doc 20 keeps the reviewer ≠ executor rule, but
  whether ChatGPT alone reviews runtime code or a designated additional reviewer is added is an open
  question for the runtime/refactor review and the owner — recorded, not decided here.
- **`needs_chatgpt_review: false` edge case.** The completion-report schema permits it only when the
  workpackage's reviewer is explicitly *not* ChatGPT and the owner has accepted that reviewer; whether
  any runtime/refactor workpackage uses that path is left to the owner at handoff.
- **Refactor sequencing vs build sequencing.** The order in which existing product structures are
  refactored relative to building the nine new components is a planning-handoff decision (doc 22 §8),
  not fixed here.

These are recorded as risks to carry forward; **none authorizes any build.**

---

## 11. Owner-approval dependency (explicit)

This plan is gated. Per [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md)
§2/§10/§11 and [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md)
§6/§7, and consistent with the [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
verdict (PASS_WITH_FINDINGS; item 10 owner approval **pending** as the final gate):

1. **Producing this plan is allowed now.** It is a planning-only document and changes no code. It is
   itself a documentation workpackage under the very standard it describes
   ([`../executor-standard/README.md`](../../legacy/executor-standard/README.md) §1).
2. **Acting on this integration is NOT allowed** — neither issuing a runtime/refactor *implementation*
   workpackage nor invoking any running system — until **all four** review-gate conditions hold
   (doc 20 §7) at the program level:
   - all ten runtime/refactor plan docs (doc 21 §5) exist, **and**
   - [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md) exists
     with a `PASS` / `PASS_WITH_FINDINGS` verdict and **no blocking finding** (doc 21 §10; doc 22 §5),
     **and**
   - the doc 22 §6 hard blockers are all absent, **and**
   - the human owner **explicitly** approves the transition — the
     `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` gate named in doc 22 §7. The only other
     legal value is `OWNER_DECISION: HOLD_FOR_MORE_REVIEW`.
3. **The owner-approval dependency is structural to this plan, not incidental.** Because this is the
   *workflow* plan, the owner gate is not just a precondition for building components — it is **the
   step the workflow itself stops at**. No executor advances past its completion report; ChatGPT's
   `PASS` clears the *review*, not the *transition*; only the owner authorizes the move out of
   planning. An executor that proceeds without that decision has violated the standard (doc 20 §6:
   *substitute for owner approval* is a global forbidden action).
4. **Even on `APPROVE`, the next phase is planning, not code.** doc 22 §8 permits only the
   *Runtime / Refactor Implementation Planning Handoff* — preparing implementation workpackages — not
   writing product code. Until that owner decision is recorded, everything in doc 22 §9 stays
   prohibited: runtime code change, product refactor, connector integration, Nexus publish, deploy,
   `main` merge, production-readiness claim.

**The owner-approval gate is a hard precondition for both build-time implementation and run-time
invocation, and it is not satisfied by this document or by any review.**

---

## 12. Exit criteria for this plan (doc-level)

- [x] This file exists at `docs/ai-sdlc-factory/runtime-refactor-plan/executor-integration-plan.md`.
- [x] It is planning-only: no code, no runtime change, no merge, no deploy, no connector, no plugin.
- [x] It keeps the Executor ≠ Agent (and ≠ Reviewer, ≠ Owner, ≠ Supervisor) boundary explicit and
      enforced (§2).
- [x] It preserves the workpackage → completion report → ChatGPT review → owner-approval flow from
      the executor standard, applied to runtime/refactor work (§5), with no self-approval (§5.1,
      §6).
- [x] It covers integration in **both** senses — build-time (how executors build the runtime) and
      run-time (how an executor invokes the running system) — and keeps them distinct (§1, §4, §5).
- [x] It references the concrete blueprint artifacts it builds on — the executor standard and its
      profiles, the completion-report schema, the nine sibling plans, the readiness gate, and the
      precondition reviews (§3, §10).
- [x] It makes the owner-approval dependency explicit and load-bearing (§11).
- [ ] Folded into [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md)
      once all ten plan docs are written (doc 21 §10) — **out of scope for this single doc.**

---

*Documentation / blueprint only. No runtime code, no product refactor, no connector integration, no
deploy/publish, no `main` merge, no plugin registry. This plan describes how executors would
integrate with a future runtime; authoring it changed no code and authorized nothing. No part of it
is acted on until the doc 22 readiness gate is satisfied and the owner explicitly approves the
transition.*
