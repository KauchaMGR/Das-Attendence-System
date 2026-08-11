/**
 * ============================================================================
 * API service layer.
 * ============================================================================
 * This is the ONLY file that should ever talk to the backend. Every page
 * calls functions from `api` below instead of using fetch() directly.
 *
 * Functions marked "REAL" below hit the actual FastAPI backend
 * (Backend/app/routes/*.py). Functions still calling mock(...) are
 * untouched — see DOCUMENTATION.md for what's wired and what isn't.
 * ============================================================================
 */
import {
  mockStudentNotifications,
  mockAlerts, mockFaculty, mockFacultyRecords, mockFacultyNotifications,
  mockAdminStats, mockUsers, mockAdminSubjects, mockAdminReport, mockAdminSettings, mockAdminNotifications,
} from "../data/mockData.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

/** Fake network delay so loading states are visible in demos. */
async function mock(data, delay = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

async function getJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    throw new Error(responseBody.detail || "Request failed");
  }
  return res.json();
}

async function postForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData, // no Content-Type header — the browser sets the multipart boundary itself
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  // ==========================================================================
  // AUTH — real
  // ==========================================================================
  /** POST /auth/login — returns {access_token, role, fullname, student_id?, faculty_id?, subjects_assigned?} */
  login: (email, password) => postJSON("/auth/login", { email, password }),

  // ==========================================================================
  // STUDENT
  // ==========================================================================
  /**
   * REAL — GET /attendance/student/{studentId}/summary, joined against
   * /subjects/ for subject names. Returns the shape StudentOverview expects.
   */
  getStudentProfile: async (studentId, fullname) => {
    const summary = await getJSON(`/attendance/student/${studentId}/summary`);
    const latest = summary.records[0];

    return {
      name: fullname,
      roll: studentId,
      program: "",
      present: summary.present_total,
      absent: summary.absent_total,
      lastScan: {
        confidence: latest?.confidence != null ? Math.round(latest.confidence * 1000) / 10 : null,
        time: latest ? new Date(latest.timestamp).toLocaleTimeString() : "—",
      },
    };
  },

  /** REAL — same summary call, reshaped as a subject table, with subject_code resolved to a real name. */
  getStudentSubjects: async (studentId) => {
    const [summary, subjectsRes] = await Promise.all([
      getJSON(`/attendance/student/${studentId}/summary`),
      getJSON("/subjects/"),
    ]);

    const nameByCode = {};
    for (const s of subjectsRes.subjects) nameByCode[s.subject_code] = s.subject_name;

    return summary.subjects.map((s) => ({
      name: nameByCode[s.subject_code] || s.subject_code,
      held: s.held,
      attended: s.attended,
      pct: s.pct,
    }));
  },

  /** REAL — derives the last-14-day present/absent strip from the raw record list (client-side bucketing). */
  getStudentHeatmap: async (studentId) => {
    const summary = await getJSON(`/attendance/student/${studentId}/summary`);
    const presentDates = new Set(
      summary.records.map((r) => new Date(r.timestamp).toDateString())
    );

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(presentDates.has(d.toDateString()) ? "present" : "absent");
    }
    return days;
  },

  /**
   * REAL — full record list. Every row here is a "present" row (the system
   * only ever writes attendance when a face matches — see
   * DOCUMENTATION.md §5.3 for why there's no per-date "absent" row).
   */
  getStudentHistory: async (studentId, filters = {}) => {
    const [summary, subjectsRes] = await Promise.all([
      getJSON(`/attendance/student/${studentId}/summary`),
      getJSON("/subjects/"),
    ]);

    const nameByCode = {};
    for (const s of subjectsRes.subjects) nameByCode[s.subject_code] = s.subject_name;

    let records = summary.records.map((r) => ({
      date: new Date(r.timestamp).toISOString().slice(0, 10),
      subject: nameByCode[r.subject_code] || r.subject_code,
      status: "present",
      time: new Date(r.timestamp).toLocaleTimeString(),
      confidence: r.confidence != null ? Math.round(r.confidence * 1000) / 10 : null,
      markedBy: r.marked_by,
    }));

    if (filters.subject) {
      records = records.filter((r) => r.subject === filters.subject);
    }

    return records;
  },

  getStudentNotifications: () => mock(mockStudentNotifications), // GET /api/students/me/notifications
  markNotificationRead: (id) => mock({ id, read: true }), // PATCH /api/students/me/notifications/:id

  // ==========================================================================
  // FACULTY
  // ==========================================================================
  /** REAL — GET /subjects/, filtered to this faculty's own subject_codes (from login's subjects_assigned). */
  getFacultySubjects: async (subjectCodes = []) => {
    const res = await getJSON("/subjects/");
    return res.subjects.filter((s) => subjectCodes.includes(s.subject_code));
  },

  /**
   * REAL — POST /attendance/mark. `sessionId` is deterministic
   * (`${subjectCode}_${date}`), so re-capturing the same subject on the
   * same day keeps adding to one session instead of starting a new one.
   */
  triggerCapture: (photoBlob, { subjectCode, sessionId, markedBy }) => {
    const formData = new FormData();
    formData.append("subject_code", subjectCode);
    formData.append("session_id", sessionId);
    formData.append("marked_by", markedBy);
    formData.append("image", photoBlob, "classroom.jpg");
    return postForm("/attendance/mark", formData);
  },

  /** REAL — GET /attendance/{sessionId}, joined against /students/ for display names. */
  getRoster: async (sessionId) => {
    if (!sessionId) return [];

    const [attendanceRes, studentsRes] = await Promise.all([
      getJSON(`/attendance/${sessionId}`),
      getJSON("/students/"),
    ]);

    const studentByStudentId = {};
    for (const s of studentsRes.students) studentByStudentId[s.student_id] = s;

    return attendanceRes.records.map((r) => {
      const student = studentByStudentId[r.student_id];
      return {
        id: r.record_id,
        name: student?.fullname || r.student_id,
        roll: r.student_id,
        status: "present", // only matched students have a row at all — see DOCUMENTATION.md §5.3
      };
    });
  },

  overrideAttendance: (recordId, status) => mock({ recordId, status }), // not built server-side yet
  getLowAttendanceAlerts: () => mock(mockAlerts), // GET /api/faculty/alerts — not built server-side yet
  getFacultyRecords: (filters = {}) => mock(mockFacultyRecords), // GET /api/faculty/records — not built server-side yet
  getFacultyStudents: async () => {
    const response = await fetch(`${BASE_URL}/students`);

    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }

    const data = await response.json();

    return data.students.map((student) => ({
      id: student._id,
      name: student.fullname,
      roll: student.student_id,
      subject: student.section,
      pct: 0
    }));
  },
  getFacultyNotifications: () => mock(mockFacultyNotifications), // not built server-side yet

  // ==========================================================================
  // ADMIN
  // ==========================================================================
  getAdminStats: () => mock(mockAdminStats), // not built server-side yet

  /**
   * REAL — students missing a face embedding. There's no `embedding`
   * field on the student document (embeddings live in their own
   * `face_embeddings` collection) — computed here as a set difference.
   */
  getEnrollmentQueue: async () => {
    const [studentsRes, facesRes] = await Promise.all([
      getJSON("/students/"),
      getJSON("/faces/"),
    ]);

    const enrolledIds = new Set(facesRes.faces.map((f) => f.student_id));

    return studentsRes.students
      .filter((s) => !enrolledIds.has(s.student_id))
      .map((s) => ({
        id: s.student_id,
        name: s.fullname,
        meta: `${s.section} · Sem ${s.semester}`,
      }));
  },

  /** REAL — POST /students/. Returns the plaintext default password once — show it to the admin, it's never retrievable again. */
  createStudent: async (fields) => {
    const result = await postJSON("/students/", {
      student_id: fields.student_id,
      fullname: fields.fullname,
      email: fields.email,
      section: fields.section,
      semester: Number(fields.semester),
      address: fields.address,
    });

    return {
      id: fields.student_id,
      name: fields.fullname,
      meta: `${fields.section} · Sem ${fields.semester}`,
      defaultPassword: result.default_password,
    };
  },

  /** REAL — POST /faces/enroll. One representative photo per student (backend requires exactly one face). */
  enrollStudent: (studentId, photoBlob) => {
    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("image", photoBlob, "enroll.jpg");
    return postForm("/faces/enroll", formData);
  },

  /** REAL — POST /faculty/. Same default-password pattern as createStudent. */
  createFaculty: async (fields) => {
    const result = await postJSON("/faculty/", {
      faculty_id: fields.facultyId,
      fullname: fields.name,
      email: fields.email,
      subjects_assigned: fields.subjectsAssigned || [],
    });

    return {
      id: fields.facultyId,
      name: fields.name,
      defaultPassword: result.default_password,
    };
  },

  /** REAL — GET /faculty/ */
  getFaculty: async () => {
    const result = await getJSON("/faculty/");
    return result.faculty;
  },

  getUsers: () => mock(mockUsers), // not built server-side yet — see DOCUMENTATION.md
  getAdminSubjects: () => mock(mockAdminSubjects), // not built server-side yet
  createSubject: (subject) => mock({ ...subject }, 400), // not built server-side yet
  getAdminReport: () => mock(mockAdminReport), // not built server-side yet
  getAdminSettings: () => mock(mockAdminSettings), // not built server-side yet
  updateAdminSettings: (fields) => mock({ ...mockAdminSettings, ...fields }), // not built server-side yet
  getAdminNotifications: () => mock(mockAdminNotifications), // not built server-side yet
};

export { BASE_URL };
