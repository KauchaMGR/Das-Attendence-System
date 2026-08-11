import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyRecords — "/faculty/records"
 *
 * Past capture sessions this faculty has run, one row per session (not
 * per-student — that level of detail lives on the Live Session roster and
 * on the student's own history page). Maps to:
 *   GET /api/faculty/records?subject=&date=
 */
export default function FacultyRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    api.getFacultyRecords({ subject: subjectFilter === "all" ? undefined : subjectFilter }).then(setRecords);
  }, [subjectFilter]);

  const subjectOptions = ["all", ...new Set(records.map((r) => r.subject))];

  return (
    <>
      <Topbar title="Attendance records" sub="Past capture sessions" basePath="/faculty" who={user?.name} unreadCount={1} />

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="text-[13px] text-muted">{records.length} session(s)</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border border-rule rounded-[3px] px-3 py-1.5 text-[12.5px] bg-white focus-ring"
          >
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All subjects" : s}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Date</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Present</th>
              <th className="py-2">Absent</th>
              <th className="py-2 text-right">Avg. confidence</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 font-mono text-[12px]">{r.date}</td>
                <td className="py-2.5">{r.subject}</td>
                <td className="py-2.5 text-stamp-green">{r.present}</td>
                <td className="py-2.5 text-stamp-red">{r.absent}</td>
                <td className="py-2.5 text-right font-mono text-[12px]">{r.avgConfidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
