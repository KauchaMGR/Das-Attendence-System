# AttendSys — project metadata

One file to find anything in this codebase: what each file does, what
route it belongs to, what data it needs, and where that data currently
comes from (mock) vs. where it should come from tomorrow (MongoDB via
FastAPI). Skim the table for your role/page, then jump straight to the file.

---

## 1. How to read this

- **Route** — the URL in the browser.
- **File** — where the code lives.
- **Data source (today)** — which `mockData.js` export it's reading.
- **Backend route (tomorrow)** — the FastAPI endpoint `api.js` should call
  instead, and the MongoDB collection behind it. None of these backend
  routes are built yet except the Student ones (see `/backend`), so this
  column is your worklist for tomorrow.

Every page follows the same pattern: `useEffect` calls one or more
`api.xxx()` functions on mount → state updates → JSX renders. To change
what a page shows, you're almost always editing either the page's JSX or
the matching entry in `mockData.js`. To make a page **real**, you're
editing `services/api.js` only — see its header comment for the exact
swap-in steps.

---

## 2. Public pages (no login required)

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/Landing.jsx` | Marketing/info page. Fully static — no API calls. |
| `/login` | `src/pages/auth/RoleSelect.jsx` | Pick Student / Faculty / Admin. Has "← Back to home". |
| `/login/student` | `src/pages/auth/StudentLogin.jsx` | Uses shared `src/components/LoginForm.jsx`. |
| `/login/faculty` | `src/pages/auth/FacultyLogin.jsx` | Same shared form, different role/accent color. |
| `/login/admin` | `src/pages/auth/AdminLogin.jsx` | Same shared form, different role/accent color. |

**Login is still a demo** — it logs you in as a hardcoded name for
whichever role's login page you used, no real credential check. See
`src/context/AuthContext.jsx`'s header comment for how to wire up real
`POST /api/auth/login`.

---

## 3. Student dashboard — base route `/student`

| Route | File | Data source (today) | Backend route (tomorrow) |
|---|---|---|---|
| `/student` | `pages/student/StudentOverview.jsx` | `mockStudent`, `mockSubjects`, `mockHeatmap` | `GET /api/students/me`, `/me/subjects`, `/me/attendance` — **already built**, see `/backend/app/routers/student.py` |
| `/student/history` | `pages/student/StudentHistory.jsx` | `mockAttendanceHistory` | `GET /api/students/me/history` |
| `/student/notifications` | `pages/student/StudentNotifications.jsx` | `mockStudentNotifications` | `GET /api/students/me/notifications`, `PATCH .../notifications/:id` |

**No "My Profile" page** — removed per request, for all three roles (see §6).

**Removed from Student pages:**
- "Late" as a status — only present/absent now (`StudentOverview.jsx`, `mockHeatmap`, `mockAttendanceHistory`).
- "Camera" row on the "Last recognized scan" card — only confidence + time shown.

---

## 4. Faculty dashboard — base route `/faculty`

| Route | File | Data source (today) | Backend route (tomorrow) |
|---|---|---|---|
| `/faculty` | `pages/faculty/FacultyLiveSession.jsx` | `mockFacultySession`, `mockRoster`, `mockAlerts` | `GET /api/faculty/sessions/active`, `/roster`, `/api/faculty/alerts`, `POST .../capture` |
| `/faculty/records` | `pages/faculty/FacultyRecords.jsx` | `mockFacultyRecords` | `GET /api/faculty/records` |
| `/faculty/students` | `pages/faculty/FacultyStudents.jsx` | `mockFacultyStudents` | `GET /api/faculty/students` |
| `/faculty/reports` | `pages/faculty/FacultyReports.jsx` | derived from `mockFacultyStudents` client-side | same as above — averages computed in the browser, or move to a real aggregation endpoint later |
| `/faculty/notifications` | `pages/faculty/FacultyNotifications.jsx` | `mockFacultyNotifications` | `GET /api/faculty/notifications` |

**Live Session capture uses the device camera** (`src/components/CameraCapture.jsx`),
not a file upload — see §7.

**One faculty per subject, by design** — `mockAdminSubjects`'s `faculty`
field is a single string, not an array (see `src/data/mockData.js`). Keep
the same shape in MongoDB — a subject document should have one `faculty`
value, not a list.

---

## 5. Admin dashboard — base route `/admin`

| Route | File | Data source (today) | Backend route (tomorrow) |
|---|---|---|---|
| `/admin` | `pages/admin/AdminOverview.jsx` | `mockAdminStats`, `mockAdminReport` | `GET /api/admin/stats/overview`, `/api/admin/reports/overview` |
| `/admin/enrollment` | `pages/admin/AdminEnrollment.jsx` | `mockEnrollmentQueue` | `GET /api/admin/enrollment/queue`, `POST /api/admin/students`, `POST /api/admin/enrollment/:id` |
| `/admin/users` | `pages/admin/AdminUsers.jsx` | `mockUsers` | `GET /api/admin/users` |
| `/admin/subjects` | `pages/admin/AdminSubjects.jsx` | `mockAdminSubjects` | `GET /api/admin/subjects`, `POST /api/admin/subjects` |
| `/admin/reports` | `pages/admin/AdminReports.jsx` | `mockAdminReport` | `GET /api/admin/reports/overview` |
| `/admin/settings` | `pages/admin/AdminSettings.jsx` | `mockAdminSettings` | `GET`/`PATCH /api/admin/settings` |
| `/admin/notifications` | `pages/admin/AdminNotifications.jsx` | `mockAdminNotifications` | `GET /api/admin/notifications` |

**Removed per request:**
- "Devices online" stat + the whole "Device status" card — this system
  doesn't track camera/device hardware, so `api.getDevices()` and
  `mockDevices` were deleted entirely.
- "Enrollment queue" preview card on the Overview page — replaced with a
  weekly attendance trend + subject averages snapshot (same data the
  Reports page uses), which is more useful at a glance.
- Users page: email column and the suspend/reactivate status feature —
  both gone. `mockUsers` entries are now just `{ id, name, role }`.

**Enrollment now has two steps:**
1. "+ Add new student" — a real form (name, roll, program, semester — no
   email) that creates a new student record via `api.createStudent()`.
2. Face capture via the device camera (`CameraCapture.jsx`) for whoever's
   selected from the queue, same as before but camera instead of file
   upload.

---

## 6. Shared components — `src/components/`

| File | Used by | Purpose |
|---|---|---|
| `Sidebar.jsx` | `RoleLayout.jsx` | Left nav, one instance per role. No profile link anymore — the bottom user block is a plain (non-clickable) display now. |
| `Topbar.jsx` | every page | Page header + notification bell. **No profile avatar button anymore** — removed along with all "My Profile" pages. |
| `Card.jsx` | everywhere | Generic bordered container. |
| `StatusStamp.jsx` | roster tables, device-style badges | Present/Late/Absent rubber-stamp badge. Still supports "late" as a style option even though Student no longer uses it — Faculty's roster could still use it if you want that distinction there. |
| `Heatmap.jsx` | `StudentOverview.jsx` | 14-day present/absent grid. |
| `NotificationList.jsx` | all 3 `*Notifications.jsx` pages | Shared list UI for notifications. |
| `CameraCapture.jsx` | `FacultyLiveSession.jsx`, `AdminEnrollment.jsx` | Opens the device camera, captures still photos as Blobs. See §7. |
| `LoginForm.jsx` | the 3 `*Login.jsx` pages | Shared sign-in form; role/copy/color passed in as props. |
| `ProtectedRoute.jsx` | `App.jsx` | Redirects to `/login` if not signed in as the required role. |

## 6a. Layout, context, services

| File | Purpose |
|---|---|
| `src/layouts/RoleLayout.jsx` | Renders Sidebar once per role + an `<Outlet/>` for whichever child page matches the URL. |
| `src/context/AuthContext.jsx` | In-memory `{ name, role }` — no real auth yet, see its header comment. |
| `src/services/api.js` | **The only file that should talk to a backend.** Every function here is commented with its FastAPI route + MongoDB collection. This is your main worklist for tomorrow. |
| `src/data/mockData.js` | All placeholder data. Shaped to match real MongoDB documents — see its header comment. |

---

## 7. CameraCapture — how photo capture works now

`src/components/CameraCapture.jsx` opens the device's live camera
(`getUserMedia`) instead of showing a file picker. Used in two places:

- **Faculty → Live Session**: one photo of the classroom → sent for
  YOLOv8n-face + DeepFace SFace recognition.
- **Admin → Enrollment**: up to 20 photos of one student's face → sent to
  generate their embedding.

Each captured photo becomes a `Blob` (in-browser file), shown as a
thumbnail, and handed to the parent page via `onShotsChange`. To actually
upload it, see the `TODO(backend)` comment inside `CameraCapture.jsx` and
the matching ones in `FacultyLiveSession.jsx` / `AdminEnrollment.jsx` —
it's a `FormData` + `fetch(..., { method: "POST", body: formData })` call,
same pattern in both places.

**Note:** camera access requires HTTPS or `localhost` — it will silently
fail (and show an in-app error message) on a plain `http://` deployment.

---

## 8. Full list of things removed in the latest pass

| Removed | Where |
|---|---|
| "My Profile" pages (all 3 roles) | Deleted `StudentProfile.jsx`, `FacultyProfile.jsx`, `AdminProfile.jsx`; removed their routes from `App.jsx`; removed the profile link from `Sidebar.jsx` and the avatar button from `Topbar.jsx` |
| "Late" attendance status (student side) | `mockStudent`, `mockHeatmap`, `mockAttendanceHistory`, `StudentOverview.jsx` |
| "Camera" on student's last-scan card | `mockStudent.lastScan`, `StudentOverview.jsx` |
| Email addresses | `mockStudent`, `mockFaculty`, `mockAdmin`, `mockUsers`, Admin's Users table, Admin's "add student" form |
| Device/camera inventory | `mockDevices`, `mockAdminStats.devicesOnline`, `api.getDevices()`, Admin Overview's "Device status" card |
| Enrollment queue preview on Admin Overview | Replaced with a trend + subject-averages snapshot |
| Suspend/Reactivate + status column | `AdminUsers.jsx`, `api.updateUserStatus()`, `mockUsers[].status` |
| File-upload capture (faculty + admin enrollment) | Replaced with live camera capture (`CameraCapture.jsx`) |
| "BEI" typo | Now "BEIT" everywhere in `mockData.js` |

---

## 9. Where to look first, by task

- **"I want to change what a page shows"** → find the page in §3/§4/§5,
  edit its JSX, or edit the matching export in `mockData.js` if it's a
  data change.
- **"I want to connect the real backend"** → `src/services/api.js`,
  top-to-bottom. Every function's comment tells you the route + collection.
  Copy the pattern from the Student functions — they're already real
  (backed by `/backend/app/routers/student.py`).
- **"I want to add a new page"** → add a file under `pages/<role>/`, add
  a `<Route>` for it inside the matching role block in `App.jsx`, and (if
  it should appear in the sidebar) add it to that role's `items` array in
  the same file.
- **"I want to change the look"** → colors/fonts are defined once in
  `tailwind.config.js`; shared visual pieces (stamps, cards, ledger lines)
  are CSS classes in `src/index.css`.
