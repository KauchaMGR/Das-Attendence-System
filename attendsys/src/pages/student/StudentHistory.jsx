import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * StudentHistory — "/student/history"
 *
 * Full attendance log (every session, not just the last 14 days shown on
 * the overview heatmap). Includes a subject filter dropdown.
 *
 * Maps to: GET /api/students/me/history?subject=&from=&to=
 * `subjectFilter` is passed through to api.getStudentHistory() as a filters
 * object — currently the mock ignores it and always returns the same list,
 * but the real backend call should apply it as a query param.
 */
export default function StudentHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    if (!user?.studentId) return;
    setLoading(true);
    api
      .getStudentHistory(user.studentId, { subject: subjectFilter === "all" ? undefined : subjectFilter })
      .then((data) => {
        setRecords(data);
        setLoading(false);
      });
  }, [user?.studentId, subjectFilter]);

  // Distinct subject names for the filter dropdown, derived from whatever
  // records came back. TODO(backend): once the API supports it, it's
  // cleaner to fetch the student's subject list separately (already
  // available via api.getStudentSubjects()) rather than deriving it here.
  const subjectOptions = ["all", ...new Set(records.map((r) => r.subject))];

  return (
    <>
      <Topbar
        title="Attendance history"
        sub="Full session-by-session log"
        basePath="/student"
        who={user?.name}
        unreadCount={2}
      />

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="text-[13px] text-muted">
            {loading ? "Loading…" : `${records.length} record(s)`}
          </span>
          {/* Subject filter — client-side only right now since the mock
              ignores the `subject` param. Once the real endpoint filters
              server-side, this dropdown works exactly as-is. */}
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
              <th className="py-2">Time</th>
              <th className="py-2">Confidence</th>
              <th className="py-2">Marked by</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 font-mono text-[12px]">{r.date}</td>
                <td className="py-2.5">{r.subject}</td>
                <td className="py-2.5 font-mono text-[12px]">{r.time}</td>
                <td className="py-2.5 font-mono text-[12px]">{r.confidence ? `${r.confidence}%` : "—"}</td>
                <td className="py-2.5 text-muted text-[12px]">{r.markedBy === "faculty_override" ? "Faculty" : "Auto"}</td>
                <td className="py-2.5 text-right"><StatusStamp status={r.status}>{r.status}</StatusStamp></td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && records.length === 0 && (
          <div className="text-center text-muted text-[13px] py-8">No records for this filter.</div>
        )}
      </Card>
    </>
  );
}
