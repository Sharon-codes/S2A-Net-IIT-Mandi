import os
import sys
from pathlib import Path
import csv
import numpy as np
import nibabel as nib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))

def compute_costa_z_centroids(mask_path: Path):
    """
    Computes physical Z world coordinates for costa 1..12 (L and R)
    using slice-by-slice bincount projection.
    Returns dict: {(k, side): (world_z, voxel_count)}
    """
    img = nib.load(str(mask_path))
    data = np.asarray(img.dataobj, dtype=np.int16)
    affine = img.affine
    z_dim = data.shape[2]

    # Compute z histogram for labels 67..90 (costa 1L to 12R)
    counts_per_z = np.zeros((z_dim, 24), dtype=np.int64)
    for z in range(z_dim):
        bc = np.bincount(data[:, :, z].ravel(), minlength=91)
        counts_per_z[z] = bc[67:91]

    total_counts = counts_per_z.sum(axis=0)
    z_voxels = np.arange(z_dim)
    mean_z_vox = (counts_per_z.T @ z_voxels) / np.maximum(total_counts, 1)

    centroids = {}
    for idx in range(24):
        k = idx // 2 + 1
        side = "L" if idx % 2 == 0 else "R"
        cnt = total_counts[idx]
        if cnt > 50: # at least 50 voxels
            world_z = float((affine @ np.array([0, 0, mean_z_vox[idx], 1.0]))[2])
            centroids[(k, side)] = (world_z, int(cnt))
        else:
            centroids[(k, side)] = (None, 0)
    return centroids

def main():
    print("=" * 80)
    print("PHASE 8A: PHYSICAL VALIDATION OF DAP RIB REVERSAL MAPPING")
    print("=" * 80)

    dap_masks_dir = repo_root / "data_external" / "dap_atlas" / "extracted" / "Atlas_dataset"
    all_masks = sorted(list(dap_masks_dir.glob("AutoPET_*.nii.gz")))
    if not all_masks:
        print(f"[ERROR] No DAP masks found in {dap_masks_dir}")
        sys.exit(1)

    # Select 35 representative cases evenly spaced across the cohort
    num_eval = min(35, len(all_masks))
    step = len(all_masks) // num_eval
    selected_cases = [all_masks[i * step] for i in range(num_eval)]
    print(f"Auditing {len(selected_cases)} representative DAP scans for physical rib Z monotonicity...")

    qc_dir = repo_root / "reports" / "phase8a" / "qc_ribs"
    qc_dir.mkdir(parents=True, exist_ok=True)

    csv_out = repo_root / "reports" / "phase8a" / "dap_rib_physical_validation.csv"
    csv_rows = []

    total_pairs_checked = 0
    total_dap_ascending_pairs = 0 # should be costa(k+1) > costa(k)
    total_canonical_descending_pairs = 0 # rib(k+1) < rib(k)

    case_stats = []

    for c_idx, mask_path in enumerate(selected_cases):
        case_name = mask_path.name.replace(".nii.gz", "")
        centroids = compute_costa_z_centroids(mask_path)

        case_pairs = 0
        case_dap_asc = 0

        # Check left and right chains
        for side in ["L", "R"]:
            present_ks = [k for k in range(1, 13) if centroids[(k, side)][0] is not None]
            for i in range(len(present_ks) - 1):
                k1, k2 = present_ks[i], present_ks[i + 1]
                z1 = centroids[(k1, side)][0]
                z2 = centroids[(k2, side)][0]
                case_pairs += 1
                total_pairs_checked += 1
                if z2 > z1: # costa(k2) is more superior than costa(k1)
                    case_dap_asc += 1
                    total_dap_ascending_pairs += 1
                else:
                    print(f"  [ANOMALY] {case_name} {side}: costa {k2} Z ({z2:.1f}) <= costa {k1} Z ({z1:.1f})")

        case_stats.append({
            "case_idx": c_idx + 1,
            "case_name": case_name,
            "pairs": case_pairs,
            "dap_asc": case_dap_asc,
            "centroids": centroids
        })

        for k in range(1, 13):
            z_l, c_l = centroids[(k, "L")]
            z_r, c_r = centroids[(k, "R")]
            # Canonical rib index
            canon_rib = 13 - k
            csv_rows.append({
                "case_name": case_name,
                "dap_costa_k": k,
                "canonical_rib_number": canon_rib,
                "left_z_mm": f"{z_l:.2f}" if z_l is not None else "N/A",
                "left_voxel_count": c_l,
                "right_z_mm": f"{z_r:.2f}" if z_r is not None else "N/A",
                "right_voxel_count": c_r,
            })

    # Write CSV
    with open(csv_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(csv_rows[0].keys()))
        writer.writeheader()
        for r in csv_rows:
            writer.writerow(r)
    print(f"Saved physical audit table: {csv_out}")

    # Compute violation rate
    violation_count = total_pairs_checked - total_dap_ascending_pairs
    violation_rate = (violation_count / total_pairs_checked) * 100.0 if total_pairs_checked > 0 else 0.0

    print(f"\nAudit Summary across {len(selected_cases)} scans:")
    print(f"  Total Adjacent Rib Pairs Tested: {total_pairs_checked}")
    print(f"  Pairs with Z(costa_k+1) > Z(costa_k): {total_dap_ascending_pairs}")
    print(f"  Monotonicity Agreement Rate:     {(total_dap_ascending_pairs / total_pairs_checked)*100:.2f}%")
    print(f"  Physical Violation Rate:          {violation_rate:.2f}%")

    # Generate visual QC plots for first 10 cases
    print(f"\nGenerating visual QC figures for 10 representative cases in {qc_dir}...")
    fig, axes = plt.subplots(5, 2, figsize=(14, 20))
    axes = axes.flatten()

    for idx in range(min(10, len(case_stats))):
        c_stat = case_stats[idx]
        ax = axes[idx]
        centroids = c_stat["centroids"]
        c_name = c_stat["case_name"]

        canon_ribs = list(range(1, 13))
        z_canon_l = [centroids[(13 - r, "L")][0] for r in canon_ribs]
        z_canon_r = [centroids[(13 - r, "R")][0] for r in canon_ribs]

        # Plot Canonical Rib number (1 to 12, top to bottom)
        # Should be strictly descending in physical Z coordinate
        valid_l = [(r, z) for r, z in zip(canon_ribs, z_canon_l) if z is not None]
        valid_r = [(r, z) for r, z in zip(canon_ribs, z_canon_r) if z is not None]

        if valid_l:
            ax.plot([r for r, z in valid_l], [z for r, z in valid_l], "o-", color="royalblue", label="Left Rib (Canon)")
        if valid_r:
            ax.plot([r for r, z in valid_r], [z for r, z in valid_r], "s--", color="crimson", label="Right Rib (Canon)")

        ax.set_title(f"Case {idx+1}: {c_name[:22]}...\nCanonical Rib 1 (Cranial) -> 12 (Caudal)", fontsize=10)
        ax.set_xlabel("Canonical Rib Number (1=Top, 12=Bottom)", fontsize=9)
        ax.set_ylabel("Physical World Z (mm)", fontsize=9)
        ax.grid(True, linestyle=":", alpha=0.6)
        if idx == 0:
            ax.legend(loc="upper right", fontsize=8)

    plt.tight_layout()
    summary_plot = qc_dir / "summary_rib_qc.png"
    plt.savefig(summary_plot, dpi=150)
    plt.close()
    print(f"Saved 10-case visual QC summary: {summary_plot}")

    return violation_rate

if __name__ == "__main__":
    v_rate = main()
    if v_rate > 0.5:
        print(f"[FAIL] DAP Rib violation rate {v_rate:.2f}% exceeds tolerance 0.5%")
        sys.exit(1)
    else:
        print(f"[PASS] DAP Rib physical mapping costa_k -> rib_(13-k) strictly validated (violation rate = {v_rate:.2f}%)")
