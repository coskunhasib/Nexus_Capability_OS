# Controlled Runtime Beta Release Checklist

## Release target

```text
Milestone 2 — Controlled Runtime Beta
```

## Required Alpha carry-over

```text
Capability Runtime Alpha gates remain green
CapabilityRuntimePanel remains read-only
strict Capability Runtime validators remain active
controlled worker runtime mapping remains verified
operator-run runtime mapping remains verified
external live execution remains outside default path
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
package script wiring for new Beta checks — follow-up
```

## Verification commands

```bash
npm ci
npm run build
npm run check:generated
```

Existing focused checks:

```bash
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
npm run verify:artifacts
npm run verify:memory-context
```

Manual focused checks until package script wiring is added:

```bash
npx tsx scripts/verify-artifact-lifecycle.ts
npx tsx scripts/verify-workspace-boundary.ts
npx tsx scripts/verify-note-flow.ts
npx tsx scripts/verify-multi-skill-controlled-runtime.ts
npx tsx scripts/verify-decision-gate.ts
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

## Known limitations to include in Beta notes

```text
controlled execution remains local and deterministic
external live execution remains outside default path
persistent host API remains Milestone 3 work
external runtime mapping remains Milestone 4 work
package script wiring for the new focused Beta checks remains a follow-up
```