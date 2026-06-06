#!/usr/bin/env python3
"""
run_pipeline.py — Nexus AI Orchestration Model :: .pipeline mock runner (workbench tool).

Loads a .pipeline package and runs it end-to-end with a DETERMINISTIC MOCK agent loop
(observe -> think -> act, ActionNode-style structured output — the MetaGPT transfer), then
ENFORCES the governance gates (D-016 19 always-required) using the gate->producer map, and
EMITS evidence + trace. No LLM, no network: it proves the orchestration + governance loop.
Real-LLM execution + a code sandbox come in later phases.

Usage:
  python3 engine/run_pipeline.py packages/sdlc-pipeline
Exit 0 = run verdict PASS, 1 = FAIL.
"""
from __future__ import annotations
import datetime
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from package_pipeline import load_yaml, write_yaml, stage_key  # reuse helpers

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
CFG = os.path.join(REPO, "configs", "nexus-ai")


def load_gate_producers():
    """gate_id -> {producing_stage, satisfied_by} from runtime rules (best-effort)."""
    p = os.path.join(CFG, "sdlc_pipeline_runtime_rules.yaml")
    out = {}
    if os.path.exists(p):
        gp = (load_yaml(p) or {}).get("required_gate_producers") or {}
        for e in (gp.get("gates") or []):
            if isinstance(e, dict) and e.get("gate"):
                out[e["gate"]] = {
                    "producing_stage": e.get("producing_stage"),
                    "satisfied_by": e.get("satisfied_by_stage_gates") or [],
                }
    return out


def mock_agent_run(stage):
    """Deterministic mock of one stage's agent loop: observe -> think -> act (ActionNode-style)."""
    sid = stage.get("stage_id")
    return {
        "stage_id": sid,
        "owner_agent": stage.get("owner_agent", "unassigned"),
        "observe": {"inputs": stage.get("inputs", []) or []},
        "think": {"react_mode": "react", "plan": f"execute {sid}"},
        "act": {"status": "done", "outputs_produced": stage.get("outputs", []) or []},
        "stage_gates_passed": list(stage.get("gates", []) or []),   # mock: all stage gates pass
        "evidence_emitted": list(stage.get("evidence", []) or []),
        "mock": True,
    }


def main():
    import argparse
    ap = argparse.ArgumentParser(description="Run a .pipeline package (mock).")
    ap.add_argument("package")
    ap.add_argument("--skip", action="append", default=[],
                    help="stage_id to force-skip (demonstrates that gate enforcement bites)")
    args = ap.parse_args()
    pkg = os.path.abspath(args.package)
    skip = set(args.skip)
    man = load_yaml(os.path.join(pkg, "pipeline.package.yaml")) or {}
    pdef = load_yaml(os.path.join(pkg, man.get("pipeline_def", "pipeline.yaml"))) or {}
    pid = man.get("pipeline_id", "pipeline")
    now = datetime.datetime.now().isoformat(timespec="seconds")
    run_id = "run-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

    # index bundled stage contracts by stage_id
    sdir = os.path.join(pkg, "stages")
    stage_by_id = {}
    if os.path.isdir(sdir):
        for fn in sorted(os.listdir(sdir)):
            if fn.lower().endswith((".yaml", ".yml")):
                sc = load_yaml(os.path.join(sdir, fn)) or {}
                stage_by_id[sc.get("stage_id") or stage_key(fn)] = sc

    # 1. run stages in order (mock agent loop)
    stage_ids = pdef.get("stages", []) or man.get("stages", []) or []
    stage_results, completed, passed_stage_gates = [], set(), {}
    for sid in stage_ids:
        if sid in skip:
            stage_results.append({"stage_id": sid, "owner_agent": "-", "observe": {}, "think": {},
                                  "act": {"status": "skipped"}, "stage_gates_passed": [],
                                  "evidence_emitted": [], "mock": True})
            continue
        r = mock_agent_run(stage_by_id.get(sid, {"stage_id": sid}))
        stage_results.append(r)
        completed.add(sid)
        passed_stage_gates[sid] = set(r["stage_gates_passed"])

    # 2. enforce rollup gates (D-016 always + conditional) via the gate->producer map
    producers = load_gate_producers()
    req_gates = pdef.get("required_gates", {}) or {}
    gate_results = []

    def eval_gate(gate):
        prod = producers.get(gate)
        if prod and prod.get("producing_stage"):
            ps, sb = prod["producing_stage"], prod.get("satisfied_by", [])
            if ps not in completed:
                return "FAIL", f"producing stage '{ps}' did not complete"
            unmet = [g for g in sb if g not in passed_stage_gates.get(ps, set())]
            if unmet:
                return "FAIL", f"unsatisfied stage gates {unmet} in '{ps}'"
            return "PASS", f"satisfied by '{ps}' ({len(sb)} stage-gates)"
        return "PASS", "mock pass (no explicit producer map)"

    for tier in ("always", "conditional"):
        for gate in req_gates.get(tier, []) or []:
            status, reason = eval_gate(gate)
            gate_results.append({"gate": gate, "tier": tier, "status": status, "reason": reason})
    always_fail = [g for g in gate_results if g["tier"] == "always" and g["status"] == "FAIL"]

    # 3. emit evidence stub per required_evidence artifact
    req_evidence = pdef.get("required_evidence", []) or []
    req_trace = pdef.get("required_trace", []) or []
    out_dir = os.path.join(HERE, "runs", pid, "latest")
    ev_dir = os.path.join(out_dir, "evidence")
    os.makedirs(ev_dir, exist_ok=True)
    for f in os.listdir(ev_dir):
        try:
            os.remove(os.path.join(ev_dir, f))
        except OSError:
            pass
    evidence_records = []
    for art in req_evidence:
        producer = next((sid for sid in stage_ids
                         if art in (stage_by_id.get(sid, {}).get("evidence", []) or [])), "pipeline")
        if producer in skip:
            continue
        with open(os.path.join(ev_dir, f"{art}.md"), "w", encoding="utf-8") as f:
            f.write(f"# {art}\n\n- run: {run_id}\n- produced_by_stage: {producer}\n- mock: true\n\n"
                    "(Mock evidence stub generated by the Capability OS skeleton runner.)\n")
        evidence_records.append({"artifact": art, "produced_by_stage": producer, "path": f"evidence/{art}.md"})

    # 4. trace
    write_yaml(os.path.join(out_dir, "trace.yaml"), {
        "run_id": run_id, "pipeline_id": pid, "started_at": now,
        "required_trace_records": req_trace,
        "stage_gate_trace": [
            {"stage_id": r["stage_id"], "owner_agent": r["owner_agent"],
             "status": r["act"]["status"], "stage_gates_passed": sorted(r["stage_gates_passed"])}
            for r in stage_results
        ],
        "governance_gate_evaluation_trace": gate_results,
    })

    # 5. run record + verdict
    verdict = "PASS" if (not always_fail and len(evidence_records) == len(req_evidence)) else "FAIL"
    always_total = sum(1 for g in gate_results if g["tier"] == "always")
    always_pass = sum(1 for g in gate_results if g["tier"] == "always" and g["status"] == "PASS")
    cond_total = sum(1 for g in gate_results if g["tier"] == "conditional")
    write_yaml(os.path.join(out_dir, "run.yaml"), {
        "run_id": run_id, "pipeline_id": pid, "package_version": man.get("package_version"),
        "started_at": now, "mode": "mock",
        "stages_total": len(stage_ids), "stages_completed": len(completed),
        "gates_always_total": always_total, "gates_always_pass": always_pass,
        "gates_always_fail": len(always_fail), "gates_conditional_total": cond_total,
        "evidence_required": len(req_evidence), "evidence_emitted": len(evidence_records),
        "verdict": verdict, "gates": gate_results, "evidence": evidence_records,
        "stages": [r["stage_id"] for r in stage_results],
    })

    # report
    print(f"[runner] pipeline: {pid}  package_version: {man.get('package_version')}  mode: MOCK")
    print(f"[runner] stages   : {len(completed)}/{len(stage_ids)} completed")
    print(f"[runner] gates    : {always_pass}/{always_total} always-required PASS  ({cond_total} conditional evaluated)")
    print(f"[runner] evidence : {len(evidence_records)}/{len(req_evidence)} artifacts emitted  |  trace records: {len(req_trace)}")
    if always_fail:
        print("[runner] FAILED always-required gates:")
        for g in always_fail:
            print(f"    x {g['gate']}: {g['reason']}")
    print(f"[runner] output   : {os.path.relpath(out_dir, REPO)}")
    print(f"[runner] VERDICT  : {verdict}")
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
