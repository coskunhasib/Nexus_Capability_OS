# Runtime Event Store

The runtime event store keeps runtime events outside the initial adapter response.

It supports:

```text
append adapter response events
append callback events
track repeated events separately
summarize stored events
build an ordered timeline
replay stored events into Runner state
```

Verification:

```bash
npm run verify:event-store
```
