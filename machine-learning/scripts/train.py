"""
train_yolo.py

Tahap 2: fine-tuning YOLOv8 nano pada dataset tomat/cabai fresh-rotten.
Pakai yolov8n (nano) karena prioritas MVP adalah kecepatan inferensi
(<50ms/batch sesuai proposal), bukan akurasi maksimal.

Jalankan: python train_yolo.py
Output model ada di: runs/detect/taniva_trust_layer/weights/best.pt
"""

from ultralytics import YOLO


def main():
    model = YOLO("yolov8s.pt")

    model.train(
        data="dataset/data.yaml",
        epochs=30,             
        imgsz=640,
        batch=32,               
        patience=8,             
        project="runs/detect",
        name="taniva_trust_layer_v2",
        device=0,               
        exist_ok=True,
        optimizer="AdamW",
        lr0=0.001,
        augment=True,           
        val=True,
        workers=4,            
    )

    # evaluasi cepat di test set
    metrics = model.val(data="dataset/data.yaml", split="val")
    print("mAP50:", metrics.box.map50)
    print("mAP50-95:", metrics.box.map)

    try:
        model.export(format="onnx", half=True)
        print("Export ONNX berhasil (opsional, untuk optimasi tambahan di masa depan).")
    except Exception as e:
        print(f"\n[info] Export ONNX dilewati ({e}).")
        print("Ini TIDAK masalah -- cv_pipeline.py memakai best.pt langsung, bukan ONNX.")
        print("Kalau tetap mau coba export ONNX nanti: pip install onnxscript")

    print("\nModel siap. Salin file berikut ke folder ml/weights/ backend:")
    print("  runs/detect/taniva_trust_layer/weights/best.pt")


if __name__ == "__main__":
    main()
