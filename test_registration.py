import cv2
import os

from src.embeddings.sface import SFaceEmbedder
from src.services.registration_service import RegistrationService

# ----------------------------
# Paths
# ----------------------------

MODEL_PATH = os.path.join(
    "Models",
    "face_recognition_sface_2021dec.onnx"
)

FACE_PATH = os.path.join(
    "Outputs",
    "Detected_face",
    "face_1.jpg"
)

# ----------------------------
# Load SFace Model
# ----------------------------

embedder = SFaceEmbedder(MODEL_PATH)

# ----------------------------
# Read Cropped Face
# ----------------------------

face = cv2.imread(FACE_PATH)

if face is None:
    raise FileNotFoundError(
        f"Face image not found: {FACE_PATH}"
    )

# ----------------------------
# Generate Actual Embedding
# ----------------------------

embedding = embedder.generate_embedding(face)

# Convert NumPy array to Python list
# embedding = embedding.tolist()

print("Embedding generated successfully.")
print(f"Embedding Length : {len(embedding)}")

# ----------------------------
# Register Student
# ----------------------------

service = RegistrationService()

service.register(
    student_id="2026001",
    name="John Doe",
    department="Computer Engineering",
    semester=8,
    email="john@example.com",
    embedding=embedding
)

print("\nStudent registered successfully with REAL embedding.")