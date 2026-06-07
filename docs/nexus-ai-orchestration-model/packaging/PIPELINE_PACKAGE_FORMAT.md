# `.pipeline` Package Format — draft-0.1

> Status: **draft-0.1** · Scope: **format specification only** (no runtime). Date: 2026-06-07
> Part of the Nexus AI Orchestration Model. Lives on the isolated `nexus` branch.

## 1. Purpose

Package a pipeline the same way Claude packages a skill (`.skill`): a **self-contained, portable, pullable unit**. Anyone can pull the pipeline they need; a host runtime imports it and runs it.

```
Claude skill  : SKILL.md + bundled resources   →  any Claude runtime loads it
Nexus pipeline: pipeline.yaml + bundled parts   →  Nexus runtime loads & runs it
```

This format is **not new content** — it packages what already exists in this repo (`configs/nexus-ai/sdlc_pipeline.yaml`, the registries, the gates). It turns a pipeline definition + everything it depends on into one portable folder.

## 2. Design principles

1. **Self-contained.** A package bundles *everything* it needs to run (pipeline def + stage contracts + the agent/skill/tool/gate definitions it uses). It must work standalone.
2. **Dedup on import.** When a host imports a package, common sub-modules (an agent/skill used by many pipelines) are **shared, not duplicated** — *but only after verifying they are truly identical* (see §7).
3. **Producer authors the label; consumer computes identity.** We (the producer) write each part's **label** (id + version). The host (consumer) **computes the content fingerprint** and decides sharing. We never pre-assign fingerprints.

## 3. Responsibility split

| Concern | Who | Where |
|---|---|---|
| Package **format** (this doc) | **Capability OS (us)** | `nexus` branch |
| **Producing** packages (e.g. `sdlc`) | **us** | `packages/` |
| **Labeling** each part (id + version) | **us** (authored intent) | in the manifest |
| Local **validation/test** tool | **us** | `engine/` (workbench, stays here) |
| **Import / unpack** a package | **Nexus** | product runtime |
| **Computing the fingerprint (hash)** + dedup | **Nexus** | product runtime |
| **Resolving deps** against the Shared Registry | **Nexus** | product runtime |
| The **consumer contract + reference plan** for the above | **us (spec), Nexus (impl)** | `packaging/` (separate doc) |

**Ships to Nexus:** the package + this format spec + the consumer contract + a reference plan.
**Stays here:** the dev interface / test workbench.

## 4. Package structure

```
sdlc-pipeline/                      ← the package (a folder; may be zipped as <id>.pipeline)
  pipeline.package.yaml             ← PACKAGE MANIFEST (the "label": packaging metadata + parts list)
  pipeline.yaml                     ← the pipeline DEFINITION (per pipeline_contract_standard.yaml)
  stages/                           ← bundled per-stage contracts
  components/                       ← bundled, self-contained dependencies, each labeled (id + version)
    teams/                          (team_templates + team_lead_roles entries used)
    agents/                         (agent_roles entries used)
    sub-agents/                     (sub_agent_roles entries used)
    skills/                         (skills_registry entries used)
    tools/                          (tools_registry entries used)
    core-abilities/                 (core_abilities entries used)
    governance/                     (governance_profiles used)
    audit/                          (audit_schemas used)
    model-profiles/  context-memory-profiles/
  gates/                            ← gate definitions for every entry in required_gates
  evidence/                         ← schemas for required_evidence + required_trace
  README.md                         ← human-readable description
```

A package is just a **folder**; it MAY be distributed zipped as `<pipeline_id>.pipeline`.

## 5. Package manifest — `pipeline.package.yaml`

The manifest is the **label**. It carries packaging metadata + the parts list. It does **not** carry fingerprints (the consumer computes those).

```yaml
package_schema_version: "0.1"          # this format's version
pipeline_id: sdlc_pipeline             # matches pipeline.yaml
name: SDLC Pipeline
description: Sıfırdan ürün seviyesine yazılım geliştirme (no-human governance).
package_version: "1.0.0"               # semver of THIS package (authored by us)
provenance:
  produced_by: nexus-capability-os
  source_commit: <git-sha>             # provenance only
  source_path: configs/nexus-ai/sdlc_pipeline.yaml
pipeline_def: pipeline.yaml            # pointer to the definition

# Every bundled part, with its LABEL (id + version) and path.
# The consumer matches by id, computes the content hash of `path`, then dedups.
components:
  - { kind: team,            id: sdlc_team,                version: "1.0.0", path: components/teams/sdlc_team.yaml }
  - { kind: team_lead,       id: sdlc_team_lead,           version: "1.0.0", path: components/teams/sdlc_team_lead.yaml }
  - { kind: agent,           id: code_reviewer,            version: "1.0.0", path: components/agents/code_reviewer.yaml }
  - { kind: skill,           id: verification-loop,        version: "1.0.0", path: components/skills/verification-loop.yaml }
  - { kind: tool,            id: test_runner,              version: "1.0.0", path: components/tools/test_runner.yaml }
  # ... every entry referenced by the pipeline's uses_* fields
gates:
  - { id: tests_pass,        path: gates/tests_pass.yaml }
  # ... 19 always (D-016) + 7 conditional  (gate entries are {id, set}; defs in gates/required_gates.yaml)
evidence:                  # governance/audit payload, bundled under evidence/
  required_evidence: [REQUIREMENTS_SPEC, ARCHITECTURE_DOC, "… (19 artifacts)"]
  required_trace:    [stage_gate_trace_schema, "… (5 records)"]
stages: [intake, requirements, "… (ordered ids; contracts bundled under stages/)"]
```

> The `components` list is derived from the pipeline definition's existing
> `uses_core_abilities`, `uses_skills`, `uses_tools`, `required_team_type`,
> `required_team_lead_role`, `uses_governance_profiles`, `uses_audit_schemas`,
> `uses_model_provider_profiles`, `uses_context_memory_profiles` fields. Packaging
> bundles each referenced entry from its Shared Registry file and stamps it with a version.
>
> **Component `kind` vocabulary:** `team`, `team_lead`, `core_ability`, `skill`, `tool`,
> `governance_profile`, `audit_schema`, `model_provider_profile`, `context_memory_profile`
> (plus `agent` / `sub_agent` where a pipeline declares them directly). When a `uses_*`
> token is an alias of a canonical id, the component records `requested_as: <token>`.
> Path spellings use hyphens (`core-abilities/`) while ids use underscores
> (`core_ability`) — a path-vs-id style split, not a mismatch.
>
> The authoritative, machine-generated example is `packages/sdlc-pipeline/pipeline.package.yaml`.

## 6. The pipeline definition — `pipeline.yaml`

This is the existing pipeline definition, conforming to `configs/nexus-ai/pipeline_contract_standard.yaml`
(`pipeline_definition_required_fields`, `stage_required_fields`, …). For the `sdlc` package it is a copy of
`configs/nexus-ai/sdlc_pipeline.yaml`, including:
- `stages` (ordered),
- `required_gates.always` = the **canonical 19-gate set (D-016)** + `conditional`,
- `required_evidence` + `required_trace` (the governance/audit differentiator),
- the `uses_*` dependency fields (→ the `components` list above),
- `entry_criteria` / `exit_criteria` / `blocking_conditions` / `allowed_rework_routes`.

## 7. Identity & dedup rule (the part Nexus runs)

A part's **identity for sharing is its content fingerprint**, not its name.

- Producer (us): write each part's **label** = `id` + `version`. We do **not** compute or ship a hash.
- Consumer (Nexus) on import:
  1. For each bundled part, compute a **content fingerprint** (hash of the part's canonical content), with Nexus's own algorithm.
  2. Look it up in the host's shared store:
     - **same `id` + same fingerprint → share** the existing copy (no duplicate).
     - **same `id` + different fingerprint → it is a different version**: keep both, do **not** overwrite, and **warn** (version conflict).
     - **new `id` → install** into the shared store.
  3. Resolve any declared version constraints against the **Shared Registry**.

This gives the owner's model: *everything is in the package (portable), yet common parts are shared on import — and never silently mismatched.* (Same approach as git / Docker / npm: identity by content, not by name.)

## 8. What this format guarantees (NCO's edge)

A `.pipeline` package always carries, inside the bundle:
- the **19 always-required gates (D-016)** the pipeline must pass,
- the **required evidence + trace** it must emit,
- its full governance/audit references.

So governance is **not** something the host adds later — it travels *with* the pipeline. This is the differentiator MetaGPT/Atoms lack.

## 8b. Versioning & provenance

- **`package_version`** — semver, authored per package (the package as a whole).
- **component `version`** — semver, authored per bundled part (its label). Identity for *sharing* is still the consumer-computed content fingerprint (§7); `version` is for humans + conflict messages, never an input to the hash.
- **`package_schema_version`** — the format version a package targets (currently `0.1`). A consumer **MUST refuse** a `package_schema_version` it does not support.
- **aliases** — when a `uses_*` token differs from a component's canonical id, the manifest records `requested_as: <token>` so resolution stays traceable.
- **`provenance`** (`produced_by`, `source_commit`, `source_path`) — records where/what the package was generated from. Advisory only; never an input to identity.

The validator (`engine/validate_package.py`) enforces: supported schema version, semver on package + components, no duplicate component ids, and **self-containment** (every `uses_*` / team reference in the definition is bundled, by id or alias).

## 9. Out of scope for this doc
- The host-side **import/dedup/resolve implementation** → Nexus (see the consumer contract, separate doc in this folder).
- A **reference/sample plan** for that implementation → separate doc.
- Running pipelines for real (LLM, sandbox) → later skeleton phases.

## 10. Open format questions (to settle while packaging `sdlc`)
- Zip envelope name/extension: `<id>.pipeline` (zip) vs folder-only.
- Canonicalization rule for "content" before the consumer hashes (so formatting noise doesn't change identity).
- Whether `components` should also allow **registry-reference-only** entries (not bundled) for very large shared parts — default is bundle-everything.
