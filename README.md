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


widely used  github  commands:
-git checkout -b branch_name //to create  new branch
-git push -u origin branch_name // to push the branch to the origin
-git switch branch_name// to switch the branch
-git brach // to know the current branch
-git pull origin main // to extract the main branch contnet
- git status// to check which files hav benn changes
-git add .// add all the file to the commit
-git commit -m "commit message" 
-git push// to push the changes with the messages

