"""
Face Quality Assessment Module
------------------------------
This module evaluates whether a detected face is suitable
for:

1. Student Registration (Only one face allowed)
2. Student Attendance (Multiple faces allowed)
"""


class FaceQuality:

    def __init__(
        self,
        min_confidence=0.55,
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

    # ==========================================================
    # REGISTRATION QUALITY CHECK
    # ==========================================================
    def evaluate(self, detection, total_faces, frame_shape):
        """
        Evaluate face quality for STUDENT REGISTRATION.

        Conditions:
        - Only one face should be visible.
        - Face confidence should be high.
        - Face should be large enough.
        - Face should be completely inside the frame.

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

        # ---------------------------------------
        # 1. Detection Confidence
        # ---------------------------------------
        if confidence >= self.min_confidence:
            score += 40

        # ---------------------------------------
        # 2. Face Size
        # ---------------------------------------
        if width >= self.min_face_size and height >= self.min_face_size:
            score += 25

        # ---------------------------------------
        # 3. Exactly One Face
        # ---------------------------------------
        if total_faces == 1:
            score += 15

        # ---------------------------------------
        # 4. Face Inside Frame
        # ---------------------------------------
        if (
            x1 > self.frame_margin and
            y1 > self.frame_margin and
            x2 < frame_width - self.frame_margin and
            y2 < frame_height - self.frame_margin
        ):
            score += 20

        # ---------------------------------------
        # Decision
        # ---------------------------------------
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

    # ==========================================================
    # ATTENDANCE QUALITY CHECK
    # ==========================================================
    def evaluate_attendance(self, detection, frame_shape):
        """
        Evaluate face quality for STUDENT ATTENDANCE.

        Unlike registration,
        multiple faces are allowed.

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

        # ---------------------------------------
        # 1. Detection Confidence
        # ---------------------------------------
        if confidence >= self.min_confidence:
            score += 50

        # ---------------------------------------
        # 2. Face Size
        # ---------------------------------------
        if width >= self.min_face_size and height >= self.min_face_size:
            score += 25

        # ---------------------------------------
        # 3. Face Inside Frame
        # ---------------------------------------
        if (
            x1 > self.frame_margin and
            y1 > self.frame_margin and
            x2 < frame_width - self.frame_margin and
            y2 < frame_height - self.frame_margin
        ):
            score += 25

        # ---------------------------------------
        # Decision
        # ---------------------------------------
        if score >= 75:

            ready = True
            message = "READY"

        else:

            ready = False

            if confidence < self.min_confidence:
                message = "LOW CONFIDENCE"

            elif width < self.min_face_size or height < self.min_face_size:
                message = "MOVE CLOSER"

            else:
                message = "FACE NOT CLEAR"

        return score, ready, message