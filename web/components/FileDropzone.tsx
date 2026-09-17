"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, Camera, Layers, CheckCircle, Image as ImageIcon, Sparkles, User } from "lucide-react";

interface FileDropzoneProps {
  onFileLoaded: (file: File | { name: string; content: ArrayBuffer }) => void;
  isLoading: boolean;
  activeFileName: string | null;
  activeModality?: "mesh" | "depth" | "rgb";
  onModalityChange?: (modality: "mesh" | "depth" | "rgb") => void;
}

export function FileDropzone({
  onFileLoaded,
  isLoading,
  activeFileName,
  activeModality = "mesh",
  onModalityChange,
}: FileDropzoneProps) {
  const [activeTab, setActiveTab] = useState<"mesh" | "depth" | "rgb">(activeModality);
  const [rgbSex, setRgbSex] = useState<"female" | "male">("female");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(activeModality);
  }, [activeModality]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileLoaded(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileLoaded(file);
    }
  };

  const loadPreset = async (
    type: "whole_body" | "female_mesh" | "male_mesh" | "depth_camera" | "female_rgb" | "male_rgb"
  ) => {
    try {
      let filename = "";
      let outputName = "";

      if (type === "whole_body") {
        filename = "sample_whole_body_canonical.ply";
        outputName = "sample_whole_body_brain.ply";
      } else if (type === "female_mesh") {
        filename = "sample_female_body.ply";
        outputName = "sample_female_scan_4096.ply";
      } else if (type === "male_mesh") {
        filename = "sample_male_body.ply";
        outputName = "sample_male_scan_4096.ply";
      } else if (type === "depth_camera") {
        filename = "sample_depth_camera.png";
        outputName = "realsense_depth_frame.png";
      } else if (type === "female_rgb") {
        filename = "sample_patient_female_rgb.jpg";
        outputName = "clinical_female_patient.jpg";
        setRgbSex("female");
      } else if (type === "male_rgb") {
        filename = "sample_patient_male_rgb.jpg";
        outputName = "clinical_male_patient.jpg";
        setRgbSex("male");
      }

      const res = await fetch(`/demo/${filename}`);
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      const buffer = await res.arrayBuffer();
      onFileLoaded({
        name: outputName,
        content: buffer,
      });
    } catch (err) {
      console.error("Failed to load preset scan:", err);
    }
  };

  const handleTabSelect = (tab: "mesh" | "depth" | "rgb") => {
    setActiveTab(tab);
    onModalityChange?.(tab);

    if (tab === "mesh") {
      loadPreset("female_mesh");
    } else if (tab === "depth") {
      loadPreset("depth_camera");
    } else if (tab === "rgb") {
      loadPreset("female_rgb");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-main uppercase tracking-wider">
          1. Patient Input Modality
        </span>
        <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          <span>Real Patient Scans</span>
        </span>
      </div>

      {/* Input Modality Switcher with Brand Olive Green */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-xl border border-border text-xs">
        <button
          type="button"
          onClick={() => handleTabSelect("mesh")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "mesh"
              ? "bg-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D Scan</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect("depth")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "depth"
              ? "bg-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Depth Cam</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect("rgb")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "rgb"
              ? "bg-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>RGB Photo</span>
        </button>
      </div>

      {/* Modality Specific Content */}
      <div className="relative rounded-xl border border-border bg-slate-50/70 p-3 overflow-hidden flex flex-col gap-2.5">
        {activeTab === "mesh" ? (
          <div className="flex flex-col gap-2.5">
            {/* Quick Presets for 3D Mesh Scans */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset("female_mesh")}
                className="px-2 py-0.5 text-[11px] rounded-md font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors flex items-center gap-1"
              >
                <span>♀ Female Scan</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset("male_mesh")}
                className="px-2 py-0.5 text-[11px] rounded-md font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors flex items-center gap-1"
              >
                <span>♂ Male Scan</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset("whole_body")}
                className="px-2 py-0.5 text-[11px] rounded-md font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                Full Body (CT-ORG)
              </button>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 bg-white hover:border-primary/50"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {activeFileName ? `Active: ${activeFileName}` : "Female Patient Scan (4,096 pts)"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Dense 4,096 points &bull; Click or drop custom .PLY / .OBJ / .XYZ
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "depth" ? (
          <div className="flex flex-col gap-2">
            <div className="relative h-40 w-full rounded-lg overflow-hidden border border-slate-300 bg-slate-950 flex items-center justify-center shadow-inner">
              <img
                src="/demo/sample_depth_camera.png"
                alt="Intel RealSense 3D Depth Sensor Stream"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-sky-500/30">
                Intel RealSense D435 &bull; Depth Range: 1.45m &ndash; 2.15m
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-600">4,096 metric depth points</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Upload Depth Map (.PNG/.EXR)
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Quick Presets for Real Clinical Photographs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-medium text-slate-500">Patient:</span>
                <button
                  type="button"
                  onClick={() => loadPreset("female_rgb")}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                    rgbSex === "female"
                      ? "bg-fuchsia-600 text-white shadow-xs"
                      : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  }`}
                >
                  ♀ Female Patient
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("male_rgb")}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                    rgbSex === "male"
                      ? "bg-sky-700 text-white shadow-xs"
                      : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  }`}
                >
                  ♂ Male Patient
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Upload Photo
              </button>
            </div>

            {/* Real Clinical Photo Preview */}
            <div className="relative h-44 w-full rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-inner">
              <img
                src={
                  rgbSex === "female"
                    ? "/demo/sample_patient_female_rgb.jpg"
                    : "/demo/sample_patient_male_rgb.jpg"
                }
                alt="Authentic Clinical Patient Photograph"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                Clinical Photogrammetry &bull; Dense 4,096 Point Lift
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={
            activeTab === "mesh"
              ? ".ply,.obj,.stl,.xyz,.npy,.pcd"
              : activeTab === "depth"
              ? ".png,.jpg,.jpeg,.exr,.tiff"
              : ".jpg,.jpeg,.png,.webp"
          }
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
