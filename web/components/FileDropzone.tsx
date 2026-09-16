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

  const loadDemoScan = async () => {
    try {
      const res = await fetch("/demo/sample_torso.ply");
      if (!res.ok) throw new Error("Failed to load sample torso");
      const buffer = await res.arrayBuffer();
      onFileLoaded({
        name: "sample_torso.ply",
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
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? "border-primary bg-primary/5"
            : activeFileName
            ? "border-accent-green/40 bg-accent-green/5"
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

        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-primary">
          {isLoading ? (
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          ) : activeFileName ? (
            <CheckCircle className="w-6 h-6 text-accent-green" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-text-main">
            {activeFileName ? `Loaded: ${activeFileName}` : "Drag & drop patient 3D surface scan"}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Supports <span className="font-mono text-primary-dark">.PLY, .PCD, .OBJ, .STL, .XYZ, .NPY</span> (Human scale: mm, cm, or m)
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadDemoScan();
            }}
            className="px-3 py-1 text-xs font-medium rounded-md bg-background hover:bg-border text-primary-dark border border-border transition-colors shadow-sm"
          >
            ⚡ Load Pre-aligned Sample Torso
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
