import cv2

from src.camera.webcam import Webcam
from src.detector.detect import FaceDetector
from src.embeddings.sface import SFaceEmbedder
from src.quality.face_quality import FaceQuality

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

print("=" * 50)
print("Smart Attendance System")
print("Registration Mode")
print("=" * 50)
print("Press SPACE to capture")
print("Press Q to quit\n")

# ----------------------------------------------------
# Webcam Loop
# ----------------------------------------------------
while True:

    # Capture one frame
    frame = camera.get_frame()

    # Detect faces
    image, detections = detector.detect_faces(frame)

    total_faces = len(detections)

    # ---------------------------------------------
    # Process every detected face
    # ---------------------------------------------
    for detection in detections:

        x1, y1, x2, y2 = detection["bbox"]

        confidence = detection["confidence"]

        # Evaluate quality
        score, ready, message = quality.evaluate(
            detection,
            total_faces,
            image.shape
        )

        # Green if ready, Red otherwise
        color = (0, 255, 0) if ready else (0, 0, 255)

        # Draw Bounding Box
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            color,
            2
        )

        # Confidence
        cv2.putText(
            image,
            f"Conf : {confidence:.2f}",
            (x1, y1 - 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

        # Quality Score
        cv2.putText(
            image,
            f"Quality : {score}%",
            (x1, y1 - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

        # Status Message
        cv2.putText(
            image,
            message,
            (x1, y2 + 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            color,
            2
        )

    # ------------------------------------------------
    # Display Webcam
    # ------------------------------------------------
    cv2.imshow("Student Registration", image)

    key = cv2.waitKey(1) & 0xFF

    # Quit
    if key == ord("q"):
        break

    # ------------------------------------------------
    # Capture Face
    # ------------------------------------------------
    if key == ord(" "):

        if total_faces != 1:
            print("Exactly one face must be detected.")
            continue

        detection = detections[0]

        score, ready, message = quality.evaluate(
            detection,
            total_faces,
            image.shape
        )

        if not ready:
            print(f"Cannot Capture : {message}")
            continue

        x1, y1, x2, y2 = detection["bbox"]

        # Crop face (RAM only)
        face = image[y1:y2, x1:x2]

        # Generate Embedding
        embedding = embedder.generate_embedding(face)

        print("\n" + "=" * 50)
        print("Face Captured Successfully")
        print("=" * 50)

        print(f"Quality Score : {score}%")

        print(f"Embedding Shape : {embedding.shape}")

        print(f"Embedding Length : {len(embedding)}")

        print("\nRegistration image discarded.")
        print("Only embedding remains in memory.")

        print("=" * 50)

        # Next Module:
        # Store embedding into MongoDB

        break

camera.release()

cv2.destroyAllWindows()