"use client";

import React, { useState } from "react";
import { Search, Tag, Filter } from "lucide-react";

interface TargetItem {
  slot: number;
  name: string;
  category: string;
  synonyms: string[];
}

const CATEGORIES: Record<string, { name: string; targets: { slot: number; name: string; synonyms: string[] }[] }> = {
  hepatobiliary: {
    name: "Hepatobiliary & Spleen",
    targets: [
      { slot: 4, name: "liver", synonyms: ["hepatic parenchyma", "hepar"] },
      { slot: 3, name: "spleen", synonyms: ["lien"] },
      { slot: 5, name: "gallbladder", synonyms: ["cholecyst", "biliary vesicle"] },
      { slot: 6, name: "pancreas", synonyms: ["pancreatic gland"] },
    ],
  },
  urinary: {
    name: "Urinary & Renal",
    targets: [
      { slot: 1, name: "kidney_right", synonyms: ["right renal gland", "ren dexter"] },
      { slot: 2, name: "kidney_left", synonyms: ["left renal gland", "ren sinister"] },
      { slot: 17, name: "urinary_bladder", synonyms: ["bladder", "vesica urinaria"] },
      { slot: 22, name: "prostate", synonyms: ["prostatic gland"] },
    ],
  },
  cardiovascular: {
    name: "Cardiovascular & Major Vessels",
    targets: [
      { slot: 49, name: "heart", synonyms: ["cardiac organ", "cor"] },
      { slot: 7, name: "aorta", synonyms: ["abdominal aorta", "thoracic aorta"] },
      { slot: 8, name: "inferior_vena_cava", synonyms: ["IVC", "postcava"] },
      { slot: 50, name: "pulmonary_artery", synonyms: ["truncus pulmonalis"] },
    ],
  },
  respiratory: {
    name: "Respiratory & Thoracic",
    targets: [
      { slot: 9, name: "lung_upper_lobe_left", synonyms: ["left upper lung"] },
      { slot: 10, name: "lung_lower_lobe_left", synonyms: ["left lower lung"] },
      { slot: 11, name: "lung_upper_lobe_right", synonyms: ["right upper lung"] },
      { slot: 12, name: "lung_middle_lobe_right", synonyms: ["right middle lung"] },
      { slot: 13, name: "lung_lower_lobe_right", synonyms: ["right lower lung"] },
      { slot: 48, name: "trachea", synonyms: ["windpipe"] },
    ],
  },
  gastrointestinal: {
    name: "Digestive & Gastrointestinal",
    targets: [
      { slot: 14, name: "esophagus", synonyms: ["gullet"] },
      { slot: 15, name: "stomach", synonyms: ["gaster", "ventriculus"] },
      { slot: 16, name: "duodenum", synonyms: ["proximal small intestine"] },
      { slot: 53, name: "colon", synonyms: ["large bowel", "large intestine"] },
    ],
  },
  cranial_nervous: {
    name: "Cranial & Nervous System",
    targets: [
      { slot: 89, name: "brain", synonyms: ["cerebrum", "encephalon", "cranial cavity"] },
      { slot: 18, name: "spinal_cord", synonyms: ["medulla spinalis", "spine"] },
    ],
  },
  skeletal: {
    name: "Musculoskeletal & Pelvic Landmarks",
    targets: [
      { slot: 23, name: "femur_left", synonyms: ["left thigh bone"] },
      { slot: 24, name: "femur_right", synonyms: ["right thigh bone"] },
      { slot: 25, name: "hip_left", synonyms: ["left os coxae", "left ilium"] },
      { slot: 26, name: "hip_right", synonyms: ["right os coxae", "right ilium"] },
      { slot: 27, name: "sacrum", synonyms: ["sacral vertebra"] },
    ],
  },
};

export default function TargetsPage() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filteredCategories = Object.entries(CATEGORIES).filter(([key, cat]) => {
    if (selectedCat !== "all" && selectedCat !== key) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-text-main">104 Anatomical Target Catalog</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Comprehensive inventory of internal anatomical landmarks supported by Surface2Anatomy, indexed according to standard TotalSegmentator and CT-ORG anatomical query slots.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search organs or synonyms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedCat === "all"
                ? "bg-primary text-white border-primary"
                : "bg-background text-text-muted border-border hover:text-text-main"
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setSelectedCat(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedCat === k
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-text-muted border-border hover:text-text-main"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-col gap-6">
        {filteredCategories.map(([key, cat]) => {
          const matchingTargets = cat.targets.filter((t) => {
            if (!query.trim()) return true;
            const q = query.toLowerCase().trim();
            return (
              t.name.toLowerCase().includes(q) ||
              t.synonyms.some((s) => s.toLowerCase().includes(q)) ||
              t.slot.toString() === q
            );
          });

          if (matchingTargets.length === 0) return null;

          return (
            <div key={key} className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-text-main">{cat.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-text-muted">
                  {matchingTargets.length} targets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchingTargets.map((t) => (
                  <div
                    key={t.slot}
                    className="p-3 rounded-lg border border-border bg-background/30 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-text-main capitalize">
                        {t.name.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-border text-text-muted">
                        Slot #{t.slot}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {t.synonyms.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-border/80 text-text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
