# Nexus Unknown Mode

Use this repository as if the real Nexus data model is unknown.

## Principle

```text
Discovery first.
Contract second.
Implementation third.
```

## Current next item

```text
33. Nexus data contract discovery
```

## Expected output

```text
docs/nexus-data-contract-inventory.md
```

## Discovery scope

Inventory the current repository surfaces:

```text
TaskPacket
RuntimeAdapterRequest
RuntimeAdapterResponse
RuntimeBridgeEvent
RuntimeArtifactRegistry
HardenedReviewReport
MemoryUpdatePacket
ContextUpdatePacket
ControlledWorkerManifest
schemas/
samples/
UI exports
worker outputs
```

## Field classification

Use these labels:

```text
canonical
adapter-derived
runtime-derived
ui-only
temporary
unknown
```

## Roadmap order

```text
33. Nexus data contract discovery
34. Nexus canonical result envelope
35. Nexus result ingestion prototype
36. Shared result guard and fixtures
37. Code Agent / custom agent mapping
38. First runtime wiring decision PR
```
