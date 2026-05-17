# Embedded Nexus Integration Checklist

## Release target

```text
Milestone 3 — Embedded Nexus Integration
```

## Required carry-over

```text
Alpha checks remain green
Beta checks remain green
local controlled verification remains green
external mapping remains later milestone work
```

## Host boundary checklist

```text
host request shape documented
runtime response shape documented
required fields documented
optional fields documented
blocked or partial result shape documented
observation return shape documented
artifact ref return shape documented
```

## Package boundary checklist

```text
core contracts listed
runtime mapping modules listed
verification helpers listed
read-only UI panel listed
sample fixtures listed
scaffold app shell separated conceptually
```

## Storage boundary checklist

```text
trace refs separated
memory notes separated
note candidates separated
artifact refs separated
runtime events separated
configuration separated
operator result files separated
```

## Permission boundary checklist

```text
requested tool grant shape documented
workspace boundary shape documented
decision gate shape documented
source ref requirement documented
artifact root expectation documented
host-owned decision points documented
```

## UI mount checklist

```text
mount point documented
data shape documented
read-only fields documented
future host decision points documented
```

## Configuration checklist

```text
default runtime mode documented
allowed mapping sources documented
storage roots documented
artifact roots documented
note policy documented
workspace boundary policy documented
decision gate policy documented
external mapping default documented
```

## Verification to add

```text
verify:nexus-host-boundary
verify:embedded-package-boundary
verify:storage-boundary
```

## Release decision

Milestone 3 can close when:

```text
host boundary verifier passes
package boundary verifier passes
storage boundary verifier passes
all Alpha and Beta checks remain green
known limitations are explicit
Milestone 4 plan is ready
```