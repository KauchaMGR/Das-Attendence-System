import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminFaculty — "/admin/faculty"
 *
 * Lists faculty-maintainer accounts from the backend collection and shows
 * their assigned subject codes in the same format as the subject handoff
 * in the login token payload.
 */
export default function AdminFaculty() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    api.getFaculty().then(setFaculty);
  }, []);

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
              <th className="py-2 text-right">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.faculty_id || f._id} className="border-b border-rule/70 last:border-0 align-top">
                <td className="py-2.5 font-mono text-[11.5px] text-muted">{f.faculty_id}</td>
                <td className="py-2.5">{f.fullname || f.name || "—"}</td>
                <td className="py-2.5 text-muted">{f.email || "—"}</td>
                <td className="py-2.5 text-right">
                  {(f.subjects_assigned || []).length > 0 ? (
                    <span className="font-mono text-[11px] text-muted">
                      {(f.subjects_assigned || []).join(", ")}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
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
