import os
import sys
import json
import csv
from pathlib import Path
import numpy as np
import torch
from scipy.signal import find_peaks, savgol_filter
from scipy.spatial.distance import cdist

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))

def compute_1d_profiles(pts, z_bin_size=5.0):
    """
    Computes 1D geometric profiles along Z for an external surface point cloud (pts: [N, 3]).
    Returns:
      z_grid: array of z centers
      width: lateral width (X_max - X_min) or 95th - 5th percentile
      depth: AP depth (Y_max - Y_min) or 95th - 5th percentile
      area: approx cross-sectional area (pi * (W/2) * (D/2))
    """
    z = pts[:, 2]
    z_min, z_max = np.min(z), np.max(z)
    bins = np.arange(z_min, z_max + z_bin_size, z_bin_size)
    if len(bins) < 4:
        return None, None, None, None
    
    z_centers = 0.5 * (bins[:-1] + bins[1:])
    digitized = np.digitize(z, bins) - 1
    
    widths = []
    depths = []
    areas = []
    valid_z = []
    
    for b_idx in range(len(bins) - 1):
        in_bin = pts[digitized == b_idx]
        if len(in_bin) >= 10:
            w = np.percentile(in_bin[:, 0], 98) - np.percentile(in_bin[:, 0], 2)
            d = np.percentile(in_bin[:, 1], 98) - np.percentile(in_bin[:, 1], 2)
            valid_z.append(z_centers[b_idx])
            widths.append(w)
            depths.append(d)
            areas.append(np.pi * (w / 2.0) * (d / 2.0))
            
    if len(valid_z) < 4:
        return None, None, None, None
        
    return np.array(valid_z), np.array(widths), np.array(depths), np.array(areas)

def extract_candidate_anchors(pts):
    """
    Computes candidate external longitudinal anchors for a given point cloud (in world mm).
    """
    z_grid, widths, depths, areas = compute_1d_profiles(pts, z_bin_size=5.0)
    if z_grid is None:
        return {}
    
    # Smooth profiles
    w_smooth = savgol_filter(widths, window_length=min(11, len(widths) if len(widths)%2==1 else len(widths)-1), polyorder=2) if len(widths) >= 5 else widths
    d_smooth = savgol_filter(depths, window_length=min(11, len(depths) if len(depths)%2==1 else len(depths)-1), polyorder=2) if len(depths) >= 5 else depths
    a_smooth = savgol_filter(areas, window_length=min(11, len(areas) if len(areas)%2==1 else len(areas)-1), polyorder=2) if len(areas) >= 5 else areas
    
    anchors = {}
    
    # 1. Bounding Box Midpoint (baseline before fix)
    z_min_w, z_max_w = np.min(pts[:, 2]), np.max(pts[:, 2])
    anchors["bbox_midpoint"] = 0.5 * (z_min_w + z_max_w)
    
    # 2. External Surface Centroid
    anchors["surface_mean"] = float(np.mean(pts[:, 2]))
    
    # 3. Waist Inflection (Local minimum of area / width in lower-mid torso)
    # Search in the lower 60% of the scan (excluding bottom 10%)
    z_range = z_max_w - z_min_w
    search_mask = (z_grid >= z_min_w + 0.15 * z_range) & (z_grid <= z_min_w + 0.70 * z_range)
    if np.sum(search_mask) > 3:
        sub_z = z_grid[search_mask]
        sub_a = a_smooth[search_mask]
        min_idx = np.argmin(sub_a)
        anchors["waist_min"] = float(sub_z[min_idx])
    else:
        anchors["waist_min"] = np.nan
        
    # 4. Shoulder/Neck Widening Inflection (Maximum gradient dW/dz in upper torso)
    search_mask_sup = (z_grid >= z_min_w + 0.50 * z_range)
    if np.sum(search_mask_sup) > 4:
        sub_z = z_grid[search_mask_sup]
        sub_w = w_smooth[search_mask_sup]
        # gradient of width with respect to z: moving downwards (negative z), width expands rapidly
        dw = np.gradient(sub_w, sub_z)
        # where width drops fastest with increasing z (going up to neck) -> min gradient (steepest negative slope)
        min_grad_idx = np.argmin(dw)
        anchors["shoulder_inflection"] = float(sub_z[min_grad_idx])
    else:
        anchors["shoulder_inflection"] = np.nan
        
    # 5. Max Thoracic Width
    if np.sum(search_mask_sup) > 4:
        sub_z = z_grid[search_mask_sup]
        sub_w = w_smooth[search_mask_sup]
        max_w_idx = np.argmax(sub_w)
        anchors["max_thorax_width"] = float(sub_z[max_w_idx])
    else:
        anchors["max_thorax_width"] = np.nan
        
    return anchors

def main():
    print("Testing candidate external-only longitudinal anchors across Dataset V3...")
    data_path = repo_root / "sharon" / "dataset_v3" / "pointclouds_v3.pt"
    data = torch.load(data_path, weights_only=False)
    
    pts_4096 = data["points_centered_4096"].numpy()
    surf_c = data["surface_centers"].numpy()
    tgt_w = data["targets_world"].numpy()
    tgt_m = data["target_masks"].numpy()
    sources = data["source_datasets"]
    
    with open(repo_root / "sharon" / "dataset_v3" / "splits_v3_iid.json", "r") as f:
        splits = json.load(f)
    train_idx = splits["train_indices"]
    val_idx = splits["val_indices"]
    
    onto_path = repo_root / "sharon" / "dataset_v3" / "target_ontology_v3.csv"
    with open(onto_path, "r") as f:
        ontology = list(csv.DictReader(f))
    p104_idx = [i for i, r in enumerate(ontology) if r.get("include_primary") == "YES"]
    
    # Reconstruct world points for all cases
    all_pts_world = [pts_4096[i] + surf_c[i:i+1] for i in range(len(sources))]
    
    # Check anchor extraction on train
    v2_train = [i for i in train_idx if sources[i] == "v2"]
    ts_train = [i for i in train_idx if sources[i] == "totalsegmentator"]
    
    print(f"Loaded {len(train_idx)} train cases ({len(v2_train)} V2, {len(ts_train)} TS).")
    
    # Let's extract candidate anchors for all train cases
    candidate_names = ["bbox_midpoint", "surface_mean", "waist_min", "shoulder_inflection", "max_thorax_width"]
    train_anchors = {name: [] for name in candidate_names}
    
    for i in train_idx:
        pts_w = all_pts_world[i]
        anc = extract_candidate_anchors(pts_w)
        for name in candidate_names:
            train_anchors[name].append(anc.get(name, np.nan))
            
    for name in candidate_names:
        vals = np.array(train_anchors[name])
        valid_rate = np.mean(~np.isnan(vals)) * 100.0
        print(f"Anchor '{name}': Detection success rate = {valid_rate:.1f}%")

if __name__ == "__main__":
    main()
