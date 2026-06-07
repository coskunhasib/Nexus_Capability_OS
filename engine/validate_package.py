#!/usr/bin/env python3
"""
validate_package.py — Nexus AI Orchestration Model :: .pipeline package validator (workbench tool).

Checks a package conforms to PIPELINE_PACKAGE_FORMAT.md:
 - manifest present + required keys
 - pipeline_def present + parses + has the pipeline_contract_standard required fields
 - every bundled component path exists + parses
 - gates present (incl. the 19 always-required D-016 gates) + consistent with the def
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
