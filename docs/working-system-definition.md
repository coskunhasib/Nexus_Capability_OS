# Working System Definition

## Local execution-kernel working system

The repository has a completed local execution-kernel working system when these commands pass:

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run verify:store
npm run verify:runner
npm run verify:actions
npm run verify:perm-local
npm run verify:alpha-e2e
npm run verify:all
npm run build
```

## Scope correction

```text
This document defines the completed local execution kernel.
It does not define completion of the whole Nexus layer.
```

## Required working paths

```text
happy path creates exactly one accepted artifact after review and disposition
missing source refs path is blocked before run request
fallback path records fallback and creates no accepted provider artifact
review reject path creates no accepted artifact
request changes path creates no accepted artifact
missing disposition path creates no accepted artifact
missing operator ref path creates no accepted artifact
artifact outside approved root creates no accepted artifact
controlled local runner can produce a reviewed accepted candidate
controlled local runner failure maps to safe fallback
reviewer without accept permission cannot accept
admin identity can accept after review and disposition
```

## Required state tracking

```text
every path starts at created
every path follows valid transitions
happy path ends accepted
blocked path ends blocked
fallback path ends fallback_used
```

## Required reason codes

```text
NONE
MISSING_SOURCE_REFS
FALLBACK_SELECTED
REVIEW_REJECTED
CHANGES_REQUESTED
MISSING_DISPOSITION
MISSING_OPERATOR_REF
ARTIFACT_OUTSIDE_ROOT
RUNNER_FAILURE
PERMISSION_DENIED
NO_ACCEPTED_ARTIFACT
```

## Required records

```text
source refs
trace refs
runtime log records
state history
review decision
artifact disposition
local store snapshot
accepted artifact record only when accepted
```

## UI status

```text
minimal React sidebar review panel is connected to the vertical slice
operator action workflow is implemented in runtime modules and verified by scripts
```

## Completed for local execution kernel

```text
working vertical slice
local deterministic snapshots
controlled local runner
operator action workflow
local identity checks
alpha e2e verification
minimal review UI
```

## Still active in Nexus layer roadmap

```text
skill marketplace
marketplace compute records
hidden dispatcher
workflow execution fabric
company/team usage layer
internal tenant/workspace isolation
billing and usage-credit primitives
trust and reputation gates
cloud/hybrid run policy
Nexus data contract and result ingestion
```

## Active Nexus roadmap

```text
docs/nexus-layer-roadmap.md
```
