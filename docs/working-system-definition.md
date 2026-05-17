# Working System Definition

## Minimum working system

The repository has a working implementation slice when these commands pass:

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run build
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
accepted artifact record only when accepted
```

## Current manual commands

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run demo:vs
npm run verify:all
npm run build
```

## UI status

```text
minimal React sidebar review panel is connected to the vertical slice
full operator workflow is not complete yet
```

## Not done yet

```text
real controlled provider execution beyond mock runner
persistent database storage
production authentication and authorization
full operator workflow beyond minimal sidebar panel
```

## Active backlog

```text
docs/implementation-backlog-plan.md
```
