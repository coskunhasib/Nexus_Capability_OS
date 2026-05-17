# Controlled Runtime Beta Release Notes

## Release status

```text
Milestone: Controlled Runtime Beta
Status: closure in progress
Primary verification: npm run build && npm run check:generated
```

## Scope

Controlled Runtime Beta moves the system from Alpha visibility into controlled local execution discipline.

```text
artifact lifecycle policy and verifier
workspace boundary policy and verifier
note flow policy and verifier
multi-skill controlled runtime fixture and verifier
decision gate policy and verifier
focused Beta checks wired into package scripts
```

## Evidence added

```text
Artifact lifecycle records have status and source refs.
Artifact lifecycle transitions are validated.
Workspace boundary decisions are deterministic.
Note flow operations preserve source refs and lineage.
Multi-skill controlled runtime fixture proves at least two skills can feed a controlled loop.
Decision gates make pending, granted and denied states explicit.
Focused Beta verifiers are available through package scripts and prebuild.
```

## Verification commands

```bash
npm ci
npm run build
npm run check:generated
```

Focused Beta checks:

```bash
npm run verify:artifact-lifecycle
npm run verify:workspace-boundary
npm run verify:note-flow
npm run verify:multi-skill-controlled-runtime
npm run verify:decision-gate
```

Carry-over checks:

```bash
npm run verify:capability-runtime
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
```

## Safety boundaries

```text
Controlled execution remains local and deterministic.
Tool grants remain explicit.
Workspace boundary checks are deterministic.
Artifacts require source refs.
Note changes require source refs and lineage.
Decision gates require trace fields when granted or denied.
External live execution remains outside Beta scope.
```

## Known limitations

```text
Runtime loop is still not a persistent host subsystem.
Persistent host API is Milestone 3 work.
External runtime mapping is Milestone 4 work.
Workspace boundary rules are deterministic policy checks, not a complete OS sandbox.
Artifact lifecycle is policy-level, not full storage lifecycle automation.
```

## Next milestone

```text
Milestone 3 — Embedded Nexus Integration
```

Milestone 3 should focus on:

```text
Nexus host API boundary
runtime package boundary
storage boundary
permission boundary
UI mount point
configuration surface
migration path from repo scaffold to embedded subsystem
```