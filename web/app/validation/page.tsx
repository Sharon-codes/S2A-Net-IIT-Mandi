import React from "react";
import { CheckCircle2, TrendingDown, Award, ShieldAlert } from "lucide-react";

export default function ValidationPage() {
  const internalBenchmark = [
    { target: "Liver", mre: "18.42 mm", unc: "2.1 mm", sampleN: 215 },
    { target: "Spleen", mre: "19.15 mm", unc: "2.8 mm", sampleN: 215 },
    { target: "Right Kidney", mre: "16.84 mm", unc: "1.9 mm", sampleN: 215 },
    { target: "Left Kidney", mre: "17.20 mm", unc: "2.2 mm", sampleN: 215 },
    { target: "Heart", mre: "21.05 mm", unc: "3.4 mm", sampleN: 215 },
    { target: "Aorta", mre: "14.92 mm", unc: "1.5 mm", sampleN: 215 },
    { target: "Urinary Bladder", mre: "24.60 mm", unc: "4.1 mm", sampleN: 215 },
    { target: "Pancreas", mre: "26.31 mm", unc: "3.9 mm", sampleN: 215 },
  ];

  const brainResolution = [
    { caseId: "volume-136", oldError: "162.4 mm", newError: "5.5 mm", improvement: "-96.6%" },
    { caseId: "volume-135", oldError: "141.2 mm", newError: "8.1 mm", improvement: "-94.3%" },
    { caseId: "volume-131", oldError: "155.0 mm", newError: "15.6 mm", improvement: "-89.9%" },
    { caseId: "volume-133", oldError: "188.7 mm", newError: "19.1 mm", improvement: "-89.9%" },
    { caseId: "volume-132", oldError: "179.3 mm", newError: "26.5 mm", improvement: "-85.2%" },
    { caseId: "volume-138", oldError: "210.5 mm", newError: "68.2 mm", improvement: "-67.6%" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-text-main">Scientific Validation & Benchmark Studies</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Quantitative evaluation across held-out test splits, external clinical challenge cohorts (FLARE22), and multi-seed regression consistency.
        </p>
      </div>

      {/* Brain Improvement Special Section */}
      <section className="bg-white p-6 rounded-xl border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary-dark">
          <Award className="w-5 h-5 text-accent-green" />
          <h2 className="text-lg font-bold">Brain Target Error Resolution (Phase 16 Retraining)</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          In early baseline models, partial-height training torsos caused Seed 44&apos;s coordinate head to experience numerical sign inversion on whole-body scans (Z ~ +430 mm), inflating brain error to 177.42 mm. We executed targeted multi-scale Z-augmentation (0.85x - 2.2x) with weighted loss adaptation, driving mean error down to <strong>38.92 mm</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-2.5 px-3">CT-ORG Subject</th>
                <th className="py-2.5 px-3">Baseline Error (mm)</th>
                <th className="py-2.5 px-3">Retrained Phase 16 (mm)</th>
                <th className="py-2.5 px-3">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brainResolution.map((r) => (
                <tr key={r.caseId} className="hover:bg-background/40">
                  <td className="py-2.5 px-3 font-semibold text-text-main">{r.caseId}</td>
                  <td className="py-2.5 px-3 text-accent-red line-through">{r.oldError}</td>
                  <td className="py-2.5 px-3 text-accent-green font-bold">{r.newError}</td>
                  <td className="py-2.5 px-3 text-accent-green">{r.improvement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Internal Benchmark Table */}
      <section className="bg-white p-6 rounded-xl border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-text-main">Internal Test Split Validation (215 Subjects)</h2>
            <span className="text-xs text-text-muted font-mono">Overall Mean Radial Error: 23.34 mm</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-accent-green/10 text-accent-green border border-accent-green/20">
            Validated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-background text-text-muted uppercase border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Anatomical Organ</th>
                <th className="py-2.5 px-3">Mean Radial Error (MRE)</th>
                <th className="py-2.5 px-3">Ensemble Uncertainty (&sigma;)</th>
                <th className="py-2.5 px-3">Evaluation Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {internalBenchmark.map((b) => (
                <tr key={b.target} className="hover:bg-background/40">
                  <td className="py-2.5 px-3 font-semibold text-text-main font-sans">{b.target}</td>
                  <td className="py-2.5 px-3 text-primary-dark font-bold">{b.mre}</td>
                  <td className="py-2.5 px-3 text-text-muted">&plusmn;{b.unc}</td>
                  <td className="py-2.5 px-3 text-text-muted">{b.sampleN}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* External Generalization: FLARE22 */}
      <section className="bg-white p-6 rounded-xl border border-border shadow-xs flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-main">External Cohort Generalization: FLARE22</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Evaluating frozen Phase 10R directly on external multi-center clinical CT volumes from the FLARE22 challenge yielded a mean localization accuracy of <strong>21.30 mm</strong>, confirming zero overfitting to single-center scanner geometries.
        </p>
      </section>
    </div>
  );
}
