<div align="center">

<img src="assets/iit_mandi_logo.png" alt="IIT Mandi Logo" width="160" />

# Surface2Anatomy (S2A-Net)
### 3D Internal Anatomy Localization from External Body Surface Geometry

**Indian Institute of Technology Mandi (IIT Mandi)**  
*School of Computing & Electrical Engineering | Biomedical Imaging & Scientific AI Research*

[![Live Demo](https://img.shields.io/badge/Vercel_Live_Demo-web--self--theta--51.vercel.app-66734b?style=for-the-badge&logo=vercel)](https://web-self-theta-51.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-465133?style=for-the-badge)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PyTorch 2.3](https://img.shields.io/badge/PyTorch-2.3-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Hugging Face Weights](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Weights%20%26%20Checkpoints-yellow?style=for-the-badge)](https://huggingface.co/SharonMelhi/Surface2Anatomy-Weights)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)

</div>

---

## 👥 Project Team & Academic Supervision

This research and software platform was developed for and conducted at the **Indian Institute of Technology Mandi (IIT Mandi)**:

- **Khushi Mhamane** — *Project Contributor & Researcher, Indian Institute of Technology Mandi*
- **Sharon Melhi** — *Project Contributor & Researcher, Indian Institute of Technology Mandi*

### Under the Academic Supervision of:
- **Dr. Deepak Raina** — *Assistant Professor, School of Computing & Electrical Engineering, Indian Institute of Technology Mandi (IIT Mandi)*

---

## 🌟 Executive Summary

**Surface2Anatomy** is a deep geometric learning framework capable of localizing **104 internal anatomical targets in 3D** directly from external patient body surface geometry (e.g. optical 3D scanners, depth photogrammetry, or stereophotogrammetry) with **0 mSv of ionizing radiation**.

```text
External Patient Surface Point Cloud (4,096 pts)
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1: Frozen Ridge Canonical Alignment (c_external) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Multi-Scale PointNet++ Encoder (SA1/SA2/SA3)  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Target-Query Cross-Attention Transformer      │
│          (104 Learned Organ Queries + Atlas Residual)  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 4: 3-Seed Ensemble Consensus & Uncertainty (σ)  │
└────────────────────────────────────────────────────────┘
```

### Key Performance Metrics
- **104 Supported Anatomical Targets**: Covering Cardiovascular, Respiratory, Hepatobiliary, Gastrointestinal, Urinary, Pelvic, Skeletal, and Cranial anatomy.
- **23.34 mm Overall MRE**: Mean Radial Error across 215 held-out patient evaluation scans.
- **21.30 mm External Generalization**: Evaluated on multi-center external CT scans from the FLARE22 challenge without domain retraining.
- **11.3 FPS Real-Time Inference**: ~88 ms end-to-end GPU processing on an NVIDIA RTX 4070 Ti SUPER.
- **0.0 mSv Radiation**: Enables radiation-free longitudinal monitoring, pre-operative optical landmarking, and bedside robotic ultrasound guidance.

---

## 🚀 Live Interactive 3D Web Platform

The research web platform is live and publicly accessible:

👉 **[Launch Surface2Anatomy Web Application (Vercel)](https://web-self-theta-51.vercel.app)**

### Web Application Features
1. **Interactive Three.js 3D Viewer**: Orbit, pan, and zoom around patient surface point clouds with Axial, Sagittal, and Coronal viewport presets.
2. **Glowing 3D Centroid Pins & Halos**: Color-coded spatial target pins with wireframe uncertainty spheres proportional to 3-seed ensemble disagreement ($\le 5\text{ mm}$ Green, $5-15\text{ mm}$ Amber, $> 15\text{ mm}$ Red).
3. **Multi-Format Upload**: Drag-and-drop support for `.PLY` (ASCII & binary), `.PCD`, `.OBJ`, `.STL`, `.XYZ`, and `.NPY` with automatic unit detection (meters, centimeters, or millimeters).
4. **Voice Input via Web Speech API**: Speak target names naturally into the microphone with intelligent medical synonym normalization.
5. **Multi-Target Batching**: Select single or multiple anatomical landmarks simultaneously with one-click GPU inference.
6. **Coordinate Inspector**: Real-time readouts in Canonical coordinate space or Original Input World space, with CSV and JSON data export.
7. **Ephemeral Data Privacy**: Uploaded patient geometry is processed in transient GPU memory buffers and never written to permanent disk storage.

---

## 🧠 Brain Target Error Resolution (Phase 16)

In earlier models, training on partial-height thoracic/abdominal scans led to numerical sign-inversion on cranial targets during whole-body scans. In Phase 16, we applied **multi-scale Z-augmentation ($0.85\times - 2.2\times$)** and targeted loss re-weighting across all 3 random seeds (Seeds 42, 43, 44), resolving the cranial coordinate collapse:

| CT-ORG Whole-Body Subject | Baseline Phase 10R Error | Retrained Phase 16 Error | Improvement |
| :--- | :--- | :--- | :--- |
| `volume-136` | $162.4\text{ mm}$ | **$5.5\text{ mm}$** | **-96.6%** |
| `volume-135` | $141.2\text{ mm}$ | **$8.1\text{ mm}$** | **-94.3%** |
| `volume-131` | $155.0\text{ mm}$ | **$15.6\text{ mm}$** | **-89.9%** |
| `volume-133` | $188.7\text{ mm}$ | **$19.1\text{ mm}$** | **-89.9%** |
| `volume-132` | $179.3\text{ mm}$ | **$26.5\text{ mm}$** | **-85.2%** |
| `volume-138` | $210.5\text{ mm}$ | **$68.2\text{ mm}$** | **-67.6%** |
| **Mean Across All Cases** | **$177.42\text{ mm}$** | **$38.92\text{ mm}$** | **-78.1%** |

---

## 📊 Benchmark Evaluation Across 104 Organs

### Selected Internal Validation Targets (215 Subjects)
| Anatomical Landmark | Mean Radial Error (MRE) | Ensemble Uncertainty ($\sigma$) | Evaluation Split |
| :--- | :--- | :--- | :--- |
| **Aorta** | **$14.92\text{ mm}$** | $\pm 1.5\text{ mm}$ | Held-out Test |
| **Right Kidney** | **$16.84\text{ mm}$** | $\pm 1.9\text{ mm}$ | Held-out Test |
| **Left Kidney** | **$17.20\text{ mm}$** | $\pm 2.2\text{ mm}$ | Held-out Test |
| **Liver** | **$18.42\text{ mm}$** | $\pm 2.1\text{ mm}$ | Held-out Test |
| **Spleen** | **$19.15\text{ mm}$** | $\pm 2.8\text{ mm}$ | Held-out Test |
| **Heart** | **$21.05\text{ mm}$** | $\pm 3.4\text{ mm}$ | Held-out Test |
| **Urinary Bladder** | **$24.60\text{ mm}$** | $\pm 4.1\text{ mm}$ | Held-out Test |
| **Pancreas** | **$26.31\text{ mm}$** | $\pm 3.9\text{ mm}$ | Held-out Test |

---

## 💻 Repository Structure

```text
3D-Organ-Location-Prediction-Model/
├── api/                             # FastAPI GPU Inference Backend
│   ├── inference/                   # Alignment, pointcloud, model_loader, predict, uncertainty
│   ├── schemas/                     # Pydantic request/response validation schemas
│   ├── utils/                       # 104-target catalog & synonym mappings
│   └── main.py                      # FastAPI application entrypoint
├── web/                             # Next.js 14 Production Web Application
│   ├── app/                         # App Router pages (demo, method, targets, validation, about)
│   ├── components/                  # Three.js 3D viewer, dropzone, target selector, results card
│   └── public/demo/                 # Public sample patient torso point cloud (.PLY)
├── experiments/                     # Trained 3-Model Ensemble Checkpoints
│   ├── phase10R/checkpoints/        # Frozen baseline ensemble (Seeds 42, 43, 44) + Ridge alignment
│   └── phase16_brain/checkpoints/   # Brain-aware whole-body ensemble (Seeds 42, 43, 44)
├── tests/                           # Verification Test Suites
│   ├── test_api.py                  # 8 unit and integration tests for FastAPI backend
│   └── test_regression.py           # Scientific regression test (< 1e-4 normalized discrepancy)
├── deployment/                      # Deployment Configurations
│   ├── Dockerfile                   # CUDA 12.1 production backend container
│   └── modal_app.py                 # Serverless GPU deployment configuration on Modal
├── sharon/                          # Core neural network architectures & utilities
├── tools/                           # Preprocessing, evaluation, and ablation pipelines
├── assets/                          # Static media, figures, and IIT Mandi logo
├── LICENSE                          # MIT License (Khushi Mhamane & Sharon Melhi, IIT Mandi)
└── vercel.json                      # Vercel deployment configuration
```

---

## 🛠️ Installation & Setup

### 1. Backend Inference Server (Python 3.11 + CUDA)

```bash
# Clone the repository
git clone https://github.com/Sharon-codes/S2A-Net-IIT-Mandi.git
cd S2A-Net-IIT-Mandi

# Create and activate Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install fastapi uvicorn pydantic scipy scikit-learn trimesh open3d httpx

# Start the FastAPI server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify backend health:
```bash
curl http://localhost:8000/health
# Returns: {"status":"ok","models_loaded":1,"targets_available":104,"device":"cuda"}
```

### 2. Frontend Web Application (Next.js 14)

```bash
cd web
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your web browser.

---

## 🧪 Running Automated Verification Tests

### Automated Backend Unit & Integration Tests (8 Tests)
```bash
python tests/test_api.py
```
Validates:
- Health check and CUDA acceleration status.
- 104 target catalog queries and synonym normalization.
- Physical unit detection ($m \to mm$, $cm \to mm$).
- Deterministic 4,096-point sampling.
- Single and batched multi-target predictions.
- Invalid non-finite (NaN/Inf) coordinate rejection.

### Mandatory Scientific Regression Test
```bash
python tests/test_regression.py
```
Asserts that live API inference matches offline frozen PyTorch checkpoints within $< 1 \times 10^{-4}$ normalized discrepancy ($< 0.005\text{ mm}$ absolute difference).

---

## 🐳 Docker Deployment

```bash
# Build CUDA container
docker build -t s2a-net-api:latest -f deployment/Dockerfile .

# Run with NVIDIA GPU passthrough
docker run --gpus all -d -p 8000:8000 --name s2a-net s2a-net-api:latest
```

---

## ☁️ Serverless Modal Deployment

Deploy the GPU backend on demand with zero idle cost using [Modal](https://modal.com):

```bash
pip install modal
modal setup
modal deploy deployment/modal_app.py
```

---

## ⚠️ Clinical Disclaimer

**Research Prototype Only**: This software and model are exploratory research demonstrations created solely for scientific investigation into geometric deep learning. It has not undergone clinical trials, is not cleared or approved by the U.S. FDA, European EMA, or CDSCO, and must **NOT** be used for clinical diagnosis, patient triage, surgical planning, needle biopsy, or radiation therapy procedural guidance.
