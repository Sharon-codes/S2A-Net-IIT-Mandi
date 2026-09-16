"use client";

import React, { useState } from "react";
import { Search, Tag, Filter, CheckCircle2 } from "lucide-react";

interface CategoryData {
  name: string;
  description: string;
  targets: { slot: number; name: string; synonyms: string[] }[];
}

const ALL_CATEGORIES: Record<string, CategoryData> = {
  abdominal: {
    name: "Abdominal & Digestive",
    description: "Visceral digestive organs, glandular structures, and bowel segments",
    targets: [
      { slot: 4, name: "liver", synonyms: ["hepatic parenchyma", "hepar"] },
      { slot: 3, name: "spleen", synonyms: ["lien", "splenic tissue"] },
      { slot: 6, name: "pancreas", synonyms: ["pancreatic gland", "pancreatic body"] },
      { slot: 5, name: "gallbladder", synonyms: ["cholecyst", "biliary vesicle"] },
      { slot: 15, name: "stomach", synonyms: ["gaster", "ventriculus"] },
      { slot: 16, name: "duodenum", synonyms: ["proximal small intestine"] },
      { slot: 17, name: "small_bowel", synonyms: ["jejunum", "ileum", "small intestine"] },
      { slot: 53, name: "colon", synonyms: ["large bowel", "large intestine"] },
      { slot: 1, name: "kidney_right", synonyms: ["right renal gland", "ren dexter"] },
      { slot: 2, name: "kidney_left", synonyms: ["left renal gland", "ren sinister"] },
      { slot: 7, name: "adrenal_gland_right", synonyms: ["right suprarenal gland"] },
      { slot: 8, name: "adrenal_gland_left", synonyms: ["left suprarenal gland"] },
      { slot: 22, name: "kidney_cyst_left", synonyms: ["left renal cyst"] },
      { slot: 23, name: "kidney_cyst_right", synonyms: ["right renal cyst"] },
    ],
  },
  thoracic: {
    name: "Thoracic & Respiratory",
    description: "Pulmonary lobes, mediastinal structures, and airway conduits",
    targets: [
      { slot: 49, name: "heart", synonyms: ["cardiac organ", "cor", "myocardium"] },
      { slot: 48, name: "trachea", synonyms: ["windpipe", "respiratory tube"] },
      { slot: 14, name: "esophagus", synonyms: ["gullet", "alimentary canal"] },
      { slot: 47, name: "thyroid_gland", synonyms: ["thyroid", "glandula thyroidea"] },
      { slot: 9, name: "lung_upper_lobe_left", synonyms: ["LUL", "left upper lung"] },
      { slot: 10, name: "lung_lower_lobe_left", synonyms: ["LLL", "left lower lung"] },
      { slot: 11, name: "lung_upper_lobe_right", synonyms: ["RUL", "right upper lung"] },
      { slot: 12, name: "lung_middle_lobe_right", synonyms: ["RML", "right middle lung"] },
      { slot: 13, name: "lung_lower_lobe_right", synonyms: ["RLL", "right lower lung"] },
    ],
  },
  vascular: {
    name: "Cardiovascular & Major Vessels",
    description: "Great arteries, central veins, and systemic venous return",
    targets: [
      { slot: 50, name: "aorta", synonyms: ["thoracic aorta", "abdominal aorta"] },
      { slot: 61, name: "superior_vena_cava", synonyms: ["SVC", "precava"] },
      { slot: 62, name: "inferior_vena_cava", synonyms: ["IVC", "postcava"] },
      { slot: 51, name: "pulmonary_vein", synonyms: ["venae pulmonales"] },
      { slot: 52, name: "brachiocephalic_trunk", synonyms: ["innominate artery"] },
      { slot: 54, name: "subclavian_artery_right", synonyms: ["right subclavian"] },
      { slot: 55, name: "subclavian_artery_left", synonyms: ["left subclavian"] },
      { slot: 56, name: "common_carotid_artery_right", synonyms: ["right carotid"] },
      { slot: 57, name: "common_carotid_artery_left", synonyms: ["left carotid"] },
      { slot: 58, name: "brachiocephalic_vein_left", synonyms: ["left innominate vein"] },
      { slot: 59, name: "brachiocephalic_vein_right", synonyms: ["right innominate vein"] },
      { slot: 60, name: "atrial_appendage_left", synonyms: ["left auricle"] },
      { slot: 63, name: "portal_vein_and_splenic_vein", synonyms: ["portal venous confluence"] },
      { slot: 64, name: "iliac_artery_left", synonyms: ["left common iliac artery"] },
      { slot: 65, name: "iliac_artery_right", synonyms: ["right common iliac artery"] },
      { slot: 66, name: "iliac_vena_left", synonyms: ["left common iliac vein"] },
      { slot: 67, name: "iliac_vena_right", synonyms: ["right common iliac vein"] },
    ],
  },
  pelvis: {
    name: "Pelvis, Urinary & Musculature",
    description: "Pelvic reservoir, lower girdle bones, and major locomotive muscles",
    targets: [
      { slot: 20, name: "urinary_bladder", synonyms: ["vesica urinaria", "bladder"] },
      { slot: 21, name: "prostate", synonyms: ["prostatic gland"] },
      { slot: 24, name: "sacrum", synonyms: ["sacral bone", "sacral vertebra"] },
      { slot: 76, name: "hip_left", synonyms: ["left os coxae", "left ilium"] },
      { slot: 77, name: "hip_right", synonyms: ["right os coxae", "right ilium"] },
      { slot: 74, name: "femur_left", synonyms: ["left thigh bone"] },
      { slot: 75, name: "femur_right", synonyms: ["right thigh bone"] },
      { slot: 79, name: "gluteus_maximus_left", synonyms: ["left upper buttock muscle"] },
      { slot: 80, name: "gluteus_maximus_right", synonyms: ["right upper buttock muscle"] },
      { slot: 81, name: "gluteus_medius_left", synonyms: ["left middle buttock muscle"] },
      { slot: 82, name: "gluteus_medius_right", synonyms: ["right middle buttock muscle"] },
      { slot: 83, name: "gluteus_minimus_left", synonyms: ["left deep buttock muscle"] },
      { slot: 84, name: "gluteus_minimus_right", synonyms: ["right deep buttock muscle"] },
      { slot: 87, name: "iliopsoas_left", synonyms: ["left psoas hip flexor"] },
      { slot: 88, name: "iliopsoas_right", synonyms: ["right psoas hip flexor"] },
    ],
  },
  spine: {
    name: "Spine & Deep Paravertebral",
    description: "Cervical, Thoracic, and Lumbar vertebrae along with spinal cord",
    targets: [
      { slot: 78, name: "spinal_cord", synonyms: ["medulla spinalis", "spinal canal"] },
      { slot: 46, name: "vertebrae_C1", synonyms: ["atlas vertebra"] },
      { slot: 45, name: "vertebrae_C2", synonyms: ["axis vertebra"] },
      { slot: 44, name: "vertebrae_C3", synonyms: ["third cervical vertebra"] },
      { slot: 43, name: "vertebrae_C4", synonyms: ["fourth cervical vertebra"] },
      { slot: 42, name: "vertebrae_C5", synonyms: ["fifth cervical vertebra"] },
      { slot: 41, name: "vertebrae_C6", synonyms: ["sixth cervical vertebra"] },
      { slot: 40, name: "vertebrae_C7", synonyms: ["seventh cervical vertebra", "vertebra prominens"] },
      { slot: 39, name: "vertebrae_T1", synonyms: ["first thoracic vertebra"] },
      { slot: 38, name: "vertebrae_T2", synonyms: ["second thoracic vertebra"] },
      { slot: 37, name: "vertebrae_T3", synonyms: ["third thoracic vertebra"] },
      { slot: 36, name: "vertebrae_T4", synonyms: ["fourth thoracic vertebra"] },
      { slot: 35, name: "vertebrae_T5", synonyms: ["fifth thoracic vertebra"] },
      { slot: 34, name: "vertebrae_T6", synonyms: ["sixth thoracic vertebra"] },
      { slot: 33, name: "vertebrae_T7", synonyms: ["seventh thoracic vertebra"] },
      { slot: 32, name: "vertebrae_T8", synonyms: ["eighth thoracic vertebra"] },
      { slot: 31, name: "vertebrae_T9", synonyms: ["ninth thoracic vertebra"] },
      { slot: 30, name: "vertebrae_T10", synonyms: ["tenth thoracic vertebra"] },
      { slot: 29, name: "vertebrae_T11", synonyms: ["eleventh thoracic vertebra"] },
      { slot: 28, name: "vertebrae_T12", synonyms: ["twelfth thoracic vertebra"] },
      { slot: 27, name: "vertebrae_L1", synonyms: ["first lumbar vertebra"] },
      { slot: 26, name: "vertebrae_L2", synonyms: ["second lumbar vertebra"] },
      { slot: 25, name: "vertebrae_L3", synonyms: ["third lumbar vertebra"] },
      { slot: 24, name: "vertebrae_L4", synonyms: ["fourth lumbar vertebra"] },
      { slot: 23, name: "vertebrae_L5", synonyms: ["fifth lumbar vertebra"] },
      { slot: 25, name: "vertebrae_S1", synonyms: ["first sacral vertebra"] },
      { slot: 85, name: "autochthon_left", synonyms: ["left erector spinae"] },
      { slot: 86, name: "autochthon_right", synonyms: ["right erector spinae"] },
    ],
  },
  ribs: {
    name: "Ribs & Thoracic Cage",
    description: "Bilateral costal cage (Ribs 1-12), sternum, clavicles, and scapulae",
    targets: [
      { slot: 102, name: "sternum", synonyms: ["breastbone"] },
      { slot: 103, name: "costal_cartilages", synonyms: ["rib cartilages"] },
      { slot: 72, name: "clavicula_left", synonyms: ["left collarbone"] },
      { slot: 73, name: "clavicula_right", synonyms: ["right collarbone"] },
      { slot: 70, name: "scapula_left", synonyms: ["left shoulder blade"] },
      { slot: 71, name: "scapula_right", synonyms: ["right shoulder blade"] },
      { slot: 68, name: "humerus_left", synonyms: ["left upper arm bone"] },
      { slot: 69, name: "humerus_right", synonyms: ["right upper arm bone"] },
      { slot: 91, name: "rib_left_1", synonyms: ["first left rib"] },
      { slot: 92, name: "rib_left_2", synonyms: ["second left rib"] },
      { slot: 93, name: "rib_left_3", synonyms: ["third left rib"] },
      { slot: 94, name: "rib_left_4", synonyms: ["fourth left rib"] },
      { slot: 95, name: "rib_left_5", synonyms: ["fifth left rib"] },
      { slot: 96, name: "rib_left_6", synonyms: ["sixth left rib"] },
      { slot: 97, name: "rib_left_7", synonyms: ["seventh left rib"] },
      { slot: 98, name: "rib_left_8", synonyms: ["eighth left rib"] },
      { slot: 99, name: "rib_left_9", synonyms: ["ninth left rib"] },
      { slot: 100, name: "rib_left_10", synonyms: ["tenth left rib"] },
      { slot: 101, name: "rib_left_11", synonyms: ["eleventh left rib"] },
      { slot: 102, name: "rib_left_12", synonyms: ["twelfth left rib"] },
      { slot: 103, name: "rib_right_1", synonyms: ["first right rib"] },
      { slot: 104, name: "rib_right_2", synonyms: ["second right rib"] },
    ],
  },
  head_cranial: {
    name: "Cranial & Neuroanatomy",
    description: "Intracranial cerebrum, calvarium, and cranial vault landmarks",
    targets: [
      { slot: 89, name: "brain", synonyms: ["cerebrum", "encephalon", "cranial cavity", "brainstem"] },
      { slot: 90, name: "skull", synonyms: ["cranium", "calvarium", "neurocranium"] },
    ],
  },
};

import { TargetBodyMap } from "@/components/TargetBodyMap";

export default function TargetsPage() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const totalTargetsCount = Object.values(ALL_CATEGORIES).reduce(
    (acc, cat) => acc + cat.targets.length,
    0
  );

  const handlePinSelect = (organName: string) => {
    setSelectedPin(organName);
    setQuery(organName.replace(/_/g, " "));
  };

  const handleSystemFilterFrom3D = (sys: string | null) => {
    if (!sys || sys === "all") {
      setSelectedCat("all");
    } else {
      setSelectedCat(sys);
    }
  };

  const filteredCategories = Object.entries(ALL_CATEGORIES).filter(([key]) => {
    if (selectedCat !== "all" && selectedCat !== key) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-dark border border-primary/20">
            107 Canonical Landmarks Active
          </span>
          <span className="text-xs font-mono text-slate-500">
            Cranial • Thorax • Spine • Abdomen • Pelvis • Skeleton
          </span>
        </div>
        <h1 className="text-3xl font-bold text-text-main mt-2">107 Anatomical Target Catalog</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Interactive 3D body map and complete scientific directory of 107 internal anatomical targets, including cranial vault (Brain, Skull), cervical/thoracic/lumbar spine vertebrae, major cardiovascular vessels, visceral organs, and musculature. Orbit 360° around the mannequin to view all anterior and posterior landmarks.
        </p>
      </div>

      {/* Interactive 3D Mannequin Body Map with all 107 targets */}
      <TargetBodyMap
        onSelectTarget={handlePinSelect}
        selectedTarget={selectedPin}
        activeSystemFilter={selectedCat === "all" ? null : selectedCat}
        onSelectSystemFilter={handleSystemFilterFrom3D}
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search organs or synonyms (e.g. liver, aorta, brain)..."
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
            All Categories ({totalTargetsCount})
          </button>
          {Object.entries(ALL_CATEGORIES).map(([k, v]) => (
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-1">
                <div>
                  <h3 className="font-bold text-base text-text-main">{cat.name}</h3>
                  <p className="text-xs text-text-muted">{cat.description}</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-background border border-border text-text-muted self-start sm:self-auto">
                  {matchingTargets.length} targets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchingTargets.map((t) => (
                  <div
                    key={`${t.name}-${t.slot}`}
                    className="p-3 rounded-lg border border-border bg-background/30 flex flex-col justify-between gap-2 hover:bg-background/60 transition-colors"
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
