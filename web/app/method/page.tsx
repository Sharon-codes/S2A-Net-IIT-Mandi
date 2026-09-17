import React from "react";
import { Activity, Scan, Layers, Eye, ShieldCheck } from "lucide-react";

export default function MethodPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary-dark w-fit">
          <Activity className="w-3.5 h-3.5 text-accent-green" />
          <span>Centre for Artificial Intelligence and Robotics (CAIR), IIT Mandi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
          Methodology &amp; Mathematical Formulation
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-4xl leading-relaxed">
          Surface2Anatomy establishes a rigorous, radiation-free spatial mapping operator from external patient surface manifolds to internal 3D organ centroids. Below is the complete mathematical, architectural, and algorithmic formulation across all sensory and inference stages.
        </p>
      </div>

      {/* 1. Mathematical Problem Formulation */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            01
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Problem Formulation &amp; Spatial Manifolds</h2>
            <span className="text-xs text-text-muted font-mono">Continuous External-to-Internal Coordinate Mapping</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Let {"\mathcal{S} = \{ \mathbf{p}_i \in \mathbb{R}^3 \}_{i=1}^N \subset \partial \Omega_{\text{body}}"} denote the sampled 3D point cloud of the external patient surface, where {"N = 4,096"}. Let {"\mathcal{T} = \{ t_k \}_{k=1}^K"} denote a set of {"K = 121"} anatomical target queries (visceral organs, vascular trees, skeletal landmarks, and sex-specific reproductive structures). Let {"g \in \{\text{Female}, \text{Male}\}"} represent the patient&apos;s biological sex.
        </p>

        <p className="text-sm text-text-muted leading-relaxed">
          Our objective is to learn a parameterized non-linear mapping operator {"\mathcal{F}_\theta"} that jointly predicts internal 3D centroid coordinates {"\hat{\mathbf{c}}_k"} and epistemic uncertainty covariances {"\hat{\mathbf{\Sigma}}_k"}:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\mathcal{F}_\theta: (\mathcal{S}, \mathcal{T}, g) \longmapsto \left\{ (\hat{\mathbf{c}}_k, \hat{\mathbf{\Sigma}}_k) \in \mathbb{R}^3 \times \mathbb{S}_{++}^3 \;\Big|\; k = 1, \dots, K \right\}"}
        </div>
      </section>

      {/* 2. Frozen Ridge Canonical Pre-Alignment */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            02
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 1: Scanner Invariance &amp; Canonical Alignment</h2>
            <span className="text-xs text-text-muted font-mono">Rotation-Invariant Moments &amp; Anchor Translation Regression</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          External body surfaces captured in clinical environments arrive in arbitrary scanner coordinate frames, subject to couch height, patient positioning, and sensor placement offsets. To ensure robust coordinate frame invariance, we extract a 16-dimensional rotation-invariant geometric moment vector {"\mathbf{m}(\mathcal{S})"} computed from the surface covariance eigenvalues and cross-sectional centroid trajectories:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\mathbf{m}(\mathcal{S}) = [ \lambda_1, \lambda_2, \lambda_3, \; \lambda_1 / \lambda_3, \; \mu_{200}, \mu_{020}, \mu_{002}, \dots, \mu_{111} ]^T \in \mathbb{R}^{16}"}
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          A frozen L2-regularized Ridge regression estimator predicts the canonical anchor center {"\mathbf{c}_{\text{external}} \in \mathbb{R}^3"}. The surface point cloud is subsequently centered and scaled by global reference scale {"S_{\text{global}} = 500.0\text{ mm}"}:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\mathcal{P}_{\text{canonical}} = (\mathcal{S} - \mathbf{c}_{\text{external}}) / 500.0 \quad \in [-1, 1]^{N \times 3}"}
        </div>
      </section>

      {/* 3. Biological Sex Dimorphism Classification */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            03
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 2: Biological Sex Geometric Conditioning</h2>
            <span className="text-xs text-text-muted font-mono">Pelvic Dimorphism PointNet &amp; Anatomical Prior Routing</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Human pelvic morphology exhibits pronounced biological sexual dimorphism, notably in the subpubic angle, bi-trochanteric pelvic ratio, and inter-ASIS width. When the patient sex is set to <strong>Auto-Detect</strong>, our geometric PointNet classifier evaluates the pelvic surface sub-cloud {"\mathcal{S}_{\text{pelvis}}"}:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"P(g = \text{Female} \mid \mathcal{S}_{\text{pelvis}}) = \sigma\left( \mathbf{W}_c \cdot \text{PointNet2}(\mathcal{S}_{\text{pelvis}}) + b_c \right)"}
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          The inferred or specified sex {"g"} dynamically conditions the downstream architecture through a learned continuous sex embedding {"\mathbf{e}_{\text{sex}} = \text{MLP}(g) \in \mathbb{R}^{128}"} and applies a biological exclusion mask {"\mathbf{M}(g)"}:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-fuchsia-50/70 border border-fuchsia-200 rounded-xl flex flex-col gap-1">
            <span className="font-bold text-fuchsia-900">Female Patient Prior (g = 0):</span>
            <span className="text-fuchsia-700">&bull; Active: Uterus (#117), Left Ovary (#118), Right Ovary (#119), Vagina (#120)</span>
            <span className="text-fuchsia-700">&bull; Masked: Prostate (#21) &rarr; Suppressed</span>
          </div>
          <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col gap-1">
            <span className="font-bold text-sky-900">Male Patient Prior (g = 1):</span>
            <span className="text-sky-700">&bull; Active: Prostate (#21) actively localized</span>
            <span className="text-sky-700">&bull; Masked: Uterus, Ovaries, Vagina &rarr; Suppressed</span>
          </div>
        </div>
      </section>

      {/* 4. Multi-Scale PointNet++ Surface Feature Pyramid */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            04
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 3: Multi-Scale Hierarchical Surface Encoder</h2>
            <span className="text-xs text-text-muted font-mono">Iterative Farthest Point Sampling &amp; Ball Query Grouping</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          External contours convey multi-frequency geometric cues (local curvature gradients at the clavicles and rib cage vs global postural curvature along the spine). We utilize a 3-level hierarchical Set Abstraction (SA) pyramid with ball radius queries:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-4 rounded-xl border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 1</span>
            <span className="text-text-muted block">FPS: 1,024 points</span>
            <span className="text-text-muted block">Ball Radius: r = 0.20</span>
            <span className="block mt-2 text-primary-dark font-semibold">Shape: (B, 1024, 128)</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 2</span>
            <span className="text-text-muted block">FPS: 256 points</span>
            <span className="text-text-muted block">Ball Radius: r = 0.40</span>
            <span className="block mt-2 text-primary-dark font-semibold">Shape: (B, 256, 256)</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-border">
            <span className="font-bold text-text-main block mb-1">Set Abstraction 3</span>
            <span className="text-text-muted block">FPS: 64 points</span>
            <span className="text-text-muted block">Ball Radius: r = 0.80</span>
            <span className="block mt-2 text-primary-dark font-semibold">Shape: (B, 64, 512)</span>
          </div>
        </div>
      </section>

      {/* 5. Dual-Graph SAMeOrganGNN Architecture */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            05
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 4: Dual-Graph SAMeOrganGNN Message Passing</h2>
            <span className="text-xs text-text-muted font-mono">Skeletal Rigid Anchors + Visceral Soft Tissue Decomposition</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Unlike monolithic regression models that treat all 121 anatomical structures uniformly, our <strong>SAMeOrganGNN</strong> decouples the anatomy into a dual-graph representation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-border flex flex-col gap-1.5">
            <span className="font-bold text-slate-800 text-sm font-sans">1. Skeletal Rigid Anchor Graph</span>
            <p className="text-text-muted font-sans leading-relaxed">
              Consists of 63 rigid skeletal landmarks (cranial apex, C1&ndash;C7 cervical, T1&ndash;T12 thoracic, L1&ndash;L5 lumbar, sacral promontory, sternum, pubic symphysis, iliac crests). Constrained by kinematic joint priors.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-border flex flex-col gap-1.5">
            <span className="font-bold text-slate-800 text-sm font-sans">2. Soft-Tissue Visceral Subgraph</span>
            <p className="text-text-muted font-sans leading-relaxed">
              Consists of 58 deformable parenchymal viscera (Liver, Spleen, Kidneys, Bladder, Uterus, Ovaries). Predictions are anchored relative to neighboring skeletal landmarks via cross-attention message passing.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\mathbf{h}_v^{(l+1)} = \text{Update}\left( \mathbf{h}_v^{(l)}, \; \sum_{u \in \mathcal{N}(v)} \text{Message}\left(\mathbf{h}_u^{(l)}, \mathbf{h}_v^{(l)}, \mathbf{e}_{uv}\right) + \mathbf{e}_{\text{sex}} \right)"}
        </div>
      </section>

      {/* 6. Loss Formulations & Training Objectives */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            06
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 5: Loss Objectives &amp; Uncertainty Quantification</h2>
            <span className="text-xs text-text-muted font-mono">Multi-Task Smooth L1 + Heteroscedastic Disagreement</span>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          The models are trained using a multi-component objective combining masked Smooth L1 coordinate regression, heteroscedastic aleatoric uncertainty modeling, and multi-seed ensemble disagreement:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\mathcal{L}_{\text{joint}} = \sum_{k=1}^K m_k \left[ \text{Smooth}_{L1}(\hat{\mathbf{c}}_k - \mathbf{c}_k) + \frac{\|\hat{\mathbf{c}}_k - \mathbf{c}_k\|_2^2}{2\sigma_k^2} + \frac{1}{2} \log \sigma_k^2 \right]"}
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          During deployment, epistemic uncertainty {"\sigma_{\text{disagreement}}"} is derived across an ensemble of 3 seeds (42, 43, 44):
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-border font-mono text-xs sm:text-sm text-primary-dark overflow-x-auto">
          {"\sigma_k = \sqrt{ \frac{1}{3} \sum_{s \in \{42, 43, 44\}} \| \hat{\mathbf{c}}_k^{(s)} - \bar{\mathbf{c}}_k \|^2 }"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
          <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl text-accent-green">
            <strong className="block font-bold">Low Uncertainty (&le; 15.0 mm)</strong>
            <span>High clinical confidence (Brain, Heart, Liver, Kidneys, Bladder, Uterus).</span>
          </div>
          <div className="p-3 bg-accent-amber/10 border border-accent-amber/30 rounded-xl text-accent-amber">
            <strong className="block font-bold">Moderate Uncertainty (15&ndash;30 mm)</strong>
            <span>Soft-tissue respiratory deformation (Vagina, Gallbladder, Pancreatic tail).</span>
          </div>
          <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red">
            <strong className="block font-bold">High Uncertainty (&gt; 30.0 mm)</strong>
            <span>Extreme anatomical variability or truncated field-of-view.</span>
          </div>
        </div>
      </section>

      {/* 7. Multi-Modal Sensory Pipelines (Mesh, Depth, RGB) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            07
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Stage 6: Multi-Modal Optical &amp; Depth Sensor Ingestion</h2>
            <span className="text-xs text-text-muted font-mono">Pinhole Back-Projection &amp; Photogrammetric Silhouette Lifting</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-border flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Scan className="w-4 h-4 text-primary" />
              <span>3D Surface Scans (.PLY/.OBJ)</span>
            </div>
            <p className="text-text-muted font-sans leading-relaxed">
              Standard optical photogrammetry or structured-light scanners. Vertices are uniformly sub-sampled via Farthest Point Sampling (FPS) to exactly {"N = 4,096"} points and translated into canonical coordinates.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-border flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>3D Depth Cameras (RGB-D)</span>
            </div>
            <p className="text-text-muted font-sans leading-relaxed">
              Intel RealSense D435 / Azure Kinect. Unprojects 16-bit depth pixel frames into spatial 3D metric coordinates using pinhole intrinsic camera geometry:
            </p>
            <div className="p-2 bg-white rounded border border-border font-mono text-[11px] text-primary-dark">
              {"P = [ (u - cx)*d/fx, (v - cy)*d/fy, d ]"}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-border flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Clinical RGB Photographs</span>
            </div>
            <p className="text-text-muted font-sans leading-relaxed">
              Standard clinical anterior photographs. Uses silhouette contour segmentation and luminance shape-from-shading to infer anterior curvature, lifting 2D landmarks into a 3D metric hull.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Comprehensive Architecture Ablation Table */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center font-mono font-bold text-base">
            08
          </div>
          <div>
            <h2 className="font-bold text-xl text-text-main">Scientific Ablation &amp; Architectural Comparison</h2>
            <span className="text-xs text-text-muted font-mono">Benchmark Validation Across 450 Verified Patient Volumes</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-border rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-text-main font-semibold">
              <tr>
                <th className="p-3 border-b border-border">Model Architecture</th>
                <th className="p-3 border-b border-border">Sex Conditioning</th>
                <th className="p-3 border-b border-border">Active Targets</th>
                <th className="p-3 border-b border-border">Brain Error</th>
                <th className="p-3 border-b border-border">Torso Error</th>
                <th className="p-3 border-b border-border">Pelvic / Repro Error</th>
                <th className="p-3 border-b border-border">Overall Mean TRE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-700 font-sans">Population Atlas (C0)</td>
                <td className="p-3 text-text-muted">None</td>
                <td className="p-3">104</td>
                <td className="p-3 text-red-600">42.8 mm</td>
                <td className="p-3 text-red-600">28.4 mm</td>
                <td className="p-3 text-red-600">32.1 mm</td>
                <td className="p-3 font-bold text-red-600">31.2 mm</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-700 font-sans">PointNet++ Baseline (C2)</td>
                <td className="p-3 text-text-muted">None</td>
                <td className="p-3">104</td>
                <td className="p-3 text-amber-600">24.5 mm</td>
                <td className="p-3 text-amber-600">18.9 mm</td>
                <td className="p-3 text-amber-600">22.4 mm</td>
                <td className="p-3 font-bold text-amber-600">20.8 mm</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-700 font-sans">DGCNN EdgeConv (C3)</td>
                <td className="p-3 text-text-muted">None</td>
                <td className="p-3">104</td>
                <td className="p-3 text-amber-600">21.2 mm</td>
                <td className="p-3 text-amber-600">17.1 mm</td>
                <td className="p-3 text-amber-600">19.8 mm</td>
                <td className="p-3 font-bold text-amber-600">18.4 mm</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-700 font-sans">Phase 10R Proposed (C4)</td>
                <td className="p-3 text-text-muted">None (Unisex)</td>
                <td className="p-3">104</td>
                <td className="p-3 text-amber-600">18.6 mm</td>
                <td className="p-3 text-emerald-600">11.8 mm</td>
                <td className="p-3 text-amber-600">16.5 mm</td>
                <td className="p-3 font-bold text-emerald-600">14.2 mm</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-700 font-sans">Phase 16 Cranial-Prior Guard</td>
                <td className="p-3 text-text-muted">None</td>
                <td className="p-3">117</td>
                <td className="p-3 text-emerald-600">9.4 mm</td>
                <td className="p-3 text-emerald-600">11.6 mm</td>
                <td className="p-3 text-amber-600">15.9 mm</td>
                <td className="p-3 font-bold text-emerald-600">12.8 mm</td>
              </tr>
              <tr className="bg-primary/5 font-semibold">
                <td className="p-3 text-primary-dark font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent-green" />
                  <span>Proposed Sex-Aware SAMeOrganGNN</span>
                </td>
                <td className="p-3 text-primary-dark">Dynamic Dimorphism</td>
                <td className="p-3 text-primary-dark">121</td>
                <td className="p-3 text-accent-green font-bold">9.2 mm</td>
                <td className="p-3 text-accent-green font-bold">10.8 mm</td>
                <td className="p-3 text-accent-green font-bold">13.8 mm</td>
                <td className="p-3 font-bold text-accent-green text-sm">11.6 mm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
