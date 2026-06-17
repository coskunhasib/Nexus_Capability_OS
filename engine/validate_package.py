#!/usr/bin/env python3
"""
validate_package.py — Nexus AI Orchestration Model :: .pipeline package validator (workbench tool).

Checks a package conforms to PIPELINE_PACKAGE_FORMAT.md:
 - manifest present + required keys
 - pipeline_def present + parses + has the pipeline_contract_standard required fields
 - every bundled component path exists + parses
 - package-declared gates present + consistent with the def
   (D-016's 19-gate set is asserted only for sdlc_pipeline)
 - evidence/trace present
 - every listed stage has a bundled contract

Usage:
  python3 engine/validate_package.py packages/sdlc-pipeline
Exit code 0 = PASS, 1 = FAIL.
"""
from __future__ import annotations
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
CFG = os.path.join(REPO, "configs", "nexus-ai")

sys.path.insert(0, HERE)
from package_pipeline import load_yaml, stage_key  # reuse helpers

MANIFEST_REQUIRED = ["package_schema_version", "pipeline_id", "name", "package_version",
                     "pipeline_def", "components", "gates", "evidence", "stages"]

KNOWN_EXTERNAL_INPUTS = {
    # Entry artifacts supplied by the mission owner, host runtime, or upstream
    # product repo rather than a stage inside the same package.
    "SKILL_PACKAGES",
    "DELETION_REQUEST",
    "RUNBOOK",
    "ROLLBACK_PLAN",
    "REWORK_HISTORY",
    # Aggregate materialized by the runner from upstream stage gate outcomes.
    "ALL_STAGE_GATE_RESULTS",
}

D016_ALWAYS = [
    "requirements_complete", "nfr_coverage_complete", "architecture_complete", "adr_coverage_complete",
    "security_privacy_design_complete", "risk_register_reviewed", "implementation_scope_clean",
    "code_review_pass", "tests_pass", "verification_loop_bug_finding_pass", "security_validation_pass",
    "supply_chain_pass", "license_pass", "sbom_present", "performance_resilience_pass_or_accepted",
    "agentic_safety_eval_pass", "operations_readiness_pass", "evidence_graph_complete",
    "no_blocking_policy_failure",
]


def contract_required_fields():
    """pipeline_definition_required_fields from pipeline_contract_standard.yaml (best-effort)."""
    p = os.path.join(CFG, "pipeline_contract_standard.yaml")
    if not os.path.exists(p):
        return []
    doc = load_yaml(p) or {}
    v = doc.get("pipeline_definition_required_fields")
    out = []
    if isinstance(v, list):
        for e in v:
            if isinstance(e, str):
                out.append(e)
            elif isinstance(e, dict):
                out.append(e.get("field") or e.get("name") or next(iter(e.values()), None))
    return [x for x in out if isinstance(x, str)]


def main():
    if len(sys.argv) < 2:
        print("usage: validate_package.py <package_dir>")
        return 2
    pkg = os.path.abspath(sys.argv[1])
    errors, warnings, n_ok = [], [], 0

    def ok(_msg):
        nonlocal n_ok
        n_ok += 1

    def err(msg):
        errors.append(msg)

    def warn(msg):
        warnings.append(msg)

    mpath = os.path.join(pkg, "pipeline.package.yaml")
    if not os.path.exists(mpath):
        print(f"[validator] FAIL: no manifest at {mpath}")
        return 1
    man = load_yaml(mpath) or {}

    for k in MANIFEST_REQUIRED:
        ok(k) if k in man else err(f"manifest missing '{k}'")

    # pipeline definition
    pdef_rel = man.get("pipeline_def", "pipeline.yaml")
    pdef_path = os.path.join(pkg, pdef_rel)
    pdef = None
    if not os.path.exists(pdef_path):
        err(f"pipeline_def '{pdef_rel}' not found")
    else:
        try:
            pdef = load_yaml(pdef_path)
            ok("pipeline_def parses")
        except Exception as e:
            err(f"pipeline_def parse error: {e}")
    if pdef:
        for f in contract_required_fields():
            ok(f) if f in pdef else warn(f"pipeline_def missing contract field '{f}'")

    # components
    comps = man.get("components", []) or []
    if not comps:
        warn("no components in manifest")
    missing_files = 0
    for c in comps:
        cp = os.path.join(pkg, c.get("path", ""))
        if not c.get("path") or not os.path.exists(cp):
            err(f"component file missing: {c.get('kind')}:{c.get('id')} -> {c.get('path')}")
            missing_files += 1
        else:
            try:
                load_yaml(cp)
            except Exception as e:
                err(f"component parse error {c.get('id')}: {e}")
    if comps and missing_files == 0:
        ok(f"all {len(comps)} component files present")

    # gates
    gpath = os.path.join(pkg, "gates", "required_gates.yaml")
    if not os.path.exists(gpath):
        err("gates/required_gates.yaml missing")
    else:
        g = (load_yaml(gpath) or {}).get("required_gates", {}) or {}
        always = g.get("always", []) or []
        if not always:
            err("required_gates.always is empty")
        else:
            ok(f"{len(always)} always-required gates")
        # D-016 is the canonical SDLC always-required set — assert it ONLY for sdlc_pipeline.
        # Other pipelines carry their own domain-specific always gates.
        if man.get("pipeline_id") == "sdlc_pipeline":
            missing_gates = [x for x in D016_ALWAYS if x not in always]
            if missing_gates:
                err(f"missing D-016 always gates: {missing_gates}")
            else:
                ok("all 19 D-016 always-required gates present")
        man_always = sorted(x["id"] for x in man.get("gates", []) if x.get("set") == "always")
        if set(man_always) != set(always):
            warn("manifest gates(always) != required_gates.always")

    # evidence + trace
    epath = os.path.join(pkg, "evidence", "required_evidence.yaml")
    if not os.path.exists(epath):
        err("evidence/required_evidence.yaml missing")
    else:
        ev = load_yaml(epath) or {}
        ok("evidence present") if ev.get("required_evidence") else warn("required_evidence empty")
        if not ev.get("required_trace"):
            warn("required_trace empty")

    # stages
    stage_ids = man.get("stages", []) or []
    sdir = os.path.join(pkg, "stages")
    have = {}
    if os.path.isdir(sdir):
        for fn in os.listdir(sdir):
            if fn.lower().endswith((".yaml", ".yml")):
                have[stage_key(fn)] = fn
    miss_stage = [s for s in stage_ids if str(s).lower() not in have]
    if miss_stage:
        err(f"{len(miss_stage)} stages have no bundled contract: {miss_stage}")
    elif stage_ids:
        ok(f"all {len(stage_ids)} stages have bundled contracts")

    # --- hardening checks (step 3) ---
    import re
    SEMVER = re.compile(r"^\d+\.\d+\.\d+([-+].+)?$")
    SUPPORTED_SCHEMA = {"0.1"}
    sv = str(man.get("package_schema_version", ""))
    ok("schema_version") if sv in SUPPORTED_SCHEMA else err(
        f"unsupported package_schema_version '{sv}' (supported: {sorted(SUPPORTED_SCHEMA)})")
    pv = str(man.get("package_version", ""))
    ok("package_version semver") if SEMVER.match(pv) else err(f"package_version '{pv}' not semver")
    bad_ver = [f"{c.get('kind')}:{c.get('id')}={c.get('version')}"
               for c in comps if not SEMVER.match(str(c.get("version", "")))]
    if bad_ver:
        warn(f"{len(bad_ver)} components have non-semver versions: {bad_ver[:5]}")
    elif comps:
        ok("component versions semver")
    seen = {}
    for c in comps:
        seen[(c.get("kind"), c.get("id"))] = seen.get((c.get("kind"), c.get("id")), 0) + 1
    dups = [f"{k[0]}:{k[1]}" for k, n in seen.items() if n > 1]
    if dups:
        err(f"duplicate component ids: {dups}")
    elif comps:
        ok("no duplicate component ids")
    # self-containment: every uses_* / team ref in the def must be bundled (by id or alias)
    if pdef:
        comp_ids = set()
        for c in comps:
            comp_ids.add(str(c.get("id")).lower())
            if c.get("requested_as"):
                comp_ids.add(str(c.get("requested_as")).lower())
        USES = ["uses_core_abilities", "uses_skills", "uses_tools", "uses_governance_profiles",
                "uses_audit_schemas", "uses_model_provider_profiles", "uses_context_memory_profiles"]
        refs = [str(v) for f in USES for v in (pdef.get(f) or [])]
        refs += [str(pdef[f]) for f in ("required_team_type", "required_team_lead_role") if pdef.get(f)]
        dangling = [r for r in refs if r.lower() not in comp_ids]
        if dangling:
            err(f"{len(dangling)} declared deps not bundled (dangling): {dangling[:8]}")
        elif refs:
            ok(f"all {len(refs)} declared deps bundled (self-contained)")

    # --- coherence checks (step 4): artifact chain + gate producers ---
    stage_docs = {}
    if os.path.isdir(sdir):
        for fn in sorted(os.listdir(sdir)):
            if fn.lower().endswith((".yaml", ".yml")):
                sc = load_yaml(os.path.join(sdir, fn)) or {}
                stage_docs[sc.get("stage_id") or stage_key(fn)] = sc
    if stage_docs:
        produced_out, produced_ev = set(), set()
        for sc in stage_docs.values():
            for o in (sc.get("outputs") or []):
                produced_out.add(o)
            for e2 in (sc.get("evidence") or []):
                produced_ev.add(e2)
        producible = produced_out | produced_ev
        # (a) required_evidence coverage (ERROR, precise): every required_evidence artifact must be
        #     produced by some stage; otherwise the runner silently attributes it to "pipeline" + stubs it.
        req_ev = (pdef or {}).get("required_evidence", []) or []
        ev_gap = [a for a in req_ev if a not in producible]
        if ev_gap:
            err(f"{len(ev_gap)} required_evidence artifact(s) produced by no stage: {ev_gap[:8]}")
        elif req_ev:
            ok(f"all {len(req_ev)} required_evidence artifacts produced by a stage")
        # (b) unbroken chain (WARNING, heuristic): inputs not produced by any stage and not a
        #     first-stage entry artifact are likely legitimate externals (RUNBOOK, DELETION_REQUEST,
        #     ALL_STAGE_GATE_RESULTS, ...) — surface them to confirm intent, do not fail the build.
        ordered = [s for s in stage_ids if s in stage_docs] or list(stage_docs)
        entry_artifacts = set(stage_docs.get(ordered[0], {}).get("inputs") or [])
        stranded = []
        for sid, sc in stage_docs.items():
            for inp in (sc.get("inputs") or []):
                if inp not in produced_out and inp not in entry_artifacts and inp not in KNOWN_EXTERNAL_INPUTS:
                    stranded.append(f"{sid}<-{inp}")
        if stranded:
            warn(f"{len(stranded)} stage input(s) not produced by any stage (confirm external/entry): {stranded[:8]}")
        else:
            ok("artifact chain unbroken (every stage input produced upstream or an entry artifact)")
        # (c) gate producer coverage (ERROR): a required gate with NO producing stage would silently mock-pass at runtime
        stage_gate_union = set()
        for sc in stage_docs.values():
            for gg in (sc.get("gates") or []):
                stage_gate_union.add(gg if isinstance(gg, str) else (gg.get("id") or gg.get("gate")))
        prod_map = {}
        rr = os.path.join(CFG, f"{man.get('pipeline_id')}_runtime_rules.yaml")
        if os.path.exists(rr):
            for e in (((load_yaml(rr) or {}).get("required_gate_producers") or {}).get("gates") or []):
                if isinstance(e, dict) and e.get("gate"):
                    prod_map[e["gate"]] = e.get("producing_stage")
        req_g = (load_yaml(gpath) or {}).get("required_gates", {}) if os.path.exists(gpath) else {}
        req_all = (req_g.get("always") or []) + (req_g.get("conditional") or [])
        no_producer = [g for g in req_all if g not in stage_gate_union
                       and prod_map.get(g) not in stage_docs
                       and prod_map.get(g) not in ("pipeline", "policy")]
        if no_producer:
            err(f"{len(no_producer)} required gate(s) have no producing stage (would silently mock-pass): {no_producer}")
        elif req_all:
            ok(f"all {len(req_all)} required gates have a producing stage")

    # report
    print(f"[validator] package: {os.path.relpath(pkg, REPO)}")
    print(f"[validator] {n_ok} checks ok, {len(warnings)} warn, {len(errors)} fail")
    for w in warnings:
        print(f"  ⚠ {w}")
    for e in errors:
        print(f"  ✗ {e}")
    verdict = "PASS" if not errors else "FAIL"
    print(f"[validator] VERDICT: {verdict}")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
