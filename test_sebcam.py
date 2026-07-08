import cv2

from src.camera.webcam import Webcam
from src.detector.detect import FaceDetector
from src.embeddings.sface import SFaceEmbedder

MODEL_PATH = "Models/yolov8n-face.pt"
SFACE_MODEL = "Models/face_recognition_sface_2021dec.onnx"

embedder = SFaceEmbedder(SFACE_MODEL)

camera = Webcam()

detector = FaceDetector(MODEL_PATH)

print("Press Q to quit.")

while True:

    # Capture one frame
    frame = camera.get_frame()

    # Detect faces
    image, detections = detector.detect_faces(frame)

    # Draw bounding boxes
    for detection in detections:

        x1, y1, x2, y2 = detection["bbox"]

        confidence = detection["confidence"]
        # -----------------------------------------
     # Crop the detected face (RAM only)
     # -----------------------------------------
    face = image[y1:y2, x1:x2]

    # Ignore invalid crops
    if face.size == 0:
     continue

    # Generate embedding directly
    embedding = embedder.generate_embedding(face)

    print("\nEmbedding Generated")
    print("Shape :", embedding.shape)
    print("Length:", len(embedding))
        
        # Draw bounding box
    cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

    cv2.putText(
            image,
            f"{confidence:.2f}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    cv2.imshow("YOLOv8 Face Detection", image)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()