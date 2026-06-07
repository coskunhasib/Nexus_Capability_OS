#!/usr/bin/env python3
"""
select_pipeline.py — Nexus AI Orchestration Model :: deterministic intent→pipeline selector (T1).

Reads configs/nexus-ai/pipeline_selection_contract.yaml and maps a user intent (free text +
optional structured signals) to the pipeline (and its .pipeline package, if built).
PRE-SELECTION only: the mission orchestrator may confirm/override (executor_override_policy).

Usage:
  python3 engine/select_pipeline.py --intent "bir SaaS MVP yap"
  python3 engine/select_pipeline.py --intent "skill audit" --domain skill --target-output skill_change
Exit 0 = a pipeline selected, 2 = ambiguous / no confident match.
"""
from __future__ import annotations
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from package_pipeline import load_yaml  # reuse

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTRACT = os.path.join(REPO, "configs", "nexus-ai", "pipeline_selection_contract.yaml")


def score_rule(rule, intent_lc, domain, target):
    m = rule.get("match", {}) or {}
    kw = [k for k in (m.get("contains_any") or []) if str(k).lower() in intent_lc]
    score = len(kw)
    if domain and domain in (m.get("any_domain") or []):
        score += 3
    if target and target in (m.get("any_target_output") or []):
        score += 3
    return score, kw


def select(intent, domain=None, target=None, contract_path=CONTRACT):
    c = load_yaml(contract_path) or {}
    intent_lc = (intent or "").lower()
    scored = []
    for r in c.get("rules", []) or []:
        s, kw = score_rule(r, intent_lc, domain, target)
        if s > 0:
            scored.append({"score": s, "priority": r.get("priority", 0), "rule": r, "matched": kw})
    scored.sort(key=lambda x: (x["score"], x["priority"]), reverse=True)
    ambiguous = (not scored) or (
        len(scored) > 1 and scored[0]["score"] == scored[1]["score"]
        and scored[0]["priority"] == scored[1]["priority"]
    )
    return scored, ambiguous


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--intent", required=True)
    ap.add_argument("--domain", default=None)
    ap.add_argument("--target-output", dest="target", default=None)
    ap.add_argument("--contract", default=CONTRACT)
    args = ap.parse_args()

    scored, ambiguous = select(args.intent, args.domain, args.target, args.contract)
    print(f"[select] intent: {args.intent!r}")
    if not scored:
        print("[select] VERDICT: AMBIGUOUS — no confident match; defer to orchestrator/owner")
        return 2

    top = scored[0]
    sel = top["rule"].get("select", {}) or {}
    pkg = sel.get("package")
    print(f"[select] → pipeline: {sel.get('pipeline_id')}")
    print(f"[select]   package : {pkg if pkg else '(not packaged yet — definition is markdown-only)'}")
    print(f"[select]   why     : score {top['score']} {top['matched']} | priority {top['priority']} | rule {top['rule'].get('id')}")
    if len(scored) > 1:
        print("[select]   runner-up:")
        for x in scored[1:3]:
            print(f"     - {x['rule'].get('select',{}).get('pipeline_id')} (score {x['score']}, priority {x['priority']})")
    if ambiguous:
        print("[select] VERDICT: AMBIGUOUS (tie at top) — defer to orchestrator/owner")
        return 2
    print("[select] VERDICT: selected (pre-selection; orchestrator may override)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
