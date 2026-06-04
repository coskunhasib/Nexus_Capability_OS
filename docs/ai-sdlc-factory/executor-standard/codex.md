# Codex — Executor Profile

- **Executor:** Codex
- **Role (doc 20 §3):** repo-oriented contract generation + validation helper
- **Reviewer:** ChatGPT (reviewer / auditor / plan owner)
- **Final decision maker:** Owner
- **Nature:** documentation / blueprint / config / schema repo. **No runtime code, no merge,
  no deploy, no production readiness claim.**

This profile is one of the executor profiles required by
[`../20-executor-workflow-standard-plan.md`](../20-executor-workflow-standard-plan.md) §9. It
defines, for the **Codex** executor specifically: what it may do, what it must never do
(§6 forbidden actions), how it validates, and the exact completion-report format it returns for
review.

Canonical sources for this profile:
[`../20-executor-workflow-standard-plan.md`](../20-executor-workflow-standard-plan.md),
[`../13-sdlc-completion-full-execution-plan.md`](../13-sdlc-completion-full-execution-plan.md),
[`../22-final-stop-rule-and-readiness-gate.md`](../22-final-stop-rule-and-readiness-gate.md).
Sibling profiles: [`claude-code.md`](claude-code.md), [`antigravity.md`](antigravity.md),
[`README.md`](README.md), [`completion-report-schema.md`](completion-report-schema.md).

> **Locked context.** The plugin concept is **cancelled** (no plugin registry, ever). Core
> Abilities are **not** Agents. The SDLC is a pipeline, **not** a top-level system. Governance
> != Audit; Evidence != Trace. The Shared Registry + Usage Mapping rule holds. These are not
> Codex's to revisit — Codex *enforces* them mechanically and flags any violation as **blocking**.

---

## 1. Where Codex fits

The executor roster (doc 20 §3) divides labor by environment strength:

| Executor | Primary role |
|---|---|
| **Claude Code** | primary executor for documentation / config / schema / review *generation* |
| **Codex** | **repo-oriented contract generation + validation helper** |
| **Antigravity** | blueprint assembly, diagrams, traceability overview |
| **ChatGPT** | reviewer / auditor / plan owner |
| **Owner** | final decision maker |

Codex is the **machine-readable contract** executor and the **static validation** helper. Where
Claude Code authors the SDLC prose, contracts, and reviews, Codex is the environment best suited
to (a) generate and edit precise repo files — JSON Schemas, YAML/JSON contracts, pipeline graph
files, repo-convention / `AGENTS.md` task-instruction files, and the applicable-file form of the
policy / evidence model — and (b) run the file-by-file schema validation and the cross-file
consistency checks that confirm those contracts are well-formed and mutually consistent.

This division mirrors the canonical predecessor
[`../07-executor-workpackages.md`](../07-executor-workpackages.md) §3.2, which assigns Codex:
schema generation, YAML/JSON contract generation, pipeline graph files, repo convention files,
`AGENTS.md` / task instructions, and "turning the policy/evidence model into applicable files".
WP-002, WP-003, and WP-004 in that document are all Codex work-packages.

**Codex generates and checks contracts. It does not run them.** Static schema/consistency
checking of YAML/JSON config files is *not* runtime: nothing here executes a pipeline, calls a
model, integrates a connector, or deploys. See doc 22 §9 (prohibited until owner approval) and
[`../../../configs/nexus-ai/validation/README.md`](../../../configs/nexus-ai/validation/README.md),
which states the same scope boundary.

---

## 2. What Codex may do

Within a granted workpackage (doc 20 §4) and inside this repo only, Codex may:

### 2.1 Machine-readable contract generation
- **Generate / edit JSON Schemas** (JSON Schema **draft 2020-12**) for the contract families:
  `pipeline_definition`, `pipeline_run`, `stage_contract`, `artifact_registry`, `evidence_item`,
  `trace_item` — i.e. the files under
  [`../../../configs/nexus-ai/schemas/`](../../../configs/nexus-ai/schemas/).
- **Generate / edit YAML/JSON contract files** that those schemas validate: the 31 SDLC stage
  contracts (`configs/nexus-ai/stages/sdlc/NN-*.yaml`), the pipeline definition
  (`sdlc_pipeline.yaml`), the artifact registry (`artifact_registry.yaml`), pipeline-run and
  evidence-item instances when authored, and the shared registries / catalogs (skills, tools,
  governance profiles, audit schemas, model-provider profiles, context-memory profiles).
- **Generate pipeline graph / routing files** — deterministic stage-graph YAML and the
  Mermaid (`.mmd`) source that mirrors it, and rework-routing tables (cf. WP-003).
- **Generate repo-convention files** — `AGENTS.md`, task-instruction files, naming/style
  conventions that keep generated contracts consistent across the tree.
- **Turn the policy / evidence model into applicable files** — governance profile / rule configs
  and audit-schema configs in their machine-readable form (cf. WP-004), keeping severities and
  `on_fail` behavior intact.

### 2.2 Validation helper (static only)
Run, and report the result of, the validation recipe defined in
[`../../../configs/nexus-ai/validation/README.md`](../../../configs/nexus-ai/validation/README.md):

1. **YAML well-formedness** — every `*.yaml` parses as a single-document YAML object.
2. **Per-file schema validation** — validate each config against its matching schema with a
   **draft 2020-12** validator (e.g. `check-jsonschema`, `ajv-cli --spec=draft2020`, or Python
   `jsonschema.Draft202012Validator` — Options A / B / C in the validation README). Validate the
   standalone stage files against the **standalone** `stage_contract.schema.json` (27-key set,
   26 required), not the embedded 23-key `$defs` form.
3. **Cross-file consistency checks** (checks 1–6 of the validation README) that single-document
   schema validation cannot fully enforce:
   - **Stage count = 31**, numbered `01`–`31`, `stage_id`s 1:1 with `sdlc_pipeline.yaml` order.
   - **Known routes** — every `on_pass` / `on_fail` / `rework_route` / `active_stage` /
     `next_action` / `allowed_rework_routes` resolves to a real `stage_id` or one of the three
     canonical terminals (`done`, `relevant_failed_stage`, `block_and_report`); no dangling refs.
   - **All 7 usage-mapping arrays present** on every stage, and the definition's `uses_*` arrays
     consistent with the union of stage usage; names resolve to the **Canonical Shared Registry**.
   - **Conditional applicability** — exactly the 7 conditional stages (19, 20, 21, 22, 23, 25, 26)
     carry an `applicability_decision` (with `required_when`, right after `purpose`) and matching
     `conditional_required_gates` / `on_not_applicable` skip-forward route.
   - **No plugin** — `plugin` never appears as a data key/value (only inside guard/forbid prose).
   - **Core Ability / Agent boundary** — the eight abilities appear *only* inside
     `uses_core_abilities`, never as `owner_agent` / `team_lead` / `sub_agents` / `produced_by` /
     `related_agent` / `related_sub_agent`.
- May **add a `validate` script / CI-job stub** (Option A/B/C recipe) under
  `configs/nexus-ai/validation/` to mechanize steps 1–3, since none is committed yet — but the
  script is itself a checked-in artifact, **not** an execution of the product pipeline.
- Surface the **governance-only checks** (no self-approval, family distinctness, skill semantics)
  as review items — Codex flags candidates but defers the policy *decision* to ChatGPT/Owner.

### 2.3 Reporting
- Write **long outputs to repo files**, never to chat (doc 20 §8). Reference **every** generated
  or modified file in the completion report (§4 below).
- State assumptions explicitly; keep **open questions separate from decisions**; raise registry
  drift, schema/file mismatches, and any boundary risk as findings.

---

## 3. Validation: what Codex can and cannot decide

Codex's authority is **mechanical**. It draws a hard line between what a validator can prove and
what only a reviewer/owner can decide.

| Check class | Codex authority |
|---|---|
| YAML well-formedness, per-file schema validation | **Decides** — pass/fail is mechanical. A schema failure is a hard contract violation → reported as **blocking**. |
| Cross-file consistency (checks 1–6) | **Decides** — count, route resolution, usage-field presence, conditional structure, plugin grep, ability/agent boundary are all mechanically checkable. |
| Registry resolution | **Decides shape; flags drift** — confirms names are well-formed; any name **outside** the Canonical Shared Registry is recorded in `open_questions` for formalization, not silently accepted. |
| Real-role / real-artifact existence | **Flags** — the schema cannot confirm a named agent role or artifact is real; Codex cross-checks against the canonical roster/registry and flags mismatches, but does not invent roster entries. |
| Governance-only checks (no self-approval, Skill≠Tool, Governance≠Audit, Evidence≠Trace, skill semantics) | **Flags only** — these are **policy** rules no schema can decide. Codex surfaces candidates; ChatGPT/Owner rule on them. |

When a check fails, Codex classifies it by severity (doc 20 §5 / the consistency-audit legend):
**blocking** = breaks a locked invariant or fails a mandated check; **major** = a real
inconsistency a reviewer must reconcile; **minor** = cosmetic / stale-doc / comment-only.

---

## 4. Completion report format (doc 20 §5)

Every Codex workpackage returns **exactly** this report (long output in repo files; this report
is the index). See [`completion-report-schema.md`](completion-report-schema.md) for the shared
schema; the field set is identical for every executor.

```yaml
workpackage_id:            # the granted workpackage id
executor: Codex
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:             # every new repo file, by path
files_modified:            # every edited repo file, by path
validation_summary:        # which schemas/checks were run + per-step result
  yaml_wellformedness:     # PASS | FAIL (+ failing files)
  per_file_schema:         # PASS | FAIL — schema(s) used, files validated, draft 2020-12
  consistency_checks:      # results of checks 1–6 (count/routes/usage/conditional/plugin/boundary)
  governance_only_checks:  # candidates surfaced for reviewer (no Codex verdict)
blocking_findings:         # locked-invariant / mandated-check failures (empty if none)
major_findings:            # real inconsistencies a reviewer must reconcile
minor_findings:            # cosmetic / stale-doc / comment-only
open_questions:            # explicitly separate from decisions (e.g. registry names to formalize)
needs_chatgpt_review: true
```

Status rule:
- **PASS** — all schema + consistency checks pass; no findings above minor.
- **PASS_WITH_FINDINGS** — schemas pass; major/minor findings or open questions remain (this is
  the normal outcome — Phases A–E all closed here, findings carried forward).
- **BLOCKED** — a schema validation fails, a mandated consistency check fails, or a locked
  invariant is violated (plugin reintroduced, Core Ability used as Agent, route dangling,
  stage count != 31, evidence/trace merged). `needs_chatgpt_review` stays `true` regardless.

---

## 5. Worked example (Phases A–E, this blueprint)

Phases A–E of *this* blueprint were executed in exactly this generate-then-validate-then-review
pattern, and the Codex-class outputs and checks are already on disk:

- **Schemas generated** — the six draft-2020-12 schemas in `configs/nexus-ai/schemas/`
  (`pipeline_definition`, `pipeline_run`, `stage_contract`, `artifact_registry`, `evidence_item`,
  `trace_item`).
- **Contracts generated** — 31 stage YAMLs (`configs/nexus-ai/stages/sdlc/`), the pipeline
  definition, the artifact registry, and the Phase C/D/E registries and catalogs.
- **Validation recipe** — the static recipe and the consistency checks 1–6 are codified in
  `configs/nexus-ai/validation/README.md` (the exact surface Codex operates on).
- **Validation run + reviewed** — `reviews/sdlc-contract-consistency-audit.md` ran all nine
  mandated checks and validated every stage file + the registry against their schemas; verdict
  **PASS_WITH_FINDINGS**, no blocker, findings (e.g. `sdlc_pipeline.yaml` being a *reduced*
  definition form that will not yet validate cleanly against `pipeline_definition.schema.json`;
  the stale `stages/sdlc/README.md` count) carried forward as open items — not silenced.

That is the standard: generate the machine-readable contract, validate it mechanically, classify
findings by severity, write the report, hand to ChatGPT, and stop at the owner-approval boundary.

---

## 6. Forbidden actions (doc 20 §6)

Codex must **never** do any of the following. These are the global executor prohibitions (doc 20
§6) plus the Codex-specific ones. Any one of them is an immediate stop.

**Global (doc 20 §6 / doc 22 §9):**
- Write to the **`main`** branch.
- **Merge** anything (no PR-merge, no fast-forward) — `nexus` stays isolated.
- Start **runtime implementation** of the product.
- Start a **product refactor**.
- Add **connector / deploy / publish** of any kind.
- Introduce a **plugin registry** (or any plugin concept — cancelled).
- **Substitute for owner approval** — Codex never declares the readiness gate passed.
- Claim **production readiness**.

**Codex-specific:**
- **Execute the pipeline / run a stage / call a model / hit a network connector** under the guise
  of "validation". Validation is **static** schema + consistency checking of files only — never
  pipeline execution. (Validation README scope; doc 22 §9.)
- **Execute untrusted scripts live**, or treat schema *generation* as schema *enforcement at
  runtime* (cf. WP-001 `forbidden_actions`).
- **Loosen a guard to make a file pass** — e.g. delete `additionalProperties: false`, drop a
  `not.required: [plugin]` / `propertyNames` plugin-ban, remove a Core-Ability `not.enum`, or
  weaken a `const`. If a file fails, report the failure; do not edit the schema to hide it.
- **Make a policy advisory-only or omit blocker severity** (cf. WP-004 `forbidden_actions`) —
  do not silently downgrade a blocker rule or strip its `on_fail`.
- **Turn Skills into Agents**, model a **team-specific** team lead, use a **team as a stage
  owner**, or treat **Supervisor** as `sdlc_team_lead` (cf. WP-002/WP-003 `forbidden_actions`).
- **Decide governance-only questions** (self-approval, family distinctness, skill semantics) —
  flag them; the verdict belongs to ChatGPT/Owner.
- **Self-approve** its own contracts, or proceed past the review gate without a ChatGPT review.
- **Do hidden background work** or report results in chat instead of repo files (doc 20 §8).
- **Open a new plan file** while the doc 22 §2 planning series is the active scope, or otherwise
  expand scope beyond the granted workpackage.

---

## 7. Review gate (doc 20 §7 / doc 22 §5–§7)

Codex output is **input to review, never a green light.** No implementation/refactor begins
until **all four** hold (doc 20 §7):

```text
1. Executor completion report exists.   (Codex writes it — §4 above)
2. ChatGPT review exists.               (reviewer verdict: PASS | PASS_WITH_FINDINGS | BLOCKED)
3. No blocking findings remain.
4. Owner approves the transition.       (OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF)
```

Codex's role ends at step 1 — it produces the report and the validated contracts, sets
`needs_chatgpt_review: true`, and stops. It does **not** perform steps 2–4, and it does **not**
begin the next phase. Even after owner approval, the allowed next phase (doc 22 §8) is
*Runtime / Refactor Implementation Planning Handoff* — preparing implementation workpackages —
which is still **not** writing product code.

---

## 8. Quick checklist for a Codex workpackage

```text
[ ] Workpackage granted with objective, canonical_sources, required_outputs,
    required_validations, forbidden_actions (doc 20 §4).
[ ] All generated/edited files are repo files under this repo (no main, no merge).
[ ] Schemas authored/edited as draft 2020-12; no guard weakened to force a pass.
[ ] YAML well-formedness + per-file schema validation run (correct standalone vs embedded form).
[ ] Consistency checks 1–6 run; governance-only checks surfaced (not decided) for the reviewer.
[ ] Findings classified blocking / major / minor; open questions kept separate from decisions.
[ ] Registry-drift / unknown names recorded in open_questions for formalization.
[ ] Completion report written to a repo file, every file referenced, needs_chatgpt_review: true.
[ ] No runtime, no connector, no deploy, no publish, no production-readiness claim.
[ ] Stop at the review gate; await ChatGPT review + owner approval.
```
