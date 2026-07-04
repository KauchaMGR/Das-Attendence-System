# Import OpenCV library for image processing operations
import cv2

# Import os module for creating directories and handling file paths
import os


# ---------------------------------------------------------
# Function: create_directory()
# Purpose : Create a folder if it does not already exist.
# ---------------------------------------------------------
def create_directory(directory):
    """
    Creates the specified directory.

    Parameters:
        directory (str): Path of the directory to create.

    If the directory already exists, no error is generated.
    """

    # exist_ok=True prevents an error if the folder already exists
    os.makedirs(directory, exist_ok=True)


# ---------------------------------------------------------
# Function: crop_faces()
# Purpose : Crop each detected face and save it as an image.
# ---------------------------------------------------------
def crop_faces(image, detections, output_directory):
    """
    Crops all detected faces from the original image.

    Parameters:
        image (numpy.ndarray):
            Original input image.

        detections (list):
            List containing face detection information
            (bounding box coordinates and confidence score).

        output_directory (str):
            Folder where cropped faces will be saved.

    Returns:
        saved_faces (list):
            List of file paths of all saved face images.
    """

    # Create output folder if it does not exist
    create_directory(output_directory)

    # List to store paths of saved face images
    saved_faces = []

    # Loop through every detected face
    for index, detection in enumerate(detections, start=1):

        # Extract bounding box coordinates
        x1, y1, x2, y2 = detection["bbox"]

        # Crop only the face region using NumPy slicing
        face = image[y1:y2, x1:x2]

        # Create filename such as:
        # face_1.jpg
        # face_2.jpg
        filename = os.path.join(
            output_directory,
            f"face_{index}.jpg"
        )

        # Save cropped face image
        cv2.imwrite(filename, face)

        # Store filename in the list
        saved_faces.append(filename)

    # Return list of saved image paths
    return saved_faces


# ---------------------------------------------------------
# Function: draw_detections()
# Purpose : Draw rectangles and confidence scores.
# ---------------------------------------------------------
def draw_detections(image, detections):
    """
    Draws bounding boxes and confidence values
    around every detected face.

    Parameters:
        image (numpy.ndarray):
            Original image.

        detections (list):
            Face detection results.

    Returns:
        annotated (numpy.ndarray):
            Image containing rectangles and confidence labels.
    """

    # Create a copy so the original image remains unchanged
    annotated = image.copy()

    # Loop through every detected face
    for detection in detections:

        # Get bounding box coordinates
        x1, y1, x2, y2 = detection["bbox"]

        # Get confidence score
        confidence = detection["confidence"]

        # Draw green rectangle around face
        cv2.rectangle(
            annotated,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),      # Green color (BGR)
            2                 # Rectangle thickness
        )

        # Write confidence score above rectangle
        cv2.putText(
            annotated,
            f"{confidence:.2f}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    # Return annotated image
    return annotated


# ---------------------------------------------------------
# Function: save_image()
# Purpose : Save any image to disk.
# ---------------------------------------------------------
def save_image(image, filename):
    """
    Saves an image to the specified location.

    Parameters:
        image (numpy.ndarray):
            Image to save.

        filename (str):
            Complete path including filename.
    """

    # Extract directory from the complete file path
    directory = os.path.dirname(filename)

    # Create directory if needed
    create_directory(directory)

    # Save image
    cv2.imwrite(filename, image)