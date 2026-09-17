"use client";

import React, { useState, useEffect } from "react";
import { Search, Mic, MicOff, Check, Sparkles, User, Heart } from "lucide-react";

interface TargetSelectorProps {
  selectedTargets: string[];
  onToggleTarget: (target: string) => void;
  onClearTargets: () => void;
  onSelectTargets: (targets: string[]) => void;
  onRunInference: () => void;
  isPredicting: boolean;
  hasGeometry: boolean;
  patientSex?: "auto" | "female" | "male";
  onPatientSexChange?: (sex: "auto" | "female" | "male") => void;
}

const COMMON_BENCHMARKS = [
  { id: "brain", label: "Brain" },
  { id: "heart", label: "Heart" },
  { id: "liver", label: "Liver" },
  { id: "kidney_left", label: "Left Kidney" },
  { id: "kidney_right", label: "Right Kidney" },
  { id: "urinary_bladder", label: "Bladder" },
  { id: "spleen", label: "Spleen" },
  { id: "aorta", label: "Aorta" },
  { id: "pancreas", label: "Pancreas" },
];

const FEMALE_REPRODUCTIVE = [
  { id: "uterus", label: "Uterus", color: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200" },
  { id: "ovary_left", label: "Left Ovary", color: "text-pink-700 bg-pink-50 border-pink-200" },
  { id: "ovary_right", label: "Right Ovary", color: "text-pink-700 bg-pink-50 border-pink-200" },
  { id: "vagina", label: "Vagina", color: "text-purple-700 bg-purple-50 border-purple-200" },
];

const MALE_REPRODUCTIVE = [
  { id: "prostate", label: "Prostate Gland", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
];

export function TargetSelector({
  selectedTargets,
  onToggleTarget,
  onClearTargets,
  onSelectTargets,
  onRunInference,
  isPredicting,
  hasGeometry,
  patientSex = "auto",
  onPatientSexChange,
}: TargetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allTargets, setAllTargets] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Fetch targets from API catalog
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_INFERENCE_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/targets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.targets) {
          setAllTargets(data.targets);
        }
      })
      .catch(() => {
        // Fallback default list
        setAllTargets([
          ...COMMON_BENCHMARKS.map((t) => t.id),
          ...FEMALE_REPRODUCTIVE.map((t) => t.id),
          ...MALE_REPRODUCTIVE.map((t) => t.id),
        ]);
      });
  }, []);

  const handleSexChange = (sex: "auto" | "female" | "male") => {
    if (onPatientSexChange) {
      onPatientSexChange(sex);
    }
    if (sex === "female") {
      // If prostate is selected, swap for uterus
      let updated = selectedTargets.filter((t) => t !== "prostate");
      if (!updated.includes("uterus")) updated.push("uterus");
      onSelectTargets(updated);
    } else if (sex === "male") {
      // Remove female reproductive organs and add prostate
      let updated = selectedTargets.filter(
        (t) => !["uterus", "ovary_left", "ovary_right", "vagina"].includes(t)
      );
      if (!updated.includes("prostate")) updated.push("prostate");
      onSelectTargets(updated);
    }
  };

  // Web Speech API Voice Recognition
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice("Web Speech API not supported in this browser.");
      setTimeout(() => setVoiceNotice(null), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice("Listening... Say an anatomical organ (e.g. 'uterus', 'liver', 'brain')");
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceNotice(`Heard: "${spokenText}"`);
        handleSpokenTarget(spokenText);
      };

      recognition.onerror = (event: any) => {
        setVoiceNotice(`Speech error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceNotice(`Voice search error: ${err.message}`);
      setIsListening(false);
    }
  };

  const handleSpokenTarget = (spoken: string) => {
    let matched = spoken.replace(/\s+/g, "_");
    if (matched.includes("kidney")) {
      matched = matched.includes("right") ? "kidney_right" : "kidney_left";
    } else if (matched.includes("uterus") || matched.includes("womb")) {
      matched = "uterus";
    } else if (matched.includes("ovary") || matched.includes("ovaries")) {
      matched = matched.includes("right") ? "ovary_right" : "ovary_left";
    } else if (matched.includes("bladder")) {
      matched = "urinary_bladder";
    }

    if (!selectedTargets.includes(matched)) {
      onToggleTarget(matched);
    }
  };

  const filteredTargets = allTargets.filter((t) =>
    t.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
          2. Target Organs & Biological Sex
        </h3>
        <span className="text-[11px] font-mono text-primary-dark font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 w-fit">
          Sex-Aware 121-Organ Ensemble
        </span>
      </div>

      {/* Patient Biological Sex & Reproductive Anatomy */}
      <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Patient Sex:</span>
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleSexChange("auto")}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                patientSex === "auto"
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => handleSexChange("female")}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                patientSex === "female"
                  ? "bg-fuchsia-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Female ♀
            </button>
            <button
              type="button"
              onClick={() => handleSexChange("male")}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                patientSex === "male"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Male ♂
            </button>
          </div>
        </div>

        {/* Dynamic Reproductive Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
          <span className="text-[11px] font-medium text-slate-500">Reproductive:</span>
          {(patientSex === "female" || patientSex === "auto") &&
            FEMALE_REPRODUCTIVE.map((t) => {
              const isSelected = selectedTargets.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => onToggleTarget(t.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border ${
                    isSelected
                      ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-xs"
                      : "bg-white text-fuchsia-900 border-fuchsia-200 hover:bg-fuchsia-50"
                  }`}
                >
                  {t.label}
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </button>
              );
            })}

          {(patientSex === "male" || patientSex === "auto") &&
            MALE_REPRODUCTIVE.map((t) => {
              const isSelected = selectedTargets.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => onToggleTarget(t.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {t.label}
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </button>
              );
            })}
        </div>
      </div>

      {/* Target Search & Voice Input */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search 121 organs (e.g. uterus, liver, aorta, brain)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="button"
          onClick={startVoiceInput}
          title="Voice Search via Web Speech API"
          className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
            isListening
              ? "bg-accent-red text-white border-accent-red animate-pulse"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-text-muted" />}
        </button>
      </div>

      {voiceNotice && (
        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-dark">
          🎙️ {voiceNotice}
        </div>
      )}

      {/* Quick Select Common Benchmark Organ Chips */}
      <div>
        <span className="text-xs font-medium text-text-muted block mb-2">Primary Clinical Benchmarks:</span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_BENCHMARKS.map((t) => {
            const isSelected = selectedTargets.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => onToggleTarget(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {t.label}
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Search Results Dropdown */}
      {searchQuery.trim().length > 0 && (
        <div className="max-h-40 overflow-y-auto border border-border rounded-xl p-2 bg-slate-50 flex flex-wrap gap-1">
          {filteredTargets.slice(0, 24).map((t) => (
            <button
              key={t}
              onClick={() => {
                onToggleTarget(t);
                setSearchQuery("");
              }}
              className={`px-2 py-0.5 rounded-lg text-xs border ${
                selectedTargets.includes(t)
                  ? "bg-primary text-white border-primary"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
              }`}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Selected Targets Summary & Action Bar */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted">
            Selected: ({selectedTargets.length})
          </span>
          {selectedTargets.length > 0 && (
            <button
              onClick={onClearTargets}
              className="text-xs text-text-muted hover:text-accent-red underline"
            >
              Clear all
            </button>
          )}
        </div>

        <button
          onClick={onRunInference}
          disabled={!hasGeometry || selectedTargets.length === 0 || isPredicting}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${
            !hasGeometry || selectedTargets.length === 0 || isPredicting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark text-white cursor-pointer"
          }`}
        >
          {isPredicting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Predicting Centroids...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Predict 3D Centroids</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
