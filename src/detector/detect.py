import cv2
from ultralytics import YOLO

class FaceDetector:
    """Detects faces using a YOLOv8 Face model."""

    def __init__(self, model_path: str):
        """
        Initializes the FaceDetector with the specified YOLO model path.
        """
        self.model = YOLO(model_path)

    def detect_faces(self, frame):
        """
        Detect faces from a webcam frame.

        Parameters
        ----------
        frame : numpy.ndarray
            Image captured from the webcam.

        Returns
        -------
        frame : numpy.ndarray
            Original frame.
        detections : list
            List of detected faces containing bounding boxes and confidence scores.
        """
        if frame is None or frame.size == 0:
            raise ValueError("Frame is empty.")

        # Run inference on the frame
        results = self.model(frame, verbose=False)
        detections = []

        for result in results:
            for box in result.boxes:
                # Extract box coordinates (x1, y1, x2, y2) and confidence score
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = float(box.conf[0])
                
                # Append detected face details
                detections.append({
                    "bbox": (x1, y1, x2, y2),
                    "confidence": confidence
                })

        return frame, detections
