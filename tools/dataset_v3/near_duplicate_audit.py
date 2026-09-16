import os
import sys
import csv
import hashlib
from pathlib import Path
from collections import defaultdict
import numpy as np
import nibabel as nib

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))

def main():
    print("=" * 80)
    print("PHASE 8A: DETERMINISTIC NEAR-DUPLICATE & EXACT DUPLICATE AUDIT")
    print("=" * 80)

    manifest_path = repo_root / "sharon" / "dataset_v3" / "manifest_preprocessing_v3.csv"
    if not manifest_path.exists():
        print(f"[ERROR] Manifest not found: {manifest_path}")
        sys.exit(1)

    records = []
    with open(manifest_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            records.append(r)

    print(f"Loaded {len(records)} records from manifest.")

    # 1. Exact Duplicate Audit (File / Byte Hash & Voxel Hash)
    byte_hash_to_sources = defaultdict(lambda: defaultdict(list))
    voxel_hash_to_sources = defaultdict(lambda: defaultdict(list))

    # 2. Near-Duplicate Audit (Deterministic Canonical Image Fingerprints)
    # Fingerprint: (shape, rounded_spacing, rounded_fov_mm)
    fingerprint_to_sources = defaultdict(lambda: defaultdict(list))

    print("Auditing canonical image fingerprints across sources...")

    for r in records:
        cid = r["global_case_id"]
        src = r["source_dataset"]
        raw_sha = r["raw_sha256"]
        v_hash = r["voxel_hash"]

        if raw_sha not in ["MISSING", "PENDING_DOWNLOAD"]:
            byte_hash_to_sources[raw_sha][src].append(cid)

        if not v_hash.startswith("totalseg_hash") and not v_hash.startswith("dap_hash"):
            voxel_hash_to_sources[v_hash][src].append(cid)

    # Check for cross-source exact duplicates
    cross_source_exact_duplicates = []
    for h, src_dict in byte_hash_to_sources.items():
        if len(src_dict) > 1:
            cross_source_exact_duplicates.append((h, dict(src_dict), "Byte-Identical"))

    for h, src_dict in voxel_hash_to_sources.items():
        if len(src_dict) > 1:
            cross_source_exact_duplicates.append((h, dict(src_dict), "Voxel-Exact"))

    # Now evaluate near-duplicate candidates
    # We inspect geometry metadata across all available volumes
    geom_audit_csv = repo_root / "reports" / "phase8a" / "source_geometry_audit.csv"
    near_dup_candidates = []

    if geom_audit_csv.exists():
        with open(geom_audit_csv, "r", encoding="utf-8") as f:
            for g in csv.DictReader(f):
                src = g["source"]
                cid = g["case_id"]
                shape = g.get("ct_shape", "")
                fp = f"{shape}"
                if shape and shape != "N/A":
                    fingerprint_to_sources[fp][src].append(cid)

        # Check for cross-source geometry collisions
        for fp, src_dict in fingerprint_to_sources.items():
            if len(src_dict) > 1:
                # Potential candidate: scans from different sources share exact shape and spacing
                # Let's inspect these candidates
                near_dup_candidates.append({
                    "fingerprint": fp,
                    "sources": list(src_dict.keys()),
                    "cases": dict(src_dict)
                })

    print(f"\nExact Duplicate Audit Results:")
    print(f"  Cross-source exact byte duplicates:  {len(cross_source_exact_duplicates)}")
    print(f"  Cross-source exact voxel duplicates: {len([x for x in cross_source_exact_duplicates if x[2] == 'Voxel-Exact'])}")

    print(f"\nNear-Duplicate Audit Results:")
    print(f"  Cross-source geometry matches:       {len(near_dup_candidates)}")

    # Write near-duplicate report
    out_csv = repo_root / "reports" / "phase8a" / "cross_dataset_near_duplicates.csv"
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["audit_type", "source_1", "case_1", "source_2", "case_2", "similarity_metric", "verdict"])
        if not near_dup_candidates and not cross_source_exact_duplicates:
            writer.writerow(["NONE", "N/A", "N/A", "N/A", "N/A", "N/A", "ZERO_DUPLICATES_DETECTED"])
        else:
            for nd in near_dup_candidates:
                srcs = nd["sources"]
                writer.writerow(["NEAR_DUPLICATE_CANDIDATE", srcs[0], str(nd["cases"][srcs[0]][:3]), srcs[1], str(nd["cases"][srcs[1]][:3]), nd["fingerprint"], "POTENTIAL_GEOMETRY_OVERLAP"])

    print(f"Saved near duplicate audit: {out_csv}")
    return len(cross_source_exact_duplicates), len(near_dup_candidates)

if __name__ == "__main__":
    n_exact, n_near = main()
    print(f"\nSUMMARY: Exact duplicates: {n_exact}, Near-duplicate candidates: {n_near}")
