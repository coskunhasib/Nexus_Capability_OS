# `.pipeline` Consumer Contract — draft-0.1

> Status: **draft-0.1** · Scope: **consumer obligations only** (a contract, not code). Date: 2026-06-07
> Part of the Nexus AI Orchestration Model. Lives on the isolated `nexus` branch.
> Companion to [`PIPELINE_PACKAGE_FORMAT.md`](./PIPELINE_PACKAGE_FORMAT.md). Reference plan: [`NEXUS_INTEGRATION_PLAN.md`](./NEXUS_INTEGRATION_PLAN.md).

## 1. Purpose & audience

This document defines what a **conformant host** (the **consumer** — the Nexus product runtime) **MUST** do to consume a `.pipeline` package. The package format and labels are authored by the **producer** (Capability OS); the consumer does all runtime work: import, fingerprinting, dedup, dependency resolution, governance enforcement, and run.

This is a **contract**, not an implementation. It is implementation-agnostic: it states obligations and outcomes, not data structures or code. The reference design lives in the companion plan.

Key terms (from the format spec):
- **Label** — `id` + `version` that the producer authors for each bundled part. Travels in the manifest.
- **Content fingerprint** — a hash of a part's *canonical content*, computed **by the consumer**, never shipped by the producer.
- **Shared store** — the host's deduplicated store of installed parts (keyed by `id` + fingerprint).
- **Shared Registry** — the host's authoritative catalog of components (the `*_registry.yaml` family, `agent_roles.yaml`, `skills_registry.yaml`, `tools_registry.yaml`, etc.).

The keywords **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative.

## 2. Acquire & unpack

2.1 The consumer **MUST** be able to acquire a package either as a folder or as a zipped envelope named `<pipeline_id>.pipeline`, and unpack it to a working area.

2.2 The consumer **MUST** validate the package structure against the format spec (§4 of the format doc) **before** any further processing:
- `pipeline.package.yaml` (the manifest/label) is present and parses.
- `pipeline.yaml` (the pipeline definition) is present, parses, and matches `pipeline_def` in the manifest.
- Every `path` listed under `components`, `gates`, and `evidence` resolves to a file that exists inside the package.
- `package_schema_version` is a version this consumer supports.

2.3 The consumer **MUST** treat the unpacked package as **read-only input**. It **MUST NOT** modify, normalize-in-place, or write back into the acquired package (see §8).

2.4 If structure validation fails, the consumer **MUST** reject the import as a whole, emit a structured error naming the missing/invalid part, and make **no** changes to the shared store (atomic import — see §8.3).

2.5 The consumer **SHOULD** verify any provenance metadata present (`provenance.produced_by`, `source_commit`) and record it in the import log, but **MUST NOT** rely on provenance for identity — identity is by fingerprint (§3).

## 3. Compute the content fingerprint

3.1 For **every** bundled part (each entry in `components`, each gate in `gates`, each evidence/trace schema in `evidence`, and the `pipeline.yaml` definition itself), the consumer **MUST** compute a **content fingerprint**.

3.2 The consumer **MUST** define and apply a single deterministic notion of **canonical content** before hashing, so that formatting-only differences (whitespace, key order, quoting, trailing newlines, comments) do **not** change identity. "Canonical content" means the part's *semantic payload* after a fixed canonicalization (e.g. parse the YAML, drop comments, sort mapping keys, normalize scalars, serialize to a canonical byte form). The chosen canonicalization **MUST** be stable and documented by the consumer.

3.3 The fingerprint **MUST** be a cryptographic hash of the canonical content (e.g. SHA-256). The consumer **MAY** choose the algorithm but **MUST** apply it uniformly and record which algorithm produced a given fingerprint.

3.4 The fingerprint **MUST** be computed over **content only**. The producer-authored `version` in the label is metadata for humans and conflict messages; it **MUST NOT** be an input to the fingerprint.

3.5 The consumer **MUST NOT** accept or trust any fingerprint supplied inside the package; the format guarantees none is shipped. Identity is computed locally and only locally.

## 4. Dedup / share rule

For each bundled part, after computing its fingerprint, the consumer **MUST** apply this exact rule against the shared store, matching on the part's **`id`** (within its `kind`):

| Condition | Action |
|---|---|
| **Same `id` + same fingerprint** | **Share** the existing copy. Install nothing new; link this package's reference to the existing entry. |
| **Same `id` + different fingerprint** | **Different version.** Keep **both** entries, do **NOT** overwrite the existing one, and **emit a version-conflict warning** (§4.3). |
| **New `id`** (not in shared store) | **Install** the part into the shared store, keyed by `id` + fingerprint. |

4.1 The consumer **MUST NOT** deduplicate on `id` alone, or on `version` alone. Sharing happens **only** when both `id` and fingerprint match.

4.2 The consumer **MUST NOT** silently overwrite, replace, or mutate an existing shared-store entry whose `id` matches but whose fingerprint differs. Coexistence is required.

4.3 On a same-`id`/different-fingerprint case, the warning **MUST** include: the `kind`, the `id`, the producer-authored `version` of the incoming part, the `version`(s) already present, and both fingerprints (or short prefixes). The import **MUST** still proceed (it is a warning, not an error), with the package bound to the incoming part's fingerprint.

4.4 Import **MUST** be **idempotent**: re-importing the same package **MUST** result in all parts taking the "same `id` + same fingerprint → share" path and **MUST NOT** create duplicates or new warnings.

## 5. Resolve declared dependencies

5.1 The package is self-contained: it **bundles** every component it uses, derived from the pipeline definition's `uses_core_abilities`, `uses_skills`, `uses_tools`, `required_team_type`, `required_team_lead_role`, `uses_governance_profiles`, `uses_audit_schemas`, `uses_model_provider_profiles`, and `uses_context_memory_profiles` fields. The consumer **MUST** treat the bundled `components` as the primary source and **MUST** be able to run the package using them alone.

5.2 The consumer **MUST** cross-check each declared dependency (every `uses_*` reference and the required team/team-lead) against the bundled `components` list: every referenced `id` **MUST** have a corresponding bundled component of the matching `kind`. If a referenced dependency is **not** bundled, the import **MUST** fail with a structured error naming the missing `id`/`kind` (a self-contained package with a dangling reference is invalid).

5.3 Where a bundled part also exists in the host's **Shared Registry**, the consumer **MUST** honor any version constraints the registry declares for that `id`. If the bundled part's `version` is **incompatible** with a registry constraint, the consumer **MUST** treat it as a resolution failure: refuse to bind that dependency, report the conflicting `id`, required constraint, and bundled `version`, and **MUST NOT** silently substitute the registry's copy for the bundled one.

5.4 When both a bundled part and a registry/shared-store part are valid and identical (same `id` + same fingerprint), the consumer **MUST** share the single existing copy (§4) rather than keeping a redundant bundled duplicate.

5.5 The consumer **MUST NOT** auto-upgrade, auto-downgrade, or auto-patch a bundled component to satisfy resolution. Mismatches are surfaced, not papered over. The consumer **MAY** offer an explicit, owner-driven override path, but the default **MUST** be to refuse and report.

## 6. Honor governance-in-package

6.1 Governance travels **inside** the package. The consumer **MUST** load, from the package, before running:
- the **19 always-required gates (D-016)** from `required_gates.always` in the pipeline definition, each with its bundled gate definition in `gates/`;
- the **conditional gates** in `required_gates.conditional`, applied per their applicability conditions;
- the **`required_evidence`** schemas and **`required_trace`** schemas bundled in `evidence/`.

6.2 The consumer **MUST** verify that every entry in `required_gates.always` has a corresponding bundled gate definition, and that every entry in `required_evidence` and `required_trace` has a corresponding bundled schema. If **any** required gate, evidence schema, or trace schema is missing, the consumer **MUST refuse to run** the pipeline and report which item is missing.

6.3 The consumer **MUST NOT** silently drop, skip, weaken, or reorder the bundled gates, evidence, or trace requirements. The 19 always-required gates are mandatory for every run produced from the package.

6.4 The consumer **MUST NOT** require the operator to supply governance externally to make the package runnable: governance is provided by the package. The consumer **MAY** layer *additional* host-level policy on top, but **MUST NOT** subtract from what the package carries.

6.5 At run time the consumer **MUST** enforce the gates (a failed or unevaluated mandatory gate is a blocking condition, consistent with the pipeline's `blocking_conditions`) and **MUST** emit the declared evidence and trace records. Producing a release candidate while a mandatory gate is failed or unevaluated **MUST** be blocked.

## 7. Isolation, safety & idempotency

7.1 Import **MUST** be **isolated**: importing one package **MUST NOT** mutate or invalidate parts already relied upon by other imported packages. Coexisting versions (same `id`, different fingerprints) **MUST** remain independently addressable.

7.2 Import **MUST** be **idempotent** (restating §4.4 as a global property): the shared store after importing a package twice is identical to after importing it once.

7.3 Import **MUST** be **atomic**: either all parts of a package are imported and the package is registered as consumable, or — on any structural, dependency, or governance failure — **nothing** is added to the shared store and no partial state remains.

7.4 The consumer **MUST NOT**:
- mutate, rewrite, or re-serialize the acquired package contents;
- overwrite a differing same-`id` part in the shared store;
- assign or trust producer-supplied fingerprints;
- run a pipeline whose required gates / evidence / trace are incomplete;
- silently resolve a version-incompatible dependency.

7.5 The consumer **SHOULD** run untrusted package content under appropriate sandboxing at execution time, and **SHOULD** keep the shared store append-mostly (new fingerprints add entries; existing entries are not edited in place).

## 8. Conformance checklist

A host is a **conformant consumer** of `.pipeline` packages if it satisfies all of:

- [ ] **Unpack & validate** structure against the format spec; reject malformed packages atomically (§2).
- [ ] Treat the acquired package as **read-only**; never write back into it (§2.3, §7.4).
- [ ] Compute a **content fingerprint** per bundled part over **documented canonical content**, with a uniform cryptographic hash (§3).
- [ ] Never trust a producer-supplied fingerprint; `version` never feeds the hash (§3.4–§3.5).
- [ ] Apply the **same / different / new** dedup rule exactly; share only on `id` **and** fingerprint match (§4).
- [ ] On same-`id`/different-fingerprint: **keep both, never overwrite, warn** with full detail (§4.2–§4.3).
- [ ] Verify every `uses_*` / team reference is **bundled**; fail on dangling deps (§5.2).
- [ ] Honor **Shared Registry** version constraints; refuse (not substitute) on incompatibility (§5.3, §5.5).
- [ ] Load the **19 always-required gates (D-016)** + conditional gates + evidence + trace from the package (§6.1).
- [ ] **Refuse to run** if any required gate / evidence / trace schema is missing; never silently drop governance (§6.2–§6.3).
- [ ] Enforce gates at run time and emit declared evidence/trace; block release candidate on failed/unevaluated mandatory gate (§6.5).
- [ ] Import is **isolated, idempotent, and atomic** (§7.1–§7.3).

---

> Status: **draft-0.1**, 2026-06-07.
