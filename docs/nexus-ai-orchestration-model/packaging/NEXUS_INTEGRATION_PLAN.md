# Nexus Integration Plan (Reference) — draft-0.1

> Status: **draft-0.1** · Scope: **reference/sample implementation plan** for the Nexus side. Date: 2026-06-07
> Part of the Nexus AI Orchestration Model. Lives on the isolated `nexus` branch.
> Companion to [`PIPELINE_PACKAGE_FORMAT.md`](./PIPELINE_PACKAGE_FORMAT.md) (format) and [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md) (obligations).

> **READ FIRST — this is a REFERENCE PLAN, not a build order for this repo.**
> We (Capability OS) **specify**; **Nexus builds**. This document is a concrete blueprint so the Nexus team has something to implement against. It does **not** authorize any integration into the final product repo. Final-repo integration is a **separate, owner-approved step** (per the packaging roadmap). Pseudocode-level data flow is included for clarity; **no real code** is provided or implied.

## 1. Where this plugs into Nexus

Nexus already has the building blocks a consumer needs. This plan maps `.pipeline` import onto them rather than inventing parallel infrastructure.

| `.pipeline` concept | Existing Nexus piece it maps to |
|---|---|
| Acquire a package (pull) | Nexus **marketplace / registry** (the existing pull/distribution path) |
| Load an imported unit | Nexus **loader** (the thing that already loads skills/agents into the runtime) |
| Shared store of components | Nexus **Shared Registry** concept (catalog of agents/skills/tools) |
| Bundled `components` (agents, skills, tools, …) | Nexus **agents/skills** subsystems + tool registry |
| Run the pipeline | Nexus **runtime / runner** (stage execution, the existing orchestration loop) |
| Governance gates + evidence/trace | Nexus **policy/observability hooks** at the runner boundary |

The net new surface is small: a **package importer** that sits in front of the existing loader, plus a **fingerprint + dedup** layer in front of the existing Shared Registry, plus a **gate/evidence wiring step** into the existing runner. Everything else reuses what Nexus has.

## 2. Components to build (reference design)

Each component below is described as a reference design. Data flow is sketched at pseudocode level; it is illustrative, not prescriptive of structures or APIs.

**2.1 Importer.** Entry point for consuming a package. Acquires the package (folder or `<id>.pipeline` zip) via the marketplace path, unpacks to a scratch area, and validates structure against the format spec: manifest parses, `pipeline.yaml` matches `pipeline_def`, and every `path` under `components`/`gates`/`evidence` exists. It orchestrates the other components and guarantees the import is **atomic** (stage everything; commit to the shared store only if all checks pass) and **idempotent** (re-import is a no-op). It treats the unpacked package as read-only.

**2.2 Fingerprinter.** Given any bundled part, produces its **content fingerprint**. It first canonicalizes the part (parse YAML → drop comments → sort keys → normalize scalars → canonical byte serialization), then hashes the canonical bytes (e.g. SHA-256). The canonicalization rule is fixed and documented so formatting noise never changes identity, and `version` is never an input. Flow: `fingerprint(part) = hash(canonicalize(part.content))`.

**2.3 Shared-store / dedup.** Wraps the Nexus Shared Registry with the **same / different / new** rule. For each part it looks up `id` (within `kind`) and compares the incoming fingerprint to what is stored: same id + same fingerprint → bind to the existing entry (no install); same id + different fingerprint → install the new fingerprint alongside, keep both, raise a version-conflict warning; new id → install. It never overwrites a differing same-id entry and keeps the store append-mostly so coexisting versions stay independently addressable.

**2.4 Dependency resolver.** Confirms the package is truly self-contained and registry-consistent. It walks the pipeline definition's `uses_*` fields plus `required_team_type` / `required_team_lead_role` and checks each referenced `id` is present in the bundled `components` of the right `kind` (dangling reference → fail). Where an `id` also lives in the Shared Registry with version constraints, it checks compatibility; on an incompatible bundled `version` it refuses and reports rather than substituting or auto-upgrading.

**2.5 Gate / evidence loader.** Reads governance straight from the package: the **19 always-required gates (D-016)** from `required_gates.always` (+ conditional gates), and the `required_evidence` / `required_trace` schemas from `evidence/`. It verifies each required gate has a bundled definition and each required evidence/trace entry has a bundled schema; any gap means the package is registered as **non-runnable** and the reason is reported. It hands the loaded gate set + schemas to the runner; it never drops or weakens them.

**2.6 Runner hook.** The bridge from an imported package to the existing Nexus runner. Before a run starts it asserts the gate/evidence/trace set is complete; during the run it enforces each gate at its producing stage (a failed or unevaluated mandatory gate becomes a blocking condition) and emits the declared evidence and trace records through Nexus's observability path. It enforces the release-candidate rule: no release candidate while a mandatory gate is failed or unevaluated.

## 3. Phased rollout

A staged path so value lands early and risk stays contained.

- **Phase 1 — Import + validate.** Importer + structure validation only. Acquire, unpack, validate against the format spec, reject malformed packages atomically. *Exit:* the `sdlc` package imports cleanly and a malformed copy is rejected with a clear error.
- **Phase 2 — Fingerprint + dedup/share.** Add the Fingerprinter and Shared-store/dedup; wire the dependency resolver's "is it bundled?" check. *Exit:* re-import is idempotent; an altered same-id part produces a version-conflict warning and both copies coexist; dangling deps fail.
- **Phase 3 — Run with gates + evidence.** Add the Gate/evidence loader and Runner hook; enforce gates and emit evidence/trace on a real run. *Exit:* the `sdlc_pipeline` runs end-to-end with all 19 gates enforced; a missing gate/evidence makes the package non-runnable; release candidate is blocked behind the mandatory gates.
- **Phase 4 — Marketplace pull.** Connect acquisition to the Nexus marketplace/registry so packages are pulled (not hand-placed), with provenance recorded. *Exit:* a published `.pipeline` is pulled and consumed through the normal marketplace path.

> Each phase is independently shippable. Phases 1–3 can be exercised against a locally placed package; Phase 4 is the only one that needs marketplace wiring.

## 4. Data flow (text/ASCII)

```
            ┌──────────────────────────── NEXUS (consumer) ────────────────────────────┐
            │                                                                           │
  pull      │   ┌──────────┐   read-only    ┌──────────────┐                            │
 ─────────► │   │ IMPORTER │ ─────────────► │  structure   │── invalid ──► reject (atomic, no state)
 (mktplace) │   └────┬─────┘                │  validation  │                            │
            │        │ per bundled part         └──────────────┘                        │
            │        ▼                                                                   │
            │   ┌──────────────┐  canonicalize+hash   ┌──────────────────────────┐      │
            │   │ FINGERPRINTER│ ───────────────────► │  SHARED-STORE / DEDUP     │      │
            │   └──────────────┘                      │  same id+fp → share       │      │
            │                                         │  same id,diff fp → keep   │      │
            │                                         │     both + WARN           │      │
            │                                         │  new id → install         │      │
            │                                         └────────────┬─────────────┘      │
            │                                                      │ (Shared Registry)   │
            │   ┌──────────────────────┐   bundled? + constraints  │                     │
            │   │ DEPENDENCY RESOLVER  │ ◄────────────────────────┘                      │
            │   └──────────┬───────────┘ missing/incompatible ──► fail + report          │
            │              ▼                                                              │
            │   ┌──────────────────────┐  load 19 gates (D-016) + evidence + trace       │
            │   │ GATE / EVIDENCE LOADER│ ── any missing ──► mark NON-RUNNABLE + report   │
            │   └──────────┬───────────┘                                                  │
            │              ▼                                                              │
            │   ┌──────────────────────┐  enforce gates @ stage, emit evidence/trace,    │
            │   │     RUNNER HOOK       │  block release candidate on failed/uneval gate  │
            │   └──────────┬───────────┘                                                  │
            │              ▼                                                              │
            │        existing Nexus runner ── stage-by-stage execution                   │
            └───────────────────────────────────────────────────────────────────────────┘
```

## 5. Risks & open questions

- **Canonicalization drift.** If the consumer's canonicalization is under-specified, the same content could hash differently across hosts/versions, breaking dedup. *Mitigation:* freeze and document the canonicalization rule (mirrors format §10 open question).
- **Envelope shape.** Folder vs `<id>.pipeline` zip is still open in the format spec; the importer must support whatever is chosen.
- **Registry-reference-only parts.** The format default is bundle-everything, but very large shared parts *may* later be allowed as registry references. The resolver design should not hard-assume "always bundled" forever.
- **Conditional-gate applicability.** Who decides applicability of the 7 conditional gates (run context vs package), and how is that recorded in trace?
- **Version-conflict ergonomics.** A warning is correct per the contract, but operators will want a clear surface listing coexisting versions per `id`.
- **Hash algorithm governance.** Consumer picks the algorithm; if it ever changes, fingerprints across the shared store must be migrated or namespaced by algorithm.

## 6. Definition of done (reference)

- [ ] Importer acquires, unpacks, validates, and rejects malformed packages atomically.
- [ ] Fingerprinter applies a documented canonicalization + uniform hash; `version` never feeds the hash.
- [ ] Shared-store/dedup implements **same / different / new** exactly; coexistence + warning on conflict; idempotent re-import.
- [ ] Dependency resolver fails on dangling deps and on registry version-incompatibility (refuse, don't substitute).
- [ ] Gate/evidence loader loads the 19 gates (D-016) + conditional + evidence + trace; marks packages non-runnable on any gap.
- [ ] Runner hook enforces gates, emits evidence/trace, blocks release candidate on failed/unevaluated mandatory gate.
- [ ] `sdlc_pipeline` package imports, dedups, and runs end-to-end through Phases 1–3.
- [ ] Phase 4 pulls a published package via the marketplace with provenance recorded.
- [ ] Conformance checklist in [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md) §8 fully satisfied.
- [ ] Owner approval obtained before any final-repo integration.

---

> Status: **draft-0.1**, 2026-06-07. Reference plan only — Nexus implements; gated on owner approval for final-repo integration.
