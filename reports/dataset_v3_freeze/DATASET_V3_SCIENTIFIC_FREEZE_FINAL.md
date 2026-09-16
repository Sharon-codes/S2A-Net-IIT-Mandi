# DATASET V3 SCIENTIFIC FREEZE REPORT
**Date:** 2026-09-06 18:01:24  
**Status:** FROZEN  
**Dataset Version:** V3.0.0-FROZEN  
**Dataset SHA256:** `2ce1f1f1d098afaf62a9a4a14c7eaea9b96689aeee5b6bf9656508d7fc8b5aaf`  

---

## 1. Executive Summary

Dataset V3 has been locked and cryptographically frozen into an immutable scientific release.
All split memberships, subject assignments, target ontology mappings, surface point representations, and canonical body-frame alignments are frozen. Zero coordinates, split memberships, or target masks may change during downstream model training.

---

## 2. Frozen Dataset Specifications

- **Total Subjects:** 1668
- **Training Cohort:** 1334 subjects
- **Validation Cohort:** 166 subjects (Immutable hash: `2c33f0f3af4b...`)
- **Test Cohort:** 168 subjects (LOCKED hash: `fff5ae6e5339...`)
- **Primary Target Count:** 104 Benchmark-Primary Targets
- **Coordinate Metric System:** Millimeters (Sub-micrometer round-trip precision: `0.000122 mm`)
- **Global Training Scale ($S_{global}$):** `500.0 mm`
- **Canonical Axes:**
  - $+X$: Patient Right (Dextral)
  - $+Y$: Patient Anterior (Ventral)
  - $+Z$: Patient Superior (Cranial)

---

## 3. Nested Training Subsets Invariant

The source-stratified nested training subsets satisfy the strict inclusion invariant:
$$S_{350} \subset S_{500} \subset S_{750} \subset S_{1000} \subset S_{1334}$$

| Subset | Total Size | V2 Cases | TotalSegmentator Cases | Ratio TS |
| :--- | :---: | :---: | :---: | :---: |
| **$S_{350}$** | 350 | 88 | 262 | 74.9% |
| **$S_{500}$** | 500 | 126 | 374 | 74.8% |
| **$S_{750}$** | 750 | 189 | 561 | 74.8% |
| **$S_{1000}$** | 1000 | 252 | 748 | 74.8% |
| **$S_{1334}$ (Full)** | 1334 | 336 | 998 | 74.8% |

---

## 4. Final Freeze Verification Matrix

```text
DATASET V3 FREEZE STATUS:
PASS

Subjects:
1668

Train:
1334

Validation:
166

Test:
168

Benchmark-primary targets:
104

Coordinate round-trip max:
0.000122 mm

Cross-split exact duplicates:
0 / 1668

Cross-split confirmed near-duplicates:
0 / 1668

Canonical axes:
+X = Patient Right
+Y = Patient Anterior
+Z = Patient Superior

Global training scale:
500.0 mm

Nested scaling subsets valid:
YES

Validation set frozen:
YES

Test set locked:
YES

DATASET V3:
FROZEN
```
