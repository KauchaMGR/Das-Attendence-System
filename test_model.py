from ultralytics import YOLO

print("Loading YOLOv8 Face model...")

model = YOLO("Models/yolov8n-face.pt")

print("✅ Model loaded successfully!")