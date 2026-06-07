#!/usr/bin/env python3
"""
run_trials.py — Nexus AI Orchestration Model :: trial / acceptance-scenario runner (T2).

Each trial fixture (engine/trials/*.trial.yaml) pins an intent to the EXPECTED outcome:
the selected pipeline (via the T1 selector) and, for a packaged pipeline, the package shape
(gates/stages). This regression-tests the selection + packaging layer.

Usage:
  python3 engine/run_trials.py
Exit 0 = all trials pass, 1 = at least one failed.
"""
from __future__ import annotations
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from package_pipeline import load_yaml      # reuse
from select_pipeline import select          # T1 selector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
TRIALS_DIR = os.path.join(HERE, "trials")


def check_trial(t):
    intent = t.get("intent", "")
    sig = t.get("signals", {}) or {}
    scored, ambiguous = select(intent, sig.get("domain"), sig.get("target_output"))
    exp = t.get("expected", {}) or {}
    fails = []

    if exp.get("ambiguous"):
        if not ambiguous:
            got = scored[0]["rule"]["select"].get("pipeline_id") if scored else None
            fails.append(f"expected ambiguous, but selected {got}")
        return fails

    if ambiguous or not scored:
        fails.append("expected a selection, got ambiguous/none")
        return fails

    sel = scored[0]["rule"].get("select", {}) or {}
    if exp.get("pipeline_id") and sel.get("pipeline_id") != exp["pipeline_id"]:
        fails.append(f"pipeline: expected {exp['pipeline_id']}, got {sel.get('pipeline_id')}")

    if exp.get("package"):
        pkg = sel.get("package")
        if pkg != exp["package"]:
            fails.append(f"package: expected {exp['package']}, got {pkg}")
        else:
            man = load_yaml(os.path.join(REPO, pkg, "pipeline.package.yaml")) or {}
            gates = man.get("gates", []) or []
            ga = sum(1 for g in gates if g.get("set") == "always")
            if exp.get("gates_always") is not None and ga != exp["gates_always"]:
                fails.append(f"gates_always: expected {exp['gates_always']}, got {ga}")
            ns = len(man.get("stages", []) or [])
            if exp.get("stages") is not None and ns != exp["stages"]:
                fails.append(f"stages: expected {exp['stages']}, got {ns}")
    return fails


def main():
    files = sorted(glob.glob(os.path.join(TRIALS_DIR, "*.trial.yaml")))
    if not files:
        print("[trials] no trials found in engine/trials/")
        return 0
    npass = nfail = 0
    for f in files:
        t = load_yaml(f) or {}
        fails = check_trial(t)
        name = t.get("id") or os.path.basename(f)
        if fails:
            nfail += 1
            print(f"  x {name}")
            for x in fails:
                print(f"      - {x}")
        else:
            npass += 1
            print(f"  ok {name}  — {str(t.get('intent',''))[:48]}")
    print(f"[trials] {npass} passed, {nfail} failed (of {len(files)})")
    return 0 if nfail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
