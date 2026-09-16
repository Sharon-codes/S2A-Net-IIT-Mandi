import os
import sys
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "sharon"))

import labels
import totalsegmentator.map_to_binary

def main():
    print("=" * 80)
    print("PHASE 8A - STAGES 6 TO 10: SOURCE LABEL TABLES & CANONICAL ONTOLOGY")
    print("=" * 80)

    reports_dir = repo_root / "reports" / "phase8a"
    reports_dir.mkdir(parents=True, exist_ok=True)
    v3_dir = repo_root / "sharon" / "dataset_v3"
    v3_dir.mkdir(parents=True, exist_ok=True)

    # -------------------------------------------------------------------------
    # 1. Dataset V2 Label Table
    # -------------------------------------------------------------------------
    v2_classes = labels.TOTAL_CLASSES_121
    v2_csv = reports_dir / "labels_v2.csv"
    with open(v2_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["source_label_id", "source_label_name", "source_description", "annotation_provenance"])
        for name, idx in sorted(v2_classes.items(), key=lambda x: x[1]):
            writer.writerow([idx, name, f"AMOS 2022 / Dataset V2 {name}", "MANUAL_OR_EXPERT_VALIDATED"])
    print(f"Generated: {v2_csv} ({len(v2_classes)} classes)")

    # -------------------------------------------------------------------------
    # 2. TotalSegmentator Label Table
    # -------------------------------------------------------------------------
    totalseg_classes = totalsegmentator.map_to_binary.class_map["total"]
    totalseg_csv = reports_dir / "labels_totalsegmentator.csv"
    with open(totalseg_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["source_label_id", "source_label_name", "source_description", "annotation_provenance"])
        for idx, name in sorted(totalseg_classes.items(), key=lambda x: int(x[0])):
            writer.writerow([idx, name, f"TotalSegmentator total task structure {name}", "EXPERT_VALIDATED_NNUNET"])
    print(f"Generated: {totalseg_csv} ({len(totalseg_classes)} classes)")

    # -------------------------------------------------------------------------
    # 3. DAP Atlas Label Table
    # -------------------------------------------------------------------------
    dap_csv_in = repo_root / "data_external" / "dap_atlas" / "raw" / "label_name.csv"
    dap_classes = {}
    if dap_csv_in.exists():
        with open(dap_csv_in, "r", encoding="utf-8") as f:
            r = csv.reader(f)
            next(r) # skip header
            for row in r:
                if len(row) >= 2:
                    dap_classes[int(row[0].strip())] = row[1].strip()

    # Append DAP extra vessel classes 132-144
    extra_dap = {
        132: "nasal cavity",
        133: "ARTERY_COMMONCAROTID_RECHTS",
        134: "ARTERY_COMMONCAROTID_LINKS",
        136: "ARTERY_INTERNALCAROTID_RECHTS",
        137: "ARTERY_INTERNALCAROTID_LINKS",
        138: "IJV_RECHTS",
        139: "IJV_LINKS",
        140: "ARTERY_BRACHIOCEPHALIC",
        141: "VEIN_BRACHIOCEPHALIC_RECHTS",
        142: "VEIN_BRACHIOCEPHALIC_LINKS",
        143: "ARTERY_SUBCLAVIAN_RECHTS",
        144: "ARTERY_SUBCLAVIAN_LINKS"
    }
    for k, v in extra_dap.items():
        if k not in dap_classes:
            dap_classes[k] = v

    dap_csv = reports_dir / "labels_dap.csv"
    with open(dap_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["source_label_id", "source_label_name", "source_description", "annotation_provenance"])
        for idx, name in sorted(dap_classes.items(), key=lambda x: x[0]):
            writer.writerow([idx, name, f"DAP Atlas 142-class structure {name}", "AUTOMATIC_POSTPROCESSED_NNUNET"])
    print(f"Generated: {dap_csv} ({len(dap_classes)} classes)")

    # -------------------------------------------------------------------------
    # 4. Canonical V3 Target Ontology
    # -------------------------------------------------------------------------
    # Load V2 primary 107 targets
    tiers_path = repo_root / "reports" / "phase2" / "01_evaluation_cohort_tiers.csv"
    v2_primary_names = set()
    if tiers_path.exists():
        with open(tiers_path) as f:
            for r in csv.DictReader(f):
                if r["tier"] in ["TIER_A", "TIER_B"]:
                    idx = int(r["target_index"])
                    # find in labels.TOTAL_CLASSES_121
                    for k, v in v2_classes.items():
                        if v == idx:
                            v2_primary_names.add(k)

    print(f"V2 primary baseline targets count: {len(v2_primary_names)}")

    # Inverted rib dictionary for DAP:
    # In DAP, costa 1 = rib 12, costa 12 = rib 1!
    # costa k <-> rib (13 - k)
    dap_rib_map = {}
    for k in range(1, 13):
        anat_rib = 13 - k
        dap_rib_map[f"costa {k} left"] = f"rib_left_{anat_rib}"
        dap_rib_map[f"costa {k} right"] = f"rib_right_{anat_rib}"

    # Build comprehensive ontology mapping
    ontology_path = v3_dir / "target_ontology_v3.csv"
    
    # We define canonical targets starting with all 117 TotalSegmentator targets + V2 targets + key DAP targets
    canonical_dict = {}
    
    # Base on TotalSegmentator's 117 standardized anatomical names
    for ts_id, ts_name in sorted(totalseg_classes.items(), key=lambda x: int(x[0])):
        ts_id = int(ts_id)
        # Determine anatomical group & laterality
        group = "OTHER"
        laterality = "NONE"
        if "left" in ts_name:
            laterality = "LEFT"
        elif "right" in ts_name:
            laterality = "RIGHT"

        if "vertebrae" in ts_name or "sacrum" in ts_name or "rib" in ts_name or "clavicle" in ts_name or "scapula" in ts_name or "hip" in ts_name or "femur" in ts_name or "sternum" in ts_name:
            group = "SKELETAL"
        elif "lung" in ts_name or "heart" in ts_name or "trachea" in ts_name or "esophagus" in ts_name:
            group = "THORACIC"
        elif "liver" in ts_name or "spleen" in ts_name or "pancreas" in ts_name or "kidney" in ts_name or "gallbladder" in ts_name or "stomach" in ts_name or "adrenal" in ts_name:
            group = "UPPER_ABDOMINAL"
        elif "colon" in ts_name or "duodenum" in ts_name or "bowel" in ts_name or "bladder" in ts_name or "prostate" in ts_name or "rectum" in ts_name:
            group = "LOWER_ABDOMINAL_PELVIC"
        elif "aorta" in ts_name or "artery" in ts_name or "vein" in ts_name or "cava" in ts_name or "gluteus" in ts_name or "psoas" in ts_name or "iliopsoas" in ts_name:
            group = "MUSCULOSKELETAL_VASCULAR"

        # Check V2 match
        v2_id = ""
        v2_name = ""
        if ts_name in v2_classes:
            v2_name = ts_name
            v2_id = v2_classes[ts_name]
        
        # Check DAP match
        dap_id = ""
        dap_name = ""
        mapping_conf = "EXACT" if v2_name else "SEMANTIC_EQUIVALENT"

        # Handle rib conversion for DAP
        if ts_name.startswith("rib_"):
            # find which costa maps to this rib
            for costa_dap, target_rib in dap_rib_map.items():
                if target_rib == ts_name:
                    # find id of costa_dap in dap_classes
                    for d_id, d_name in dap_classes.items():
                        if d_name.lower() == costa_dap.lower():
                            dap_name = d_name
                            dap_id = d_id
                            break
            mapping_conf = "SEMANTIC_EQUIVALENT"
        else:
            # Direct name matching
            ts_norm = ts_name.replace("_", " ").lower()
            for d_id, d_name in dap_classes.items():
                dn = d_name.lower()
                if dn == ts_norm or dn == ts_name.lower():
                    dap_name = d_name
                    dap_id = d_id
                    break
            # Specific mappings for common naming differences
            if not dap_name:
                alt_names = {
                    "urinary_bladder": "bladder",
                    "inferior_vena_cava": "inferior vena cava",
                    "portal_vein_and_splenic_vein": "portal vein and splenic vein",
                    "iliac_artery_left": "iliac artery left",
                    "iliac_artery_right": "iliac artery right",
                    "iliac_vena_left": "iliac vena left",
                    "iliac_vena_right": "iliac vena right",
                    "thyroid_gland": "thyroid",
                    "gluteus_maximus_left": "gluteus maximus",
                    "gluteus_maximus_right": "gluteus maximus",
                    "autochthon_left": "autochthon",
                    "autochthon_right": "autochthon",
                    "iliopsoas_left": "iliopsoas",
                    "iliopsoas_right": "iliopsoas"
                }
                if ts_name in alt_names:
                    tgt = alt_names[ts_name]
                    for d_id, d_name in dap_classes.items():
                        if d_name.lower() == tgt.lower() or d_name.lower() == f"{tgt} left" or d_name.lower() == f"{tgt} right":
                            dap_name = d_name
                            dap_id = d_id
                            break

        # Decide if primary:
        # We prefer keeping as many of the verified 107 primary targets as possible!
        is_primary = False
        if v2_name and v2_name in v2_primary_names and ts_name:
            is_primary = True
        elif v2_name and not v2_primary_names and ts_name:
            is_primary = True

        note = ""
        if ts_name.startswith("rib_"):
            note = f"DAP costa numbered bottom-to-top; mapped via {dap_name}"

        canonical_dict[ts_name] = {
            "canonical_target_id": ts_id,
            "canonical_name": ts_name,
            "v2_target_name": v2_name,
            "v2_target_id": v2_id,
            "totalsegmentator_target_name": ts_name,
            "totalsegmentator_target_id": ts_id,
            "dap_target_name": dap_name,
            "dap_target_id": dap_id,
            "anatomical_group": group,
            "laterality": laterality,
            "structure_type": "ORGAN_OR_BONE",
            "centroid_definition": "PHYSICAL_CENTER_OF_MASS_MM",
            "mapping_confidence": mapping_conf if (dap_name or v2_name) else "UNAVAILABLE",
            "include_primary": "YES" if is_primary else "NO",
            "notes": note
        }

    # Write target_ontology_v3.csv
    cols = [
        "canonical_target_id", "canonical_name",
        "v2_target_name", "v2_target_id",
        "totalsegmentator_target_name", "totalsegmentator_target_id",
        "dap_target_name", "dap_target_id",
        "anatomical_group", "laterality", "structure_type",
        "centroid_definition", "mapping_confidence", "include_primary", "notes"
    ]

    primary_count = 0
    with open(ontology_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        for item in canonical_dict.values():
            writer.writerow(item)
            if item["include_primary"] == "YES":
                primary_count += 1

    print(f"Generated Canonical Target Ontology: {ontology_path}")
    print(f"Total Canonical Targets: {len(canonical_dict)}")
    print(f"Primary Targets V3:     {primary_count}")

if __name__ == "__main__":
    main()
