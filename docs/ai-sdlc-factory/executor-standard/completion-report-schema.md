# Executor Standard — Workpackage & Completion Report Schema

> Machine-readable schema for the Nexus AI Executor Workflow Standard.
> Documentation/blueprint only — this file defines **contracts (templates), not runtime code**.
> NO runtime code, NO merge, NO deploy, NO connector/publish, NO plugin registry.

This document is the machine-readable form of the **Workpackage Contract** (doc 20 §4),
the **Completion Report Contract** (doc 20 §5), the **status vocabulary**, the
`needs_chatgpt_review` flag, and the **review-gate rule** (doc 20 §7) that no
implementation/refactor begins before a completion report + a ChatGPT review + no blocking
findings + owner approval.

## 0. Canonical sources

This schema is bound to, and must not contradict, the following canonical sources:

```text
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md   # §3 roles, §4 workpackage, §5 completion report, §6 forbidden, §7 review gate
docs/ai-sdlc-factory/13-sdlc-completion-full-execution-plan.md  # verdict format (§9), no runtime/refactor until cross-review (§12)
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md   # required review verdicts (§5), hard blockers (§6), owner decision (§7)
```

If this file and a canonical source disagree, the canonical source wins and this file is corrected.

## 1. Status vocabulary (locked)

The only legal `status` values for an executor completion report, and the only legal
ChatGPT review verdict values, are (doc 20 §5, §7; doc 13 §9):

```yaml
status_vocabulary:
  - PASS                 # all required outputs produced, all required validations pass, no findings that block
  - PASS_WITH_FINDINGS   # required outputs produced and required validations pass, but non-blocking findings remain (major/minor)
  - BLOCKED              # required outputs and/or validations could not be completed; work cannot proceed without a decision
```

Rules:

```text
status MUST be exactly one of: PASS | PASS_WITH_FINDINGS | BLOCKED.
status = PASS                => blocking_findings == [] AND major_findings == [] AND minor_findings == [].
status = PASS_WITH_FINDINGS  => blocking_findings == [] AND (major_findings != [] OR minor_findings != []).
status = BLOCKED             => blocking_findings != [].
Any blocking finding forces status = BLOCKED (a blocking finding may never appear under PASS or PASS_WITH_FINDINGS).
```

This is the same status set Phases A–E of this blueprint returned (Claude Code generated the
SDLC stage contracts, schemas, registries, catalogs, governance/audit configs and returned
PASS or PASS_WITH_FINDINGS with findings carried forward; no runtime, no merge).

## 2. Workpackage Contract (doc 20 §4)

Template. A workpackage is the unit of work handed to an executor before it begins. Every field
MUST be present; list fields that have no entries appear as `[]` (do not omit them).

```yaml
# ---------------------------------------------------------------------------
# Workpackage Contract — doc 20 §4
# Filled in by the plan owner (ChatGPT) and handed to the executor BEFORE work starts.
# ---------------------------------------------------------------------------
workpackage_id:            # e.g. WP-020-completion-report-schema  (stable, unique)
executor:                  # one of the executor roles below (doc 20 §3)
reviewer:                  # who reviews the completion report — normally ChatGPT
objective:                 # one sentence: what this workpackage must achieve

mandatory_context:         # context the executor MUST load before producing output
  - .memory/*              #   (memory, locked decisions, etc.)
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md

canonical_sources:         # the authoritative source docs the output is derived from / bound to
  - docs/ai-sdlc-factory/...

required_outputs:          # exact repo file paths the executor must produce (long outputs => files, not chat)
  - docs/ai-sdlc-factory/...

required_validations:      # checks the executor must run/state before reporting (schema parse, field presence, lock checks, ...)
  - ...

forbidden_actions:         # see §4 below — at minimum the global executor forbidden actions apply
  - write_to_main_branch
  - merge
  - start_runtime_implementation
  - refactor_the_product
  - add_connector_deploy_or_publish
  - introduce_plugin_registry
  - substitute_for_owner_approval
  - claim_production_readiness

completion_report_format:  # the contract the executor must return in — this schema, §3
  schema: docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5
```

### Executor role values (doc 20 §3)

```yaml
executor_roles:
  Claude Code: primary executor for documentation/config/schema/review generation
  Codex:       repo-oriented contract generation and validation helper
  Antigravity: blueprint assembly, diagrams, traceability overview
  ChatGPT:     reviewer / auditor / plan owner          # reviewer role, not a work executor
  Owner:       final decision maker                      # approval authority, not an executor
```

## 3. Completion Report Contract (doc 20 §5)

Template. The executor returns exactly this structure when work is finished. Every field MUST be
present; finding/file/question lists that are empty appear as `[]`.

```yaml
# ---------------------------------------------------------------------------
# Completion Report Contract — doc 20 §5
# Returned by the executor AFTER producing the required outputs. Long outputs live in repo
# files; every file produced or changed is referenced here (doc 20 §8).
# ---------------------------------------------------------------------------
workpackage_id:            # MUST match the workpackage_id of the contract being fulfilled
executor:                  # the executor role that did the work (doc 20 §3)
status:                    # PASS | PASS_WITH_FINDINGS | BLOCKED   (see §1)

files_created:             # absolute or repo-relative paths of NEW files (every generated file is listed)
  - docs/ai-sdlc-factory/...
files_modified:            # paths of files CHANGED (never includes anything on main)
  - []

validation_summary:        # one line per required_validation: what was checked and the result
  - ...

# Findings are partitioned by severity. blocking_findings gate everything downstream (§4).
blocking_findings:         # MUST be [] for status PASS or PASS_WITH_FINDINGS; non-empty => status BLOCKED
  - []
major_findings:            # significant but non-blocking; carried forward, tracked, do not stop the gate
  - []
minor_findings:            # nits / cosmetic / low-impact
  - []

# Assumptions explicit; open questions are SEPARATE from decisions (doc 20 §8).
open_questions:            # unresolved questions for the reviewer/owner — NOT decisions the executor made
  - []

needs_chatgpt_review: true # see §3.1 — a ChatGPT review is required before the review gate can open
```

### 3.1 The `needs_chatgpt_review` flag

```text
needs_chatgpt_review signals that this completion report still requires an independent ChatGPT
review before the review gate (§4) can be considered. It does NOT itself open the gate.

Default: true. Every executor completion report in this blueprint sets needs_chatgpt_review: true,
because the review gate (§4) requires a ChatGPT review to exist regardless of executor status.

needs_chatgpt_review: false is only legal when the workpackage's reviewer is explicitly NOT
ChatGPT (recorded in the workpackage `reviewer` field) AND the owner has accepted that reviewer.
It is NEVER a way to bypass review — a BLOCKED report always needs review, and the owner-approval
boundary (§4) is unaffected by this flag.
```

### 3.2 Field invariants (machine-checkable)

```text
workpackage_id (report)  == workpackage_id (workpackage contract).
executor (report)        ∈ executor_roles, and matches the workpackage `executor`.
status                   ∈ { PASS, PASS_WITH_FINDINGS, BLOCKED } and obeys the §1 status rules.
files_created + files_modified  cover EVERY file the executor produced or changed (doc 20 §8).
files_modified           contains NOTHING on the main branch (forbidden action — §4).
blocking_findings        non-empty  <=>  status == BLOCKED.
open_questions           contains questions only — never silently-made decisions.
needs_chatgpt_review     present and boolean; see §3.1.
```

## 4. Review gate (doc 20 §7) — no implementation/refactor before approval

This is the hard boundary between **generating blueprint outputs** (allowed) and **implementing /
refactoring the product** (NOT allowed until approved).

```yaml
# ---------------------------------------------------------------------------
# Review Gate — doc 20 §7  (reinforced by doc 13 §12 and doc 22 §4–§7)
# No implementation/refactor begins until ALL of these conditions hold.
# ---------------------------------------------------------------------------
review_gate:
  conditions:                       # ALL must be true (logical AND)
    - executor_completion_report_exists: true   # a §3 report has been produced for the workpackage
    - chatgpt_review_exists: true               # an independent ChatGPT review of that report exists
    - no_blocking_findings_remain: true         # report status is PASS or PASS_WITH_FINDINGS; blocking_findings == []
    - owner_approves_transition: true           # explicit owner decision (below); NOT inferable, NOT substitutable

  owner_decision_format:            # doc 22 §7 — the owner records exactly one
    - OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
    - OWNER_DECISION: HOLD_FOR_MORE_REVIEW

  on_pass: >-
    Allowed next phase is "Runtime / Refactor Implementation Planning Handoff" (doc 22 §8).
    NOTE: this is still planning — preparing implementation workpackages — not writing product code.

  on_fail: >-
    If ANY condition is false, implementation/refactor MUST NOT begin. Outstanding blocking findings
    are reworked, the ChatGPT review is (re)issued, and the owner decision is re-sought.
```

### 4.1 Global executor forbidden actions (doc 20 §6)

These hold for every executor at all times, independent of the gate. No executor may:

```text
write to the main branch
merge
start runtime implementation
refactor the product
add a connector / deploy / publish
introduce a plugin registry            # Plugin is cancelled — no plugin concept anywhere in Nexus AI
substitute for owner approval
claim production readiness
```

Locked-decision guardrails that the gate must not be routed around:

```text
Plugin stays cancelled (no plugin registry, stage, concept, or field is reintroduced).
A Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] is never treated as an Agent.
Supervisor is never treated as the SDLC Team Lead.
SDLC is never treated as the top-level system (it is one pipeline under the Nexus AI Orchestration Model).
Governance and Audit stay distinct; Evidence and Trace stay distinct.
A release candidate is never allowed before development completion.
Owner approval is never assumed, inferred, or simulated by an executor.
```

### 4.2 Relationship to the final readiness gate (doc 22)

The per-workpackage review gate (§4) is the local instance of the program-level readiness gate.
At program level (doc 22 §5), the following review files must all be `PASS` or
`PASS_WITH_FINDINGS` with **no blocking findings** before the owner approves the implementation
handoff:

```text
sdlc-contract-consistency-audit.md
claude-code-skill-agent-review.md
final-cross-review-summary.md
shared-registry-formalization-review.md
team-agent-subagent-catalog-review.md
governance-audit-readiness-review.md
implementation-readiness-review.md
runtime-refactor-plan-review.md
```

And the doc 22 §6 hard blockers (plugin reintroduced, Core Ability treated as Agent, Supervisor as
SDLC Team Lead, SDLC as top-level system, Governance/Audit merged, Evidence/Trace merged, Shared
Registry + Usage Mapping rule violated, SDLC required gate missing, release candidate before
development completion, owner approval missing) must all be absent.

## 5. Worked example (grounding)

Phases A–E of this very blueprint were executed in exactly this pattern and are the reference
worked example:

```text
Phase A  Claude Code -> configs/nexus-ai/stages/sdlc/*.yaml + JSON schemas        -> PASS_WITH_FINDINGS (findings carried forward)
Phase B  Claude Code -> docs/ai-sdlc-factory/pipeline-catalog/* + catalog config  -> PASS_WITH_FINDINGS
Phase C  Claude Code -> shared registry configs (skills/tools/abilities/...)      -> PASS_WITH_FINDINGS
Phase D  Claude Code -> team/agent/sub-agent catalogs                             -> PASS / PASS_WITH_FINDINGS
Phase E  Claude Code -> governance_profiles.yaml, audit_schemas.yaml              -> PASS_WITH_FINDINGS
```

In every phase: long outputs went to repo files (not chat); every generated file was referenced in
the completion report; assumptions were explicit and open questions were separated from decisions;
no runtime code, no merge, no deploy, and no claim of production readiness was made; and the owner
approval boundary was preserved.

## 6. Related documents

```text
docs/ai-sdlc-factory/executor-standard/README.md            # executor standard overview (doc 20 §9)
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md  # source of §3/§4/§5/§6/§7
docs/ai-sdlc-factory/13-sdlc-completion-full-execution-plan.md
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md
docs/ai-sdlc-factory/07-executor-workpackages.md            # earlier worked workpackage examples (WP-001 … WP-006)
```
