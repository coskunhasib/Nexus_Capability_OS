# Integration Readiness — Capability OS → Nexus

> **What this is.** The single recipe for integrating the matured Capability OS orchestration layer
> into the main Nexus product. It says what is ready, what Nexus must build, where each package
> plugs in, and which pipeline to pilot first. **Integration itself is owner-gated** — this doc is
> the plan to execute on the day the owner says "başla."
>
> Status: **PRODUCER-READY; CONSUMER DESIGN LOCK COMPLETE; PRODUCT INTEGRATION OWNER-GATED** (updated 2026-06-17).
> Phase 3 read-only audit and Phase 4 consumer-runtime design lock are complete. Product integration has not started.

---

## 1. The producer / consumer split (the one mental model)

| | **Capability OS (here)** | **Nexus (the product)** |
|---|---|---|
| Role | **Producer** — authors pipelines, packages, governance | **Consumer** — the real runtime |
| Output | self-contained `.pipeline` packages + a pull catalog | imports, runs them for real |
| Identity | authors **labels** (`pipeline_id` + `package_version`) | computes the content **fingerprint** (hash) + dedups on import |
| Execution | **mock** runner (proves orchestration + governance) | **real** LLM + sandbox execution |

Consequence: integration does **not** mean shipping the engine workbench into Nexus. It means Nexus
**imports the packages** and implements the **consumer runtime** (import → fingerprint → dedup → run).
The workbench (`engine/`) stays here. See [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md),
[`CONSUMER_RUNTIME_DESIGN_LOCK.md`](./CONSUMER_RUNTIME_DESIGN_LOCK.md),
[`NEXUS_INTEGRATION_PLAN.md`](./NEXUS_INTEGRATION_PLAN.md), [`PIPELINE_PACKAGE_FORMAT.md`](./PIPELINE_PACKAGE_FORMAT.md).

---

## 2. Maturity checklist — is it ready?

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Pipeline set complete + professional-grade | ✅ | 13 catalog pipelines, machine-readable definitions, stage contracts, filled blocking_conditions |
| 2 | Packaging + governance + gate enforcement real | ✅ | `validate_package.py` PASS ×13; `run_pipeline.py` PASS ×13; gates bite on negative skip tests |
| 3 | Cross-pipeline chain proven end-to-end (mock) | ✅ | `run_chain.py`: discovery GO → sdlc handoff PASS |
| 4 | Validator chases content coherence (not just shape) | ✅ | required-evidence coverage + gate-producer coverage (caught 2 real bugs) |
| 5 | Docs non-contradictory | ✅ | catalog stage_counts + definition_doc→YAML + engine README synced |
| 6 | Integration recipe written | ✅ | this document |

**Verdict: the producer side is mature.** Remaining work is all on the **Nexus (consumer)** side and is owner-gated.

---

## 3. Socket map — which package plugs into which Nexus subsystem

Mapped read-only against the Nexus_Project codebase (`~/Documents/Nexus_Project`). This is the
"where does it plug in" guide; it is **not** an instruction to modify Nexus_Project yet. The
Phase 3 socket audit is recorded in [`MAIN_NEXUS_READ_ONLY_AUDIT.md`](./MAIN_NEXUS_READ_ONLY_AUDIT.md).

| Package | Nexus_Project socket | Integration nature |
|---|---|---|
| `sdlc-pipeline` | CODER / cognitive-code subsystem | orchestrates existing code-gen capability under governance |
| `product-discovery-pipeline` | product-intent / intake front-end (**greenfield** — no existing subsystem) | new pre-SDLC capability; feeds sdlc |
| `research-pipeline` | `services/skills/web_research.py`, `web_search.py` | wraps existing research skills in a governed pipeline |
| `activation-pipeline` | `services/feature_activation*.py` (`feature_activation_registry`) | governs the existing staged-activation subsystem |
| `operations-pipeline` | monitoring infra (Grafana / Loki / `trust_monitor.py`) — **process gap** | adds the incident *process* the infra lacks |
| `skill-governance-pipeline` | `services/skill_registry_truth*`, `agent_skill_dispatch`, self-evolution `skill_add` | governs the existing skill lifecycle |
| `knowledge-memory-pipeline` | `services/knowledge_engine*`, `episodic_memory`, `blackboard_service` | governs the existing memory lifecycle |
| `main-product-pipeline` | mission/orchestrator selection layer | packaged orchestration-level journey that delegates to specialist packages |
| `content-pipeline` | knowledge/content authoring surface (**greenfield**) | governs content planning, grounding, review, and completion |
| `data-processing-pipeline` | data/migration/validation paths (**greenfield/process gap**) | governs dataset ingest, transform, validation, and delivery |
| `model-inference-pipeline` | model routing/inference/evaluation surface (**greenfield/process gap**) | governs provider routing, eval, cost/latency, and monitoring |
| `customer-support-pipeline` | support/ops/knowledge handoff surface (**greenfield/process gap**) | governs support triage, escalation, response, and learning |
| `business-strategy-pipeline` | strategy/discovery decision surface (**greenfield**) | governs option framing, evidence, risk/tradeoff, and owner decision |

---

## 4. What Nexus must build (the consumer runtime)

In priority order (detail in [`CONSUMER_CONTRACT.md`](./CONSUMER_CONTRACT.md) §"Consumer obligations"):

1. **Importer** — read a `.pipeline` package (manifest + components + gates + evidence + stages).
2. **Fingerprinter** — hash package content; identity rule: same `pipeline_id`+same fingerprint → share;
   same id+different fingerprint → keep both + warn; new id → install.
3. **Dedup/share** — shared sub-modules (agents, skills) reused across packages **only when fingerprint-identical**.
4. **Runtime** — replace the mock agent loop with real LLM execution + a code-execution sandbox;
   keep the gate→producer enforcement (the governance edge) exactly as the mock enforces it.
5. **Selection** — after the first integration proves package import/run, harden `mission_orchestrator`
   so it knows all main/specialist pipelines and routes matured intent through
   `pipeline_selection_contract.yaml`.

Before product-repo coding, Phase 4 locked the exact consumer-runtime design against the audited
main Nexus sockets: importer, fingerprint storage, dedup/share, dependency resolver, gate/evidence
adapter, runner hook, and sandbox/credential boundaries. The design lock is recorded in
[`CONSUMER_RUNTIME_DESIGN_LOCK.md`](./CONSUMER_RUNTIME_DESIGN_LOCK.md).

---

## 5. First pilot — recommended: `research-pipeline`

Pick the lowest-risk, clearest-socket, demonstrable-value pipeline first.

- **Why research:** clearest socket (`web_research` already exists), **smallest blast radius** (produces a
  cited report — no destructive side effects), and it immediately demonstrates the governance edge
  (citation/evidence gates) that Nexus lacks today.
- **Pilot scope:** import `research-pipeline`, run it on a real query with real LLM, enforce its 13 gates,
  emit real evidence. Success = a governed, gated, evidence-backed research run inside Nexus.
- **Boundary:** [`RESEARCH_PILOT_BOUNDARY.md`](./RESEARCH_PILOT_BOUNDARY.md) freezes the narrow
  owner-gated pilot contract and stop rules before any product-repo integration starts.
- **Readiness evidence:** [`RESEARCH_PILOT_READINESS_REPORT.md`](./RESEARCH_PILOT_READINESS_REPORT.md)
  records the producer-side verification commands, accepted warning, and remaining Nexus-side work.
- **Phase gate:** [`PRE_INTEGRATION_PHASE_PLAN.md`](./PRE_INTEGRATION_PHASE_PLAN.md) must be updated
  after each phase before the next phase starts.
- **Then:** `skill-governance-pipeline` (proves "governance travels in the package" against a *core* NP
  subsystem), then `sdlc-pipeline` (the flagship), then the rest. `product-discovery` lands whenever the
  product wants an idea→GO front door before sdlc.

---

## 6. What stays here vs. what is Nexus's job

- **Stays in Capability OS:** the `engine/` workbench (package/validate/run/chain/select/catalog), the
  authoring of pipelines + packages, the mock runner, this doc set.
- **Becomes Nexus's:** importer, fingerprint, dedup/share, real runtime + sandbox, the marketplace/pull
  surface. We hand over **packages + contracts**, not tooling.

## 7. Open items / honest caveats

- Integration is **owner-gated** and also waits on the other session/repo being quiet (do not touch
  `~/Documents/Nexus_Project` until then).
- Only the `discovery→sdlc` handoff is artifact-wired today; other transitions (sdlc→activation, etc.)
  are not yet chained — wire them when a multi-pipeline flow needs them.
- The mock runner proves orchestration + governance, **not** task quality; real-LLM quality is a
  Nexus-side concern proven during the pilot.
