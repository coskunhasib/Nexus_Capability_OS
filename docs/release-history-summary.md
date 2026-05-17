# Release History Summary

## Purpose

Some pull request titles are intentionally short because the tooling rejected more descriptive titles. This document maps the important PR range to actual repository changes.

## Contract phase

```text
PR #90 — Nexus host boundary
PR #91 — host boundary verifier wiring
PR #92 — embedded package boundary
PR #93 — storage boundary
PR #94 — permission boundary, UI mount, configuration, migration, release and closure docs
PR #95 — Milestone 3 progress closure
PR #96 — external runtime mapping boundary
PR #97 — provider manifest, external call, result normalization, fallback policy, capability matrix, safety, observability and closure docs
PR #98 — Milestone 4 progress closure
PR #99 — provider execution slice contracts and verifier
PR #100 — Milestone 5 progress closure
PR #101 — review layer contracts and verifier
PR #102 — Milestone 6 progress closure
```

## Implementation phase

```text
PR #103 — first working vertical slice
PR #104 — implementation backlog plan, canonical cleanup, shared contracts, artifact registry, runtime log and stronger vertical slice verifier
PR #105 — runner abstraction, state flow, state history verifier and vertical slice demo script
PR #106 — verify-all simplification, release history and working-system definition
PR #107 — minimal React vertical slice review panel
PR #108 — reason-code taxonomy and deterministic snapshot verifier
PR #109 — implementation backlog and status documentation refresh
```

## Local execution-kernel productization phase

```text
PR #110 — productization completion plan for local execution kernel
PR #111 — deterministic local store snapshots
PR #112 — controlled local runner execution
PR #113 — operator action workflow
PR #114 — local identity and permission boundary
PR #115 — alpha e2e verifier
PR #116 — final local execution-kernel documentation closure
```

## Scope correction and handoff phase

```text
PR #117 — clarify that PR #111–#116 close only the local capability execution kernel, not the whole Nexus layer; add docs/nexus-layer-roadmap.md
PR #118 — clarify that remaining work belongs to Nexus internal layers, not external post-alpha scope
PR #119 — add Nexus integration handoff guide and close this repository as the capability execution kernel package
```

## Current direction

```text
This repository is the completed local capability execution kernel package.
The main Nexus product is developed elsewhere.
Nexus integration should follow docs/nexus-integration-guide.md.
Do not continue implementing marketplace, dispatcher, compute, billing, company/team, or cloud/hybrid layers in this repository by default.
```
