from src.embeddings.sface import SFaceEmbedder
import os


MODEL_PATH = os.path.join(
    "Models",
    "face_recognition_sface_2021dec.onnx"
)

embedder = SFaceEmbedder(MODEL_PATH)