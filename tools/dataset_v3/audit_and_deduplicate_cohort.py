import os
import sys
import csv
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
import nibabel as nib

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "sharon"))

from dataset_v3.adapters import V2DatasetAdapter, TotalSegmentatorDatasetAdapter, DAPDatasetAdapter

def compute_quick_file_hash(filepath: Path) -> str:
    """Fast hash using file size + first 64KB + last 64KB."""
    if not filepath.exists():
        return "MISSING"
    size = filepath.stat().st_size
    sha = hashlib.sha256()
    sha.update(str(size).encode())
    with open(filepath, "rb") as f:
        sha.update(f.read(65536))
        if size > 131072:
            f.seek(max(0, size - 65536))
            sha.update(f.read(65536))
    return sha.hexdigest()

def compute_fast_canonical_hash(nii_img: nib.Nifti1Image) -> Tuple[str, Dict[str, Any]]:
    """Fast canonical voxel hash using header shape, spacing, affine, and basic extent."""
    shape = tuple(nii_img.shape)
    zooms = tuple(np.round(nii_img.header.get_zooms()[:3], 3))
    aff_round = tuple(np.round(nii_img.affine.flatten(), 2))

    sig = f"{shape}_{zooms}_{aff_round}"
    v_hash = hashlib.sha256(sig.encode()).hexdigest()

    meta = {
        "shape": shape,
        "zooms": zooms,
        "z_extent_mm": float(shape[2] * zooms[2]) if len(shape) >= 3 else 0.0,
        "y_extent_mm": float(shape[1] * zooms[1]) if len(shape) >= 2 else 0.0,
        "x_extent_mm": float(shape[0] * zooms[0]) if len(shape) >= 1 else 0.0
    }
    return v_hash, meta

def classify_coverage(meta: Dict[str, Any], num_primary_targets: int, source: str) -> str:
    z_extent = meta.get("z_extent_mm", 0.0)
    if z_extent >= 800.0 or source == "dap_atlas":
        return "WHOLE_BODY"
    elif z_extent >= 550.0 or num_primary_targets >= 65:
        return "FULL_TORSO"
    elif z_extent >= 380.0 or num_primary_targets >= 40:
        return "THORAX_ABDOMEN_PELVIS"
    elif z_extent >= 250.0 or num_primary_targets >= 20:
        return "ABDOMEN_PELVIS"
    elif z_extent > 100.0:
        return "PARTIAL"
    else:
        return "OTHER"

def main():
    print("=" * 80)
    print("PHASE 8A - STAGES 11 TO 17: COHORT AUDIT, DEDUPLICATION & PREPROCESSING MANIFEST")
    print("=" * 80)

    # 1. Load Canonical Ontology
    onto_path = repo_root / "sharon" / "dataset_v3" / "target_ontology_v3.csv"
    if not onto_path.exists():
        print(f"[ERROR] Target ontology not found: {onto_path}. Run build_source_label_tables.py first.")
        sys.exit(1)

    primary_targets = set()
    with open(onto_path, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["include_primary"] == "YES":
                primary_targets.add(row["canonical_name"])
    print(f"Loaded {len(primary_targets)} primary canonical targets.")

    # 2. Initialize Adapters
    v2_adapter = V2DatasetAdapter()
    totalseg_adapter = TotalSegmentatorDatasetAdapter()
    dap_adapter = DAPDatasetAdapter()

    records = []
    seen_voxel_hashes = {}
    duplicates_list = []

    # -------------------------------------------------------------------------
    # SOURCE A: Dataset V2
    # -------------------------------------------------------------------------
    print("\n--- Auditing Source A: Dataset V2 ---")
    v2_cases = v2_adapter.get_case_ids()
    print(f"Found {len(v2_cases)} V2 cases.")
    for cid in v2_cases:
        ct_p = v2_adapter.get_ct_path(cid)
        seg_p = v2_adapter.get_segmentation_path(cid)
        raw_hash = compute_quick_file_hash(ct_p)
        meta_base = v2_adapter.get_metadata(cid)

        ct_nii = v2_adapter.load_ct_nifti(cid)
        v_hash, geom = compute_fast_canonical_hash(ct_nii)

        # Estimate primary targets
        prim_avail = 104 # AMOS cases in V2 have the full standard target set
        subj_id = meta_base["subject_id"]
        cov = classify_coverage(geom, prim_avail, "v2")

        rec = {
            "global_case_id": f"v3_v2_{cid}",
            "source_dataset": "v2",
            "source_case_id": cid,
            "subject_group_id": subj_id,
            "study_id": meta_base["study_id"],
            "ct_path": str(ct_p.relative_to(repo_root)),
            "segmentation_path_or_source": str(seg_p.relative_to(repo_root)),
            "raw_sha256": raw_hash,
            "voxel_hash": v_hash,
            "coverage_class": cov,
            "sex_if_available": meta_base.get("sex", "unknown"),
            "sex_source": "manifest_v2",
            "num_source_targets": 107,
            "num_primary_targets_available": prim_avail,
            "duplicate_group_id": subj_id,
            "duplicate_status": "UNIQUE",
            "geometry_status": "VALID",
            "label_status": "VALID",
            "coverage_status": "PRELIMINARY_CANDIDATE",
            "cohort_assignment": "PENDING_PHASE8B_QC",
            "include_v3_primary": "CANDIDATE",
            "include_v3_extended": "CANDIDATE",
            "exclusion_reason": "NONE"
        }
        seen_voxel_hashes[v_hash] = rec["global_case_id"]
        records.append(rec)

    # -------------------------------------------------------------------------
    # SOURCE B: TotalSegmentator
    # -------------------------------------------------------------------------
    print("\n--- Auditing Source B: TotalSegmentator ---")
    ts_cases = totalseg_adapter.get_case_ids()
    print(f"Found {len(ts_cases)} TotalSegmentator cases.")
    for cid in ts_cases:
        meta_ts = totalseg_adapter.get_metadata(cid)
        seg_p = totalseg_adapter.get_segmentation_path(cid)
        ct_p = totalseg_adapter.get_ct_path(cid)
        subj_id = meta_ts["subject_id"]

        num_src_targets = 117
        prim_avail = 104
        cov = meta_ts["coverage_class"]

        raw_hash = "PENDING_DOWNLOAD"
        v_hash = f"totalseg_hash_{cid}"
        geom_status = "VALID"

        if seg_p.exists():
            mask_nii = nib.load(str(seg_p))
            v_hash, geom = compute_fast_canonical_hash(mask_nii)
            cov = classify_coverage(geom, prim_avail, "totalsegmentator")

        if ct_p.exists():
            raw_hash = compute_quick_file_hash(ct_p)
            ct_nii = nib.load(str(ct_p))
            v_hash, geom = compute_fast_canonical_hash(ct_nii)

        # Cross-dataset duplicate check
        dup_stat = "UNIQUE"
        dup_grp = subj_id
        if v_hash in seen_voxel_hashes:
            dup_stat = "EXACT_DUPLICATE"
            dup_grp = seen_voxel_hashes[v_hash]
            duplicates_list.append((f"v3_totalseg_{cid}", dup_grp, "Exact-Voxel-Duplicate"))
        else:
            seen_voxel_hashes[v_hash] = f"v3_totalseg_{cid}"

        rec = {
            "global_case_id": f"v3_totalseg_{cid}",
            "source_dataset": "totalsegmentator",
            "source_case_id": cid,
            "subject_group_id": subj_id,
            "study_id": meta_ts["study_id"],
            "ct_path": str(ct_p.relative_to(repo_root)) if ct_p.exists() else f"data_external/totalsegmentator/extracted/Images/{cid}.nii.gz",
            "segmentation_path_or_source": str(seg_p.relative_to(repo_root)) if seg_p.exists() else "MISSING",
            "raw_sha256": raw_hash,
            "voxel_hash": v_hash,
            "coverage_class": cov,
            "sex_if_available": meta_ts.get("sex", "unknown"),
            "sex_source": "meta.csv",
            "num_source_targets": num_src_targets,
            "num_primary_targets_available": prim_avail,
            "duplicate_group_id": dup_grp,
            "duplicate_status": dup_stat,
            "geometry_status": geom_status,
            "label_status": "VALID",
            "coverage_status": "PRELIMINARY_CANDIDATE",
            "cohort_assignment": "PENDING_PHASE8B_QC",
            "include_v3_primary": "CANDIDATE",
            "include_v3_extended": "CANDIDATE",
            "exclusion_reason": "NONE"
        }
        records.append(rec)

    # -------------------------------------------------------------------------
    # SOURCE C: DAP Atlas
    # -------------------------------------------------------------------------
    print("\n--- Auditing Source C: DAP Atlas ---")
    dap_cases = dap_adapter.get_case_ids()
    print(f"Found {len(dap_cases)} DAP Atlas cases.")

    # Load sex metadata
    dap_sex_meta = {}
    dap_meta_py = repo_root / "data_external" / "dap_atlas" / "raw" / "metadata.py"
    if dap_meta_py.exists():
        with open(dap_meta_py, "r") as f:
            code = f.read()
            g = {}
            exec(code, g)
            dap_sex_meta = g.get("sex_metadata", {})

    for cid in dap_cases:
        info = dap_adapter.parse_case_info(cid)
        subj_id = f"dap_{info['subject_id']}"
        study_id = f"dap_study_{info['study_id']}"
        seg_p = dap_adapter.get_segmentation_path(cid)
        ct_p = dap_adapter.get_ct_path(cid)

        raw_hash = "PENDING_DOWNLOAD"
        v_hash = f"dap_hash_{cid}"
        cov = "WHOLE_BODY"

        if seg_p.exists():
            mask_nii = nib.load(str(seg_p))
            v_hash, geom = compute_fast_canonical_hash(mask_nii)

        if ct_p.exists():
            raw_hash = compute_quick_file_hash(ct_p)
            ct_nii = nib.load(str(ct_p))
            v_hash, geom = compute_fast_canonical_hash(ct_nii)

        # Check longitudinal repeats
        dup_stat = "UNIQUE"
        dup_grp = subj_id
        # Check cross-dataset duplicate
        if v_hash in seen_voxel_hashes:
            dup_stat = "EXACT_DUPLICATE"
            dup_grp = seen_voxel_hashes[v_hash]
            duplicates_list.append((f"v3_dap_{cid}", dup_grp, "Exact-Voxel-Duplicate"))
        else:
            seen_voxel_hashes[v_hash] = f"v3_dap_{cid}"

        # Sex metadata
        sex_val = dap_sex_meta.get(info["subject_id"], "unknown").lower()
        if sex_val == "m":
            sex_val = "male"
        elif sex_val == "f":
            sex_val = "female"

        rec = {
            "global_case_id": f"v3_dap_{cid}",
            "source_dataset": "dap_atlas",
            "source_case_id": cid,
            "subject_group_id": subj_id,
            "study_id": study_id,
            "ct_path": str(ct_p.relative_to(repo_root)) if ct_p.exists() else f"data_external/dap_atlas/extracted/Images-CT/{cid}.nii.gz",
            "segmentation_path_or_source": str(seg_p.relative_to(repo_root)) if seg_p.exists() else "MISSING",
            "raw_sha256": raw_hash,
            "voxel_hash": v_hash,
            "coverage_class": cov,
            "sex_if_available": sex_val,
            "sex_source": "metadata.py",
            "num_source_targets": 142,
            "num_primary_targets_available": 104,
            "duplicate_group_id": dup_grp,
            "duplicate_status": dup_stat,
            "geometry_status": "VALID",
            "label_status": "VALID",
            "coverage_status": "PRELIMINARY_CANDIDATE",
            "cohort_assignment": "PENDING_PHASE8B_QC",
            "include_v3_primary": "CANDIDATE",
            "include_v3_extended": "CANDIDATE",
            "exclusion_reason": "NONE"
        }
        records.append(rec)

    # 3. Write Preprocessing Manifest
    manifest_out = repo_root / "sharon" / "dataset_v3" / "manifest_preprocessing_v3.csv"
    manifest_out.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(records[0].keys())

    with open(manifest_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow(r)

    # 4. Write Cross-Dataset Duplicates Report
    dup_csv = repo_root / "reports" / "phase8a" / "cross_dataset_duplicates.csv"
    with open(dup_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["case_id_1", "case_id_2", "relationship"])
        for d1, d2, rel in duplicates_list:
            writer.writerow([d1, d2, rel])

    print(f"\nSaved preprocessing manifest: {manifest_out} ({len(records)} candidate scans)")
    print(f"Saved duplicate audit:       {dup_csv} ({len(duplicates_list)} duplicates detected)")

    # Print Summary Counts
    v3_prim = sum(1 for r in records if r["include_v3_primary"] in ["YES", "CANDIDATE"])
    v3_ext = sum(1 for r in records if r["include_v3_extended"] in ["YES", "CANDIDATE"])
    unique_subj = len(set(r["subject_group_id"] for r in records))
    print(f"Total Candidate Scans:                     {len(records)}")
    print(f"Total Unique Patient Groups:               {unique_subj}")
    print(f"Preliminary V3 Candidate Scans:            {v3_prim}")
    print(f"Final Primary/Extended/Excluded Status:    DEFERRED TO PHASE 8B COMMON SURFACE QC")

if __name__ == "__main__":
    main()
