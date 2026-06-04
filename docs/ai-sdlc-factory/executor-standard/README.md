# Executor Workflow Standard — Overview

How executor environments (Claude Code, Codex, Antigravity) take on work, produce
outputs, validate them, and return for review — and the owner-approval boundary that
must clear before any implementation or refactor begins. This is
documentation/blueprint only — no runtime code, no merge, no deploy.

- **Phase:** F (doc 20 — [`../20-executor-workflow-standard-plan.md`](../20-executor-workflow-standard-plan.md))
- **Canonical sources:** doc 20 (executor standard), [`../13-sdlc-completion-full-execution-plan.md`](../13-sdlc-completion-full-execution-plan.md) (the worked example), [`../22-final-stop-rule-and-readiness-gate.md`](../22-final-stop-rule-and-readiness-gate.md) (the readiness gate)
- **Locked boundaries (carried in every layer):** Plugin yok · Pipeline != Team · Agent != Core Ability · Team Lead != Supervisor · Skill != Tool · Governance != Audit · Evidence != Trace
- **Status of this layer:** the standard exists; no implementation or refactor is authorized. Transition is gated by doc 22 plus an explicit owner decision (§6 below).

> This standard is not new policy invented here. **Phases A–E of this very blueprint were
> executed in exactly this pattern**: Claude Code generated the SDLC stage contracts, JSON
> schemas, shared registries, pipeline catalogs, and governance/audit configs; each phase
> returned a completion report (`PASS` / `PASS_WITH_FINDINGS`) with findings carried forward;
> ChatGPT reviewed; no runtime, no merge. The standard documents the pattern that already
> worked. See [§7 — Worked example](#7-worked-example-phases-ae) and the review corpus under
> [`../reviews/`](../reviews/).

---

## 1. Purpose and scope

The Nexus AI Orchestration Model is built by **executor environments** that act on behalf
of the owner. Each executor is a tool, not an authority. To keep that distinction safe and
auditable, every unit of executor work follows one contract:

> **workpackage → execution → completion report → ChatGPT review → owner approval.**

This overview defines:

- the **5 roles** and which executor does what (§2),
- the **flow** every workpackage travels and the review gate that closes it (§3),
- the **global forbidden actions** every executor is bound by (§4),
- the **artifact rules** for where outputs live and how they are reported (§5),
- the **owner-approval / readiness boundary** that must clear before implementation (§6),
- the **per-executor playbooks and the completion-report schema** linked in §8.

What this layer does **not** do: authorize implementation, authorize a refactor, start
runtime work, or substitute for owner approval. Producing this standard is itself a
documentation workpackage under the same rules it describes.

---

## 2. The five roles (doc 20 §3)

Roles are fixed. An executor never promotes itself into the reviewer or owner role, and the
reviewer never silently becomes the owner.

| Role | Who | Responsibility | Detail |
|------|-----|----------------|--------|
| **Primary executor** | **Claude Code** | Documentation, config, schema, and review-artifact generation. The default executor for blueprint work. | [`claude-code.md`](claude-code.md) |
| **Repo executor** | **Codex** | Repo-oriented contract generation and validation helper (e.g. schema validation, structural checks against files on disk). | [`codex.md`](codex.md) |
| **Assembly executor** | **Antigravity** | Blueprint assembly, diagrams, and the traceability overview. | [`antigravity.md`](antigravity.md) |
| **Reviewer / auditor** | **ChatGPT** | Reviews completion reports, issues a verdict (`PASS` / `PASS_WITH_FINDINGS` / `BLOCKED`), owns the plan. Does **not** execute and does **not** approve transitions. | §3, §6 |
| **Final decision maker** | **Owner** | The only authority that approves the transition out of planning into implementation/refactor. Cannot be substituted by any executor or by the reviewer. | §6 |

Boundary reminders that interact with these roles:

- **Reviewer != Owner.** A `PASS` from ChatGPT clears the *review* gate; it does not authorize
  implementation. Only the owner decision in §6 does.
- **Executor != Owner.** No executor may claim that its output is approved, production-ready,
  or merged. It returns a report and waits.
- **Core Ability != Agent**, **Team Lead != Supervisor.** These model boundaries are not
  executor roles; an executor that blurs them produces a *blocking finding* (see doc 22 §6).

---

## 3. The workpackage flow and review gate (doc 20 §4, §5, §7)

Every unit of work is a **workpackage** issued to exactly one executor and one reviewer. The
executor produces required outputs, runs required validations, and returns a **completion
report**. The reviewer issues a verdict. Nothing downstream proceeds until the gate clears.

```text
                     ┌──────────────────────────────────────────────┐
                     │  WORKPACKAGE  (doc 20 §4)                      │
                     │  id · executor · reviewer · objective          │
                     │  mandatory_context · canonical_sources         │
                     │  required_outputs · required_validations       │
                     │  forbidden_actions · completion_report_format  │
                     └───────────────────────┬──────────────────────┘
                                             │  issued to ONE executor
                                             ▼
                     ┌──────────────────────────────────────────────┐
                     │  EXECUTION  (one executor, §2)                 │
                     │  produce required_outputs as repo files (§5)   │
                     │  run required_validations                      │
                     │  record assumptions / open questions           │
                     └───────────────────────┬──────────────────────┘
                                             ▼
                     ┌──────────────────────────────────────────────┐
                     │  COMPLETION REPORT  (doc 20 §5)                │
                     │  status: PASS | PASS_WITH_FINDINGS | BLOCKED   │
                     │  files_created · files_modified                │
                     │  validation_summary                            │
                     │  blocking / major / minor findings             │
                     │  open_questions · needs_chatgpt_review         │
                     └───────────────────────┬──────────────────────┘
                                             ▼
                     ┌──────────────────────────────────────────────┐
                     │  CHATGPT REVIEW  (reviewer, §2)                │
                     │  verdict: PASS | PASS_WITH_FINDINGS | BLOCKED  │
                     └───────────────────────┬──────────────────────┘
                       BLOCKED / blocking     │  PASS or PASS_WITH_FINDINGS,
                       findings remain         │  no blocking findings remain
                          ┌──────────────┐    │
                          │ rework loop  │◄───┘ (findings carried forward)
                          └──────┬───────┘    │
                                 ▲            ▼
                                 │   ┌──────────────────────────────────────┐
                                 └───│  OWNER APPROVAL  (doc 22 §7)           │
                                     │  the ONLY authorization to transition │
                                     │  into implementation / refactor        │
                                     └──────────────────────────────────────┘
```

### 3.1 Review gate — all four conditions required (doc 20 §7)

**No implementation or refactor begins** before *all* of the following hold:

1. an **executor completion report exists** (in the doc 20 §5 format),
2. a **ChatGPT review exists**,
3. **no blocking findings remain**, and
4. the **owner approves** the transition.

A `PASS_WITH_FINDINGS` verdict is acceptable to close a single workpackage **only** when its
findings are non-blocking; `major` and `minor` findings are then carried forward as tracked
open items, not silently dropped. A `BLOCKED` verdict, or any unresolved `blocking_finding`,
sends the workpackage back through the rework loop — it never advances.

Conditions 1–3 are the **per-workpackage** gate. Condition 4 is the **phase-level** boundary
described in §6: it is owned by doc 22 and applies to the transition out of planning as a
whole, not to each document in isolation.

---

## 4. Global forbidden actions (doc 20 §6)

Bound on **every** executor, in **every** workpackage, regardless of objective. These are
hard prohibitions, not preferences. An executor that is asked to do any of these must decline
and surface it as a `blocking_finding` rather than comply.

| # | Forbidden action | Why |
|---|------------------|-----|
| 1 | Write to the **`main`** branch | Owner controls integration; executors never touch the trunk. |
| 2 | **Merge** anything | Merge is an owner/integration act, outside any executor's authority. |
| 3 | Start **runtime implementation** | This corpus is a blueprint; runtime is gated by doc 22 + owner approval. |
| 4 | Start a **product refactor** | Same gate — no refactor before the readiness boundary clears (§6). |
| 5 | Add a **connector / deploy / publish** step | Out of scope for the blueprint phase; explicitly prohibited until approval (doc 22 §9). |
| 6 | Introduce a **plugin registry** | Plugin is cancelled (locked decision). Reintroducing it is a hard blocker (doc 22 §6). |
| 7 | **Substitute for owner approval** | Only the owner authorizes transition; no executor and no reviewer may stand in. |
| 8 | Claim **production readiness** | No executor output is production-ready; saying so is a forbidden claim. |

> Several of these double as **doc 22 §6 hard blockers** — e.g. a reintroduced plugin registry,
> a Core Ability treated as an Agent, or a missing owner approval will not just fail one
> workpackage, they block the entire implementation transition.

---

## 5. Artifact rules (doc 20 §8)

How executor outputs are produced and reported, so that work is auditable and nothing hides in
a chat transcript.

| # | Rule | Meaning |
|---|------|---------|
| 1 | **Long outputs go into repo files, not chat.** | Deliverables live on disk under the repo (typically `docs/ai-sdlc-factory/**` or `configs/nexus-ai/**`), never pasted as the answer. |
| 2 | **Every generated file is referenced in the completion report.** | The report's `files_created` / `files_modified` must list every file touched — no untracked artifacts. |
| 3 | **Assumptions must be explicit.** | Any assumption the executor relied on is stated plainly, not buried. |
| 4 | **Open questions are separate from decisions.** | `open_questions` is its own field; an open question is never recorded as if it were a settled decision. |
| 5 | **No hidden background work.** | No claim of work done out of band. What is reported is what was done; nothing more is asserted. |

These rules are why this very document is a file under `executor-standard/` and not a chat
reply, and why the workpackage that produced it returns a completion report listing it.

---

## 6. Owner-approval and readiness boundary (doc 22)

The review gate in §3 closes individual workpackages. It does **not**, on its own, start
implementation. The transition from *planning* to *implementation/refactor* is governed by the
final stop rule and readiness gate in [`../22-final-stop-rule-and-readiness-gate.md`](../22-final-stop-rule-and-readiness-gate.md).

Before any implementation or refactor may begin, doc 22 requires:

- **Planning complete** (doc 22 §3) — the full plan series (docs 13–22) exists.
- **Execution complete** (doc 22 §4) — the executor outputs exist: stage YAMLs, JSON schemas,
  the consistency audit, the skill/agent review, blueprint index and diagrams, the final
  cross-review, shared registry configs, team/agent/sub-agent catalogs, governance/audit
  configs, **the executor workflow standard outputs (this layer)**, and the readiness reviews.
- **Required review verdicts** (doc 22 §5) — the named reviews under [`../reviews/`](../reviews/)
  are `PASS` or `PASS_WITH_FINDINGS` with **no blocking findings**.
- **No hard blockers** (doc 22 §6) — e.g. no reintroduced plugin registry, no Core Ability
  treated as an Agent, no Supervisor treated as an SDLC Team Lead, no missing owner approval.
- **An explicit owner decision** (doc 22 §7), in the form:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  or
  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
  ```

Even on `APPROVE`, the **next** phase is *Runtime / Refactor Implementation Planning Handoff*
(doc 22 §8) — preparing implementation workpackages — **not** writing code. Until that owner
decision lands, the following stay prohibited (doc 22 §9): runtime code change, product
refactor, connector integration, Nexus publish, deploy, `main` merge, production-readiness
claim.

**Net statement:** *No implementation or refactor begins until the doc 22 readiness gate is
satisfied and the owner explicitly approves the transition.* This standard, and every executor
governed by it, operates entirely upstream of that line.

---

## 7. Worked example — Phases A–E

This standard was reverse-derived from how the blueprint was actually built. Each prior phase
ran the §3 flow end to end and returned a completion report; the review corpus is the evidence.

| Phase | Executor work (Claude Code) | Review artifact (ChatGPT) |
|-------|-----------------------------|---------------------------|
| Context lock | [`../execution/phase-0-context-lock-report.md`](../execution/phase-0-context-lock-report.md) | — |
| SDLC contracts + schemas | machine-readable stage YAMLs, JSON schemas | [`../reviews/sdlc-contract-consistency-audit.md`](../reviews/sdlc-contract-consistency-audit.md) |
| Skill / agent review | skill + agent boundary check | [`../reviews/claude-code-skill-agent-review.md`](../reviews/claude-code-skill-agent-review.md) |
| Blueprint assembly | index, traceability, diagrams; final cross-review | [`../reviews/final-cross-review-summary.md`](../reviews/final-cross-review-summary.md) |
| Pipeline catalog | catalog expansion configs | [`../reviews/pipeline-catalog-review.md`](../reviews/pipeline-catalog-review.md) |
| Shared registries | shared registry configs | [`../reviews/shared-registry-formalization-review.md`](../reviews/shared-registry-formalization-review.md) |
| Team / agent / sub-agent | catalogs | [`../reviews/team-agent-subagent-catalog-review.md`](../reviews/team-agent-subagent-catalog-review.md) |
| Governance / audit | governance + audit configs | [`../reviews/governance-audit-readiness-review.md`](../reviews/governance-audit-readiness-review.md) |

In each, findings were carried forward (not dropped), no executor wrote to `main` or merged,
and no phase claimed production readiness — the exact behavior this standard now makes explicit.

---

## 8. Layer contents

The executor standard is this overview plus four companion documents. Together they satisfy the
doc 20 §9 required-docs set and §10 exit criteria.

| Document | Purpose |
|----------|---------|
| [`README.md`](README.md) | **This file.** The five roles, the workpackage flow + review gate, the global forbidden actions, the artifact rules, and the readiness boundary. |
| [`claude-code.md`](claude-code.md) | Claude Code playbook — primary executor for documentation / config / schema / review generation. |
| [`codex.md`](codex.md) | Codex playbook — repo-oriented contract generation and validation helper. |
| [`antigravity.md`](antigravity.md) | Antigravity playbook — blueprint assembly, diagrams, traceability overview. |
| [`completion-report-schema.md`](completion-report-schema.md) | The completion-report contract (doc 20 §5): required fields, allowed `status` values, and how findings / open questions are recorded. |

### 8.1 Exit criteria for this layer (doc 20 §10)

- Executor standard exists — **this overview**.
- Completion-report schema exists — [`completion-report-schema.md`](completion-report-schema.md).
- Forbidden actions are explicit — §4.
- Review flow is explicit — §3.
- Owner-approval boundary is explicit — §6.

---

*Documentation / blueprint only. No runtime code, no merge, no deploy. No implementation or
refactor begins until the doc 22 readiness gate is satisfied and the owner explicitly approves
the transition.*
