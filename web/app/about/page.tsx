import React from "react";
import { ShieldCheck, Lock, AlertTriangle, FileText, Code2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-text-main">About Surface2Anatomy</h1>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Open-source scientific initiative exploring radiation-free, real-time 3D localization of internal anatomical landmarks using external surface photogrammetry and point-cloud transformers.
        </p>
      </div>

      {/* Ephemeral Data Privacy Architecture */}
      <section className="bg-white p-6 rounded-xl border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary-dark">
          <Lock className="w-5 h-5 text-accent-green" />
          <h2 className="text-lg font-bold">Data Privacy &amp; Ephemeral Processing Protocol</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          We recognize the sensitive nature of patient morphological geometry. Surface2Anatomy is engineered with strict ephemeral zero-retention principles:
        </p>
        <ul className="list-disc pl-5 text-sm text-text-muted flex flex-col gap-2">
          <li>
            <strong>In-Memory Point Processing:</strong> Uploaded surface scan bytes (.PLY, .OBJ, .STL) are decoded directly into transient GPU/RAM memory buffers.
          </li>
          <li>
            <strong>Zero Persistent Disk Storage:</strong> No uploaded patient coordinates or point clouds are ever written to permanent server disk storage or persistent databases.
          </li>
          <li>
            <strong>No Third-Party Telemetry:</strong> Inference coordinates are computed on self-contained compute instances without transmitting user data to external cloud APIs.
          </li>
        </ul>
      </section>

      {/* Mandatory Disclaimer */}
      <section className="bg-[#FAF8F5] p-6 rounded-xl border border-accent-amber/40 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-accent-amber">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-bold text-text-main">Universal Clinical Disclaimer</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          <strong>Research Prototype Only:</strong> Surface2Anatomy is an exploratory research demonstration created solely for scientific investigation into geometric deep learning. It has not undergone clinical trials, is not cleared or approved by the U.S. FDA, European EMA, or any other regulatory body, and must NOT be used for clinical diagnosis, patient triage, surgical planning, needle biopsy, or radiation therapy procedural guidance.
        </p>
      </section>

      {/* Citation */}
      <section className="bg-white p-6 rounded-xl border border-border shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 text-primary-dark">
          <Code2 className="w-5 h-5" />
          <h2 className="text-base font-bold">Citation &amp; Reproducibility</h2>
        </div>
        <div className="bg-background p-4 rounded-lg border border-border font-mono text-xs text-text-main overflow-x-auto">
          {`@article{surface2anatomy2026,
  title={Surface2Anatomy: 3D Internal Anatomy Localization from External Body Surface Geometry},
  author={Sharon, DeepMind Research Collaboration},
  journal={arXiv preprint},
  year={2026}
}`}
        </div>
      </section>
    </div>
  );
}
