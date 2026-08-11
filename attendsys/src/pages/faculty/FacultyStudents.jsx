import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyStudents — "/faculty/students"
 *
 * All students across every subject this faculty teaches, with a search
 * box and their per-subject attendance %. Maps to: GET /api/faculty/students
 */
export default function FacultyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.getFacultyStudents().then(setStudents)
    .catch(console.error);
  }, []);

  // Client-side search filter — fine at this scale (a faculty's roster is
  // small). If this list grows large, move filtering server-side instead
  // (pass `query` as a search param to getFacultyStudents()).
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.roll.includes(query) ||
      s.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Topbar title="My students" sub="Across all subjects you teach" basePath="/faculty" who={user?.name} unreadCount={1} />

      <Card>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, roll, or subject…"
          className="w-full border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring mb-4"
        />

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Roll</th>
              <th className="py-2">Name</th>
              <th className="py-2">Subject</th>
              <th className="py-2 text-right">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={`${s.id}-${s.subject}`} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 roll-tab">{s.roll}</td>
                <td className="py-2.5">{s.name}</td>
                <td className="py-2.5 text-muted">{s.subject}</td>
                <td className={`py-2.5 text-right font-mono ${s.pct < 75 ? "text-stamp-red" : "text-ink"}`}>
                  {s.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-muted text-[13px] py-8">No students match "{query}".</div>
        )}
      </Card>
    </>
  );
}
