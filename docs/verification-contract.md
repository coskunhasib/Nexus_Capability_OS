# Verification Contract

This document defines what the repository verification chain guarantees and what should be run locally before changing registry, trial, handoff, runtime bridge or UI code.

## Verification layers

```text
install determinism
→ packet/schema validity
→ registry consistency
→ TypeScript correctness
→ skill-aware trial execution
→ Nexus handoff usability
→ Nexus runtime bridge event coverage
→ snapshot sync
→ tree data sync
→ production build
→ bundle budget
→ generated artifact drift guard
→ CI summary
```

## CI command contract

GitHub Actions currently runs:

```text
npm ci
npm run validate:packets
npm run audit:registry
npx tsc --noEmit
npm run build
npm run check:generated
npm run summary:ci
```

`npm run build` has a `prebuild` lifecycle that runs the product-level generated checks:

```text
npm run audit:registry
npm run validate:packets
npm run trial:web-saas-skill
npm run trial:all-skills
npm run verify:handoff
npm run verify:runtime-bridge
npm run sync:trial-results
npm run sync:tree
```

`npm run build` also has a `postbuild` lifecycle:

```text
npm run check:bundle
```

## Local verification

Before opening a PR, run:

```bash
npm ci
npm run build
npm run check:generated
```

For faster focused checks:

```bash
npm run validate:packets
npm run audit:registry
npm run trial:all-skills
npm run verify:handoff
npm run verify:runtime-bridge
npm run check:bundle
```

## What each check guarantees

| Check | Guarantee |
|---|---|
| `npm ci` | `package.json` and `package-lock.json` are synchronized and installation is reproducible. |
| `validate:packets` | Packet samples and trial scenarios match their JSON schemas. |
| `audit:registry` | Registry files have required sections, no missing references and no duplicate ids. |
| `npx tsc --noEmit` | TypeScript is type-correct without emitting build files. |
| `trial:web-saas-skill` | The reference web SaaS scenario selects expected skills and produces review/memory/context outputs. |
| `trial:all-skills` | All current trial scenarios pass skill-aware assertions. |
| `verify:handoff` | Generated Nexus handoff packets are usable enough for a runtime to start work. |
| `verify:runtime-bridge` | Mock Nexus runtime events satisfy callback event and payload coverage expectations. |
| `sync:trial-results` | Trial, handoff and runtime bridge snapshots are copied into `samples/*-results`. |
| `sync:tree` | Registry data regenerates `src/generated-tree-data.ts` and `src/data.ts`. |
| `check:bundle` | Production bundle stays within defined JS/CSS budgets. |
| `check:generated` | Generated tracked and untracked artifacts are committed and not drifting. |
| `summary:ci` | GitHub Actions gets a readable matrix summary of trial/handoff/runtime/bundle status. |

## Generated artifacts

The following paths are generated and guarded:

```text
src/generated-tree-data.ts
src/data.ts
samples/trial-results
samples/handoff-results
samples/runtime-bridge-results
```

If `check:generated` fails, run:

```bash
npm run prebuild
npm run check:generated
```

Then commit the generated changes.

## Bundle budget

Current budget limits:

```text
initial index JS <= 300 kB
largest JS chunk <= 500 kB
total JS <= 1200 kB
total CSS <= 80 kB
```

If `check:bundle` fails, prefer:

```text
lazy-load heavy views
split large registry payloads
avoid importing large JSON into the initial shell
reduce generated static payload size
```

Do not raise bundle limits unless the new size is intentional and justified.

## Trial and Nexus runtime contract

A scenario is considered healthy only when all three layers pass:

```text
Trial result: pass
Nexus handoff usability: pass
Nexus runtime bridge: pass
```

This means:

```text
The compiler can route the intent.
The handoff packet contains enough information for Nexus/runtime to start work.
The mock runtime can emit expected callback events and payloads.
```

## Failure policy

Do not bypass a failing verification step by weakening the guard first.

Preferred order:

```text
1. Read the failing output.
2. Identify whether the product output is stale, missing or invalid.
3. Regenerate artifacts when needed.
4. Commit the generated result.
5. Only change guard logic if the guard is demonstrably checking the wrong thing.
```

## Current known limitation

The runtime bridge is still a mock verification layer. It proves event/payload contract coverage, not real external agent execution.

The next integration milestone is:

```text
nexus.handoff_packet
→ real runtime adapter
→ real runtime_bridge events
→ gate evidence + artifact refs
→ review report + memory/context packets
```
