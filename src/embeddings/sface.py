import cv2
import numpy as np


class SFaceEmbedder:
    """
    Loads the SFace model and generates
    facial embeddings.
    """

    def __init__(self, model_path):

        self.model = cv2.FaceRecognizerSF.create(
            model_path,
            ""
        )

        print("SFace model loaded successfully.")

    def generate_embedding(self, face_image):
        """
        Generate a 512-dimensional embedding
        from a cropped face image.
        """

        # Resize image to the required input size
        face = cv2.resize(face_image, (112, 112))

        # Generate embedding
        embedding = self.model.feature(face)

        # Convert to 1D NumPy array for easy to store
        embedding = np.array(embedding).flatten()

        return embedding        