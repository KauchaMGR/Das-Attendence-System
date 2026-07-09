# AttendSys — Frontend

React + Vite + Tailwind frontend for the Smart Attendance System proposal
(NCIT / Pokhara University). Built as a standalone deliverable that a
backend engineer can wire up to the FastAPI + MongoDB service described in
the proposal without touching the UI code.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build -> dist/
npm run preview     # serve the production build locally
```

## Structure

```
src/
  pages/
    Landing.jsx            "/"        public landing page
    Login.jsx               "/login"   demo role picker (stand-in for real auth)
    StudentDashboard.jsx    "/student"
    FacultyDashboard.jsx    "/faculty"
    AdminDashboard.jsx      "/admin"
  components/               Sidebar, Topbar, Card, StatusStamp, Ring, Heatmap, ProtectedRoute
  context/AuthContext.jsx   in-memory auth state (role + name)
  services/api.js           every backend call, currently mocked
  data/mockData.js          the mock data services/api.js resolves with
```

The landing page (`/`) is the app's root route — it's the page a browser
hits first, matching how the proposal describes the public-facing entry
point. `/login` leads into the three role-based dashboards, each guarded by
`ProtectedRoute`.

## Wiring up the real backend

Every network call the UI makes goes through `src/services/api.js`. Each
function is commented with the FastAPI route it's expected to call (e.g.
`POST /auth/login`, `GET /students/me`, `POST /faculty/sessions/:id/capture`).
To connect the real backend:

1. Set `VITE_API_BASE_URL` in a `.env` file (defaults to
   `http://localhost:8000/api`).
2. Replace the body of each function in `api.js` with a real `fetch` call.
   No page or component needs to change — they already call `api.xxx()`
   and just expect the same shaped data back (see `data/mockData.js` for
   the exact shape each one currently returns).
3. Update `AuthContext.login()` to call `/auth/login`, store the JWT, and
   decode the `role` claim instead of accepting a role directly.

## Design notes

The visual language is a "class register" — ledger rule lines, roll-number
tabs, and a rubber-stamp status mark (`StatusStamp`) standing in for the
system's present/late/absent decision, rather than generic colored pills.
Palette and type tokens live in `tailwind.config.js`.
