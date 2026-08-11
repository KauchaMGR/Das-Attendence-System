import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyReports — "/faculty/reports"
 *
 * One subject only (business rule — DOCUMENTATION.md §8): the on-screen
 * roster and the CSV export both come from the exact same windowed call
 * (api.getFacultyStudents(subjectCode, days)), so the export always matches
 * what's on screen — no separate client-side aggregation to drift out of
 * sync with it.
 */
export default function FacultyReports() {
  const { user, settings } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    api.getFacultySubjects(user?.subjectsAssigned || []).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) setSubjectCode(subs[0].subject_code);
    });
  }, []);

  useEffect(() => {
    if (!subjectCode) return;
    api.getFacultyStudents(subjectCode, settings.historyDays).then(setRoster);
  }, [subjectCode, settings.historyDays]);

  const currentSubject = subjects.find((s) => s.subject_code === subjectCode);
  const belowThreshold = roster.filter((s) => s.pct < 75);
  const classAverage = roster.length
    ? (roster.reduce((sum, s) => sum + s.pct, 0) / roster.length).toFixed(1)
    : "0.0";

  function exportCsv() {
    const rows = [
      [`Subject: ${currentSubject?.subject_name || subjectCode}`],
      [`Window: last ${settings.historyDays} days, Sat/Sun excluded`],
      [],
      ["Roll", "Name", "Held", "Attended", "Attendance %"],
      ...roster.map((s) => [s.roll, s.name, s.held, s.attended, s.pct]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${subjectCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Reports"
        sub={`${currentSubject ? currentSubject.subject_name : "No subject assigned"} · last ${settings.historyDays} days · Sat/Sun excluded`}
        basePath="/faculty"
        who={user?.name}
        unreadCount={1}
        right={
          <button
            onClick={exportCsv}
            disabled={roster.length === 0}
            className="font-mono text-[11.5px] border border-rule rounded-[3px] px-3.5 py-2 hover:border-ink/40 transition-colors focus-ring disabled:opacity-50"
          >
            Export CSV
          </button>
        }
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Class summary" sub="This window">
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-rule/70">
                <td className="py-2.5 font-mono text-muted">Students</td>
                <td className="py-2.5 text-right">{roster.length}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-muted">Class average</td>
                <td className="py-2.5 text-right font-mono">{classAverage}%</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Below 75% threshold" sub="Students at exam-eligibility risk">
          {belowThreshold.length === 0 ? (
            <div className="text-[13px] text-muted py-4">No students currently below threshold.</div>
          ) : (
            belowThreshold.map((s) => (
              <div key={s.id} className="flex justify-between py-2.5 border-b border-rule/70 last:border-0 text-[13px]">
                <span>{s.name} <span className="text-muted">· {s.roll}</span></span>
                <span className="font-mono text-stamp-red">{s.pct}%</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
