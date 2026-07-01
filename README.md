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


