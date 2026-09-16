import React from "react";
import { Cpu, Layers, GitMerge, Compass, ArrowRight, ShieldCheck } from "lucide-react";

export default function MethodPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-text-main">Methodology &amp; Mathematical Formulation</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Surface2Anatomy establishes an external-to-internal spatial mapping framework by decomposing body-surface geometry into multi-scale geometric tokens and querying learned anatomical representations.
        </p>
      </div>

      {/* Stage 1: Ridge Canonical Pre-Alignment */}
      <section className="bg-white p-6 rounded-xl border border-border flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="font-bold text-lg text-text-main">Stage 1: Frozen Ridge Canonical Alignment</h2>
            <span className="text-xs text-text-muted font-mono">Anchor Coordinate Frame Invariance</span>
          </div>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Raw external surface scans arrive in arbitrary scanner coordinate frames, subject to translation and pose offsets. We extract 16 rotation-invariant geometric moments from the surface point cloud and apply a frozen Ridge regression model to determine the external canonical anchor c_external. The point cloud is centered and scaled by global reference S = 500 mm:
        </p>
        <div className="bg-background p-3 rounded-lg border border-border font-mono text-xs text-primary-dark overflow-x-auto">
          {"P_canonical = (P - c_external) / 500.0"}
        </div>
      </section>

      {/* Stage 2: Multi-Scale Geometric Point Cloud Encoder */}
      <section className="bg-white p-6 rounded-xl border border-border flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="font-bold text-lg text-text-main">Stage 2: Multi-Scale PointNet++ Surface Encoder</h2>
            <span className="text-xs text-text-muted font-mono">Hierarchical Set Abstraction Hierarchy</span>
          </div>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          The centered 4,096-point surface is passed into a hierarchical PointNet++ encoder featuring three progressive set abstraction levels:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-background p-3 rounded-lg border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 1</span>
            <span className="text-text-muted">1,024 points, radius 0.2</span>
            <span className="block mt-1 text-primary-dark">Output: (B, 1024, 128)</span>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 2</span>
            <span className="text-text-muted">256 points, radius 0.4</span>
            <span className="block mt-1 text-primary-dark">Output: (B, 256, 256)</span>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 3</span>
            <span className="text-text-muted">64 points, radius 0.8</span>
            <span className="block mt-1 text-primary-dark">Output: (B, 64, 512)</span>
          </div>
        </div>
      </section>

      {/* Stage 3: Target-Query Cross-Attention Decoder */}
      <section className="bg-white p-6 rounded-xl border border-border flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="font-bold text-lg text-text-main">Stage 3: Target-Query Cross-Attention Transformer</h2>
            <span className="text-xs text-text-muted font-mono">Atlas Query Residual Prediction</span>
          </div>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Rather than predicting all points at once with a generic global pooling vector, 104 learned organ query vectors attend to multi-scale surface tokens across 4 transformer decoder layers with 8 attention heads. Each query predicts a 3D coordinate offset added to a canonical population atlas prior:
        </p>
        <div className="bg-background p-3 rounded-lg border border-border font-mono text-xs text-primary-dark overflow-x-auto">
          {"y_k = Atlas_k + Delta_k(Query_k, Keys, Values)"}
        </div>
      </section>

      {/* Stage 4: 3-Seed Disagreement Uncertainty */}
      <section className="bg-white p-6 rounded-xl border border-border flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-sm">
            4
          </div>
          <div>
            <h2 className="font-bold text-lg text-text-main">Stage 4: 3-Seed Ensemble &amp; Disagreement Uncertainty</h2>
            <span className="text-xs text-text-muted font-mono">Quantifying Epistemic &amp; Geometric Uncertainty</span>
          </div>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          To prevent individual model hallucinations and provide clinically meaningful confidence bounds, inference runs across 3 models trained with independent random seeds (42, 43, 44). The final centroid is the consensus average, and uncertainty is computed as the root-mean-square spatial disagreement:
        </p>
        <div className="bg-background p-3 rounded-lg border border-border font-mono text-xs text-primary-dark overflow-x-auto">
          {"sigma_k = sqrt( 1/3 * sum_{s in {42, 43, 44}} || y_k^(s) - mean(y_k) ||^2 )"}
        </div>
      </section>
    </div>
  );
}
