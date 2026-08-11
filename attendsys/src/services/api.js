/**
 * ============================================================================
 * API service layer.
 * ============================================================================
 * This is the ONLY file that should ever talk to the backend. Every page
 * calls functions from `api` below instead of using fetch() directly.
 *
 * As of this pass, every function is real EXCEPT the three notification
 * getters (getStudentNotifications / getFacultyNotifications /
 * getAdminNotifications) and markNotificationRead / overrideAttendance —
 * those still use mock(...) because no notifications/roll-call-override
 * backend exists yet (out of scope for this pass). Everything else hits the
 * real FastAPI backend (Backend/app/routes/*.py). See DOCUMENTATION.md §8.
 * ============================================================================
 */
import {
  mockStudentNotifications,
  mockFacultyNotifications,
  mockAdminNotifications,
} from "../data/mockData.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

/** Fake network delay so loading states are visible in demos. */
async function mock(data, delay = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

/**
 * FastAPI serializes `datetime.utcnow()` values to JSON without a `Z`/offset
 * suffix (e.g. "2026-08-11T10:02:14.123000") — every stored timestamp really
 * is UTC, but a bare ISO string with no timezone designator is parsed by
 * `new Date(...)` as LOCAL time, not UTC. The result: a UTC clock reading
 * gets silently mislabeled as if it were already local, which is why "last
 * recognized scan" and history timestamps showed the raw UTC time instead of
 * the viewer's local time. Fix: always append "Z" before parsing.
 */
function parseServerDate(ts) {
  if (!ts) return null;
  return new Date(ts.endsWith("Z") || ts.includes("+") ? ts : `${ts}Z`);
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

async function putJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    throw new Error(responseBody.detail || "Request failed");
  }
  return res.json();
}

async function deleteJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
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
  // AUTH
  // ==========================================================================
  /** POST /auth/login — returns {access_token, role, fullname, email, student_id?, faculty_id?, subjects_assigned?} */
  login: (email, password) => postJSON("/auth/login", { email, password }),

  // ==========================================================================
  // SETTINGS — system-wide configuration, incl. the "last N days" window
  // used by every dashboard's history widgets.
  // ==========================================================================
  getSystemSettings: async () => {
    const res = await getJSON("/settings/");
    const s = res.settings;
    return {
      cosineThreshold: s.cosine_threshold,
      minAttendancePct: s.min_attendance_pct,
      sessionTimeoutMinutes: s.session_timeout_minutes,
      emailAlertsEnabled: s.email_alerts_enabled,
      historyDays: s.history_days,
    };
  },

  updateSystemSettings: async (fields) => {
    const body = {};
    if (fields.cosineThreshold !== undefined) body.cosine_threshold = fields.cosineThreshold;
    if (fields.minAttendancePct !== undefined) body.min_attendance_pct = fields.minAttendancePct;
    if (fields.sessionTimeoutMinutes !== undefined) body.session_timeout_minutes = fields.sessionTimeoutMinutes;
    if (fields.emailAlertsEnabled !== undefined) body.email_alerts_enabled = fields.emailAlertsEnabled;
    if (fields.historyDays !== undefined) body.history_days = fields.historyDays;

    const res = await putJSON("/settings/", body);
    const s = res.settings;
    return {
      cosineThreshold: s.cosine_threshold,
      minAttendancePct: s.min_attendance_pct,
      sessionTimeoutMinutes: s.session_timeout_minutes,
      emailAlertsEnabled: s.email_alerts_enabled,
      historyDays: s.history_days,
    };
  },

  // ==========================================================================
  // STUDENT
  // ==========================================================================
  /** REAL — GET /attendance/student/{studentId}/summary, joined against /subjects/ for subject names. */
  getStudentProfile: async (studentId, fullname) => {
    const summary = await getJSON(`/attendance/student/${studentId}/summary`);
    const latest = summary.records[0];

    return {
      name: fullname,
      roll: studentId,
      present: summary.present_total,
      absent: summary.absent_total,
      lastScan: {
        confidence: latest?.confidence != null ? Math.round(latest.confidence * 1000) / 10 : null,
        time: latest ? parseServerDate(latest.timestamp).toLocaleTimeString() : "—",
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

  /**
   * REAL — derives the last-`historyDays`-day present/absent/holiday strip
   * from the raw record list (client-side bucketing). Weekends are tagged
   * "holiday" rather than "absent" — no class is held on Sat/Sun, so they
   * shouldn't count against the student (see DOCUMENTATION.md §8).
   */
  getStudentHeatmap: async (studentId, historyDays = 14) => {
    const summary = await getJSON(`/attendance/student/${studentId}/summary`);
    const presentDates = new Set(
      summary.records.map((r) => parseServerDate(r.timestamp).toDateString())
    );

    const days = [];
    let present = 0;
    let absent = 0;
    let holiday = 0;

    for (let i = historyDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      let status;
      if (isWeekend) {
        status = "holiday";
        holiday++;
      } else if (presentDates.has(d.toDateString())) {
        status = "present";
        present++;
      } else {
        status = "absent";
        absent++;
      }
      days.push(status);
    }

    return { days, present, absent, holiday };
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
      date: parseServerDate(r.timestamp).toISOString().slice(0, 10),
      subject: nameByCode[r.subject_code] || r.subject_code,
      status: "present",
      time: parseServerDate(r.timestamp).toLocaleTimeString(),
      confidence: r.confidence != null ? Math.round(r.confidence * 1000) / 10 : null,
      markedBy: r.marked_by,
    }));

    if (filters.subject) {
      records = records.filter((r) => r.subject === filters.subject);
    }

    return records;
  },

  /** GET /students/{id} — used by the student profile page. */
  getStudent: async (studentId) => {
    const res = await getJSON(`/students/${studentId}`);
    return res.student;
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

  /** GET /faculty/{id} — used by the faculty profile page. */
  getFacultyProfile: async (facultyId) => {
    const res = await getJSON(`/faculty/${facultyId}`);
    return res.faculty;
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

  /** REAL — GET /attendance/subject/{code}/alerts?days=&threshold= */
  getLowAttendanceAlerts: async (subjectCode, days) => {
    if (!subjectCode) return { days, alerts: [] };
    const res = await getJSON(`/attendance/subject/${subjectCode}/alerts${days ? `?days=${days}` : ""}`);
    return {
      days: res.days,
      alerts: res.alerts.map((a) => ({
        student: a.fullname,
        pct: a.pct,
        held: a.held,
        attended: a.attended,
        detail: `${a.pct}% attendance in the last ${res.days} days`,
      })),
    };
  },

  /** REAL — GET /attendance/subject/{code}/records?days= — one row per capture session. */
  getFacultyRecords: async (subjectCode, days, subjectName) => {
    if (!subjectCode) return { days, records: [] };
    const res = await getJSON(`/attendance/subject/${subjectCode}/records${days ? `?days=${days}` : ""}`);
    return {
      days: res.days,
      records: res.records.map((r) => ({
        date: r.date,
        subject: subjectName || subjectCode,
        present: r.present,
        absent: r.absent,
        avgConfidence: r.avg_confidence,
      })),
    };
  },

  /** REAL — GET /attendance/subject/{code}/students?days= — all-time roster unless `days` is passed. */
  getFacultyStudents: async (subjectCode, days) => {
    if (!subjectCode) return [];
    const res = await getJSON(`/attendance/subject/${subjectCode}/students${days ? `?days=${days}` : ""}`);
    return res.roster.map((r) => ({
      id: r.student_id,
      name: r.fullname,
      roll: r.student_id,
      email: r.email,
      section: r.section,
      semester: r.semester,
      subject: res.subject_name,
      held: r.held,
      attended: r.attended,
      absent: r.absent,
      pct: r.pct,
    }));
  },

  getFacultyNotifications: () => mock(mockFacultyNotifications), // not built server-side yet

  // ==========================================================================
  // ADMIN
  // ==========================================================================
  /**
   * REAL — GET /attendance/report/overview?days= — backs both the Overview
   * "at a glance" stats and the full Reports page (same call, same numbers).
   */
  getAdminReport: async (days) => {
    const res = await getJSON(`/attendance/report/overview${days ? `?days=${days}` : ""}`);
    return {
      days: res.days,
      enrolledStudents: res.enrolled_students,
      scansToday: res.scans_today,
      avgConfidence: res.avg_confidence,
      dailyTrend: res.daily_trend.map((d) => ({
        date: d.date,
        dayLabel: d.day_label,
        held: d.held,
        present: d.present,
        pct: d.pct,
      })),
      subjectAverages: res.subject_averages,
      lowAttendanceCount: res.low_attendance_count,
    };
  },

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

  /** REAL — GET /students/ */
  getStudents: async () => {
    const res = await getJSON("/students/");
    return res.students;
  },

  /** REAL — PUT /students/{id} */
  updateStudent: (studentId, fields) => putJSON(`/students/${studentId}`, fields),

  /** REAL — DELETE /students/{id} */
  deleteStudent: (studentId) => deleteJSON(`/students/${studentId}`),

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

  /** REAL — PUT /faculty/{id} */
  updateFaculty: (facultyId, fields) => putJSON(`/faculty/${facultyId}`, fields),

  /** REAL — DELETE /faculty/{id} */
  deleteFaculty: (facultyId) => deleteJSON(`/faculty/${facultyId}`),

  /** REAL — GET /subjects/ */
  getSubjects: async () => {
    const res = await getJSON("/subjects/");
    return res.subjects;
  },

  /** REAL — POST /subjects/ */
  createSubject: (fields) => postJSON("/subjects/", {
    subject_code: fields.subject_code,
    subject_name: fields.subject_name,
    credit_hour: Number(fields.credit_hour),
    semester: Number(fields.semester),
    faculty_id: fields.faculty_id || null,
  }),

  /** REAL — PUT /subjects/{code} */
  updateSubject: (subjectCode, fields) => putJSON(`/subjects/${subjectCode}`, fields),

  /** REAL — DELETE /subjects/{code} */
  deleteSubject: (subjectCode) => deleteJSON(`/subjects/${subjectCode}`),

  /**
   * REAL — keeps the one-faculty-one-subject relationship in sync from
   * either side of the admin UI (Subjects page or Faculty page): sets this
   * faculty's `subjects_assigned` to just this one subject, and this
   * subject's `faculty_id` to this one faculty, in the same call.
   */
  assignSubjectToFaculty: (facultyId, subjectCode) =>
    Promise.all([
      putJSON(`/faculty/${facultyId}`, { subjects_assigned: [subjectCode] }),
      putJSON(`/subjects/${subjectCode}`, { faculty_id: facultyId }),
    ]),

  /** REAL — GET /users/?role= — every login account (students, faculty, admins). */
  getUsers: async (role) => {
    const res = await getJSON(`/users/${role ? `?role=${role}` : ""}`);
    return res.users.map((u) => ({ id: u.id, name: u.fullname, email: u.email, role: u.role }));
  },

  getAdminSettings: () => api.getSystemSettings(),
  updateAdminSettings: (fields) => api.updateSystemSettings(fields),
  getAdminNotifications: () => mock(mockAdminNotifications), // not built server-side yet
};

export { BASE_URL, parseServerDate };
