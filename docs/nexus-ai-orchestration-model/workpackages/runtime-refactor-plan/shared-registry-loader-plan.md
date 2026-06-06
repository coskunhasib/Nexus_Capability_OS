# Shared Registry Loader — Runtime/Refactor Plan (Planning Only)

How a future Nexus AI runtime would **load the seven shared registries** from
`configs/nexus-ai/`, **resolve usage mappings** against them, **reconcile aliases**
(governance `*_policy` variants and Core Ability Name↔id), and **handle the
candidate-vs-canonical distinction**. This is a **PLAN** — it describes how a loader
*would* work; it does **not** implement one. No runtime code, no product refactor, no
connector integration, no deploy/publish, no main-branch merge, no plugin registry.

- **Phase:** G/H (doc 21 — [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md) §4 "Shared registry loader plan"; §5 required output `runtime-refactor-plan/shared-registry-loader-plan.md`).
- **Builds on (canonical sources, read from disk):**
  - The Shared-Registry + Usage-Mapping rule — [`../05-shared-registry-and-usage-mapping.md`](../../legacy/05-shared-registry-and-usage-mapping.md); decisions D-011..D-015 in [`../00a-shared-registry-decisions.md`](../../legacy/00a-shared-registry-decisions.md).
  - The registry item contract + per-category fields + validation rule — [`../17-shared-registry-formalization-plan.md`](../../legacy/17-shared-registry-formalization-plan.md) §3/§4/§11/§13.
  - The seven materialized registry files (the loader's input — see §1 below).
  - The 6 JSON Schemas the registries cross-reference — [`../../../configs/nexus-ai/schemas/`](../../../../configs/nexus-ai/schemas); cross-file invariants in [`../../../configs/nexus-ai/validation/README.md`](../../../../configs/nexus-ai/validation/README.md).
  - Canonical governance policy ids — [`../06-governance-policy-evidence.md`](../../legacy/06-governance-policy-evidence.md) §2–§3 (`no_self_approval`, `evidence_required`, …); operating model [`../01-nexus-ai-operating-model.md`](../../01-nexus-ai-operating-model.md) §6 (the 8 abilities).
  - The readiness verdict that gates this planning — [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md) (PASS_WITH_FINDINGS, item 10 owner approval pending).
- **Locked boundaries carried here:** Plugin yok · Pipeline != Team · Agent != Core Ability · Team Lead != Supervisor · Skill != Tool · Governance != Audit · Evidence != Trace.
- **Status of this layer:** the loader is **designed, not built**. Transition to any implementation is gated by doc 22 plus an explicit owner decision (§10).

---

## 1. What the loader loads — the seven registries

The loader's input is the seven Phase C / doc 17 §12 registry files under
`configs/nexus-ai/`. They are the **single authoritative existence record** ("what
exists") per shared category (doc 05 §3; doc 17 §13). Each file is single-document YAML
with a `registry_id`, a `shared_category`, and **one top-level list** of items. The list
key differs by file — the loader keys off the documented key, not a guessed one:

| # | Shared category | File | `registry_id` | Top-level item list key | Items (canonical / candidate)\* |
|---|---|---|---|---|---|
| 1 | Core Abilities | [`core_abilities.yaml`](../../../../configs/nexus-ai/core_abilities.yaml) | `nexus_ai_core_abilities` | `core_abilities:` | 8 canonical (names locked, K-003) |
| 2 | Skills | [`skills_registry.yaml`](../../../../configs/nexus-ai/skills_registry.yaml) | `nexus_ai_skills_registry` | `skills:` | mixed |
| 3 | Tools | [`tools_registry.yaml`](../../../../configs/nexus-ai/tools_registry.yaml) | `nexus_ai_tools_registry` | `tools:` | mixed |
| 4 | Governance Profiles | [`governance_profiles.yaml`](../../../../configs/nexus-ai/governance_profiles.yaml) | `nexus_ai_governance_profiles` | `governance_profiles:` | mixed; **owns** the canonical policy ids |
| 5 | Audit Schemas | [`audit_schemas.yaml`](../../../../configs/nexus-ai/audit_schemas.yaml) | `nexus_ai_audit_schemas_registry` | `audit_schemas:` | mixed (evidence + trace + decision/gate families) |
| 6 | Model / Provider Profiles | [`model_provider_profiles.yaml`](../../../../configs/nexus-ai/model_provider_profiles.yaml) | `nexus_ai_model_provider_profiles` | `profiles:` | mixed |
| 7 | Context / Memory Profiles | [`context_memory_profiles.yaml`](../../../../configs/nexus-ai/context_memory_profiles.yaml) | `nexus_ai_context_memory_profiles` | `profiles:` | mixed |

\* *Counts drift as the registries evolve; the loader never hard-codes them — it reads
`status` per item (§5).*

> **Note for the implementer:** categories 6 and 7 use the generic list key `profiles:`,
> while 1–5 use the category-named key. The loader's per-file descriptor must record the
> correct list key; do not assume a uniform key across all seven.

**Loader inputs that are NOT registries (referenced, not loaded as a category):**

- The 6 JSON Schemas (`configs/nexus-ai/schemas/`) — used to validate **instances**
  (stage contracts, pipeline definition, run, evidence item, artifact registry), not the
  registries themselves. The loader cross-references schema-owned field sets (e.g. the
  base evidence/trace field set the audit registry mirrors) but does not treat schemas as
  a shared category.
- The usage sites that the loader **resolves against** the registries: the 31 stage
  contracts (`configs/nexus-ai/stages/sdlc/*.yaml`), `sdlc_pipeline.yaml`, the pipeline
  catalog (`pipeline_catalog.yaml` + `pipeline-catalog/*.md`), and the team/agent
  catalogs (`team_templates`, `team_lead_roles`, `agent_roles`, `sub_agent_roles`). These
  are the **usage-mapping** side (doc 05 §4); they are read to *check* references, not to
  define existence.

---

## 2. Loader objective and the two questions it must keep separate

Per doc 05 §13 and D-011, the model deliberately records each shared item **twice**:

```
Shared Registry  → "what exists?"        (ownership / existence)
Usage Mapping    → "who uses what?"      (dependency / usage relation)
```

The loader must preserve that separation. Concretely it produces, in memory, two views:

1. **Existence view** — for each category, an index of every item by canonical `id`,
   carrying its `status`, item-contract fields (doc 17 §3), category fields (doc 17 §4),
   declared `aliases`, and the item's own `used_by` block.
2. **Usage-resolution view** — for every `uses_*` reference found at a usage site, the
   canonical item it resolves to (after alias normalization, §4), plus whether that
   reference is satisfied, aliased, candidate-only, or **dangling** (unresolvable).

The loader **never** infers existence from a usage site, and **never** treats a
usage-site mention as ownership (doc 05 §5 "yanlış/doğru"). A name that appears only at a
usage site and not in any registry is a dangling reference, reported — not silently
registered.

---

## 3. Load sequence (planning-level, no code)

A future loader would proceed in ordered passes. Each pass is described as behavior, not
implementation:

1. **Parse + well-formedness.** Load all seven YAML files; fail fast on a parse error.
   (Mirrors validation README "suggested order" step 1.)
2. **Identity check.** Confirm each file's `registry_id` and `shared_category` match the
   expected descriptor in §1 (guards against a file being moved/renamed under the wrong
   category).
3. **Item indexing.** For each registry, read its top-level list and index items by `id`.
   Reject **duplicate ids within a category** (ambiguous existence). Record each item's
   `status`, `aliases`, category fields, and `used_by`.
4. **Alias table build.** Assemble the global alias map (§4) from the three declared
   alias sources, plus the Core Ability Name↔id derivation. Reject an alias that maps to
   two different canonical ids (alias collision).
5. **Cross-registry candidate reconciliation.** Resolve the `referenced_candidates`
   block in `core_abilities.yaml` (and any analogous cross-references) against the owning
   registries; flag any referenced id that is absent from its declared `owned_by` file
   (§5, §6).
6. **Usage resolution.** Walk every usage site's seven `uses_*` arrays; resolve each
   token through the alias table to a canonical registry id; classify the result
   (satisfied / aliased / candidate-only / dangling) per §7.
7. **Invariant gate.** Run the load-time invariants (§8). A blocker-severity failure
   means the registry set is **not loadable as consistent**; the loader surfaces it
   rather than proceeding with a partial graph.

The output of a successful load is the two views from §2, plus a reconciliation report
listing every alias applied, every candidate-only reference, and every dangling
reference.

---

## 4. Alias resolution

Three distinct alias mechanisms exist in the materialized registries today. The loader
must honor all three so that a usage-site token always resolves to exactly one canonical
id. **Aliases are a read-time normalization only — they never rename the stored data.**

### 4.1 Governance `*_policy` variant → canonical policy id

The most prevalent reconciliation (doc 17 NAMING RECONCILIATION; doc 06 §2–§3). Usage
sites across **every** SDLC stage and all five non-SDLC pipelines spell two canonical
policies with a `_policy` suffix; the canonical owner is the Governance Profiles Registry:

```
no_self_approval_policy   → no_self_approval     (canonical owner: governance_profiles.yaml, status: canonical)
evidence_required_policy  → evidence_required    (canonical owner: governance_profiles.yaml, status: canonical)
```

The canonical item declares the variant under its own `aliases` list — e.g.
`governance_profiles.yaml` item `id: no_self_approval` carries
`aliases: [no_self_approval_policy]` (and likewise `evidence_required`). The loader treats
the `aliases` list on each **canonical** item as the authoritative source of variant
spellings. Resolution rule:

> When a usage `uses_governance_profiles` token is not found as a canonical `id`, look it
> up in the alias table; if it is an alias of a canonical id, resolve to that id and mark
> the reference `aliased` (not dangling).

Two **secondary, redundant** declarations of the same mapping also exist and must be
treated as **corroborating, not competing**:

- `core_abilities.yaml` → `policy_aliases:` (records `no_self_approval` /
  `evidence_required` ← `*_policy`, with `referenced_by_core_abilities`).
- `audit_schemas.yaml` → `governance_profile_aliases:` (same mapping, with
  `used_by_pipelines`).

The loader's alias-table build (§3 pass 4) merges all three. If they ever disagree about
which canonical id a variant maps to, that is an **alias collision** → blocker. The
governance registry's own `aliases` list is the tie-breaker of record because Governance
!= Audit and the policy is **owned** by the governance registry (the audit/core-ability
copies are references).

### 4.2 Core Ability **Name ↔ id** (PascalCase ↔ lowercase)

Core Abilities are referenced two ways across the corpus:

- **Usage sites** (`uses_core_abilities` in stage contracts, pipeline catalog, team/agent
  catalogs) use the **canonical PascalCase Name**: `Supervisor, Coder, Vision, Audio,
  Creative, Memory, Web, OS`. This is the *only* place an ability name may appear (validation
  README §6; schema `uses_core_abilities` enum).
- **The registry** (`core_abilities.yaml`) keys each item by a **lowercase snake id**
  (`supervisor, coder, vision, audio, creative, memory, web, os`) and carries the
  PascalCase form in the `name` field.

The loader derives a bidirectional Name↔id map from the registry's own `id`/`name` pair
per item (it does **not** lowercase heuristically — `OS`→`os` etc. comes straight from the
registry entry). Resolution rule:

> A `uses_core_abilities` token (PascalCase Name) resolves to the core-ability item whose
> `name` equals it; internally the loader keys by the item's lowercase `id`.

**Hard constraint preserved (K-003/K-006, doc 17 §4):** this mapping is **case/identity
only**. It must never be used to (a) treat a Core Ability as an Agent / `owner_agent` /
`sub_agent` / `team_lead`, or (b) treat `Supervisor` as a team lead. Each registry item
asserts `never_agent: true` (Supervisor also `never_team_lead: true`); the loader carries
these flags so a downstream resolver cannot place an ability in an agent slot. The eight
names are locked-canonical — the loader must reject a `core_abilities.yaml` that has more
or fewer than the eight, or any non-canonical status on them.

### 4.3 No other implicit aliasing

Outside §4.1 and §4.2, the loader does **not** invent aliases. It does not fuzzy-match,
pluralize, or case-fold ids in the other categories (skills, tools, audit schemas,
model/provider profiles, context/memory profiles). For those, a usage token must match a
canonical `id` exactly, or an explicitly declared `aliases` entry on a registered item,
or it is dangling. This keeps Skill != Tool and Evidence != Trace from being bridged by
accidental name similarity.

---

## 5. Candidate vs canonical handling

Every registry item carries a `status` from the locked vocabulary (doc 17 §11; core
abilities header): `canonical` (locked/established) · `candidate` (referenced, not yet
ratified) · `deprecated`. The loader loads **all** statuses but treats them differently.

| `status` | Loaded? | Resolvable as a usage target? | Loader behavior |
|---|---|---|---|
| `canonical` | yes | yes | Normal. The ratified existence record. |
| `candidate` | yes | yes, **but flagged** | Resolves, and the resolution is tagged `candidate-only`. Surfaced in the reconciliation report as ratification debt (carried per implementation-readiness-review backlog). Never auto-promoted by the loader. |
| `deprecated` | yes | configurable | Resolves with a `deprecated` warning; a strict load mode may downgrade a deprecated-only resolution to a finding. (No deprecated items exist yet, but the loader must not assume that.) |

Rules the loader enforces (doc 17 §11 / §13):

- **Every item has a `status`.** A missing `status` is a blocker (the existence record is
  incomplete).
- **Every item is either used or explicitly a candidate.** Per doc 17 §11 "every registry
  item has at least one usage mapping **or** status candidate." So a `canonical` item with
  an empty `used_by`/no resolved usage is a finding; a `candidate` item with no usage is
  allowed (it is, by definition, referenced-but-not-yet-bound).
- **Status is owned by the item's own registry.** A name that one registry references as
  `candidate` (e.g. in `core_abilities.yaml` → `referenced_candidates`) does not set the
  status of the **owning** registry's item. The loader resolves the reference to the
  owning registry and reads the **owner's** status. Example: `core_abilities.yaml`
  `referenced_candidates` lists `vision_model` as `status: canonical` (owned by
  `model_provider_profiles.yaml`) and `audio_model` / `creative_generation_model` as
  `status: candidate`; the loader confirms each against its `owned_by` file and reports a
  mismatch (a referenced item the owner does not actually carry, or carries at a different
  status) rather than trusting the reference.

Candidate handling exists precisely because the corpus has live candidate references
across the registries (e.g. unratified governance/audit/model profiles and several
context/memory profiles). The loader's job is to make those visible and resolvable for
planning, **not** to ratify them — ratification is a future review/owner action.

---

## 6. Cross-registry references and `referenced_candidates`

The registries reference each other by id (a Core Ability lists `governance_profiles`,
`audit_schemas`, `model_provider_profiles`, `exposed_tools`; a model profile lists
`governance_profiles`/`audit_schemas`; etc.). These are **references, not ownership** (doc
05 §11/§12; D-014/D-015). The loader resolves each cross-reference to the **owning**
registry and validates:

- the referenced id exists in the owning category (else dangling cross-reference);
- the family is correct — a `uses_governance_profiles` reference must land in the
  governance registry, a `uses_audit_schemas` reference in the audit registry, never the
  other way (Governance != Audit; Evidence != Trace family check, validation README
  governance-only checks).

`core_abilities.yaml` additionally publishes a `referenced_candidates` block declaring,
per category, ids it references with their expected `status` and `owned_by` file. The
loader uses this as a **reconciliation aid**: it confirms each declared candidate against
the owning registry and reports drift (present vs absent, status agree vs disagree). This
block is informational; the **owning** registry remains authoritative for both existence
and status (§5).

---

## 7. Usage-mapping resolution — classification of every `uses_*` reference

For every usage site (stage contract, pipeline definition, pipeline catalog entry, team/
agent role), the loader walks the **seven** `uses_*` arrays and classifies each token. The
seven arrays are mandatory and category-aligned (validation README §3; doc 05 §2):

```
uses_core_abilities          → Core Abilities      (PascalCase Name; §4.2)
uses_skills                  → Skills
uses_tools                   → Tools
uses_governance_profiles     → Governance Profiles (may carry *_policy alias; §4.1)
uses_audit_schemas           → Audit Schemas
uses_model_provider_profiles → Model / Provider Profiles
uses_context_memory_profiles → Context / Memory Profiles
```

Each token resolves to exactly one of:

| Class | Meaning | Loader action |
|---|---|---|
| `satisfied` | matches a canonical `id` directly | accept |
| `aliased` | matches via §4 alias (e.g. `*_policy`, or PascalCase→id) | accept, record the canonical id + the alias used |
| `candidate-only` | resolves, but the target's owner status is `candidate` | accept + flag as ratification debt |
| `wrong-family` | resolves to an item in the wrong category for that `uses_*` bucket | finding (boundary violation) |
| `dangling` | resolves to nothing in any registry/alias | finding (registry drift) — record in `open_questions` per validation README §3 |

This classification is the machine-checkable form of the doc 05 rule "the same item
appears in the registry **and** under every usage site." A `satisfied`/`aliased` token is
the registry+usage pair correctly closed; a `dangling` token is a usage with no backing
existence record (drift); a registry item that no usage site resolves to is
existence-without-usage (handled in §5).

---

## 8. Load-time invariants (the loader's own gate)

These are the registry-set invariants the loader checks **after** indexing and resolution.
They are drawn from doc 17 §11/§13 and the cross-file checks in the validation README that
apply to registries (the README's per-instance schema checks remain the schema layer's
job; the items below are the loader's responsibility). Severities follow the registries'
own `hard_rules`.

| # | Invariant | Severity | Source |
|---|---|---|---|
| 1 | Each shared category has exactly one registry file with the expected `registry_id`/`shared_category`. | blocker | doc 17 §11 ("every shared category has a registry file") |
| 2 | Every item has a `status` from {canonical, candidate, deprecated}. | blocker | doc 17 §11; core-abilities header |
| 3 | Every item is used **or** is a candidate (no canonical orphan). | finding | doc 17 §11 ("usage mapping or status candidate") |
| 4 | No duplicate `id` within a category; no alias collision (one alias → one canonical id). | blocker | loader integrity (§3 pass 3–4) |
| 5 | Exactly the **8** canonical Core Abilities, all `status: canonical`, each `never_agent: true` (Supervisor `never_team_lead: true`). | blocker | K-003/K-006; doc 17 §4; `core_abilities.yaml` `hard_rules` |
| 6 | No Core Ability id/name appears as `owner_agent`, `sub_agents`, `team_lead`, `produced_by`, `related_agent`, or `related_sub_agent` at any usage site. | blocker | validation README §6; readiness review item 2 |
| 7 | `Supervisor` is never resolved into a team-lead slot (Supervisor != *_team_lead). | blocker | K-006; validation README §6 |
| 8 | Every `uses_*` token is `satisfied`, `aliased`, or `candidate-only` — no `dangling`, no `wrong-family`. | finding (dangling) / blocker (wrong-family boundary) | doc 05; validation README §3 + governance-only checks |
| 9 | Family distinctness across resolution: Skill != Tool, Governance != Audit, Evidence != Trace (a token resolves only within its own category). | blocker | concept boundaries; validation README governance-only checks |
| 10 | **No `plugin`** key/value anywhere in the loaded registries or alias tables. | blocker | K-001; doc 17 §11 ("no plugin registry exists") |

A blocker means "the registry set cannot be loaded as a consistent graph"; the loader
reports and refuses to hand a partial graph to downstream resolvers. A finding means "the
set loads, but with named ratification/drift debt" — consistent with the readiness review
verdict (PASS_WITH_FINDINGS) that explicitly carried the reconciliation backlog into this
planning phase.

---

## 9. Consumers of the loaded registries (interfaces this plan must satisfy)

This loader is the shared substrate other doc 21 §4 planning-only documents resolve
against. The sibling plans (each their own file under this directory, none implemented)
expect the loader to expose:

- **Pipeline runner plan** / **pipeline run state model plan** — resolved `uses_*` for
  every stage/pipeline so a run can bind its `used_*` arrays to canonical ids.
- **Governance engine plan** — canonical governance ids with `severity_default`,
  `scope`/`applies_to`, and the `*_policy` alias normalization (so a stage that binds
  `no_self_approval_policy` is governed by canonical `no_self_approval`).
- **Audit / evidence store plan** — canonical evidence/trace/decision/gate schema ids,
  kept in distinct families (Evidence != Trace).
- **Tool permission system plan** — tool items with `risk_level`, `requires_sandbox`,
  `provided_by_core_ability`, `allowed_callers`.
- **Model/provider resolver plan** and **context/memory resolver plan** — the `profiles:`
  items of registries 6 and 7, with `used_by`, fallback/retention/redaction fields.
- **Core Abilities alignment plan** — the 8 canonical abilities with their
  `model_provider_profiles` / `exposed_tools` / `governance_profiles` / `audit_schemas` /
  `allowed_callers`, all `never_agent` (Supervisor `never_team_lead`).

The loader's contract to all of them is identical: **resolve to a single canonical id,
carry the status, carry the alias trail, never cross a category boundary, never place a
Core Ability in an agent/team-lead slot, never admit a plugin concept.**

---

## 10. Owner-approval dependency (explicit)

This document is **planning only**. Building the loader described here is **not
authorized** by this document and **must not** begin until two gates clear, in order:

1. **Doc 22 readiness gate.** All planning docs exist and the named reviews are
   `PASS`/`PASS_WITH_FINDINGS` with no blocking finding (doc 22 §3/§5). The
   [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
   verdict is **PASS_WITH_FINDINGS** with all nine hard blockers CLEAR; item 10 (owner
   approval) is the **pending final gate**, not a blocker for planning. The
   runtime/refactor plan set (this file included) must itself pass
   `../reviews/runtime-refactor-plan-review.md` (doc 21 §10; doc 22 §5).
2. **Explicit owner decision (doc 22 §7).** Even after the reviews pass, implementation
   requires the owner to record:

   ```
   OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
   ```

   The only thing that token unlocks (doc 22 §8) is the **Runtime / Refactor
   Implementation Planning Handoff** — preparing implementation workpackages. It is
   **still not** writing the loader's code. The alternative,
   `OWNER_DECISION: HOLD_FOR_MORE_REVIEW`, keeps the corpus in planning.

Until both gates clear, the following remain prohibited (doc 22 §9; doc 21 §3): runtime
code change, product refactor, connector integration, Nexus publish, deploy, main merge,
production-readiness claim. **No loader code is written under this plan.**

---

## 11. Open questions (carried forward, non-blocking)

These do not block this plan; they are decisions the runtime/refactor plan review and the
eventual implementation handoff must resolve. They mirror the reconciliation debt the
implementation-readiness review carried forward.

1. **Alias source of truth.** Three places declare the `*_policy` mapping
   (`governance_profiles.aliases`, `core_abilities.policy_aliases`,
   `audit_schemas.governance_profile_aliases`). Plan picks the governance registry as
   authoritative; confirm whether the two corroborating copies should remain (redundant
   but documentary) or be generated/derived to avoid future drift.
2. **Strict vs lenient load mode.** Should a `candidate-only` resolution be acceptable at
   runtime, or only in a planning/"draft" load? The registries are `registry_status:
   draft`; the runtime may want a strict mode that rejects candidate-only bindings once
   the corpus is ratified.
3. **Deprecated policy.** No `deprecated` items exist yet; the deprecation lifecycle
   (resolvable-with-warning vs hard-fail, and how `aliases` of a deprecated id behave) is
   undefined and should be specified before the first deprecation.
4. **`referenced_candidates` drift authority.** When `core_abilities.referenced_candidates`
   disagrees with the owning registry (status or presence), the plan reports it; confirm
   whether such drift is a blocker or a finding at load time.
5. **Reduced `sdlc_pipeline.yaml` shape.** The validation README notes `sdlc_pipeline.yaml`
   is a reduced pipeline-definition form that will not validate cleanly against
   `pipeline_definition.schema.json` as written. The loader resolves its `uses_*` arrays
   fine, but the definition/schema reconciliation is upstream debt that affects the
   pipeline runner plan more than this loader — flagged for cross-plan tracking.
