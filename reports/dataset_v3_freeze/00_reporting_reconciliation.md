# DATASET V3 PRE-TRAINING REPORTING RECONCILIATION

## 1. Authoritative Pre-Alignment Baseline Matrix Resolution

During Phase 8B alignment investigations, two distinct sets of pre-alignment numbers appeared in prose reports:
1. **Pre-Training Audit Matrix (Historical Uncorrected Ontology):**
   - V2 $\to$ TS Atlas MRE = **173.43 mm**
   - Evaluated *before* correcting the ontology target ID mapping for V2 targets > 24 (where `femur_right` in V2 was erroneously querying label 70 `humerus_right`).
2. **Authoritative Pre-Alignment Matrix (Machine-Readable CSV with Correct Ontology):**
   - V2 $\to$ TS Atlas MRE = **110.59 mm**
   - Evaluated on raw unaligned bounding-box centered data *after* fixing ontology target IDs.

**Resolution:** The authoritative pre-alignment matrix for Dataset V3 is defined on the raw unaligned data with the corrected ontology (`110.59 mm` V2 $\to$ TS, `94.27 mm` TS $\to$ V2, `81.72 mm` Pooled $\to$ V2, `91.38 mm` Pooled $\to$ TS).

## 2. Precision and Arithmetic Clarifications

1. **Reduction Calculation:**
   - The drop from **110.59 mm $\to$ 77.41 mm** (V2 $\to$ TS Atlas MRE) under canonical alignment is a direct reduction of **33.18 mm**.
   - The overall reduction from the raw pre-ontology audit state (173.43 mm $\to$ 77.41 mm) is **96.02 mm**.
2. **Round-Trip Precision:**
   - The deterministic coordinate round-trip reconstruction error of **0.00012207 mm** is correctly formatted as **$< 0.001\text{ mm}$** (sub-micrometer precision).
3. **Femur-Right Source Shift Reconciliation:**
   - In uncorrected pre-audit data, `femur_right` displayed an apparent shift of **468.47 mm** due to label index 70 (`humerus_right` shoulder bone) being read instead of label 76 (`femur_right` thigh bone).
   - Once target ontology IDs were unified across sources, the true machine-readable shift of `femur_right` was **12.86 mm** before alignment and **18.09 mm** after canonical body-frame alignment.

---
**Status:** RECONCILED & AUTHORITATIVE
