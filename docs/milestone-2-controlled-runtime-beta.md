# Milestone 2 — Controlled Runtime Beta

## Goal

Move from Alpha visibility and mapping to controlled local execution discipline.

Beta keeps the same host principle:

```text
Nexus is the host system.
Capability Runtime is the embedded skill-tool-agent layer.
Controlled worker outputs are mapped into the runtime contract.
External live execution remains outside Beta scope by default.
```

## Scope

```text
artifact lifecycle policy and verifier
workspace boundary verifier
memory note lifecycle verifier
multi-skill controlled runtime fixtures
approval checkpoint visibility
security policy update for controlled local execution
beta release notes
```

## Beta gates

```text
Alpha gates remain green
controlled worker mapping verifier passes
operator-run runtime mapping verifier passes
artifact lifecycle verifier passes
workspace boundary verifier passes
memory note lifecycle verifier passes
at least two skills run through controlled local fixtures
approval-required actions fail closed without approval
runtime events remain replayable or fixture-verifiable
```

## Non-goals

```text
no live external execution by default
no implicit network write access
no raw logs stored as memory
no broad file mutation
no hidden tool permissions
no production Nexus deployment requirement
```

## Deliverables

```text
docs/artifact-lifecycle-policy.md
scripts/verify-artifact-lifecycle.ts
docs/workspace-boundary-policy.md
scripts/verify-workspace-boundary.ts
docs/memory-note-lifecycle.md
scripts/verify-memory-note-lifecycle.ts
samples/controlled-runtime/
beta release notes
```

## Required verification

```bash
npm ci
npm run build
npm run check:generated
```

Focused Beta checks:

```bash
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
npm run verify:artifacts
npm run verify:memory-context
```

New Beta checks to add:

```bash
npm run verify:artifact-lifecycle
npm run verify:workspace-boundary
npm run verify:memory-note-lifecycle
```

## Safety notes

```text
Approval-required actions must fail closed without approval.
Workspace boundaries must be explicit and testable.
Artifacts must carry lifecycle status and source refs.
Memory note lifecycle must be create/update/merge/retire, not raw-log storage.
Controlled runtime fixtures must stay local and deterministic.
```

## Known starting limitations

```text
Artifact lifecycle exists as registry behavior but not yet as a dedicated lifecycle policy.
Workspace boundary is present in tool grants but not yet a standalone verifier.
Memory/context hardening exists, but memory note lifecycle is not yet isolated as create/update/merge/retire.
Controlled runtime currently has one main fixture path.
Approval checkpoint visibility is not yet a dedicated Beta artifact.
```

## Exit criteria

Beta exits into Milestone 3 — Embedded Nexus Integration when:

```text
all Alpha gates remain green
all Beta verifiers pass
controlled local execution boundaries are documented
artifact lifecycle is explicit
workspace boundaries are verifiable
memory note lifecycle is verifiable
known limitations are explicit
```