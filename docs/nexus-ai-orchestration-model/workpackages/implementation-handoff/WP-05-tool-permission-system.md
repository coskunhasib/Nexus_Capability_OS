# WP-05 — Tool Permission System (Implementation Workpackage Spec)

- **Nature:** Implementation **workpackage spec** (a PLANNING artifact). This document specifies WHAT a future, separately-approved execution phase would build for the tool-permission-system component, and HOW that build would be validated. **It contains no runtime code, configures nothing, wires nothing, and activates nothing.**
- **Phase:** Runtime / Refactor Implementation Planning Handoff (doc 22 §8). Authoring this spec is **not** executing it. Producing the runtime code described here requires a *further* explicit owner decision and is out of scope for this document.
- **Contract:** doc 20 §4 (Workpackage contract) + `depends_on` (build-sequencing addition). Global forbidden actions per doc 20 §6.
- **Source of truth for this component:** `docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md` (the runtime/refactor PLAN) plus the blueprint configs it consumes. This spec is **subordinate** to that plan and to the doc 22 readiness gate; it does not redesign, extend, or contradict either.

> **STOP RULE.** Nothing here authorizes a runtime code change, a product refactor, a connector integration, a deploy/publish, a main-branch merge, or a plugin registry. The implementation target is a **future Nexus runtime workspace (to be decided later)**; this workpackage does **not** modify the existing nexus app code and does **not** touch `main`. The `nexus` branch stays isolated.

---

## workpackage_id

`WP-05-tool-permission-system`

## executor

**Codex** (repo-oriented contract/module generation and validation helper; doc 20 §3, doc 07 §3.2). The executor implements the spec; it is not an architectural decision-maker and does not self-approve (doc 07 §1).

## reviewer

**ChatGPT** (reviewer / auditor / plan owner; doc 20 §3, §7). The owner is the final decision-maker. The executor may not substitute for, infer, or simulate either the reviewer verdict or the owner approval (doc 22 §7).

## depends_on

- **WP-01** — shared registry loader (`docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md`). Provides the parsed, validated `tools_registry.yaml`, `governance/tool/tools.yaml`, and referenced governance/audit registries that this system consumes at load time. WP-05 does not re-parse or re-validate the registry files itself; it receives them from the loader and runs only its own load-time invariant check (§4 of the plan).
- **WP-02** — core-abilities-alignment (`docs/ai-sdlc-factory/runtime-refactor-plan/core-abilities-alignment.md`). Keeps the Core Ability names [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] locked, so WP-05 can consume the `provided_by_core_ability` labels read-only and structurally exclude every Core Ability id (and `Supervisor`) from `allowed_callers`. WP-05 never turns a Core Ability into a caller or agent. (Policy resolution itself is delegated to the governance-engine, WP-03, a sibling seam — not this WP-02 dependency.)

> Build-sequencing note: WP-05 cannot be executed until WP-01 and WP-02 are themselves executed and reviewed. This is a dependency for a *future* build, recorded here for ordering; it is not a trigger to begin any build.

---

## objective

Specify a **tool permission / sandbox enforcement** component that, when later built, evaluates every tool invocation in Nexus AI against the contracts that **already exist** in the blueprint and returns **ALLOW or DENY** — never letting a high-risk or side-effecting tool run ungated.

Concretely, the future component enforces, per tool, the fields declared in `configs/nexus-ai/tools_registry.yaml` — `requires_sandbox`, `risk_level`, `side_effects`, `allowed_callers`, `allowed_usage`/`forbidden_usage`, `governance_profiles`, `audit_schemas`, `provided_by_core_ability`, `used_by` — under the evaluable rules in `configs/nexus-ai/governance/tool/tools.yaml` (6 tool-scope profiles, the 7-class side-effect taxonomy, and the timeout ceilings). It:

- enforces **caller least-privilege** (`allowed_callers`) and **intent scope** (`allowed_usage`/`forbidden_usage`);
- enforces **sandbox + timeout** for every non-`read_only` (side-effecting) tool;
- applies **composite default-deny** for every `risk_level: high` tool;
- enforces **secret/credential safety** and the strictest binding on the OS execution surface;
- emits a **trace** (`tool_call_trace_schema`) for every decision and **evidence** (`evidence_item_schema`) for gate-feeding calls, holding Evidence != Trace and Governance != Audit throughout;
- routes the **sandbox/execution broker** guarantees (isolation, timeout, egress control, OS escalation control, execution-fact trace).

The component **invents no tools, no permissions, no risk levels, and no governance policy.** It consumes and enforces what the registries declare; it is a decision point, not a policy author. It is self-validated by the existing stage-18 `tool_misuse_tester` loop (it exposes `TOOL_PERMISSION_MAP` consumable without transformation), and it is **inert until owner approval** clears the doc 22 readiness gate.

**Objective boundary (locked):** This spec describes WHAT to build and HOW it will be validated. It is not the build. The objective is satisfied by *producing the module specifications and validation plan below*, not by producing runtime code.

---

## mandatory_context

Before any future execution of this workpackage, the executor MUST have read and internalized:

1. **The component plan (primary source of truth):** `docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md` — in full. Sections that are load-bearing for this WP: §1 (objective + locked boundaries §1.1), §4 (tool classification model / 7 classes), §5 (five-gate ALLOW/DENY model + §5.1 decision pseudocode), §6 (sandbox broker contract), §7 (high-risk/side-effecting gating summary), §8 (self-audit loop), §9 (sibling integration seams), §11 (validation targets), §12 (owner-approval dependency).
2. **The workpackage contract:** `docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md` §4 (fields), §5 (completion report), §6 (global forbidden actions), §7 (review gates).
3. **The Codex executor standard:** `docs/ai-sdlc-factory/executor-standard/codex.md` and `docs/ai-sdlc-factory/executor-standard/README.md`; completion-report shape in `docs/ai-sdlc-factory/executor-standard/completion-report-schema.md`.
4. **The readiness gate / stop rule:** `docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md` (§6 hard blockers, §7 owner decision, §8 allowed next phase, §9 prohibited-until-approval).
5. **The locked concept boundaries:** `docs/ai-sdlc-factory/01-core-definitions.md`, `docs/ai-sdlc-factory/02-concept-boundaries.md`, `docs/ai-sdlc-factory/03-governance-and-audit-layering.md` (§3 global rules, §9 tool governance, §12 trace). Locked: no plugin; Core Abilities [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] are NOT agents and NEVER callers; Supervisor != team lead and not a permission authority; Skill != Tool (this system gates tools only); Governance != Audit; Evidence != Trace.
6. **The dependency plans (build seams):** `docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md` (WP-01) and `docs/ai-sdlc-factory/runtime-refactor-plan/core-abilities-alignment.md` (WP-02), plus the adjacent seams in `governance-engine-plan.md` (WP-03), `audit-evidence-store-plan.md`, `pipeline-runner-plan.md`, `executor-integration-plan.md`.

---

## canonical_sources

The spec's required outputs MUST be derived only from these artifacts. None of them is modified by this workpackage; all are read-only inputs.

**Primary (the contracts the component enforces):**

- `docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md` — the component's authoritative plan (source of truth for this WP).
- `configs/nexus-ai/tools_registry.yaml` — authoritative per-tool contract (81 tools): `requires_sandbox`, `risk_level`, `side_effects`, `allowed_callers`, `allowed_usage`/`forbidden_usage`, `governance_profiles`, `audit_schemas`, `provided_by_core_ability`, `used_by`; plus the `side_effect_rule` block and the `registry_self_check` invariant (`side_effect_tools_require_sandbox_gov_trace: true`).
- `configs/nexus-ai/governance/tool/tools.yaml` — applicable tool-scope governance: the 6 profiles (`tool_call_permission_governance`, `side_effecting_tool_governance`, `high_risk_tool_governance`, `tool_no_secret_exposure_governance`, `os_system_access_tool_governance`, `read_only_tool_governance`), each rule's `pass_condition`/`fail_condition`/`severity`/`on_fail`/`rework_route`/`required_evidence`/`required_trace`/`owner`; the 7-class `tool_class_taxonomy`; the `timeout_policy` ceilings (`tool_timeout_ceiling`).

**Supporting (referenced by id; not redefined here):**

- `configs/nexus-ai/governance_profiles.yaml` — global posture this component honors: `high_risk_action_default_deny`, `no_policy_bypass`, `trace_required` (encompassing `no_silent_mutation`), `no_secret_exposure` / `raw_credential_redaction`, `evidence_required`; tool-scope `sandbox_execution_governance`.
- `configs/nexus-ai/audit_schemas.yaml` (+ `configs/nexus-ai/audit/trace_schemas/`, `configs/nexus-ai/audit/evidence_schemas/`) — defines `tool_call_trace_schema` (trace) and `evidence_item_schema` (evidence) record shapes the component emits. Persistence is owned by the audit/evidence store (sibling plan), not by this component.
- `configs/nexus-ai/core_abilities.yaml` — source for `provided_by_core_ability` labels and the Web/OS/Memory `exposed_tools` (e.g. `shell_exec`, `process_run`, `file_write`, `web_*`, `memory_*`). Used as a **label only**; never as a caller.
- `configs/nexus-ai/stages/sdlc/11-implementation.yaml` and `configs/nexus-ai/stages/sdlc/18-ai-agent-safety-evaluation.yaml` — origin of `TOOL_PERMISSION_MAP` (emitted at stage 11) and consumer `tool_misuse_tester` / `TOOL_MISUSE_TEST_REPORT` (stage 18); the self-audit loop this component plugs into.

---

## required_outputs

The following are the **modules/artifacts to be BUILT** by a future execution phase — **names + responsibilities only**. No code, no schemas, and no config are produced by *this* spec; the entries below describe deliverables the later build would create in the future Nexus runtime workspace (location TBD; **not** this repo, **not** `main`).

> Every output below is a *specification of a thing to build later*. Writing this list is not building it.

1. **`tool_registry_view`** — Read-only accessor over the loader-supplied (WP-01) parsed `tools_registry.yaml`. Responsibility: expose per-tool `requires_sandbox`, `risk_level`, `side_effects`, `allowed_callers`, `allowed_usage`/`forbidden_usage`, `governance_profiles`, `audit_schemas`, `provided_by_core_ability`, `used_by`. Performs no parsing or mutation; receives the validated registry from WP-01.
2. **`tool_class_classifier`** — Pure function mapping a tool's `side_effects` string to exactly one of the 7 side-effect classes (`read_only`, `external_network`, `artifact_write`, `evidence_write`, `state_write`, `file_write`, `code_execution`) per plan §4 and the `tool_class_taxonomy`. Responsibility: derive class, assert `requires_sandbox == (class != read_only)`, and honor the single documented exception `script_static_analyzer` (treated as `read_only` for sandbox purposes). Invents no class.
3. **`load_time_invariant_checker`** — Validates, at load, that no tool with `side_effects != none` carries `requires_sandbox: false` (except the documented `script_static_analyzer`), enforcing the registry's `registry_self_check.side_effect_tools_require_sandbox_gov_trace`. Responsibility: **FAIL the load** on any violation — never silently downgrade. Also asserts that no Core Ability id and no `Supervisor` appears in any `allowed_callers`.
4. **`caller_authorization_gate`** — Gate 1 (least privilege). Responsibility: deny unless `caller_id ∈ allowed_callers` for the tool, per `tool_call_permission_governance.caller_in_allowed_callers`. Structurally rejects Core Ability ids and `Supervisor`.
5. **`intent_scope_gate`** — Gate 2. Responsibility: deny unless `intent ∈ allowed_usage AND intent ∉ forbidden_usage`, per `tool_call_permission_governance.intent_within_allowed_usage`.
6. **`sandbox_timeout_gate`** — Gate 3 (side-effecting/high-risk only). Responsibility: for any non-`read_only` class, deny unless `execution_context.sandbox == true AND timeout is set AND timeout ≤ tool_timeout_ceiling`, per `side_effecting_tool_governance` (`…requires_sandbox` + `…requires_timeout`) and the `timeout_policy` ceilings.
7. **`high_risk_default_deny_gate`** — Gate 4. Responsibility: for any `risk_level: high` tool, deny unless caller-allowed AND in-declared-scope AND sandboxed AND timed AND traced (composite), per `high_risk_tool_governance.high_risk_default_deny_unless_permitted`. No "allow anyway" branch.
8. **`secret_safety_gate`** — Gate 5. Responsibility: deny any raw secret read/emit (`tool_no_secret_exposure_governance`, `raw_credential_redaction`); apply the additional `os_system_access_tool_governance` binding to OS tools.
9. **`permission_decision_engine`** — Orchestrates the five gates in order and the orthogonal always-on trace precondition, returning a single `ALLOW`/`DENY` verdict with a machine-readable deny reason, exactly mirroring plan §5 / §5.1. Responsibility: invoke `governance_engine.resolve(...)` (WP-03, the governance-engine) for the policy verdict and return DENY whenever the engine returns non-`PERMIT` — there is **no code path that returns ALLOW when the engine denies** (`no_policy_bypass`). Default-deny posture overall.
10. **`sandbox_execution_broker`** — Contract-level execution broker for non-`read_only` classes per plan §6. Responsibility: guarantee isolation (the call cannot touch host/production state; `forbidden_usage` "…production…" clauses are enforced as sandbox-target assertions, not honor-system text), bounded timeout (`≤ tool_timeout_ceiling`), egress control for `external_network` tools (no secret outbound), strictest binding for the OS surface (`shell_exec`, `process_run`, `file_write`), and recording of sandbox flag / timeout / side-effect target into the trace. **The isolation *mechanism* (container, jailed worker, etc.) is deliberately NOT chosen here** (plan §6, §10); this output fixes the guarantees the broker must satisfy, not the technology.
11. **`trace_emitter`** — Emits a `tool_call_trace_schema` record for **every** evaluation (ALLOW and DENY). Responsibility: open the trace before gate evaluation; a side-effecting call that cannot emit a trace is denied (`no_silent_mutation`). Hands records to the audit/evidence store (sibling plan) for persistence; does not persist itself.
12. **`evidence_emitter`** — For gate-feeding calls only, emits an `evidence_item_schema` record alongside (and **distinct from**) the trace. Responsibility: hold Evidence != Trace — never collapse the two records.
13. **`tool_permission_map_exposer`** — Exposes the resolved (tool → allowed_callers → risk → sandbox) view as `TOOL_PERMISSION_MAP`, byte-compatible with what stage 11 emits and stage 18's `tool_misuse_tester` consumes, with no transformation. Responsibility: keep the self-audit loop (plan §8) wired by construction.
14. **`decision_point_api`** — The single integration entry point `DECIDE(tool_id, caller_id, intent, execution_context) → ALLOW|DENY` called by the pipeline runner (WP / sibling) before any stage `uses_tools` invocation, and by the executor-integration seam for executor tool use. Responsibility: be the sole permission authority surface; no caller bypasses it.
15. **`component_specification_document`** — A written design/build spec (in the future runtime workspace) that ties the modules above to their canonical source rules, records the `script_static_analyzer` exception so a later implementer does not "fix" it, and enumerates the deferred decisions (isolation mechanism, candidate-tool ratification, persistence) as out-of-scope per plan §10. Responsibility: traceability — every module maps to a rule id in `governance/tool/tools.yaml` or a field in `tools_registry.yaml`.

> **Not in scope as outputs (deferred per plan §10):** the chosen sandbox/isolation mechanism; the governance engine internals (WP-03 / `governance-engine-plan.md`); trace/evidence persistence (`audit-evidence-store-plan.md`); ratification of the 35 `candidate` tools; any **new** tool, permission, risk level, or governance profile.

---

## required_validations

When the component is eventually built (after a separate owner approval), the build must be verifiable against these targets — all derived from existing artifacts, none new (plan §11). This WP's executor must specify the validation plan; running it belongs to the build phase, and the *authoritative* regression check is the existing stage-18 loop, not ad-hoc testing.

1. **Load-time invariant** — The build refuses to load if any tool with `side_effects != none` has `requires_sandbox: false` (except the documented `script_static_analyzer`). Asserted against `registry_self_check.side_effect_tools_require_sandbox_gov_trace`.
2. **Caller least-privilege** — For all 81 tools, a `caller_id` absent from `allowed_callers` is denied; no Core Ability id and no `Supervisor` ever appears as a caller.
3. **Intent scope** — A call whose `intent` is in `forbidden_usage` (or not in `allowed_usage`) is denied (e.g. `repo_writer` used to merge/deploy).
4. **High-risk default-deny** — Every `risk_level: high` tool is denied unless caller-allowed AND in-scope AND sandboxed AND timed AND traced.
5. **Side-effect sandbox+timeout** — Every non-`read_only` class call without a sandbox, or without a timeout, or with a timeout exceeding the class ceiling, is denied.
6. **Trace completeness** — Every decision (ALLOW and DENY) produces a `tool_call_trace_schema` record; gate-feeding calls additionally produce a distinct `evidence_item_schema` record; Evidence != Trace preserved.
7. **No-bypass** — There is no code path that returns ALLOW when the governance engine (WP-03) returns non-`PERMIT` (`no_policy_bypass`).
8. **OS-surface strictness** — `shell_exec`, `process_run`, `file_write` additionally bind `os_system_access_tool_governance` and resolve to the strictest default-deny.
9. **Self-audit consumability** — The exposed `TOOL_PERMISSION_MAP` is consumed by stage-18 `tool_misuse_tester` without transformation; a permission-model regression surfaces as a stage-18 `TOOL_MISUSE_TEST_REPORT` finding.
10. **No plugin / no merge / no deploy** — The build has no plugin loader, performs no merge, and triggers no deploy/publish (cross-checked against the global forbidden actions below and the `plugin_absent` guard).
11. **Boundary integrity** — Governance != Audit and Skill != Tool are upheld: the component enforces governance and emits audit, does not gate skills, and references audit schemas by id without defining them.

> The overall produced plan set (including the source plan this WP derives from) is reviewed in `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` (doc 21 §10). This WP's own completion is reviewed per doc 20 §7.

---

## forbidden_actions

### Global forbidden actions (doc 20 §6 — apply to every workpackage)

- Write to `main`.
- Merge (any branch into any branch; `nexus` NEVER merges to `main`).
- Start a runtime implementation or product refactor **without a further explicit owner approval**.
- Add any connector / deploy / publish.
- Introduce a plugin (no plugin registry, no plugin loader, no plugin tool — ever).
- Self-approve (the executor may not substitute for, infer, or simulate the reviewer verdict or owner approval).
- Claim production readiness.

### Component-specific forbidden actions (from the plan's locked boundaries)

- Treat any Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] as an Agent, a tool, or an `allowed_caller`; or rename/convert a Core Ability into an agent. (Core Ability names are locked.)
- Treat **Supervisor** as a team lead, approver, or permission authority.
- Gate, load, or otherwise treat any **Skill** as a Tool (this component gates tools only; skill governance lives elsewhere).
- Merge or collapse **Governance and Audit**, or **Evidence and Trace** (the two records stay distinct; audit schemas are referenced by id, never redefined here).
- Invent a new tool, permission, risk level, side-effect class, or governance profile; downgrade a side-effecting tool to `requires_sandbox: false`; or "fix" the documented `script_static_analyzer` exception into a sandbox class.
- Add an "allow anyway" / policy-bypass branch, or return ALLOW when the governance engine returns non-`PERMIT`.
- Author or duplicate policy (policy resolution is delegated to the governance engine, WP-03).
- Choose the sandbox/isolation **mechanism**, ratify `candidate` tools, or design trace/evidence persistence (all deferred per plan §10).
- Begin **any** of the above build work before the doc 22 readiness gate clears: required reviews `PASS`/`PASS_WITH_FINDINGS` with no blocking findings, no hard blocker present (doc 22 §6), and an explicit `OWNER_DECISION` authorizing the transition (doc 22 §7).

---

## completion_report_format

On future execution, the executor returns exactly this shape (doc 20 §5; mirrors `docs/ai-sdlc-factory/executor-standard/completion-report-schema.md`):

```yaml
workpackage_id: WP-05-tool-permission-system
executor: Codex
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created: []          # paths of artifacts produced (in the future runtime workspace; never in main)
files_modified: []         # paths modified (none in this repo; loader/governance contracts are read-only)
validation_summary:        # result per required_validations item 1–11 (target met / not met / not yet runnable)
blocking_findings: []      # anything that violates a forbidden action or a locked boundary
major_findings: []
minor_findings: []
depends_on_status:         # confirmation that WP-01 and WP-02 outputs are present and consumed
  WP-01: present | missing
  WP-02: present | missing
open_questions: []         # kept strictly separate from decisions
needs_chatgpt_review: true
```

> No hidden background-work claim; long outputs go into repo files, not chat; every produced file is referenced above; assumptions are explicit and separate from open questions (doc 20 §8).

---

## Closing boundary restatement

This document is a **workpackage spec**, not an implementation. It describes the tool-permission-system modules a future, separately-approved execution phase would build, and how that build would be validated against the existing `tools_registry.yaml` and `governance/tool/tools.yaml` contracts. Producing this spec is not executing it. The transition out of planning — and any production of runtime code — is gated by an explicit owner decision (doc 22 §7); absent that, the standing decision is `HOLD_FOR_MORE_REVIEW` and no implementation may begin. The `nexus` branch remains isolated from `main`.
