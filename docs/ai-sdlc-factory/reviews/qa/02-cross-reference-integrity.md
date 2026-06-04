# QA-02 — Cross-Reference Integrity (Final Adversarial QA)

Scope: corpus-wide re-verification of cross-reference integrity for the seven shared-registry
reference families, pre-commit. The reconciliation sweep claimed `dangling = 0`; this pass
re-confirms it independently AFTER the later edits, and adversarially hunts for ambiguity,
broken back-references, lifecycle dangling, and family-mismatch defects. Read-only investigation.
No corpus files modified; no git run.

Reference families verified (task mandate):
`uses_core_abilities` · `uses_skills` · `uses_tools` · `uses_governance_profiles` ·
`uses_audit_schemas` · `uses_model_provider_profiles` · `uses_context_memory_profiles`

Authoritative registries (id + `aliases` + recorded-alias reconciliation blocks parsed via PyYAML):
- `configs/nexus-ai/core_abilities.yaml` (8 abilities + `name_form_convention.id_to_display`)
- `configs/nexus-ai/skills_registry.yaml` (`skills:`)
- `configs/nexus-ai/tools_registry.yaml` (`tools:` + `registry_self_check.aliases_recorded`)
- `configs/nexus-ai/governance_profiles.yaml` (`governance_profiles:` scope groups + `governance_alias_reconciliation`)
- `configs/nexus-ai/audit_schemas.yaml` (`audit_schemas:` + `audit_schema_aliases` + `governance_profile_aliases`)
- `configs/nexus-ai/model_provider_profiles.yaml` (`profiles:` + `reconciliation`)
- `configs/nexus-ai/context_memory_profiles.yaml` (`profiles:`)

Consumers scanned (all `uses_*` edges, every list element, comments stripped):
31 SDLC stage contracts · `agent_roles.yaml` · `sub_agent_roles.yaml` · `team_lead_roles.yaml` ·
`team_templates.yaml` · `sdlc_pipeline.yaml` · `pipeline_catalog.yaml` ·
`sdlc_pipeline_runtime_rules.yaml` · `governance/**/*.yaml`.

Verdict: **No DEFECTs.** Cross-reference integrity holds in BOTH directions after the recent edits.
**2,578** `uses_*` references resolve (forward) and **0** registry back-references dangle (reverse).
5 findings total, all **MINOR / note** (documented, status-gated, or cosmetic). Detail below.

---

## A. What was verified CLEAN (the core mandate)

1. **Forward resolution — `uses_*` → registry — PASS (0 dangling / 2,578 refs).**
   Every id in all seven `uses_*` families across every consumer resolves to a first-class
   registry item OR a recorded alias of the correct family. Method: build the canonical+alias
   id-set per registry from the YAML (not regex), then set-difference every referenced id.
   Result: **0 dangling**. This independently re-confirms the sweep's `dangling = 0` claim and
   shows it still holds after the later edits to audit_schemas / governance_profiles / tools_registry /
   core_abilities / agent_roles / pipeline_catalog / runtime_rules / model_provider_profiles.

2. **Alias reliance is minimal and every alias resolves to a present canonical — PASS.**
   Under a STRICT model (first-class ids vs alias→canonical maps kept separate), only **8** of the
   2,578 references resolve via an alias rather than a first-class id, and **all 8** point to an
   existing first-class canonical of the same family:
   - 6 Core-Ability display names → lowercase id: `Supervisor→supervisor`, `Coder→coder`,
     `Vision→vision`, `Memory→memory`, `Web→web`, `OS→os` (name-form alias only; locked decision upheld —
     no Core Ability is made an Agent/Tool).
   - `evidence_required_policy → evidence_required` and `no_self_approval_policy → no_self_approval`
     (the `_policy` naming variants; canonical present in `governance_profiles.yaml`).
   - **0** aliases whose canonical target is missing. The bulk of references resolve directly to
     first-class ids (no alias indirection), so the corpus is not fragile to the alias layer.

3. **Reverse resolution — registry `used_by` / `used_by_pipelines` → real consumers — PASS (0 dangling).**
   351 `used_by` + 2 `used_by_pipelines` entries scanned across all seven registries. After modeling
   the qualified-stage syntax used by `context_memory_profiles.yaml` (`stage:<name>` and
   `stage:<name>@<pipeline>`) and including non-SDLC pipeline stage names, **0** back-reference targets
   fail to resolve. Specifically:
   - All `stage:<name>@<pipeline>` targets (research 7, operations 6, activation 5,
     skill_governance 5, knowledge_memory 6) were individually confirmed to exist as real stages
     in the matching `docs/ai-sdlc-factory/pipeline-catalog/*.md` definition doc — **0 missing**.
   - All bare non-SDLC stage names in governance-profile `used_by`
     (e.g. `incident_intake`, `synthesis`, `validity_window_assignment`, `public_activation_decision`,
     `skill_deprecation_update`) were individually confirmed present in their pipeline doc.
   - `referenced_in` path lists (16 entries) all point to files that exist on disk — **0 broken paths**.

4. **Intra-registry edges resolve — PASS (0 dangling).**
   Every `audit_schemas:` and `governance_profiles:` edge embedded ON a registry item (e.g. a
   governance profile pointing at `stage_gate_trace_schema`; a tool pointing at its governance
   profiles) resolves to a first-class item or recorded alias. **0 unresolved.**

5. **Declared reference manifests resolve — PASS.**
   `tools_registry.referenced_governance_profiles` (5) + `referenced_audit_schemas` (2) and
   `core_abilities.referenced_candidates` (model_provider_profiles 6 / governance_profiles 9 /
   audit_schemas 2) all resolve to existing registry items — **0 unresolved**.

6. **No lifecycle-dangling — PASS.**
   No registry item carries `status: deprecated`, and **0** consumers reference a deprecated item.

7. **No family-mismatch alias — PASS (Evidence ≠ Trace, Governance ≠ Audit upheld).**
   Every `audit_schema_aliases` entry declares a `family` (evidence|trace) and a `canonical_id`;
   each canonical's `type` matches its declared family (no evidence-alias→trace-id or vice-versa).
   No governance alias resolves into the audit family or vice-versa.

8. **No duplicate first-class ids within any registry — PASS.** (Would have silently shadowed.)

---

## B. Findings (all MINOR / note — none blocking)

### F-1 (note, tracked) — Three live NAME COLLISIONS: a string that is BOTH a first-class id AND an alias of a different canonical
- **Where:**
  - `model_provider_profiles.yaml`: `operations_analysis_model` is a first-class candidate item
    (line ~749, operations pipeline) AND a recorded alias of `release_reasoning_model` (line ~397,
    SDLC 26/27 reconciliation). Same pattern: `learning_reflection_model` is a first-class candidate
    item (line ~853, operations) AND an alias of `sdlc_reasoning_profile` (line ~137, SDLC 31).
  - `context_memory_profiles.yaml`: `learning_context_pack` is a first-class candidate item
    (line ~1137, operations_reliability) AND an alias of `release_context_pack` (line ~546, SDLC 31).
- **Why it is NOT a defect (does not break resolution):**
  - First-class id deterministically wins over an alias, so each name resolves unambiguously in
    practice to its first-class operations item.
  - The two "directions" never conflict in live data: every CONSUMER that references these literal
    names is an **operations-pipeline** team/agent intending the first-class operations item
    (`agent_roles.yaml` ~2303/2348/2395/2441/2481; `team_templates.yaml` ~616/618/624;
    `team_lead_roles.yaml` ~454). The SDLC side never binds the colliding name as a value — SDLC
    stages 26/27/31 explicitly reconciled to the canonical (`release_reasoning_model` /
    `sdlc_reasoning_profile` / `release_context_pack`) and only mention the legacy name in comments.
    Verified: `grep` for these names as a list value under `stages/` returns nothing.
  - All three are explicitly recorded as known design debt with a remediation plan, and the
    colliding items are `status: candidate` (not yet ratified):
    `model_provider_profiles.yaml → reconciliation.name_collisions_requiring_phase_e_decision`
    (each with an `issue:` to "rename or formally split before ratification") and the per-item
    `overlap.recommendation` blocks; `context_memory_profiles.yaml → open_questions`
    (rename operations item to `operations_learning_context_pack` in Phase E).
- **Recommendation:** No pre-commit action required. Resolve in Phase E by renaming the operations
  candidate items to disambiguated ids (e.g. `operations_learning_model`,
  `operations_learning_context_pack`) so the literal name is no longer shared. Tracking already exists.

### F-2 (MINOR, cosmetic) — Self-referential alias on `no_policy_bypass`
- **Where:** `governance_profiles.yaml` line ~186/217 — the profile `id: no_policy_bypass` lists
  `no_policy_bypass` (its own id) in its own `aliases:`.
- **Why MINOR:** Harmless for resolution (alias == id == same item). The comment documents the
  doc-06 §3 source token `no_policy_bypass`, which happens to equal the canonical id.
- **Recommendation:** Optionally drop the redundant self-alias for tidiness. Non-blocking.

### F-3 (note) — Same-literal-name across three namespaces for `cost_resource_governance`
- **Where:** `governance_profiles.yaml` line ~2270/2292/2296 — the governance profile
  `cost_resource_governance` lists `cost_resource_governance` in its `used_by`.
- **Why NOT a defect:** `used_by` lists CONSUMERS. The entry is the SDLC **stage** `cost_resource_governance`
  (stage 25), which consumes the profile of the same name — a distinct namespace (stage vs profile vs
  pipeline-level binding). The file itself documents this tri-name overlap inline (line ~2296). It is
  not a profile-references-itself error.
- **Recommendation:** None required; the overlap is intentional and documented. Non-blocking.

### F-4 (note) — Alias `_policy` variants leak into the skills id-set (parser observation, not a corpus issue)
- **Where:** `skills_registry.yaml → governance_alias_reconciliation` records
  `no_self_approval_policy` / `evidence_required_policy` (governance-profile aliases) inside the
  skills file for cross-file discoverability.
- **Why note-only:** These are correctly GOVERNANCE names, used by skills' governance bindings, not
  skills. No `uses_skills` reference points at them; they do not create a phantom skill. The locked
  `Skill != Tool` / `Governance != Audit` separation is intact.
- **Recommendation:** None. Documented cross-file mirroring.

### F-5 (note) — Resolution depends on "first-class wins" precedence (no enforcement in configs)
- **Observation:** Because of the F-1 collisions, a future automated resolver MUST implement
  "first-class id takes precedence over alias" for the three colliding names to resolve to the
  intended operations items. The configs do not (and cannot, at this layer) encode resolver
  precedence; it is an implicit contract.
- **Why note-only:** Today all references are consistent with first-class precedence AND with the
  documented intent, so there is no current ambiguity in outcome. This is a forward-looking caveat
  for the runtime resolver, not a corpus defect.
- **Recommendation:** Capture "first-class id beats alias" as an explicit resolver rule when the
  runtime is built (or remove the collisions per F-1, which makes the rule moot).

---

## C. Method note (reproducibility)

All checks were performed by parsing each YAML with PyYAML and computing set differences /
membership, not by eyeballing samples — so the forward (2,578 refs) and reverse (353 back-refs)
sweeps are exhaustive over the seven families, not a representative subset. Qualified-stage and
non-SDLC-stage targets were cross-checked against the five pipeline definition docs under
`docs/ai-sdlc-factory/pipeline-catalog/`. The only non-mechanical judgement calls are the five
findings above, each classified with its locked-decision and resolution-impact rationale.

---

## D. Bottom line

Cross-reference integrity is **CLEAN for commit**. Dangling = 0 (forward) and 0 (reverse) both
re-confirmed post-edit; no broken `used_by`; no locked-decision violation; no Evidence/Trace or
Governance/Audit family crossover. The three name collisions (F-1) are real but **documented,
status-gated `candidate`, deterministically resolvable, and Phase-E-deferred** — technical debt to
disambiguate later, not a blocker now.
