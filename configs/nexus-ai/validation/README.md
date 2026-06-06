# Nexus AI — Config Validation

How to validate the **SDLC stage contracts** and the **pipeline / run configs** of the
**Nexus AI Orchestration Model** against the JSON Schemas in [`../schemas/`](../schemas).

This is a **blueprint / documentation** repo (Phase A). Validation here means *static schema
and consistency checking of YAML/JSON config files* — there is **no runtime, no merge, no
deploy**. Nothing in this directory executes the pipeline; it only checks that the contracts
are well-formed and mutually consistent.

> Scope note: this directory currently ships **only this README** — the canonical recipe and
> check list. No validator script is committed yet (see [Open items](./README.md#open-items)). The
> commands below are the reference procedure to run by hand or to wire into a future
> `validate` script / CI job.

---

## What gets validated

| Config under test | Location | Validating schema (`../schemas/`) |
|---|---|---|
| Each SDLC **stage contract** | [`../stages/sdlc/NN-*.yaml`](../stages/sdlc/README.md) (31 files, `01`–`31`) | `stage_contract.schema.json` |
| The SDLC **pipeline definition** | [`../sdlc_pipeline.yaml`](../sdlc_pipeline.yaml) | `pipeline_definition.schema.json` |
| A **pipeline run** instance | *(none committed yet — author as needed)* | `pipeline_run.schema.json` |
| A single **evidence item** | *(produced at run time)* | `evidence_item.schema.json` |
| The **artifact registry** | [`../artifact_registry.yaml`](../artifact_registry.yaml) | `artifact_registry.schema.json` |

All schemas are **JSON Schema draft 2020-12** (`"$schema": ".../2020-12/schema"`). Use a
validator that supports 2020-12 (`$defs`, `$ref`, `propertyNames`, `unevaluatedProperties`,
`not`/`enum` composition). Draft-07-only validators will silently mis-handle several guards.

The stage `.yaml` files are **single-document** YAML (no `---` separators); each file is one
stage-contract object and validates as one JSON document.

---

## The five schemas — what each one validates

### 1. `stage_contract.schema.json`
Validates **one standalone stage contract** (the `../stages/sdlc/NN-*.yaml` files). Enforces:
- The **27-key** stage contract field set, of which **26 are required** — every key
  *except* `applicability_decision` (`stage_id`, `name`, `purpose`, `owner_team`, `team_lead`,
  `owner_agent`, `sub_agents`, the 7 `uses_*` arrays, `inputs`, `outputs`, `evidence`, `trace`,
  `gates`, `on_pass`, `on_fail`, `rework_route`, `blocking_conditions`, `optional_conditions`,
  `conditional_required_gates`, `max_iterations`). `applicability_decision` is the only optional
  key and is expected **only** on conditional stages.
  > Note: this **standalone** schema requires `optional_conditions`, `conditional_required_gates`
  > and `max_iterations`. The **embedded** `stage_contract` `$defs` reused inside
  > `pipeline_definition` / `pipeline_run` / `evidence_item` / `artifact_registry` requires only
  > the **23-key** core (those three keys plus `applicability_decision` are optional there). A
  > stage file that omits, say, `optional_conditions` passes when embedded but fails the
  > standalone schema — validate `../stages/sdlc/*.yaml` against the **standalone** schema.
- `owner_agent` is a **snake_case Agent role** and is **not** a Core Ability (the eight
  abilities are blocked in both PascalCase and lowercased form).
- `team_lead` is **not** a Core Ability (so `Supervisor != sdlc_team_lead`).
- `uses_core_abilities` items are restricted to the **eight canonical Core Abilities** — this
  is the *only* place an ability name may appear.
- Routing fields (`on_pass`/`on_fail`/`rework_route`) are snake_case routing targets.
- `applicability_decision` (when present) **requires** `required_when`.
- `max_iterations` is an integer `>= 1` (default `3`).
- **No `plugin`** anywhere: `additionalProperties: false`, `not.required: [plugin]`, and a
  case-insensitive `propertyNames` ban `(?i)plugin` at object and nested levels.

### 2. `pipeline_definition.schema.json`
Validates a **pipeline definition** (catalog template, e.g. `../sdlc_pipeline.yaml`). Enforces
the **24 required** definition fields (`pipeline_id`, `name`, `purpose`, `version`, `status`,
`owner_domain`, `required_team_type`, `required_team_lead_role`, `applicable_domains`,
`risk_profiles`, `stages`, the 7 `uses_*` arrays, `entry_criteria`, `exit_criteria`,
`blocking_conditions`, `allowed_rework_routes`, `required_evidence`, `required_trace`). Also:
- `status` is an enum (`discussion` … `retired`); `risk_profiles` items are a fixed enum.
- `stages[]` is `oneOf` a **snake_case stage_id reference string** *or* a full inline
  `stage_contract` object (the `$defs/stage_contract` mirrors schema 1's rules).
- `required_team_lead_role` is **not** a Core Ability; embedded `owner_agent` is **not** a Core
  Ability; `allowed_rework_routes` are routing targets.
- `additionalProperties: false` and `not.required: [plugin]` — **no plugin** concept.

### 3. `pipeline_run.schema.json`
Validates a **pipeline run** instance. Enforces the **25 required** run fields (`run_id`,
`pipeline_id`, `pipeline_version`, `run_goal`, `run_status`, `selected_pipeline`,
`assigned_team`, `team_lead`, `active_stage`, `completed_stages`, `blocked_stages`,
`run_context`, `governance_state`, `evidence`, `trace`, the 7 `used_*` arrays,
`open_questions`, `blocking_findings`, `next_action`). Also:
- `run_status` is an enum; `team_lead` is **not** a Core Ability; `active_stage`/`next_action`
  are routing targets (stage_id or a canonical terminal).
- `evidence` and `trace` are **distinct arrays** (the run keeps decision proof separate from
  process history).
- Optional embedded `stage_contracts[]` re-apply the full stage-contract guard (all 7 usage
  arrays required, `owner_agent` never a Core Ability).
- `forbiddenPlugin` is applied at the root and to every nested object — **no plugin**.

> The committed `pipeline_run.schema.json` does **not** set `additionalProperties: false` at the
> run root (unknown run-level keys are tolerated), unlike the other four schemas. Field-shape and
> plugin/Core-Ability guards still apply.

### 4. `evidence_item.schema.json`
Validates a **single evidence item** (decision proof). Requires `evidence_id`, `type`,
`produced_by`, `related_pipeline`, `related_run`, `related_stage`, `related_agent`,
`related_sub_agent`, `related_gate`, `source_artifacts`, `summary`, `status`, `created_at`. Also:
- `produced_by` / `related_agent` / `related_sub_agent` are snake_case and **never** a Core
  Ability (abilities don't produce or own artifacts).
- This is **Evidence, not Trace**: it deliberately models *no* trace fields (no `trace_id`,
  `actor`, `action`, `timestamp`-as-trace). Trace is a separate family.
- `additionalProperties: false`, `not.required: [plugin]` — **no plugin**.

### 5. `artifact_registry.schema.json`
Validates the **artifact-name registry** (`../artifact_registry.yaml`). Requires `version`,
`registry_id`, `purpose`, `naming_rules`, `artifact_groups`, `release_evidence_required`,
`evidence_item_schema`. Also:
- Artifact names are **`UPPER_SNAKE_CASE`** (`^[A-Z][A-Z0-9_]*$`); `naming_rules` pins the
  canonical suffixes (`_IF_APPLICABLE`, `_GATE_RESULT`, `_APPLICABILITY_DECISION`, `_REPORT`).
- `release_evidence_required` splits into `core` (always) and `conditional` (if-applicable).
- A reusable `$defs/stage_contract` pins `owner_team: sdlc_team` and `team_lead: sdlc_team_lead`
  as **`const`** and enforces the same no-plugin / no-Core-Ability-as-owner rules.
- Artifact names and property names are case-insensitively banned from containing **`plugin`**.

---

## How to run validation

Pick **one** toolchain. All produce a non-zero exit on the first failing file.

Because the schemas are authored in **JSON** but the configs are **YAML**, YAML files must be
converted to JSON (in memory or to a temp file) before validation — *unless* the tool reads YAML
natively (`check-jsonschema` does).

### Option A — `check-jsonschema` (Python, reads YAML directly; recommended)

```bash
pip install check-jsonschema     # supports draft 2020-12 and YAML input

cd configs/nexus-ai

# 1. Every stage contract against the stage schema
check-jsonschema --schemafile schemas/stage_contract.schema.json stages/sdlc/*.yaml

# 2. The pipeline definition
check-jsonschema --schemafile schemas/pipeline_definition.schema.json sdlc_pipeline.yaml

# 3. The artifact registry
check-jsonschema --schemafile schemas/artifact_registry.schema.json artifact_registry.yaml

# 4. A run instance (when one exists)
check-jsonschema --schemafile schemas/pipeline_run.schema.json runs/<your-run>.yaml

# 5. An evidence item (when one exists)
check-jsonschema --schemafile schemas/evidence_item.schema.json evidence/<item>.yaml
```

### Option B — `ajv-cli` (Node; this repo already uses Node)

`ajv` validates JSON, so convert each YAML doc first. Use `ajv-cli` with the 2020-12 spec.

```bash
npm install --no-save ajv-cli ajv-formats js-yaml

cd configs/nexus-ai

# Validate one stage file (convert YAML -> JSON on the fly):
npx js-yaml stages/sdlc/01-intake.yaml > /tmp/stage.json
npx ajv validate --spec=draft2020 -c ajv-formats \
  -s schemas/stage_contract.schema.json -d /tmp/stage.json

# Loop over all 31 stage files:
for f in stages/sdlc/*.yaml; do
  npx js-yaml "$f" > /tmp/stage.json
  npx ajv validate --spec=draft2020 -c ajv-formats \
    -s schemas/stage_contract.schema.json -d /tmp/stage.json || echo "FAIL: $f"
done

# Pipeline definition / registry (convert then validate the same way):
npx js-yaml sdlc_pipeline.yaml      > /tmp/pipe.json
npx ajv validate --spec=draft2020 -s schemas/pipeline_definition.schema.json -d /tmp/pipe.json
npx js-yaml artifact_registry.yaml  > /tmp/reg.json
npx ajv validate --spec=draft2020 -s schemas/artifact_registry.schema.json -d /tmp/reg.json
```

`-c ajv-formats` is needed for `format: date-time` (used by `evidence_item.schema.json`).

### Option C — Python `jsonschema` (scriptable)

```python
import json, glob, sys, yaml
from jsonschema import Draft202012Validator

def check(schema_path, doc_paths):
    schema = json.load(open(schema_path))
    v = Draft202012Validator(schema)
    ok = True
    for p in doc_paths:
        doc = yaml.safe_load(open(p))
        errs = sorted(v.iter_errors(doc), key=lambda e: e.path)
        if errs:
            ok = False
            for e in errs:
                print(f"{p}: {list(e.path)}: {e.message}")
    return ok

base = "configs/nexus-ai"
ok  = check(f"{base}/schemas/stage_contract.schema.json",
            glob.glob(f"{base}/stages/sdlc/*.yaml"))
ok &= check(f"{base}/schemas/pipeline_definition.schema.json", [f"{base}/sdlc_pipeline.yaml"])
ok &= check(f"{base}/schemas/artifact_registry.schema.json",   [f"{base}/artifact_registry.yaml"])
sys.exit(0 if ok else 1)
```

---

## Consistency checks (beyond per-file schema validation)

JSON Schema validates **one document at a time**. The checks below are **cross-file / semantic
invariants** the schemas cannot fully enforce on their own. Run them after schema validation
(by hand, or in a future `validate` script). Each item notes whether the schema already covers
part of it.

### 1. Stage count = 31
- `../sdlc_pipeline.yaml` `stages:` must list **exactly 31** stage_ids, in canonical order
  (`intake` … `refraction_learning`).
- `../stages/sdlc/` must contain **exactly 31** contract files `01-*.yaml` … `31-*.yaml`, and
  each file's `stage_id` must equal the snake_case id at the matching position in
  `sdlc_pipeline.yaml`. The numeric filename prefix must match the canonical order.
- *Not schema-enforced:* the schema checks one stage at a time and never counts files or
  cross-checks the definition's `stages:` list against the directory. Verify the set is
  **complete and 1:1** (no missing, extra, duplicate, or misnumbered stage).

### 2. Known routes
- Every `on_pass`, `on_fail`, `rework_route` (in each stage) and every `active_stage`,
  `next_action`, `allowed_rework_routes` (in run/definition) must resolve to **either** a
  `stage_id` that exists in the 31-stage set **or** one of the three canonical terminals:
  `done`, `relevant_failed_stage`, `block_and_report`.
- *Partly schema-enforced:* the schema enforces the snake_case **shape** of a routing target,
  but it cannot confirm that a `stage_id` target actually **exists** in the pipeline. Resolve
  every non-terminal target against the stage set and flag dangling references.
- Sanity: `on_pass` should move **forward** (or to `done`); `on_fail`/`rework_route` should
  point at the **upstream** root-cause stage or a terminal — never forward past the current
  stage. (Guidance, not a hard schema rule.)

### 3. All 7 usage-mapping fields present
- Every stage **must** declare **all seven** arrays, even if empty (`[]`):
  `uses_core_abilities`, `uses_skills`, `uses_tools`, `uses_governance_profiles`,
  `uses_audit_schemas`, `uses_model_provider_profiles`, `uses_context_memory_profiles`.
- *Schema-enforced:* all seven are in each stage schema's `required` list — a missing array
  fails validation. The cross-file check is that the **pipeline definition's** seven `uses_*`
  arrays are the **union** of (or a superset consistent with) what the stages actually use, and
  that names resolve to the **Canonical Shared Registry** (skills / tools / governance profiles
  / audit schemas / model-provider profiles / context-memory profiles). Any name outside the
  registry must be recorded in `open_questions` for formalization.

### 4. Conditional applicability
- A stage is **conditional** iff it carries an `applicability_decision` block; that block
  **must** contain a `required_when` expression. The 7 conditional stages are: stages **19, 20,
  21, 22, 23, 25, 26** (`privacy_data_lifecycle_validation`,
  `api_contract_compatibility_validation`,
  `domain_regulatory_compliance_validation_if_applicable`,
  `data_migration_validation_if_applicable`, `accessibility_ux_validation_if_applicable`,
  `cost_resource_governance`, `backup_restore_dr_validation_if_applicable`).
- `applicability_decision` must appear **right after `purpose`** (field order), and a conditional
  stage should declare `conditional_required_gates` keyed by `required_when`, plus an
  `on_not_applicable` route (skip path) that lands on the same forward successor as `on_pass`
  so the linear order is preserved whether or not the stage runs.
- The conditional gate names (`*_pass_if_applicable`) must match
  `sdlc_pipeline.yaml` `required_gates.conditional`.
- *Partly schema-enforced:* the schema requires `required_when` *inside* an
  `applicability_decision` and allows the block to be absent on non-conditional stages, but it
  does **not** enforce field **ordering**, nor that exactly these 7 stages are conditional, nor
  the gate-name ↔ pipeline cross-reference. Check those across files.

### 5. No plugin
- The string **`plugin` must never appear as a key/field** anywhere — not in a stage, the
  definition, a run, an evidence item, or the registry. Plugin is a **cancelled** concept.
- *Schema-enforced:* every schema bans `plugin` via `not.required: [plugin]` and/or a
  case-insensitive `propertyNames` ban (`(?i)plugin` / `const: plugin`), and four of the five
  use `additionalProperties: false`.
- *Cross-file check:* grep the whole `configs/nexus-ai/` tree for `plugin`. The word may
  legitimately appear **only inside guard / forbid prose** (e.g. the `plugin_stage` anti-pattern
  entry in `../sdlc_pipeline_runtime_rules.yaml`, or schema `description` text that says
  "plugin is cancelled"). It must **never** appear as a data key or value introducing a plugin
  concept.

### 6. Core Ability / Agent boundary
- The eight **Core Abilities** — `Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS` —
  are **capabilities, not agents and not team members**. They may appear **only** inside a
  `uses_core_abilities` array. They must **never** be an `owner_agent`, a `team_lead`, a
  `sub_agents` entry, a `produced_by` / `related_agent` / `related_sub_agent`, or any agent role.
- `owner_agent` is always a single **snake_case pipeline Agent role** (e.g. `requirements_agent`)
  — never an array, never an ability.
- `team_lead` is always `sdlc_team_lead` and `owner_team` is always `sdlc_team` for SDLC stages;
  in particular **`Supervisor != sdlc_team_lead`**.
- *Schema-enforced:* `owner_agent`/`team_lead`/`sub_agents` exclude the abilities (PascalCase
  **and** lowercased) via `not.enum`; `uses_core_abilities` is restricted to the eight ability
  names; the registry schema pins `owner_team`/`team_lead` as `const`. The schema cannot,
  however, verify that each named agent role is a **real** role from the project's agent catalog
  — confirm agent / sub-agent names against the canonical roster.

### Governance-only checks (no schema can decide these)
These are **policy** rules the schemas explicitly cannot enforce; verify by review:
- **No self-approval:** a review / gate stage's `owner_agent` must **differ** from the author of
  the artifact it reviews. Where no dedicated reviewer role fits, `sdlc_team_lead` owns the
  review-gate (e.g. `requirements_review`, `architecture_review`). This is a *cross-stage author
  comparison* — outside the reach of single-document schema validation.
- **Distinct families:** Skill != Tool; Governance != Audit; Evidence != Trace. Confirm names
  land in the right `uses_*` bucket / schema family (e.g. an evidence schema is not listed as a
  trace, a skill id is not used as a tool id).
- **Skill semantics (LOCKED):** `prism` = divergent / brainstorming only; `verification-loop` =
  bug / defect finding only (never a general readiness checklist, never a substitute for
  `test_execution`). Check that stages use these skills consistently with that meaning.

---

## Suggested order

1. **YAML well-formedness** — every `*.yaml` parses.
2. **Per-file schema validation** — run the matching schema for each config (sections above).
3. **Cross-file consistency** — checks **1–6** plus the governance-only checks.

A failure in step 2 is a hard contract violation. A failure in step 3 means the individual
files are each valid but the **set** is inconsistent (wrong count, dangling route, conditional
mismatch, registry drift, or a boundary/governance violation).

---

## Open items

- **No validator script is committed** in this directory yet — only this README. The recipes
  above are the reference procedure; a `validate` script / CI job (Option A, B, or C) can be
  added to mechanize steps 1–3.
- The consistency checks **1, 2, 4** (stage count, route resolution, "exactly these 7
  conditional stages") and **all governance-only checks** (no self-approval, family distinctness,
  skill semantics) are **not expressible in single-document JSON Schema** and need the script /
  reviewer to enforce them.
- `../sdlc_pipeline.yaml` is currently a **reduced** pipeline-definition form: it carries
  `pipeline_id, name, purpose, version, status, owner_domain, required_team_type,
  required_team_lead_role, stages`, the seven `uses_*` arrays, plus `required_gates` and
  `canonical_docs`. It is **missing** several fields that `pipeline_definition.schema.json`
  marks `required` (`applicable_domains`, `risk_profiles`, `entry_criteria`, `exit_criteria`,
  `blocking_conditions`, `allowed_rework_routes`, `required_evidence`, `required_trace`) and
  adds two keys the schema does not define (`required_gates`, `canonical_docs`). Because that
  schema uses `additionalProperties: false`, **`sdlc_pipeline.yaml` will not validate cleanly
  against `pipeline_definition.schema.json` as written** — reconcile the definition file and the
  definition schema (extend the file, or relax/extend the schema) before treating that pairing
  as a passing gate.
- The existing index [`../stages/sdlc/README.md`](../stages/sdlc/README.md) still says "29 of 31
  stages have contract files" and marks stages `30`/`31` as *file pending*; all **31** contract
  files now exist, so that index is **stale** and should be refreshed.
- No **pipeline-run** or **evidence-item** instance files are committed yet; their schemas
  (`pipeline_run.schema.json`, `evidence_item.schema.json`) are ready for when such files are
  authored.
