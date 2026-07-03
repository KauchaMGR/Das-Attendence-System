from ultralytics import YOLO
import cv2
import os


class FaceDetector:

    def __init__(self, model_path):
        self.model = YOLO(model_path)

def detect(self, image_path):

    image = cv2.imread(image_path) #image read

    if image is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    results = self.model(image) #to analyze the image and detect the face

    faces = []   #array to store the detected face over here like boundary, and confidence level

    for result in results:

        boxes = result.boxes

        for box in boxes:

            x1, y1, x2, y2 = map(int, box.xyxy[0])#to create the boundary around the image

            confidence = float(box.conf[0])  # represents the confidence level that it detected a face

            faces.append({
                "bbox": (x1, y1, x2, y2),
                "confidence": confidence
            })

    return image, faces 

def crop_faces(self, image, faces, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    cropped_faces = []

    for index, face in enumerate(faces):

        x1, y1, x2, y2 = face["bbox"]

        cropped_face = image[y1:y2, x1:x2]

        filename = os.path.join(
            output_folder,
            f"face_{index+1}.jpg"
        )

        cv2.imwrite(filename, cropped_face)

        cropped_faces.append(filename)

    return cropped_faces
