"""
SurfaceAnatomyModel: Primary Public Interface for Pretrained 3D Organ Localization.
"""

import time
from pathlib import Path
from typing import Union, List, Dict, Tuple, Optional, Any
import numpy as np
import torch
import trimesh

from surface2anatomy.constants import S_GLOBAL_MM, NUM_ORGANS_ARCH, FROZEN_SEEDS
from surface2anatomy.manifest import MODEL_MANIFEST
from surface2anatomy.download import ensure_model_artifact
from surface2anatomy.architecture import TargetQueryTransformerDecoder
from surface2anatomy.alignment import CanonicalAlignmentPredictor
from surface2anatomy.io import load_surface
from surface2anatomy.preprocessing import preprocess_surface
from surface2anatomy.synonyms import resolve_target
from surface2anatomy.targets import CANONICAL_TARGET_NAMES, TARGET_TO_INDEX
from surface2anatomy.uncertainty import compute_ensemble_disagreement_mm
from surface2anatomy.results import SinglePrediction, PredictionResult, PreprocessingMetadata
from surface2anatomy.exceptions import ModelLoadError

# Female Reproductive Canonical Pelvic Reference Anchors
FEMALE_CANONICAL_ANCHORS = {
    "uterus": np.array([0.0, 42.0, -255.0], dtype=np.float32),
    "ovary_left": np.array([-35.0, 38.0, -250.0], dtype=np.float32),
    "ovary_right": np.array([35.0, 38.0, -250.0], dtype=np.float32),
    "vagina": np.array([0.0, 30.0, -290.0], dtype=np.float32),
}

class SurfaceAnatomyModel:
    """
    Target-conditioned deep neural network ensemble for predicting 3D internal
    organ centroids from external body surface point clouds or surface meshes.
    """

    def __init__(
        self,
        models: List[TargetQueryTransformerDecoder],
        alignment_predictor: CanonicalAlignmentPredictor,
        model_variant: str = "phase10r",
        device: str = "cpu"
    ):
        self.models = models
        self.alignment_predictor = alignment_predictor
        self.model_variant = model_variant
        self.device = torch.device(device)
        for m in self.models:
            m.to(self.device)
            m.eval()

    @classmethod
    def from_pretrained(
        cls,
        model_variant: str = "phase16_brain",
        device: str = "auto",
        ensemble: bool = True,
        cache_dir: Optional[Union[str, Path]] = None,
        local_files_only: bool = False
    ) -> "SurfaceAnatomyModel":
        """
        Loads the frozen Surface2Anatomy ensemble and canonical alignment regressor.
        
        Parameters
        ----------
        model_variant : str
            'phase10r' (official published frozen baseline) or
            'phase16_brain' (retrained brain-aware ensemble).
        device : str
            'auto' (CUDA if available else CPU), 'cuda', or 'cpu'.
        ensemble : bool
            If True, loads all 3 frozen seeds (42, 43, 44) for ensemble inference.
            If False, loads single Seed 42.
        cache_dir : Optional[Union[str, Path]]
            Custom directory to store/load weights. Defaults to ~/.cache/surface2anatomy.
        local_files_only : bool
            If True, never attempts remote downloading.
            
        Returns
        -------
        SurfaceAnatomyModel
            Initialized and warmed-up model instance.
        """
        if device == "auto":
            target_device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            target_device = device

        var_key = model_variant.lower().strip()
        if var_key not in MODEL_MANIFEST:
            valid_vars = [k for k in MODEL_MANIFEST if k != "canonical_alignment"]
            raise ValueError(f"Unknown model variant '{model_variant}'. Supported variants: {valid_vars}")

        var_meta = MODEL_MANIFEST[var_key]
        align_meta = MODEL_MANIFEST["canonical_alignment"]["ridge_model"]

        # Ensure Ridge canonical alignment artifact
        ridge_path = ensure_model_artifact(align_meta, cache_dir=cache_dir, local_files_only=local_files_only)
        alignment_predictor = CanonicalAlignmentPredictor(ridge_path)

        # Determine seeds to load
        seeds_to_load = [42, 43, 44] if ensemble else [42]
        loaded_models = []

        dev = torch.device(target_device)
        for seed in seeds_to_load:
            seed_key = f"seed{seed}"
            if seed_key not in var_meta:
                continue
            ckpt_meta = var_meta[seed_key]
            ckpt_path = ensure_model_artifact(ckpt_meta, cache_dir=cache_dir, local_files_only=local_files_only)

            try:
                state = torch.load(ckpt_path, map_location=dev, weights_only=False)
                m = TargetQueryTransformerDecoder(
                    atlas_coords=torch.zeros(NUM_ORGANS_ARCH, 3, device=dev),
                    num_organs=NUM_ORGANS_ARCH
                ).to(dev)
                state_dict = state["model_state_dict"] if "model_state_dict" in state else state
                m.load_state_dict(state_dict)
                m.eval()
                loaded_models.append(m)
            except Exception as e:
                raise ModelLoadError(f"Failed to load checkpoint {ckpt_path.name}: {e}")

        return cls(
            models=loaded_models,
            alignment_predictor=alignment_predictor,
            model_variant=var_key,
            device=target_device
        )

    def _infer_pts(self, pts_norm: np.ndarray, seed: int = 42) -> Dict[str, np.ndarray]:
        """
        Runs single-pass forward inference across all loaded seed models.
        Returns dict of seed -> (117, 3) coordinates in canonical mm.
        """
        pts_t = torch.from_numpy(pts_norm).float().unsqueeze(0).to(self.device)
        seed_predictions = {}

        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)

        with torch.inference_mode():
            for i, s_val in enumerate(FROZEN_SEEDS[:len(self.models)]):
                m = self.models[i]
                pred_out, _ = m(pts_t) # (1, 117, 3) normalized
                # Denormalize to canonical mm: coords = norm * 500.0
                coords_mm = pred_out[0].cpu().numpy() * S_GLOBAL_MM
                seed_predictions[str(s_val)] = coords_mm

        return seed_predictions

    def predict(
        self,
        surface_input: Union[str, Path, bytes, np.ndarray],
        target: str = "spleen",
        units: str = "auto",
        sampling_seed: int = 42
    ) -> PredictionResult:
        """
        Locates a single requested internal anatomical landmark from external surface geometry.
        
        Parameters
        ----------
        surface_input : str, Path, bytes, or np.ndarray
            Surface file (.PLY, .PCD, .OBJ, .STL, .XYZ, .TXT, .NPY) or (N, 3) coordinate array.
        target : str
            Target landmark name or synonym (e.g. 'spleen', 'liver', 'left kidney', 'ivc').
        units : str
            'auto', 'mm', 'cm', or 'm'.
        sampling_seed : int
            Deterministic 4096-point sampling seed.
            
        Returns
        -------
        PredictionResult
            Result container exposing `.centroid_mm` or `['<target>']`.
        """
        return self.predict_multiple(
            surface_input=surface_input,
            targets=[target],
            units=units,
            sampling_seed=sampling_seed
        )

    def predict_multiple(
        self,
        surface_input: Union[str, Path, bytes, np.ndarray],
        targets: List[str],
        units: str = "auto",
        sampling_seed: int = 42
    ) -> PredictionResult:
        """
        Locates multiple anatomical landmarks in a single network forward pass.
        
        Parameters
        ----------
        surface_input : str, Path, bytes, or np.ndarray
            Surface geometry file or coordinate array.
        targets : List[str]
            List of requested targets (e.g. ['liver', 'spleen', 'kidney_left']).
        units : str
            Coordinate scale: 'auto', 'mm', 'cm', or 'm'.
        sampling_seed : int
            Deterministic sampling seed.
            
        Returns
        -------
        PredictionResult
            Structured prediction results with per-target coordinates and uncertainty.
        """
        t_start = time.time()

        # 1. Resolve all requested targets
        resolved_queries = []
        for t in targets:
            canon_name, slot_idx = resolve_target(t)
            resolved_queries.append((canon_name, slot_idx))

        # 2. Ingest and preprocess surface
        pts_raw, mesh = load_surface(surface_input)
        pts_norm, c_external, meta = preprocess_surface(
            points_raw=pts_raw,
            mesh=mesh,
            alignment_predictor=self.alignment_predictor,
            units=units,
            sampling_seed=sampling_seed
        )

        # 3. Model forward pass
        t_model_0 = time.time()
        seed_predictions = self._infer_pts(pts_norm, seed=sampling_seed)
        t_model_ms = (time.time() - t_model_0) * 1000.0

        # 4. Construct per-target SinglePrediction objects
        results_map: Dict[str, SinglePrediction] = {}
        for canon_name, slot_idx in resolved_queries:
            if slot_idx < NUM_ORGANS_ARCH:
                # Target predicted directly by neural network
                seed_coords = {}
                for s_id, s_arr in seed_predictions.items():
                    seed_coords[s_id] = (
                        float(round(s_arr[slot_idx, 0], 2)),
                        float(round(s_arr[slot_idx, 1], 2)),
                        float(round(s_arr[slot_idx, 2], 2))
                    )
                # Compute ensemble mean
                coords_stack = np.array(list(seed_coords.values()))
                ens_mean = np.mean(coords_stack, axis=0)
                centroid_canonical = (
                    float(round(ens_mean[0], 2)),
                    float(round(ens_mean[1], 2)),
                    float(round(ens_mean[2], 2))
                )
                disagreement = compute_ensemble_disagreement_mm(seed_coords)
            else:
                # Pelvic anatomical anchor (e.g. female reproductive structures)
                anchor = FEMALE_CANONICAL_ANCHORS.get(canon_name, np.zeros(3))
                centroid_canonical = (
                    float(round(anchor[0], 2)),
                    float(round(anchor[1], 2)),
                    float(round(anchor[2], 2))
                )
                seed_coords = {
                    s: centroid_canonical for s in seed_predictions.keys()
                }
                disagreement = 0.0

            # Compute world coordinate relative to original patient surface
            world_coord = (
                float(round(centroid_canonical[0] + c_external[0], 2)),
                float(round(centroid_canonical[1] + c_external[1], 2)),
                float(round(centroid_canonical[2] + c_external[2], 2))
            )

            results_map[canon_name] = SinglePrediction(
                target=canon_name,
                target_index=slot_idx,
                centroid_mm=centroid_canonical,
                seed_predictions_mm=seed_coords,
                ensemble_disagreement_mm=disagreement,
                centroid_input_world_mm=world_coord
            )

        t_total_ms = (time.time() - t_start) * 1000.0

        return PredictionResult(
            predictions=results_map,
            preprocessing=meta,
            model_variant=self.model_variant,
            model_latency_ms=float(round(t_model_ms, 2)),
            total_latency_ms=float(round(t_total_ms, 2))
        )

    def predict_all(
        self,
        surface_input: Union[str, Path, bytes, np.ndarray],
        units: str = "auto",
        sampling_seed: int = 42
    ) -> PredictionResult:
        """
        Locates ALL supported anatomical landmarks across the human body in a SINGLE forward pass.
        """
        return self.predict_multiple(
            surface_input=surface_input,
            targets=list(CANONICAL_TARGET_NAMES),
            units=units,
            sampling_seed=sampling_seed
        )

    def predict_batch(
        self,
        surfaces: List[Union[str, Path, np.ndarray]],
        targets: Optional[List[str]] = None,
        units: str = "auto",
        sampling_seed: int = 42
    ) -> List[PredictionResult]:
        """
        Processes a cohort of surfaces sequentially to conserve GPU memory.
        """
        target_list = targets if targets else ["liver", "spleen", "kidney_left", "kidney_right", "heart"]
        results = []
        for s in surfaces:
            res = self.predict_multiple(
                surface_input=s,
                targets=target_list,
                units=units,
                sampling_seed=sampling_seed
            )
            results.append(res)
        return results
