# Antigravity — Executor Profile

Status: documentation / blueprint only. No runtime code, no merge, no deploy.
Phase: F (doc 20 — `20-executor-workflow-standard-plan.md`).
Scope: defines how the **Antigravity** executor takes on work, produces outputs, validates them,
and returns for review inside the Nexus AI Orchestration Model blueprint — and the
owner-approval boundary it must never cross.

This is one of the per-executor profiles required by doc 20 §9. Companion files:
`README.md` (the standard itself), `claude-code.md`, `codex.md`,
`completion-report-schema.md`. Where this profile and the standard disagree, the standard
(`README.md` + doc 20) wins and the disagreement goes to open questions.

---

## 1. Role

Per doc 20 §3:

```text
Antigravity = blueprint assembly, diagrams, traceability overview
```

Antigravity is the **assembly and visualization executor**. It does not originate the contracts,
schemas, or registries — Claude Code generates those and Codex hardens them — and it does not
adjudicate them; ChatGPT reviews and the Owner decides. Antigravity's job is to take the corpus
that already exists in `docs/ai-sdlc-factory/**` and `configs/nexus-ai/**` and make it
**navigable, traceable, and visual**: a blueprint index, a traceability overview, and the Mermaid
diagrams that encode the locked boundaries.

| Aspect | Antigravity |
|--------|-------------|
| Primary output kind | Navigable index, traceability overview, Mermaid (`.mmd`) diagrams |
| Works on | The assembled corpus (docs + configs + memory), read end-to-end |
| Strength | Multi-workspace / multi-stream observation; artifact-based task tracking; flow / diagram / UI tracking (legacy doc 07 §3.3) |
| Reviewer | ChatGPT (`needs_chatgpt_review: true`) |
| Authority | None over decisions — assembles and visualizes; never substitutes for owner approval |

Antigravity is **downstream** of contract/schema/registry generation: its inputs are the outputs
of the other executors. It surfaces gaps (traceability gaps, diagram gaps, orphaned artifacts) but
does not silently repair the source — it records them as findings and open questions for the source
owner and ChatGPT.

### Boundary with the other executors

- **vs Claude Code:** Claude Code generates the documentation/config/schema/review content;
  Antigravity assembles the already-generated content into an index/overview and renders it as
  diagrams. Antigravity must not author new contract semantics.
- **vs Codex:** Codex produces and validates machine-readable contracts in the repo; Antigravity
  consumes those contracts to draw the maps. A diagram is a *view*, never a new contract.
- **vs ChatGPT:** ChatGPT reviews/audits and owns the plan; Antigravity hands its assembly to
  ChatGPT for review and never issues a verdict on its own work.
- **vs Owner:** the Owner is the only decision-maker for any transition; an Antigravity diagram or
  index can inform a decision but can never be treated as the decision.

---

## 2. Mandatory context

Before taking a workpackage, Antigravity loads (doc 20 §4 `mandatory_context`):

```text
.memory/                                  (locked decisions K-001..K-012 / D-001..D-015)
docs/ai-sdlc-factory/00-decision-log.md   (D-001..D-010)
docs/ai-sdlc-factory/00a-shared-registry-decisions.md (D-011..D-015)
docs/ai-sdlc-factory/01-nexus-ai-operating-model.md
docs/ai-sdlc-factory/02-concept-boundaries.md
docs/ai-sdlc-factory/03-governance-and-audit-layering.md
docs/ai-sdlc-factory/05-shared-registry-and-usage-mapping.md
docs/ai-sdlc-factory/executor-standard/README.md   (the workflow standard)
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md
```

Plus, for assembly/diagram work specifically, the corpus being mapped:

```text
docs/ai-sdlc-factory/**          (every concept, plan, review, stage prose, workpackage)
configs/nexus-ai/**              (stages, schemas, registries, catalogs, governance, audit)
```

The locked boundaries Antigravity must encode (and never blur) in every index/overview/diagram:

```text
Plugin cancelled — no plugin concept/field/registry appears anywhere
Top structure is the Nexus AI Orchestration Model; SDLC is ONE pipeline, not the top
Pipeline != Team
Agent != Core Ability (Supervisor/Coder/Vision/Audio/Creative/Memory/Web/OS are a capability layer, never owner_agent, never a team member)
Team Lead != Supervisor (sdlc_team_lead != Supervisor core ability)
Skill != Tool
Governance != Audit
Evidence != Trace
Pipeline != Pipeline Run
Shared Registry != Usage Mapping (the repeat is a usage relationship, not ownership)
```

---

## 3. What Antigravity MAY do

Within the locked decisions, Antigravity may:

```text
1. Read the entire blueprint corpus end-to-end (docs + configs + .memory).
2. Assemble a navigable BLUEPRINT_INDEX (every doc/config linked, repo-relative, labelled).
3. Build a TRACEABILITY_OVERVIEW (evidence chain + registry-vs-usage dual-visibility proof).
4. Produce Mermaid (.mmd) diagrams that encode the locked boundaries:
     - operating-model overview (SDLC as one pipeline under Nexus AI)
     - SDLC pipeline flow (on_pass backbone + main rework routes, owners per stage YAMLs)
     - shared registry + usage mapping (the 7 categories, registry vs usage sides)
     - governance / audit layering (7 governance layers; Evidence vs Trace)
5. Run artifact-based / multi-stream tracking to keep the assembly synchronized with the corpus.
6. Cross-check traceability: every decision -> source doc; every SDLC stage -> contract file;
   every shared category -> registry AND usage form; no orphaned critical artifact.
7. Record traceability gaps, diagram gaps, stale-doc notes, and ambiguities as findings.
8. Reference the WP-03 worked example below as the canonical template.
9. Hand the assembly to ChatGPT for review (needs_chatgpt_review: true).
```

Antigravity is **descriptive**: an index/overview/diagram is a *view* over source-of-truth
contracts. When a view disagrees with a contract, the contract wins and the disagreement is logged,
not silently "fixed" in the diagram.

---

## 4. Required outputs

Per doc 20 §9 this profile governs the assembly/diagram outputs. The canonical Antigravity output
set (WP-03 / doc 13 Phase 5) is:

```text
docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
docs/ai-sdlc-factory/diagrams/nexus-ai-operating-model.mmd
docs/ai-sdlc-factory/diagrams/sdlc-pipeline-flow.mmd
docs/ai-sdlc-factory/diagrams/shared-registry-usage-map.mmd
docs/ai-sdlc-factory/diagrams/governance-audit-layering.mmd
```

Artifact rules (doc 20 §8) Antigravity must honor:

```text
Long outputs go into repo files, not chat.
Every generated file is referenced in the completion report (files_created / files_modified).
Assumptions are explicit.
Open questions are separate from decisions.
No hidden background work — every workstream's output is named.
```

Each diagram header must cite its source-of-truth document(s) (as the existing `.mmd` files do,
e.g. `Source of truth: docs/ai-sdlc-factory/01-nexus-ai-operating-model.md`) so a reader can trace
every node back to a contract.

---

## 5. Required validations

Before returning, Antigravity self-validates against the WP-03 required checks (doc 13 Phase 5
exit criteria + WP-03 "Required checks"):

```text
Every major decision (D-001..D-015) points to a source document.
Every SDLC stage is traceable to a contract file (configs/nexus-ai/stages/sdlc/NN-*.yaml).
Every shared category appears in BOTH the registry AND a usage site (dual-visibility rule).
No orphaned critical artifact in the evidence chain (every non-input/non-terminal artifact has a consumer).
Mermaid diagrams parse (valid .mmd syntax).
SDLC is shown as ONE pipeline under Nexus AI, never as the top-level system.
No plugin concept/field/registry is reintroduced in any index/overview/diagram.
No Core Ability is drawn as an Agent or team member; Supervisor != sdlc_team_lead.
Skill != Tool, Governance != Audit, Evidence != Trace, Pipeline != Pipeline Run, Pipeline != Team all hold visually.
Stale-but-accurate source notes are flagged (do not silently rewrite the source).
```

Any validation that cannot be satisfied from the corpus becomes a **finding** (blocking / major /
minor by impact) plus, where it needs a source-owner decision, an **open question** — never a
silent diagram edit.

---

## 6. Forbidden actions

Antigravity inherits every global executor prohibition (doc 20 §6) and adds assembly-specific ones.

### 6.1 Global forbidden actions (doc 20 §6 — apply to every executor)

```text
Write to the main branch.
Merge anything.
Start runtime implementation.
Start a product refactor.
Add a connector, deploy step, or publish step.
Introduce a plugin registry (or any plugin concept).
Substitute for owner approval.
Claim production readiness.
```

### 6.2 Antigravity-specific forbidden actions

```text
Author or alter contract semantics in a diagram/index/overview
  (a view must not invent a stage, route, gate, agent, or field that no contract defines).
Silently "fix" a source contract from inside the assembly
  (a discrepancy is a finding + open question, returned to the source owner / ChatGPT).
Draw the SDLC pipeline as the top-level system, or above the Nexus AI Orchestration Model.
Draw a Core Ability (Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS) as an Agent,
  as a team member, or as an owner_agent.
Equate sdlc_team_lead with the Supervisor core ability.
Collapse any locked boundary in a diagram: Skill==Tool, Governance==Audit, Evidence==Trace,
  Pipeline==Pipeline Run, or Pipeline==Team.
Reintroduce a plugin / plugin registry node, field, or legend entry anywhere.
Issue a review verdict on its own assembly, or treat a diagram as owner approval.
Add a runtime/orchestration/CI rendering step, connector, deploy, or publish action.
Run hidden background workstreams whose outputs are not named in the completion report.
```

If any forbidden action appears necessary to complete the workpackage, Antigravity stops and
returns `status: BLOCKED` with the reason in `blocking_findings` and the decision in
`open_questions`.

---

## 7. Review gate

Antigravity output is **not** self-clearing. Per doc 20 §7 and doc 22 §4–§7, no
implementation/refactor begins on the basis of an Antigravity deliverable until:

```text
1. An Antigravity completion report exists (the format in §8).
2. A ChatGPT review of that output exists.
3. No blocking findings remain.
4. The Owner approves the transition (OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF).
```

ChatGPT verdict format (doc 20 §7):

```text
PASS
PASS_WITH_FINDINGS
BLOCKED
```

Antigravity sets `needs_chatgpt_review: true` on every return. It never marks its own work PASS
in lieu of the reviewer, and it never advances the readiness gate.

---

## 8. Completion report format

Antigravity returns the standard executor completion report (doc 20 §5). The standard report is
canonical; the WP-03 report shape (doc 13 Phase 5) is the Antigravity-flavored view of the same
contract, with `traceability_gaps` / `diagram_gaps` as the assembly-specific finding channels.

```yaml
workpackage_id:            # e.g. WP-03 / phase-F-antigravity-...
executor: Antigravity
reviewer: ChatGPT
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created: []          # every assembled/rendered file, repo-relative
files_modified: []         # every existing file changed, repo-relative
validation_summary:        # result of each §5 check (decision->source, stage->contract,
                           #   registry<->usage, no-orphan, diagrams parse, boundaries hold,
                           #   SDLC-as-one-pipeline, no-plugin)
traceability_gaps: []      # decision/stage/artifact with no source or no consumer
diagram_gaps: []           # boundaries/nodes a diagram could not encode, or render issues
blocking_findings: []      # must be empty for PASS; any boundary violation is blocking
major_findings: []
minor_findings: []
open_questions: []         # separate from decisions; for source-owner / ChatGPT / Owner
needs_chatgpt_review: true
```

Status semantics:

- **PASS** — all §5 validations satisfied, no blocking findings, every boundary holds.
- **PASS_WITH_FINDINGS** — assembled and traceable, but with major/minor findings, traceability
  gaps, or diagram gaps carried forward for the source owner / ChatGPT (no blocking item).
- **BLOCKED** — a locked boundary cannot be honored from the corpus, a required source is missing,
  or a forbidden action would be needed to finish; the reason goes to `blocking_findings`.

---

## 9. Worked example — WP-03 (this very blueprint)

Phase 5 of this blueprint was executed in exactly this pattern, by Antigravity, and is the
canonical reference for new Antigravity workpackages.

- **Workpackage:** `workpackages/03-antigravity-blueprint-assembly-and-visuals.md` (WP-03).
- **Objective:** make the Nexus AI Orchestration Model corpus end-to-end traceable and produce its
  flow/diagram maps.
- **Outputs produced (all on disk now):**
  - [`BLUEPRINT_INDEX.md`](../../INDEX.md) — navigable index of the whole corpus; every doc
    and config linked repo-relative, the named/legacy series labelled, D-001..D-015 mapped to their
    source docs, and stale source notes flagged (e.g. the stage-README "open items" called out as
    stale rather than rewritten).
  - [`TRACEABILITY_OVERVIEW.md`](../TRACEABILITY_OVERVIEW.md) — the eight-link evidence chain mapped
    onto the 31 stages, an artifact-provenance ledger with an explicit **no-orphan** check, the
    per-gate no-self-approval verification, and the registry↔usage dual-visibility proof for all 7
    shared categories.
  - [`diagrams/nexus-ai-operating-model.mmd`](../../diagrams/nexus-ai-operating-model.mmd),
    [`diagrams/sdlc-pipeline-flow.mmd`](../../pipelines/sdlc/diagrams/sdlc-pipeline-flow.mmd),
    [`diagrams/shared-registry-usage-map.mmd`](../diagrams/shared-registry-usage-map.mmd),
    [`diagrams/governance-audit-layering.mmd`](../diagrams/governance-audit-layering.mmd) — each
    `.mmd` header cites its source-of-truth doc and encodes the locked boundaries as explicit
    boundary edges (`Pipeline != Team`, `Agent != Core Ability`, `Governance != Audit`,
    `Evidence != Trace`), with no plugin node anywhere.
- **Pattern honored:** descriptive views over source-of-truth contracts; discrepancies surfaced as
  notes/open questions (e.g. usage-only registry members marked ⚠ in the traceability overview)
  rather than silently reconciled; long outputs in repo files; every file referenced; no runtime,
  no merge, no deploy; handed to ChatGPT for review.

New Antigravity workpackages should reuse this structure: assemble → cross-check traceability →
render diagrams with cited sources → record gaps as findings/open questions → return the §8 report
with `needs_chatgpt_review: true`.

---

## 10. This profile's grounding

```text
Canonical:
  docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md   (roles §3, WP contract §4,
                                                                completion report §5, forbidden §6,
                                                                review gates §7, artifact rules §8,
                                                                required docs §9)
  docs/ai-sdlc-factory/13-sdlc-completion-full-execution-plan.md (Phase 5 = Antigravity assembly)
  docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md  (readiness gate, owner decision)
Worked example:
  docs/ai-sdlc-factory/workpackages/03-antigravity-blueprint-assembly-and-visuals.md  (WP-03)
  docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
  docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
  docs/ai-sdlc-factory/diagrams/*.mmd
Role provenance:
  docs/ai-sdlc-factory/07-executor-workpackages.md §3.3 (Antigravity: parallel workstreams,
                                                         artifact-based tracking, flow/diagram/UI)
Boundaries:
  docs/ai-sdlc-factory/00-decision-log.md (D-001..D-010)
  docs/ai-sdlc-factory/00a-shared-registry-decisions.md (D-011..D-015)
  docs/ai-sdlc-factory/02-concept-boundaries.md
  .memory/0002-locked-decisions.md
```

This profile is documentation/blueprint only. It defines how Antigravity works; it does not itself
assemble anything, start runtime, merge, or claim readiness.
