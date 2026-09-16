"use client";

import React, { useRef, useState } from "react";
import { Upload, FileCode, CheckCircle, ShieldCheck, RefreshCw } from "lucide-react";

interface FileDropzoneProps {
  onFileLoaded: (file: File | { name: string; content: ArrayBuffer }) => void;
  isLoading: boolean;
  activeFileName: string | null;
}

export function FileDropzone({ onFileLoaded, isLoading, activeFileName }: FileDropzoneProps) {
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

  const loadDemoScan = async (type: "whole_body" | "torso" = "whole_body") => {
    try {
      const filename =
        type === "whole_body"
          ? "sample_whole_body_canonical.ply"
          : "sample_torso_canonical.ply";
      const res = await fetch(`/demo/${filename}`);
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      const buffer = await res.arrayBuffer();
      onFileLoaded({
        name: type === "whole_body" ? "sample_whole_body_brain.ply" : "sample_torso.ply",
        content: buffer,
      });
    } catch (err) {
      console.error("Failed to load demo scan:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
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
          accept=".ply,.pcd,.obj,.stl,.xyz,.npy"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          ) : activeFileName ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <Upload className="w-5 h-5 text-slate-600" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {activeFileName ? `Loaded: ${activeFileName}` : "Drag & drop patient 3D surface scan"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports <span className="font-mono text-slate-700">.PLY, .OBJ, .STL, .XYZ, .NPY</span> (mm, cm, or m)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadDemoScan("whole_body");
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-2xs"
          >
            ⚡ Whole-Body Scan (with Brain & Head)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadDemoScan("torso");
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            Torso Scan (TotalSegmentator)
          </button>
        </div>
      </div>

      {/* Ephemeral Privacy Guarantee Notice */}
      <div className="flex items-center gap-2 text-xs text-text-muted px-2 py-1 bg-white rounded-lg border border-border">
        <ShieldCheck className="w-4 h-4 text-accent-green shrink-0" />
        <span>
          <strong>Ephemeral Memory Processing:</strong> Uploaded surface point coordinates are parsed in transient GPU memory and immediately discarded. Never stored on disk.
        </span>
      </div>
    </div>
  );
}
