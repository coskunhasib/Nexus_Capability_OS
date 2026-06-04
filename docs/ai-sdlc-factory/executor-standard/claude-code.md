# Claude Code — Executor Profile (Phase F / doc 20)

- **Document:** `docs/ai-sdlc-factory/executor-standard/claude-code.md`
- **Phase:** F (doc 20 — `20-executor-workflow-standard-plan.md`)
- **Executor:** Claude Code
- **Role:** PRIMARY executor for documentation / config / schema / review generation
- **Reviewer of this profile:** ChatGPT
- **Nature:** documentation / blueprint only. No runtime code, no merge, no deploy.
- **Canonical sources:** `20-executor-workflow-standard-plan.md` (§3 roles, §4 workpackage, §5 completion report, §6 forbidden actions, §7 review gates, §8 artifact rules), `13-sdlc-completion-full-execution-plan.md` (worked example), `22-final-stop-rule-and-readiness-gate.md` (review-gate / owner boundary), `.memory/0002-locked-decisions.md` (K-001 .. K-012).

---

## 1. Purpose

This profile defines how **Claude Code** operates as an executor inside the Nexus
AI blueprint program: what work it takes on, what it is allowed to produce, the
context it must load before it starts, how it validates, how it reports back, and
the hard boundary at which it stops and hands control to the owner.

Claude Code is the **primary executor for documentation, configuration, schema,
and review generation** (doc 20 §3). It does not implement the product, it does
not run the runtime, and it does not approve its own work. It produces
review-ready artifacts and a completion report, then waits behind the review gate
(§8) for a ChatGPT review and an owner decision.

This is not a hypothetical role. Phases A through E of this very blueprint were
executed by Claude Code in exactly this pattern — see the worked example in §9.

---

## 2. Position in the executor model (doc 20 §3)

```text
Claude Code  = primary executor for documentation/config/schema/review generation
Codex        = repo-oriented contract generation and validation helper
Antigravity  = blueprint assembly, diagrams, traceability overview
ChatGPT      = reviewer / auditor / plan owner
Owner        = final decision maker
```

Claude Code never occupies the ChatGPT (reviewer) or Owner (decision) seats. Its
output is always an **input to review**, never the conclusion of review. Where a
workpackage needs a reviewer different from the author (no-self-approval), the
reviewer is ChatGPT or a designated reviewer role — never Claude Code reviewing
its own artifact as the gate.

---

## 3. What Claude Code MAY do

Within an assigned workpackage and its declared scope, Claude Code may:

```text
- Author documentation (blueprint docs, plans, READMEs, indexes, profiles).
- Author machine-readable configuration (YAML stage contracts, registries,
  catalogs, profile/rule configs).
- Author schemas (JSON Schema for pipeline/run/stage/artifact/evidence/trace).
- Author review and audit documents (consistency audits, boundary reviews,
  cross-review summaries) AS DELIVERABLES — distinct from the ChatGPT review gate.
- Read the full repo to ground its work (.memory, docs/ai-sdlc-factory, configs).
- Run read-only / non-mutating validation over the artifacts it produced
  (structural checks, route checks, field-presence checks, parse checks).
- Record explicit assumptions, and record open questions separately from decisions.
- Write long outputs to repo files (never dump long content into chat) and
  reference every generated file in the completion report.
```

All of the above is confined to the executor work tree on the working branch
(currently `nexus`). None of it touches `main`, runtime, or any external system.

---

## 4. Mandatory context to load before starting

Before any authoring begins, Claude Code MUST load and reconcile the persisted
context. This mirrors doc 13 Phase 0 (Context lock and memory reload) and is the
precondition for every Claude Code workpackage.

### 4.1 `.memory` (repo-safe persisted memory)

```text
.memory/README.md
.memory/0001-session-summary.md
.memory/0002-locked-decisions.md
.memory/0003-sdlc-research-baseline.md
.memory/0004-next-actions.md
```

### 4.2 Locked decisions (must be confirmed, never contradicted)

From `.memory/0002-locked-decisions.md`:

```text
K-001  Plugin cancelled — no plugin registry / marketplace / lifecycle in core.
K-002  Top structure is the Nexus AI Orchestration Model; SDLC is one pipeline, not the top.
K-003  Core Abilities = [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]; not "agents".
K-004  Core Abilities are a shared capability layer, not part of any team.
K-005  Team -> Team Lead -> Agents -> Sub-agents (and direct sub-agents).
K-006  Supervisor (Core Ability) != SDLC Team Lead.
K-007  Governance not blindly merged; 7 layers preserved (global/pipeline/team/stage/core-ability/skill/tool).
K-008  Audit not blindly merged; Evidence (decision proof) != Trace (operation history).
K-009  Shared Registry + Usage Mapping for all 7 shared categories.
K-010  Skills appear by name only in the main hierarchy; contents live in inventory/audit docs.
K-011  Web / OS / Memory remain Core Abilities; their sub-operations live in the Tool Registry.
K-012  SDLC completeness is critical; coverage verified by separate coverage/gap audit.
```

### 4.3 Live blueprint entry point and the workpackage's own canonical sources

```text
docs/ai-sdlc-factory/README.md
+ every canonical_source named in the assigned workpackage.
```

### 4.4 Context-lock outcome

Claude Code must confirm — before authoring — that nothing it loaded conflicts
with the locked decisions, the plugin concept is not reintroduced, no Core Ability
is treated as an Agent, Supervisor is kept separate from the SDLC Team Lead, and
the Shared Registry + Usage Mapping rule is intact. The worked example of this
exact check is `docs/ai-sdlc-factory/execution/phase-0-context-lock-report.md`
(verdict: PASS). If a conflict is found, the correct response is a **BLOCKED**
completion report, not silently authoring through the conflict.

---

## 5. Completion report format (doc 20 §5)

Every Claude Code workpackage returns exactly one completion report in this
format. Long outputs go to repo files; the report is the index to them.

```yaml
workpackage_id:
executor: claude_code
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:
files_modified:
validation_summary:
blocking_findings:
major_findings:
minor_findings:
open_questions:
needs_chatgpt_review: true
```

Field rules:

```text
- status:
    PASS               = required outputs produced, required validations pass, no findings that block.
    PASS_WITH_FINDINGS = outputs produced and usable, but non-blocking findings/open questions remain.
    BLOCKED            = a locked-decision conflict, a hard blocker, or a missing precondition prevents
                         valid completion; no implementation may proceed.
- files_created / files_modified:
    EVERY generated or edited file is listed (doc 20 §8). Absolute or repo-relative paths.
    A file that exists but is not in the report is a reporting defect.
- validation_summary:
    Which required_validations were run and their result. Read-only/structural only.
- blocking_findings:
    Anything that, if unresolved, must stop implementation/refactor. Drives BLOCKED, or must be
    cleared before the review gate can pass.
- major_findings / minor_findings:
    Carried forward to review; do not, by themselves, block the gate.
- open_questions:
    Kept SEPARATE from decisions (doc 20 §8). Questions for the reviewer/owner, not silent assumptions.
- needs_chatgpt_review:
    true for Claude Code deliverables — output is an input to the review gate, never the gate itself.
```

---

## 6. Forbidden actions (doc 20 §6)

Claude Code MUST NOT, under any workpackage:

```text
- Write to the main branch.
- Merge (including any nexus -> main merge or PR into main).
- Begin runtime implementation.
- Start a product refactor.
- Add a connector, deploy, or publish step.
- Add or reintroduce a plugin registry (K-001).
- Substitute for owner approval.
- Claim production readiness.
```

Additional executor artifact constraints (doc 20 §8) that bind Claude Code:

```text
- Long outputs go into repo files, not chat.
- Every generated file is referenced in the completion report.
- Assumptions are explicit.
- Open questions are separate from decisions.
- No hidden background work — nothing is done off the record.
```

And the hard blockers from `22-final-stop-rule-and-readiness-gate.md` §6 that, if
introduced, must surface as a **blocking finding** rather than be authored through:
plugin registry reintroduced; Core Ability treated as an Agent; Supervisor treated
as SDLC Team Lead; SDLC treated as a top-level system; Governance/Audit merged
incorrectly; Evidence/Trace merged incorrectly; Shared Registry + Usage Mapping
rule violated; an SDLC required gate missing; a release candidate allowed before
development completion; owner approval missing.

If a workpackage instruction would require any forbidden action, Claude Code
declines that part, records it in `open_questions` or `blocking_findings`, and
returns the report — it does not perform the action.

---

## 7. Review gate and owner boundary (doc 20 §7, doc 22 §7)

Claude Code's output stops at the review gate. No implementation or refactor
begins, and Claude Code does not proceed past producing artifacts, until **all**
of the following hold (doc 20 §7):

```text
1. Executor completion report exists  (Claude Code produces this).
2. ChatGPT review exists              (Claude Code does NOT produce this).
3. No blocking findings remain.
4. Owner approves the transition.
```

The owner decision is explicit (doc 22 §7):

```text
OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
or
OWNER_DECISION: HOLD_FOR_MORE_REVIEW
```

Until that approval, everything in doc 22 §9 stays prohibited: runtime code
change, product refactor, connector integration, Nexus publish, deploy, main
merge, production readiness claim. Even after approval, the next phase is
*implementation planning handoff* (preparing implementation workpackages) — not
direct code.

---

## 8. Workpackage intake (doc 20 §4)

Claude Code expects each assignment as a workpackage carrying these fields, and
will not start an under-specified package without recording the gap as an open
question:

```yaml
workpackage_id:
executor: claude_code
reviewer: chatgpt
objective:
mandatory_context:        # at minimum the .memory set + locked decisions (§4)
canonical_sources:
required_outputs:
required_validations:
forbidden_actions:        # inherits doc 20 §6 / doc 22 §6 at minimum
completion_report_format: # the §5 contract above
```

Operating loop:

```text
1. Load mandatory_context and canonical_sources (§4); run the context-lock check.
2. If a locked-decision conflict exists -> BLOCKED report, stop.
3. Author required_outputs as repo files (never long chat dumps).
4. Run required_validations (read-only / structural).
5. Record findings: blocking vs major vs minor; assumptions explicit; open questions separate.
6. Emit the §5 completion report listing every created/modified file.
7. Stop at the review gate (§7). Wait for ChatGPT review + owner decision.
```

---

## 9. Worked example — Claude Code executed Phases A–E under this standard

Phases A through E of this blueprint were carried out by Claude Code as the
primary executor, each as a workpackage, each returning a completion report with
`PASS` or `PASS_WITH_FINDINGS`, each leaving findings and open questions carried
forward to review — and **no** runtime, merge, deploy, or production claim at any
point. This is the canonical demonstration that the standard is executable, not
aspirational.

### Phase A — SDLC completion execution (doc 13)

Machine-readable SDLC stage contracts, JSON schemas, and the independent reviews.

```text
configs/nexus-ai/stages/sdlc/01-intake.yaml ... 31-refraction-learning.yaml   (31 stage contracts)
configs/nexus-ai/stages/sdlc/README.md
configs/nexus-ai/schemas/pipeline_definition.schema.json
configs/nexus-ai/schemas/pipeline_run.schema.json
configs/nexus-ai/schemas/stage_contract.schema.json
configs/nexus-ai/schemas/artifact_registry.schema.json
configs/nexus-ai/schemas/evidence_item.schema.json
configs/nexus-ai/schemas/trace_item.schema.json
configs/nexus-ai/validation/README.md
docs/ai-sdlc-factory/execution/phase-0-context-lock-report.md            (the §4 context-lock worked example)
docs/ai-sdlc-factory/reviews/sdlc-contract-consistency-audit.md
docs/ai-sdlc-factory/reviews/claude-code-skill-agent-review.md
docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
docs/ai-sdlc-factory/diagrams/*.mmd                                      (operating model, SDLC flow, registry map, gov/audit layering)
docs/ai-sdlc-factory/reviews/final-cross-review-summary.md
```

### Phase B — Pipeline catalog expansion (doc 16)

The SDLC pipeline placed as one pipeline type among others under the Nexus AI
model (K-002), with per-pipeline catalog docs.

```text
configs/nexus-ai/pipeline_catalog.yaml
docs/ai-sdlc-factory/pipeline-catalog/README.md
docs/ai-sdlc-factory/pipeline-catalog/{research,activation,operations,knowledge-memory,skill-governance}-pipeline.md
docs/ai-sdlc-factory/reviews/pipeline-catalog-review.md
```

### Phase C — Shared registry formalization (doc 17)

All seven shared categories as first-class registries, satisfying the Shared
Registry + Usage Mapping rule (K-009).

```text
configs/nexus-ai/core_abilities.yaml
configs/nexus-ai/skills_registry.yaml
configs/nexus-ai/tools_registry.yaml
configs/nexus-ai/governance_profiles.yaml
configs/nexus-ai/audit_schemas.yaml
configs/nexus-ai/model_provider_profiles.yaml
configs/nexus-ai/context_memory_profiles.yaml
docs/ai-sdlc-factory/reviews/shared-registry-formalization-review.md
```

### Phase D — Team / Agent / Sub-agent catalogs (doc 18)

The team hierarchy (K-005) and the Supervisor/SDLC-Team-Lead separation (K-006),
with Core Abilities kept out of the team structure (K-004).

```text
configs/nexus-ai/agent_roles.yaml
configs/nexus-ai/team_lead_roles.yaml
configs/nexus-ai/sub_agent_roles.yaml
configs/nexus-ai/team_templates.yaml
docs/ai-sdlc-factory/reviews/team-agent-subagent-catalog-review.md
```

### Phase E — Governance & audit configs (doc 19)

The seven governance layers kept unmerged (K-007) and the Evidence/Trace split
preserved (K-008).

```text
configs/nexus-ai/governance/{global,pipeline/*,team/*,stage/*,core-ability/*,skill/*,tool/*}.yaml
configs/nexus-ai/audit/...                                               (evidence + trace schemas, kept distinct)
docs/ai-sdlc-factory/reviews/governance-audit-readiness-review.md
```

### What the worked example demonstrates

```text
- Claude Code authored docs/config/schema/review artifacts only — never runtime, merge, deploy.
- Each phase returned a completion report; status was PASS or PASS_WITH_FINDINGS.
- Findings and open questions were carried forward to review, kept separate from decisions.
- Locked decisions (K-001 .. K-012) were confirmed at the start of each phase and never contradicted.
- The plugin concept was never reintroduced; no production-readiness claim was made.
- The review gate (§7) was honored: ChatGPT review + owner decision sit downstream of every phase.
```

---

## 10. This profile's own completion report

```yaml
workpackage_id: phase-f-executor-standard-claude-code
executor: claude_code
status: PASS
files_created:
  - docs/ai-sdlc-factory/executor-standard/claude-code.md
files_modified: []
validation_summary:
  - "§3 roles, §4 workpackage, §5 completion report, §6 forbidden actions, §7 review gates, §8 artifact rules of doc 20 all reflected."
  - "Mandatory context (§4) lists the .memory set and locked decisions K-001..K-012 from 0002-locked-decisions.md."
  - "Worked example (§9) cites real on-disk Phase A-E artifacts (31 stage YAMLs, 6 schemas, registries, catalogs, governance/audit configs, reviews)."
  - "Forbidden actions and hard blockers cross-checked against doc 20 §6 and doc 22 §6/§9."
blocking_findings: []
major_findings: []
minor_findings:
  - "Phase E configs are split across the top-level Phase C registries (governance_profiles.yaml, audit_schemas.yaml) and the Phase E layered dirs (configs/nexus-ai/governance/, configs/nexus-ai/audit/); both are cited so the distinction is not lost."
open_questions:
  - "Sibling executor-standard files (README.md, codex.md, antigravity.md, completion-report-schema.md) per doc 20 §9 are separate workpackages; this WP delivered only claude-code.md as scoped."
needs_chatgpt_review: true
```
