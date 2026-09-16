import React from "react";
import Image from "next/image";
import { User, Award, GraduationCap, Building2, Mail, ExternalLink } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-white border border-border text-xs font-mono text-primary-dark mx-auto shadow-xs">
          <GraduationCap className="w-3.5 h-3.5 text-accent-green" />
          <span>Indian Institute of Technology Mandi (IIT Mandi)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
          Research Team &amp; Academic Supervision
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Surface2Anatomy was conducted and developed at the Indian Institute of Technology Mandi, exploring geometric deep learning for radiation-free internal organ localization.
        </p>
      </div>

      {/* Faculty Supervisor Section */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-xs flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-36 h-36 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/25 border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary-dark shrink-0 shadow-inner group">
          <span className="text-3xl font-black font-mono tracking-wider">DR</span>
          <span className="text-[10px] uppercase font-mono mt-2 text-text-muted text-center px-2">
            Photo to be uploaded
          </span>
        </div>

        <div className="flex flex-col gap-3 text-center md:text-left flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-green font-semibold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Academic Project Supervisor</span>
              </div>
              <h2 className="text-2xl font-bold text-text-main">Dr. Deepak Raina</h2>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-background border border-border text-text-muted self-center sm:self-auto">
              Faculty Supervisor
            </span>
          </div>

          <p className="text-sm font-medium text-primary-dark">
            Assistant Professor &bull; Indian Institute of Technology Mandi (IIT Mandi)
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Supervised the architectural design, clinical coordinate frame consistency, validation paradigms, and scientific rigor of the Surface2Anatomy geometric cross-attention framework.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>School of Computing &amp; Electrical Engineering, IIT Mandi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Project Contributors Section */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-main">Project Contributors</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Designed, implemented, trained, benchmarked, and deployed the complete Surface2Anatomy platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Khushi Mhamane */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary-dark shrink-0">
              <span className="text-2xl font-extrabold font-mono">KM</span>
              <span className="text-[9px] uppercase font-mono mt-1 text-text-muted text-center px-1">
                Photo to be uploaded
              </span>
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
              <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
                Project Contributor
              </span>
              <h3 className="text-xl font-bold text-text-main">Khushi Mhamane</h3>
              <p className="text-xs font-medium text-primary-dark">
                Indian Institute of Technology Mandi (IIT Mandi)
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                Specialized in deep geometric point cloud architectures, target-query cross-attention formulation, clinical validation studies across FLARE22 &amp; CT-ORG cohorts, and multi-organ loss balancing.
              </p>
            </div>
          </div>

          {/* Sharon Melhi */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary-dark shrink-0">
              <span className="text-2xl font-extrabold font-mono">SM</span>
              <span className="text-[9px] uppercase font-mono mt-1 text-text-muted text-center px-1">
                Photo to be uploaded
              </span>
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
              <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
                Project Contributor
              </span>
              <h3 className="text-xl font-bold text-text-main">Sharon Melhi</h3>
              <p className="text-xs font-medium text-primary-dark">
                Indian Institute of Technology Mandi (IIT Mandi)
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                Specialized in frozen Ridge canonical alignment pipeline, 3-seed ensemble epistemic uncertainty estimation, whole-body brain-aware augmentation, and GPU inference backend engineering.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Note */}
      <div className="bg-[#FAF8F5] border border-border rounded-xl p-6 flex items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary shrink-0" />
          <span>
            <strong>Indian Institute of Technology Mandi (IIT Mandi)</strong> &bull; Kamand Campus, Mandi, Himachal Pradesh 175005, India. Conducted as an open scientific research initiative for advanced robotic healthcare and non-invasive anatomical perception.
          </span>
        </div>
      </div>
    </div>
  );
}
