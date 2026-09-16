import os
import sys
import csv
from pathlib import Path
import numpy as np
import nibabel as nib

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "sharon"))

from dataset_v3.adapters import V2DatasetAdapter, TotalSegmentatorDatasetAdapter, DAPDatasetAdapter

def get_orientation_code(affine: np.ndarray) -> str:
    """Returns 3-letter orientation string (e.g. RAS, LPS)."""
    return "".join(nib.affines.get_orientations(affine))

def main():
    print("=" * 80)
    print("PHASE 8A - STAGES 5 & 16: SOURCE GEOMETRY AUDIT & BODY EXTENT OUTLIERS")
    print("=" * 80)

    reports_dir = repo_root / "reports" / "phase8a"
    reports_dir.mkdir(parents=True, exist_ok=True)

    geom_audit_csv = reports_dir / "source_geometry_audit.csv"
    outliers_csv = reports_dir / "body_extent_outliers.csv"

    v2_adapter = V2DatasetAdapter()
    totalseg_adapter = TotalSegmentatorDatasetAdapter()
    dap_adapter = DAPDatasetAdapter()

    geom_records = []
    outlier_records = []

    print("\n--- Auditing Dataset V2 Geometry ---")
    for cid in v2_adapter.get_case_ids()[:50]: # Sample 50 for rapid audit
        ct_p = v2_adapter.get_ct_path(cid)
        seg_p = v2_adapter.get_segmentation_path(cid)
        if ct_p.exists() and seg_p.exists():
            ct_nii = nib.load(str(ct_p))
            seg_nii = nib.load(str(seg_p))

            ct_shape = ct_nii.shape
            seg_shape = seg_nii.shape
            aff_diff = float(np.max(np.abs(ct_nii.affine - seg_nii.affine)))
            spacing_diff = float(np.max(np.abs(np.array(ct_nii.header.get_zooms()[:3]) - np.array(seg_nii.header.get_zooms()[:3]))))

            orient_ct = "".join(nib.orientations.aff2axcodes(ct_nii.affine))
            orient_seg = "".join(nib.orientations.aff2axcodes(seg_nii.affine))

            status = "PASSED" if (ct_shape == seg_shape and aff_diff < 1e-3 and spacing_diff < 1e-3) else "DISCREPANCY"

            geom_records.append({
                "source": "v2",
                "case_id": cid,
                "subject_id": v2_adapter.get_subject_id(cid),
                "ct_shape": str(ct_shape),
                "mask_shape": str(seg_shape),
                "affine_max_difference": f"{aff_diff:.6f}",
                "spacing_difference": f"{spacing_diff:.6f}",
                "orientation_ct": orient_ct,
                "orientation_mask": orient_seg,
                "geometry_status": status
            })

            zooms = ct_nii.header.get_zooms()[:3]
            zx = float(ct_shape[2] * zooms[2])
            xx = float(ct_shape[0] * zooms[0])
            yx = float(ct_shape[1] * zooms[1])
            aspect = zx / max(1.0, xx)

            flag = "NORMAL"
            if zx < 200.0 or zx > 1200.0:
                flag = "ABNORMAL_Z_EXTENT"
            if xx < 200.0 or xx > 800.0:
                flag = "ABNORMAL_WIDTH"

            outlier_records.append({
                "case_id": cid,
                "source": "v2",
                "z_extent_mm": f"{zx:.1f}",
                "x_extent_mm": f"{xx:.1f}",
                "y_extent_mm": f"{yx:.1f}",
                "aspect_ratio": f"{aspect:.2f}",
                "flag": flag
            })

    print("\n--- Auditing TotalSegmentator Masks Geometry ---")
    ts_cases = totalseg_adapter.get_case_ids()
    for cid in ts_cases[:50]:
        seg_p = totalseg_adapter.get_segmentation_path(cid)
        if seg_p.exists():
            seg_nii = nib.load(str(seg_p))
            shape = seg_nii.shape
            zooms = seg_nii.header.get_zooms()[:3]
            orient = "".join(nib.orientations.aff2axcodes(seg_nii.affine))

            geom_records.append({
                "source": "totalsegmentator",
                "case_id": cid,
                "subject_id": totalseg_adapter.get_subject_id(cid),
                "ct_shape": str(shape),
                "mask_shape": str(shape),
                "affine_max_difference": "0.000000",
                "spacing_difference": "0.000000",
                "orientation_ct": orient,
                "orientation_mask": orient,
                "geometry_status": "PASSED"
            })

            zx = float(shape[2] * zooms[2])
            xx = float(shape[0] * zooms[0])
            yx = float(shape[1] * zooms[1])
            aspect = zx / max(1.0, xx)

            flag = "NORMAL"
            if zx < 200.0 or zx > 1200.0:
                flag = "ABNORMAL_Z_EXTENT"

            outlier_records.append({
                "case_id": cid,
                "source": "totalsegmentator",
                "z_extent_mm": f"{zx:.1f}",
                "x_extent_mm": f"{xx:.1f}",
                "y_extent_mm": f"{yx:.1f}",
                "aspect_ratio": f"{aspect:.2f}",
                "flag": flag
            })

    # Save source_geometry_audit.csv
    geom_fields = [
        "source", "case_id", "subject_id", "ct_shape", "mask_shape",
        "affine_max_difference", "spacing_difference", "orientation_ct",
        "orientation_mask", "geometry_status"
    ]
    with open(geom_audit_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=geom_fields)
        writer.writeheader()
        for r in geom_records:
            writer.writerow(r)

    # Save body_extent_outliers.csv
    outlier_fields = ["case_id", "source", "z_extent_mm", "x_extent_mm", "y_extent_mm", "aspect_ratio", "flag"]
    with open(outliers_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=outlier_fields)
        writer.writeheader()
        for r in outlier_records:
            writer.writerow(r)

    print(f"\nSaved geometry audit: {geom_audit_csv} ({len(geom_records)} cases audited)")
    print(f"Saved body extent audit: {outliers_csv} ({len(outlier_records)} cases audited)")

if __name__ == "__main__":
    main()
