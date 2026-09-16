"use client";

import React, { useState, useEffect } from "react";
import { ThreeViewer, TargetPrediction } from "@/components/ThreeViewer";
import { FileDropzone } from "@/components/FileDropzone";
import { TargetSelector } from "@/components/TargetSelector";
import { PredictionResults } from "@/components/PredictionResults";
import { parsePointsFromBuffer } from "@/utils/pointParser";
import { AlertCircle, CheckCircle2, Layers } from "lucide-react";

export default function DemoPage() {
  const [surfacePoints, setSurfacePoints] = useState<number[][] | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const [selectedTargets, setSelectedTargets] = useState<string[]>([
    "liver",
    "spleen",
    "kidney_left",
    "kidney_right",
  ]);
  const [activeFocusedTarget, setActiveFocusedTarget] = useState<string | null>("liver");
  const [modelVariant, setModelVariant] = useState<string>("phase10r");

  const [predictions, setPredictions] = useState<Record<string, TargetPrediction> | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [prepLatencyMs, setPrepLatencyMs] = useState<number | null>(null);
  const [coordinateFrame, setCoordinateFrame] = useState<"canonical" | "world">("canonical");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-load demo scan on initial mount
  useEffect(() => {
    fetch("/demo/sample_torso.ply")
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        handleFileLoaded({ name: "sample_torso.ply", content: buf });
      })
      .catch((err) => console.error("Could not autoload sample torso:", err));
  }, []);

  const handleFileLoaded = async (fileInput: File | { name: string; content: ArrayBuffer }) => {
    try {
      setErrorMessage(null);
      let name: string;
      let buf: ArrayBuffer;

      if ("content" in fileInput) {
        name = fileInput.name;
        buf = fileInput.content;
      } else {
        name = fileInput.name;
        buf = await fileInput.arrayBuffer();
      }

      setActiveFileName(name);
      setFileBuffer(buf);

      // Parse points for local rendering
      const pts = parsePointsFromBuffer(name, buf);
      if (pts.length > 0) {
        setSurfacePoints(pts);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to parse point cloud: ${err.message}`);
    }
  };

  const handleToggleTarget = (t: string) => {
    if (selectedTargets.includes(t)) {
      setSelectedTargets(selectedTargets.filter((x) => x !== t));
    } else {
      setSelectedTargets([...selectedTargets, t]);
    }
  };

  const handleRunInference = async () => {
    if (!fileBuffer || !activeFileName) {
      setErrorMessage("Please upload a 3D surface scan or load the demo scan first.");
      return;
    }
    if (selectedTargets.length === 0) {
      setErrorMessage("Please select at least one anatomical target to localize.");
      return;
    }

    setIsPredicting(true);
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_INFERENCE_API_URL || "http://localhost:8000";

    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append("file", blob, activeFileName);
      formData.append("targets", selectedTargets.join(","));
      formData.append("model_variant", modelVariant);

      const endpoint = selectedTargets.length === 1 ? `${apiUrl}/predict` : `${apiUrl}/predict-multiple`;
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ detail: "Inference server error" }));
        throw new Error(errorJson.detail || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setPredictions(data.results);
      setLatencyMs(data.model_latency_ms);
      setPrepLatencyMs(data.preprocessing_latency_ms);

      if (selectedTargets.length > 0 && !selectedTargets.includes(activeFocusedTarget || "")) {
        setActiveFocusedTarget(selectedTargets[0]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        `Inference request failed: ${err.message}. Ensure backend is running at ${apiUrl}`
      );
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Title & Description Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span>3D Interactive Anatomy Localization</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-primary/10 text-primary-dark border border-primary/20">
              GPU-Accelerated Cross-Attention
            </span>
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Upload an external patient body scan (.PLY, .OBJ, .STL) to predict 3D centroid positions and multi-seed disagreement halos for internal anatomical organs without ionizing radiation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunInference}
            disabled={isPredicting || !fileBuffer}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {isPredicting ? "Computing Centroids..." : "Predict 3D Centroids"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red p-4 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Dropzone & Target Selector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <FileDropzone
            onFileLoaded={handleFileLoaded}
            isLoading={false}
            activeFileName={activeFileName}
          />

          <TargetSelector
            selectedTargets={selectedTargets}
            onToggleTarget={handleToggleTarget}
            onClearTargets={() => setSelectedTargets([])}
            onSelectTargets={setSelectedTargets}
            modelVariant={modelVariant}
            onModelVariantChange={setModelVariant}
            onRunInference={handleRunInference}
            isPredicting={isPredicting}
            hasGeometry={!!fileBuffer}
          />

          <PredictionResults
            predictions={predictions}
            selectedTarget={activeFocusedTarget}
            onSelectTarget={setActiveFocusedTarget}
            latencyMs={latencyMs}
            prepLatencyMs={prepLatencyMs}
            coordinateFrame={coordinateFrame}
            onToggleFrame={setCoordinateFrame}
          />
        </div>

        {/* Right Column: 3D Canvas Viewer (7 cols) */}
        <div className="lg:col-span-7 h-[780px] sticky top-20 flex flex-col">
          <ThreeViewer
            surfacePoints={surfacePoints}
            predictions={predictions}
            selectedTarget={activeFocusedTarget}
            onSelectTarget={setActiveFocusedTarget}
            coordinateFrame={coordinateFrame}
          />
        </div>
      </div>
    </div>
  );
}
