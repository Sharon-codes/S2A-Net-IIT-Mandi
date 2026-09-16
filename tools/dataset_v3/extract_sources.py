import os
import sys
import zipfile
import tarfile
import argparse
from pathlib import Path
import time

repo_root = Path(__file__).resolve().parent.parent.parent

def is_safe_path(base_dir: Path, target_path: Path) -> bool:
    try:
        target_path.resolve().relative_to(base_dir.resolve())
        return True
    except ValueError:
        return False

def safe_extract_zip(zip_path: Path, extract_dir: Path) -> bool:
    print(f"Extracting {zip_path.name} to {extract_dir}...")
    extract_dir.mkdir(parents=True, exist_ok=True)
    done_marker = extract_dir / f".{zip_path.stem}_extracted.done"

    if done_marker.exists():
        print(f"  [OK] Extraction already completed: {done_marker.name}")
        return True

    t0 = time.time()
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            namelist = zf.namelist()
            total_files = len(namelist)
            print(f"  Total items inside archive: {total_files}")

            for i, member in enumerate(namelist):
                target_dest = extract_dir / member
                if not is_safe_path(extract_dir, target_dest):
                    print(f"  [ERROR] Path traversal attempt detected: {member}. Aborting.")
                    return False

                zf.extract(member, extract_dir)
                if (i + 1) % 500 == 0 or (i + 1) == total_files:
                    elapsed = time.time() - t0
                    print(f"  -> Extracted {i + 1}/{total_files} files ({((i + 1)/total_files)*100:.1f}%) in {elapsed:.1f}s")

        done_marker.touch()
        print(f"  [COMPLETE] Extracted {zip_path.name} in {time.time() - t0:.1f}s")
        return True
    except Exception as e:
        print(f"  [ERROR] Failed to extract {zip_path.name}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Dataset V3 Safe Archive Extractor")
    parser.add_argument("--source", choices=["totalsegmentator", "dap_atlas", "all"], required=True)
    args = parser.parse_args()

    sources = ["totalsegmentator", "dap_atlas"] if args.source == "all" else [args.source]

    print("=" * 80)
    print("DATASET V3 SAFE ARCHIVE EXTRACTOR")
    print("=" * 80)

    for src in sources:
        raw_dir = repo_root / "data_external" / src / "raw"
        ext_dir = repo_root / "data_external" / src / "extracted"
        print(f"\nProcessing Source: {src.upper()}")
        print(f"  Raw archive directory:       {raw_dir}")
        print(f"  Target extraction directory: {ext_dir}")

        for zip_file in sorted(raw_dir.glob("*.zip")):
            safe_extract_zip(zip_file, ext_dir)

if __name__ == "__main__":
    main()
