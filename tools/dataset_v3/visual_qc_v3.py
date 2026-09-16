import os
import sys
import argparse
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))

def render_case_4view(npz_path: Path, out_path: Path, blind: bool = False):
    """
    Renders 4-view visual QC panel for a single case:
    1. Anterior view (Coronal: X vs Z)
    2. Lateral view (Sagittal: Y vs Z)
    3. Superior view (Axial: X vs Y)
    4. 3D perspective projection
    """
    with np.load(npz_path) as d:
        pts = d["points_centered_mm_4096"] # (4096, 3)
        targets = d["targets_centered_mm"] # (117, 3)
        masks = d["target_masks"] == 1
        cid = str(d["global_case_id"])
        src = str(d["source_dataset"])
        b_dims = d["body_dimensions_mm"]

    valid_targets = targets[masks]

    fig = plt.figure(figsize=(16, 12))
    title_str = f"Visual QC: {cid} | BBox: {b_dims[0]:.0f}x{b_dims[1]:.0f}x{b_dims[2]:.0f} mm" if not blind else f"Source-Blind Visual QC: {out_path.stem}"
    fig.suptitle(title_str, fontsize=14, fontweight="bold")

    # 1. Anterior view (X-Z plane: looking from front to back)
    ax1 = fig.add_subplot(2, 2, 1)
    ax1.scatter(pts[:, 0], pts[:, 2], s=1, c="lightsteelblue", alpha=0.3, label="Surface Points")
    if len(valid_targets) > 0:
        ax1.scatter(valid_targets[:, 0], valid_targets[:, 2], s=25, c="crimson", edgecolors="black", linewidth=0.5, label=f"Targets ({len(valid_targets)})")
    ax1.set_title("Anterior View (Coronal: Left-Right vs Inferior-Superior)", fontsize=11)
    ax1.set_xlabel("X (mm) [Right -> Left]", fontsize=10)
    ax1.set_ylabel("Z (mm) [Inferior -> Superior]", fontsize=10)
    ax1.grid(True, linestyle=":", alpha=0.5)
    ax1.legend(loc="upper right", fontsize=9)
    ax1.axis("equal")

    # 2. Lateral view (Y-Z plane: looking from side)
    ax2 = fig.add_subplot(2, 2, 2)
    ax2.scatter(pts[:, 1], pts[:, 2], s=1, c="lightsteelblue", alpha=0.3, label="Surface Points")
    if len(valid_targets) > 0:
        ax2.scatter(valid_targets[:, 1], valid_targets[:, 2], s=25, c="darkorange", edgecolors="black", linewidth=0.5, label="Targets")
    ax2.set_title("Lateral View (Sagittal: Anterior-Posterior vs Inferior-Superior)", fontsize=11)
    ax2.set_xlabel("Y (mm) [Posterior -> Anterior]", fontsize=10)
    ax2.set_ylabel("Z (mm) [Inferior -> Superior]", fontsize=10)
    ax2.grid(True, linestyle=":", alpha=0.5)
    ax2.axis("equal")

    # 3. Superior view (X-Y plane: looking from top down)
    ax3 = fig.add_subplot(2, 2, 3)
    ax3.scatter(pts[:, 0], pts[:, 1], s=1, c="lightsteelblue", alpha=0.3, label="Surface Points")
    if len(valid_targets) > 0:
        ax3.scatter(valid_targets[:, 0], valid_targets[:, 1], s=25, c="forestgreen", edgecolors="black", linewidth=0.5, label="Targets")
    ax3.set_title("Superior View (Axial: Left-Right vs Anterior-Posterior)", fontsize=11)
    ax3.set_xlabel("X (mm) [Right -> Left]", fontsize=10)
    ax3.set_ylabel("Y (mm) [Posterior -> Anterior]", fontsize=10)
    ax3.grid(True, linestyle=":", alpha=0.5)
    ax3.axis("equal")

    # 4. 3D perspective projection
    ax4 = fig.add_subplot(2, 2, 4, projection="3d")
    # Subsample surface for 3D render responsiveness
    sub_idx = np.random.choice(len(pts), size=1024, replace=False)
    ax4.scatter(pts[sub_idx, 0], pts[sub_idx, 1], pts[sub_idx, 2], s=2, c="steelblue", alpha=0.15)
    if len(valid_targets) > 0:
        ax4.scatter(valid_targets[:, 0], valid_targets[:, 1], valid_targets[:, 2], s=35, c="red", edgecolors="black", depthshade=False)
    ax4.set_title("3D Perspective Projection", fontsize=11)
    ax4.set_xlabel("X (mm)", fontsize=9)
    ax4.set_ylabel("Y (mm)", fontsize=9)
    ax4.set_zlabel("Z (mm)", fontsize=9)
    ax4.view_init(elev=20, azim=45)

    plt.tight_layout()
    plt.savefig(out_path, dpi=120)
    plt.close()

def main():
    parser = argparse.ArgumentParser(description="Phase 8B Visual QC Panel Generator")
    parser.add_argument("--num_cases", type=int, default=25, help="Number of cases to visualize")
    parser.add_argument("--blind", action="store_true", help="Generate source-blind QC panels")
    args = parser.parse_args()

    print("=" * 80)
    print("PHASE 8B: VISUAL QUALITY CONTROL PANEL GENERATION")
    print("=" * 80)

    cases_dir = repo_root / "sharon" / "dataset_v3" / "cases"
    all_npzs = sorted(list(cases_dir.glob("*.npz")))
    if not all_npzs:
        print(f"[ERROR] No NPZ cases found in {cases_dir}. Run build_dataset_v3.py first.")
        sys.exit(1)

    out_qc_dir = repo_root / "reports" / "phase8b" / "qc_surfaces"
    out_qc_dir.mkdir(parents=True, exist_ok=True)

    n_vis = min(args.num_cases, len(all_npzs))
    step = max(1, len(all_npzs) // n_vis)
    selected = [all_npzs[i * step] for i in range(n_vis)]

    print(f"Generating 4-view visual QC panels for {len(selected)} cases in {out_qc_dir}...")
    for idx, npz_p in enumerate(selected):
        out_p = out_qc_dir / f"qc_panel_{idx+1:02d}_{npz_p.stem}.png"
        render_case_4view(npz_p, out_p, blind=args.blind)
        if (idx + 1) % 5 == 0 or (idx + 1) == len(selected):
            print(f"  Rendered {idx + 1}/{len(selected)} panels")

    print(f"\nVisual QC generation complete. Artifacts saved in: {out_qc_dir}")

if __name__ == "__main__":
    main()
