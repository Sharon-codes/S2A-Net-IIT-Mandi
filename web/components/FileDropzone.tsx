"use client";

import React, { useRef, useState } from "react";
import { Upload, Camera, Layers, CheckCircle, ShieldCheck, RefreshCw, Image as ImageIcon } from "lucide-react";

interface FileDropzoneProps {
  onFileLoaded: (file: File | { name: string; content: ArrayBuffer }) => void;
  isLoading: boolean;
  activeFileName: string | null;
}

export function FileDropzone({ onFileLoaded, isLoading, activeFileName }: FileDropzoneProps) {
  const [activeTab, setActiveTab] = useState<"mesh" | "depth" | "rgb">("mesh");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const loadPreset = async (type: "whole_body" | "depth_camera" | "clinical_rgb" | "torso") => {
    try {
      let filename = "";
      let outputName = "";

      if (type === "whole_body") {
        filename = "sample_whole_body_canonical.ply";
        outputName = "sample_whole_body_brain.ply";
      } else if (type === "depth_camera") {
        filename = "sample_depth_camera.png";
        outputName = "realsense_depth_frame.png";
      } else if (type === "clinical_rgb") {
        filename = "sample_clinical_photo.jpg";
        outputName = "patient_clinical_photo.jpg";
      } else {
        filename = "sample_torso_canonical.ply";
        outputName = "sample_torso.ply";
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
    if (tab === "mesh") {
      loadPreset("whole_body");
    } else if (tab === "depth") {
      loadPreset("depth_camera");
    } else if (tab === "rgb") {
      loadPreset("clinical_rgb");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-white p-4 rounded-xl border border-border shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-main uppercase tracking-wider">
          1. Patient Input Modality
        </span>
        <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>Real Clinical Dataset</span>
        </span>
      </div>

      {/* Input Modality Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => handleTabSelect("mesh")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "mesh"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>3D Scan</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect("depth")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "depth"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-sky-600" />
          <span>Depth Camera</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect("rgb")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold transition-all ${
            activeTab === "rgb"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>RGB Picture</span>
        </button>
      </div>

      {/* Active Modality Preview Card */}
      <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3 overflow-hidden flex flex-col gap-2">
        {activeTab === "depth" ? (
          <div className="flex flex-col gap-2">
            <div className="relative h-44 w-full rounded-lg overflow-hidden border border-slate-300 bg-slate-950 flex items-center justify-center shadow-inner">
              <img
                src="/demo/sample_depth_camera.png"
                alt="Real 3D Depth Camera Sensor Stream"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-sky-500/30">
                RGB-D Sensor &bull; Depth Range: 1.45m &ndash; 2.15m
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Real Intel RealSense / LiDAR depth stream</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Upload Custom Depth Map
              </button>
            </div>
          </div>
        ) : activeTab === "rgb" ? (
          <div className="flex flex-col gap-2">
            <div className="relative h-44 w-full rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-inner">
              <img
                src="/demo/sample_clinical_photo.jpg"
                alt="Real Clinical Patient Photograph"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                Optical Camera &bull; 2D Silhouette Lifting
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Real clinical surface inspection photo</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Upload Custom Photo
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-slate-300 bg-white hover:border-primary/50"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {activeFileName ? `Active: ${activeFileName}` : "CT-ORG Patient Surface Scan (Case 019)"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                4,096 canonical 3D surface points &bull; Click to upload custom .PLY / .OBJ
              </p>
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

