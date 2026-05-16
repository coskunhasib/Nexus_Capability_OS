# Local HTTP Worker Server

The local HTTP worker is the first out-of-process runtime boundary for Nexus Capability OS.

It exposes the same adapter contract already used by the in-process mock provider:

```text
nexus.runtime_adapter_request
→ /runtime/adapter
→ nexus.runtime_adapter_response
```

## Why this layer exists

The app already has an HTTP provider boundary. Adapter trials prove that boundary with a fake fetch implementation.

The local worker skeleton moves the runtime worker behind a real HTTP server so later roadmap items can add real execution without changing the Capability OS request/response contract.

## Living code path

```text
server/local-http-worker.ts
server/run-local-http-worker.ts
scripts/verify-local-http-worker.ts
```

NPM scripts:

```bash
npm run worker:local
npm run verify:local-worker
```

## Endpoints

### `GET /health`

Returns worker liveness and capability metadata.

Expected shape:

```json
{
  "ok": true,
  "worker_id": "local-http-worker",
  "version": "0.1",
  "status": "healthy",
  "capabilities": [
    "nexus.runtime_adapter_request",
    "nexus.runtime_adapter_response",
    "runtime_bridge_events",
    "artifact_refs"
  ]
}
```

### `POST /runtime/adapter`

Accepts a `nexus.runtime_adapter_request` v0.1 payload.

For this skeleton implementation, the endpoint uses the existing mock runtime adapter helper and returns a valid `nexus.runtime_adapter_response`.

The server overrides `dispatch.target_worker` with the local worker id so returned job metadata proves that the response came from the local worker boundary.

### Unknown routes

Unknown routes return:

```json
{
  "packet_type": "nexus.local_http_worker_error",
  "version": "0.1",
  "code": "NOT_FOUND",
  "message": "Unknown local worker endpoint.",
  "retryable": false
}
```

## Validation boundary

The skeleton accepts only request bodies that look like:

```text
packet_type: nexus.runtime_adapter_request
version: 0.1
request_id: string
handoff_packet: object
dispatch: object
dispatch.mode: dry_run | mock | real
dispatch.target_worker: string
dispatch.callback_url: string
```

Invalid request bodies fail closed with HTTP 400 and:

```text
INVALID_RUNTIME_ADAPTER_REQUEST
```

## Verification coverage

`verify:local-worker` starts the server on an ephemeral port and checks:

```text
/health returns healthy worker metadata
/runtime/adapter returns a valid runtime adapter response
returned job target_worker equals the local worker id
runtime events are emitted
invalid request body returns INVALID_RUNTIME_ADAPTER_REQUEST
unknown endpoint returns NOT_FOUND
```

## Current limitation

This is intentionally still a skeleton. It does not execute arbitrary commands, modify repositories, call OpenHands, call Codex, call Claude Code or run sandboxed tools.

That belongs to later roadmap items:

```text
13/15 — Minimum Real Worker Vertical Slice
14/15 — OpenHands Adapter
15/15 — Codex / Claude Code Adapter
```
