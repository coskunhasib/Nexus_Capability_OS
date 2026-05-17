# Nexus Embedded Package Boundary

Capability Runtime is embedded into Nexus as a bounded subsystem, not as a hidden fork of the host application.

The package boundary keeps the runtime portable, testable, and replaceable while allowing Nexus to own product decisions such as permissions, persistence, UI placement, and release policy.

## Boundary rule

```text
Nexus owns host decisions.
Capability Runtime owns runtime contracts, mapping, verification helpers, read-only presentation, fixtures, and scaffold compatibility.
```

## Export groups

```text
core_contracts
runtime_mapping
verification_helpers
read_only_ui_panel
sample_fixtures
scaffold_app_shell
```

## Core contracts

Core contracts define stable packet, artifact, event, boundary, memory-note, decision-gate, and evaluation shapes.

Rules:

```text
contracts must be serializable
contracts must not import host UI
contracts must not call host storage directly
contracts must keep source refs explicit
contracts must preserve local controlled verification
```

## Runtime mapping

Runtime mapping turns host requests into controlled runtime execution input and turns runtime output into host-safe response packets.

Allowed:

```text
map host request to runtime input
map runtime artifacts to artifact refs
map runtime events to host-readable events
map note candidates without committing memory
map blocked or partial states
```

Blocked:

```text
direct host permission escalation
direct writes into Nexus memory
implicit tool grants
host-specific navigation side effects
cloud-only execution assumptions
```

## Verification helpers

Verification helpers are exported as scripts and reusable validators.

Required verifier classes:

```text
host boundary verifier
embedded package boundary verifier
storage boundary verifier
permission boundary verifier
configuration surface verifier
```

## Read-only UI panel

The embedded panel may render runtime state, selected skill metadata, traces, artifacts, and verification output.

The panel must remain read-only until Nexus explicitly grants an action path.

## Sample fixtures

Fixtures are part of the package boundary because they define repeatable integration expectations.

Required fixture groups:

```text
host request fixture
runtime response fixture
embedded package manifest fixture
storage boundary fixture
permission boundary fixture
```

## Scaffold app shell

The repo scaffold stays as a local harness. Nexus embedding must not break it.

The scaffold may provide:

```text
local smoke tests
controlled runtime demos
adapter trials
fixture previews
build verification
```

## Ownership split

| Area | Owner | Notes |
| --- | --- | --- |
| Runtime contracts | Capability Runtime | Stable exported packet and result shapes |
| Tool grants | Nexus host | Runtime may request, host decides |
| Memory writes | Nexus host | Runtime returns candidates only |
| Artifact roots | Nexus host | Runtime returns refs under allowed roots |
| UI placement | Nexus host | Runtime panel remains mountable/read-only |
| Local scaffold | Capability Runtime | Must remain buildable independently |

## Acceptance gate

```text
embedded package manifest validates
all export groups are present
all required docs are linked
all required scripts are declared
read-only UI rule is explicit
host-owned decisions are not moved into runtime
```
