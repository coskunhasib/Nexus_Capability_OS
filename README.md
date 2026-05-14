# Nexus Capability OS

Nexus Capability OS is a trial-ready control layer for turning a user intent into a structured AI execution package.

It does **not** replace Nexus, OpenHands, Claude Code, Codex, n8n, or a local agent runtime. It prepares and governs the work those systems should run.

```text
Intent
→ Capability Pack
→ Execution Plan
→ Task Packet
→ Nexus Handoff Packet
→ Runtime Bridge Events
→ Runner / Gate Evidence
→ Review Report
→ Memory + Context Update Packets
```

## What this is for

Use this when you want to avoid giving raw, ambiguous work directly to an AI agent.

Instead, the system standardizes:

```text
what should be done
which AI profiles are needed
which pipeline should run
which quality gates must pass
what evidence must be collected
what should be remembered
what should be carried into the next context
```

## Trial MVP navigation

The UI is intentionally grouped into four top-level areas.

```text
Explore
  → visual registry / capability map

Studio
  → Intent Compiler
  → Capability Packs
  → Pack Builder

Runner
  → Task Packet runner mock
  → step status
  → gate evidence
  → review report
  → memory/context packet export

Governance
  → registry health
  → packet schema health
  → inspector
```

## Run locally

```bash
npm install
npm run dev
```

Build and validation:

```bash
npm run audit:registry
npm run validate:packets
npm run build
```

`npm run dev` and `npm run build` automatically run registry audit, packet validation, and tree sync first.

## First trial flow

Use this exact flow to test whether the product is useful.

### 1. Start in Studio

Open `Studio`.

Try one of these intents:

```text
Build a web SaaS MVP with React frontend, backend API, database, tests and release gates.
```

```text
Design STM32 HVAC fan driver firmware for 220V control with safety, timing and bench evidence.
```

```text
Create an agentic system with tools, MCP, memory, context, evals and guardrails.
```

Expected result:

```text
Compiler match
→ execution brief
→ selected profiles
→ selected micro-pipelines
→ selected gates
→ generated execution plan
```

### 2. Send the generated plan to Runner

In the generated execution plan panel, click:

```text
Send Runner
```

Expected result:

```text
Runner opens automatically
Task Packet is loaded
work_order steps appear
required gates appear under each step
```

### 3. Simulate execution

In Runner:

```text
Set one step to done
Set one gate to pass and add evidence note
Set one gate to fail and add blocker reason
```

Expected result:

```text
failed gate marks the step blocked
progress updates
Gate Evidence updates
Execution Review Report updates live
```

### 4. Export outputs

Export these files from the UI:

```text
nexus-task-packet-runner-state.json
nexus-execution-review-report.json
memory_update_packet.json
context_update_packet.json
```

These are the handoff artifacts for Nexus/runtime integration.

## Nexus integration concept

Nexus should treat this product as a planning/governance sidecar.

Suggested integration boundary:

```text
Nexus receives user/project intent
→ calls Capability OS compiler
→ receives nexus.handoff_packet or nexus.task_packet
→ dispatches task packet to real workers/tools
→ sends runtime bridge events back
→ receives review + memory/context packets
```

Minimum contract between Nexus and Capability OS:

```text
Input:
  raw intent
  optional project constraints
  optional preferred capability pack

Output:
  nexus.handoff_packet
  nexus.task_packet
  required gates
  memory/context policy
  callback contract
```

Runtime feedback contract:

```text
Input from Nexus/runtime:
  runtime bridge event
  step status
  gate evidence
  blocker reason
  artifact refs

Output from Capability OS:
  review report
  release readiness
  memory update packet
  context update packet
```

## Packet contracts

Schemas live in:

```text
schemas/
  execution-plan.schema.json
  task-packet.schema.json
  runner-state.schema.json
  review-report.schema.json
  memory-update-packet.schema.json
  context-update-packet.schema.json
  nexus-handoff-packet.schema.json
  runtime-bridge.schema.json
  trial-scenario.schema.json
```

Sample packets live in:

```text
samples/packets/
```

Trial scenarios live in:

```text
samples/trials/
  web-saas-mvp.trial.json
  stm32-firmware.trial.json
  agentic-system.trial.json
  rfq-generation.trial.json
  technical-report.trial.json
```

Validate packets and trials with:

```bash
npm run validate:packets
```

## Trial scenario library

The trial library is the product's test bench. Each scenario defines:

```text
input intent
expected capability pack
expected macro pipeline
expected profiles
expected micro-pipelines
expected gates
expected packet outputs
acceptance criteria
Nexus integration notes
```

Use trial scenarios to check whether the compiler, pack registry and runner outputs are actually useful before adding more UI.

## Feature intake policy

Feature development is not frozen, but it is gated.

```text
A — Trial-ready features
  Must make the product easier to test or validate.

B — Nexus integration features
  Must make Nexus handoff, runtime callbacks or memory/context feedback clearer.

C — Labs/backlog features
  Useful later, but isolated until trials prove the need.
```

Backlog manifest:

```text
labs/feature-backlog.json
```

Current rule:

```text
Build A and B directly.
Track C in Labs until validated by trial usage.
```

## Registry

Canonical registry files live in:

```text
registry/
```

Important files:

```text
registry/agent-profiles.json
registry/agent-profiles-extra.json
registry/macro-pipelines.json
registry/micro-pipelines.json
registry/micro-pipelines-extra.json
registry/gates.json
registry/compiler-rules.json
registry/example-capability-packs.json
registry/capability-packs-extra.json
```

## MVP success criteria

This MVP is useful if, after 5-10 trial intents, it can consistently answer:

```text
Which capability pack should run?
Which AI profiles are needed?
Which micro-pipelines are needed?
Which gates must pass?
What task packet should Nexus/runtime receive?
What runtime bridge callbacks are expected?
What evidence is missing?
Is the result release-ready?
What should be remembered?
What should be carried into the next context?
```

## Current limitation

Runner is still a mock. It does not call real agents or tools yet.

The next product step is not more standalone UI. It is a real runtime bridge:

```text
nexus.handoff_packet / nexus.task_packet
→ Nexus / OpenHands / Claude Code / Codex / n8n worker
→ runtime bridge events
→ gate evidence + artifact refs
→ review + memory/context packets
```
