# Research Pilot Readiness Report

Status: producer-side ready for owner-gated Nexus consumer pilot
Date: 2026-06-16
Branch: `nexus`
Scope: Capability OS pre-integration handoff only

## Verdict

The `research-pipeline` handoff is ready from the Capability OS producer side.

This means the package, boundary contract, and local workbench verification are
ready to hand to a Nexus consumer implementation. It does not mean final-product
integration has started, the local `engine/` ships to Nexus, or the Nexus
consumer runtime exists.

## Handoff Artifacts

- Package: `packages/research-pipeline/`
- Boundary: `docs/nexus-ai-orchestration-model/packaging/RESEARCH_PILOT_BOUNDARY.md`
- Consumer obligations: `docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md`
- Reference integration plan: `docs/nexus-ai-orchestration-model/packaging/NEXUS_INTEGRATION_PLAN.md`
- Package format: `docs/nexus-ai-orchestration-model/packaging/PIPELINE_PACKAGE_FORMAT.md`
- Readiness summary: `docs/nexus-ai-orchestration-model/packaging/INTEGRATION_READINESS.md`

## Package Shape

```text
pipeline_id: research_pipeline
package_version: 1.0.0
components: 30
stages: 11
gates: 13 always + 1 conditional
required_evidence: 16
required_trace: 7
```

## Verification Commands

These commands are the producer-side pre-handoff check:

```bash
python3 engine/validate_package.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline
python3 engine/run_pipeline.py packages/research-pipeline --skip research_protocol_design
python3 engine/run_pipeline.py packages/research-pipeline
```

Expected evidence:

- package validation passes;
- normal mock run passes;
- negative run fails because `research_protocol_pre_registered` is not satisfied;
- final normal run passes again so `engine/runs/research_pipeline/latest` is left in a passing state.

Observed result on 2026-06-16:

```text
validate_package.py: PASS
  45 checks ok, 1 warn, 0 fail
  accepted warning: research_completion<-ALL_STAGE_GATE_RESULTS

run_pipeline.py: PASS
  stages: 11/11
  always gates: 13/13 PASS
  conditional gates evaluated: 1
  evidence: 16/16
  trace records: 7

run_pipeline.py --skip research_protocol_design: expected FAIL
  stages: 10/11
  always gates: 12/13 PASS
  failed gate: research_protocol_pre_registered
  reason: producing stage 'research_protocol_design' did not complete

final run_pipeline.py: PASS
  engine/runs/research_pipeline/latest left in passing state
```

Accepted warning:

```text
research_completion<-ALL_STAGE_GATE_RESULTS
```

Reason: `ALL_STAGE_GATE_RESULTS` is a runtime aggregate supplied by the
runner/gate-evaluation layer, not an artifact produced by one research stage.
The Nexus consumer runner must materialize it before `research_completion`.

## Nexus Consumer Work Remaining

Nexus still owns the real consumer runtime:

- import the folder package as read-only input;
- compute local content fingerprints;
- apply id + fingerprint dedup/share;
- resolve bundled dependencies against the Nexus Shared Registry;
- load gates, evidence, and trace before marking the package runnable;
- bind the research package to the real research socket;
- run with real tools/models/sandboxing;
- emit evidence and trace through Nexus observability.

## Stop Conditions

Do not proceed to product integration if:

- owner approval for product-repo integration is absent;
- import would require mutating the package in place;
- a required dependency, gate, evidence schema, or trace schema is missing;
- Nexus cannot compute stable fingerprints;
- evidence or trace cannot be emitted;
- tool execution would expose raw secrets to an agent;
- the change expands beyond the consumer runtime slice.
