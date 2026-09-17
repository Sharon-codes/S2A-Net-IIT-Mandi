export interface AtlasTargetDef {
  id: string;
  slot: number;
  name: string;
  category: string;
  system: string;
  coords: [number, number, number];
  color: number;
  hex: string;
  side: string;
  synonyms: string[];
}

export const ALL_ATLAS_TARGETS: AtlasTargetDef[] = [
  {
    "id": "liver",
    "slot": 4,
    "name": "Liver",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      63.13,
      74.22,
      5.2
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "hepatic parenchyma",
      "hepar"
    ]
  },
  {
    "id": "spleen",
    "slot": 3,
    "name": "Spleen",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -94.56,
      21.02,
      0.4
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "lateral",
    "synonyms": [
      "lien",
      "splenic tissue"
    ]
  },
  {
    "id": "pancreas",
    "slot": 6,
    "name": "Pancreas",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -18.25,
      77.32,
      -32.19
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "pancreatic gland",
      "pancreatic body"
    ]
  },
  {
    "id": "gallbladder",
    "slot": 5,
    "name": "Gallbladder",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      69.49,
      99.77,
      -32.44
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "anterior",
    "synonyms": [
      "cholecyst",
      "biliary vesicle"
    ]
  },
  {
    "id": "stomach",
    "slot": 15,
    "name": "Stomach",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -45.52,
      90.24,
      -1.04
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "gaster",
      "ventriculus"
    ]
  },
  {
    "id": "duodenum",
    "slot": 16,
    "name": "Duodenum",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      24.45,
      76.93,
      -58.55
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "proximal small intestine"
    ]
  },
  {
    "id": "small_bowel",
    "slot": 17,
    "name": "Small Bowel",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -24.46,
      91.81,
      -113.43
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "jejunum",
      "ileum",
      "small intestine"
    ]
  },
  {
    "id": "colon",
    "slot": 53,
    "name": "Colon",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -9.61,
      83.68,
      -94.81
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "large bowel",
      "large intestine"
    ]
  },
  {
    "id": "kidney_right",
    "slot": 1,
    "name": "Kidney Right",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      65.58,
      23.35,
      -54.76
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "posterior",
    "synonyms": [
      "right renal gland",
      "ren dexter"
    ]
  },
  {
    "id": "kidney_left",
    "slot": 2,
    "name": "Kidney Left",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -68.45,
      22.1,
      -49.51
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "posterior",
    "synonyms": [
      "left renal gland",
      "ren sinister"
    ]
  },
  {
    "id": "adrenal_gland_right",
    "slot": 7,
    "name": "Adrenal Gland Right",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      32.85,
      36.03,
      -9.98
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "central",
    "synonyms": [
      "right suprarenal gland"
    ]
  },
  {
    "id": "adrenal_gland_left",
    "slot": 8,
    "name": "Adrenal Gland Left",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -36.97,
      44.72,
      -17.72
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "central",
    "synonyms": [
      "left suprarenal gland"
    ]
  },
  {
    "id": "kidney_cyst_left",
    "slot": 22,
    "name": "Kidney Cyst Left",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -77.0,
      22.57,
      -58.0
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "posterior",
    "synonyms": [
      "left renal cyst"
    ]
  },
  {
    "id": "kidney_cyst_right",
    "slot": 23,
    "name": "Kidney Cyst Right",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      66.75,
      28.72,
      -80.09
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "posterior",
    "synonyms": [
      "right renal cyst"
    ]
  },
  {
    "id": "heart",
    "slot": 49,
    "name": "Heart",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      -25.8,
      87.16,
      75.84
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "anterior",
    "synonyms": [
      "cardiac organ",
      "cor",
      "myocardium"
    ]
  },
  {
    "id": "trachea",
    "slot": 48,
    "name": "Trachea",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      3.22,
      52.78,
      164.39
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "central",
    "synonyms": [
      "windpipe",
      "respiratory tube"
    ]
  },
  {
    "id": "esophagus",
    "slot": 14,
    "name": "Esophagus",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      -8.5,
      42.87,
      99.79
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "central",
    "synonyms": [
      "gullet",
      "alimentary canal"
    ]
  },
  {
    "id": "thyroid_gland",
    "slot": 47,
    "name": "Thyroid Gland",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      1.4,
      79.49,
      215.77
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "anterior",
    "synonyms": [
      "thyroid",
      "glandula thyroidea"
    ]
  },
  {
    "id": "lung_upper_lobe_left",
    "slot": 9,
    "name": "Lung Upper Lobe Left",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      -79.44,
      72.83,
      116.58
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "anterior",
    "synonyms": [
      "LUL",
      "left upper lung"
    ]
  },
  {
    "id": "lung_lower_lobe_left",
    "slot": 10,
    "name": "Lung Lower Lobe Left",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      -73.55,
      11.25,
      74.61
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "central",
    "synonyms": [
      "LLL",
      "left lower lung"
    ]
  },
  {
    "id": "lung_upper_lobe_right",
    "slot": 11,
    "name": "Lung Upper Lobe Right",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      56.72,
      67.26,
      137.4
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "anterior",
    "synonyms": [
      "RUL",
      "right upper lung"
    ]
  },
  {
    "id": "lung_middle_lobe_right",
    "slot": 12,
    "name": "Lung Middle Lobe Right",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      71.21,
      99.15,
      80.52
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "anterior",
    "synonyms": [
      "RML",
      "right middle lung"
    ]
  },
  {
    "id": "lung_lower_lobe_right",
    "slot": 13,
    "name": "Lung Lower Lobe Right",
    "category": "Thoracic & Respiratory",
    "system": "thoracic",
    "coords": [
      66.74,
      14.55,
      74.16
    ],
    "color": 16007006,
    "hex": "#f43f5e",
    "side": "central",
    "synonyms": [
      "RLL",
      "right lower lung"
    ]
  },
  {
    "id": "aorta",
    "slot": 50,
    "name": "Aorta",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -11.61,
      48.93,
      58.28
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "central",
    "synonyms": [
      "thoracic aorta",
      "abdominal aorta"
    ]
  },
  {
    "id": "superior_vena_cava",
    "slot": 61,
    "name": "Superior Vena Cava",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      24.87,
      68.95,
      127.96
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "SVC",
      "precava"
    ]
  },
  {
    "id": "inferior_vena_cava",
    "slot": 62,
    "name": "Inferior Vena Cava",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      20.29,
      58.93,
      -11.41
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "central",
    "synonyms": [
      "IVC",
      "postcava"
    ]
  },
  {
    "id": "pulmonary_vein",
    "slot": 51,
    "name": "Pulmonary Vein",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -2.54,
      40.66,
      97.75
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "central",
    "synonyms": [
      "venae pulmonales"
    ]
  },
  {
    "id": "brachiocephalic_trunk",
    "slot": 52,
    "name": "Brachiocephalic Trunk",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      6.42,
      76.85,
      176.12
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "innominate artery"
    ]
  },
  {
    "id": "subclavian_artery_right",
    "slot": 54,
    "name": "Subclavian Artery Right",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      43.54,
      61.42,
      201.01
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "right subclavian"
    ]
  },
  {
    "id": "subclavian_artery_left",
    "slot": 55,
    "name": "Subclavian Artery Left",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -38.7,
      57.55,
      195.23
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "central",
    "synonyms": [
      "left subclavian"
    ]
  },
  {
    "id": "common_carotid_artery_right",
    "slot": 56,
    "name": "Common Carotid Artery Right",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      20.59,
      72.5,
      213.59
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "right carotid"
    ]
  },
  {
    "id": "common_carotid_artery_left",
    "slot": 57,
    "name": "Common Carotid Artery Left",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -16.71,
      69.58,
      199.82
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "left carotid"
    ]
  },
  {
    "id": "brachiocephalic_vein_left",
    "slot": 58,
    "name": "Brachiocephalic Vein Left",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -6.53,
      84.29,
      173.6
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "left innominate vein"
    ]
  },
  {
    "id": "brachiocephalic_vein_right",
    "slot": 59,
    "name": "Brachiocephalic Vein Right",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      29.13,
      74.42,
      178.37
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "right innominate vein"
    ]
  },
  {
    "id": "atrial_appendage_left",
    "slot": 60,
    "name": "Atrial Appendage Left",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -35.67,
      63.23,
      103.21
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "left auricle"
    ]
  },
  {
    "id": "portal_vein_and_splenic_vein",
    "slot": 63,
    "name": "Portal Vein And Splenic Vein",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      6.16,
      73.71,
      -14.51
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "portal venous confluence"
    ]
  },
  {
    "id": "iliac_artery_left",
    "slot": 64,
    "name": "Iliac Artery Left",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      -40.0,
      67.58,
      -179.06
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "left common iliac artery"
    ]
  },
  {
    "id": "iliac_artery_right",
    "slot": 65,
    "name": "Iliac Artery Right",
    "category": "Cardiovascular & Major Vessels",
    "system": "vascular",
    "coords": [
      37.65,
      70.07,
      -181.37
    ],
    "color": 15680580,
    "hex": "#ef4444",
    "side": "anterior",
    "synonyms": [
      "right common iliac artery"
    ]
  },
  {
    "id": "iliac_vena_left",
    "slot": 66,
    "name": "Iliac Vena Left",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      -35.4,
      57.78,
      -187.69
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "central",
    "synonyms": [
      "left common iliac vein"
    ]
  },
  {
    "id": "iliac_vena_right",
    "slot": 67,
    "name": "Iliac Vena Right",
    "category": "Abdominal & Digestive",
    "system": "abdominal",
    "coords": [
      40.96,
      60.56,
      -191.55
    ],
    "color": 1096065,
    "hex": "#10b981",
    "side": "anterior",
    "synonyms": [
      "right common iliac vein"
    ]
  },
  {
    "id": "urinary_bladder",
    "slot": 20,
    "name": "Urinary Bladder",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      1.33,
      62.23,
      -244.09
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "anterior",
    "synonyms": [
      "vesica urinaria",
      "bladder"
    ]
  },
  {
    "id": "prostate",
    "slot": 21,
    "name": "Prostate",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -1.64,
      35.87,
      -273.35
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "central",
    "synonyms": [
      "prostatic gland"
    ]
  },
  {
    "id": "sacrum",
    "slot": 24,
    "name": "Sacrum",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      0.55,
      -14.18,
      -181.08
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "sacral bone",
      "sacral vertebra"
    ]
  },
  {
    "id": "hip_left",
    "slot": 76,
    "name": "Hip Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -72.5,
      28.57,
      -204.62
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "central",
    "synonyms": [
      "left os coxae",
      "left ilium"
    ]
  },
  {
    "id": "hip_right",
    "slot": 77,
    "name": "Hip Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      72.56,
      29.1,
      -205.52
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "central",
    "synonyms": [
      "right os coxae",
      "right ilium"
    ]
  },
  {
    "id": "femur_left",
    "slot": 74,
    "name": "Femur Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -105.86,
      36.73,
      -282.31
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "lateral",
    "synonyms": [
      "left thigh bone"
    ]
  },
  {
    "id": "femur_right",
    "slot": 75,
    "name": "Femur Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      104.75,
      37.22,
      -285.03
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "lateral",
    "synonyms": [
      "right thigh bone"
    ]
  },
  {
    "id": "gluteus_maximus_left",
    "slot": 79,
    "name": "Gluteus Maximus Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -87.87,
      -20.57,
      -247.64
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "left upper buttock muscle"
    ]
  },
  {
    "id": "gluteus_maximus_right",
    "slot": 80,
    "name": "Gluteus Maximus Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      87.55,
      -20.41,
      -250.41
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "right upper buttock muscle"
    ]
  },
  {
    "id": "gluteus_medius_left",
    "slot": 81,
    "name": "Gluteus Medius Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -115.72,
      24.17,
      -184.41
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "left middle buttock muscle"
    ]
  },
  {
    "id": "gluteus_medius_right",
    "slot": 82,
    "name": "Gluteus Medius Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      117.53,
      24.74,
      -191.72
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "right middle buttock muscle"
    ]
  },
  {
    "id": "gluteus_minimus_left",
    "slot": 83,
    "name": "Gluteus Minimus Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -112.01,
      47.58,
      -210.22
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "left deep buttock muscle"
    ]
  },
  {
    "id": "gluteus_minimus_right",
    "slot": 84,
    "name": "Gluteus Minimus Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      111.84,
      46.22,
      -213.73
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "posterior",
    "synonyms": [
      "right deep buttock muscle"
    ]
  },
  {
    "id": "iliopsoas_left",
    "slot": 87,
    "name": "Iliopsoas Left",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -60.06,
      44.67,
      -146.73
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "central",
    "synonyms": [
      "left psoas hip flexor"
    ]
  },
  {
    "id": "iliopsoas_right",
    "slot": 88,
    "name": "Iliopsoas Right",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      56.94,
      42.36,
      -146.44
    ],
    "color": 9133302,
    "hex": "#8b5cf6",
    "side": "central",
    "synonyms": [
      "right psoas hip flexor"
    ]
  },
  {
    "id": "spinal_cord",
    "slot": 78,
    "name": "Spinal Cord",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.15,
      1.29,
      34.62
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "central",
    "synonyms": [
      "medulla spinalis",
      "spinal canal"
    ]
  },
  {
    "id": "vertebrae_C1",
    "slot": 46,
    "name": "Vertebra C1",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -3.17,
      63.57,
      280.3
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "atlas vertebra"
    ]
  },
  {
    "id": "vertebrae_C2",
    "slot": 45,
    "name": "Vertebra C2",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -3.06,
      61.56,
      270.04
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "axis vertebra"
    ]
  },
  {
    "id": "vertebrae_C3",
    "slot": 44,
    "name": "Vertebra C3",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -2.04,
      62.38,
      270.19
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "third cervical vertebra"
    ]
  },
  {
    "id": "vertebrae_C4",
    "slot": 43,
    "name": "Vertebra C4",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -1.72,
      59.74,
      253.25
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fourth cervical vertebra"
    ]
  },
  {
    "id": "vertebrae_C5",
    "slot": 42,
    "name": "Vertebra C5",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -1.72,
      59.09,
      246.6
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fifth cervical vertebra"
    ]
  },
  {
    "id": "vertebrae_C6",
    "slot": 41,
    "name": "Vertebra C6",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.35,
      55.99,
      239.48
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "sixth cervical vertebra"
    ]
  },
  {
    "id": "vertebrae_C7",
    "slot": 40,
    "name": "Vertebra C7",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      0.1,
      43.75,
      231.66
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "seventh cervical vertebra",
      "vertebra prominens"
    ]
  },
  {
    "id": "vertebrae_T1",
    "slot": 39,
    "name": "Vertebra T1",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.36,
      29.02,
      220.13
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "first thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T2",
    "slot": 38,
    "name": "Vertebra T2",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.58,
      17.9,
      203.81
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "second thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T3",
    "slot": 37,
    "name": "Vertebra T3",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.3,
      6.38,
      187.33
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "third thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T4",
    "slot": 36,
    "name": "Vertebra T4",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      0.37,
      -2.79,
      168.82
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fourth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T5",
    "slot": 35,
    "name": "Vertebra T5",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      1.6,
      -10.99,
      149.51
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fifth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T6",
    "slot": 34,
    "name": "Vertebra T6",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      2.26,
      -16.7,
      128.52
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "sixth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T7",
    "slot": 33,
    "name": "Vertebra T7",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      2.6,
      -19.0,
      107.85
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "seventh thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T8",
    "slot": 32,
    "name": "Vertebra T8",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      1.83,
      -17.97,
      89.05
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "eighth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T9",
    "slot": 31,
    "name": "Vertebra T9",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      1.68,
      -14.67,
      70.69
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "ninth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T10",
    "slot": 30,
    "name": "Vertebra T10",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      1.25,
      -9.63,
      50.52
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "tenth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T11",
    "slot": 29,
    "name": "Vertebra T11",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      0.84,
      -5.0,
      26.59
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "eleventh thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_T12",
    "slot": 28,
    "name": "Vertebra T12",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      0.38,
      0.15,
      0.06
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "twelfth thoracic vertebra"
    ]
  },
  {
    "id": "vertebrae_L1",
    "slot": 27,
    "name": "Vertebra L1",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.06,
      6.39,
      -29.36
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "first lumbar vertebra"
    ]
  },
  {
    "id": "vertebrae_L2",
    "slot": 26,
    "name": "Vertebra L2",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.35,
      13.02,
      -56.81
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "second lumbar vertebra"
    ]
  },
  {
    "id": "vertebrae_L3",
    "slot": 25,
    "name": "Vertebra L3",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.49,
      18.48,
      -83.05
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "third lumbar vertebra"
    ]
  },
  {
    "id": "vertebrae_L4",
    "slot": 24,
    "name": "Vertebra L4",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.53,
      23.09,
      -109.59
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fourth lumbar vertebra"
    ]
  },
  {
    "id": "vertebrae_L5",
    "slot": 23,
    "name": "Vertebra L5",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -0.1,
      20.69,
      -138.31
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "fifth lumbar vertebra"
    ]
  },
  {
    "id": "vertebrae_S1",
    "slot": 25,
    "name": "Vertebra S1",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      0.25,
      10.41,
      -163.61
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "first sacral vertebra"
    ]
  },
  {
    "id": "autochthon_left",
    "slot": 85,
    "name": "Autochthon Left",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      -29.2,
      -28.81,
      8.54
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "left erector spinae"
    ]
  },
  {
    "id": "autochthon_right",
    "slot": 86,
    "name": "Autochthon Right",
    "category": "Spine & Deep Paravertebral",
    "system": "spine",
    "coords": [
      28.69,
      -28.08,
      7.58
    ],
    "color": 16096779,
    "hex": "#f59e0b",
    "side": "posterior",
    "synonyms": [
      "right erector spinae"
    ]
  },
  {
    "id": "sternum",
    "slot": 102,
    "name": "Sternum",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -1.12,
      131.0,
      121.04
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "breastbone"
    ]
  },
  {
    "id": "costal_cartilages",
    "slot": 103,
    "name": "Costal Cartilages",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -3.15,
      138.01,
      53.71
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "rib cartilages"
    ]
  },
  {
    "id": "clavicula_left",
    "slot": 72,
    "name": "Clavicula Left",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -55.69,
      74.37,
      210.37
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "left collarbone"
    ]
  },
  {
    "id": "clavicula_right",
    "slot": 73,
    "name": "Clavicula Right",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      57.93,
      72.88,
      210.66
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "right collarbone"
    ]
  },
  {
    "id": "scapula_left",
    "slot": 70,
    "name": "Scapula Left",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -117.34,
      -3.35,
      164.92
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "left shoulder blade"
    ]
  },
  {
    "id": "scapula_right",
    "slot": 71,
    "name": "Scapula Right",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      118.22,
      -0.7,
      163.33
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "right shoulder blade"
    ]
  },
  {
    "id": "humerus_left",
    "slot": 68,
    "name": "Humerus Left",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -147.81,
      41.55,
      219.87
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "left upper arm bone"
    ]
  },
  {
    "id": "humerus_right",
    "slot": 69,
    "name": "Humerus Right",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      144.62,
      44.5,
      214.73
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "right upper arm bone"
    ]
  },
  {
    "id": "rib_left_1",
    "slot": 91,
    "name": "Left Rib 1",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -55.38,
      66.51,
      199.02
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "first left rib"
    ]
  },
  {
    "id": "rib_left_2",
    "slot": 92,
    "name": "Left Rib 2",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -73.9,
      51.8,
      190.03
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "central",
    "synonyms": [
      "second left rib"
    ]
  },
  {
    "id": "rib_left_3",
    "slot": 93,
    "name": "Left Rib 3",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -84.63,
      48.61,
      168.14
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "central",
    "synonyms": [
      "third left rib"
    ]
  },
  {
    "id": "rib_left_4",
    "slot": 94,
    "name": "Left Rib 4",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -91.14,
      54.91,
      140.99
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "fourth left rib"
    ]
  },
  {
    "id": "rib_left_5",
    "slot": 95,
    "name": "Left Rib 5",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -96.1,
      62.75,
      115.36
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "fifth left rib"
    ]
  },
  {
    "id": "rib_left_6",
    "slot": 96,
    "name": "Left Rib 6",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -104.85,
      62.72,
      92.5
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "sixth left rib"
    ]
  },
  {
    "id": "rib_left_7",
    "slot": 97,
    "name": "Left Rib 7",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -113.0,
      50.09,
      73.44
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "seventh left rib"
    ]
  },
  {
    "id": "rib_left_8",
    "slot": 98,
    "name": "Left Rib 8",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -113.64,
      28.32,
      56.48
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "eighth left rib"
    ]
  },
  {
    "id": "rib_left_9",
    "slot": 99,
    "name": "Left Rib 9",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -109.24,
      7.2,
      39.05
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "ninth left rib"
    ]
  },
  {
    "id": "rib_left_10",
    "slot": 100,
    "name": "Left Rib 10",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -100.13,
      -8.91,
      16.7
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "lateral",
    "synonyms": [
      "tenth left rib"
    ]
  },
  {
    "id": "rib_left_11",
    "slot": 101,
    "name": "Left Rib 11",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -82.43,
      -20.48,
      -5.9
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "central",
    "synonyms": [
      "eleventh left rib"
    ]
  },
  {
    "id": "rib_left_12",
    "slot": 102,
    "name": "Left Rib 12",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      -57.7,
      -21.41,
      -22.43
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "central",
    "synonyms": [
      "twelfth left rib"
    ]
  },
  {
    "id": "rib_right_1",
    "slot": 103,
    "name": "Right Rib 1",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      54.42,
      65.62,
      198.19
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "anterior",
    "synonyms": [
      "first right rib"
    ]
  },
  {
    "id": "rib_right_2",
    "slot": 104,
    "name": "Right Rib 2",
    "category": "Ribs & Thoracic Skeleton",
    "system": "ribs",
    "coords": [
      72.79,
      52.09,
      188.99
    ],
    "color": 1357990,
    "hex": "#14b8a6",
    "side": "central",
    "synonyms": [
      "second right rib"
    ]
  },
  {
    "id": "brain",
    "slot": 89,
    "name": "Brain",
    "category": "Head & Cranial",
    "system": "cranial",
    "coords": [
      -2.94,
      55.26,
      331.86
    ],
    "color": 440020,
    "hex": "#06b6d4",
    "side": "central",
    "synonyms": [
      "cerebrum",
      "encephalon",
      "cranial cavity",
      "brainstem"
    ]
  },
  {
    "id": "skull",
    "slot": 90,
    "name": "Skull",
    "category": "Head & Cranial",
    "system": "cranial",
    "coords": [
      0.82,
      110.86,
      270.07
    ],
    "color": 440020,
    "hex": "#06b6d4",
    "side": "anterior",
    "synonyms": [
      "cranium",
      "calvarium",
      "neurocranium"
    ]
  },
  {
    "id": "uterus",
    "slot": 117,
    "name": "Uterus",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      0.0,
      42.0,
      -255.0
    ],
    "color": 14240751,
    "hex": "#d946ef",
    "side": "central",
    "synonyms": [
      "womb",
      "uterine body",
      "myometrium",
      "female pelvis"
    ]
  },
  {
    "id": "ovary_left",
    "slot": 118,
    "name": "Left Ovary",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      -35.0,
      38.0,
      -250.0
    ],
    "color": 15485337,
    "hex": "#ec4899",
    "side": "lateral",
    "synonyms": [
      "ovarium sinistrum",
      "left adnexa",
      "female gonad"
    ]
  },
  {
    "id": "ovary_right",
    "slot": 119,
    "name": "Right Ovary",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      35.0,
      38.0,
      -250.0
    ],
    "color": 15485337,
    "hex": "#ec4899",
    "side": "lateral",
    "synonyms": [
      "ovarium dextrum",
      "right adnexa",
      "female gonad"
    ]
  },
  {
    "id": "vagina",
    "slot": 120,
    "name": "Vagina",
    "category": "Pelvis, Urinary & Musculature",
    "system": "pelvis",
    "coords": [
      0.0,
      30.0,
      -290.0
    ],
    "color": 13459146,
    "hex": "#cd32ca",
    "side": "central",
    "synonyms": [
      "vaginal canal",
      "birth canal",
      "colpos"
    ]
  }
];
