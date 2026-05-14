# Nexus Capability OS

Nexus Capability OS is a trial-ready control layer for turning a user intent into a structured AI execution package.

It does **not** replace Nexus, OpenHands, Claude Code, Codex, n8n, or a local agent runtime. It prepares and governs the work those systems should run.

```text
Intent
→ Capability Pack
→ Execution Plan
→ Task Packet
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
→ receives task packet
→ dispatches task packet to real workers/tools
→ sends execution state/evidence back
→ receives review + memory/context packets
```

Minimum contract between Nexus and Capability OS:

```text
Input:
  raw intent
  optional project constraints
  optional preferred capability pack

Output:
  nexus.task_packet
  required gates
  memory/context policy
```

Runtime feedback contract:

```text
Input from Nexus/runtime:
  step status
  gate evidence
  blocker reason
  generated artifacts

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
```

Sample packets live in:

```text
samples/packets/
```

Validate them with:

```bash
npm run validate:packets
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
What evidence is missing?
Is the result release-ready?
What should be remembered?
What should be carried into the next context?
```

## Current limitation

Runner is still a mock. It does not call real agents or tools yet.

The next product step is not more UI. It is a real runtime bridge:

```text
nexus.task_packet
→ Nexus / OpenHands / Claude Code / Codex / n8n worker
→ execution state + gate evidence
→ review + memory/context packets
```
