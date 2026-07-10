import cv2

for i in range(10):
    cap = cv2.VideoCapture(i)

    if cap.isOpened():
        ret, frame = cap.read()

        if ret:
            print(f"Camera {i} works - Resolution: {frame.shape[1]}x{frame.shape[0]}")

            cv2.imshow(f"Camera {i}", frame)
            cv2.waitKey(2000)
            cv2.destroyAllWindows()

        cap.release()