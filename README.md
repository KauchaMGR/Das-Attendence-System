# Smart-Attendence-System
##Before adding new feature:

git checkout main - Switches to the local main branch.

git pull origin main - Downloads and merges the latest changes from the remote main branch into your local main.

Step 4: The 3-Person Team Workflow (Daily Routine)To avoid breaking each other's work, never code directly on the main branch. Follow this exact workflow every time you want to add a new feature:1. Always start by pulling the latest codeBefore you do anything, ensure your local machine has the latest updates made by your teammates:
bash
git checkout main

git pull origin main

.2. Create your own personal feature branchCreate a branch specifically for the task you are working on (e.g., adding a login page):
bash
git checkout -b feature-login

3. Do your work and save it locallyWrite your code, save your files, and then log your progress:
bash
git add .

git commit -m "Added login form UI"

4. Push your branch to GitHubUpload your specific branch to GitHub so your teammates can see it:bashgit push -u origin feature-login

Step 5: Merge the Code Using Pull RequestsOnce your feature is on GitHub, do not merge it directly. Use a Pull Request (PR) so your team can review it.Go to the repository on the GitHub website. You will see a yellow banner saying your branch was pushed.Click Compare & pull request.Write a short description of what you built.Click Create pull request.Your teammates can now look at your code, leave comments, and finally click Merge pull request to safely combine it into the main branch.


##project pipeline
### duirng training process
<img width="380" height="525" alt="image" src="https://github.com/user-attachments/assets/0eed569d-00ee-4d7c-a7c8-71b8b49c8a37" />

### during the recognition process
<img width="392" height="533" alt="image" src="https://github.com/user-attachments/assets/ad23ecbd-df2b-4501-8858-1bcd30cd766b" />


## Project Structure
Das-Attendence-System/

│
├── Models/
│      yolov8n-face.pt
│
├── Datasets/
│      Register/
│      Test/
│
├── Outputs/
│      Detected_faces/
│      Annotated/
│
├── src/
│
│   ├── detector/
│   │      detector.py
│   │
│   ├── embedding/
│   │      sface.py
│   │
│   ├── database/
│   │      mongodb.py
│   │
│   ├── utils/
│   │      image_utils.py
│   │
│   └── config.py
│
└── main.py




# Sface workflow
Face Image
      │
      ▼
Resize (112 × 112)
      │
      ▼
CNN Feature Extraction
      │
      ▼
512-D Embedding

## There are several face recognition models available (FaceNet, ArcFace, InsightFace, DeepFace, etc.), but we'll use SFace because:

It integrates directly with OpenCV.
It is lightweight and fast.
It produces robust face embeddings.
It is suitable for real-time applications such as attendance systems.
It avoids additional dependencies beyond OpenCV.

# my work flow documnetions
 
## Module 1: Face Detection (YOLOv8 Face)
Load model
Detect faces
Draw bounding boxes
Crop faces
Save cropped faces
## Module 2: Face Embedding (SFace)
Load SFace model
Generate 128/512-dimensional embeddings
Normalize embeddings
## Module 3: MongoDB
Connect to MongoDB
Store student information
Store face embeddings
## Module 4: Registration
Register a new student
Detect face
Generate embedding
Save to MongoDB
 ## Module 5: Recognition
Detect face
Generate embedding
Compare with database
Identify the student
## Module 6: Attendance
Mark attendance
Prevent duplicate attendance
Store date and time
## Module 7: FastAPI
Build REST APIs
Connect backend with frontend
## Module 8: Frontend
Registration page
Recognition page
Attendance dashboard




# Modules:
## Module 1 – Face Detection: The face detection module is responsible for locating human faces within an input image. A pre-trained YOLOv8 Face model is loaded using the Ultralytics framework, and each input image is processed to identify the coordinates of all visible faces. For every detected face, the model returns a bounding box and an associated confidence score. These detection results are then forwarded to the next stage of the system, where the face regions will be cropped and prepared for feature extraction using the SFace recognition model. Separating face detection from recognition improves modularity, making the system easier to maintain, test, and extend.

## Module Name: Image Processing Utilities (image_utils.py)

Description:
This module contains helper functions responsible for processing the output of the face detection stage. It creates required directories, crops detected faces from the original image, draws bounding boxes and confidence scores on the original image, and saves the processed images to the appropriate output folders. Separating these image-processing operations into a dedicated utility module improves code organization, promotes reusability, and follows the Single Responsibility Principle (SRP) by keeping face detection and image manipulation as independent components.

## Downloading the SFace Model

The pre-trained SFace model was downloaded from the official OpenCV model repository in ONNX format. The model is stored in the Models directory and will be used to generate 512-dimensional facial embeddings for face recognition. The ONNX format provides a portable representation of the trained neural network, enabling efficient inference using OpenCV.


# Module 3:
MongoDB Community Server was installed on the Windows operating system using the official MSI installer. During installation, MongoDB was configured to run as a Windows service, allowing it to start automatically with the operating system. MongoDB Compass was also installed to provide a graphical interface for viewing and managing the database. The Python package pymongo was installed to enable communication between the Python application and the MongoDB server.

# module 4:
After connecting to the local MongoDB server (mongodb://localhost:27017), the smart_attendance database was opened in MongoDB Compass. The students collection was inspected to verify that the student information, including the face embedding (stored as an array) and registration timestamp, had been successfully inserted.

#Privacy-Preserving Face Registration

Objective

The objective of this module is to register a student's facial identity without storing any facial image. The system captures a live frame from the webcam, evaluates the quality of the detected face, extracts a facial embedding using the SFace model, and immediately discards the image. Only the numerical embedding and student information are retained for future recognition.

Workflow
Capture live video from the webcam.
Detect face using the YOLOv8 Face model.
Evaluate face quality.
Wait for the user to press SPACE.
Capture the current frame.
Crop the detected face in memory.
Generate a 128-dimensional embedding using the SFace model.
Discard the captured image.
Store only the embedding and student information.

