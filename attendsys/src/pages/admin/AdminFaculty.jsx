import { Fragment, useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminFaculty — "/admin/faculty"
 *
 * Lists faculty accounts, now with edit (fullname/email/their one subject)
 * and delete alongside the existing read-only list + search/filter.
 * Assigning a subject here calls the same api.assignSubjectToFaculty()
 * helper the Subjects page uses, so both pages stay in sync (one faculty,
 * one subject — DOCUMENTATION.md §8).
 */
export default function AdminFaculty() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadAll() {
    const [facs, subs] = await Promise.all([api.getFaculty(), api.getSubjects()]);
    setFaculty(facs);
    setSubjects(subs);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startEdit(f) {
    setError("");
    setEditingId(f.faculty_id);
    setEditForm({
      fullname: f.fullname,
      email: f.email,
      subject_code: f.subjects_assigned?.[0] || "",
    });
  }

  async function saveEdit(f) {
    setSaving(true);
    setError("");
    try {
      await api.updateFaculty(f.faculty_id, { fullname: editForm.fullname, email: editForm.email });
      if (editForm.subject_code) await api.assignSubjectToFaculty(f.faculty_id, editForm.subject_code);
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(f) {
    if (!confirm(`Delete faculty ${f.fullname} (${f.faculty_id})? This cannot be undone.`)) return;
    try {
      await api.deleteFaculty(f.faculty_id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const subjectOptions = Array.from(
    new Set(
      faculty.flatMap((f) => f.subjects_assigned || [])
    )
  ).sort();

  const filtered = faculty.filter((f) => {
    const haystack = `${f.fullname || f.name || ""} ${f.faculty_id || ""} ${f.email || ""}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" ||
      (f.subjects_assigned || []).includes(subjectFilter);

    return matchesQuery && matchesSubject;
  });

  return (
    <>
      <Topbar
        title="Faculty"
        sub={`${faculty.length} faculty accounts`}
        basePath="/admin"
        unreadCount={2}
        who={user?.name}
      />

      {error && <div className="text-[13px] text-stamp-red mb-3">{error}</div>}

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, or email…"
            className="flex-1 min-w-[240px] border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
          />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border border-rule rounded-[3px] px-3 py-2 text-[12.5px] bg-white focus-ring"
          >
            <option value="all">All subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Faculty ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Subjects</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <Fragment key={f.faculty_id || f._id}>
                <tr className="border-b border-rule/70 last:border-0 align-top">
                  <td className="py-2.5 font-mono text-[11.5px] text-muted">{f.faculty_id}</td>
                  <td className="py-2.5">{f.fullname || f.name || "—"}</td>
                  <td className="py-2.5 text-muted">{f.email || "—"}</td>
                  <td className="py-2.5">
                    {(f.subjects_assigned || []).length > 0 ? (
                      <span className="font-mono text-[11px] text-muted">
                        {(f.subjects_assigned || []).join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right space-x-3">
                    {editingId === f.faculty_id ? (
                      <button onClick={() => setEditingId(null)} className="font-mono text-[11px] text-muted hover:text-ink focus-ring">Cancel</button>
                    ) : (
                      <>
                        <button onClick={() => startEdit(f)} className="font-mono text-[11px] text-stamp-green hover:underline focus-ring">Edit</button>
                        <button onClick={() => handleDelete(f)} className="font-mono text-[11px] text-stamp-red hover:underline focus-ring">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
                {editingId === f.faculty_id && (
                  <tr className="border-b border-rule/70 last:border-0 bg-paper2/40">
                    <td colSpan={5} className="py-3">
                      <div className="grid md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-[11px] text-muted mb-1">Full name</label>
                          <input value={editForm.fullname} onChange={(e) => setEditForm((p) => ({ ...p, fullname: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted mb-1">Email</label>
                          <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted mb-1">Subject</label>
                          <select value={editForm.subject_code} onChange={(e) => setEditForm((p) => ({ ...p, subject_code: e.target.value }))} className="w-full border border-rule rounded-[3px] px-2.5 py-1.5 text-[13px] focus-ring bg-white">
                            <option value="">Unassigned</option>
                            {subjects.map((s) => (
                              <option key={s.subject_code} value={s.subject_code}>{s.subject_name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => saveEdit(f)}
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
          <div className="text-center text-muted text-[13px] py-8">
            No faculty accounts match your search.
          </div>
        )}
      </Card>
    </>
  );
}
