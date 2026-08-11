import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminUsers — "/admin/users"
 *
 * Lists every account (students, faculty, admins) with search + role
 * filter. Maps to: GET /api/admin/users -> api.getUsers()
 *
 * REMOVED PER REQUEST:
 *   - Email column — accounts are no longer shown with an email address
 *     here (see mockData.js's header comment for the full list of where
 *     "email" was removed).
 *   - Status column + Suspend/Reactivate action — there is no longer an
 *     active/suspended concept on user accounts. If you need to disable
 *     an account in the future, that's a feature to re-add deliberately
 *     rather than something this page still half-supports.
 */
export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // "Add faculty" form — real: POST /faculty/ (creates a login account +
  // faculty profile together, same default-password pattern as students).
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ facultyId: "", name: "", email: "", subjectCode: "" });
  const [creatingFaculty, setCreatingFaculty] = useState(false);
  const [facultyError, setFacultyError] = useState("");
  const [lastCreatedFaculty, setLastCreatedFaculty] = useState(null);

  useEffect(() => {
    api.getUsers().then(setUsers);
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
      setFacultyForm({ facultyId: "", name: "", email: "" });
      setShowAddFaculty(false);
    } catch (err) {
      setFacultyError(err.message);
    } finally {
      setCreatingFaculty(false);
    }
  }

  const filtered = users.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <>
      <Topbar
        title="Users"
        sub={`${users.length} accounts`}
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
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
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
              <th className="py-2 text-right">Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5">{u.name}</td>
                <td className="py-2.5 text-right font-mono text-[11px] uppercase text-muted">{u.role}</td>
              </tr>
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
