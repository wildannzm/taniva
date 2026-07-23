"""
prepare_dataset.py

Tahap 1 - trust Layer: menggabungkan dataset Roboflow menjadi satu dataset YOLOv8 dengan
2 kelas standar: tomat_segar, tomat_busuk.

"""

import os
import random
import shutil
import yaml
from pathlib import Path

# Kelas final yang dipakai
FINAL_CLASSES = ["tomat_segar", "tomat_busuk"]

# Batas maksimum gambar yang diambil PER DATASET SUMBER per split
SAMPLE_LIMIT = {"train": 1500, "valid": 450, "test": 50}
RANDOM_SEED = 42  # supaya hasil sampling konsisten & bisa direproduksi ulang

#Class mapping dari kelas asli
CLASS_MAPPING = {
    "tomat-dataset": {
        "Tomat Segar": "tomat_segar",
        "Tomat Busuk": "tomat_busuk",
    },
}

RAW_DIR = Path("dataset-raw")
OUT_DIR = Path("dataset")


def load_class_names(dataset_dir: Path) -> dict:
    """Baca data.yaml bawaan dataset Roboflow untuk dapat mapping index -> nama kelas asli."""
    yaml_path = dataset_dir / "data.yaml"
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    names = data["names"]
    if isinstance(names, list):
        return {i: n for i, n in enumerate(names)}
    return names  # sudah dict {index: name}


def remap_labels(dataset_key: str, dataset_dir: Path, split: str):
    """Salin gambar + tulis ulang file label .txt dengan KESEIMBANGAN KELAS."""
    original_names = load_class_names(dataset_dir)
    mapping_by_name = CLASS_MAPPING.get(dataset_key, {})
    
    index_map = {}
    for idx, name in original_names.items():
        if name in mapping_by_name:
            final_name = mapping_by_name[name]
            index_map[idx] = FINAL_CLASSES.index(final_name)

    img_src = dataset_dir / split / "images"
    lbl_src = dataset_dir / split / "labels"
    if not img_src.exists():
        print(f"  [skip] {dataset_key}/{split}: folder tidak ditemukan")
        return 0

    img_dst = OUT_DIR / split / "images"
    lbl_dst = OUT_DIR / split / "labels"
    img_dst.mkdir(parents=True, exist_ok=True)
    lbl_dst.mkdir(parents=True, exist_ok=True)

    label_files = list(lbl_src.glob("*.txt"))
    
    # ACAK urutan file SEBELUM diproses
    random.seed(RANDOM_SEED)
    random.shuffle(label_files)

    limit = SAMPLE_LIMIT.get(split)
    # Tentukan kuota per kelas (misal total 2000 gambar -> kuota 1000 per kelas)
    target_per_class = (limit // len(mapping_by_name)) if limit else float('inf')
    
    # Counter untuk memantau jumlah objek (bounding box) yang sudah diambil
    class_counter = {cls_idx: 0 for cls_idx in index_map.values()}
    count_img = 0

    for label_file in label_files:
        new_lines = []
        file_classes = []
        
        with open(label_file, "r") as f:
            for line in f:
                parts = line.strip().split()
                if not parts:
                    continue
                orig_cls = int(parts[0])
                if orig_cls not in index_map:
                    continue 
                
                new_cls = index_map[orig_cls]
                new_lines.append(" ".join([str(new_cls)] + parts[1:]))
                file_classes.append(new_cls)

        if not new_lines:
            continue

        # CEK KESEIMBANGAN
        is_needed = False
        for c in set(file_classes):
            if class_counter[c] < target_per_class:
                is_needed = True
                break
                
        # Jika semua kelas di dalam gambar ini sudah memenuhi kuota, lewati gambarnya
        if not is_needed and limit is not None:
            continue

        # Coba cari file gambar dengan berbagai kemungkinan ekstensi
        img_file = img_src / (label_file.stem + ".jpg")
        if not img_file.exists(): img_file = img_src / (label_file.stem + ".png")
        if not img_file.exists(): img_file = img_src / (label_file.stem + ".jpeg")
        if not img_file.exists(): img_file = img_src / (label_file.stem + ".JPG")
        
        if not img_file.exists():
            continue

        # Salin gambar dan simpan label
        new_stem = f"{dataset_key}_{label_file.stem}"
        shutil.copy(img_file, img_dst / f"{new_stem}{img_file.suffix}")
        
        with open(lbl_dst / f"{new_stem}.txt", "w") as f:
            f.write("\n".join(new_lines))
            
        # Update counter untuk setiap objek yang ada di gambar tersebut
        for c in file_classes:
            class_counter[c] += 1
            
        count_img += 1

        # Berhenti jika jumlah gambar total sudah mencapai limit
        if limit and count_img >= limit:
            break

    # Tampilkan laporan distribusi kelas agar kamu tahu hasilnya seimbang atau tidak
    print(f"  [{dataset_key}/{split}] {count_img} gambar diproses.")
    for cls_idx, count in class_counter.items():
        print(f"      -> {FINAL_CLASSES[cls_idx]}: {count} objek")
        
    return count_img


def main():
    OUT_DIR.mkdir(exist_ok=True)
    total = 0
    for dataset_key in CLASS_MAPPING:
        dataset_dir = RAW_DIR / dataset_key
        if not dataset_dir.exists():
            print(f"[peringatan] {dataset_dir} tidak ditemukan, dilewati")
            continue
        print(f"Memproses dataset: {dataset_key}")
        for split in ["train", "valid", "test"]:
            total += remap_labels(dataset_key, dataset_dir, split)


    absolute_dataset_path = str(OUT_DIR.resolve()).replace("\\", "/")
    final_yaml = {
        "path": absolute_dataset_path,
        "train": "train/images",
        "val": "valid/images",
        "test": "test/images",
        "names": {i: n for i, n in enumerate(FINAL_CLASSES)},
    }
    with open(OUT_DIR / "data.yaml", "w") as f:
        yaml.dump(final_yaml, f, allow_unicode=True, sort_keys=False)

    print(f"\ndata.yaml ditulis dengan path absolut: {absolute_dataset_path}")

    print(f"\nSelesai. Total {total} gambar digabung ke folder '{OUT_DIR}/'.")
    print(f"(Dataset besar otomatis di-sampling max {SAMPLE_LIMIT['train']} gambar/split")
    print(" per sumber dataset -- ubah SAMPLE_LIMIT di atas kalau mau lebih banyak/sedikit)")
    print("PENTING: cek isi CLASS_MAPPING di script ini dan sesuaikan dengan")
    print("nama kelas asli di data.yaml tiap dataset SEBELUM menjalankan ulang.")


if __name__ == "__main__":
    main()
