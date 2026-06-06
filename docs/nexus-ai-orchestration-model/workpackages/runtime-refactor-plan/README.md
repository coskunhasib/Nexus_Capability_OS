# Runtime / Refactor Plan — Overview

How a future Nexus AI Orchestration Model **runtime** would be built and how the existing
product would be **refactored** to match the locked blueprint — described as *plans only*. This
is the index for the runtime/refactor plan set. **Every document in this set is a PLAN. None of
them implements anything.** They describe *how* a runtime/refactor would work; they do not write
runtime code, refactor any product, integrate any connector, deploy/publish, merge to `main`, or
reintroduce a plugin registry. This is documentation/blueprint only.

- **Phase:** G/H (doc 21 — [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md))
- **Canonical sources:** doc 21 (planning-only plan — objective, non-goals §3, planning areas §4, required outputs §5, per-plan requirements §6–§9), [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md) (the readiness gate and owner-decision boundary), [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md) (the precondition review, verdict **PASS_WITH_FINDINGS**)
- **Locked boundaries (carried in every plan):** Plugin yok · Pipeline != Team · Agent != Core Ability · Team Lead != Supervisor · Skill != Tool · Governance != Audit · Evidence != Trace
- **Status of this layer:** the plan set is being authored; **no implementation or refactor is authorized.** The transition out of planning is gated by doc 22 **plus an explicit owner decision** (see §1 and §5 below). Until that decision lands, every plan here stays on paper.

> These are **plans for a runtime, not a runtime.** A reader should be able to take any document
> in this set as a specification for a *future* implementation workpackage — and at the same time
> see that authoring the plan changed no code, touched no product, and authorized nothing. The
> behavior these plans describe is downstream of an owner approval that has **not** been given.

---

## 1. The owner-approval dependency — read this first

**No document in this set may be executed until the owner explicitly approves the transition out
of planning.** This is the single hardest constraint on the whole set and it is stated up front so
it cannot be missed.

Authoring these plans is permitted now (it is documentation under the executor standard,
[`../executor-standard/README.md`](../../legacy/executor-standard/README.md)). **Acting on them is not.**
The boundary is owned by [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md):

- doc 22 §7 requires an explicit owner decision before implementation/refactor begins, in the form:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  or
  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
  ```

- Even on `APPROVE`, the **next** phase is *Runtime / Refactor Implementation Planning Handoff*
  (doc 22 §8) — preparing implementation workpackages — **not** writing code.
- Until that decision lands, the following stay **prohibited** (doc 22 §9): runtime code change,
  product refactor, connector integration, Nexus publish, deploy, `main` merge, production-readiness
  claim. doc 22 §6 also lists hard blockers (e.g. a reintroduced plugin registry, a Core Ability
  treated as an Agent, a missing owner approval) that block the transition outright.

As of this set, item 10 of the doc 22 §6 checklist — **owner approval** — is the pending final
gate. The [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
cleared hard-blocker items 1–9 and returned **PASS_WITH_FINDINGS**, but explicitly did **not**
authorize any transition; it only assessed readiness to begin *planning*. The plan set is the
output of that planning step. **Owner approval is required before any of it is executed.**

> **Net statement:** *Authoring these plans is allowed. Executing any of them is not — not until
> the doc 22 readiness gate is satisfied and the owner explicitly approves the transition.*

---

## 2. Non-goals (doc 21 §3)

This phase, and every document in this set, is bound by the doc 21 §3 non-goals. None of these is
done here, and no plan here authorizes doing them — each plan describes a *future* capability whose
execution is gated by §1.

| # | Non-goal (prohibited in this phase) | What that means for this set |
|---|--------------------------------------|------------------------------|
| 1 | **runtime code change** | No plan writes, edits, or ships runtime code. Plans specify behavior; they do not implement it. |
| 2 | **product refactor** | No existing product structure (agents, core abilities, teams, connectors) is altered. Refactor is described as a future step, gated by §1. |
| 3 | **connector integration** | No connector is wired up. Integration points may be *named* in a plan, never *connected*. |
| 4 | **deploy / publish** | Nothing is deployed or published. No Nexus publish flow is opened. |
| 5 | **main branch merge** | Nothing in this set is merged to `main`. The `nexus` branch is documentation-only. |
| 6 | **plugin registry** | Plugin is cancelled (locked decision). No plan reintroduces a plugin registry; doing so is a doc 22 §6 hard blocker. |

These mirror the global forbidden actions in the executor standard
([`../executor-standard/README.md`](../../legacy/executor-standard/README.md) §4) and the doc 22 §9
prohibitions. They hold regardless of how detailed a plan becomes.

---

## 3. The ten plans (doc 21 §5)

The plan set is this overview plus the **ten** plan documents required by doc 21 §5. Each is a
PLANNING-ONLY specification for one runtime/refactor concern — *how* it would work, not an
implementation of it. One-line scope per plan:

| # | Document | Scope (planning only) |
|---|----------|------------------------|
| 1 | [`core-abilities-alignment.md`](./core-abilities-alignment.md) | How the 8 Core Abilities [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] keep their canonical names, stay **non-agents**, and each get their own model/provider/tool/governance/audit binding (doc 21 §6). |
| 2 | [`pipeline-runner-plan.md`](./pipeline-runner-plan.md) | How a pipeline runner would load a Pipeline Definition, create a Pipeline Run, handle stage transitions, evaluate `on_pass`/`on_fail`/`rework_route` and conditional gates, and track status (doc 21 §7). |
| 3 | [`pipeline-run-state-model.md`](./pipeline-run-state-model.md) | How a Pipeline Run's state would be modeled — per-stage status, gate results, transition history — distinct from the static Pipeline Definition. |
| 4 | [`shared-registry-loader-plan.md`](./shared-registry-loader-plan.md) | How the 7 shared registries (Core Abilities, Skills, Tools, Governance Profiles, Audit Schemas, Model/Provider Profiles, Context/Memory Profiles) would be loaded and resolved at runtime under the Shared Registry + Usage Mapping rule. |
| 5 | [`governance-engine-plan.md`](./governance-engine-plan.md) | How governance would be resolved across the 7 layers (Global/Pipeline/Team/Stage/Core Ability/Skill/Tool), with blocker/major/advisory severity handling, policy-bypass prevention, and the owner decision boundary (doc 21 §8). |
| 6 | [`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md) | How an audit/evidence store would persist evidence items, trace items, and decision records, link them to the artifact registry, and generate release evidence bundles — keeping Evidence != Trace (doc 21 §9). |
| 7 | [`tool-permission-system-plan.md`](./tool-permission-system-plan.md) | How tool permissions would be enforced at runtime — which Core Ability / agent / stage may invoke which tool — keeping Skill != Tool. |
| 8 | [`model-provider-resolver-plan.md`](./model-provider-resolver-plan.md) | How a model/provider profile would be resolved for a given Core Ability / stage / run from the model_provider_profiles registry. |
| 9 | [`context-memory-resolver-plan.md`](./context-memory-resolver-plan.md) | How a context/memory profile would be resolved and applied per Core Ability / stage / run from the context_memory_profiles registry. |
| 10 | [`executor-integration-plan.md`](./executor-integration-plan.md) | How executor environments (Claude Code, Codex, Antigravity) would integrate with the runtime under the executor workflow standard, preserving the workpackage → completion report → review → owner-approval flow. |

doc 21 §5 lists all ten paths plus this `README.md`. The set is complete when all ten plan docs
exist; doc 21 §11 then requires the review at
[`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md) and an
explicit owner approval (§1) before anything is executed.

---

## 4. Blueprint artifacts these plans build on

These plans are not new design from scratch — each one is a *runtime reading* of an existing,
locked blueprint artifact. The plans reference these concrete inputs; they do not modify them.

| Concern | Plan(s) | Concrete blueprint artifact it builds on |
|---------|---------|-------------------------------------------|
| Core Abilities | 1 | [`../../../configs/nexus-ai/core_abilities.yaml`](../../../../configs/nexus-ai/core_abilities.yaml) (8 abilities, `never_agent: true`) + governance layer [`../../../configs/nexus-ai/governance/core-ability/`](../../../../configs/nexus-ai/governance/core-ability) |
| Pipeline runner + run state | 2, 3 | [`../../../configs/nexus-ai/sdlc_pipeline.yaml`](../../../../configs/nexus-ai/sdlc_pipeline.yaml), [`../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`](../../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml), the **31** SDLC stage contracts under [`../../../configs/nexus-ai/stages/sdlc/`](../../../../configs/nexus-ai/stages/sdlc/README.md), and schemas `pipeline_definition.schema.json` / `pipeline_run.schema.json` / `stage_contract.schema.json` under [`../../../configs/nexus-ai/schemas/`](../../../../configs/nexus-ai/schemas) |
| Pipeline catalog | 2 | [`../../../configs/nexus-ai/pipeline_catalog.yaml`](../../../../configs/nexus-ai/pipeline_catalog.yaml) + [`../pipeline-catalog/`](../../legacy/pipeline-catalog/README.md) (SDLC is one pipeline among peers) |
| Shared registry loader | 4 | the 7 shared registries: `core_abilities`, `skills_registry`, `tools_registry`, `governance_profiles`, `audit_schemas`, `model_provider_profiles`, `context_memory_profiles` under [`../../../configs/nexus-ai/`](../../../../configs/nexus-ai) |
| Governance engine | 5 | the 7 governance layers under [`../../../configs/nexus-ai/governance/`](../../../../configs/nexus-ai/governance) (`global.yaml` + pipeline/team/stage/core-ability/skill/tool) + [`../../../configs/nexus-ai/governance_profiles.yaml`](../../../../configs/nexus-ai/governance_profiles.yaml) |
| Audit / evidence store | 6 | [`../../../configs/nexus-ai/audit_schemas.yaml`](../../../../configs/nexus-ai/audit_schemas.yaml), the two audit dirs [`../../../configs/nexus-ai/audit/evidence_schemas/`](../../../../configs/nexus-ai/audit/evidence_schemas) and [`../../../configs/nexus-ai/audit/trace_schemas/`](../../../../configs/nexus-ai/audit/trace_schemas), schemas `evidence_item.schema.json` / `trace_item.schema.json` / `artifact_registry.schema.json`, and [`../../../configs/nexus-ai/artifact_registry.yaml`](../../../../configs/nexus-ai/artifact_registry.yaml) |
| Tool permissions | 7 | [`../../../configs/nexus-ai/tools_registry.yaml`](../../../../configs/nexus-ai/tools_registry.yaml) + governance layer [`../../../configs/nexus-ai/governance/tool/`](../../../../configs/nexus-ai/governance/tool) |
| Model / provider resolver | 8 | [`../../../configs/nexus-ai/model_provider_profiles.yaml`](../../../../configs/nexus-ai/model_provider_profiles.yaml) |
| Context / memory resolver | 9 | [`../../../configs/nexus-ai/context_memory_profiles.yaml`](../../../../configs/nexus-ai/context_memory_profiles.yaml) |
| Executor integration | 10 | [`../executor-standard/`](../../legacy/executor-standard/README.md) (the workflow standard, completion-report schema) + the team/agent catalogs [`../../../configs/nexus-ai/team_templates.yaml`](../../../../configs/nexus-ai/team_templates.yaml), `team_lead_roles.yaml`, `agent_roles.yaml`, `sub_agent_roles.yaml` |

Cross-cutting context for every plan: the locked decisions in
[`../00-decision-log.md`](../../legacy/00-decision-log.md), the operating model in
[`../05-pipeline-model.md`](../../legacy/05-pipeline-model.md), the blueprint index
[`../BLUEPRINT_INDEX.md`](../../INDEX.md), and the traceability overview
[`../TRACEABILITY_OVERVIEW.md`](../../legacy/TRACEABILITY_OVERVIEW.md).

---

## 5. Exit criteria for this layer (doc 21 §11)

The plan set is *planning-complete* — **not** execution-authorized — when all of the following
hold:

- **All ten plan docs exist** (§3) alongside this overview (doc 21 §5).
- **No code changed** and **no runtime implementation started** while authoring them (doc 21 §11
  / §2 non-goals).
- **A review verdict exists** at [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md)
  (doc 21 §10), `PASS` or `PASS_WITH_FINDINGS` with no blocking findings (doc 22 §5).
- **The owner explicitly approves the next phase** (doc 21 §11 final criterion; doc 22 §7) — the
  hard dependency restated in §1. Without it, nothing in this set advances.

Only after that owner decision does doc 22 §8 permit the *Runtime / Refactor Implementation
Planning Handoff* — and even that prepares implementation workpackages rather than writing code.

---

*Documentation / blueprint only. No runtime code, no product refactor, no connector integration,
no deploy/publish, no `main` merge, no plugin registry. Every document in this set is a plan. No
plan is executed until the doc 22 readiness gate is satisfied and the owner explicitly approves
the transition.*
