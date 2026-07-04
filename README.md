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
<img width="461" height="761" alt="image" src="https://github.com/user-attachments/assets/e252c0d4-21ec-4748-a8cd-826d1cab2449" />







# my work flow documnetions
 
✅ Module 1: Face Detection (YOLOv8 Face)
Load model
Detect faces
Draw bounding boxes
Crop faces
Save cropped faces
Module 2: Face Embedding (SFace)
Load SFace model
Generate 128/512-dimensional embeddings
Normalize embeddings
Module 3: MongoDB
Connect to MongoDB
Store student information
Store face embeddings
Module 4: Registration
Register a new student
Detect face
Generate embedding
Save to MongoDB
Module 5: Recognition
Detect face
Generate embedding
Compare with database
Identify the student
Module 6: Attendance
Mark attendance
Prevent duplicate attendance
Store date and time
Module 7: FastAPI
Build REST APIs
Connect backend with frontend
Module 8: Frontend
Registration page
Recognition page
Attendance dashboard




# Module 1:
Module 1 – Face Detection: The face detection module is responsible for locating human faces within an input image. A pre-trained YOLOv8 Face model is loaded using the Ultralytics framework, and each input image is processed to identify the coordinates of all visible faces. For every detected face, the model returns a bounding box and an associated confidence score. These detection results are then forwarded to the next stage of the system, where the face regions will be cropped and prepared for feature extraction using the SFace recognition model. Separating face detection from recognition improves modularity, making the system easier to maintain, test, and extend.



