#!/usr/bin/env python3
"""
package_pipeline.py — Nexus AI Orchestration Model :: pipeline packager (workbench tool).

Reads a pipeline definition + the Shared Registry (configs/nexus-ai/*) and emits a
self-contained `.pipeline` package folder (manifest + bundled components + gates + evidence
+ stage contracts), per docs/nexus-ai-orchestration-model/packaging/PIPELINE_PACKAGE_FORMAT.md.

PRODUCER-side tool only. It authors LABELS (id + version). It does NOT compute content
fingerprints — that is the consumer/Nexus job (see packaging/CONSUMER_CONTRACT.md).

Usage:
  python3 engine/package_pipeline.py [--pipeline configs/nexus-ai/sdlc_pipeline.yaml] [--out packages]
"""
from __future__ import annotations
import argparse
import os
import re
import shutil
import subprocess
import sys

import yaml

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(REPO, "configs", "nexus-ai")
STAGES_ROOT = os.path.join(CFG, "stages")

# uses_* (list) field -> (registry filename, component kind, components subdir)
REGISTRY_MAP = {
    "uses_core_abilities":          ("core_abilities.yaml",          "core_ability",           "core-abilities"),
    "uses_skills":                  ("skills_registry.yaml",         "skill",                  "skills"),
    "uses_tools":                   ("tools_registry.yaml",          "tool",                   "tools"),
    "uses_governance_profiles":     ("governance_profiles.yaml",     "governance_profile",     "governance"),
    "uses_audit_schemas":           ("audit_schemas.yaml",           "audit_schema",           "audit"),
    "uses_model_provider_profiles": ("model_provider_profiles.yaml", "model_provider_profile", "model-profiles"),
    "uses_context_memory_profiles": ("context_memory_profiles.yaml", "context_memory_profile", "context-memory-profiles"),
}
# single-value field -> (registry filename, kind, subdir)
SINGLE_MAP = {
    "required_team_type":      ("team_templates.yaml",  "team",      "teams"),
    "required_team_lead_role": ("team_lead_roles.yaml", "team_lead", "teams"),
}

# Identifier keys an entry may use across the registries.
ID_KEYS = (
    "id", "name", "skill_id", "tool_id", "profile_id", "schema_id", "ability_id",
    "team_id", "team_lead_id", "sub_agent_id", "agent_id",
    "model_provider_profile_id", "context_memory_profile_id", "audit_schema_id",
)


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def walk_find(node, token):
    """Find an entry matching `token` anywhere in `node`.

    Matches either (a) a dict whose id-like field equals token, or
    (b) a dict value whose map KEY equals token (id-keyed maps, e.g. governance_profiles).
    Returns a copy of the entry dict, or None.
    """
    t = str(token).strip().lower()
    if isinstance(node, dict):
        for k in ID_KEYS:
            if k in node and str(node[k]).strip().lower() == t:
                return dict(node)
        al = node.get("aliases")
        if isinstance(al, list) and any(str(a).strip().lower() == t for a in al):
            return dict(node)
        for k, v in node.items():
            if str(k).strip().lower() == t and isinstance(v, dict):
                e = dict(v)
                e.setdefault("id", k)
                return e
        for v in node.values():
            r = walk_find(v, token)
            if r is not None:
                return r
    elif isinstance(node, list):
        for it in node:
            r = walk_find(it, token)
            if r is not None:
                return r
    return None


def entry_id(e, token, kind=None):
    primary = {"team": "team_id", "team_lead": "team_lead_id",
               "sub_agent": "sub_agent_id", "agent": "agent_id"}.get(kind or "")
    if primary and primary in e:
        return str(e[primary])
    for k in ("id", "name", "skill_id", "tool_id", "profile_id",
              "schema_id", "ability_id", "team_id", "team_lead_id"):
        if k in e:
            return str(e[k])
    return str(token)


def entry_version(e):
    return str(e.get("version", "1.0.0"))


def git_sha():
    try:
        return subprocess.check_output(
            ["git", "-C", REPO, "rev-parse", "--short", "HEAD"], text=True).strip()
    except Exception:
        return "unknown"


def extract(registry_file, tokens):
    path = os.path.join(CFG, registry_file)
    if not os.path.exists(path):
        return {}, list(tokens)
    doc = load_yaml(path)
    found, missing = {}, []
    for tok in tokens:
        e = walk_find(doc, tok)
        if e is None:
            missing.append(tok)
        else:
            found[tok] = e
    return found, missing


def write_yaml(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)


def stage_key(filename):
    """Normalize a stage contract filename to a stage id.

    '15-verification-loop-bug-finding.yaml' -> 'verification_loop_bug_finding'
    """
    base = os.path.splitext(filename)[0]
    base = re.sub(r"^\d+[-_]", "", base)
    return base.replace("-", "_").lower()


def find_stage_files():
    """Map stage_key -> filepath for every YAML under STAGES_ROOT (recursive)."""
    out = {}
    if not os.path.isdir(STAGES_ROOT):
        return out
    for root, _, files in os.walk(STAGES_ROOT):
        for fn in files:
            if fn.lower().endswith((".yaml", ".yml")):
                out.setdefault(stage_key(fn), os.path.join(root, fn))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pipeline", default=os.path.join(CFG, "sdlc_pipeline.yaml"))
    ap.add_argument("--out", default=os.path.join(REPO, "packages"))
    args = ap.parse_args()

    pdef = load_yaml(args.pipeline)
    pid = pdef.get("pipeline_id") or os.path.splitext(os.path.basename(args.pipeline))[0]
    pkg_dir = os.path.join(args.out, pid.replace("_", "-"))
    if os.path.exists(pkg_dir):
        shutil.rmtree(pkg_dir)
    os.makedirs(pkg_dir, exist_ok=True)

    # 1. pipeline definition
    shutil.copyfile(args.pipeline, os.path.join(pkg_dir, "pipeline.yaml"))

    # 2. components (from uses_* + team/team_lead)
    components = []
    found_count = 0
    missing_all = []

    def add_field(field, registry_file, kind, subdir, value):
        nonlocal found_count
        tokens = [t for t in (value if isinstance(value, list) else [value]) if t]
        found, missing = extract(registry_file, tokens)
        for tok, e in found.items():
            cid = entry_id(e, tok, kind)
            rel = os.path.join("components", subdir, f"{kind}__{str(cid).replace('/', '_')}.yaml")
            write_yaml(os.path.join(pkg_dir, rel), e)
            comp = {"kind": kind, "id": cid, "version": entry_version(e), "path": rel}
            if str(cid).strip().lower() != str(tok).strip().lower():
                comp["requested_as"] = tok
            components.append(comp)
            found_count += 1
        for m in missing:
            missing_all.append({"kind": kind, "id": m, "field": field})

    for field, (rf, kind, sub) in SINGLE_MAP.items():
        if field in pdef:
            add_field(field, rf, kind, sub, pdef[field])
    for field, (rf, kind, sub) in REGISTRY_MAP.items():
        if field in pdef:
            add_field(field, rf, kind, sub, pdef[field])

    # 3. gates (from the pipeline def)
    gates = pdef.get("required_gates", {}) or {}
    write_yaml(os.path.join(pkg_dir, "gates", "required_gates.yaml"), {"required_gates": gates})
    gate_entries = []
    for setname in ("always", "conditional"):
        for g in gates.get(setname, []) or []:
            gate_entries.append({"id": g, "set": setname})

    # 4. evidence + trace (declared by the pipeline def)
    req_evidence = pdef.get("required_evidence", []) or []
    req_trace = pdef.get("required_trace", []) or []
    write_yaml(os.path.join(pkg_dir, "evidence", "required_evidence.yaml"),
               {"required_evidence": req_evidence, "required_trace": req_trace})

    # 5. stages (copy matching contracts)
    stage_ids = pdef.get("stages", []) or []
    os.makedirs(os.path.join(pkg_dir, "stages"), exist_ok=True)
    stage_files = find_stage_files()
    stages_copied, stages_missing = [], []
    for sid in stage_ids:
        src = stage_files.get(str(sid).lower())
        if src:
            shutil.copyfile(src, os.path.join(pkg_dir, "stages", os.path.basename(src)))
            stages_copied.append(sid)
        else:
            stages_missing.append(sid)

    # 6. manifest (the label — NO fingerprints; consumer computes those)
    manifest = {
        "package_schema_version": "0.1",
        "pipeline_id": pid,
        "name": pdef.get("name", pid),
        "description": pdef.get("purpose", ""),
        "package_version": "1.0.0",
        "provenance": {
            "produced_by": "nexus-capability-os",
            "source_commit": git_sha(),
            "source_path": os.path.relpath(args.pipeline, REPO),
        },
        "pipeline_def": "pipeline.yaml",
        "components": components,
        "gates": gate_entries,
        "evidence": {"required_evidence": req_evidence, "required_trace": req_trace},
        "stages": stage_ids,
    }
    write_yaml(os.path.join(pkg_dir, "pipeline.package.yaml"), manifest)

    # 7. README
    with open(os.path.join(pkg_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(f"# {manifest['name']} — `.pipeline` package\n\n")
        f.write(f"Auto-generated by `engine/package_pipeline.py` from "
                f"`{manifest['provenance']['source_path']}` (commit {manifest['provenance']['source_commit']}).\n\n")
        f.write(f"- pipeline_id: `{pid}`\n")
        f.write(f"- package_version: `{manifest['package_version']}`\n")
        f.write(f"- components bundled: {len(components)}\n")
        f.write(f"- gates: {len(gate_entries)} "
                f"({len(gates.get('always', []) or [])} always, {len(gates.get('conditional', []) or [])} conditional)\n")
        f.write(f"- evidence artifacts: {len(req_evidence)} | trace records: {len(req_trace)}\n")
        f.write(f"- stages: {len(stage_ids)} (contracts bundled: {len(stages_copied)})\n\n")
        f.write("Self-contained. Content fingerprint + dedup is the consumer's (Nexus) job — "
                "see `../../docs/nexus-ai-orchestration-model/packaging/CONSUMER_CONTRACT.md`.\n")

    # report
    print(f"[packager] package : {os.path.relpath(pkg_dir, REPO)}")
    print(f"[packager] components bundled : {found_count}")
    print(f"[packager] gates : {len(gate_entries)} ({len(gates.get('always', []) or [])} always + "
          f"{len(gates.get('conditional', []) or [])} conditional)")
    print(f"[packager] evidence : {len(req_evidence)} artifacts, {len(req_trace)} trace records")
    print(f"[packager] stages : {len(stage_ids)} listed, {len(stages_copied)} contracts bundled")
    if missing_all:
        print(f"[packager] WARNING: {len(missing_all)} referenced components not found:")
        for m in missing_all:
            print(f"    - {m['kind']}: {m['id']}  (from {m['field']})")
    if stages_missing:
        print(f"[packager] WARNING: {len(stages_missing)} stages have no bundled contract: {stages_missing}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
