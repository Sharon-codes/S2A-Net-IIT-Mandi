"use client";

import React, { useState, useEffect } from "react";
import { Search, Mic, MicOff, Check, X, Sparkles, AlertCircle } from "lucide-react";

interface TargetSelectorProps {
  selectedTargets: string[];
  onToggleTarget: (target: string) => void;
  onClearTargets: () => void;
  onSelectTargets: (targets: string[]) => void;
  modelVariant: string;
  onModelVariantChange: (variant: string) => void;
  onRunInference: () => void;
  isPredicting: boolean;
  hasGeometry: boolean;
}

const COMMON_TARGETS = [
  { id: "liver", label: "Liver" },
  { id: "spleen", label: "Spleen" },
  { id: "kidney_left", label: "Left Kidney" },
  { id: "kidney_right", label: "Right Kidney" },
  { id: "heart", label: "Heart" },
  { id: "aorta", label: "Aorta" },
  { id: "urinary_bladder", label: "Urinary Bladder" },
  { id: "brain", label: "Brain" },
  { id: "pancreas", label: "Pancreas" },
  { id: "gallbladder", label: "Gallbladder" },
];

export function TargetSelector({
  selectedTargets,
  onToggleTarget,
  onClearTargets,
  onSelectTargets,
  modelVariant,
  onModelVariantChange,
  onRunInference,
  isPredicting,
  hasGeometry,
}: TargetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allTargets, setAllTargets] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Fetch all 104 targets from API catalog
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
        setAllTargets(COMMON_TARGETS.map((t) => t.id));
      });
  }, []);

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
        setVoiceNotice("Listening... Say an anatomical organ (e.g. 'liver', 'spleen', 'brain')");
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
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSpokenTarget = (text: string) => {
    // Normalization mapping
    let matched = text.replace(/\s+/g, "_");
    if (matched.includes("liver")) matched = "liver";
    else if (matched.includes("spleen")) matched = "spleen";
    else if (matched.includes("left_kidney") || (matched.includes("kidney") && matched.includes("left")))
      matched = "kidney_left";
    else if (matched.includes("right_kidney") || (matched.includes("kidney") && matched.includes("right")))
      matched = "kidney_right";
    else if (matched.includes("brain")) matched = "brain";
    else if (matched.includes("heart")) matched = "heart";
    else if (matched.includes("aorta")) matched = "aorta";
    else if (matched.includes("bladder")) matched = "urinary_bladder";
    else if (matched.includes("pancreas")) matched = "pancreas";

    if (!selectedTargets.includes(matched)) {
      onToggleTarget(matched);
    }
  };

  const filteredTargets = allTargets.filter((t) =>
    t.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
          1. Model & Target Specification
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Model Variant:</label>
          <select
            value={modelVariant}
            onChange={(e) => onModelVariantChange(e.target.value)}
            className="text-xs font-medium bg-background border border-border rounded-md px-2 py-1 text-primary-dark focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="phase10r">Phase 10R (Frozen Baseline - 104 Targets)</option>
            <option value="phase16_brain">Phase 16 (Retrained Brain-Aware Whole Body)</option>
          </select>
        </div>
      </div>

      {/* Target Search & Voice Input */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search anatomy (e.g. liver, left kidney, aorta, brain)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="button"
          onClick={startVoiceInput}
          title="Voice Search via Web Speech API"
          className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
            isListening
              ? "bg-accent-red text-white border-accent-red animate-pulse"
              : "bg-background hover:bg-border text-primary-dark border-border"
          }`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-text-muted" />}
        </button>
      </div>

      {voiceNotice && (
        <div className="text-xs font-mono px-3 py-1.5 rounded bg-primary/10 border border-primary/20 text-primary-dark">
          🎙️ {voiceNotice}
        </div>
      )}

      {/* Quick Select Preset Organ Chips */}
      <div>
        <span className="text-xs font-medium text-text-muted block mb-2">Quick Benchmarks:</span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TARGETS.map((t) => {
            const isSelected = selectedTargets.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => onToggleTarget(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-background hover:bg-border text-text-main border-border"
                }`}
              >
                {t.label}
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Search Results Dropdown if searching */}
      {searchQuery.trim().length > 0 && (
        <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 bg-background/30 flex flex-wrap gap-1">
          {filteredTargets.slice(0, 20).map((t) => (
            <button
              key={t}
              onClick={() => {
                onToggleTarget(t);
                setSearchQuery("");
              }}
              className={`px-2 py-0.5 rounded text-xs border ${
                selectedTargets.includes(t)
                  ? "bg-primary text-white border-primary"
                  : "bg-white hover:bg-background border-border text-text-main"
              }`}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Selected Targets Drawer & Action Bar */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted">
            Selected Targets: ({selectedTargets.length})
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
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${
            !hasGeometry || selectedTargets.length === 0 || isPredicting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark text-white cursor-pointer"
          }`}
        >
          {isPredicting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Inferring Anatomy...</span>
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
