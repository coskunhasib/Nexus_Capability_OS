# Nexus Capability OS

Bu repo, Nexus Capability OS icin gecici arayuz ve bilgi mimarisi prototipidir.

Amac final urun kodunu burada tutmak degil; capability compiler, macro/micro pipeline, profile family, quality gate, memory/context ve capability pack kurgusunu gorunur hale getirmektir.

## Mimari karar

`src/data.ts` mevcut arayuzun gorsel agac verisidir. Bu dosya canonical source degildir.

Asil urun modeli su katmanda tanimlanir:

```text
docs/      Tasarim sozlesmeleri
registry/  Normalize canonical model
src/       Gecici UI projection
```

## Merkez kavram

```text
Intent -> Team Profile -> Pipeline -> Capability Pack -> Gates -> Memory/Context Contract
```

## Tasarim katmani

```text
docs/01-CANONICAL-MODEL.md
docs/02-PIPELINE-TAXONOMY.md
docs/03-PROFILE-TAXONOMY.md
docs/04-TEAM-COMPILER-RULES.md
docs/05-CAPABILITY-PACK-SPEC.md
docs/06-GATE-SPEC.md
docs/07-MEMORY-CONTEXT-CONTRACT.md
registry/README.md
registry/schema.json
registry/core-entities.json
registry/relationship-types.json
registry/example-capability-packs.json
```

## Calistirma

```bash
npm install
npm run dev
```
