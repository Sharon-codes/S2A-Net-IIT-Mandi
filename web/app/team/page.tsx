import React from "react";
import Image from "next/image";
import { User, Award, GraduationCap, Building2, Cpu, Sparkles } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      {/* Logos & Header Section */}
      <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
        {/* Dual Institution Logos: CAIR + IIT Mandi */}
        <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-white border border-border shadow-xs">
          <img
            src="/cair_logo.png"
            alt="CAIR IIT Mandi Logo"
            className="h-16 w-auto object-contain"
          />
          <div className="h-12 w-px bg-border" />
          <img
            src="/iit_mandi_logo.png"
            alt="IIT Mandi Logo"
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-white border border-border text-xs font-mono text-primary-dark shadow-xs">
          <GraduationCap className="w-3.5 h-3.5 text-accent-green" />
          <span>Centre for Artificial Intelligence and Robotics (CAIR) &bull; IIT Mandi</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
          Research Team &amp; Academic Supervision
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Surface2Anatomy was researched and engineered by research interns at the <strong>Centre for Artificial Intelligence and Robotics (CAIR), Indian Institute of Technology Mandi (IIT Mandi)</strong> under the academic supervision of <strong>Dr. Deepak Raina</strong>.
        </p>
      </div>

      {/* Faculty Supervisor Section */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-xs flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-36 h-36 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/25 border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary-dark shrink-0 shadow-inner">
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
            Assistant Professor &bull; Centre for Artificial Intelligence and Robotics (CAIR) &amp; School of Computing &amp; Electrical Engineering, IIT Mandi
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Supervised the architectural formulation, medical coordinate system invariance, cross-attention mechanism design, and scientific validation paradigms for radiation-free internal organ localization.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>CAIR &amp; SCEE, Indian Institute of Technology Mandi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Project Contributors & Interns Section */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-main">Project Contributors &amp; Researchers</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Research Interns at the Centre for Artificial Intelligence and Robotics (CAIR), IIT Mandi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Khushi Mhamane - Project Lead */}
          <div className="bg-white rounded-xl border-2 border-primary/40 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-mono px-3 py-0.5 rounded-bl-lg font-semibold tracking-wider uppercase">
              Project Lead
            </div>

            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/10 to-primary/25 border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary-dark shrink-0">
              <span className="text-2xl font-extrabold font-mono">KM</span>
              <span className="text-[9px] uppercase font-mono mt-1 text-text-muted text-center px-1">
                Photo to be uploaded
              </span>
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">
                Project Lead &bull; Research Intern
              </span>
              <h3 className="text-xl font-bold text-text-main">Khushi Mhamane</h3>
              <p className="text-xs font-medium text-primary-dark">
                Research Intern &bull; Centre for Artificial Intelligence and Robotics (CAIR), IIT Mandi
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                Led the project formulation, 3D point cloud transformer architecture design, multi-organ loss balancing, and clinical validation across FLARE22, AMOS22, and CT-ORG benchmarks.
              </p>
            </div>
          </div>

          {/* Sharon Melhi - Research Intern */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary-dark shrink-0">
              <span className="text-2xl font-extrabold font-mono">SM</span>
              <span className="text-[9px] uppercase font-mono mt-1 text-text-muted text-center px-1">
                Photo to be uploaded
              </span>
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">
                Research Intern
              </span>
              <h3 className="text-xl font-bold text-text-main">Sharon Melhi</h3>
              <p className="text-xs font-medium text-primary-dark">
                Research Intern &bull; Centre for Artificial Intelligence and Robotics (CAIR), IIT Mandi
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                Engineered the frozen Ridge canonical alignment pipeline, 3-seed ensemble epistemic uncertainty estimation, whole-body brain-aware augmentation, and GPU inference web deployment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Banner */}
      <div className="bg-[#FAF8F5] border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src="/cair_logo.png"
            alt="CAIR Logo"
            className="h-14 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col text-xs text-text-muted">
            <span className="font-bold text-sm text-text-main">
              Centre for Artificial Intelligence and Robotics (CAIR)
            </span>
            <span>Indian Institute of Technology Mandi (IIT Mandi) &bull; Kamand Campus, Mandi, Himachal Pradesh 175005, India</span>
            <span className="text-[11px] text-primary-dark mt-0.5">Specialized centre pioneering intelligent robotics, biomedical perception, and surgical autonomy.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
