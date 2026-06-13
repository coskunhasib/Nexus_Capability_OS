#!/usr/bin/env python3
"""
run_chain.py — Nexus AI Orchestration Model :: multi-pipeline handoff chain prover (mock).

Per-pipeline runs prove each pipeline works ALONE. This proves the ORCHESTRATION MODEL IS WHOLE:
an artifact produced by one pipeline is actually consumed by the next across the seam.
For each engine/chains/*.chain.yaml it runs every step's package (mock) and asserts:
  1. every step's run VERDICT is PASS;
  2. each declared `handoff_out` artifact is actually PRODUCED by that pipeline; and
  3. each declared `handoff_in` artifact was produced upstream AND is DECLARED as an input
     by the downstream pipeline (the seam genuinely exists, not just by name).

Usage:
  python3 engine/run_chain.py                                   # run all chains
  python3 engine/run_chain.py engine/chains/discovery-to-sdlc.chain.yaml
Exit 0 = all chains PASS, 1 = any FAIL.
"""
from __future__ import annotations
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from package_pipeline import load_yaml  # noqa: E402
from run_pipeline import execute        # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
CHAINS = os.path.join(HERE, "chains")


def consumer_inputs(pkg):
    """Union of all stage `inputs` declared in a package's bundled stage contracts."""
    out = set()
    sdir = os.path.join(os.path.abspath(pkg), "stages")
    if os.path.isdir(sdir):
        for fn in sorted(os.listdir(sdir)):
            if fn.lower().endswith((".yaml", ".yml")):
                sc = load_yaml(os.path.join(sdir, fn)) or {}
                for i in (sc.get("inputs") or []):
                    out.add(i)
    return out


def abspkg(p):
    return p if os.path.isabs(p) else os.path.join(REPO, p)


def run_chain(spec_path):
    spec = load_yaml(spec_path) or {}
    cid = spec.get("id", os.path.basename(spec_path))
    steps = spec.get("steps", []) or []
    print(f"[chain] {cid}: {(spec.get('description') or '').strip()[:90]}")
    prev_produced = set()
    ok = True
    for i, step in enumerate(steps):
        pkg = abspkg(step["package"])
        # 3) handoff-in check BEFORE running the consumer (the seam must already exist)
        hin = step.get("handoff_in")
        if hin:
            produced = hin in prev_produced
            declared = hin in consumer_inputs(pkg)
            mark = "ok" if (produced and declared) else " X"
            print(f"  [{mark}] handoff {hin}: produced_upstream={produced}  declared_as_input={declared}")
            ok = ok and produced and declared
        # 1) run the step (mock)
        res = execute(pkg)
        v = res["verdict"]
        print(f"  [{'ok' if v == 'PASS' else ' X'}] step {i + 1}: {res['pid']} -> {v}  "
              f"({len(res['completed'])}/{len(res['stage_ids'])} stages, "
              f"{res['always_pass']}/{res['always_total']} gates)")
        ok = ok and (v == "PASS")
        # 2) handoff-out check (producer actually emits what the seam promises)
        produced_set = set(res["produced_outputs"])
        for art in (step.get("handoff_out") or []):
            made = art in produced_set
            print(f"       - emits {art}: {made}")
            ok = ok and made
        prev_produced = produced_set
    print(f"[chain] {cid}: {'PASS' if ok else 'FAIL'}\n")
    return ok


def main():
    args = sys.argv[1:]
    specs = args if args else sorted(glob.glob(os.path.join(CHAINS, "*.chain.yaml")))
    if not specs:
        print("[chains] no chain specs found")
        return 1
    results = [run_chain(s) for s in specs]
    npass = sum(1 for r in results if r)
    print(f"[chains] {npass} passed, {len(results) - npass} failed (of {len(results)})")
    return 0 if npass == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
