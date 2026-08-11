*A code-level companion to [DOCUMENTATION.md](DOCUMENTATION.md) (architecture/what's built) and [FINAL_PROPOSAL.md](FINAL_PROPOSAL.md) (the academic write-up). This one is for you, six weeks from now, staring at a bug: for each core flow, it traces the exact call chain, explains the logic in plain terms, and lists what to check when it breaks.*

## How to use this document

Every flow below follows the same shape:

1. **Trigger** — what button click / HTTP request starts it.
2. **Call chain** — the exact sequence of files and functions it runs through, top to bottom.
3. **What the logic actually does** — explained in plain language, not just "what the code says."
4. **If it breaks** — the specific things to check, in the order to check them.

The debugging method that works for *every* flow here: **isolate the layer**. Don't start by poking the React UI and guessing. Start from the bottom:

1. Can you import the service function directly in a Python shell and call it with fake data? (Rules out the DB layer / core logic.)
2. Does `curl`ing the route directly give the response you expect? (Rules out the HTTP layer.)
3. Only once 1 and 2 both work should you suspect the frontend.

This is the exact method used throughout development (see the "Verified working end-to-end" sections of DOCUMENTATION.md) — every backend piece was checked with a Python one-liner or a `curl` command before the React side ever touched it.

---

## 0. Running it locally

You need three things running at once:

```
# 1. MongoDB — must already be running on 127.0.0.1:27017
#    (this project does not start Mongo for you)

# 2. Backend — from Das-Attendence-System/Backend/
python -m uvicorn app.main:app --reload

# 3. Frontend — from Das-Attendence-System/attendsys/
npm run dev
```

If step 2 fails immediately, it's almost always one of: MongoDB isn't running, or the two `.onnx` files are missing from `Backend/app/ml_models/` (see §1 below — they're gitignored, so a fresh clone won't have them).

---

## 1. Server startup

**Trigger:** running `uvicorn app.main:app`.

**Call chain:**
```
Backend/app/main.py
  → lifespan() [line 16]
      → recognition_service.load_models() [services/recognition_service.py:37]
          → _get_detector()  → cv2.FaceDetectorYN_create(YUNET_PATH, ...)
          → _get_recognizer() → cv2.FaceRecognizerSF_create(SFACE_PATH, ...)
  → app.include_router(...) × 6   [main.py:40-45]
```

**What it does:** before the server accepts any requests, `lifespan()` loads both ML models into memory once (`_detector`/`_recognizer` are module-level globals in `recognition_service.py` — they're created once and reused for every future request, never reloaded per-request). Then all six routers (`auth`, `students`, `faculty`, `subjects`, `face`, `attendance`) get attached to the one `app` object.

**If it breaks:**
- `cv2.error: ... Can't read ONNX file` → the model files aren't at `Backend/app/ml_models/face_detection_yunet_2023mar.onnx` / `face_recognition_sface_2021dec.onnx`. They're gitignored (`ml_models/.gitignore`) because they're ~39MB binaries — re-download them from `opencv/opencv_zoo` on GitHub (use `media.githubusercontent.com/media/...` URLs, not `raw.githubusercontent.com` — the latter serves Git-LFS *pointer* text files, not the real bytes, and you'll get a confusing "can't read ONNX" error that has nothing to do with your code).
- `ServerSelectionTimeoutError` / connection refused on port 27017 → MongoDB isn't running. Check with:
  ```
  python -c "from pymongo import MongoClient; print(MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=2000).server_info()['version'])"
  ```
- `ImportError` on any `app.xxx` module → you're running `python main.py` from inside `app/` instead of `python -m uvicorn app.main:app` from `Backend/`. The absolute imports (`from app.routes...`) only resolve when `Backend/` is the working directory.

---

## 2. Login

**Trigger:** submitting the sign-in form on `/login/student`, `/login/faculty`, or `/login/admin`.

**Call chain:**
```
attendsys/src/components/LoginForm.jsx: handleSubmit()
  → AuthContext.jsx: login(email, password, expectedRole)
      → api.js: api.login(email, password)
          → POST /auth/login  (JSON body: {email, password})

Backend/app/routes/auth.py: login()
  → auth_service.py: login_user(login_data)   [line 35]
      1. users.find_one({"email": ...})                      — does this email exist at all?
      2. verify_password(...)                                — bcrypt check against the stored hash
      3. if role == "student": students.find_one({"user_id": user_id})
         if role == "faculty": faculty.find_one({"user_id": user_id})
      4. create_access_token({...})                           — signs the JWT
      5. returns {access_token, role, fullname, student_id?, faculty_id?, subjects_assigned?}
```

**What it does:** `users` is the single source of truth for "does this email/password combo exist and what role are they." Once that's confirmed, step 3 is the part worth understanding: it looks up the matching **profile** document (`students` or `faculty`) by `user_id` — the ObjectId of the `users` doc, stored back on the profile when the account was created (see §3). This is how the frontend learns "you are `student_id: STU001`" without a second network call. If that profile lookup finds nothing, the login still succeeds, but `student_id`/`faculty_id` come back empty — meaning the account exists but isn't linked to a profile.

**If it breaks:**
- `401 User not found` → the email doesn't exist in `users`. Check directly: `db.users.find_one({"email": "..."})` in a Mongo shell, or re-check for typos — this project's email validation (Pydantic's `EmailStr`) rejects some domains like `.local`/`.test` as "reserved," which trips people up when inventing test emails.
- `401 Incorrect Password` → the password's wrong, or — if this is a student/faculty account — remember the password is **not** whatever you typed on a form, it's the auto-generated `{id}@123` from account creation (see §3). There is no "forgot password" flow.
- Login succeeds but the frontend immediately kicks you back to `/login` → check `LoginForm.jsx`'s `expectedRole` check: if you log into `/login/faculty` with a student account, `AuthContext.login()` deliberately throws (`"This account is registered as student, not faculty"`) — this is intentional, not a bug, since the backend itself doesn't enforce role-per-login-page.
- `student_id`/`faculty_id` missing from a successful login → the profile doc's `user_id` field doesn't match this user's `_id`. This happens if a student/faculty record was created the *old* way (directly via `POST /students/` or `POST /faculty/` before this pattern existed, or manually in a Mongo shell) without going through `create_student()`/`create_faculty()`.

---

## 3. Admin creates a student or faculty account

**Trigger:** the "Create student & add to queue" / "Create faculty account" form in `AdminEnrollment.jsx` / `AdminUsers.jsx`.

**Call chain (student — faculty is identical, just swap the collection):**
```
AdminEnrollment.jsx: handleCreateStudent()
  → api.js: api.createStudent(fields)
      → POST /students/  (JSON body: {student_id, fullname, email, section, semester, address})

Backend/app/routes/students.py: create()
  → student_service.py: create_student(student)   [line 7]
      1. students.find_one({"student_id": ...})   — reject if this student_id is already taken
      2. users.find_one({"email": ...})           — reject if this email is already taken
      3. default_password = f"{student_id}@123"   — e.g. student_id "STU001" → "STU001@123"
      4. hash_password(default_password) → bcrypt hash
      5. users.insert_one({...})                  — creates the LOGIN account, role="student"
      6. Student(..., user_id=<the _id from step 5>) → students.insert_one(...)
      7. returns (student doc's inserted_id, default_password)
  ← route returns {student_id, default_password} — the ONLY time the plaintext password is ever visible
```

**What it does:** this is two database writes disguised as one API call. It **must** insert the `users` document first (step 5), because the student document needs that new user's `_id` to store as its own `user_id` field (step 6) — that back-reference is exactly what §2's login flow reads to find "which student is this." Get the order backwards and you'd be linking to nothing.

**If it breaks:**
- `400 Student already exists` → `student_id` collision. `student_id`s must be unique — this is checked in Mongo, not enforced by a unique index, so a race (two admins submitting the same ID at once) could theoretically slip through. Not a concern at classroom scale.
- `400 Email already exists` → the email is already attached to some `users` doc, of any role. One email = one account, system-wide.
- `422 Unprocessable Entity` with a `value is not a valid email address` detail → Pydantic's `EmailStr` rejected the email's domain. Use a normal-looking domain when testing (`@gmail.com`, `@example.com`) — `.local`/`.test`/`.internal` domains are rejected as "reserved."
- Student created, but they can't log in → check that the `default_password` you were shown is *exactly* what you're typing (it's case-sensitive, includes the literal `@123` suffix) — there's no way to retrieve it again after the fact; you'd need to manually reset the password directly in Mongo (hash a new one with `hash_password()` and `$set` it) or delete + recreate the account.

---

## 4. Face enrollment (admin enrolls a student's face)

**Trigger:** capturing a photo and clicking "Submit enrollment" in `AdminEnrollment.jsx`.

**Call chain:**
```
AdminEnrollment.jsx: submitEnrollment()
  → api.js: api.enrollStudent(studentId, photoBlob)
      → POST /faces/enroll  (multipart: student_id, image)

Backend/app/routes/face.py: enroll()
  → recognition_service.py: extract_single_embedding(image_bytes)   [line 77]
      1. _decode_image()  — bytes → OpenCV BGR image array (cv2.imdecode)
      2. _detect_faces()  — YuNet finds every face, returns an Nx15 array
                             (each row: x,y,w,h + 5 landmark points + confidence score)
      3. if N != 1: raise ValueError(...)   ← the "exactly one face" rule
      4. _embed_face(image, faces[0])
           a. recognizer.alignCrop(image, face_row)  — uses the 5 landmarks to
              warp/rotate/crop the face into a standardized 112×112 image
           b. recognizer.feature(aligned_face)         — runs SFace, returns a
              128-number vector (numpy shape (1,128)) that's "this face's fingerprint"
      5. .flatten().tolist() → a plain list of 128 floats

  → face_service.py: register_face(FaceEmbeddingCreate(...))
      → face_embeddings.insert_one({student_id, embedding_vector, model_name, ...})
```

**What it does, conceptually:** a face's "identity" is reduced to 128 numbers such that two photos of the *same* person produce two vectors that point in almost the same direction, and two photos of *different* people produce vectors pointing in noticeably different directions. "Almost the same direction" is what cosine similarity measures in §5 — this step is purely about producing that vector reliably, which is why steps 2-4 exist: a raw, unaligned, off-center crop produces a noisier vector than a properly detected-and-aligned one.

**If it breaks:**
- `400 No face detected in the photo` → YuNet found zero faces. Usually: bad lighting, face too small/far/angled, or a genuinely faceless photo. YuNet has an internal confidence threshold (default `0.9` in `_get_detector()`'s `cv2.FaceDetectorYN_create` call) — a borderline face can fail to clear it.
- `400 Expected exactly one face, found N` → more than one face in frame. This is enforced deliberately (§4's whole point) — crop tighter, or make sure no one's walking through the background.
- Enrollment "succeeds" but attendance never matches that student later → don't assume the bug is in §5's matching logic before checking this layer first. Isolate it:
  ```python
  from app.services.recognition_service import extract_single_embedding
  with open("test_photo.jpg", "rb") as f:
      vec = extract_single_embedding(f.read())
  print(len(vec), vec[:5])   # should print "128 [some floats]"
  ```
  If this raises or returns something odd, the problem is the photo/model, not the matching code downstream.

---

## 5. Attendance capture (faculty photographs the classroom)

**Trigger:** "Run capture" in `FacultyLiveSession.jsx`.

**Call chain:**
```
FacultyLiveSession.jsx: runCapture()
  → sessionId = `${subjectCode}_${today's date}`     — computed client-side, NOT from a backend "session"
  → api.js: api.triggerCapture(photoBlob, {subjectCode, sessionId, markedBy})
      → POST /attendance/mark  (multipart: subject_code, session_id, marked_by, image)

Backend/app/routes/attendance.py: mark()   [line 23]
  1. recognition_service.extract_all_embeddings(image_bytes)
       — same detect→align→embed as §4, but for EVERY face found, no "exactly one" rule
  2. face_service.get_all_faces()
       — pulls every enrolled student's stored embedding_vector from face_embeddings
  3. for each detected embedding:
       recognition_service.find_best_match(embedding, stored_faces)   [recognition_service.py:110]
         → for each stored face: recognizer.match(embedding, stored_vector, FR_COSINE)
         → keeps whichever stored face scored highest
         → returns (student_id, score) only if the best score >= 0.363, else None
  4. for each match: attendance_service.mark_attendance(student_id, subject_code, session_id, marked_by, confidence=score)
       — no-ops (returns the existing record) if this student already has a
         row for this exact session_id — this is what makes re-running
         capture on the same subject/day safe instead of duplicating rows
  5. attendance_service.log_session(session_id, subject_code, marked_by, len(matches))
       — upserts one capture_sessions doc for this session_id (used later by §6)
```

**What it does:** step 3 is a brute-force search — every detected face is compared against *every* enrolled student, one at a time, and only the single best-scoring comparison is kept per detected face. There's no shortcut/index; at classroom scale (tens to low hundreds of students) this is fast enough that it doesn't matter. `0.363` isn't an arbitrary number — it's OpenCV Zoo's own published threshold for "this counts as the same person" under the SFace model; scores land roughly in `[-1, 1]`, with `1.0` meaning "identical vector" (which is what you'll see if you test enrollment and attendance with the literal same photo, like the smoke tests in DOCUMENTATION.md did).

**If it breaks:**
- `detected: 0` in the response → YuNet found no faces in the classroom photo at all — check lighting/distance/angle, same as §4.
- `detected: N, matched: 0` → faces were found but none scored ≥ 0.363 against anyone enrolled. Either these students genuinely aren't enrolled, or their enrollment photo (§4) was poor quality. Isolate by testing the *same* two photos (enrollment photo vs. this classroom photo) directly:
  ```python
  from app.services.recognition_service import extract_single_embedding, extract_all_embeddings, find_best_match
  enrolled_vec = extract_single_embedding(open("enroll.jpg","rb").read())
  classroom_vecs = extract_all_embeddings(open("classroom.jpg","rb").read())
  fake_stored = [{"student_id": "TEST", "embedding_vector": enrolled_vec}]
  for v in classroom_vecs:
      print(find_best_match(v, fake_stored))   # None, or ("TEST", score)
  ```
- Same student gets marked present twice in the same class → shouldn't happen; check that `session_id` is actually identical between the two capture calls (it's `${subjectCode}_${date}` — if the client's clock rolled over midnight between two captures of the "same" class, you'd get two different session_ids and thus two rows; an edge case, not handled).
- A student *is* matched but doesn't show up on the faculty roster UI → `getRoster()` in `api.js` joins attendance records against `GET /students/` by `student_id` to get a display name — if that join finds nothing, check the student really exists in the `students` collection (not just `face_embeddings`).

---

## 6. Student views their own attendance

**Trigger:** loading `/student` (Overview) or `/student/history`.

**Call chain:**
```
StudentOverview.jsx / StudentHistory.jsx
  → api.js: api.getStudentProfile(studentId, name) / getStudentSubjects(studentId) / etc.
      → GET /attendance/student/{studentId}/summary
      (getStudentSubjects/getStudentHistory also call GET /subjects/, to turn
       a subject_code like "CT655" into a real name like "Computer Vision")

Backend/app/routes/attendance.py: read_student_summary()
  → attendance_service.py: get_student_summary(student_id)   [line 88]
      1. attendance_records.find({"student_id": ...})     — every row this student ever appears in
      2. subject_codes = the distinct subject_codes across those rows
      3. for each subject_code:
           held     = capture_sessions.count_documents({"subject_code": code})
           attended = how many of this student's own records have that code
           absent   = held - attended
           pct      = attended / held * 100
```

**What it does — and the one thing to remember about it:** `held` counts *every* `capture_sessions` row for that subject, system-wide — it has no idea which students were supposed to be in that class. So this number is only meaningful once faculty have actually been running capture regularly for that subject. And critically: **step 2 only considers subjects the student has at least one row in.** A subject where this student was recognized zero times, ever, simply never appears in the output — it's not shown as 0%, it's not shown at all. This is a known, documented limitation (see DOCUMENTATION.md §6.4), not a bug — but it's the single most likely thing to look like a bug ("why is Database Systems missing from my attendance page?" → because you've never once been matched in it).

**If it breaks:**
- A subject the student attends is completely missing from their Overview page → see the paragraph above first, before assuming something's broken.
- `held` seems too high/low compared to reality → remember it's a count of `capture_sessions` docs, and one such doc is created **per calendar day per subject**, not per physical class meeting — if a faculty member ran capture twice in one class period "just to be safe," that's still one `session_id` (deterministic `${subject}_${date}`) and one `capture_sessions` doc, correctly not double-counted. But if the same subject meets twice in one day (unusual, but possible), those two meetings collapse into one `held`.
- `pct` shows `0.0` for a subject with `held: 0` → intentional guard in the code (`pct = ... if held else 0.0`) to avoid a division-by-zero; a student can't be enrolled in a subject that's never actually held a capture session, so this only shows up if `capture_sessions` was wiped/reset without also clearing `attendance_records`.

---

## 7. Frontend → backend plumbing (when nothing above explains it)

Every real API call in the frontend funnels through three tiny helpers at the top of `attendsys/src/services/api.js`: `getJSON`, `postJSON`, `postForm`. If a page is stuck on "Loading…" forever or throwing in the browser console, it's almost always one of these three failing before it even reaches the logic described above. Check, in order:

1. **Browser DevTools → Network tab** — is the request even being sent? To what URL? `BASE_URL` in `api.js` defaults to `http://127.0.0.1:8000` unless `VITE_API_BASE_URL` is set — if the backend's running on a different port, every request 404s or times out.
2. **CORS errors in the console** (`has been blocked by CORS policy`) — the backend's `CORSMiddleware` (`main.py:29`) only allows `http://localhost:5173` and `http://127.0.0.1:5173`. If Vite's dev server picked a different port (it does this automatically if 5173 is already taken — check the terminal output when you ran `npm run dev`), CORS will silently block every request.
3. **A thrown `Error` with a `.detail` message** — `getJSON`/`postJSON`/`postForm` all read the backend's `{"detail": "..."}` error body and throw it as a JS `Error`, which is why error messages in this app tend to read like the Python exception that caused them (e.g. "Expected exactly one face, found 3") — that's intentional, not a leak, and it's the fastest way to know which backend check actually failed.
4. **Nothing shows up in Network tab at all** — the bug is upstream of the fetch call — likely a JS exception earlier in the same function (check the console for a red stack trace) or a `user.studentId`/`user.facultyId` that's `undefined` because of a stale login (see §2 — logging out and back in re-derives these from a fresh `/auth/login` call).

---

## Quick reference: symptom → likely cause

| Symptom | Most likely cause | Where to look |
|---|---|---|
| Server won't start, `cv2.error` about ONNX | Missing model files | §1, `Backend/app/ml_models/` |
| Server won't start, Mongo connection error | MongoDB not running | §1 |
| Login: "User not found" | Wrong email / account never created | §2, §3 |
| Login: "Incorrect Password" | Wrong password (remember: `{id}@123`, not user-chosen) | §3 |
| Login succeeds but redirected back to login page | Logged in on the wrong role's page | §2 |
| Enroll: "No face detected" | Bad photo (lighting/angle/distance) | §4 |
| Enroll: "Expected exactly one face, found N" | Multiple people in frame | §4 |
| Capture: `matched: 0` despite enrolled students present | Poor-quality enrollment photo, or genuinely unenrolled students | §5 |
| Student's subject missing from Overview | Zero attendance rows ever for that subject (documented limitation) | §6 |
| Frontend stuck loading / silent failure | CORS, wrong `BASE_URL`, or a JS exception before the fetch | §7 |
| "It worked in `curl` but not in the browser" | Almost always §7 (CORS/port), not backend logic | §7 |

---

## File map (where each flow's code actually lives)

```
Backend/app/
├── main.py                        — app startup, router registration, model preload
├── config/database.py             — the one place Mongo connection + collection handles are defined
├── routes/                        — HTTP layer only: parse request → call a service → shape the response
│   ├── auth.py                    — §2
│   ├── students.py, faculty.py    — §3
│   ├── face.py                    — §4
│   └── attendance.py              — §5, §6
├── services/                      — all the real logic lives here, deliberately framework-free
│   ├── auth_service.py            — §2
│   ├── student_service.py, faculty_service.py — §3
│   ├── recognition_service.py     — §4, §5 (the only file that imports cv2)
│   ├── face_service.py            — face_embeddings CRUD, used by §4 and §5
│   └── attendance_service.py      — §5, §6
├── models/                        — plain Python classes, just shape a dict for MongoDB via .to_dict()
└── schemas/                       — Pydantic request/response validation, one file per FastAPI route file

attendsys/src/
├── services/api.js                — §7 — the ONLY file that calls fetch()
├── context/AuthContext.jsx        — §2 — holds the logged-in user in React state
├── components/LoginForm.jsx       — §2
├── components/CameraCapture.jsx   — turns the device camera into a Blob for §4/§5
├── pages/admin/AdminEnrollment.jsx, AdminUsers.jsx — §3, §4
├── pages/faculty/FacultyLiveSession.jsx            — §5
└── pages/student/StudentOverview.jsx, StudentHistory.jsx — §6
```
