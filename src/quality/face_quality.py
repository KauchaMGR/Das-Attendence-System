"""
Face Quality Assessment Module
------------------------------
This module evaluates whether a detected face is suitable
for registration before generating facial embeddings.
"""

class FaceQuality:

    def __init__(
        self,
        min_confidence=0.70,
        min_face_size=150,
        frame_margin=20
    ):
        """
        Initialize quality thresholds.

        Parameters
        ----------
        min_confidence : float
            Minimum YOLO detection confidence.

        min_face_size : int
            Minimum face width and height in pixels.

        frame_margin : int
            Minimum distance from image border.
        """

        self.min_confidence = min_confidence
        self.min_face_size = min_face_size
        self.frame_margin = frame_margin

    def evaluate(self, detection, total_faces, frame_shape):
        """
        Evaluate one detected face.

        Returns
        -------
        quality_score : int
        ready : bool
        message : str
        """

        score = 0

        x1, y1, x2, y2 = detection["bbox"]
        confidence = detection["confidence"]

        frame_height, frame_width = frame_shape[:2]

        width = x2 - x1
        height = y2 - y1

        # -------------------------------
        # 1. Detection confidence
        # -------------------------------
        if confidence >= self.min_confidence:
            score += 40

        # -------------------------------
        # 2. Face size
        # -------------------------------
        if width >= self.min_face_size and height >= self.min_face_size:
            score += 25

        # -------------------------------
        # 3. Only one face
        # -------------------------------
        if total_faces == 1:
            score += 15

        # -------------------------------
        # 4. Face completely inside frame
        # -------------------------------
        if (
            x1 > self.frame_margin and
            y1 > self.frame_margin and
            x2 < frame_width - self.frame_margin and
            y2 < frame_height - self.frame_margin
        ):
            score += 20

        # -------------------------------
        # Decide registration status
        # -------------------------------
        if score >= 85:
            ready = True
            message = "READY TO CAPTURE"
        else:
            ready = False

            if confidence < self.min_confidence:
                message = "LOW CONFIDENCE"

            elif width < self.min_face_size or height < self.min_face_size:
                message = "MOVE CLOSER"

            elif total_faces > 1:
                message = "ONLY ONE FACE ALLOWED"

            else:
                message = "CENTER YOUR FACE"

        return score, ready, message