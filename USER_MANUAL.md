# User Manual — Das Attendance System

A plain-language walkthrough of the web app for each of the three account
types: **Student**, **Faculty**, and **Admin**. For how the system is built
internally, see `DOCUMENTATION.md` instead — this document is about *using*
it.

Throughout the app you'll see the phrase **"last N days"** — this means the
most recent N calendar days up to and including today. **N defaults to 14**
and is the same number everywhere; an admin can change it (see
[Admin → Settings](#settings)). **Saturdays and Sundays inside that window
are never counted as absences** — no classes are held on them.

---

## Signing in

Go to the login page and choose your role (Student / Faculty / Admin), then
sign in with the email and password your admin gave you. New student and
faculty accounts are created with a default password of `{your ID}@123`
(e.g. `S001@123`) — you're shown this password once, right when the account
is created; change it isn't currently self-serviceable, so ask your admin if
you've lost it.

Every account has a **profile page** — click the small avatar button (your
initial, in a square) in the top-right corner of any page, or your name at
the bottom of the left sidebar.

---

## Student

### Dashboard (`/student`)

- The greeting at the top ("Good morning/afternoon/evening") is based on
  your device's clock, not the server's.
- **Last recognized scan** — the confidence score and time of your most
  recent face-match. The time shown is *your* local time.
- **Low-attendance check** — lists any subject where you're below 75%. If
  you're clear in every subject, it says so.
- **Subject-wise attendance** — held/attended/% for every subject you have
  at least one recorded scan in.
- **Last N days** — a strip of colored squares, one per day: green =
  present, tan = absent, gray = holiday (Saturday/Sunday — never counts
  against you). The line underneath totals it up, e.g. "10 present · 2
  absent · 2 holiday(s)."

### Attendance history (`/student/history`)

Every session you were marked present in, filterable by subject. (Absences
aren't shown as individual rows — only present rows exist in the log; your
absence total on the dashboard is `held − attended` per subject.)

### Profile (`/student/profile`)

Your student ID, email, section, semester, and address.

---

## Faculty

Each faculty account teaches **one subject**. Everything below is scoped to
that one subject — there's no cross-subject view.

### Live session (`/faculty`)

Open the camera, capture a photo of the classroom, and the system detects
and matches faces against enrolled students, marking them present. Capturing
again later the same day adds to the same session instead of starting a new
one — students already matched won't get duplicate rows.

The **Low-attendance alerts** card lists students below 75% over the last N
days for your subject.

### Attendance records (`/faculty/records`)

One row per capture session in the last N days: date, present count, absent
count, average match confidence. The subtitle always states the exact
window ("Last 14 days · Sat/Sun excluded") so it's never ambiguous what the
numbers cover.

### My students (`/faculty/students`)

Every student in your subject, **all-time** (not windowed) — roll, name,
email, section, semester, held/attended, and attendance %. Search by
name/roll/email, or filter to "Below 75%"/"Below 50%".

### Reports (`/faculty/reports`)

The same last-N-days data as the alerts/records pages, summarized: class
average, and everyone below 75%. **Export CSV** downloads exactly what's on
screen — the export and the page are always computed from the same call, so
they can never disagree with each other.

### Profile (`/faculty/profile`)

Your faculty ID, email, and the one subject you teach.

---

## Admin

### Overview (`/admin`)

Enrolled students, scans today, average match confidence, and how many
students are below 75% — all for real, over the last N days. The trend
chart plots one bar per day a class actually happened; if no capture
session ran on a given day, that day isn't plotted (there's nothing real to
show).

### Enrollment (`/admin/enrollment`)

Add a new student (creates their login account too — you're shown the
default password once) and capture their face enrollment (one clear,
front-facing photo).

### Faculty (`/admin/faculty`)

List, search, and filter faculty accounts. **Edit** changes a faculty's
name, email, or their one assigned subject. **Delete** removes the faculty
record (their login account is not automatically removed — a known,
documented limitation, see `DOCUMENTATION.md` §8.5). Assigning a subject
here is reflected immediately on the Subjects page too.

### Users (`/admin/users`)

Every account in the system — students, faculty, and admins — searchable
and filterable by role. **Edit**/**Delete** work for student and faculty
rows (routed to the right underlying record). **Admin rows are read-only**
— there's no way to edit or delete an admin account from this page, on
purpose (see `DOCUMENTATION.md` §8.5 for why).

### Subjects (`/admin/subjects`)

Create, edit, and delete subjects. The **Faculty** field is a dropdown of
real faculty accounts — picking one assigns this subject to them (and
updates their profile to match, so the Faculty page always agrees with the
Subjects page).

### Reports (`/admin/reports`)

Campus-wide version of the Faculty Reports page: attendance trend, subject
averages, and a below-75% count, all over the last N days. **Export CSV**
includes both the trend and the subject averages, with the exact window
stated at the top of the file.

### Settings (`/admin/settings`) {#settings}

- **History window** — the "N" in "last N days," used by every dashboard in
  the app. Change it here and it applies everywhere the next time a page is
  opened.
- **Recognition** — the face-match sensitivity threshold.
- **Attendance policy** — the minimum % for exam eligibility (currently
  informational; the 75% threshold used elsewhere in the app is not yet
  read from this field).
- **Session behavior** — how long a faculty capture session stays open.
- **Email alerts** — toggle for automatic low-attendance emails (no email
  sending is wired up yet — this is a stored preference for when it is).

### Profile (`/admin/profile`)

Your name, email, and role.
