# Working System Definition

## Minimum working system

The repository is considered to have a working implementation slice when the following command passes:

```bash
npm run verify:vs
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

## Required records

```text
source refs
trace refs
runtime log records
review decision
artifact disposition
accepted artifact record only when accepted
```

## Current manual commands

```bash
npm run verify:vs
npm run demo:vs
npm run build
```

## Not done yet

```text
React operator UI is not connected yet
real external provider execution is not enabled
persistent database storage is not added
production authentication is not added
```

## Active backlog

```text
docs/implementation-backlog-plan.md
```
