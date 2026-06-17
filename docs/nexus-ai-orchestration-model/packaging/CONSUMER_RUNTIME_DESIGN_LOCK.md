# Consumer Runtime Design Lock

Status: Phase 4 design lock
Date: 2026-06-17
Scope: Nexus consumer-runtime design only; no product-repo implementation

## Purpose

This document freezes the consumer-runtime design that Nexus must implement
before the first real `.pipeline` pilot can run. It is based on the Phase 3
read-only Nexus socket audit and the current package contracts in this repo.

This is not an instruction to start integration. Phase 5 remains owner-gated.

## Locked Decisions

1. Import boundary:
   Nexus needs a dedicated package import path, separate from normal ad-hoc
   pipeline creation. The importer accepts a folder package first; zip and
   marketplace envelopes remain later distribution work.

2. Atomic import:
   No shared-store or runtime state is committed until structure validation,
   dependency resolution, gate/evidence loading, and fingerprinting all pass.
   Failed imports leave no partial consumable package behind.

3. Fingerprint ownership:
   Nexus computes fingerprints. Producer-authored package labels and versions
   are not identity. Fingerprints are computed from documented canonical content
   with a namespaced algorithm/version.

4. Dedup/share behavior:
   Same `kind` + same `id` + same fingerprint shares the existing entry.
   Same `kind` + same `id` + different fingerprint keeps both entries and emits
   an owner-visible warning. The importer must not overwrite or mutate the
   existing entry.

5. Dependency resolver:
   The package manifest and pipeline definition are cross-checked. Every used
   core ability, skill, tool, team, team lead, governance profile, audit schema,
   model profile, and context-memory profile must either be bundled correctly or
   fail import with a structured missing-dependency report.

6. Gate/evidence loader:
   The consumer loads the package-declared governance bundle. It must not
   hard-code a global gate count.

   - `research-pipeline` declares 13 always gates and 1 conditional gate.
   - `sdlc-pipeline` declares the 19 always-required D-016 gates and 7
     conditional gates.

   Missing required gates, evidence schemas, or trace schemas make the package
   non-runnable.

7. Runner hook:
   A package run creates a run record, stage events, gate decisions, evidence
   records, and trace records. Failed or unevaluated mandatory package gates
   block completion.

8. Human and permission gates:
   Existing `plan_review_gate` can support owner approval where appropriate.
   Existing `permission_gate` and task orchestration are report-only inputs
   today; they do not replace package gate enforcement until Nexus upgrades
   them to a real blocking runtime.

9. Evidence vs trace:
   Evidence proves the decision. Trace explains how the run moved. Nexus should
   reuse redaction/safe-metadata helpers where useful, but package evidence
   persistence remains a distinct runtime responsibility.

10. Research pilot adapter:
    The first pilot calls existing Nexus `deep_research` and `web_search`
    capability through skill dispatch or a thin adapter. It must preserve Nexus
    airgap policy, strict mock behavior, and credential boundaries.

11. Sandbox and credentials:
    Package execution never receives raw provider credentials. Runtime adapters
    call existing Nexus controlled services instead of exposing secrets to the
    imported package.

12. Completion report:
    Every package run emits an owner-readable report containing package id,
    package version, package fingerprint, component fingerprints, gate outcomes,
    evidence pointers, trace pointers, warnings, and residual risks.

13. Post-integration orchestrator routing:
    After package import and the first pilot are proven, the
    `mission_orchestrator` runtime must know the available main, specialist,
    and blueprint-level pipeline catalog and route or redirect matured intent to
    the best matching pipeline when needed. This is Phase 9 work, not Phase 4
    implementation work.

## Accepted Interfaces

```text
PackageImportRequest
  package_path
  source_kind
  requested_by
  dry_run

PackageImportResult
  package_id
  package_version
  package_fingerprint
  runnable
  warnings
  errors

PackageFingerprintRecord
  kind
  id
  authored_version
  fingerprint
  algorithm
  canonicalization_version

PackageComponentBinding
  package_id
  component_kind
  component_id
  fingerprint
  binding_action: shared | installed | conflict_kept

PackageDependencyReport
  resolved_dependencies
  missing_dependencies
  incompatible_dependencies

PackageGovernanceBundle
  required_gates_always
  required_gates_conditional
  required_evidence
  required_trace

PackageRunRequest
  imported_package_id
  mission_id
  input_payload
  owner_approval_ref

PackageRunEvent
  run_id
  stage_id
  event_type
  gate_id
  evidence_ref
  trace_ref

PackageEvidenceRecord
  run_id
  evidence_id
  schema_id
  storage_ref
  redaction_state

PackageCompletionReport
  run_id
  package_identity
  gate_summary
  evidence_summary
  trace_summary
  warnings
  residual_risks
```

## Human-Readable Flow

```text
Capability OS package
        |
        v
Nexus package importer
        |
        +--> structure validation
        |
        +--> fingerprint canonicalization
        |
        +--> shared-store dedup/share
        |
        +--> dependency resolution
        |
        +--> package-declared gate/evidence/trace loading
        |
        v
import registry marks package runnable or non-runnable
        |
        v
runner hook executes stages with package gates enforced
        |
        v
evidence + trace + completion report
        |
        v
post-integration orchestrator routing hardening
```

## Known Risks

- Canonicalization drift can break dedup if Nexus changes the hash input rules
  without versioning the algorithm.
- Existing `permission_gate` is report-only and cannot be treated as a blocking
  package gate until upgraded in Nexus.
- Existing Nexus run logs and cognitive details are useful sockets, but package
  evidence persistence still needs an explicit mapping.
- Gate count hard-coding would break non-SDLC packages; the loader must read the
  package-declared governance bundle.
- The Phase 3 read-only audit is a snapshot of a dirty Nexus product worktree
  and must be refreshed if integration is delayed.
- Orchestrator catalog routing is intentionally deferred to Phase 9, after the
  first package import and pilot run prove the runtime seam.

## Phase 4 Exit Decision

Phase 4 is complete when this document is referenced by the phase plan and the
related packaging docs no longer describe SDLC's 19-gate set as a universal
consumer-runtime rule.
