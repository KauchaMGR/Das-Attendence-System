import cv2

from src.camera.webcam import Webcam
from src.detector.detect import FaceDetector
from src.embeddings.sface import SFaceEmbedder
from src.quality.face_quality import FaceQuality
from src.services.registration_service import RegistrationService

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
registration = RegistrationService()


# ----------------------------------------------------
# Registration Pose Sequence
# ----------------------------------------------------
POSES = [
    "LOOK STRAIGHT",
    "TURN LEFT",
    "TURN RIGHT",
    "SMILE",
    "LOOK SLIGHTLY UP"
]

current_pose = 0
embeddings = []

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

    # Capture Frame
    frame = camera.get_frame()

    # Detect Faces
    image, detections = detector.detect_faces(frame)
    total_faces = len(detections)

    # ------------------------------------------------
    # Draw Detection Results
    # ------------------------------------------------
    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]
        confidence = detection["confidence"]

        score, ready, message = quality.evaluate(
            detection,
            total_faces,
            image.shape
        )

        color = (0, 255, 0) if ready else (0, 0, 255)

        # Bounding Box
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

    # Fixed Indentation for Pose UI Overlays
    cv2.putText(
        image,
        f"Pose {current_pose + 1}/5",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    )

    cv2.putText(
        image,
        POSES[current_pose],
        (20, 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    ) 

    # ------------------------------------------------
    # Display Webcam
    # ------------------------------------------------
    cv2.imshow("Student Registration", image)
    key = cv2.waitKey(1) & 0xFF

    # Quit Program
    if key == ord("q"):
        break

    # ------------------------------------------------
    # Capture Registration
    # ------------------------------------------------
    if key == ord(" "):

        # Exactly one face must be detected
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

        # Bounding Box
        x1, y1, x2, y2 = detection["bbox"]

        # Crop Face (RAM only)
        face = image[y1:y2, x1:x2]

        # Generate Embedding
        embedding = embedder.generate_embedding(face)
        embeddings.append(embedding.tolist())

        # Log completion BEFORE incrementing to prevent index out of bounds error
        print(f"\nEmbedding {current_pose + 1} Captured Successfully")
        
        current_pose += 1

        if current_pose < len(POSES):
            print("\nNext pose:")
            print(POSES[current_pose])
            continue

        print("\nFace Captured Successfully.")

        # --------------------------------------------
        # Student Details
        # --------------------------------------------
        student_id = input("Student ID : ")
        name = input("Student Name : ")
        department = input("Department : ")
        semester = int(input("Semester : "))
        email = input("Email : ")

        # --------------------------------------------
        # Store in MongoDB
        # --------------------------------------------
        registration.register(
            student_id=student_id,
            name=name,
            department=department,
            semester=semester,
            email=email,
            embeddings=embeddings
        )

        print("\n" + "=" * 50)
        print("Student Registered Successfully")
        print("=" * 50)
        print(f"Student ID : {student_id}")
        print(f"Name       : {name}")
        print(f"Department : {department}")
        print(f"Semester   : {semester}")
        print(f"Email      : {email}")
        print(f"Embedding Length : {len(embedding)}")
        print("\nFace image was NOT stored.")
        print("Only embedding was stored in MongoDB.")
        print("=" * 50)

        break

# ----------------------------------------------------
# Cleanup
# ----------------------------------------------------
camera.release()
cv2.destroyAllWindows()
