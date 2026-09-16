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

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Input Modality Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("mesh")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "mesh"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>3D Mesh / Scans</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("depth")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "depth"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-sky-600" />
          <span>3D Depth Camera</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rgb")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "rgb"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>Clinical RGB Photo</span>
        </button>
      </div>

      {/* Main Dropzone Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
          isDragOver
            ? "border-primary bg-primary/5"
            : activeFileName
            ? "border-emerald-500/40 bg-emerald-50/20"
            : "border-border bg-white hover:border-primary/50"
        }`}
      >
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

        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          ) : activeFileName ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : activeTab === "depth" ? (
            <Camera className="w-5 h-5 text-sky-600" />
          ) : activeTab === "rgb" ? (
            <ImageIcon className="w-5 h-5 text-amber-600" />
          ) : (
            <Upload className="w-5 h-5 text-slate-600" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {activeFileName
              ? `Loaded: ${activeFileName}`
              : activeTab === "mesh"
              ? "Drag & drop 3D patient surface scan (.PLY, .OBJ, .STL)"
              : activeTab === "depth"
              ? "Upload 3D Depth Camera image (RealSense / Kinect / LiDAR)"
              : "Upload standard clinical RGB patient photograph"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === "mesh"
              ? "Supports .PLY, .OBJ, .STL, .XYZ, .NPY (auto unit scaling mm/cm/m)"
              : activeTab === "depth"
              ? "Auto-unprojects depth frame into 4,096 canonical 3D surface points"
              : "Optical photogrammetry lifts 2D patient silhouette to 3D surface points"}
          </p>
        </div>

        {/* Preset 1-Click Loaders */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadPreset("whole_body");
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-2xs"
          >
            ⚡ 3D Whole-Body Scan (with Brain)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadPreset("depth_camera");
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
          >
            📷 Sample 3D Depth Camera Frame
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadPreset("clinical_rgb");
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors shadow-2xs"
          >
            🖼️ Sample Clinical RGB Photo
          </button>
        </div>
      </div>

      {/* Ephemeral Privacy Guarantee Notice */}
      <div className="flex items-center gap-2 text-xs text-text-muted px-2.5 py-1.5 bg-white rounded-xl border border-border">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Ephemeral Memory Processing:</strong> Uploaded images or surface scans are parsed in transient GPU memory and immediately discarded. Never stored on disk.
        </span>
      </div>
    </div>
  );
}

