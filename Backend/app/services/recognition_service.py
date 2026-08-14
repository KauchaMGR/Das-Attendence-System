import os

import cv2
import numpy as np

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml_models")

YUNET_PATH = os.path.join(_MODELS_DIR, "face_detection_yunet_2023mar.onnx")
SFACE_PATH = os.path.join(_MODELS_DIR, "face_recognition_sface_2021dec.onnx")

# OpenCV Zoo's recommended cosine-similarity threshold for SFace — scores at
# or above this are considered the same person.
COSINE_MATCH_THRESHOLD = 0.4

_detector = None
_recognizer = None


def _get_detector():
    global _detector

    if _detector is None:
        _detector = cv2.FaceDetectorYN_create(YUNET_PATH, "", (320, 320))

    return _detector


def _get_recognizer():
    global _recognizer

    if _recognizer is None:
        _recognizer = cv2.FaceRecognizerSF_create(SFACE_PATH, "")

    return _recognizer


def load_models():
    """Warm up both models once, so the first real request isn't slow. Call on FastAPI startup."""

    _get_detector()
    _get_recognizer()


def _decode_image(image_bytes):

    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image")

    return image


def _detect_faces(image):

    detector = _get_detector()
    detector.setInputSize((image.shape[1], image.shape[0]))

    _, faces = detector.detect(image)

    if faces is None:
        return []

    return faces


def _embed_face(image, face_row):

    recognizer = _get_recognizer()

    aligned_face = recognizer.alignCrop(image, face_row)

    return recognizer.feature(aligned_face)


def extract_single_embedding(image_bytes):
    """
    Enrollment path — the photo must contain exactly one face.
    Returns a plain list[float] (128-d), ready to store as
    FaceEmbeddingCreate.embedding_vector.
    """

    image = _decode_image(image_bytes)
    faces = _detect_faces(image)

    if len(faces) == 0:
        raise ValueError("No face detected in the photo")

    if len(faces) > 1:
        raise ValueError(f"Expected exactly one face, found {len(faces)}")

    feature = _embed_face(image, faces[0])

    return feature.flatten().tolist()


def extract_all_embeddings(image_bytes):
    """
    Attendance path — one 128-d feature vector (numpy, shape (1, 128)) per
    detected face, ready to compare against stored embeddings.
    """

    image = _decode_image(image_bytes)
    faces = _detect_faces(image)

    return [_embed_face(image, face_row) for face_row in faces]


def find_best_match(embedding, stored_faces, threshold=COSINE_MATCH_THRESHOLD):
    """
    embedding: numpy array, shape (1, 128) — one detected face's feature vector.
    stored_faces: list of dicts with "student_id" and "embedding_vector"
        (the shape returned by face_service.get_all_faces()).

    Returns (student_id, score) for the best match at or above `threshold`,
    or None if nobody matched closely enough.
    """

    recognizer = _get_recognizer()

    best_student_id = None
    best_score = -1.0

    for face in stored_faces:

        stored_vector = np.array(
            face["embedding_vector"], dtype=np.float32
        ).reshape(1, -1)

        score = recognizer.match(
            embedding, stored_vector, cv2.FaceRecognizerSF_FR_COSINE
        )

        if score > best_score:
            best_score = score
            best_student_id = face["student_id"]

    if best_score >= threshold:
        return best_student_id, best_score

    return None
