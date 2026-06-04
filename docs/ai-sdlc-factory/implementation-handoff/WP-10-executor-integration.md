# WP-10 — Executor Integration (Implementation Workpackage Spec)

> **Planning artifact — a workpackage SPEC, not the workpackage's execution.**
> This document is the doc 20 §4 workpackage contract for the *executor-integration* component
> of a **future** Nexus AI Orchestration Model runtime workspace. Authoring this spec writes **no
> runtime code**, modifies **no product**, touches **no connector**, performs **no merge/deploy**,
> and reintroduces **no plugin**. It describes *what would be built and how it would be validated*
> if — and only if — a **separate, future, separately-approved execution phase** is authorized by
> the owner. Writing this spec is not executing it. The `nexus` branch stays isolated from `main`.

- **Phase:** Implementation Planning Handoff (doc 22 §8), entered under
  `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` recorded 2026-06-04 (doc 22 §7).
  This phase prepares implementation workpackages; it does **not** carry them out (doc 22 §8 last line).
- **Component:** executor-integration — how the executor environments (Claude Code, Codex,
  Antigravity) integrate with a future runtime under the executor workflow standard, in **both**
  the build-time sense (executors build the runtime) and the run-time sense (an executor invokes the
  running system), preserving the **workpackage → completion report → ChatGPT review → owner
  approval** flow.
- **Source of truth for this component:** its runtime/refactor PLAN doc
  [`../runtime-refactor-plan/executor-integration-plan.md`](../runtime-refactor-plan/executor-integration-plan.md)
  (plan #10 of the doc 21 §5 set) plus the relevant `configs/nexus-ai/...` blueprint artifacts
  named in `canonical_sources` below.
- **Doc-20-contract status:** this file fills every field of the doc 20 §4 workpackage contract,
  plus `depends_on` (the build-sequencing field added by the planning handoff). It contains **no
  code**: `required_outputs` *describe* the modules/artifacts to be built (names + responsibilities),
  they do not provide them.

---

## 1. Workpackage contract (doc 20 §4 + `depends_on`)

```yaml
# ===========================================================================
# Workpackage Contract — doc 20 §4 (+ depends_on for build sequencing)
# Component: executor-integration
# This is a SPEC handed to an executor BEFORE any work starts. It is authored in
# the Implementation Planning Handoff phase (doc 22 §8). Executing it — producing
# runtime code — requires a FURTHER explicit owner decision and is OUT OF SCOPE here.
# ===========================================================================

workpackage_id: WP-10-executor-integration

executor: Claude Code            # doc 20 §3 primary implementer of component logic + docs/tests

reviewer: ChatGPT                # doc 20 §2/§3 reviewer; MUST NOT be the executor (no self-approval).
                                 # Whether an additional runtime-code reviewer is added is an open
                                 # question carried from executor-integration-plan.md §10 — see §8.

depends_on:                      # other workpackage ids that must complete before THIS one is executed
  - WP-09                        # pipeline-runner component (pipeline-runner-plan.md): a run an
                                 #   executor invokes is driven by the pipeline runner, so the
                                 #   invocation surface this WP integrates assumes the runner
                                 #   already exists.
  - WP-05                        # tool-permission-system component (tool-permission-system-plan.md):
                                 #   the run-time surface an executor invokes the running system
                                 #   THROUGH is the tool-permission system, and the executor is
                                 #   bounded by it on every call, so it must exist before executor
                                 #   integration is wired.
                                 # NOTE on numbering: these ids are the implementation-handoff WP
                                 #   series numbers per the README.md index (WP-09 = pipeline-runner,
                                 #   WP-05 = tool-permission-system), which do NOT track the
                                 #   runtime-refactor plan #NN ordering. They are also NOT the legacy
                                 #   WP-05 ("Claude Code SDLC Completion Execution") in
                                 #   docs/ai-sdlc-factory/workpackages/. See open_questions.

objective: >-
  Integrate Claude Code / Codex / Antigravity with the future Nexus AI runtime per the executor
  workflow standard — workpackage in -> completion report out — so that an executor produces
  artifacts and waits at the review gate (no self-approval), every completion report is reviewed by
  ChatGPT, and the owner gate is required before any runtime/refactor transition; and so that, at
  run-time, an executor invokes the running system only as an external caller bounded by the
  tool-permission system and the governance engine, never as an Agent, reviewer, or owner.

mandatory_context:               # the executor MUST load and obey these before producing anything
  - .memory/*                                                       # locked decisions / session memory
  - docs/ai-sdlc-factory/00-decision-log.md                        # locked decisions (K-001 plugin cancelled, K-005 agent model, K-008 Evidence!=Trace, ...)
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md     # the standard this WP integrates (§3 roles, §4 WP, §5 report, §6 forbidden, §7 gate)
  - docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md  # readiness gate, hard blockers (§6), owner decision (§7), prohibited-until-approval (§9)
  - docs/ai-sdlc-factory/runtime-refactor-plan/executor-integration-plan.md  # the component's source-of-truth PLAN (§2 boundary, §4 outputs, §5 flows, §6 roster, §7 governance, §8 audit, §11 owner gate)

canonical_sources:               # authoritative inputs the built artifacts are derived from / bound to
  # -- component plan (primary) --
  - docs/ai-sdlc-factory/runtime-refactor-plan/executor-integration-plan.md
  # -- the executor standard + its profiles + the machine-readable schema (the rule source) --
  - docs/ai-sdlc-factory/executor-standard/README.md
  - docs/ai-sdlc-factory/executor-standard/claude-code.md
  - docs/ai-sdlc-factory/executor-standard/codex.md
  - docs/ai-sdlc-factory/executor-standard/antigravity.md
  - docs/ai-sdlc-factory/executor-standard/completion-report-schema.md
  # -- run-time authorities an invoking executor obeys (incl. depends_on components) --
  - docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md     # WP-05 (depends_on) — the run-time invocation surface an executor goes THROUGH (Skill != Tool preserved)
  - docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md          # authorizes invocations; source of forbidden_actions edge (governance-engine = WP-03, sibling authority)
  - docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md       # where invocation traces + decision records persist (Trace != Evidence)
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md            # WP-09 (depends_on) — the runner an integrated executor is invoked by / reports completion to
  # -- blueprint configs this component reads (run-time authorities + boundary catalogs) --
  - configs/nexus-ai/governance_profiles.yaml                       # governance layers the engine resolves
  - configs/nexus-ai/governance/                                    # 7 governance layer dirs (global/pipeline/team/stage/core-ability/skill/tool)
  - configs/nexus-ai/tools_registry.yaml                            # tool-permission surface (Skill != Tool)
  - configs/nexus-ai/audit_schemas.yaml                             # trace / evidence / decision-record schemas
  - configs/nexus-ai/audit/                                         # evidence_schemas/ + trace_schemas/ dirs
  - configs/nexus-ai/context_memory_profiles.yaml                   # context/memory profiles a run resolves
  # -- boundary catalogs: read ONLY to confirm executor names are absent and STAY absent (plan §2 rule 1) --
  - configs/nexus-ai/core_abilities.yaml                            # 8 Core Abilities, never_agent: true (executor != Core Ability)
  - configs/nexus-ai/agent_roles.yaml
  - configs/nexus-ai/team_lead_roles.yaml
  - configs/nexus-ai/sub_agent_roles.yaml
  - configs/nexus-ai/team_templates.yaml
  - configs/nexus-ai/skills_registry.yaml                           # Skill != Tool; executor != Skill

required_outputs:                # DESCRIBE the modules/artifacts to BUILD (names + responsibilities). NO code here.
  # See §2 for the full responsibility statement of each. All target a FUTURE runtime workspace
  # (decided later); none modifies existing nexus app code; none touches main.
  - name: executor_integration_contract        # spec/interface module
    builds: >-
      The runtime-facing contract that defines an "executor environment" as an EXTERNAL caller —
      its identity, the workpackage it receives, the completion report it returns — with no field,
      type, or enum that would let an executor be registered as an Agent / Team Lead / Sub-agent /
      Core Ability / Skill / Tool. Encodes the doc 20 §4 workpackage shape and doc 20 §5 completion
      report shape as the in/out boundary of the integration.
  - name: workpackage_intake_adapter           # build-time inbound
    builds: >-
      The module that accepts a doc 20 §4 workpackage, performs the context-lock check (plan §5.1
      step 2: plugin not reintroduced, no Core Ability as Agent, Supervisor != SDLC Team Lead,
      Shared Registry + Usage Mapping intact) and HALTS with a BLOCKED outcome on any conflict,
      mirroring the phase-0 context-lock pattern. Never self-approves; never mutates a reviewed artifact.
  - name: completion_report_emitter            # build-time outbound
    builds: >-
      The module that produces exactly one doc 20 §5 completion report per workpackage — status in
      {PASS, PASS_WITH_FINDINGS, BLOCKED} obeying the §1 status rules, full files_created /
      files_modified (every touched file; nothing on main), validation_summary, severity-partitioned
      findings, open_questions kept SEPARATE from decisions, needs_chatgpt_review: true by default.
      Declines any forbidden-action demand and surfaces it as a blocking_finding rather than performing it.
  - name: review_gate_guard                    # the no-self-approval / owner-gate enforcer
    builds: >-
      The module that enforces the doc 20 §7 four-condition gate (completion report exists AND
      ChatGPT review exists AND no blocking findings remain AND owner approves transition) and
      refuses to advance to the next unit or into production on a clean review alone. Encodes
      reviewer != executor and that an executor's PASS about its own output is not a verdict.
  - name: runtime_invocation_client           # run-time outbound (external caller)
    builds: >-
      The module by which an executor environment issues an invocation REQUEST to the running system
      THROUGH the tool-permission surface (tool-permission-system-plan.md) — never a privileged
      side-channel, never a direct out-of-band Core Ability / Tool call. Carries no authority: it
      cannot approve a gate, merge, deploy, publish, or stand in for the owner.
  - name: governance_authorization_hook       # run-time gate (uses the governance-engine, WP-03 sibling authority)
    builds: >-
      The integration point that submits each executor invocation to the governance engine
      (governance-engine-plan.md) for authorization across the 7 layers, treats a `blocker` verdict
      as a denial, records (does not override) major/advisory verdicts, and honors no_policy_bypass.
      The executor is the SUBJECT of governance, never the author of policy.
  - name: invocation_trace_writer             # run-time audit (Trace != Evidence)
    builds: >-
      The module that writes a TRACE of each invocation (which executor invoked what, when, under
      which authorization, with which result) to the audit store (audit-evidence-store-plan.md),
      and records the owner's transition decision as a decision-record. It writes traces of the
      executor's own operations; it NEVER mints evidence items (K-008).
  - name: per_executor_role_binding           # build-time labor division (plan §6)
    builds: >-
      The configuration/binding that assigns build-time labor per environment profile — Claude Code
      (component logic + docs/tests), Codex (repo-oriented contract/schema generation + STATIC
      validation, never pipeline execution), Antigravity (assembly/diagrams/traceability VIEW) —
      WITHOUT changing any profile and WITHOUT promoting any executor into a team/agent role.
  - name: executor_boundary_assertions        # guardrail tests/spec (no executor-as-roster-entry)
    builds: >-
      A machine-checkable assertion set proving the executor names never appear as roster entries in
      agent_roles / team_lead_roles / sub_agent_roles / team_templates / core_abilities /
      skills_registry / tools_registry, and that executor != Supervisor Core Ability. The same scan
      the implementation-readiness review's Core-Ability-as-Agent check would run.
  - name: executor_integration_tests          # required-validation harness (built, not run here)
    builds: >-
      The test/validation suite that exercises the modules above against required_validations
      (status-rule invariants, gate-condition logic, no-self-approval, deny-on-blocker,
      trace-not-evidence, boundary assertions). Authored as part of this WP; actually EXECUTING it
      is part of running the WP, gated by a further owner decision.
  - name: WP-10-executor-integration-build-notes   # the build-time documentation artifact
    builds: >-
      The doc that records the module responsibilities, the build sequence implied by depends_on,
      the assumptions made, and the open questions — kept separate from decisions (doc 20 §8). Long
      outputs live in repo files of the future runtime workspace, not chat.

required_validations:            # checks to run/state BEFORE reporting (when this WP is later executed)
  - canonical_sources_loaded: confirm every canonical_sources path was read and nothing contradicts the locked decisions.
  - context_lock_pass: run the plan §5.1 step-2 context-lock check; any conflict => BLOCKED, stop.
  - boundary_scan_executor_not_roster: assert executor names absent from agent_roles / team_lead_roles / sub_agent_roles / team_templates / core_abilities / skills_registry / tools_registry (plan §2 rule 1).
  - boundary_scan_executor_not_supervisor: assert no module names an executor as the Supervisor Core Ability or any Core Ability (plan §2 rule 3).
  - status_vocabulary_conformance: assert completion_report_emitter only emits PASS | PASS_WITH_FINDINGS | BLOCKED and obeys the §1 status<->findings rules.
  - no_self_approval: assert review_gate_guard rejects advancement when reviewer == executor or when the only signal is the executor's own PASS.
  - owner_gate_required: assert review_gate_guard requires all four doc 20 §7 conditions, including an explicit owner decision, before any transition (plan §11).
  - run_time_through_permissions: assert runtime_invocation_client routes only through the tool-permission surface; no out-of-band Core Ability / Tool call.
  - governance_deny_on_blocker: assert governance_authorization_hook denies on a `blocker` verdict and never overrides a verdict (no_policy_bypass).
  - trace_not_evidence: assert invocation_trace_writer writes traces (and decision-records) only and mints no evidence item (K-008).
  - skill_not_tool_preserved: assert the invocation surface keeps Skill != Tool (uses tools_registry / tool-permission system, not skills as tools).
  - every_file_referenced: assert the completion report lists every created/modified file and that none is on the main branch (doc 20 §8 / §6).

forbidden_actions:               # §3 GLOBAL forbidden actions apply at minimum, PLUS the component-specific ones below
  # -- global (doc 20 §6) — see §3 --
  - write_to_main_branch
  - merge
  - start_runtime_or_refactor_without_a_further_owner_approval   # building runtime code from this spec needs a NEW owner decision
  - add_connector_deploy_or_publish
  - introduce_a_plugin                                            # no executor-plugin, no plugin registry, K-001 stays cancelled
  - self_approve
  - claim_production_readiness
  # -- component-specific --
  - register_an_executor_as_agent_team_lead_subagent_core_ability_skill_or_tool   # executor stays a tool/workbench (plan §2 rule 1)
  - treat_an_executor_as_the_reviewer_or_the_owner                                 # executor authors; ChatGPT reviews; owner decides (plan §2 rule 2)
  - name_an_executor_as_the_supervisor_core_ability                                # executor orchestrates artifacts, Supervisor orchestrates capability (plan §2 rule 3)
  - let_an_executor_bypass_the_tool_permission_system_or_governance_engine         # run-time: request, never reach in (plan §5.2)
  - let_an_executor_override_a_governance_verdict_or_bypass_a_gate                  # no_policy_bypass (plan §7)
  - have_an_executor_mint_evidence_items                                           # executors write traces, not evidence (plan §8; K-008)
  - collapse_build_time_and_run_time_executor_roles                                # "the executor runs the company" is forbidden (plan §2 rule 4)
  - modify_existing_nexus_app_code_or_any_locked_blueprint_config                  # outputs target a FUTURE runtime workspace; this WP changes neither

completion_report_format:        # the executor returns in this exact shape (doc 20 §5 / schema §3)
  schema: docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5
  # See §5 below for the field-by-field template the executor must fill on completion.
```

---

## 2. `required_outputs` — modules/artifacts to build (responsibilities, not code)

The table restates the `required_outputs` above as a build manifest. **Each row is a description of
what to build, not the build itself.** All modules target a *future* Nexus runtime workspace; none
is written here, and none modifies existing nexus app code or any locked blueprint config.

| # | Module / artifact | Responsibility (what it must do) | Plan anchor |
|---|-------------------|----------------------------------|-------------|
| 1 | `executor_integration_contract` | Define executor as an **external caller**; encode the doc 20 §4 / §5 in/out shapes; forbid any field that registers an executor as a roster entry. | §1, §2, §4 |
| 2 | `workpackage_intake_adapter` | Accept a workpackage; run the context-lock check; **BLOCK** on any locked-decision conflict; never self-approve or mutate a reviewed artifact. | §5.1 (2) |
| 3 | `completion_report_emitter` | Emit exactly one doc 20 §5 report; enforce status↔findings rules; list every file; keep open questions separate; decline forbidden actions as blocking findings. | §4, §5.1 (4) |
| 4 | `review_gate_guard` | Enforce the four-condition gate; reviewer ≠ executor; a clean review is **not** authorization to transition. | §5.1 (5–6), §11 |
| 5 | `runtime_invocation_client` | Issue run-time invocation **through** the tool-permission surface; carry **use, never authority**. | §5.2 (1,4) |
| 6 | `governance_authorization_hook` | Submit each invocation to the governance engine; deny on `blocker`; never override a verdict. | §5.2 (2), §7 |
| 7 | `invocation_trace_writer` | Write invocation **traces** + the owner **decision-record** to the audit store; mint **no** evidence. | §5.2 (3), §8 |
| 8 | `per_executor_role_binding` | Bind build-time labor per profile (Claude Code / Codex / Antigravity) without changing profiles or promoting any executor into a role. | §6 |
| 9 | `executor_boundary_assertions` | Prove executor names are absent from all roster catalogs and that executor ≠ Supervisor. | §2 (rules 1,3) |
| 10 | `executor_integration_tests` | Validation harness for all of the above (authored here; **executed** only when the WP is run). | §5, §7, §8 |
| 11 | `WP-10-executor-integration-build-notes` | Record responsibilities, build order, assumptions, and open questions; long outputs to files. | §4, doc 20 §8 |

---

## 3. Global forbidden actions (doc 20 §6) — inherited by this WP

Per the planning handoff, **every** workpackage carries the global forbidden actions verbatim. They
hold for the executor at all times, independent of any gate, and are repeated here so this spec
stands alone:

```text
- write to main                                  (the nexus branch never merges to main)
- merge
- start runtime/refactor without a further owner approval   (authoring this spec is NOT that approval)
- add a connector / deploy / publish
- introduce a plugin                             (Plugin is cancelled — no plugin, registry, stage, or concept anywhere)
- self-approve                                   (an executor's PASS about its own output is not a verdict)
- claim production readiness
```

Locked-decision guardrails this WP must not be routed around (doc 20 §4.1 / doc 22 §6):

```text
Plugin stays cancelled.
A Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] is never treated as an Agent.
Supervisor is never treated as the SDLC Team Lead.
SDLC is never treated as the top-level system.
Governance and Audit stay distinct; Evidence and Trace stay distinct.
Skill != Tool.
A release candidate is never allowed before development completion.
Owner approval is never assumed, inferred, or simulated by an executor.
```

The component-specific forbidden actions (executor never a roster entry, never reviewer/owner, never
Supervisor, never bypasses permissions/governance, never mints evidence, never collapses build-time
and run-time, never modifies existing app code/locked config) are listed in the `forbidden_actions`
block of §1 and are additive to — not a substitute for — the global list above.

---

## 4. `depends_on` rationale and build sequencing

This WP integrates the executor with two run-time authorities, so it can only be **executed** after
those authorities exist:

- **WP-09 — pipeline-runner** (`pipeline-runner-plan.md`). A run that an executor invokes is driven by
  the pipeline runner; the invocation surface this WP integrates assumes that runner exists. (Note:
  `executor-integration-plan.md` §10 names the governance engine, tool-permission system, and audit
  store as its direct sibling dependencies; the pipeline-runner is the runtime the executor builds and
  invokes elsewhere in the plan, and the dependency on WP-09 is the build-sequencing decision recorded
  here at handoff — see open questions.)
- **WP-05 — tool-permission-system** (`tool-permission-system-plan.md`). Every executor invocation goes
  **through** the tool-permission system as an external caller, and the build-time `forbidden_actions`
  edge is its executor-facing face (plan §5.2, §7). The tool-permission system must exist before
  executor integration is wired. This dependency **is** explicit in `executor-integration-plan.md` §10.

Sequencing: WP-05 and WP-09 complete (each with its own completion report + ChatGPT review + the
program-level owner gate) **before** WP-10 is executed. WP-10 itself produces no transition; the
doc 20 §7 / doc 22 §7 owner gate governs every move out of planning.

---

## 5. `completion_report_format` — the shape the executor returns

When this WP is later executed (under a further owner decision), the executor returns exactly one
report in the doc 20 §5 shape. Template (bound to
[`../executor-standard/completion-report-schema.md`](../executor-standard/completion-report-schema.md) §3):

```yaml
workpackage_id: WP-10-executor-integration     # MUST match this contract
executor: Claude Code                          # the role that did the work
status:                                        # PASS | PASS_WITH_FINDINGS | BLOCKED (obey schema §1 rules)

files_created:                                 # every NEW file in the future runtime workspace (none on main)
  - []
files_modified:                                # every CHANGED file (never anything on main; never existing nexus app code)
  - []

validation_summary:                            # one line per required_validation in §1 with its result
  - []

blocking_findings:                             # MUST be [] for PASS / PASS_WITH_FINDINGS; non-empty => BLOCKED
  - []
major_findings:                                # significant, non-blocking; carried forward
  - []
minor_findings:                                # nits / cosmetic
  - []

open_questions:                                # questions for reviewer/owner — SEPARATE from decisions
  - []

needs_chatgpt_review: true                     # reviewer is ChatGPT; the gate requires the review regardless of status
```

Field invariants the report must satisfy (schema §3.2): `workpackage_id` matches this contract;
`executor` matches; `status` obeys the status↔findings rules; `files_created` + `files_modified`
cover every touched file and include nothing on `main`; `blocking_findings` non-empty ⇔ `BLOCKED`;
`open_questions` are questions only; `needs_chatgpt_review` present and boolean.

---

## 6. Review gate and owner-approval dependency (restated, load-bearing)

This WP — like the component plan it derives from — stops at the owner gate. Authoring this spec is
allowed now (it is a planning artifact under the executor standard). **Executing it is not**, until
all four doc 20 §7 conditions hold at the program level: the completion report exists, an
independent ChatGPT review exists, no blocking finding remains, **and** the owner explicitly records
`OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` for the move from this planning phase into
actual implementation (the only other legal value is `HOLD_FOR_MORE_REVIEW`). Even on `APPROVE`, the
phase that approval opened (doc 22 §8) is *planning the workpackages* — which is what this document
is — **not** writing the runtime code those workpackages describe. Producing that code is a further,
separately-approved step. Until it is approved, everything in doc 22 §9 stays prohibited: runtime
code change, product refactor, connector integration, Nexus publish, deploy, `main` merge,
production-readiness claim.

---

## 7. Completion criteria for THIS spec (doc-level)

- [x] File exists at `docs/ai-sdlc-factory/implementation-handoff/WP-10-executor-integration.md`.
- [x] Contains every doc 20 §4 field plus `depends_on`.
- [x] `required_outputs` **describe** modules/artifacts (names + responsibilities); contain **no code**.
- [x] `depends_on: [WP-09, WP-05]` recorded with rationale (§4).
- [x] Global forbidden actions (doc 20 §6) included verbatim (§3) plus component-specific ones (§1).
- [x] `canonical_sources` include `runtime-refactor-plan/executor-integration-plan.md` and the
      relevant `configs/nexus-ai/...` files.
- [x] Executor ≠ Agent / Reviewer / Owner / Supervisor boundary carried throughout.
- [x] Owner-approval dependency restated and load-bearing (§6); writing this spec executed nothing.

---

*Documentation / blueprint only. This is a workpackage SPEC authored in the Implementation Planning
Handoff phase (doc 22 §8). Authoring it wrote no runtime code, modified no product, touched no
connector, performed no merge/deploy, and reintroduced no plugin. The modules it names are built —
and this WP is executed — only under a further explicit owner decision. The `nexus` branch never
merges to `main`.*
