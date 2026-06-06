# Tool Permission System Plan (Planning-Only)

- **Plan id:** tool-permission-system-plan
- **Phase:** G/H — Runtime / Refactor Planning-Only (parent: `docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md` §4 "Tool permission system plan", §5 required output `docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md`)
- **Nature:** Documentation / blueprint. **PLANNING ONLY.** This document describes HOW a future tool permission / sandbox system *would* work. It does **not** implement, configure, wire, or activate anything.
- **Top structure:** Nexus AI Orchestration Model (the SDLC is one pipeline; this system is a substrate that serves all pipelines).

> **STOP RULE (doc 21 §3 non-goals; doc 22 §6/§9).** Nothing in this plan is a runtime code change, a product refactor, a connector integration, a deploy/publish, a main-branch merge, or a plugin registry. Every section is a *plan for a future implementation workpackage*, not the implementation. The transition from this plan to any build work is gated by an explicit owner decision (§12).

---

## 1. Objective

Describe a tool permission / sandbox system that, when later built, would make every tool call in Nexus AI evaluable against the contracts that **already exist** in the blueprint:

- the **tool definitions** in `configs/nexus-ai/tools_registry.yaml` (81 tools, each carrying `requires_sandbox`, `risk_level`, `side_effects`, `allowed_callers`, `governance_profiles`, `audit_schemas`, `provided_by_core_ability`, `used_by`); and
- the **applicable tool-scope governance layer** in `configs/nexus-ai/governance/tool/tools.yaml` (6 governance profiles, a 7-class side-effect taxonomy, and per-rule `pass_condition`/`fail_condition`/`on_fail`).

The system's single job is: **given a (tool_id, caller_id, intent, execution_context) it returns ALLOW or DENY, and never lets a high-risk or side-effecting tool run ungated.** It is a permission/sandbox **enforcement plan** — it does not invent new tools, new permissions, or new policy; it consumes what the registries declare.

### 1.1 What this system is NOT (locked boundaries)

| Boundary | Rule |
|---|---|
| Plugin | There is **no plugin registry and no plugin tool**, ever (locked; `plugin_absent` global guard). This system loads only `tools_registry.yaml`; there is no plugin loader to plan. |
| Core Ability vs tool | A Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] is **never a tool and never an `allowed_caller`**. A tool MAY be a Core Ability sub-operation (`provided_by_core_ability`), but the Core Ability never calls itself. Callers are **Agent roles / team leads** only (D-014). Canonical Core Ability names are preserved and never converted to agents. |
| Supervisor | Supervisor is a Core Ability, not a team lead and not an approver. It is not a caller and not a permission authority in this system. |
| Skill vs Tool | None of the 18 skills in `configs/nexus-ai/skills_registry.yaml` are tools; this system does not load or gate skills. Skill governance lives in `configs/nexus-ai/governance/skill/`. |
| Governance vs Audit | This system **enforces** governance (Policy \| Gates \| Permissions \| Risk Rules) and **emits** audit (Evidence + Trace) — it never merges them. It *references* audit schemas by id; it does not define them. |
| Evidence vs Trace | Every tool call emits a **trace** (provenance: `tool_call_trace_schema`); a tool whose output feeds a gate also emits **evidence** (`evidence_item_schema`). The two are distinct records and are never collapsed. |

---

## 2. Blueprint artifacts this plan builds on

This is a *plan*, so it inventories the concrete artifacts a future implementation would read. All paths are load-bearing inputs; none is modified by this plan.

### 2.1 Primary inputs (the contracts the system enforces)

| Artifact | What the system uses from it |
|---|---|
| `configs/nexus-ai/tools_registry.yaml` | **Authoritative tool contract.** Per-tool `requires_sandbox`, `risk_level` (low/medium/high), `side_effects`, `allowed_callers`, `governance_profiles`, `audit_schemas`, `provided_by_core_ability`, `allowed_usage`/`forbidden_usage`, `used_by`. The `side_effect_rule` block and `registry_self_check` invariant `side_effect_tools_require_sandbox_gov_trace: true`. |
| `configs/nexus-ai/governance/tool/tools.yaml` | **Applicable tool-scope governance.** 6 profiles — `tool_call_permission_governance`, `side_effecting_tool_governance`, `high_risk_tool_governance`, `tool_no_secret_exposure_governance`, `os_system_access_tool_governance`, `read_only_tool_governance` — each with §5 rules (`pass_condition`/`fail_condition`/`severity`/`on_fail`/`rework_route`/`required_evidence`/`required_trace`/`owner`), the 7-class side-effect taxonomy, and the `timeout_policy` ceilings. |
| `configs/nexus-ai/governance_profiles.yaml` | **Governance catalog (existence).** Global profiles this system honors as default posture: `high_risk_action_default_deny`, `no_policy_bypass`, `trace_required` (encompasses `no_silent_mutation`), `no_secret_exposure` / `raw_credential_redaction`, `evidence_required`. Tool-scope `sandbox_execution_governance`. |

### 2.2 Secondary / referenced inputs

| Artifact | Relationship |
|---|---|
| `configs/nexus-ai/audit_schemas.yaml` + `configs/nexus-ai/audit/trace_schemas/` + `configs/nexus-ai/audit/evidence_schemas/` | Define `tool_call_trace_schema` (trace) and `evidence_item_schema` (evidence) record shapes the system emits. The audit/evidence store plan (`audit-evidence-store-plan.md`) owns persistence; this plan only emits. |
| `configs/nexus-ai/core_abilities.yaml` | Source for `provided_by_core_ability` labels and the Web/OS/Memory `exposed_tools` (e.g. `shell_exec`, `process_run`, `file_write`, `web_*`, `memory_*`). Used as a **label** only; never as a caller. The Core Abilities alignment plan (`core-abilities-alignment.md`) is the sibling that keeps the names locked. |
| The 31 SDLC stage contracts `configs/nexus-ai/stages/sdlc/*.yaml` + 5 catalog pipelines | Source of `used_by` usage mapping and the `TOOL_PERMISSION_MAP` / `CONTEXT_POLICY` artifacts that stage 11 (implementation) emits and stage 18 (ai_agent_safety_evaluation) consumes. |
| `docs/ai-sdlc-factory/03-governance-and-audit-layering.md` §9 (Tool Governance), §3 (global rules), §12 (trace) | Conceptual basis: side-effecting tools require sandbox + timeout + trace; high-risk default deny; every governed action traced. |
| Sibling runtime-refactor plans: `governance-engine-plan.md`, `audit-evidence-store-plan.md`, `shared-registry-loader-plan.md`, `pipeline-runner-plan.md`, `executor-integration-plan.md` | This system is **called by** the governance engine / pipeline runner at each tool invocation and **loaded by** the shared registry loader. §9 maps the seams. |

---

## 3. Position in the runtime architecture (planned)

```text
            Pipeline Runner ──► Stage owner_agent wants to call a tool
                                          │  (tool_id, caller_id, intent, execution_context)
                                          ▼
                              ┌───────────────────────────┐
                              │  TOOL PERMISSION SYSTEM    │  ◄── this plan
                              │  (permission + sandbox      │
                              │   decision point)           │
                              └───────────────────────────┘
              reads (load-time)│            │ emits (per call)
        ┌────────────────────┐ │            │ ┌──────────────────────────┐
        │ tools_registry.yaml│◄┘            └►│ trace: tool_call_trace_   │ ──► Audit/Evidence
        │ governance/tool/   │                │ schema  (every call)      │     Store (sibling
        │   tools.yaml       │                │ evidence: evidence_item_  │     plan)
        │ governance_profiles│                │ schema (gate-feeding calls)│
        └────────────────────┘                └──────────────────────────┘
                    │ delegates policy resolution to
                    ▼
            Governance Engine (sibling plan) — resolves Global→…→Tool scope,
            severity, no_policy_bypass, owner-decision boundary
```

The tool permission system is a **decision point**, not a policy author. It composes:
1. the **registry contract** for the tool (what the tool *is* and who may call it),
2. the **governance engine's** resolved verdict (whether policy permits this call), and
3. a **sandbox/execution broker** (whether the call ran inside an isolated, time-bounded context).

It returns ALLOW only if all three agree; otherwise DENY (default-deny posture, §5).

---

## 4. Tool classification model (derived, not invented)

The future system would classify each registered tool into exactly one **side-effect class** using only fields already present in `tools_registry.yaml`. This mirrors the 7-class taxonomy already written in `governance/tool/tools.yaml` (`tool_class_taxonomy`).

| Class | Trigger field (`side_effects`) | Sandbox | Risk floor | Example registered tools |
|---|---|---|---|---|
| `read_only` | `none` | **not required** | low | `evidence_reader`, `repo_reader`, `policy_query`, `coverage_parser`, `agent_permission_auditor`, `memory_search`, `telemetry_reader`, `expiration_scanner` |
| `external_network` | `external_network_read` | required | medium | `web_search`, `web_fetch`, `web_scrape` (provided_by Web) |
| `artifact_write` | `writes_artifact_store` | required | low–medium | `artifact_writer`, `diagram_generator`, `sbom_generator`, `compliance_matrix_builder`, `accessibility_auditor` |
| `evidence_write` | `writes_evidence_store` | required | medium | `evidence_writer`, `source_reliability_checker`, `claim_mapper`, `provenance_recorder` |
| `state_write` | `writes_defect_store` / `writes_memory_store` / `mutates_activation_state` | required | medium–high | `defect_tracker`, `memory_write`, `retrieval_profile_writer`, `activation_flag_controller` |
| `file_write` | `writes_file_in_sandbox` / `writes_test_files` / `writes_repository` | required | high | `file_write`, `test_writer`, `repo_writer` |
| `code_execution` | `executes_*_in_sandbox` (code/tests/scanners/evals/benchmarks/migrations/probes/restore/runbook/rollback) | required | high | `test_runner`, `scanner_runner`, `dependency_scanner`, `eval_runner`, `contract_test_runner`, `migration_checker`, `benchmark_runner`, `restore_test_runner`, `shell_exec`, `process_run`, `runbook_executor`, `rollback_executor`, `prompt_injection_tester`, `tool_misuse_tester`, `context_poisoning_tester` |

**Planned classifier rule (no new policy):** a tool's class is a pure function of its `side_effects` string; `requires_sandbox` is then asserted to equal `(class != read_only)`. The registry's own `registry_self_check.side_effect_tools_require_sandbox_gov_trace: true` is the invariant the classifier validates against at load time. A future implementation that finds any `side_effects != none` tool with `requires_sandbox: false` (other than the **explicitly documented** static-analysis exception `script_static_analyzer`, which executes nothing) must FAIL the load — it does not silently downgrade.

> **Note — the one intentional exception.** `script_static_analyzer` has `risk_level: medium` but `requires_sandbox: false` and `side_effects: none` because it performs static analysis with no execution. The classifier treats it as `read_only` for sandbox purposes; this is recorded so a future implementer does not "fix" it into a sandbox class.

---

## 5. Permission decision model (planned ALLOW/DENY logic)

The future system would evaluate **five gates in order**, each sourced from an existing rule in `governance/tool/tools.yaml`. Any gate failing yields DENY (the default-deny posture from the global `high_risk_action_default_deny`). The system never has an "allow anyway" branch — a denied call is denied; only the owner-gated escalation path (§8, §12) can change posture, and even that is out of this system's authority.

| # | Gate | Source rule (governance/tool/tools.yaml) | Decision |
|---|---|---|---|
| 1 | **Caller authorization (least privilege)** | `tool_call_permission_governance.caller_in_allowed_callers` (blocker) | `caller_id ∈ tools_registry.tools[tool_id].allowed_callers` → else DENY. Core Ability ids and the `Supervisor` name are structurally absent from `allowed_callers`, so they can never pass. |
| 2 | **Intent within usage scope** | `tool_call_permission_governance.intent_within_allowed_usage` (blocker) | `intent ∈ allowed_usage AND intent ∉ forbidden_usage` → else DENY (e.g. `repo_writer` used to merge/deploy is forbidden_usage → DENY). |
| 3 | **Sandbox + timeout (side-effecting/high-risk only)** | `side_effecting_tool_governance.side_effect_requires_sandbox` + `…requires_timeout` (blocker) | If class != `read_only`: `execution_context.sandbox == true AND timeout set AND timeout ≤ ceiling` → else DENY. |
| 4 | **High-risk composite default-deny** | `high_risk_tool_governance.high_risk_default_deny_unless_permitted` (blocker) | If `risk_level == high`: require `caller_allowed AND in_declared_scope AND sandbox AND timeout AND trace` → else DENY. |
| 5 | **Secret/credential safety** | `tool_no_secret_exposure_governance` + `os_system_access_tool_governance` (blocker) | No raw secret read/emit; OS tools (`shell_exec`/`process_run`/`file_write`) additionally bound by `system_access_governance`. Violation → DENY. |

**Trace gate (orthogonal, always-on):** every evaluation — ALLOW or DENY — emits a `tool_call_trace_schema` record (global `trace_required`; `…requires_trace` blocker). A side-effecting call that cannot emit a trace is denied (`no_silent_mutation`). This is not one of the five ordered gates; it is a precondition that wraps all of them.

### 5.1 Planned decision pseudocode (illustrative contract, not code)

```text
DECIDE(tool_id, caller_id, intent, execution_context):
    tool   = registry.tools[tool_id]                 # from tools_registry.yaml
    class  = classify(tool.side_effects)             # §4
    trace  = open_trace(tool_id, caller_id, intent)  # tool_call_trace_schema; MUST succeed for side-effecting

    if caller_id NOT IN tool.allowed_callers:                      return DENY(trace, "caller_not_authorized")
    if intent IN tool.forbidden_usage OR intent NOT IN tool.allowed_usage:  return DENY(trace, "intent_out_of_scope")
    if class != read_only:
        if not execution_context.sandbox:                          return DENY(trace, "sandbox_required")
        if not timeout_ok(execution_context, class):               return DENY(trace, "timeout_required_or_exceeds_ceiling")
    if tool.risk_level == high:
        if not (in_declared_scope AND sandbox AND timeout AND trace.open):  return DENY(trace, "high_risk_default_deny")
    if would_read_or_emit_raw_secret(tool, execution_context):     return DENY(trace, "secret_exposure")

    verdict = governance_engine.resolve(tool, caller_id, intent)   # sibling plan; no_policy_bypass enforced there
    if verdict != PERMIT:                                          return DENY(trace, verdict.reason)

    if tool.feeds_a_gate:  attach_evidence(evidence_item_schema)   # evidence != trace
    return ALLOW(trace)
```

This is a **logical contract** for a later implementation. The `pass_condition`/`fail_condition` predicates it mirrors are already authored in `governance/tool/tools.yaml`; the future build wires them, it does not redesign them.

---

## 6. Sandbox / execution broker (planned)

For any non-`read_only` class, the future system routes execution through a **sandbox broker** whose contract is taken from `governance/tool/tools.yaml` (`side_effecting_tool_governance`, `os_system_access_tool_governance`) and the registry `side_effect_rule`.

Planned broker guarantees (each maps to an existing rule, none invented):

- **Isolation** — the call executes in an isolated context; it cannot touch host/production state. `forbidden_usage` clauses such as "Load-testing production systems" (`benchmark_runner`), "Restoring over production data" (`restore_test_runner`), "Running migrations against production data" (`migration_checker`), "Injecting poisoned context into production memory" (`context_poisoning_tester`) are enforced as **sandbox-target** assertions, not honor-system text.
- **Timeout** — every execution carries an explicit timeout `≤ tool_timeout_ceiling` for its class (`timeout_policy`). No unbounded execution.
- **Egress control** — `external_network` tools (`web_*`) get sandboxed egress with **no secret outbound** (`raw_credential_redaction` + `no_secret_exposure`).
- **OS escalation control** — `shell_exec`, `process_run`, `file_write` (Core Ability: OS) additionally bind `system_access_governance` and are the highest-risk surface; the broker treats them as `code_execution`/`file_write` with the strictest default-deny.
- **Trace of execution facts** — the broker records sandbox flag, timeout, and side-effect target into the tool-call trace (`side_effect_requires_trace`).

> The broker is described here as a **contract**, not built. How isolation is realized at runtime (container, jailed worker, etc.) is an implementation-workpackage decision deferred past the owner-approval gate (§12). This plan only fixes the *guarantees* the broker must later satisfy.

---

## 7. High-risk / side-effecting gating summary (the core requirement)

The task's central requirement — *high-risk / side-effecting tools gated* — is satisfied by the layered model above. Concretely, the future system would gate:

- **All 38 side-effecting tools** (every tool with `side_effects != none`; `requires_sandbox: true`) through profiles 2/3 of `governance/tool/tools.yaml` — sandbox + timeout + allowed-caller + trace + risk-declared.
- **All high-risk tools** (`risk_level: high`) through profile 3 (`high_risk_tool_governance`) — composite default-deny, plus evidence attachment when their output feeds a gate. This set includes the repository/OS/execution surface (`repo_writer`, `shell_exec`, `process_run`, `file_write`, all `*_runner`/`*_executor`/`*_tester`, `migration_checker`, `memory_write`, `retrieval_profile_writer`, `redaction_tool`, `activation_flag_controller`).
- **The OS Core Ability tools** (`shell_exec`, `process_run`, `file_write`) additionally through `os_system_access_tool_governance` — the strictest surface.

**Single-stage / single-caller containment is preserved.** Because gating reads `allowed_callers` and `used_by` straight from the registry, the system structurally enforces, e.g., that `repo_writer` is callable only by `engineering_agent` in the `implementation` stage, and that no-self-approval is upheld downstream by a *different* stage (`code_review`) — the permission system does not need to re-encode that; it inherits it from the registry contract.

---

## 8. Tool-permission self-audit feedback loop (planned)

The blueprint already contains the agentic-safety tools that *test this very system*. The plan makes the loop explicit so a future implementation wires it rather than re-inventing it:

- **`TOOL_PERMISSION_MAP`** is emitted by stage 11 (implementation) and is exactly the resolved (tool → allowed_callers → risk → sandbox) view this system would expose.
- **`tool_misuse_tester`** (stage 18, caller `agentic_safety_agent`) consumes that map and probes for privilege-escalation / least-privilege violations **inside the sandbox**, producing `TOOL_MISUSE_TEST_REPORT`.
- **`agent_permission_auditor`** (read-only) audits an agent's tool-permission scope against a least-privilege baseline.

A future implementation of the tool permission system is therefore **validated by an existing stage**, not by ad-hoc testing: a permission-model regression would surface as a stage-18 finding. This plan records that contract; it does not run the probes.

---

## 9. Integration seams with sibling runtime plans (planned)

| Seam | Sibling plan | This system's responsibility |
|---|---|---|
| Load tool + governance contracts | `shared-registry-loader-plan.md` | Receives parsed `tools_registry.yaml` + `governance/tool/tools.yaml`; runs the §4 load-time invariant check (every side-effecting tool sandboxed). |
| Resolve policy verdict | `governance-engine-plan.md` | Delegates Global→Pipeline→Team→Stage→Core Ability→Skill→**Tool** scope resolution, severity, and `no_policy_bypass`. The permission system does not author policy; it asks the engine. |
| Emit trace + evidence | `audit-evidence-store-plan.md` | Emits `tool_call_trace_schema` per call and `evidence_item_schema` for gate-feeding calls; persistence is the store's job. Evidence != Trace held at the seam. |
| Be invoked per tool call | `pipeline-runner-plan.md` | The runner calls `DECIDE(...)` before any stage `uses_tools` invocation; on DENY the runner routes per the rule's `on_fail` (`block` / `route_to_rework`). |
| Executor tool use | `executor-integration-plan.md` | An executor (Claude Code, etc.) authoring a changeset is subject to the same `allowed_callers` / sandbox contract; no executor bypasses the permission system. |
| Keep Core Ability names locked | `core-abilities-alignment.md` | Consumes `provided_by_core_ability` labels read-only; never turns a Core Ability into a caller/agent. |

---

## 10. What this plan deliberately defers

To stay planning-only, the following are **named but not decided here** — each is a future implementation-workpackage item gated by §12:

- Concrete sandbox/isolation **mechanism** (the §6 broker is a contract, not a chosen technology).
- The **policy-evaluation engine** internals (owned by `governance-engine-plan.md`).
- **Persistence/retention** of traces and evidence (owned by `audit-evidence-store-plan.md`).
- **Ratification of candidate tools.** 38 of 81 tools are `status: candidate`. Their permission contracts are already shaped in the registry, but ratifying them into the canonical set is a Phase-E/governance decision, not a permission-system decision.
- Any **new** tool, permission, risk level, or governance profile. This system only enforces what the registries declare; adding to them is out of scope and would itself require its own plan + owner approval.

---

## 11. Validation criteria for a future build (planning targets)

When this system is eventually built (after owner approval), it should be verifiable against these targets — all derived from existing artifacts, none new:

1. **Load-time invariant** — refuses to load if any tool with `side_effects != none` has `requires_sandbox: false` (except the documented `script_static_analyzer`).
2. **Caller least-privilege** — for all 81 tools, a caller absent from `allowed_callers` is denied; no Core Ability id and no `Supervisor` ever appears as a caller.
3. **High-risk default-deny** — every `risk_level: high` tool is denied unless caller-allowed AND in-scope AND sandboxed AND timed AND traced.
4. **Side-effect sandbox+timeout** — every non-`read_only` class call without a sandbox or timeout is denied.
5. **Trace completeness** — every decision (ALLOW and DENY) produces a `tool_call_trace_schema` record; Evidence != Trace preserved.
6. **No-bypass** — there is no code path that returns ALLOW when the governance engine returns non-PERMIT (`no_policy_bypass`).
7. **Self-audit loop** — the exposed `TOOL_PERMISSION_MAP` is consumable by `tool_misuse_tester` at stage 18 without transformation.
8. **No plugin, no merge, no deploy** — the system has no plugin loader, performs no merge, and triggers no deploy.

(The actual review of the produced plan set occurs in `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` per doc 21 §10.)

---

## 12. Owner-approval dependency (explicit)

This plan is inert until two conditions hold, and even then it does not authorize code.

1. **Planning-complete gate (doc 22 §3).** This document is one of the runtime/refactor plan outputs required by doc 21 §5. It does not begin implementation; it completes a planning deliverable.
2. **Required review verdicts (doc 22 §5).** The runtime/refactor plan set — including this document — must be reviewed (`runtime-refactor-plan-review.md`) with a `PASS` or `PASS_WITH_FINDINGS` verdict and **no blocking findings**, alongside the other mandated reviews.
3. **Hard blockers absent (doc 22 §6).** None of: plugin registry reintroduced, Core Ability treated as Agent, Supervisor treated as SDLC Team Lead, SDLC treated as top-level system, Governance/Audit merged, Evidence/Trace merged, Shared Registry + Usage Mapping rule violated, SDLC required gate missing, release candidate before development completion, **owner approval missing**.
4. **Explicit owner decision (doc 22 §7).** Building any part of this tool permission system requires:

   ```text
   OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
   ```

   Absent that token, the standing decision is `HOLD_FOR_MORE_REVIEW` and **no implementation may begin.** No executor and no reviewer may substitute for, infer, or simulate this approval (executor-standard; doc 22 §7).
5. **Even after approval (doc 22 §8).** The allowed next phase is the *Runtime / Refactor Implementation Planning Handoff* — implementation **workpackages**, still not direct code. Production-readiness claims, deploys, connector integration, Nexus publish, product refactor, and main-branch merge remain prohibited (doc 22 §9) until their own separate gates clear.

> **Restated plainly:** this document describes a tool permission/sandbox system; it does not build one. The owner alone authorizes the transition out of planning, and this plan is explicitly subordinate to that gate.

---

## 13. Summary

A future tool permission / sandbox system for Nexus AI is fully specifiable from existing blueprint artifacts: `tools_registry.yaml` supplies the per-tool contract (`requires_sandbox`, `risk_level`, `side_effects`, `allowed_callers`, governance/audit ids), and `governance/tool/tools.yaml` supplies the evaluable rules. The planned system is a default-deny decision point that classifies each tool by side-effect class, enforces caller least-privilege, sandbox+timeout for side-effecting calls, composite default-deny for high-risk calls, and secret-safety — emitting a trace for every call and evidence for gate-feeding calls, with Evidence != Trace and Governance != Audit held throughout. High-risk and side-effecting tools are gated by construction; the OS execution surface is the strictest. The system invents no tools, permissions, or policy; it enforces what the registries declare, is self-validated by the existing stage-18 `tool_misuse_tester` loop, and is **inert until an explicit owner approval** clears the doc 22 readiness gate.
