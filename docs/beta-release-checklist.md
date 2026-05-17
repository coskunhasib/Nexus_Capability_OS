# Controlled Runtime Beta Release Checklist

## Release target

```text
Milestone 2 — Controlled Runtime Beta
```

## Closure status

```text
Beta evidence is documented.
Beta focused checks are wired into package scripts.
Beta focused checks run through prebuild.
Current release gate: npm run build && npm run check:generated.
```

## Required Alpha carry-over

```text
Capability Runtime Alpha gates remain green — done
CapabilityRuntimePanel remains read-only — done
strict Capability Runtime validators remain active — done
controlled worker runtime mapping remains verified — done
operator-run runtime mapping remains verified — done
external live execution remains outside default path — done
```

## Beta evidence

```text
artifact lifecycle policy exists — done
artifact lifecycle verifier exists — done
workspace boundary policy exists — done
workspace boundary verifier exists — done
note flow policy exists — done
note flow verifier exists — done
multi-skill controlled runtime fixtures exist — done
decision gate behavior is explicit — done
package script wiring for new Beta checks — done, PR #84
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

## Artifact lifecycle checklist

```text
artifact has id/ref/kind/summary/source refs — done
artifact has lifecycle status — done
artifact status transition rules are documented — done
artifact status transition verifier rejects invalid transitions — done
artifact refs remain traceable to runtime events or operator results — done
```

## Workspace boundary checklist

```text
allowed read paths are explicit — done
allowed write paths are explicit — done
reserved paths are explicit — done
artifact output root is explicit — done
out-of-scope writes fail validation — done
reserved paths override broad allow rules — done
```

## Note flow checklist

```text
new note candidates include source refs — done
updates preserve lineage — done
merge operation preserves replaced refs — done
retire operation includes reason — done
raw logs are not accepted as notes — done
```

## Decision gate checklist

```text
not-required gate allows — done
pending gate does not allow — done
granted gate requires trace fields — done
denied gate requires reason — done
required gate cannot be marked not-required — done
```

## Multi-skill controlled runtime checklist

```text
two required skills are present — done
two work-order steps are present — done
controlled worker manifest covers both steps — done
quality artifact is produced — done
review artifact is produced — done
runtime loop receives mapped events and artifacts — done
```

## Known limitations for Beta closure

```text
controlled execution remains local and deterministic
external live execution remains outside default path
persistent host API remains Milestone 3 work
external runtime mapping remains Milestone 4 work
workspace boundary policy is deterministic validation, not a full OS sandbox
artifact lifecycle is policy-level, not full storage lifecycle automation
```

## Beta closure decision

```text
Controlled Runtime Beta can be considered closed after CI passes this checklist update.
Next milestone: Milestone 3 — Embedded Nexus Integration.
```