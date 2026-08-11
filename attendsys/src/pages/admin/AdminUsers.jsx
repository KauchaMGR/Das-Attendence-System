import { Fragment, useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminUsers — "/admin/users"
 *
 * Every login account (students, faculty, admins), real data joined from
 * three sources: GET /users/ (source of truth for every account) matched
 * against GET /students/ and GET /faculty/ via each profile's `user_id`, so
 * a student/faculty row can be edited or deleted through the right entity
 * endpoint (PUT/DELETE /students/{id} or /faculty/{id}).
 *
 * SCOPE DECISION (see DOCUMENTATION.md §8): admin-role rows are read-only —
 * there's no backend endpoint to update/delete a bare `users` document, and
 * adding one risks accidental admin self-lockout with no recovery path.
 */
export default function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // "Add faculty" form — real: POST /faculty/ (creates a login account +
  // faculty profile together, same default-password pattern as students).
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ facultyId: "", name: "", email: "", subjectCode: "" });
  const [creatingFaculty, setCreatingFaculty] = useState(false);
  const [facultyError, setFacultyError] = useState("");
  const [lastCreatedFaculty, setLastCreatedFaculty] = useState(null);

  async function loadAll() {
    const [users, students, faculty, subs] = await Promise.all([
      api.getUsers(),
      api.getStudents(),
      api.getFaculty(),
      api.getSubjects(),
    ]);

    const studentByUserId = {};
    for (const s of students) if (s.user_id) studentByUserId[s.user_id] = s;
    const facultyByUserId = {};
    for (const f of faculty) if (f.user_id) facultyByUserId[f.user_id] = f;

    setRows(
      users.map((u) => ({
        ...u,
        student: studentByUserId[u.id] || null,
        faculty: facultyByUserId[u.id] || null,
      }))
    );
    setSubjects(subs);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateFacultyField(field, value) {
    setFacultyForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateFaculty(e) {
    e.preventDefault();
    setCreatingFaculty(true);
    setFacultyError("");
    try {
      const created = await api.createFaculty(facultyForm);
      setLastCreatedFaculty(created);
      setFacultyForm({ facultyId: "", name: "", email: "", subjectCode: "" });
      setShowAddFaculty(false);
      await loadAll();
    } catch (err) {
      setFacultyError(err.message);
    } finally {
      setCreatingFaculty(false);
    }
  }

  function startEdit(row) {
    setError("");
    setEditingId(row.id);
    if (row.student) {
      setEditForm({
        fullname: row.student.fullname,
        email: row.student.email,
        section: row.student.section,
        semester: row.student.semester,
        address: row.student.address,
      });
    } else if (row.faculty) {
      setEditForm({
        fullname: row.faculty.fullname,
        email: row.faculty.email,
        subject_code: row.faculty.subjects_assigned?.[0] || "",
      });
    }
  }

  async function saveEdit(row) {
    setSaving(true);
    setError("");
    try {
      if (row.student) {
        await api.updateStudent(row.student.student_id, {
          fullname: editForm.fullname,
          email: editForm.email,
          section: editForm.section,
          semester: Number(editForm.semester),
          address: editForm.address,
        });
      } else if (row.faculty) {
        await api.updateFaculty(row.faculty.faculty_id, {
          fullname: editForm.fullname,
          email: editForm.email,
        });
        if (editForm.subject_code) {
          await api.assignSubjectToFaculty(row.faculty.faculty_id, editForm.subject_code);
        }
      }
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const label = row.student ? row.student.student_id : row.faculty.faculty_id;
    if (!confirm(`Delete ${row.name} (${label})? This cannot be undone.`)) return;
    try {
      if (row.student) await api.deleteStudent(row.student.student_id);
      else if (row.faculty) await api.deleteFaculty(row.faculty.faculty_id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = rows.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <>
      <Topbar
        title="Users"
        sub={`${rows.length} accounts`}
        basePath="/admin"
        unreadCount={2}
        right={
          <button
            onClick={() => setShowAddFaculty((s) => !s)}
            className="font-mono text-[11.5px] bg-ink text-paper rounded-[3px] px-3.5 py-2 hover:opacity-90 transition-opacity focus-ring"
          >
            {showAddFaculty ? "Cancel" : "+ Add faculty"}
          </button>
        }
      />

      {lastCreatedFaculty && (
        <Card className="mb-5">
          <div className="text-[13px]">
            <b>{lastCreatedFaculty.id}</b> created. Default login password:{" "}
            <code className="bg-paper2 px-1.5 py-0.5 rounded-[3px] font-mono">{lastCreatedFaculty.defaultPassword}</code>
            {" "}— share this with them now, it won't be shown again.
          </div>
        </Card>
      )}

      {showAddFaculty && (
        <Card title="New faculty" sub="Creates the profile and a login account together" className="mb-5">
          {facultyError && <div className="text-[13px] text-stamp-red mb-3">{facultyError}</div>}
          <form onSubmit={handleCreateFaculty} className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-muted mb-1">Full name</label>
              <input required value={facultyForm.name} onChange={(e) => updateFacultyField("name", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Faculty ID</label>
              <input required value={facultyForm.facultyId} onChange={(e) => updateFacultyField("facultyId", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Email</label>
              <input required type="email" value={facultyForm.email} onChange={(e) => updateFacultyField("email", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">
                Subject Code
              </label>

              <input
                required
                value={facultyForm.subjectCode}
                onChange={(e) =>
                  updateFacultyField("subjectCode", e.target.value.toUpperCase())
                }
                placeholder="e.g. CS101"
                className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring"
              />
            </div>
            <button type="submit" disabled={creatingFaculty} className="md:col-span-3 bg-stamp-green text-paper font-semibold text-[13px] py-2.5 rounded-[3px] disabled:opacity-50 focus-ring">
              {creatingFaculty ? "Creating…" : "Create faculty account"}
            </button>
          </form>
        </Card>
      )}

      <Card>
        {error && <div className="text-[13px] text-stamp-red mb-3">{error}</div>}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 min-w-[200px] border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-rule rounded-[3px] px-3 py-2 text-[12.5px] bg-white focus-ring"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <Fragment key={u.id}>
                <tr className="border-b border-rule/70 last:border-0">
                  <td className="py-2.5">{u.name}</td>
                  <td className="py-2.5 text-muted text-[12px]">{u.email}</td>
                  <td className="py-2.5 font-mono text-[11px] uppercase text-muted">{u.role}</td>
                  <td className="py-2.5 text-right">
                    {u.student || u.faculty ? (
                      editingId === u.id ? (
                        <button onClick={() => setEditingId(null)} className="font-mono text-[11px] text-muted hover:text-ink focus-ring">Cancel</button>
                      ) : (
                        <span className="space-x-3">
                          <button onClick={() => startEdit(u)} className="font-mono text-[11px] text-stamp-green hover:underline focus-ring">Edit</button>
                          <button onClick={() => handleDelete(u)} className="font-mono text-[11px] text-stamp-red hover:underline focus-ring">Delete</button>
                        </span>
                      )
                    ) : (
                      <span className="text-muted font-mono text-[11px]">—</span>
                    )}
                  </td>
                </tr>
                {editingId === u.id && (
                  <tr key={`${u.id}-edit`} className="border-b border-rule/70 last:border-0 bg-paper2/40">
                    <td colSpan={4} className="py-3">
                      <div className="grid md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-[11px] text-muted mb-1">Full name</label>
                          <input value={editForm.fullname} onChange={(e) => setEditForm((p) => ({ ...p, fullname: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted mb-1">Email</label>
                          <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                        </div>
                        {u.student && (
                          <>
                            <div>
                              <label className="block text-[11px] text-muted mb-1">Section</label>
                              <input value={editForm.section} onChange={(e) => setEditForm((p) => ({ ...p, section: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted mb-1">Semester</label>
                              <input type="number" min="1" max="8" value={editForm.semester} onChange={(e) => setEditForm((p) => ({ ...p, semester: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] text-muted mb-1">Address</label>
                              <input value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                            </div>
                          </>
                        )}
                        {u.faculty && (
                          <div>
                            <label className="block text-[11px] text-muted mb-1">Subject</label>
                            <select value={editForm.subject_code} onChange={(e) => setEditForm((p) => ({ ...p, subject_code: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white">
                              <option value="">Unassigned</option>
                              {subjects.map((s) => (
                                <option key={s.subject_code} value={s.subject_code}>{s.subject_name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button
                          onClick={() => saveEdit(u)}
                          disabled={saving}
                          className="bg-stamp-green text-paper font-semibold text-[12.5px] px-4 py-2 rounded-[3px] disabled:opacity-50 focus-ring"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-muted text-[13px] py-8">No users match your search.</div>
        )}
      </Card>
    </>
  );
}
