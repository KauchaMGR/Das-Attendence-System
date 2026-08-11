import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyForm = { subject_code: "", subject_name: "", semester: "", credit_hour: "", faculty_id: "" };

/**
 * AdminSubjects — "/admin/subjects"
 *
 * Real CRUD over the subjects collection. The "Faculty" field is a select
 * of real faculty accounts (was free text before); saving calls
 * api.assignSubjectToFaculty() so the faculty's `subjects_assigned` and the
 * subject's `faculty_id` never drift out of sync (one faculty, one subject
 * — DOCUMENTATION.md §8).
 * Maps to: GET/POST/PUT/DELETE /subjects/
 */
export default function AdminSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [error, setError] = useState("");

  async function loadAll() {
    const [subs, facs] = await Promise.all([api.getSubjects(), api.getFaculty()]);
    setSubjects(subs);
    setFaculty(facs);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function facultyName(facultyId) {
    return faculty.find((f) => f.faculty_id === facultyId)?.fullname || "—";
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createSubject(form);
      if (form.faculty_id) await api.assignSubjectToFaculty(form.faculty_id, form.subject_code);
      setForm(emptyForm);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(s) {
    setError("");
    setEditingCode(s.subject_code);
    setForm({
      subject_code: s.subject_code,
      subject_name: s.subject_name,
      semester: s.semester,
      credit_hour: s.credit_hour,
      faculty_id: s.faculty_id || "",
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.updateSubject(editingCode, {
        subject_name: form.subject_name,
        semester: Number(form.semester),
        credit_hour: Number(form.credit_hour),
        faculty_id: form.faculty_id || null,
      });
      if (form.faculty_id) await api.assignSubjectToFaculty(form.faculty_id, editingCode);
      setEditingCode(null);
      setForm(emptyForm);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s) {
    if (!confirm(`Delete subject ${s.subject_name} (${s.subject_code})? This cannot be undone.`)) return;
    try {
      await api.deleteSubject(s.subject_code);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Topbar
        title="Subjects"
        sub={`${subjects.length} subjects configured`}
        basePath="/admin"
        who={user?.name}
        unreadCount={2}
        right={
          <button
            onClick={() => { setEditingCode(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="font-mono text-[11.5px] bg-ink text-paper rounded-[3px] px-3.5 py-2 hover:opacity-90 transition-opacity focus-ring"
          >
            {showForm ? "Cancel" : "+ Add subject"}
          </button>
        }
      />

      {error && <div className="text-[13px] text-stamp-red mb-3">{error}</div>}

      {(showForm || editingCode) && (
        <Card title={editingCode ? `Editing ${editingCode}` : "New subject"} className="mb-5">
          <form onSubmit={editingCode ? saveEdit : handleAdd} className="grid md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-muted mb-1">Code</label>
              <input required disabled={!!editingCode} value={form.subject_code} onChange={(e) => updateField("subject_code", e.target.value.toUpperCase())} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring disabled:bg-paper2/60" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Name</label>
              <input required value={form.subject_name} onChange={(e) => updateField("subject_name", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Semester</label>
              <input required type="number" min="1" max="8" value={form.semester} onChange={(e) => updateField("semester", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Credit hr</label>
              <input required type="number" min="1" max="5" value={form.credit_hour} onChange={(e) => updateField("credit_hour", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Faculty</label>
              <select value={form.faculty_id} onChange={(e) => updateField("faculty_id", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring bg-white">
                <option value="">Unassigned</option>
                {faculty.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>{f.fullname}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="md:col-span-5 bg-stamp-green text-paper font-semibold text-[13px] py-2.5 rounded-[3px] disabled:opacity-50 focus-ring">
              {saving ? "Saving…" : editingCode ? "Save changes" : "Save subject"}
            </button>
          </form>
        </Card>
      )}

      <Card>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Code</th>
              <th className="py-2">Name</th>
              <th className="py-2">Semester</th>
              <th className="py-2">Credit hr</th>
              <th className="py-2">Faculty</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subject_code} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 font-mono text-[12px]">{s.subject_code}</td>
                <td className="py-2.5">{s.subject_name}</td>
                <td className="py-2.5">{s.semester}</td>
                <td className="py-2.5">{s.credit_hour}</td>
                <td className="py-2.5 text-muted">{facultyName(s.faculty_id)}</td>
                <td className="py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(s)} className="font-mono text-[11px] text-stamp-green hover:underline focus-ring">Edit</button>
                  <button onClick={() => handleDelete(s)} className="font-mono text-[11px] text-stamp-red hover:underline focus-ring">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subjects.length === 0 && (
          <div className="text-center text-muted text-[13px] py-8">No subjects configured yet.</div>
        )}
      </Card>
    </>
  );
}
