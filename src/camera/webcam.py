import cv2


class Webcam:
    """
    Handles webcam operations.
    Captures live frames without saving them to disk.
    """

    def __init__(self, camera_index=0):
        """
        Initialize the webcam.

        camera_index = 0
        Uses the default webcam connected to the computer.
        """
        self.camera = cv2.VideoCapture(camera_index)

        if not self.camera.isOpened():
            raise Exception("Unable to open webcam.")

    def get_frame(self):
        """
        Capture one frame from the webcam.

        Returns:
            frame -> OpenCV image (NumPy array)
        """

        success, frame = self.camera.read()

        if not success:
            raise Exception("Unable to capture frame.")

        return frame

    def release(self):
        """
        Release the webcam resource.
        """

        self.camera.release()

        cv2.destroyAllWindows()