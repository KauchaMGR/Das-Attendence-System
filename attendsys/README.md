# AttendSys — Frontend

React + Vite + Tailwind frontend for the Smart Attendance System proposal
(NCIT / Pokhara University). Every sidebar item across all three roles is a
real, working page with mock data — ready for a backend engineer to wire up
to FastAPI + MongoDB without touching UI code.

## Run it

**Looking for something specific?** See `PROJECT_METADATA.md` in this
folder — it maps every route to its file, its mock data source, and the
backend endpoint it should call tomorrow.


```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build -> dist/
npm run preview     # serve the production build locally
```

## Route map

```
/                          Landing (public)
/login                     Role select — choose Student/Faculty/Admin (public)
/login/student             Student sign-in (public)
/login/faculty             Faculty sign-in (public)
/login/admin               Admin sign-in (public)

/student                   Dashboard          (StudentOverview.jsx)
/student/history           Attendance History (StudentHistory.jsx)
/student/notifications     Notifications      (StudentNotifications.jsx)

/faculty                   Live Session       (FacultyLiveSession.jsx)
/faculty/records           Attendance Records (FacultyRecords.jsx)
/faculty/students          My Students        (FacultyStudents.jsx)
/faculty/reports           Reports            (FacultyReports.jsx)
/faculty/notifications     Notifications      (FacultyNotifications.jsx)

/admin                     Overview           (AdminOverview.jsx)
/admin/enrollment          Enrollment         (AdminEnrollment.jsx)
/admin/users               Users              (AdminUsers.jsx)
/admin/subjects            Subjects           (AdminSubjects.jsx)
/admin/reports             Reports            (AdminReports.jsx)
/admin/settings            Settings           (AdminSettings.jsx)
/admin/notifications       Notifications      (AdminNotifications.jsx)
```

**No "My Profile" pages** — removed for all three roles per request. See
`PROJECT_METADATA.md` for the full list of what changed recently.
## Structure

```
src/
  pages/Landing.jsx                 public landing page
  pages/auth/RoleSelect.jsx         "/login" — pick Student/Faculty/Admin
  pages/auth/StudentLogin.jsx       "/login/student"
  pages/auth/FacultyLogin.jsx       "/login/faculty"
  pages/auth/AdminLogin.jsx         "/login/admin"
  components/LoginForm.jsx          shared form used by all 3 login pages
  pages/student/*.jsx              4 student pages
  pages/faculty/*.jsx              6 faculty pages
  pages/admin/*.jsx                8 admin pages
  layouts/RoleLayout.jsx           shared shell: renders Sidebar once + <Outlet/>
  components/                      Sidebar, Topbar, Card, StatusStamp, Heatmap,
                                    NotificationList, CameraCapture, ProtectedRoute
  context/AuthContext.jsx          in-memory auth state (role + name)
  services/api.js                  every backend call the UI makes, currently mocked
  data/mockData.js                 the mock data services/api.js resolves with
```

Each role's routes are nested under a `<RoleLayout>` in `App.jsx` — the
Sidebar renders once per role and doesn't remount as you navigate between
its pages; only the page content (via `<Outlet/>`) swaps.

## Wiring up the real backend

Every network call goes through `src/services/api.js`. Each function is
commented with the FastAPI route it's expected to call. To connect the
real backend:

1. Set `VITE_API_BASE_URL` in a `.env` file (defaults to
   `http://localhost:8000/api`).
2. Replace the body of each function in `api.js` with a real `fetch` call —
   the student-dashboard functions have a full worked example in comments.
   No page needs to change; they only call `api.xxx()` and expect the same
   shaped data back (see `data/mockData.js` for the exact shape).
3. Update `AuthContext.login()` to call `/auth/login`, store the JWT, and
   decode the `role` claim.
4. Search the codebase for `TODO(backend)` — every place that currently
   fakes an action (file uploads, PATCH calls, form submits) has a comment
   showing exactly what real code replaces it.

## What's mocked vs. real right now

- All data is fake (see `data/mockData.js`), but every interaction that
  *should* eventually hit the backend already calls the matching `api.js`
  function — toggling attendance, marking notifications read, adding a
  subject, enrolling a student, saving settings, etc. — so wiring up the
  backend is a matter of editing `api.js`, not restructuring pages.
- Photo capture (faculty attendance capture, admin enrollment photos) uses
  the device's live camera via `<CameraCapture/>` (getUserMedia), not a
  file picker — the captured frame is already a Blob ready for multipart
  upload; only the actual `fetch(...)` POST needs to be added in `api.js`.
- Admin's Enrollment page can create brand-new student records
  (`api.createStudent`) in addition to enrolling faces for students already
  in the queue — this is a real "add to the system" flow, not just a
  pre-seeded mock list.
- CSV export buttons (Faculty Reports, Admin Reports) generate real CSV
  files client-side from whatever mock data is loaded — fully functional,
  no backend needed for this particular feature.

## Design notes

The visual language is a "class register" — ledger rule lines, roll-number
tabs, and a rubber-stamp status mark (`StatusStamp`) standing in for the
system's present/late/absent decision. Palette and type tokens live in
`tailwind.config.js`.
