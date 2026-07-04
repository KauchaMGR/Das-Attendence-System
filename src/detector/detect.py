from ultralytics import YOLO
import cv2



class FaceDetector:
    """
    Detects faces using a YOLOv8 Face model.
    """

    def __init__(self, model_path):
        self.model = YOLO(model_path)

    def detect_faces(self, image_path):

        image = cv2.imread(image_path)

        if image is None:
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        results = self.model(image,verbose=False)

        detections = []

        for result in results:

            for box in result.boxes:

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                confidence = float(box.conf[0])

                detections.append({
                    "bbox": (x1, y1, x2, y2),
                    "confidence": confidence
                })

        return image, detections