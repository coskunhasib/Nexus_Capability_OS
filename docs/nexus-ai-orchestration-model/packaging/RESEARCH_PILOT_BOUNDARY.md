# Research Pipeline Pilot Boundary

Status: draft-0.1
Scope: owner-gated integration boundary for the first Nexus consumer pilot
Pipeline package: `packages/research-pipeline`
Branch rule: isolated `nexus` branch only; no main merge

## Purpose

This document freezes the boundary for the first Capability OS -> Nexus product
pilot without starting final-product integration work.

The pilot proves one narrow claim:

```text
A Nexus consumer can import the research_pipeline package read-only,
bind it to existing Nexus research sockets, run it with real execution,
enforce its bundled gates, and emit its declared evidence and trace.
```

It does not prove that every pipeline is production-ready, that the local
`engine/` workbench ships to Nexus, or that the final product repo may be
modified without a separate owner decision.

## Source Package

Canonical package:

```text
packages/research-pipeline/
```

Current package shape:

```text
pipeline_id: research_pipeline
package_version: 1.0.0
components: 30
stages: 11
gates: 13 always + 1 conditional
required_evidence: 16
required_trace: 7
```

The package is self-contained. Nexus must treat it as read-only input and must
compute content fingerprints locally during import.

## Responsibility Split

Capability OS owns:

- producing the `.pipeline` package and pull catalog;
- keeping package contents, stage contracts, gates, evidence, and trace schemas coherent;
- validating the package with the local workbench;
- documenting the consumer obligations and pilot boundary.

Nexus owns:

- acquiring/importing the package;
- computing canonical content fingerprints;
- deduplicating and sharing package parts without overwriting different content;
- resolving bundled dependencies against the Nexus Shared Registry;
- enforcing gates and emitting evidence/trace in the real runner;
- binding real tools, model calls, memory/context, sandboxing, and observability.

## Non-Goals

The pilot must not:

- ship `engine/` into Nexus as production runtime;
- modify the acquired package in place;
- weaken, drop, or reorder package gates;
- trust producer-supplied fingerprints;
- silently substitute host registry parts for incompatible bundled parts;
- bypass evidence or trace emission;
- introduce plugins, connector integration, deployment, or a main-branch merge.

## Consumer Runtime Slice

Minimum Nexus-side slice for the pilot:

```text
read-only package
  -> structure validation
  -> content fingerprint
  -> shared-store dedup/share
  -> dependency resolver
  -> gate/evidence loader
  -> research runner hook
  -> real tool/model execution
  -> evidence + trace emission
```

The pilot may be implemented in phases, but a package must not be marked
runnable until the gate/evidence loader and runner hook are active.

## Research Socket

The integration-readiness map identifies the first pilot socket as the existing
Nexus research capability:

```text
research_pipeline
  -> services/skills/web_research.py
  -> services/skills/web_search.py
```

Exact API names, call signatures, sandbox limits, and credential boundaries are
Nexus-side implementation details and must be confirmed in the product repo
before product integration begins.

## Pilot Inputs

Minimum pilot input:

```text
research_goal
bounded_research_questions or derivable questions
risk_profile
freshness_sensitivity flag
allowed_source_policy
run_owner / mission id
```

Freshness-sensitive runs must activate the conditional gate:

```text
source_recency_validated_if_freshness_sensitive
```

## Done Criteria

The pilot is complete only when all items below are true:

1. Import is atomic: malformed package copies are rejected with no partial shared-store state.
2. Import is idempotent: importing the same package twice creates no duplicates.
3. Every bundled part has a locally computed content fingerprint.
4. Same id + same fingerprint shares the existing part; same id + different fingerprint keeps both and warns.
5. Every declared dependency in `uses_*`, `required_team_type`, and `required_team_lead_role` resolves to a bundled component.
6. Nexus refuses to run the package if any required gate, evidence schema, or trace schema is missing.
7. A real research run executes through the Nexus research socket, not through the local mock runner.
8. All 13 always-required gates are evaluated and failed or unevaluated mandatory gates block completion.
9. The conditional freshness gate is evaluated when the run is freshness-sensitive.
10. All 16 required evidence artifacts are emitted or the run fails with a named missing artifact.
11. All 7 required trace records are emitted or the run fails with a named missing trace.
12. Cross-validation is performed by a role distinct from the producing role.
13. Final citations resolve to mapped evidence.
14. The research evidence graph is reproducible from the emitted evidence and trace.
15. A completion report records package id, package version, fingerprints, gates, evidence, trace, failed checks, and residual risks.

## Local Producer Verification

Before handing the package to Nexus, the Capability OS side should pass:

```bash
python3 engine/validate_package.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
```

Expected result:

- `validate_package.py` passes.
- Normal mock run passes.
- Skip run fails on `research_protocol_pre_registered`, proving mandatory gate enforcement still bites.

Accepted producer-side warning:

```text
research_completion<-ALL_STAGE_GATE_RESULTS
```

This is a runtime aggregate input produced by the runner/gate-evaluation layer,
not by a single research stage contract. It is accepted for the producer
package; the Nexus consumer runner must materialize the aggregate before
`research_completion`.

## Stop Rules

Stop the pilot and report instead of continuing if any of these occur:

- the package must be modified in place to import;
- a required bundled dependency is missing;
- Nexus cannot compute stable fingerprints;
- a mandatory gate is missing, skipped, failed, or unevaluated;
- evidence or trace cannot be emitted through Nexus observability;
- tool execution would require raw secret exposure to an agent;
- the product change would require broad refactor outside the consumer runtime slice;
- owner approval for product-repo integration is absent.

## ASCII Boundary

```text
Capability OS / nexus branch                         Nexus product / consumer
--------------------------------                     -------------------------
pipeline package authoring
package validation
mock proof
pull catalog
consumer contract
        |
        | hand over read-only package + contract
        v
                                                     importer
                                                     fingerprint
                                                     dedup/share
                                                     dependency resolver
                                                     gate/evidence loader
                                                     runner hook
                                                     real research execution
                                                     evidence + trace store
```

## Locked Pilot Defaults

For the pre-integration handoff in this repo:

- handoff artifact is the folder package at `packages/research-pipeline/`;
- zipped `<pipeline_id>.pipeline` envelope and marketplace pull are later Nexus-side phases;
- `engine/` remains a producer-side workbench and is not shipped as product runtime;
- `research-pipeline` is the first pilot package;
- package content is read-only to the consumer;
- gate/evidence loader and runner hook are required before the package can be marked runnable;
- this branch remains isolated on `nexus`; no `main` merge is part of this handoff.

## Nexus-Side Decisions Still Required

These remain owner-gated consumer implementation decisions:

- canonicalization algorithm and fingerprint storage schema;
- Nexus shared-store conflict warning surface;
- exact binding from research tools to Nexus services;
- sandbox and credential boundary for web/search/fetch execution;
- completion report location in the Nexus product runtime.
