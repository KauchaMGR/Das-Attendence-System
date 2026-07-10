import cv2

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

print("=" * 50)
print("Smart Attendance System")
print("Attendance Mode")
print("=" * 50)
print("Press SPACE to recognize student")
print("Press Q to quit\n")

# ----------------------------------------------------
# Webcam Loop
# ----------------------------------------------------
while True:

    # Capture frame
    frame = camera.get_frame()

    # Detect faces
    image, detections = detector.detect_faces(frame)

    total_faces = len(detections)

    # ------------------------------------------------
    # Draw Detection Results
    # ------------------------------------------------
    for detection in detections:

        x1, y1, x2, y2 = detection["bbox"]

        confidence = detection["confidence"]

        score, ready, message = quality.evaluate_attendance(
            detection,
            image.shape
        )

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

        # Quality
        cv2.putText(
            image,
            f"Quality : {score}%",
            (x1, y1 - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

        # Status
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
    # Show Webcam
    # ------------------------------------------------
    cv2.imshow("Smart Attendance", image)

    key = cv2.waitKey(1) & 0xFF

    # Quit
    if key == ord("q"):
        break

    # ------------------------------------------------
    # Recognition
    # ------------------------------------------------
    if key == ord(" "):

        # Exactly one face
        if total_faces == 0:
            print("\n No face detected.")
            continue

        print(f"\nDetected {total_faces} face(s).\n") 

        for index, detection in enumerate(detections, start=1):

            score, ready, message = quality.evaluate_attendance(
                detection,
                image.shape
            )

            if not ready:
                print(f"\nCannot Capture : {message}")
                continue

            # Crop Face
            x1, y1, x2, y2 = detection["bbox"]

            face = image[y1:y2, x1:x2]
            print("-" * 50)
            print(f"Processing Face {index}")

            # Generate Embedding
            embedding = embedder.generate_embedding(face)

            print("\nGenerating Embedding...")

            # Recognize Student
            result = recognizer.recognize(embedding)

            print("=" * 50)

            if result is None:
                cv2.putText(
                    image,
                    "Unknown",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 0, 255),
                    2
                )

    
                print("Unknown Person")
                
            else:
                student = result["student"]
                similarity = result["similarity"]

                cv2.putText(
                    image,
                    f"{student['name']} ({similarity:.2f})",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                print("Student Recognized Successfully\n")
                print(f"Student ID : {student['student_id']}")
                print(f"Name       : {student['name']}")
                print(f"Department : {student['department']}")
                print(f"Semester   : {student['semester']}")
                print(f"Email      : {student['email']}")
                print(f"Similarity : {similarity:.4f}")

            print("=" * 50)

         
        # Show recognition results on webcam
        cv2.imshow("Smart Attendance", image)

        # Keep the result visible for 2 seconds
        cv2.waitKey(2000)   

# ----------------------------------------------------
# Cleanup
# ----------------------------------------------------
camera.release()

cv2.destroyAllWindows()
