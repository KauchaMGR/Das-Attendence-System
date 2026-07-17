import cv2
import time

from src.camera.webcam import Webcam
from src.detector.detect import FaceDetector
from src.embeddings.sface import SFaceEmbedder
from src.quality.face_quality import FaceQuality
from src.services.recognition_service import RecognitionService

# ----------------------------------------------------
# Model Paths
# ----------------------------------------------------
YOLO_MODEL = "Models/yolov8n-face.pt"
SFACE_MODEL = "Models/face_recognition_sface_2021dec.onnx"

# ----------------------------------------------------
# Initialize Objects
# ----------------------------------------------------
camera = Webcam()

detector = FaceDetector(YOLO_MODEL)

embedder = SFaceEmbedder(SFACE_MODEL)

quality = FaceQuality()
recognizer = RecognitionService()

# ----------------------------------------------------
# Parameters
# ----------------------------------------------------
TOTAL_FRAMES = 10

print("=" * 60)
print("MULTI FRAME EMBEDDING TEST")
print("=" * 60)
print("Press SPACE to start capturing")
print("Press Q to quit")
print("=" * 60)

# ----------------------------------------------------
# Main Loop
# ----------------------------------------------------
while True:

    frame = camera.get_frame()

    image, detections = detector.detect_faces(frame)

    total_faces = len(detections)

    # --------------------------------------------
    # Draw Detection
    # --------------------------------------------
    for detection in detections:

        x1, y1, x2, y2 = detection["bbox"]

        confidence = detection["confidence"]

        score, ready, message = quality.evaluate_attendance(
            detection,
            image.shape
        )

        color = (0,255,0) if ready else (0,0,255)

        cv2.rectangle(
            image,
            (x1,y1),
            (x2,y2),
            color,
            2
        )

        cv2.putText(
            image,
            f"{score}%",
            (x1,y1-10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

    cv2.imshow("Multi Frame Test", image)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

    # ======================================================
    # Start Multi Frame Capture
    # ======================================================
    if key == ord(" "):

        if total_faces != 1:
            print("\nExactly ONE face must be visible.")
            continue

        print("\nStarting capture...\n")

        live_embeddings = []

        frame_count = 0

        while frame_count < TOTAL_FRAMES:

            frame = camera.get_frame()

            image, detections = detector.detect_faces(frame)

            if len(detections) != 1:
                continue

            detection = detections[0]

            score, ready, message = quality.evaluate_attendance(
                detection,
                image.shape
            )

            if not ready:
                continue

            x1,y1,x2,y2 = detection["bbox"]

            face = image[y1:y2, x1:x2]

            embedding = embedder.generate_embedding(face)

            live_embeddings.append(embedding)

            frame_count += 1

            print(f"Captured Frame {frame_count}/{TOTAL_FRAMES}")

            cv2.rectangle(
                image,
                (x1,y1),
                (x2,y2),
                (0,255,0),
                2
            )

            cv2.putText(
                image,
                f"Captured {frame_count}/{TOTAL_FRAMES}",
                (20,40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0,255,255),
                2
            )

            cv2.imshow("Multi Frame Test", image)

            cv2.waitKey(100)

        # ===================================================
        # Results
        # ===================================================

        print("\n")
print("=" * 60)
print("STARTING RECOGNITION")
print("=" * 60)

result = recognizer.recognize_multiple(live_embeddings)

print("\n")

if result is None:

    print("=" * 60)
    print("UNKNOWN PERSON")
    print("=" * 60)

else:

    student = result["student"]
    similarity = result["similarity"]

    print("=" * 60)
    print("PERSON RECOGNIZED")
    print("=" * 60)

    print(f"Student ID : {student['student_id']}")
    print(f"Name       : {student['name']}")
    print(f"Department : {student['department']}")
    print(f"Semester   : {student['semester']}")
    print(f"Similarity : {similarity:.4f}")
        

camera.release()

cv2.destroyAllWindows()