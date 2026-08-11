import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminSubjects — "/admin/subjects"
 *
 * List of subjects + a simple "add subject" form. Maps to:
 *   GET  /api/admin/subjects       -> api.getAdminSubjects()
 *   POST /api/admin/subjects       -> api.createSubject(subject)
 */
export default function AdminSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", semester: "", creditHour: "", faculty: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getAdminSubjects().then(setSubjects);
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    // TODO(backend): api.createSubject should POST to /api/admin/subjects
    // and return the created subject (or an error if the code already exists).
    const created = await api.createSubject({
      ...form,
      semester: Number(form.semester),
      creditHour: Number(form.creditHour),
    });
    setSubjects((prev) => [...prev, created]);
    setForm({ code: "", name: "", semester: "", creditHour: "", faculty: "" });
    setSaving(false);
    setShowForm(false);
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
            onClick={() => setShowForm((s) => !s)}
            className="font-mono text-[11.5px] bg-ink text-paper rounded-[3px] px-3.5 py-2 hover:opacity-90 transition-opacity focus-ring"
          >
            {showForm ? "Cancel" : "+ Add subject"}
          </button>
        }
      />

      {showForm && (
        <Card title="New subject" className="mb-5">
          <form onSubmit={handleAdd} className="grid md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-muted mb-1">Code</label>
              <input required value={form.code} onChange={(e) => updateField("code", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Name</label>
              <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Semester</label>
              <input required type="number" min="1" max="8" value={form.semester} onChange={(e) => updateField("semester", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Credit hr</label>
              <input required type="number" min="1" max="5" value={form.creditHour} onChange={(e) => updateField("creditHour", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Faculty</label>
              <input required value={form.faculty} onChange={(e) => updateField("faculty", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <button type="submit" disabled={saving} className="md:col-span-5 bg-stamp-green text-paper font-semibold text-[13px] py-2.5 rounded-[3px] disabled:opacity-50 focus-ring">
              {saving ? "Saving…" : "Save subject"}
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
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.code} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 font-mono text-[12px]">{s.code}</td>
                <td className="py-2.5">{s.name}</td>
                <td className="py-2.5">{s.semester}</td>
                <td className="py-2.5">{s.creditHour}</td>
                <td className="py-2.5 text-muted">{s.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
