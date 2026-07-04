from detector.detect import FaceDetector
import os

print(os.getcwd())

MODEL_PATH = os.path.join("Models", "yolov8n-face.pt")

detector = FaceDetector(MODEL_PATH)

image, faces = detector.detect("Dataset/Register/john.jpg")

print(f"Detected {len(faces)} face(s)")

cropped = detector.crop_faces(
    image,
    faces,
    "Outputs/Detected_faces"
)

print("Saved faces:")
for face in cropped:
    print(face)