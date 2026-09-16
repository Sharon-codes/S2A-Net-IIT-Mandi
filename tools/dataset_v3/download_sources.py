import os
import sys
import time
import hashlib
import argparse
import shutil
from pathlib import Path
import urllib.request
import urllib.error

repo_root = Path(__file__).resolve().parent.parent.parent

# Defined sources and verified download endpoints
SOURCES = {
    "totalsegmentator": {
        "files": [
            {
                "name": "meta.csv",
                "url": "https://huggingface.co/datasets/YongchengYAO/TotalSegmentator-CT-Lite/raw/main/meta.csv",
                "expected_size": 105655, # ~105 KB
                "desc": "TotalSegmentator official metadata table (1228 cases)"
            },
            {
                "name": "Masks.zip",
                "url": "https://huggingface.co/datasets/YongchengYAO/TotalSegmentator-CT-Lite/resolve/main/Masks.zip",
                "expected_size": 826359567, # ~0.77 GB
                "desc": "TotalSegmentator 117-structure multiclass masks (1228 cases)"
            },
            {
                "name": "Images.zip",
                "url": "https://huggingface.co/datasets/YongchengYAO/TotalSegmentator-CT-Lite/resolve/main/Images.zip",
                "expected_size": 22604245648, # ~21.05 GB
                "desc": "TotalSegmentator CT image volumes (1228 cases)"
            }
        ]
    },
    "dap_atlas": {
        "files": [
            {
                "name": "Atlas_dataset.zip",
                "url": "https://drive.usercontent.google.com/download?id=1ex0a9eQULLvKPDwijmijX2h49A-ockNy&export=download&confirm=t",
                "expected_size": 1616249184, # ~1.51 GB
                "desc": "DAP Atlas official 142-structure anatomical masks (533 CT scans)"
            },
            {
                "name": "Images-CT.zip",
                "url": "https://huggingface.co/datasets/YongchengYAO/autoPET-III-Lite/resolve/main/Images-CT.zip",
                "expected_size": 37064977464, # ~34.52 GB
                "desc": "AutoPET whole-body CT image volumes (1038 scans matching DAP Atlas)"
            }
        ]
    }
}

def get_free_disk_gb(path: Path) -> float:
    stat = shutil.disk_usage(str(path))
    return stat.free / (1024 ** 3)

def compute_sha256(filepath: Path, chunk_size: int = 65536) -> str:
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            sha.update(data)
    return sha.hexdigest()

def download_file_with_resume(
    url: str,
    target_path: Path,
    expected_size: int = None,
    max_retries: int = 5,
    min_disk_free_gb: float = 30.0
) -> bool:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    part_path = target_path.with_suffix(target_path.suffix + ".part")

    free_gb = get_free_disk_gb(target_path.parent)
    if free_gb < min_disk_free_gb:
        print(f"[ERROR] Disk guard triggered: only {free_gb:.1f} GB free (threshold: {min_disk_free_gb} GB). Halting download.")
        return False

    # Check if target already completely downloaded
    if target_path.exists():
        actual_size = target_path.stat().st_size
        if expected_size is None or actual_size == expected_size:
            print(f"  [OK] Already downloaded and verified: {target_path.name} ({actual_size / (1024**2):.1f} MB)")
            return True
        else:
            print(f"  [WARN] Size mismatch for existing {target_path.name}: {actual_size} vs expected {expected_size}. Re-downloading.")

    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # Resume support via Range header
    resume_byte = 0
    if part_path.exists():
        resume_byte = part_path.stat().st_size
        if expected_size and resume_byte >= expected_size:
            part_path.rename(target_path)
            print(f"  [OK] Completed from .part file: {target_path.name}")
            return True
        headers["Range"] = f"bytes={resume_byte}-"
        print(f"  Resuming download from byte {resume_byte} ({resume_byte / (1024**2):.1f} MB)...")

    retry = 0
    while retry < max_retries:
        try:
            free_gb = get_free_disk_gb(target_path.parent)
            if free_gb < min_disk_free_gb:
                print(f"[ERROR] Disk space critical ({free_gb:.1f} GB free). Aborting.")
                return False

            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                mode = "ab" if resume_byte > 0 else "wb"
                total_bytes = resume_byte
                content_len = resp.headers.get("Content-Length")
                total_expected = int(content_len) + resume_byte if content_len else expected_size

                t0 = time.time()
                last_print = t0
                bytes_since_print = 0

                with open(part_path, mode) as out_f:
                    while True:
                        chunk = resp.read(1024 * 1024) # 1 MB chunks
                        if not chunk:
                            break
                        out_f.write(chunk)
                        total_bytes += len(chunk)
                        bytes_since_print += len(chunk)

                        now = time.time()
                        if now - last_print >= 5.0 or (total_expected and total_bytes == total_expected):
                            speed_mb = (bytes_since_print / (1024**2)) / (now - last_print) if (now - last_print) > 0 else 0
                            pct = (total_bytes / total_expected * 100) if total_expected else 0
                            print(f"  -> {target_path.name}: {total_bytes / (1024**2):.1f} MB / {(total_expected / (1024**2)) if total_expected else 0:.1f} MB ({pct:.1f}%) | {speed_mb:.1f} MB/s")
                            last_print = now
                            bytes_since_print = 0

                # Download finished, rename part
                part_path.rename(target_path)
                print(f"  [COMPLETE] {target_path.name} downloaded successfully in {time.time() - t0:.1f}s")
                return True

        except Exception as e:
            retry += 1
            wait_time = 2 ** retry
            print(f"  [WARN] Download error on {target_path.name}: {e}. Retrying in {wait_time}s (attempt {retry}/{max_retries})...")
            time.sleep(wait_time)
            # Update resume header
            if part_path.exists():
                resume_byte = part_path.stat().st_size
                headers["Range"] = f"bytes={resume_byte}-"

    print(f"[ERROR] Failed to download {target_path.name} after {max_retries} attempts.")
    return False

def record_raw_manifest(source_name: str, raw_dir: Path, manifest_path: Path):
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    header = "sha256,size_bytes,source_dataset,relative_path,download_timestamp\n"
    write_header = not manifest_path.exists() or manifest_path.stat().st_size == 0

    with open(manifest_path, "a") as f:
        if write_header:
            f.write(header)
        for filepath in sorted(raw_dir.glob("*")):
            if filepath.suffix == ".part":
                continue
            sha = compute_sha256(filepath)
            size = filepath.stat().st_size
            rel_path = str(filepath.relative_to(repo_root))
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(filepath.stat().st_mtime))
            f.write(f"{sha},{size},{source_name},{rel_path},{ts}\n")
    print(f"Updated raw file manifest: {manifest_path}")

def main():
    parser = argparse.ArgumentParser(description="Dataset V3 Robust Source Downloader")
    parser.add_argument("--source", choices=["totalsegmentator", "dap_atlas", "all"], required=True)
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--skip-large-images", action="store_true", help="Download metadata and masks only first for dry-run/audit")
    args = parser.parse_args()

    sources_to_run = ["totalsegmentator", "dap_atlas"] if args.source == "all" else [args.source]
    raw_manifest_path = repo_root / "sharon" / "dataset_v3" / "provenance" / "raw_file_manifest.csv"

    print("=" * 80)
    print("DATASET V3 SOURCE DOWNLOAD MANAGER")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print(f"Free Disk Space: {get_free_disk_gb(repo_root):.1f} GB")
    print("=" * 80)

    for src in sources_to_run:
        out_dir = Path(args.output) if args.output else (repo_root / "data_external" / src / "raw")
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"\nProcessing Source: [{src.upper()}] -> Target Dir: {out_dir}")

        for file_info in SOURCES[src]["files"]:
            if args.skip_large_images and "images" in file_info["name"].lower():
                print(f"  [SKIPPED] {file_info['name']} (--skip-large-images enabled)")
                continue

            target_file = out_dir / file_info["name"]
            print(f"\n- Downloading {file_info['name']} ({file_info['desc']})...")
            success = download_file_with_resume(
                url=file_info["url"],
                target_path=target_file,
                expected_size=file_info["expected_size"]
            )
            if not success:
                print(f"[FATAL] Could not retrieve required file {file_info['name']}.")
                sys.exit(1)

        # Update raw manifest for this source
        record_raw_manifest(src, out_dir, raw_manifest_path)

    print("\n" + "=" * 80)
    print("DOWNLOAD STAGE COMPLETED SUCCESSFULLY")
    print(f"Updated Manifest: {raw_manifest_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()
