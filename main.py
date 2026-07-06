from src.detector.detect import FaceDetector
import os
import cv2


from src.embeddings.sface import SFaceEmbedder
from src.utils.embedding_utils import save_embedding

from src.utils.image_utils import (
    crop_faces,
    draw_detections,
    save_image
)

# -----------------------------
# Model Path
# -----------------------------
MODEL_PATH = os.path.join("Models", "yolov8n-face.pt")

# -----------------------------
# Test Image
# -----------------------------
IMAGE_PATH = os.path.join(
    "Datasets",
    "Register",
    "john.jpg"
)

# -----------------------------
# Initialize Detector
# -----------------------------
detector = FaceDetector(MODEL_PATH)

print("=" * 50)
print("Smart Attendance System")
print("Module 1 : Face Detection")
print("=" * 50)

# -----------------------------
# Detect Faces
# -----------------------------
image, detections = detector.detect_faces(IMAGE_PATH)

print(f"\nTotal Faces Detected : {len(detections)}\n")

for index, detection in enumerate(detections, start=1):

    print(f"Face {index}")
    print(f"Bounding Box : {detection['bbox']}")
    print(f"Confidence : {detection['confidence']:.2f}")
    print("-" * 40)

# -----------------------------
# Crop Faces
# -----------------------------
cropped_faces = crop_faces(
    image,
    detections,
    "Outputs/Detected_face"
)

# -----------------------------
# Draw Bounding Boxes
# -----------------------------
annotated = draw_detections(
    image,
    detections
)

# -----------------------------
# Save Annotated Image
# -----------------------------
save_image(
    annotated,
    "Outputs/Annotated/john_detected.jpg"
)

print("\nSaved Cropped Faces:")

for face in cropped_faces:
    print(face)

print("\nAnnotated image saved successfully.")






# ----------------------------
# Load SFace Model
# ----------------------------
SFACE_MODEL = os.path.join(
    "Models",
    "face_recognition_sface_2021dec.onnx"
)

embedder = SFaceEmbedder(SFACE_MODEL)

# ----------------------------
# Generate Embeddings
# ----------------------------

print("\nGenerating Face Embeddings...\n")

for index, face_path in enumerate(cropped_faces, start=1):

    face = cv2.imread(face_path)

    embedding = embedder.generate_embedding(face)

    save_embedding(
        embedding,
        os.path.join(
            "Outputs",
            "Embeddings",
            f"face_{index}.npy"
        )
    )

    print(f"Face {index}")
    print(f"Embedding Length : {len(embedding)}")
    print("-" * 40)