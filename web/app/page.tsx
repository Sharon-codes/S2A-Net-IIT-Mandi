import Link from "next/link";
import { ArrowRight, Box, ShieldCheck, Zap, Activity, Cpu, Database, Eye } from "lucide-react";
import { RoboticArmScanner } from "@/components/RoboticArmScanner";

export default function Home() {
  const metrics = [
    { label: "Anatomical Targets", value: "107", note: "Cranial, Thoracic, Abdominal, Pelvis & Spine" },
    { label: "Internal MRE", value: "23.34 mm", note: "3-Seed Ensemble Consensus" },
    { label: "Brain Error (Retrained)", value: "5.5 mm", note: "Phase 16 Whole-Body Model on CT-ORG" },
    { label: "Inference Latency", value: "11.3 FPS", note: "88 ms End-to-End GPU Latency" },
    { label: "Radiation Dose", value: "0 mSv", note: "Optical Surface Photogrammetry" },
  ];

  return (
    <div className="flex flex-col gap-14 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-border text-xs font-mono text-primary-dark shadow-xs">
          <Activity className="w-3.5 h-3.5 text-accent-green" />
          <span>Centre for AI & Robotics (CAIR) &bull; IIT Mandi Research Initiative</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight leading-tight">
          3D Internal Anatomy Localization from{" "}
          <span className="text-primary-dark underline decoration-primary/30 decoration-wavy">
            External Body Geometry
          </span>
        </h1>

        <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
          Predicting 3D internal organ centroids and spatial uncertainty directly from optical surface scans and depth cameras using deep multi-scale cross-attention decoders. Developed at <strong>CAIR, IIT Mandi</strong> by <strong>Khushi Mhamane</strong> (Project Lead) &amp; <strong>Sharon Melhi</strong> under the supervision of <strong>Dr. Deepak Raina</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <Link
            href="/demo"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-base shadow-sm transition-all flex items-center gap-2"
          >
            <span>Launch Interactive 3D Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/targets"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-base shadow-xs transition-colors"
          >
            107 Target Catalog
          </Link>
          <Link
            href="/team"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-base shadow-xs transition-colors"
          >
            Meet the CAIR Team
          </Link>
        </div>
      </section>

      {/* 3D Interactive Medical Robotic Arm Scanner Simulation */}
      <section className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Interactive 3D Digital Twin
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Drag to orbit 360° &bull; Scroll to zoom &bull; Click zone buttons to steer robotic arm
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">CAIR-ROBOT-SCAN-SIM v2.4</span>
        </div>
        <RoboticArmScanner />
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white p-5 rounded-xl border border-border flex flex-col justify-between shadow-xs"
          >
            <span className="text-xs font-medium text-text-muted">{m.label}</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-primary-dark my-2">
              {m.value}
            </span>
            <span className="text-[11px] text-text-muted/80">{m.note}</span>
          </div>
        ))}
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary-dark">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-text-main">Multi-Scale PointNet++ Encoder</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Extracts hierarchical geometric surface features across SA1 (1,024 points), SA2 (256 points), and SA3 (64 points) scales, preserving local anatomical contours.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary-dark">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-text-main">Target-Query Cross-Attention</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            104 learned organ queries attend to multi-scale body surface tokens, predicting spatial coordinate residuals relative to a canonical anatomical atlas.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary-dark">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-text-main">3-Seed Ensemble Uncertainty</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Predicts consensus centroids and computes root-mean-square seed disagreement across independent initializations, providing localized spatial confidence bounds.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white rounded-xl border border-border p-6 md:p-8 flex flex-col gap-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-text-main">Comparative Paradigm Analysis</h2>
          <p className="text-sm text-text-muted mt-1">
            How external geometric localization compares to standard diagnostic and procedural modalities.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-xs uppercase font-mono text-text-muted border-b border-border">
              <tr>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Ionizing Dose</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Hardware Cost</th>
                <th className="py-3 px-4">Portability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              <tr className="bg-primary/5 font-semibold text-primary-dark font-sans">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-green" />
                  <span>Surface2Anatomy (Ours)</span>
                </td>
                <td className="py-3 px-4 font-mono">0.0 mSv</td>
                <td className="py-3 px-4 font-mono">&lt; 100 ms</td>
                <td className="py-3 px-4 font-mono">Optical / RGB-D Scanner</td>
                <td className="py-3 px-4 font-mono">Bedside / Field</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-text-main">Diagnostic Whole-Body CT</td>
                <td className="py-3 px-4 text-accent-red">10 - 20 mSv</td>
                <td className="py-3 px-4">Minutes to Hours</td>
                <td className="py-3 px-4">\$500,000 - \$2,000,000</td>
                <td className="py-3 px-4">Fixed Gantry Suite</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-text-main">Diagnostic MRI</td>
                <td className="py-3 px-4 text-accent-green">0.0 mSv</td>
                <td className="py-3 px-4">30 - 60 Minutes</td>
                <td className="py-3 px-4">\$1,000,000+</td>
                <td className="py-3 px-4">Shielded Magnet Room</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-text-main">Handheld Ultrasound</td>
                <td className="py-3 px-4 text-accent-green">0.0 mSv</td>
                <td className="py-3 px-4">Real-Time</td>
                <td className="py-3 px-4">\$5,000 - \$20,000</td>
                <td className="py-3 px-4">Operator Acoustic Window</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
