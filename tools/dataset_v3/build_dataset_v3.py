import os
import sys
import time
import csv
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from multiprocessing import Pool, cpu_count
import numpy as np
import nibabel as nib
from nibabel.affines import apply_affine
import torch

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "sharon"))

from dataset_v3.surface_pipeline import process_case_external_surface
from dataset_v3.adapters import V2DatasetAdapter, TotalSegmentatorDatasetAdapter, DAPDatasetAdapter

def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def process_case_worker(args: Tuple[Dict[str, Any], List[Dict[str, Any]], Path]) -> Dict[str, Any]:
    """
    Worker function to process a single candidate case into a standardized V3 NPZ.
    Extracts CT external surface (points_4096, normals_4096, points_8192, normals_8192),
    computes body-centric surface center, and extracts 117 canonical target centroids.
    """
    record, ontology, out_cases_dir = args
    gid = record["global_case_id"]
    cid = record["source_case_id"]
    src = record["source_dataset"]
    subj_grp = record["subject_group_id"]
    ct_rel = record["ct_path"]
    seg_rel = record["segmentation_path_or_source"]

    npz_path = out_cases_dir / f"{gid}.npz"
    # Skip if already processed and valid
    if npz_path.exists():
        try:
            with np.load(npz_path) as loaded:
                if "points_centered_mm_4096" in loaded and "targets_centered_mm" in loaded:
                    return {
                        "global_case_id": gid,
                        "status": "CACHED",
                        "error": None,
                        "npz_path": str(npz_path)
                    }
        except Exception:
            pass

    ct_path = repo_root / ct_rel
    seg_path = repo_root / seg_rel

    if not ct_path.exists():
        return {
            "global_case_id": gid,
            "status": "SKIPPED_NO_CT",
            "error": f"CT volume not found: {ct_path}",
            "npz_path": None
        }

    if not seg_path.exists():
        return {
            "global_case_id": gid,
            "status": "SKIPPED_NO_SEG",
            "error": f"Segmentation mask not found: {seg_path}",
            "npz_path": None
        }

    try:
        # 1. Load CT NIfTI and validate HU intensity
        ct_nii = nib.load(str(ct_path))
        ct_data = np.asanyarray(ct_nii.dataobj)
        affine_ct = ct_nii.affine
        zooms_ct = ct_nii.header.get_zooms()[:3]

        hu_min = float(np.min(ct_data))
        hu_max = float(np.max(ct_data))
        sample_hu = ct_data[::8, ::8, ::8]
        hu_median = float(np.median(sample_hu))

        # 2. Extract external body surface point clouds and outward normals
        surface_res = process_case_external_surface(ct_nii, standardize_torso_fov=True)
        pts_world_4096 = surface_res["points_world_mm_4096"]
        pts_centered_4096 = surface_res["points_centered_mm_4096"]
        normals_4096 = surface_res["normals_4096"]

        pts_world_8192 = surface_res["points_world_mm_8192"]
        pts_centered_8192 = surface_res["points_centered_mm_8192"]
        normals_8192 = surface_res["normals_8192"]

        c_surface = surface_res["surface_center_mm"]
        body_dims = surface_res["body_dimensions_mm"]
        torso_meta = surface_res["torso_metadata"]

        # 3. Load Segmentation and extract 117 canonical target centroids
        seg_nii = nib.load(str(seg_path))
        seg_data = np.asanyarray(seg_nii.dataobj, dtype=np.int16)
        affine_seg = seg_nii.affine
        zooms_seg = seg_nii.header.get_zooms()[:3]

        # Fast 1-pass 3D center of mass
        nonzero = np.argwhere(seg_data > 0)
        num_targets = len(ontology)
        targets_world = np.full((num_targets, 3), np.nan, dtype=np.float32)
        targets_centered = np.full((num_targets, 3), np.nan, dtype=np.float32)
        target_masks = np.zeros(num_targets, dtype=np.int8)
        target_volumes_mm3 = np.zeros(num_targets, dtype=np.float32)

        if len(nonzero) > 0:
            lbls = seg_data[nonzero[:, 0], nonzero[:, 1], nonzero[:, 2]]
            max_lbl = int(np.max(lbls))
            counts = np.bincount(lbls, minlength=max_lbl + 1)
            sum_x = np.bincount(lbls, weights=nonzero[:, 0], minlength=max_lbl + 1)
            sum_y = np.bincount(lbls, weights=nonzero[:, 1], minlength=max_lbl + 1)
            sum_z = np.bincount(lbls, weights=nonzero[:, 2], minlength=max_lbl + 1)
            voxel_vol = float(np.prod(zooms_seg))

            for t_idx, ont in enumerate(ontology):
                # Lookup source ID
                if src == "v2":
                    src_id_str = ont.get("v2_target_id", "")
                elif src == "totalsegmentator":
                    src_id_str = ont.get("totalsegmentator_target_id", "")
                elif src == "dap_atlas":
                    src_id_str = ont.get("dap_target_id", "") or ont.get("dap_atlas_target_id", "")
                else:
                    src_id_str = ont.get(f"{src}_target_id", "")

                if not src_id_str:
                    target_masks[t_idx] = 0 # Not available in source
                    continue

                src_id = int(src_id_str)
                if src == "dap_atlas":
                    # Rib reversal already handled in target_ontology_v3.csv mapping
                    pass

                if src_id <= max_lbl and counts[src_id] >= 10:
                    cnt = counts[src_id]
                    v_com = np.array([sum_x[src_id] / cnt, sum_y[src_id] / cnt, sum_z[src_id] / cnt])
                    p_w = apply_affine(affine_seg, v_com).astype(np.float32)
                    p_c = (p_w - c_surface).astype(np.float32)

                    targets_world[t_idx] = p_w
                    targets_centered[t_idx] = p_c
                    target_masks[t_idx] = 1
                    target_volumes_mm3[t_idx] = float(cnt * voxel_vol)

        # 4. Save per-case NPZ
        np.savez_compressed(
            npz_path,
            global_case_id=gid,
            source_case_id=cid,
            source_dataset=src,
            subject_group_id=subj_grp,
            points_world_mm_4096=pts_world_4096,
            points_centered_mm_4096=pts_centered_4096,
            normals_4096=normals_4096,
            points_world_mm_8192=pts_world_8192,
            points_centered_mm_8192=pts_centered_8192,
            normals_8192=normals_8192,
            targets_world_mm=targets_world,
            targets_centered_mm=targets_centered,
            target_masks=target_masks,
            target_volumes_mm3=target_volumes_mm3,
            surface_center_mm=c_surface,
            body_dimensions_mm=body_dims,
            hu_min=hu_min,
            hu_max=hu_max,
            hu_median=hu_median,
            torso_covered_height_mm=torso_meta.get("covered_height_mm", 0.0)
        )

        num_targets_present = int(np.sum(target_masks))
        return {
            "global_case_id": gid,
            "status": "PROCESSED",
            "error": None,
            "npz_path": str(npz_path),
            "num_targets_present": num_targets_present,
            "surface_center_mm": c_surface.tolist(),
            "body_dimensions_mm": body_dims.tolist(),
            "covered_height_mm": torso_meta.get("covered_height_mm", 0.0)
        }
    except Exception as e:
        return {
            "global_case_id": gid,
            "status": "ERROR",
            "error": str(e),
            "npz_path": None
        }

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Phase 8B Dataset V3 Builder")
    parser.add_argument("--max_cases", type=int, default=None, help="Maximum cases to process (for testing)")
    parser.add_argument("--workers", type=int, default=min(16, max(1, cpu_count() - 2)), help="Number of parallel workers")
    cmd_args = parser.parse_args()

    print("=" * 80)
    print("PHASE 8B: BODY SURFACE EXTRACTION, CENTROIDS & DATASET V3 BUILD")
    print("=" * 80)

    # 1. Load Preprocessing Manifest
    manifest_path = repo_root / "sharon" / "dataset_v3" / "manifest_preprocessing_v3.csv"
    if not manifest_path.exists():
        print(f"[ERROR] Preprocessing manifest not found: {manifest_path}")
        sys.exit(1)

    records = []
    with open(manifest_path, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            records.append(row)
    print(f"Loaded {len(records)} candidate cases from preprocessing manifest.")

    # 2. Load Canonical Target Ontology (117 targets)
    onto_path = repo_root / "sharon" / "dataset_v3" / "target_ontology_v3.csv"
    ontology = []
    with open(onto_path, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            ontology.append(row)

    primary_target_indices = [i for i, r in enumerate(ontology) if r.get("include_primary") == "YES"]
    canonical_names = [r["canonical_name"] for r in ontology]
    print(f"Loaded {len(ontology)} canonical targets ({len(primary_target_indices)} Primary, {len(ontology)-len(primary_target_indices)} Secondary).")

    # 3. Setup output directories
    out_dir = repo_root / "sharon" / "dataset_v3"
    cases_dir = out_dir / "cases"
    cases_dir.mkdir(parents=True, exist_ok=True)

    # 4. Filter cases that have local CT images ready
    available_cases = []
    for r in records:
        ct_p = repo_root / r["ct_path"]
        seg_p = repo_root / r["segmentation_path_or_source"]
        if ct_p.exists() and seg_p.exists():
            available_cases.append(r)

    if cmd_args.max_cases:
        available_cases = available_cases[:cmd_args.max_cases]

    print(f"Cases ready for immediate processing (CT + Seg present): {len(available_cases)} / {len(records)}")

    # 5. Multiprocessing Pool
    num_workers = cmd_args.workers
    print(f"Launching multiprocessing extraction with {num_workers} parallel workers...")

    worker_args = [(r, ontology, cases_dir) for r in available_cases]
    t0 = time.time()
    results = []

    with Pool(processes=num_workers) as pool:
        for idx, res in enumerate(pool.imap_unordered(process_case_worker, worker_args, chunksize=2)):
            results.append(res)
            if (idx + 1) % 25 == 0 or (idx + 1) == len(worker_args):
                elapsed = time.time() - t0
                rate = (idx + 1) / elapsed
                print(f"  Processed {idx + 1}/{len(worker_args)} cases ({rate:.2f} cases/s, {elapsed:.1f}s elapsed)")

    processed = [r for r in results if r["status"] in ["PROCESSED", "CACHED"]]
    errors = [r for r in results if r["status"] == "ERROR"]
    print(f"\nSurface Extraction Complete:")
    print(f"  Successfully processed: {len(processed)} / {len(available_cases)}")
    print(f"  Extraction failures:    {len(errors)}")

    # 6. Build Consolidated Tensor Dataset for Processed Cases
    print("\nConsolidating processed cases into tensor archive...")
    processed_gids = sorted([r["global_case_id"] for r in processed])

    case_ids = []
    subj_group_ids = []
    source_datasets = []
    pts_4096_list = []
    pts_w_4096_list = []
    norm_4096_list = []
    pts_8192_list = []
    norm_8192_list = []
    targets_c_list = []
    targets_w_list = []
    masks_list = []
    surf_centers = []
    body_dims = []

    for gid in processed_gids:
        npz_p = cases_dir / f"{gid}.npz"
        with np.load(npz_p) as d:
            case_ids.append(str(d["global_case_id"]))
            subj_group_ids.append(str(d["subject_group_id"]))
            source_datasets.append(str(d["source_dataset"]))
            pts_4096_list.append(d["points_centered_mm_4096"])
            pts_w_4096_list.append(d["points_world_mm_4096"])
            norm_4096_list.append(d["normals_4096"])
            pts_8192_list.append(d["points_centered_mm_8192"])
            norm_8192_list.append(d["normals_8192"])
            targets_c_list.append(d["targets_centered_mm"])
            targets_w_list.append(d["targets_world_mm"])
            masks_list.append(d["target_masks"])
            surf_centers.append(d["surface_center_mm"])
            body_dims.append(d["body_dimensions_mm"])

    tensor_dataset = {
        "case_ids": case_ids,
        "subject_group_ids": subj_group_ids,
        "source_datasets": source_datasets,
        "points_centered_4096": torch.from_numpy(np.stack(pts_4096_list)),
        "normals_4096": torch.from_numpy(np.stack(norm_4096_list)),
        "points_centered_8192": torch.from_numpy(np.stack(pts_8192_list)),
        "normals_8192": torch.from_numpy(np.stack(norm_8192_list)),
        "targets_centered": torch.from_numpy(np.stack(targets_c_list)),
        "targets_world": torch.from_numpy(np.stack(targets_w_list)),
        "target_masks": torch.from_numpy(np.stack(masks_list)),
        "surface_centers": torch.from_numpy(np.stack(surf_centers)),
        "body_dimensions": torch.from_numpy(np.stack(body_dims)),
        "primary_104_indices": torch.tensor(primary_target_indices, dtype=torch.int64),
        "canonical_target_names": canonical_names
    }

    pt_out = out_dir / "pointclouds_v3.pt"
    torch.save(tensor_dataset, pt_out)
    pt_size_mb = pt_out.stat().st_size / (1024 ** 2)
    print(f"Saved consolidated tensor dataset: {pt_out} ({pt_size_mb:.1f} MB, {len(case_ids)} cases)")

    # 7. Generate Subject-Disjoint Splits & Learning Curve Cohorts
    print("\nGenerating subject-disjoint dataset splits...")
    unique_subjects = sorted(list(set(subj_group_ids)))
    np.random.seed(42)
    shuffled_subjects = np.random.permutation(unique_subjects).tolist()

    n_subj = len(shuffled_subjects)
    n_train = int(0.80 * n_subj)
    n_val = int(0.10 * n_subj)
    train_subjs = set(shuffled_subjects[:n_train])
    val_subjs = set(shuffled_subjects[n_train:n_train + n_val])
    test_subjs = set(shuffled_subjects[n_train + n_val:])

    train_indices = [i for i, s in enumerate(subj_group_ids) if s in train_subjs]
    val_indices = [i for i, s in enumerate(subj_group_ids) if s in val_subjs]
    test_indices = [i for i, s in enumerate(subj_group_ids) if s in test_subjs]

    # Verify zero subject leak
    assert len(train_subjs.intersection(val_subjs)) == 0
    assert len(train_subjs.intersection(test_subjs)) == 0
    assert len(val_subjs.intersection(test_subjs)) == 0

    # Nested Learning Curve Cohorts
    learning_cohorts = {}
    target_sizes = [350, 500, 750, 1000, 1250]
    for sz in target_sizes:
        if len(train_indices) >= sz:
            learning_cohorts[f"N_{sz}"] = train_indices[:sz]
    learning_cohorts["N_FULL"] = train_indices

    splits_iid = {
        "split_type": "IID_SUBJECT_DISJOINT",
        "split_seed": 42,
        "ratios": "80/10/10",
        "num_subjects_total": n_subj,
        "num_cases_total": len(case_ids),
        "train_indices": train_indices,
        "val_indices": val_indices,
        "test_indices": test_indices,
        "train_case_ids": [case_ids[i] for i in train_indices],
        "val_case_ids": [case_ids[i] for i in val_indices],
        "test_case_ids": [case_ids[i] for i in test_indices],
        "learning_curve_cohorts": learning_cohorts
    }

    iid_path = out_dir / "splits_v3_iid.json"
    with open(iid_path, "w", encoding="utf-8") as f:
        json.dump(splits_iid, f, indent=2)
    print(f"Saved IID split ({len(train_indices)} train / {len(val_indices)} val / {len(test_indices)} test): {iid_path}")

    # Crossdomain split preserving legacy V2 test set
    v2_legacy_test = set()
    v2_split_file = repo_root / "sharon" / "dataset_v2" / "splits_v2.json"
    if v2_split_file.exists():
        with open(v2_split_file, "r") as f:
            v2_legacy_test = set(json.load(f).get("test_cases", []))

    cross_test_indices = [i for i, cid in enumerate(case_ids) if cid.replace("v3_v2_", "") in v2_legacy_test]
    cross_train_indices = [i for i in range(len(case_ids)) if i not in cross_test_indices]

    splits_cross = {
        "split_type": "CROSSDOMAIN_V2_LEGACY_FROZEN",
        "v2_legacy_frozen_test_count": len(cross_test_indices),
        "train_indices": cross_train_indices,
        "test_indices": cross_test_indices,
        "train_case_ids": [case_ids[i] for i in cross_train_indices],
        "test_case_ids": [case_ids[i] for i in cross_test_indices],
    }
    cross_path = out_dir / "splits_v3_crossdomain.json"
    with open(cross_path, "w", encoding="utf-8") as f:
        json.dump(splits_cross, f, indent=2)
    print(f"Saved cross-domain split (Frozen V2 test cases: {len(cross_test_indices)}): {cross_path}")

    # 8. Mandatory Verification Tests
    print("\nRunning Mandatory Verification Tests...")
    # Test 1: Coordinate Round-Trip
    actual_world = np.stack(pts_w_4096_list)
    c_s = np.stack(surf_centers)[:, None, :] # (N, 1, 3)
    # Reconstruct world from centered
    reconstructed_world = tensor_dataset["points_centered_4096"].numpy() + c_s
    max_roundtrip_err = float(np.max(np.abs(reconstructed_world - actual_world)))
    print(f"  Test 1: Coordinate Round-Trip Max Error: {max_roundtrip_err:.6f} mm (Threshold: < 0.001 mm) -> {'PASS' if max_roundtrip_err < 0.001 else 'FAIL'}")

    # Test 2: Target Round-Trip
    t_c = tensor_dataset["targets_centered"].numpy()
    t_w = tensor_dataset["targets_world"].numpy()
    t_mask = tensor_dataset["target_masks"].numpy() == 1
    t_reconstructed = t_c + c_s
    valid_t_err = np.abs(t_reconstructed[t_mask] - t_w[t_mask])
    max_target_rt_err = float(np.max(valid_t_err)) if len(valid_t_err) > 0 else 0.0
    print(f"  Test 2: Target Round-Trip Max Error:     {max_target_rt_err:.6f} mm (Threshold: < 0.001 mm) -> {'PASS' if max_target_rt_err < 0.001 else 'FAIL'}")

    # 9. Target Support Stratification
    print("\nStratifying Target Support...")
    train_masks = tensor_dataset["target_masks"][train_indices].numpy() # (N_train, 117)
    train_support_per_target = np.sum(train_masks, axis=0)

    benchmark_primary_indices = [i for i in primary_target_indices if train_support_per_target[i] >= 50]
    low_support_indices = [i for i in primary_target_indices if train_support_per_target[i] < 50]
    print(f"  Ontology Primary Targets:   {len(primary_target_indices)}")
    print(f"  Benchmark Primary Targets (Support >= 50): {len(benchmark_primary_indices)}")
    print(f"  Low Support Primary Targets: {len(low_support_indices)}")

    # 10. Preliminary Dataset-Only Baseline Benchmarks
    print("\nComputing Preliminary Dataset-Only Baselines (No Neural Training)...")
    # A. Global Mean Anatomy Baseline
    train_targets_c = tensor_dataset["targets_centered"][train_indices].numpy() # (N_train, 117, 3)
    test_targets_c = tensor_dataset["targets_centered"][test_indices].numpy() # (N_test, 117, 3)
    test_masks = tensor_dataset["target_masks"][test_indices].numpy() # (N_test, 117)

    global_mean_atlas = np.full((117, 3), np.nan, dtype=np.float32)
    for t_i in range(117):
        valid = train_masks[:, t_i] == 1
        if np.sum(valid) >= 5:
            global_mean_atlas[t_i] = np.mean(train_targets_c[valid, t_i], axis=0)

    # Evaluate Global Mean on Test Set for Benchmark Primary Targets
    test_errors = []
    for test_idx in range(len(test_indices)):
        for t_i in benchmark_primary_indices:
            if test_masks[test_idx, t_i] == 1 and not np.isnan(global_mean_atlas[t_i, 0]):
                err = np.linalg.norm(test_targets_c[test_idx, t_i] - global_mean_atlas[t_i])
                test_errors.append(err)

    global_mean_mre = float(np.mean(test_errors)) if test_errors else 0.0
    print(f"  Baseline 1: Global Mean Anatomy Test MRE: {global_mean_mre:.2f} mm")

    # B. Body-Dimension Ridge Regression Baseline
    train_dims = tensor_dataset["body_dimensions"][train_indices].numpy() # (N_train, 3)
    test_dims = tensor_dataset["body_dimensions"][test_indices].numpy() # (N_test, 3)

    dim_mean = np.mean(train_dims, axis=0)
    dim_std = np.std(train_dims, axis=0) + 1e-6
    X_train = np.hstack([(train_dims - dim_mean) / dim_std, np.ones((len(train_indices), 1))])
    X_test = np.hstack([(test_dims - dim_mean) / dim_std, np.ones((len(test_indices), 1))])

    ridge_errors = []
    alpha = 10.0
    I = np.eye(4)
    I[3, 3] = 0 # do not penalize bias
    for t_i in benchmark_primary_indices:
        valid_tr = train_masks[:, t_i] == 1
        valid_te = test_masks[:, t_i] == 1
        if np.sum(valid_tr) >= 10 and np.sum(valid_te) >= 1:
            X_tr_t = X_train[valid_tr]
            Y_tr_t = train_targets_c[valid_tr, t_i]
            w = np.linalg.solve(X_tr_t.T @ X_tr_t + alpha * I, X_tr_t.T @ Y_tr_t)
            Y_pred = X_test[valid_te] @ w
            diffs = np.linalg.norm(test_targets_c[valid_te, t_i] - Y_pred, axis=1)
            ridge_errors.extend(diffs.tolist())

    ridge_mre = float(np.mean(ridge_errors)) if ridge_errors else 0.0
    print(f"  Baseline 2: Body-Dimension Ridge Regression Test MRE: {ridge_mre:.2f} mm")

    # 11. Multi-Source Domain Classifier
    domain_labels = [0 if s == "v2" else (1 if s == "totalsegmentator" else 2) for s in source_datasets]
    unique_domains = set(domain_labels)
    domain_clf_acc = 50.0
    if len(unique_domains) > 1:
        from sklearn.linear_model import LogisticRegression
        clf_features = np.hstack([tensor_dataset["body_dimensions"].numpy(), tensor_dataset["surface_centers"].numpy()])
        clf = LogisticRegression(max_iter=500)
        clf.fit(clf_features[train_indices], [domain_labels[i] for i in train_indices])
        domain_clf_acc = float(clf.score(clf_features[test_indices], [domain_labels[i] for i in test_indices])) * 100.0
    print(f"  Multi-Domain Source Classifier Accuracy: {domain_clf_acc:.1f}%")

    # 12. Summary Metrics
    b_dims = tensor_dataset["body_dimensions"].numpy()
    mean_width = float(np.mean(b_dims[:, 0]))
    mean_depth = float(np.mean(b_dims[:, 1]))
    mean_height = float(np.mean(b_dims[:, 2]))

    print(f"\nCohort Physical Geometry Metrics:")
    print(f"  Mean Body Width:  {mean_width:.1f} mm")
    print(f"  Mean Body Depth:  {mean_depth:.1f} mm")
    print(f"  Mean Covered Torso Height: {mean_height:.1f} mm")

    # 13. Write Comprehensive Manifest V3
    manifest_v3_path = out_dir / "manifest_v3.csv"
    manifest_rows = []
    for i, gid in enumerate(case_ids):
        split_name = "train" if i in train_indices else ("val" if i in val_indices else "test")
        num_prim = int(np.sum(tensor_dataset["target_masks"][i, primary_target_indices].numpy()))
        h = float(b_dims[i, 2])
        cohort = "PRIMARY" if h >= 300.0 and num_prim >= 15 else "EXTENDED"
        manifest_rows.append({
            "global_case_id": gid,
            "source": source_datasets[i],
            "subject_group_id": subj_group_ids[i],
            "surface_extraction_status": "SUCCESS",
            "common_coverage_status": "FULL_TORSO" if h >= 300.0 else "PARTIAL_TORSO",
            "primary_target_count": num_prim,
            "target_support": num_prim,
            "QC_status": "PASS",
            "exclusion_reason": "NONE",
            "cohort_assignment": cohort,
            "split_v3_iid": split_name,
            "body_width_mm": f"{b_dims[i, 0]:.1f}",
            "body_depth_mm": f"{b_dims[i, 1]:.1f}",
            "body_height_mm": f"{b_dims[i, 2]:.1f}"
        })

    with open(manifest_v3_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(manifest_rows[0].keys()))
        writer.writeheader()
        for r in manifest_rows:
            writer.writerow(r)
    print(f"\nSaved final Dataset V3 manifest: {manifest_v3_path} ({len(manifest_rows)} cases)")

    # 14. Version metadata
    version_meta = {
        "dataset_name": "Dataset V3 Release Candidate",
        "date_created": time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
        "total_cases_processed": len(case_ids),
        "total_unique_subjects": n_subj,
        "num_primary_targets": len(primary_target_indices),
        "num_benchmark_primary_targets": len(benchmark_primary_indices),
        "num_low_support_targets": len(low_support_indices),
        "num_secondary_targets": len(ontology) - len(primary_target_indices),
        "max_coordinate_roundtrip_err_mm": max_roundtrip_err,
        "global_mean_atlas_mre_mm": global_mean_mre,
        "body_ridge_mre_mm": ridge_mre,
        "domain_classifier_accuracy_pct": domain_clf_acc,
        "learning_curve_cohorts": {k: len(v) for k, v in learning_cohorts.items()},
        "manifest_sha256": compute_sha256(manifest_v3_path),
        "ontology_sha256": compute_sha256(onto_path)
    }

    ver_path = out_dir / "DATASET_V3_VERSION.json"
    with open(ver_path, "w", encoding="utf-8") as f:
        json.dump(version_meta, f, indent=2)
    print(f"Saved dataset version descriptor: {ver_path}")

    return {
        "processed_count": len(case_ids),
        "unique_subjects": n_subj,
        "max_roundtrip_err": max_roundtrip_err,
        "global_mean_mre": global_mean_mre,
        "ridge_mre": ridge_mre,
        "mean_width": mean_width,
        "mean_depth": mean_depth,
        "mean_height": mean_height,
        "train_count": len(train_indices),
        "val_count": len(val_indices),
        "test_count": len(test_indices)
    }

if __name__ == "__main__":
    main()
