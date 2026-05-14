# Nexus Capability OS

Temporary UI and information architecture prototype for Nexus Capability OS.

`src/data.ts` is a visual tree projection. The canonical model lives in `docs/` and `registry/`.

## Core idea

```text
Intent -> Team Profile -> Pipeline -> Capability Pack -> Gates -> Memory/Context Contract
```

## Docs

```text
docs/01-CANONICAL-MODEL.md
docs/02-PIPELINE-TAXONOMY.md
docs/03-PROFILE-TAXONOMY.md
docs/04-TEAM-COMPILER-RULES.md
docs/05-CAPABILITY-PACK-SPEC.md
docs/06-GATE-SPEC.md
docs/07-MEMORY-CONTEXT-CONTRACT.md
```

## Registry

```text
registry/README.md
registry/schema.json
registry/core-entities.json
registry/relationship-types.json
registry/agent-profiles.json
registry/macro-pipelines.json
registry/micro-pipelines.json
registry/gates.json
registry/compiler-rules.json
registry/example-capability-packs.json
```

## Run

```bash
npm install
npm run dev
```
