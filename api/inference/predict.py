import time
import torch
import numpy as np
from typing import Dict, List, Any, Optional
from api.inference.model_loader import get_models
from api.inference.uncertainty import compute_uncertainty
from api.utils.target_catalog import resolve_target, CANONICAL_TARGET_NAMES, TARGET_NAME_TO_INDEX

S_GLOBAL_MM = 500.0

def predict_single_or_multi(
    pts_norm: np.ndarray,
    c_external: np.ndarray,
    targets: List[str],
    model_variant: str = "phase10r"
) -> Dict[str, Any]:
    """
    Performs one unified model pass across the 3-model ensemble and extracts
    predictions for all requested targets.
    
    Avoids redundant forward passes.
    """
    models = get_models(model_variant)
    device = next(models[0].parameters()).device
    
    # Input tensor shape: (1, 4096, 3)
    pts_t = torch.from_numpy(pts_norm).float().unsqueeze(0).to(device)
    
    t0 = time.time()
    seed_outputs: Dict[str, np.ndarray] = {}
    
    # Ensure reproducible evaluation / deterministic FPS sampling
    torch.manual_seed(42)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(42)
        
    with torch.no_grad():
        for i, s in enumerate([42, 43, 44]):
            m = models[i]
            p_out, _ = m(pts_t)
            # p_out: (1, 117, 3) normalized
            seed_outputs[str(s)] = p_out[0].cpu().numpy() * S_GLOBAL_MM # Canonical mm
            
    dt_ms = (time.time() - t0) * 1000.0
    
    # Compute ensemble average across all 117 slots
    ens_canonical = np.mean([seed_outputs["42"], seed_outputs["43"], seed_outputs["44"]], axis=0) # (117, 3)
    
    results = {}
    for t_query in targets:
        resolved = resolve_target(t_query)
        if resolved is None:
            continue
        canon_name, slot_idx = resolved
        
        # Coordinates in canonical frame
        canon_coords = ens_canonical[slot_idx].tolist()
        
        # Coordinates in original input world frame
        world_coords = (ens_canonical[slot_idx] + c_external).tolist()
        
        # Seed predictions for this specific target
        seeds_t = {
            "42": seed_outputs["42"][slot_idx].tolist(),
            "43": seed_outputs["43"][slot_idx].tolist(),
            "44": seed_outputs["44"][slot_idx].tolist()
        }
        
        # Disagreement / uncertainty
        unc_mm, unc_level = compute_uncertainty(
            {k: np.array(v) for k, v in seeds_t.items()},
            ens_canonical[slot_idx]
        )
        
        results[canon_name] = {
            "target": canon_name,
            "target_index": slot_idx,
            "centroid_canonical_mm": [round(c, 2) for c in canon_coords],
            "centroid_input_world_mm": [round(w, 2) for w in world_coords],
            "seed_predictions_mm": {k: [round(x, 2) for x in v] for k, v in seeds_t.items()},
            "ensemble_prediction_mm": [round(c, 2) for c in canon_coords],
            "uncertainty_mm": unc_mm,
            "uncertainty_level": unc_level
        }
        
    return {
        "results": results,
        "model_latency_ms": round(dt_ms, 2)
    }
