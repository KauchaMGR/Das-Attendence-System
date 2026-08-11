/**
 * ============================================================================
 * Mock data.
 * ============================================================================
 * Placeholder data for every page across all three dashboards. Each export
 * matches exactly what the corresponding FastAPI endpoint should return —
 * see the comment above each function in services/api.js for the route AND
 * MongoDB collection it maps to.
 *
 * WHY THIS SHAPE MATTERS FOR TOMORROW'S MONGODB WORK:
 *   Every object/array below is written to look exactly like a MongoDB
 *   document (or a list of them) after it's been serialized to JSON by
 *   FastAPI — e.g. `mockStudent` is what `students_col.find_one({...})`
 *   should produce once passed through the StudentProfile Pydantic model
 *   (see backend/app/models/student.py for a real, working example of
 *   this pattern). If you keep your MongoDB documents shaped like the
 *   objects below, connecting the real backend tomorrow is a matter of
 *   swapping `mock(mockX)` for a real `fetch()` in api.js — nothing on
 *   this side needs to change.
 *
 * REMOVED IN THIS PASS (see the metadata file for the full list):
 *   - `late` as an attendance status — everything is present/absent now.
 *   - `camera` on a student's last-scan info.
 *   - `email` fields (students, faculty, admin, users list).
 *   - Device/camera inventory (`mockDevices`, `devicesOnline`) — this
 *     system doesn't track device/camera hardware info.
 *   - `status` (active/suspended) on user accounts.
 *
 * Delete this file once nothing in api.js imports from it anymore.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// STUDENT
// ---------------------------------------------------------------------------

// GET /api/students/me
export const mockStudent = {
  name: "Sittal Pantha",
  roll: "34",
  program: "BEIT · Semester 6",
  overallPercent: 87,
  present: 26,
  absent: 2, // "late" removed — attendance is present/absent only now
  lastScan: {
    // "camera" field removed — no device/camera info shown to students
    confidence: 98.2,
    time: "10:02:14 AM",
  },
};

// GET /api/students/me/subjects
export const mockSubjects = [
  { name: "Computer Vision", held: 32, attended: 29, pct: 90.6 },
  { name: "Computer Networks", held: 30, attended: 25, pct: 83.3 },
  { name: "Software Engineering", held: 28, attended: 26, pct: 92.8 },
  { name: "Database Systems", held: 30, attended: 24, pct: 80.0 },
];

// GET /api/students/me/attendance?days=14 — values are "present" | "absent" only
export const mockHeatmap = [
  "present", "present", "present", "present", "present", "absent", "present",
  "present", "present", "present", "present", "present", "present", "present",
];

// GET /api/students/me/history?subject=&from=&to=  (full log, not just 14 days)
// status is "present" | "absent" only — no "late" bucket anymore
export const mockAttendanceHistory = [
  { date: "2026-07-10", subject: "Computer Networks", status: "present", time: "10:02 AM", confidence: 98.2, markedBy: "auto" },
  { date: "2026-07-10", subject: "Computer Vision", status: "present", time: "08:01 AM", confidence: 96.7, markedBy: "auto" },
  { date: "2026-07-09", subject: "Database Systems", status: "present", time: "01:14 PM", confidence: 91.2, markedBy: "auto" },
  { date: "2026-07-09", subject: "Software Engineering", status: "present", time: "11:00 AM", confidence: 97.8, markedBy: "auto" },
  { date: "2026-07-08", subject: "Computer Networks", status: "absent", time: "—", confidence: null, markedBy: "auto" },
  { date: "2026-07-08", subject: "Computer Vision", status: "present", time: "08:03 AM", confidence: 95.4, markedBy: "faculty_override" },
  { date: "2026-07-07", subject: "Database Systems", status: "present", time: "01:00 PM", confidence: 98.9, markedBy: "auto" },
  { date: "2026-07-07", subject: "Software Engineering", status: "present", time: "11:02 AM", confidence: 94.1, markedBy: "auto" },
];

// GET /api/students/me/notifications
export const mockStudentNotifications = [
  { id: 1, type: "warning", title: "Low attendance in Database Systems", detail: "You're at 80.0% — 5% above the 75% cutoff. Missing 2 more sessions will put you at risk.", time: "2 hours ago", read: false },
  { id: 2, type: "info", title: "Attendance corrected by faculty", detail: "Prof. R. Karki marked you present for Computer Vision on Jul 8.", time: "1 day ago", read: false },
  { id: 3, type: "success", title: "Marked present", detail: "Computer Networks · 98.2% confidence.", time: "3 days ago", read: true },
  { id: 4, type: "info", title: "New semester subjects enrolled", detail: "You've been enrolled in 4 subjects for this semester.", time: "1 week ago", read: true },
];

// ---------------------------------------------------------------------------
// FACULTY
// ---------------------------------------------------------------------------

// GET /api/faculty/sessions/active
export const mockFacultySession = {
  subject: "Computer Networks",
  section: "BEIT Sem 6",
  room: "Room 204",
  time: "10:00 – 11:00 AM",
  detected: 24,
  enrolled: 28,
  avgConfidence: 96.3,
};

// GET /api/faculty/sessions/:id/roster
export const mockRoster = [
  { id: 1, name: "Dipeen Kaucha Magar", roll: "13", status: "present" },
  { id: 2, name: "Aayushman Shrestha", roll: "01", status: "present" },
  { id: 3, name: "Sittal Pantha", roll: "34", status: "present" },
  { id: 4, name: "Prajwal Bista", roll: "07", status: "absent" },
];

// GET /api/faculty/alerts
export const mockAlerts = [
  { student: "Prajwal Bista", detail: "68% attendance in this subject" },
  { student: "Nisha Rai", detail: "71% attendance in this subject" },
  { student: "Bikash Lama", detail: "missed 3 consecutive sessions" },
];

// GET /api/faculty/me
export const mockFaculty = {
  name: "Prof. R. Karki",
  department: "Computer Engineering",
  subjectsTaught: ["Computer Networks", "Computer Vision"],
};

// GET /api/faculty/records?subject=&date=  (past sessions, for the Records page)
export const mockFacultyRecords = [
  { date: "2026-07-10", subject: "Computer Networks", present: 24, absent: 4, avgConfidence: 96.3 },
  { date: "2026-07-08", subject: "Computer Networks", present: 22, absent: 6, avgConfidence: 95.1 },
  { date: "2026-07-06", subject: "Computer Vision", present: 27, absent: 1, avgConfidence: 97.8 },
  { date: "2026-07-03", subject: "Computer Networks", present: 25, absent: 3, avgConfidence: 96.9 },
  { date: "2026-07-01", subject: "Computer Vision", present: 26, absent: 2, avgConfidence: 94.5 },
];

// GET /api/faculty/students  (all students across subjects this faculty teaches)
export const mockFacultyStudents = [
  { id: 1, name: "Dipeen Kaucha Magar", roll: "13", subject: "Computer Networks", pct: 92.0 },
  { id: 2, name: "Aayushman Shrestha", roll: "01", subject: "Computer Networks", pct: 88.5 },
  { id: 3, name: "Sittal Pantha", roll: "34", subject: "Computer Vision", pct: 90.6 },
  { id: 4, name: "Prajwal Bista", roll: "07", subject: "Computer Networks", pct: 68.0 },
  { id: 5, name: "Nisha Rai", roll: "22", subject: "Computer Vision", pct: 71.0 },
];

// GET /api/faculty/notifications
export const mockFacultyNotifications = [
  { id: 1, type: "warning", title: "3 students below 75% in Computer Networks", detail: "Prajwal Bista, Nisha Rai, and Bikash Lama are all under the exam-eligibility threshold.", time: "1 hour ago", read: false },
  { id: 2, type: "info", title: "Capture session completed", detail: "Computer Networks · 24/28 students recognized.", time: "3 hours ago", read: true },
  { id: 3, type: "info", title: "New student enrolled", detail: "Ritika Basnet was added to your Computer Vision roster.", time: "2 days ago", read: true },
];

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------

// GET /api/admin/stats/overview — "devicesOnline" removed (no device inventory)
export const mockAdminStats = {
  enrolledStudents: 642,
  scansToday: 2148,
  avgConfidence: 96.8,
};

// GET /api/admin/enrollment/queue
export const mockEnrollmentQueue = [
  { id: 1, name: "Ritika Basnet", meta: "BCT Sem 4" },
  { id: 2, name: "Suman Adhikari", meta: "BEIT Sem 2" },
  { id: 3, name: "Kritika Sharma", meta: "BCT Sem 6" },
  { id: 4, name: "Alish Maharjan", meta: "BEIT Sem 4" },
];

// GET /api/admin/me
export const mockAdmin = {
  name: "NCIT Admin",
  role: "System Administrator",
};

// GET /api/admin/users — no "email" or "status" columns anymore (both removed from the Users page)
export const mockUsers = [
  { id: 1, name: "Sittal Pantha", role: "student" },
  { id: 2, name: "Aayushman Shrestha", role: "student" },
  { id: 3, name: "Dipeen Kaucha Magar", role: "student" },
  { id: 4, name: "Prof. R. Karki", role: "faculty" },
  { id: 5, name: "Prof. S. Gurung", role: "faculty" },
  { id: 6, name: "NCIT Admin", role: "admin" },
  { id: 7, name: "Prajwal Bista", role: "student" },
];

// GET /api/admin/subjects
// NOTE: one faculty per subject by design — `faculty` is a single string,
// not an array. Keep it that way in MongoDB too (one_faculty_per_subject).
export const mockAdminSubjects = [
  { code: "CT654", name: "Computer Vision", semester: 6, creditHour: 3, faculty: "Prof. R. Karki" },
  { code: "CT655", name: "Computer Networks", semester: 6, creditHour: 3, faculty: "Prof. R. Karki" },
  { code: "CT656", name: "Software Engineering", semester: 6, creditHour: 3, faculty: "Prof. S. Gurung" },
  { code: "CT657", name: "Database Systems", semester: 6, creditHour: 3, faculty: "Prof. S. Gurung" },
];

// GET /api/admin/reports/overview  (campus-wide trends — also powers the
// Overview page's new "Today at a glance" card, replacing the old
// enrollment-queue preview)
export const mockAdminReport = {
  weeklyAttendanceTrend: [88, 90, 86, 91, 89, 92, 87], // % present per day, last 7 days
  subjectAverages: [
    { subject: "Computer Vision", avg: 90.6 },
    { subject: "Computer Networks", avg: 83.3 },
    { subject: "Software Engineering", avg: 92.8 },
    { subject: "Database Systems", avg: 80.0 },
  ],
  lowAttendanceCount: 14,
};

// GET /api/admin/settings
export const mockAdminSettings = {
  cosineThreshold: 0.6,
  minAttendancePct: 75,
  sessionTimeoutMinutes: 60,
  emailAlertsEnabled: true, // this is a system notification toggle, not a personal email field — left as-is
};

// GET /api/admin/notifications
export const mockAdminNotifications = [
  { id: 1, type: "warning", title: "3 subjects trending below 85%", detail: "Computer Networks and Database Systems have dropped over the last week.", time: "3 hours ago", read: false },
  { id: 2, type: "info", title: "4 students pending enrollment", detail: "New admissions waiting for face enrollment.", time: "5 hours ago", read: false },
  { id: 3, type: "success", title: "Daily backup completed", detail: "MongoDB backup finished successfully at 2:00 AM.", time: "1 day ago", read: true },
];
