import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyStudents — "/faculty/students"
 *
 * All students in this faculty's one assigned subject (business rule: one
 * faculty, one subject — DOCUMENTATION.md §8), all-time held/attended/%.
 *
 * BUG FIX (per request): this page used to show each student's `section`
 * in the "Subject" column (a copy/paste artifact — getFacultyStudents() was
 * mapping `subject: student.section`). It now shows the real subject name,
 * plus everything else a faculty member is likely to need: email, section,
 * semester, held/attended counts, and a minimum-% filter alongside search.
 * Maps to: GET /attendance/subject/{code}/students
 */
export default function FacultyStudents() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [minPct, setMinPct] = useState("all");

  useEffect(() => {
    api.getFacultySubjects(user?.subjectsAssigned || []).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) setSubjectCode(subs[0].subject_code);
    });
  }, []);

  useEffect(() => {
    if (!subjectCode) return;
    api.getFacultyStudents(subjectCode).then(setStudents).catch(console.error);
  }, [subjectCode]);

  const currentSubject = subjects.find((s) => s.subject_code === subjectCode);

  const filtered = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.roll.includes(query) ||
      (s.email || "").toLowerCase().includes(query.toLowerCase());
    const matchesPct =
      minPct === "all" ||
      (minPct === "below75" && s.pct < 75) ||
      (minPct === "below50" && s.pct < 50);
    return matchesQuery && matchesPct;
  });

  return (
    <>
      <Topbar
        title="My students"
        sub={currentSubject ? currentSubject.subject_name : "No subject assigned"}
        basePath="/faculty"
        who={user?.name}
        unreadCount={1}
      />

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll, or email…"
            className="flex-1 min-w-[200px] border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
          />
          <select
            value={minPct}
            onChange={(e) => setMinPct(e.target.value)}
            className="border border-rule rounded-[3px] px-3 py-2 text-[12.5px] bg-white focus-ring"
          >
            <option value="all">All attendance</option>
            <option value="below75">Below 75%</option>
            <option value="below50">Below 50%</option>
          </select>
          {subjects.length > 1 && (
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="border border-rule rounded-[3px] px-3 py-2 text-[12.5px] bg-white focus-ring"
            >
              {subjects.map((s) => (
                <option key={s.subject_code} value={s.subject_code}>{s.subject_name}</option>
              ))}
            </select>
          )}
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Roll</th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Section</th>
              <th className="py-2">Semester</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Held</th>
              <th className="py-2">Attended</th>
              <th className="py-2 text-right">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 roll-tab">{s.roll}</td>
                <td className="py-2.5">{s.name}</td>
                <td className="py-2.5 text-muted text-[12px]">{s.email || "—"}</td>
                <td className="py-2.5 text-muted">{s.section || "—"}</td>
                <td className="py-2.5 text-muted">{s.semester ?? "—"}</td>
                <td className="py-2.5">{s.subject}</td>
                <td className="py-2.5 text-muted">{s.held}</td>
                <td className="py-2.5 text-muted">{s.attended}</td>
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
