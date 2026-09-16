import os
import sys
import json
import csv
from pathlib import Path
import numpy as np
import torch
from scipy.signal import savgol_filter
from scipy.optimize import minimize_scalar
from sklearn.linear_model import Ridge

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))

def compute_1d_profiles(pts, z_bin_size=5.0):
    """
    Computes 1D geometric profiles along Z for an external surface point cloud (pts: [N, 3]).
    Returns:
      z_grid: array of z centers
      width: lateral width (X_max - X_min) (mm)
      depth: AP depth (Y_max - Y_min) (mm)
      area: approx cross-sectional area (pi * (W/2) * (D/2))
      x_mid: midpoint in X for each axial slice
      y_mid: midpoint in Y for each axial slice
    """
    z = pts[:, 2]
    z_min, z_max = np.min(z), np.max(z)
    bins = np.arange(z_min, z_max + z_bin_size, z_bin_size)
    if len(bins) < 4:
        return None
    
    z_centers = 0.5 * (bins[:-1] + bins[1:])
    digitized = np.digitize(z, bins) - 1
    
    widths, depths, areas, x_mids, y_mids, valid_z = [], [], [], [], [], []
    
    for b_idx in range(len(bins) - 1):
        in_bin = pts[digitized == b_idx]
        if len(in_bin) >= 10:
            p_x02, p_x98 = np.percentile(in_bin[:, 0], 2), np.percentile(in_bin[:, 0], 98)
            p_y02, p_y98 = np.percentile(in_bin[:, 1], 2), np.percentile(in_bin[:, 1], 98)
            w = p_x98 - p_x02
            d = p_y98 - p_y02
            valid_z.append(z_centers[b_idx])
            widths.append(w)
            depths.append(d)
            areas.append(np.pi * (w / 2.0) * (d / 2.0))
            x_mids.append(0.5 * (p_x02 + p_x98))
            y_mids.append(0.5 * (p_y02 + p_y98))
            
    if len(valid_z) < 4:
        return None
        
    return {
        "z": np.array(valid_z),
        "width": np.array(widths),
        "depth": np.array(depths),
        "area": np.array(areas),
        "x_mid": np.array(x_mids),
        "y_mid": np.array(y_mids)
    }

class TorsoTemplateMatcher:
    def __init__(self, z_step=5.0):
        self.z_step = z_step
        self.ref_z = None
        self.ref_w = None
        self.ref_d = None
        self.ref_a = None
        
    def build_template_from_train(self, train_pts_list, train_sources):
        """
        Builds a canonical multi-feature 1D torso template from long full-torso training cases.
        Anchored such that z=0 is the canonical waist narrowing (or mid-torso inflection).
        """
        # Select long training cases (height >= 400 mm)
        long_cases = []
        for idx, pts in enumerate(train_pts_list):
            h = np.max(pts[:, 2]) - np.min(pts[:, 2])
            if h >= 400.0:
                prof = compute_1d_profiles(pts, self.z_step)
                if prof is not None and len(prof["z"]) >= 60:
                    long_cases.append((idx, pts, prof))
                    
        print(f"Building canonical torso template from {len(long_cases)} full-torso training cases...")
        
        # First, find waist minimum for each long case to roughly align them
        aligned_profs = []
        for idx, pts, prof in long_cases:
            z = prof["z"]
            z_min, z_max = z[0], z[-1]
            z_range = z_max - z_min
            # Search waist in lower-mid 20%-65%
            search = (z >= z_min + 0.20 * z_range) & (z <= z_min + 0.65 * z_range)
            if np.sum(search) > 5:
                sub_z = z[search]
                sub_a = prof["area"][search]
                waist_z = sub_z[np.argmin(sub_a)]
                # Shift profile so waist is at z=0
                aligned_profs.append({
                    "z": z - waist_z,
                    "width": prof["width"],
                    "depth": prof["depth"],
                    "area": prof["area"]
                })
                
        # Create common grid from -300 mm to +400 mm
        common_z = np.arange(-300.0, 405.0, self.z_step)
        w_interp = []
        d_interp = []
        a_interp = []
        
        for ap in aligned_profs:
            # Interpolate onto common_z where covered
            z_cov = ap["z"]
            cov_mask = (common_z >= z_cov[0]) & (common_z <= z_cov[-1])
            w_i = np.interp(common_z, z_cov, ap["width"], left=np.nan, right=np.nan)
            d_i = np.interp(common_z, z_cov, ap["depth"], left=np.nan, right=np.nan)
            a_i = np.interp(common_z, z_cov, ap["area"], left=np.nan, right=np.nan)
            w_interp.append(w_i)
            d_interp.append(d_i)
            a_interp.append(a_i)
            
        w_mat = np.array(w_interp)
        d_mat = np.array(d_interp)
        a_mat = np.array(a_interp)
        
        # Robust median template across training population
        self.ref_z = common_z
        self.ref_w = np.nanmedian(w_mat, axis=0)
        self.ref_d = np.nanmedian(d_mat, axis=0)
        self.ref_a = np.nanmedian(a_mat, axis=0)
        
        # Fill any edges with linear extrapolation / smoothing
        valid = ~np.isnan(self.ref_w)
        self.ref_z = self.ref_z[valid]
        self.ref_w = self.ref_w[valid]
        self.ref_d = self.ref_d[valid]
        self.ref_a = self.ref_a[valid]
        
        # Smooth template
        self.ref_w = savgol_filter(self.ref_w, 9, 2)
        self.ref_d = savgol_filter(self.ref_d, 9, 2)
        self.ref_a = savgol_filter(self.ref_a, 9, 2)
        
        print(f"Canonical template built: range [{self.ref_z[0]:.1f}, {self.ref_z[-1]:.1f}] mm, {len(self.ref_z)} points.")

    def match_case(self, pts):
        """
        Finds the optimal longitudinal translation delta_z that aligns the patient's
        surface profile to the canonical template.
        Returns:
          c_z: the world z coordinate corresponding to the canonical zero (waist/mid-torso).
               Such that p_aligned_z = p_world_z - c_z.
        """
        prof = compute_1d_profiles(pts, self.z_step)
        if prof is None:
            # Fallback to bbox midpoint if profile cannot be extracted
            return 0.5 * (np.min(pts[:, 2]) + np.max(pts[:, 2]))
            
        pz = prof["z"]
        pw = prof["width"]
        pd = prof["depth"]
        pa = prof["area"]
        
        # Smooth patient profile
        pw_s = savgol_filter(pw, min(9, len(pw) if len(pw)%2==1 else len(pw)-1), 2) if len(pw) >= 5 else pw
        pd_s = savgol_filter(pd, min(9, len(pd) if len(pd)%2==1 else len(pd)-1), 2) if len(pd) >= 5 else pd
        
        # Search range for c_z: patient world z range
        # We want to find c_z such that (pz - c_z) matches ref_z
        z_min_w, z_max_w = np.min(pts[:, 2]), np.max(pts[:, 2])
        
        # Grid search over candidate c_z
        candidate_shifts = np.arange(z_min_w - 150.0, z_max_w + 150.0, 2.0)
        best_err = float("inf")
        best_cz = 0.5 * (z_min_w + z_max_w)
        
        # Normalize template features for scale invariance
        w_mean, w_std = np.mean(self.ref_w), np.std(self.ref_w) + 1e-6
        d_mean, d_std = np.mean(self.ref_d), np.std(self.ref_d) + 1e-6
        
        ref_w_norm = (self.ref_w - w_mean) / w_std
        ref_d_norm = (self.ref_d - d_mean) / d_std
        
        pw_norm = (pw_s - np.mean(pw_s)) / (np.std(pw_s) + 1e-6)
        pd_norm = (pd_s - np.mean(pd_s)) / (np.std(pd_s) + 1e-6)
        
        for cz in candidate_shifts:
            # Patient z in aligned coordinates:
            p_aligned_z = pz - cz
            # Find overlap with template range
            overlap = (p_aligned_z >= self.ref_z[0]) & (p_aligned_z <= self.ref_z[-1])
            if np.sum(overlap) < 10:
                continue
                
            # Interp template onto patient's overlapping points
            tw = np.interp(p_aligned_z[overlap], self.ref_z, ref_w_norm)
            td = np.interp(p_aligned_z[overlap], self.ref_z, ref_d_norm)
            
            # Feature shape distance (Normalized MSE + derivative matching)
            err_w = np.mean((pw_norm[overlap] - tw) ** 2)
            err_d = np.mean((pd_norm[overlap] - td) ** 2)
            
            # Coverage penalty: slightly prefer broader overlap
            frac_overlap = np.sum(overlap) / len(p_aligned_z)
            total_err = (0.6 * err_w + 0.4 * err_d) / (frac_overlap ** 0.5)
            
            if total_err < best_err:
                best_err = total_err
                best_cz = cz
                
        return float(best_cz)

def evaluate_alignment_method(name, get_center_fn, all_pts_world, tgt_w, tgt_m, sources, train_idx, val_idx, p104_idx):
    """
    Evaluates a candidate centering method on the full evaluation matrix.
    """
    N = len(sources)
    centers = np.zeros((N, 3), dtype=np.float32)
    for i in range(N):
        centers[i] = get_center_fn(all_pts_world[i], i)
        
    # Apply centering to targets
    tgt_aligned = np.full_like(tgt_w, np.nan)
    valid_mask = tgt_m == 1
    tgt_aligned[valid_mask] = tgt_w[valid_mask] - np.repeat(centers[:, np.newaxis, :], tgt_w.shape[1], axis=1)[valid_mask]
    
    # Check max round-trip error
    tgt_recon = np.full_like(tgt_w, np.nan)
    tgt_recon[valid_mask] = tgt_aligned[valid_mask] + np.repeat(centers[:, np.newaxis, :], tgt_w.shape[1], axis=1)[valid_mask]
    round_trip_max = float(np.max(np.abs(tgt_recon[valid_mask] - tgt_w[valid_mask])))
    
    # Cross-source target shift on primary 104
    v2_train = [i for i in train_idx if sources[i] == "v2"]
    ts_train = [i for i in train_idx if sources[i] == "totalsegmentator"]
    v2_val = [i for i in val_idx if sources[i] == "v2"]
    ts_val = [i for i in val_idx if sources[i] == "totalsegmentator"]
    
    # Compute Atlas on train
    def build_atlas(t_indices):
        atlas = np.full((tgt_w.shape[1], 3), np.nan, dtype=np.float32)
        sub_t = tgt_aligned[t_indices]
        sub_m = tgt_m[t_indices]
        for t_i in range(tgt_w.shape[1]):
            val_m = sub_m[:, t_i] == 1
            if np.sum(val_m) >= 3:
                atlas[t_i] = np.mean(sub_t[val_m, t_i], axis=0)
        return atlas
        
    def eval_atlas(atlas, val_indices, eval_targets):
        val_t = tgt_aligned[val_indices]
        val_m = tgt_m[val_indices]
        mres = []
        for t_i in eval_targets:
            if np.isnan(atlas[t_i]).any():
                continue
            valid = val_m[:, t_i] == 1
            if np.sum(valid) > 0:
                err = np.linalg.norm(val_t[valid, t_i] - atlas[t_i], axis=1)
                mres.append(float(np.mean(err)))
        return float(np.mean(mres)) if len(mres) > 0 else np.nan
        
    atlas_v2 = build_atlas(v2_train)
    atlas_ts = build_atlas(ts_train)
    atlas_pooled = build_atlas(train_idx)
    
    # Evaluate baselines
    mre_v2_v2 = eval_atlas(atlas_v2, v2_val, p104_idx)
    mre_ts_ts = eval_atlas(atlas_ts, ts_val, p104_idx)
    mre_v2_ts = eval_atlas(atlas_v2, ts_val, p104_idx)
    mre_ts_v2 = eval_atlas(atlas_ts, v2_val, p104_idx)
    mre_pool_v2 = eval_atlas(atlas_pooled, v2_val, p104_idx)
    mre_pool_ts = eval_atlas(atlas_pooled, ts_val, p104_idx)
    
    # Target shift between V2 and TS on train
    shifts = []
    dzs = []
    for t_i in p104_idx:
        v2_valid = (tgt_m[v2_train, t_i] == 1)
        ts_valid = (tgt_m[ts_train, t_i] == 1)
        if np.sum(v2_valid) >= 5 and np.sum(ts_valid) >= 5:
            mu_v2 = np.mean(tgt_aligned[v2_train][v2_valid, t_i], axis=0)
            mu_ts = np.mean(tgt_aligned[ts_train][ts_valid, t_i], axis=0)
            diff = np.linalg.norm(mu_v2 - mu_ts)
            shifts.append(float(diff))
            dzs.append(float(mu_v2[2] - mu_ts[2]))
            
    med_shift = float(np.median(shifts)) if len(shifts) > 0 else np.nan
    p90_shift = float(np.percentile(shifts, 90)) if len(shifts) > 0 else np.nan
    med_dz = float(np.median(dzs)) if len(dzs) > 0 else np.nan
    
    print(f"\n==========================================")
    print(f"EVALUATION: {name}")
    print(f"==========================================")
    print(f"  V2 -> V2 Atlas MRE:      {mre_v2_v2:.2f} mm")
    print(f"  TS -> TS Atlas MRE:      {mre_ts_ts:.2f} mm")
    print(f"  V2 -> TS Atlas MRE:      {mre_v2_ts:.2f} mm")
    print(f"  TS -> V2 Atlas MRE:      {mre_ts_v2:.2f} mm")
    print(f"  Pooled -> V2 Atlas MRE:  {mre_pool_v2:.2f} mm")
    print(f"  Pooled -> TS Atlas MRE:  {mre_pool_ts:.2f} mm")
    print(f"  Median Cross-Source Shift: {med_shift:.2f} mm (P90: {p90_shift:.2f} mm)")
    print(f"  Median Delta Z (V2 - TS):  {med_dz:.2f} mm")
    print(f"  Round-trip max error:      {round_trip_max:.6f} mm")
    
    return {
        "method": name,
        "mre_v2_v2": mre_v2_v2,
        "mre_ts_ts": mre_ts_ts,
        "mre_v2_ts": mre_v2_ts,
        "mre_ts_v2": mre_ts_v2,
        "mre_pool_v2": mre_pool_v2,
        "mre_pool_ts": mre_pool_ts,
        "med_shift": med_shift,
        "p90_shift": p90_shift,
        "med_dz": med_dz,
        "round_trip_max": round_trip_max
    }

def main():
    print("Loading data for comprehensive external anchor ablation...")
    data_path = repo_root / "sharon" / "dataset_v3" / "pointclouds_v3.pt"
    data = torch.load(data_path, weights_only=False)
    
    pts_4096 = data["points_centered_4096"].numpy()
    surf_c = data["surface_centers"].numpy()
    tgt_w = data["targets_world"].numpy()
    tgt_m = data["target_masks"].numpy()
    sources = data["source_datasets"]
    N = len(sources)
    
    with open(repo_root / "sharon" / "dataset_v3" / "splits_v3_iid.json", "r") as f:
        splits = json.load(f)
    train_idx = splits["train_indices"]
    val_idx = splits["val_indices"]
    
    onto_path = repo_root / "sharon" / "dataset_v3" / "target_ontology_v3.csv"
    with open(onto_path, "r") as f:
        ontology = list(csv.DictReader(f))
    p104_idx = [i for i, r in enumerate(ontology) if r.get("include_primary") == "YES"]
    
    all_pts_world = [pts_4096[i] + surf_c[i:i+1] for i in range(N)]
    train_pts = [all_pts_world[i] for i in train_idx]
    train_srcs = [sources[i] for i in train_idx]
    
    # 1. Baseline: Bbox Midpoint
    def fn_bbox(pts, idx):
        return 0.5 * (np.min(pts, axis=0) + np.max(pts, axis=0))
        
    # 2. Surface Centroid (Mean)
    def fn_mean(pts, idx):
        return np.mean(pts, axis=0)
        
    # 3. Waist Local Minimum Area
    def fn_waist(pts, idx):
        cx = 0.5 * (np.percentile(pts[:, 0], 2) + np.percentile(pts[:, 0], 98))
        cy = 0.5 * (np.percentile(pts[:, 1], 2) + np.percentile(pts[:, 1], 98))
        z_min, z_max = np.min(pts[:, 2]), np.max(pts[:, 2])
        prof = compute_1d_profiles(pts, 5.0)
        if prof is not None and len(prof["z"]) > 5:
            z = prof["z"]
            search = (z >= z_min + 0.15 * (z_max - z_min)) & (z <= z_min + 0.70 * (z_max - z_min))
            if np.sum(search) > 3:
                sub_z = z[search]
                sub_a = prof["area"][search]
                cz = float(sub_z[np.argmin(sub_a)])
                return np.array([cx, cy, cz], dtype=np.float32)
        return np.array([cx, cy, 0.5 * (z_min + z_max)], dtype=np.float32)

    # 4. Multi-Feature 1D Torso Template Matcher
    matcher = TorsoTemplateMatcher(z_step=5.0)
    matcher.build_template_from_train(train_pts, train_srcs)
    
    def fn_template_matcher(pts, idx):
        cx = 0.5 * (np.percentile(pts[:, 0], 2) + np.percentile(pts[:, 0], 98))
        cy = 0.5 * (np.percentile(pts[:, 1], 2) + np.percentile(pts[:, 1], 98))
        cz = matcher.match_case(pts)
        return np.array([cx, cy, cz], dtype=np.float32)

    results = []
    results.append(evaluate_alignment_method("01_bbox_midpoint_baseline", fn_bbox, all_pts_world, tgt_w, tgt_m, sources, train_idx, val_idx, p104_idx))
    results.append(evaluate_alignment_method("02_surface_mean_centroid", fn_mean, all_pts_world, tgt_w, tgt_m, sources, train_idx, val_idx, p104_idx))
    results.append(evaluate_alignment_method("03_waist_narrowing_inflection", fn_waist, all_pts_world, tgt_w, tgt_m, sources, train_idx, val_idx, p104_idx))
    results.append(evaluate_alignment_method("04_1D_torso_profile_matcher", fn_template_matcher, all_pts_world, tgt_w, tgt_m, sources, train_idx, val_idx, p104_idx))

    # Save ablation table
    out_csv = repo_root / "reports" / "v3_alignment" / "02_anchor_ablation.csv"
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
        writer.writeheader()
        for r in results:
            writer.writerow(r)
    print(f"\nAblation results saved to {out_csv}")

if __name__ == "__main__":
    main()
