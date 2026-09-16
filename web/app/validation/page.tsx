import React from "react";
import { CheckCircle2, TrendingDown, Award, ShieldAlert, Cpu, Layers, EyeOff, BookOpen, BarChart3 } from "lucide-react";

export default function ValidationPage() {
  // 1. SOTA Deep Learning Comparison
  const sotaBaselines = [
    { id: "C0", family: "Spatial Prior", model: "Population Atlas", desc: "Zero-parameter mean organ coordinates from training cohort", mre: "65.97 mm", median: "50.12 mm", p90: "115.1 mm", sdr20: "12.2%" },
    { id: "C1", family: "Classical Linear", model: "Linear Ridge Regressor", desc: "Direct mapping from 4096 flattened points to 104 targets", mre: "63.74 mm", median: "49.98 mm", p90: "115.2 mm", sdr20: "10.2%" },
    { id: "C5", family: "Shape Model", model: "Statistical Shape Model (SSM/PCA)", desc: "Surface PCA (64 principal components) + linear regression", mre: "52.56 mm", median: "39.86 mm", p90: "91.07 mm", sdr20: "17.3%" },
    { id: "C2", family: "Deep Learning Point Cloud", model: "PointNet++ Direct Regressor", desc: "Multi-scale set abstraction + MLP coordinate regressor (3-seed ensemble)", mre: "39.31 mm", median: "27.87 mm", p90: "65.04 mm", sdr20: "31.3%" },
    { id: "C3", family: "Deep Learning Dynamic Graph", model: "DGCNN Target Decoder", desc: "PointNet++ encoder + dynamic graph convolutional decoder (3-seed ensemble)", mre: "41.24 mm", median: "29.18 mm", p90: "71.45 mm", sdr20: "28.1%" },
    { id: "C4", family: "Proposed Point Transformer", model: "S2A-Net (Target-Query Transformer)", desc: "Multi-scale tokens + 104 learned queries + cross-attention (Ours)", mre: "23.22 mm", median: "18.79 mm", p90: "40.12 mm", sdr20: "54.9%", isProposed: true },
  ];

  // 2. Surface Occlusion Ablations
  const occlusionData = [
    { mode: "Full 360° Reference", desc: "Complete body surface (Unoccluded reference)", hidden: "0%", mre: "23.22 mm", delta: "0.0 mm", sdr10: "15.3%", sdr20: "53.9%" },
    { mode: "Central Drape Covered", desc: "80 mm surgical anterior patch covered", hidden: "8.5%", mre: "24.48 mm", delta: "+1.26 mm", sdr10: "14.4%", sdr20: "51.2%" },
    { mode: "Posterior Covered", desc: "Back and spine hidden (Supine on table)", hidden: "50%", mre: "31.40 mm", delta: "+8.18 mm", sdr10: "7.0%", sdr20: "34.0%" },
    { mode: "Right Flank Covered", desc: "Right lateral side hidden", hidden: "50%", mre: "32.66 mm", delta: "+9.45 mm", sdr10: "7.8%", sdr20: "35.0%" },
    { mode: "Left Flank Covered", desc: "Left lateral side hidden", hidden: "50%", mre: "37.17 mm", delta: "+13.95 mm", sdr10: "6.8%", sdr20: "31.4%" },
    { mode: "Anterior Covered", desc: "Chest & abdomen hidden (Prone on table)", hidden: "50%", mre: "62.60 mm", delta: "+39.38 mm", sdr10: "2.7%", sdr20: "15.6%" },
    { mode: "Inferior Covered", desc: "Pelvis and lower torso hidden", hidden: "50%", mre: "64.58 mm", delta: "+41.36 mm", sdr10: "6.0%", sdr20: "25.9%" },
    { mode: "Superior Covered", desc: "Upper thorax and neck hidden", hidden: "50%", mre: "84.81 mm", delta: "+61.60 mm", sdr10: "4.2%", sdr20: "18.0%" },
    { mode: "Sparse Sensor (25% Drop)", desc: "Random decimation to 3,072 points", hidden: "25%", mre: "23.50 mm", delta: "+0.28 mm", sdr10: "16.4%", sdr20: "53.2%" },
    { mode: "Sparse Sensor (50% Drop)", desc: "Random decimation to 2,048 points", hidden: "50%", mre: "23.63 mm", delta: "+0.42 mm", sdr10: "14.4%", sdr20: "52.6%" },
    { mode: "Sparse Sensor (75% Drop)", desc: "Random decimation to 1,024 points", hidden: "75%", mre: "23.92 mm", delta: "+0.70 mm", sdr10: "14.1%", sdr20: "51.3%" },
  ];

  // 3. Matched Literature Comparisons
  const matchedLiterature = [
    { paper: "SAMe (Robotic Ultrasound)", venue: "arXiv:2604.25646 (2026)", matchedCount: 11, organs: "Liver, Spleen, Pancreas, Gallbladder, Bladder, Aorta, Trachea, Left/Right Kidneys, Stomach, IVC", theirMetric: "22.55 mm", ourMetric: "26.73 mm", notes: "1:1 visceral subset" },
    { paper: "From Surface to Viscera (Atici et al.)", venue: "MIDL / PMLR (2026)", matchedCount: 14, organs: "Spleen, Kidneys, Gallbladder, Liver, Stomach, Pancreas, Adrenals, Bladder, Aorta, IVC, Portal Vein, Esophagus", theirMetric: "5.0 mm (Chamfer)", ourMetric: "26.42 mm", notes: "Dense surface chamfer vs centroid MRE" },
    { paper: "FLARE22 International Challenge", venue: "External Clinical Transfer", matchedCount: 13, organs: "Liver, Right Kidney, Spleen, Pancreas, Aorta, IVC, Adrenals, Gallbladder, Esophagus, Stomach, Duodenum, Left Kidney", theirMetric: "--", ourMetric: "21.30 mm", notes: "Zero-shot cross-hospital evaluation" },
    { paper: "CT-ORG Clinical Benchmark", venue: "TCIA External Evaluation", matchedCount: 4, organs: "Liver, Right Kidney, Left Kidney, Urinary Bladder", theirMetric: "44.68 mm", ourMetric: "27.83 mm", notes: "Diverse clinical patient cohort" },
  ];

  // 4. Architectural Ablations
  const archAblations = [
    { code: "D1", mod: "Full Proposed Multi-Scale Target-Query Model", type: "Reference", mre: "24.39 mm", delta: "0.0 mm", pVal: "Reference" },
    { code: "D2", mod: "Single-Scale Surface Tokens (SA3 coarse only)", type: "Trained Ablation", mre: "27.12 mm", delta: "+2.73 mm", pVal: "p < 0.0002" },
    { code: "D3", mod: "Without Atlas Coordinate Positional Prior", type: "Trained Ablation", mre: "32.84 mm", delta: "+8.45 mm", pVal: "p < 0.0002" },
    { code: "D4", mod: "Global Pooled Token Only (No local multi-scale tokens)", type: "Trained Ablation", mre: "29.50 mm", delta: "+5.11 mm", pVal: "p < 0.0002" },
    { code: "D5", mod: "Self-Attention Only (No surface cross-attention)", type: "Trained Ablation", mre: "31.40 mm", delta: "+7.01 mm", pVal: "p < 0.0002" },
    { code: "D6", mod: "Target Self-Attention + Cross-Attention", type: "Trained Variant", mre: "24.55 mm", delta: "+0.16 mm", pVal: "p = 0.42 (n.s.)" },
    { code: "D7-2", mod: "2 Decoder Cross-Attention Layers", type: "Trained Ablation", mre: "25.80 mm", delta: "+1.41 mm", pVal: "p < 0.001" },
    { code: "D7-6", mod: "6 Decoder Cross-Attention Layers", type: "Trained Ablation", mre: "24.31 mm", delta: "-0.08 mm", pVal: "p = 0.68 (n.s.)" },
    { code: "D9", mod: "Target-Query Slot Permutation Diagnostic", type: "Diagnostic", mre: "61.20 mm", delta: "+36.81 mm", pVal: "p < 0.0002" },
    { code: "D10", mod: "Patient Surface-Token Shuffle Diagnostic", type: "Diagnostic", mre: "56.40 mm", delta: "+32.01 mm", pVal: "p < 0.0002" },
  ];

  // 5. Brain Improvements
  const brainResolution = [
    { caseId: "volume-136", oldError: "162.4 mm", newError: "5.5 mm", improvement: "-96.6%" },
    { caseId: "volume-135", oldError: "141.2 mm", newError: "8.1 mm", improvement: "-94.3%" },
    { caseId: "volume-131", oldError: "155.0 mm", newError: "15.6 mm", improvement: "-89.9%" },
    { caseId: "volume-133", oldError: "188.7 mm", newError: "19.1 mm", improvement: "-89.9%" },
    { caseId: "volume-132", oldError: "179.3 mm", newError: "26.5 mm", improvement: "-85.2%" },
    { caseId: "volume-138", oldError: "210.5 mm", newError: "68.2 mm", improvement: "-67.6%" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-bold text-text-main">Scientific Validation, Ablations &amp; Benchmarks</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Comprehensive quantitative evaluation across held-out test splits (N=215), SOTA deep learning comparisons, physical surface occlusion ablations, literature-matched subsets, and whole-body cranial error resolution.
        </p>
      </div>

      {/* 1. SOTA DEEP LEARNING COMPARISON */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-main">1. Comparison Against SOTA Deep Learning Architectures</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary-dark border border-primary/20">
            Phase 15 SOTA Benchmark
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Evaluating classical linear baselines, statistical shape models (SSM), PointNet++, DGCNN, and our proposed Target-Query Point Transformer across all 104 anatomical organs under strictly identical canonical coordinate alignment and train/test splits.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3">Architecture Family</th>
                <th className="py-3 px-3">Macro MRE</th>
                <th className="py-3 px-3">Median Error</th>
                <th className="py-3 px-3">P90 Error</th>
                <th className="py-3 px-3">SDR &le; 20mm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sotaBaselines.map((m) => (
                <tr key={m.id} className={m.isProposed ? "bg-primary/5 font-semibold text-primary-dark" : "hover:bg-background/40"}>
                  <td className="py-3 px-3 font-sans">
                    <strong>{m.model}</strong>
                    <span className="block text-[10px] text-text-muted font-mono">{m.desc}</span>
                  </td>
                  <td className="py-3 px-3">{m.family}</td>
                  <td className={`py-3 px-3 font-bold ${m.isProposed ? "text-accent-green text-sm" : ""}`}>{m.mre}</td>
                  <td className="py-3 px-3">{m.median}</td>
                  <td className="py-3 px-3">{m.p90}</td>
                  <td className="py-3 px-3 font-bold">{m.sdr20}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. SURFACE OCCLUSION ABLATION */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-accent-amber" />
            <h2 className="text-lg font-bold text-text-main">2. Physical Surface Occlusion &amp; Drape Ablation Study</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
            Robustness Analysis
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Investigating how the model behaves when various regions of the patient torso are occluded (e.g. surgical drapes, patient resting on back, decubitus lateral position, or optical sensor line-of-sight obstruction).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-3 px-3">Occlusion Mode</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Surface Hidden</th>
                <th className="py-3 px-3">Macro MRE</th>
                <th className="py-3 px-3">&Delta; vs 360°</th>
                <th className="py-3 px-3">SDR &le; 20mm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {occlusionData.map((o) => (
                <tr key={o.mode} className="hover:bg-background/40">
                  <td className="py-2.5 px-3 font-semibold text-text-main font-sans">{o.mode}</td>
                  <td className="py-2.5 px-3 text-text-muted font-sans text-[11px]">{o.desc}</td>
                  <td className="py-2.5 px-3">{o.hidden}</td>
                  <td className="py-2.5 px-3 font-bold text-text-main">{o.mre}</td>
                  <td className={`py-2.5 px-3 font-bold ${o.delta === "0.0 mm" ? "text-accent-green" : o.delta.startsWith("+0") ? "text-text-muted" : "text-accent-red"}`}>
                    {o.delta}
                  </td>
                  <td className="py-2.5 px-3">{o.sdr20}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. MATCHED LITERATURE SUBSETS */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-main">3. Literature-Matched Comparisons Against Prior Publications</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary-dark border border-primary/20">
            Fair Subset Alignment
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Because published works in external body landmarking evaluate varying subsets (e.g. 4, 11, or 14 organs), we evaluate S2A-Net strictly on the exact matched subsets of anatomical targets for fair direct comparison.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-3 px-3">Benchmark Paper / Cohort</th>
                <th className="py-3 px-3">Matched Target Organs</th>
                <th className="py-3 px-3">Reported Literature Metric</th>
                <th className="py-3 px-3">Our Model MRE on Matched Subset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matchedLiterature.map((l) => (
                <tr key={l.paper} className="hover:bg-background/40">
                  <td className="py-3 px-3 font-semibold text-text-main font-sans">
                    {l.paper}
                    <span className="block text-[10px] text-text-muted font-mono">{l.venue}</span>
                  </td>
                  <td className="py-3 px-3 font-sans text-[11px] text-text-muted">
                    <strong>{l.matchedCount} targets:</strong> {l.organs}
                  </td>
                  <td className="py-3 px-3">{l.theirMetric}</td>
                  <td className="py-3 px-3 font-bold text-primary-dark text-sm">{l.ourMetric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. BRAIN RESOLUTION (PHASE 16) */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-green" />
            <h2 className="text-lg font-bold text-text-main">4. Brain Target Error Resolution (Phase 16 Retraining)</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20">
            -78.1% Error Reduction
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          In early baseline models, partial-height training torsos caused Seed 44&apos;s coordinate head to experience numerical sign inversion on whole-body scans (Z ~ +430 mm), inflating brain error to 177.42 mm. We executed targeted multi-scale Z-augmentation (0.85x - 2.2x) with weighted loss adaptation, driving mean error down to <strong>38.92 mm</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-2.5 px-3">CT-ORG Subject</th>
                <th className="py-2.5 px-3">Baseline Error (mm)</th>
                <th className="py-2.5 px-3">Retrained Phase 16 (mm)</th>
                <th className="py-2.5 px-3">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brainResolution.map((r) => (
                <tr key={r.caseId} className="hover:bg-background/40">
                  <td className="py-2.5 px-3 font-semibold text-text-main">{r.caseId}</td>
                  <td className="py-2.5 px-3 text-accent-red line-through">{r.oldError}</td>
                  <td className="py-2.5 px-3 text-accent-green font-bold">{r.newError}</td>
                  <td className="py-2.5 px-3 text-accent-green font-bold">{r.improvement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ARCHITECTURAL ABLATIONS */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-main">5. Architectural Component Ablations (Matched 65 Epochs)</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-text-muted">
            Phase 10R Table 3
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Architectural Modification</th>
                <th className="py-3 px-3">Macro MRE</th>
                <th className="py-3 px-3">&Delta; vs Proposed</th>
                <th className="py-3 px-3">Statistical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {archAblations.map((a) => (
                <tr key={a.code} className={a.code === "D1" ? "bg-primary/5 font-semibold text-primary-dark" : "hover:bg-background/40"}>
                  <td className="py-2.5 px-3 font-bold">{a.code}</td>
                  <td className="py-2.5 px-3 font-sans">{a.mod}</td>
                  <td className="py-2.5 px-3 font-bold">{a.mre}</td>
                  <td className={`py-2.5 px-3 font-bold ${a.delta === "0.0 mm" ? "text-accent-green" : "text-accent-red"}`}>
                    {a.delta}
                  </td>
                  <td className="py-2.5 px-3 text-text-muted">{a.pVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
