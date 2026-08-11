import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyRecords — "/faculty/records"
 *
 * Past capture sessions for this faculty's one assigned subject (business
 * rule: one faculty, one subject — see DOCUMENTATION.md §8), one row per
 * session, restricted to the admin-configured "last N days" window with
 * Saturdays/Sundays excluded. Maps to: GET /attendance/subject/{code}/records?days=
 */
export default function FacultyRecords() {
  const { user, settings } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [result, setResult] = useState({ days: settings.historyDays, records: [] });

  useEffect(() => {
    api.getFacultySubjects(user?.subjectsAssigned || []).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) setSubjectCode(subs[0].subject_code);
    });
  }, []);

  useEffect(() => {
    if (!subjectCode) return;
    const currentSubject = subjects.find((s) => s.subject_code === subjectCode);
    api.getFacultyRecords(subjectCode, settings.historyDays, currentSubject?.subject_name).then(setResult);
  }, [subjectCode, settings.historyDays, subjects]);

  const currentSubject = subjects.find((s) => s.subject_code === subjectCode);

  return (
    <>
      <Topbar
        title="Attendance records"
        sub={`Last ${result.days} days · Sat/Sun excluded`}
        basePath="/faculty"
        who={user?.name}
        unreadCount={1}
      />

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="text-[13px] text-muted">
            {currentSubject ? currentSubject.subject_name : "No subject assigned"} · {result.records.length} session(s)
          </span>
          {subjects.length > 1 && (
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="border border-rule rounded-[3px] px-3 py-1.5 text-[12.5px] bg-white focus-ring"
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
              <th className="py-2">Date</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Present</th>
              <th className="py-2">Absent</th>
              <th className="py-2 text-right">Avg. confidence</th>
            </tr>
          </thead>
          <tbody>
            {result.records.map((r, i) => (
              <tr key={i} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5 font-mono text-[12px]">{r.date}</td>
                <td className="py-2.5">{r.subject}</td>
                <td className="py-2.5 text-stamp-green">{r.present}</td>
                <td className="py-2.5 text-stamp-red">{r.absent}</td>
                <td className="py-2.5 text-right font-mono text-[12px]">{r.avgConfidence != null ? `${r.avgConfidence}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.records.length === 0 && (
          <div className="text-center text-muted text-[13px] py-8">No capture sessions in this window.</div>
        )}
      </Card>
    </>
  );
}
