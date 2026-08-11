/**
 * ============================================================================
 * Mock data — notifications only.
 * ============================================================================
 * Every other export that used to live in this file (student profile,
 * subjects, heatmap, history, faculty session/roster/alerts/records/students,
 * admin stats/subjects/report/settings/users) has been replaced by real
 * backend calls in services/api.js as of DOCUMENTATION.md §8. Only the three
 * notification lists remain mocked — there's no notifications backend yet.
 * ============================================================================
 */

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

// GET /api/faculty/notifications
export const mockFacultyNotifications = [
  { id: 1, type: "warning", title: "3 students below 75% in Computer Networks", detail: "Prajwal Bista, Nisha Rai, and Bikash Lama are all under the exam-eligibility threshold.", time: "1 hour ago", read: false },
  { id: 2, type: "info", title: "Capture session completed", detail: "Computer Networks · 24/28 students recognized.", time: "3 hours ago", read: true },
  { id: 3, type: "info", title: "New student enrolled", detail: "Ritika Basnet was added to your Computer Vision roster.", time: "2 days ago", read: true },
];

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------

// GET /api/admin/notifications
export const mockAdminNotifications = [
  { id: 1, type: "warning", title: "3 subjects trending below 85%", detail: "Computer Networks and Database Systems have dropped over the last week.", time: "3 hours ago", read: false },
  { id: 2, type: "info", title: "4 students pending enrollment", detail: "New admissions waiting for face enrollment.", time: "5 hours ago", read: false },
  { id: 3, type: "success", title: "Daily backup completed", detail: "MongoDB backup finished successfully at 2:00 AM.", time: "1 day ago", read: true },
];
