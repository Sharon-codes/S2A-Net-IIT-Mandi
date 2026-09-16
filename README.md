# CT Organ Localization using 3D Deep Learning

A deep learning pipeline for automatic localization of abdominal organs from CT scans using a 3D DenseNet-based architecture. The model predicts organ centroids through Gaussian heatmap regression and converts them into physical 3D coordinates for visualization and downstream medical applications.

---

## Overview

This project performs automatic localization of the following abdominal organs:

* Spleen
* Right Kidney
* Left Kidney
* Gallbladder
* Liver

Given a CT scan, the system predicts the 3D centroid location of each organ.

### Pipeline

```text
CT Scan
   ↓
Preprocessing
   ↓
3D DenseNet Encoder
   ↓
Heatmap Decoder
   ↓
Organ Heatmaps
   ↓
Soft-Argmax
   ↓
Organ Centroids
   ↓
Physical Coordinates (mm)
```

---

## Features

* 3D DenseNet121 backbone
* Multi-organ localization
* Heatmap-based regression
* Soft-Argmax centroid extraction
* Mixed precision training (AMP)
* TensorBoard logging
* Automatic checkpointing
* Early stopping
* Organ-wise error analysis
* 3D visualization using Open3D

---

# Project Structure

```text
project/
│
├── config.py
├── dataset.py
├── labels.py
├── losses.py
├── model.py
├── train.py
├── inference.py
├── plot_metrics.py
├── requirements.txt
│
├── dataset/
│   ├── case_001/
│   │   ├── ct.nii.gz
│   │   └── segmentation.nii.gz
│   │
│   ├── case_002/
│   └── ...
│
├── outputs/
│   ├── checkpoints/
│   ├── logs/
│   ├── tensorboard/
│   ├── predictions/
│   └── plots/
│
└── README.md
```

---

# Dataset Format

Each case must contain:

```text
case_xxx/
│
├── ct.nii.gz
└── segmentation.nii.gz
```

### ct.nii.gz

3D CT volume.

### segmentation.nii.gz

Ground truth segmentation mask.

### Supported Organ IDs

| Organ        | Label ID |
| ------------ | -------- |
| Spleen       | 1        |
| Kidney Right | 2        |
| Kidney Left  | 3        |
| Gallbladder  | 4        |
| Liver        | 5        |

---

# Installation

## Clone Repository

```bash
git clone <repository_url>
cd project
```

## Create Environment

### Conda

```bash
conda create -n organloc python=3.10
conda activate organloc
```

### Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

---

## Install PyTorch

### CUDA 12.1

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### CPU Only

```bash
pip install torch torchvision
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Training Pipeline

## Step 1: Dataset Loading

The dataset loader:

* Loads CT volumes
* Loads segmentation masks
* Converts orientation to RAS
* Normalizes CT intensity
* Resizes volumes
* Computes organ centroids
* Generates Gaussian heatmaps

Output:

```python
{
    "image",
    "gt_heatmaps",
    "gt_centroids",
    "found_mask",
    "spacing",
    "case_id"
}
```

---

## Step 2: Ground Truth Generation

For every organ:

```text
Segmentation Mask
        ↓
Center of Mass
        ↓
Normalized Centroid
        ↓
3D Gaussian Heatmap
```

Example:

```text
Liver centroid:
(0.53, 0.41, 0.72)

↓

64×64×64 Gaussian Heatmap
```

---

## Step 3: Model Architecture

### Encoder

3D DenseNet121

Input:

```text
1 × 128 × 128 × 128
```

Output:

```text
1024-channel feature map
```

### Decoder

```text
Dense Features
      ↓
ConvTranspose3D
      ↓
Conv + BN + ReLU
      ↓
Heatmap Prediction
```

Output:

```text
5 × 64 × 64 × 64
```

One heatmap per organ.

---

## Step 4: Loss Function

### Heatmap Loss

Combination of:

```text
MSE Loss
+
Focal Heatmap Loss
```

### Centroid Loss

```text
Soft Argmax
      ↓
Predicted Centroid
      ↓
SmoothL1 Loss
```

### Total Loss

```text
Total Loss =
Heatmap Loss
+
0.5 × Centroid Loss
```

---

## Step 5: Training

Run:

```bash
python train.py --data_root dataset
```

### Default Hyperparameters

```python
epochs = 150
batch_size = 2
learning_rate = 1e-4
weight_decay = 1e-5
target_shape = (128,128,128)
heatmap_size = (64,64,64)
grad_accum_steps = 4
```

### Training Features

* Mixed Precision (AMP)
* Gradient Accumulation
* Gradient Clipping
* Cosine Learning Rate Scheduler
* Checkpoint Saving
* TensorBoard Logging
* Early Stopping

---

# Monitoring Training

## TensorBoard

```bash
tensorboard --logdir outputs/tensorboard
```

Open:

```text
http://localhost:6006
```

---

## CSV Logs

Stored at:

```text
outputs/logs/metrics.csv
```

Contains:

* epoch
* train_loss
* val_loss
* avg_error_mm
* learning_rate
* per-organ errors

---

# Checkpoints

Saved automatically:

```text
outputs/checkpoints/
```

Generated files:

```text
latest_model.pth

best_model.pth

checkpoint_epoch_010.pth
checkpoint_epoch_020.pth
...
```

---

# Plotting Metrics

Generate plots:

```bash
python plot_metrics.py
```

Outputs:

```text
loss_curve.png

avg_error_curve.png

per_organ_error.png

lr_schedule.png
```

---

# Inference

Run prediction:

```bash
python inference.py \
    --ct patient_ct.nii.gz \
    --model outputs/checkpoints/best_model.pth
```

Example:

```bash
python inference.py \
    --ct sample.nii.gz \
    --model outputs/checkpoints/best_model.pth
```

---

# Inference Workflow

```text
CT Scan
   ↓
Preprocessing
   ↓
DenseNet121
   ↓
Heatmaps
   ↓
Soft Argmax
   ↓
Centroids
   ↓
Physical Coordinates
```

---

# Example Output

```text
Organ            Voxel Coordinate

Spleen           (63.4, 52.1, 84.2)
Kidney Right     (72.3, 46.7, 42.8)
Kidney Left      (70.1, 45.8, 92.5)
Gallbladder      (55.2, 41.3, 67.4)
Liver            (61.9, 39.7, 73.2)
```

---

# Save Predictions

```bash
python inference.py \
    --ct sample.nii.gz \
    --out outputs/predictions/result.json
```

Example JSON:

```json
{
  "liver": {
    "voxel": [...],
    "physical_mm": [...]
  }
}
```

---

# 3D Visualization

```bash
python inference.py \
    --ct sample.nii.gz \
    --visualize
```

Displays:

* Reconstructed body mesh
* Organ markers
* Surface projection points
* Localization rays
* Interactive Open3D viewer

---

# Evaluation Metric

### Centroid Localization Error

```text
Error(mm) =
Distance(
Predicted Centroid,
Ground Truth Centroid
)
```

Computed in physical space using voxel spacing.

---

# Typical Results

| Organ        | Typical Error |
| ------------ | ------------- |
| Liver        | 10-15 mm      |
| Kidney Right | 12-18 mm      |
| Kidney Left  | 12-18 mm      |
| Spleen       | 15-20 mm      |
| Gallbladder  | 15-25 mm      |

Performance varies depending on CT quality, dataset size, and preprocessing.

---

# Future Improvements

* Attention-based decoder
* Transformer backbones
* Statistical anatomical priors
* Point-cloud localization
* AR visualization
* Surgical navigation support
* External body mesh → organ localization

---

---

# License

This project is intended for academic and research purposes.
