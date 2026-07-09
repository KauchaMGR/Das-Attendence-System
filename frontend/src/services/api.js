/**
 * Thin API client. Every function below is a stub that currently resolves
 * with mock data (see src/data/mockData.js) so the UI is fully demoable
 * before the FastAPI backend exists. Swap the body of each function for a
 * real `fetch`/`axios` call once the matching endpoint is live — the
 * function signatures are written to match the routes implied by the
 * proposal (section 3.4 / 4.1) so pages should not need to change.
 */
import {
  mockStudent,
  mockSubjects,
  mockHeatmap,
  mockFacultySession,
  mockRoster,
  mockAlerts,
  mockAdminStats,
  mockDevices,
  mockEnrollmentQueue,
} from "../data/mockData.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function mock(data, delay = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export const api = {
  // POST /auth/login -> { token, role, name }
  login: (email, password) => mock({ token: "demo", role: "student", name: "Student" }),

  // GET /students/me
  getStudentProfile: () => mock(mockStudent),
  // GET /students/me/subjects
  getStudentSubjects: () => mock(mockSubjects),
  // GET /students/me/attendance?days=14
  getStudentHeatmap: () => mock(mockHeatmap),

  // GET /faculty/sessions/active
  getActiveSession: () => mock(mockFacultySession),
  // GET /faculty/sessions/:id/roster
  getRoster: () => mock(mockRoster),
  // PATCH /attendance/:recordId  { status: 'present'|'absent' }
  overrideAttendance: (recordId, status) => mock({ recordId, status }),
  // GET /faculty/alerts?subject=:code
  getLowAttendanceAlerts: () => mock(mockAlerts),
  // POST /faculty/sessions/:id/capture  (multipart image upload -> triggers YOLOv8n-face + SFace pipeline)
  triggerCapture: (imageFile) => mock({ detected: 24, matched: 22 }, 800),

  // GET /admin/stats/overview
  getAdminStats: () => mock(mockAdminStats),
  // GET /admin/devices
  getDevices: () => mock(mockDevices),
  // GET /admin/enrollment/queue
  getEnrollmentQueue: () => mock(mockEnrollmentQueue),
  // POST /admin/enrollment/:studentId  (multipart, 10-20 photos -> averaged embedding)
  enrollStudent: (studentId, photos) => mock({ studentId, embeddingStored: true }, 600),
};

export { BASE_URL };
