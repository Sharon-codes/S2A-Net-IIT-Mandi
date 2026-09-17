"use client";

import React, { useState } from "react";
import { Download, ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react";
import { TargetPrediction } from "./ThreeViewer";

interface PredictionResultsProps {
  predictions: Record<string, TargetPrediction> | null;
  selectedTarget: string | null;
  onSelectTarget: (target: string) => void;
  latencyMs: number | null;
  prepLatencyMs: number | null;
  coordinateFrame: "canonical" | "world";
  onToggleFrame: (frame: "canonical" | "world") => void;
}

export function PredictionResults({
  predictions,
  selectedTarget,
  onSelectTarget,
  latencyMs,
  prepLatencyMs,
  coordinateFrame,
  onToggleFrame,
}: PredictionResultsProps) {
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  if (!predictions || Object.keys(predictions).length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-border text-center text-text-muted flex flex-col items-center justify-center gap-2">
        <p className="text-sm font-medium">No target predictions generated yet.</p>
        <p className="text-xs">Upload a surface scan, pick anatomical targets, and click &quot;Predict 3D Centroids&quot;.</p>
      </div>
    );
  }

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(predictions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "surface2anatomy_predictions.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ["Target", "Target_Index", "X_mm", "Y_mm", "Z_mm", "Uncertainty_mm", "Uncertainty_Level", "Frame"];
    const rows = Object.values(predictions).map((p) => {
      const coords = coordinateFrame === "world" ? p.centroid_input_world_mm : p.centroid_canonical_mm;
      return [
        p.target,
        p.target_index,
        coords[0],
        coords[1],
        coords[2],
        p.uncertainty_mm,
        p.uncertainty_level,
        coordinateFrame,
      ].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","), ...rows].join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `surface2anatomy_${coordinateFrame}_coords.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
            2. Predicted Anatomical Coordinates
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Prep: {prepLatencyMs ?? "--"} ms</span>
            <span>&bull;</span>
            <span>GPU Inference: {latencyMs ?? "--"} ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame Toggle */}
          <div className="flex rounded-md border border-border p-0.5 bg-background text-xs font-mono">
            <button
              onClick={() => onToggleFrame("canonical")}
              className={`px-2 py-1 rounded transition-colors ${
                coordinateFrame === "canonical" ? "bg-white text-primary-dark font-bold shadow-xs" : "text-text-muted"
              }`}
            >
              Canonical mm
            </button>
            <button
              onClick={() => onToggleFrame("world")}
              className={`px-2 py-1 rounded transition-colors ${
                coordinateFrame === "world" ? "bg-white text-primary-dark font-bold shadow-xs" : "text-text-muted"
              }`}
            >
              Input World mm
            </button>
          </div>

          <button
            onClick={exportJSON}
            className="p-1.5 rounded-md hover:bg-background border border-border text-xs text-text-muted transition-colors"
            title="Export JSON"
          >
            JSON
          </button>
          <button
            onClick={exportCSV}
            className="p-1.5 rounded-md hover:bg-background border border-border text-xs text-text-muted transition-colors"
            title="Export CSV"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Target Cards List */}
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {Object.entries(predictions).map(([name, pred]) => {
          const coords = coordinateFrame === "world" ? pred.centroid_input_world_mm : pred.centroid_canonical_mm;
          const isSelected = selectedTarget === name;
          const isExpanded = expandedTarget === name;

          return (
            <div
              key={name}
              onClick={() => onSelectTarget(name)}
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-border/80 bg-background/40 hover:bg-background/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-text-main capitalize">
                    {name.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Uncertainty Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium ${
                      pred.uncertainty_level === "low"
                        ? "bg-accent-green/10 text-accent-green border-accent-green/30"
                        : pred.uncertainty_level === "moderate"
                        ? "bg-accent-amber/10 text-accent-amber border-accent-amber/30"
                        : "bg-accent-red/10 text-accent-red border-accent-red/30"
                    }`}
                  >
                    &plusmn;{pred.uncertainty_mm.toFixed(1)} mm ({pred.uncertainty_level})
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTarget(isExpanded ? null : name);
                    }}
                    className="p-1 text-text-muted hover:text-text-main"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Centroid Coordinate Readout */}
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-white px-2 py-1 rounded border border-border flex justify-between">
                  <span className="text-text-muted">X:</span>
                  <span className="font-bold text-text-main">{coords[0].toFixed(1)} mm</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-border flex justify-between">
                  <span className="text-text-muted">Y:</span>
                  <span className="font-bold text-text-main">{coords[1].toFixed(1)} mm</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-border flex justify-between">
                  <span className="text-text-muted">Z:</span>
                  <span className="font-bold text-text-main">{coords[2].toFixed(1)} mm</span>
                </div>
              </div>

              {/* Seed Breakdown Accordion */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/80 text-xs font-mono flex flex-col gap-1.5 bg-white p-2.5 rounded border border-border">
                  <span className="text-text-muted font-sans font-medium text-[11px] block">
                    3-Seed Model Ensemble Disagreement:
                  </span>
                  {Object.entries(pred.seed_predictions_mm).map(([seed, scoords]) => (
                    <div key={seed} className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>Seed {seed}:</span>
                      <span>
                        [{scoords[0].toFixed(1)}, {scoords[1].toFixed(1)}, {scoords[2].toFixed(1)}] mm
                      </span>
                    </div>
                  ))}
                  <div className="text-[10px] text-text-muted/80 mt-1 font-sans">
                    Uncertainty metric: RMS deviation of seed predictions from canonical consensus.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
