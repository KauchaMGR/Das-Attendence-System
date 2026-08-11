import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyReports — "/faculty/reports"
 *
 * Summary view: subject-wise averages (derived client-side from
 * getFacultyStudents() for now) + a CSV export stub.
 *
 * TODO(backend): once a real `/api/faculty/reports` endpoint exists that
 * returns pre-aggregated averages, swap the derivation below for a direct
 * api call instead of computing it from the raw student list here.
 */
export default function FacultyReports() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.getFacultyStudents().then(setStudents);
  }, []);

  // Group by subject and average the pct — simple client-side aggregation.
  const bySubject = {};
  students.forEach((s) => {
    if (!bySubject[s.subject]) bySubject[s.subject] = [];
    bySubject[s.subject].push(s.pct);
  });
  const subjectAverages = Object.entries(bySubject).map(([subject, pcts]) => ({
    subject,
    avg: (pcts.reduce((a, b) => a + b, 0) / pcts.length).toFixed(1),
    count: pcts.length,
  }));

  const belowThreshold = students.filter((s) => s.pct < 75);

  /**
   * TODO(backend): generate a real CSV/PDF server-side (or client-side with
   * a library) — this is a placeholder that just downloads what's already
   * on screen as CSV text, to demonstrate the button working end-to-end.
   */
  function exportCsv() {
    const rows = [["Subject", "Average %", "Student count"], ...subjectAverages.map((s) => [s.subject, s.avg, s.count])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Reports"
        sub="Subject-wise summary"
        basePath="/faculty"
        who={user?.name}
        unreadCount={1}
        right={
          <button
            onClick={exportCsv}
            className="font-mono text-[11.5px] border border-rule rounded-[3px] px-3.5 py-2 hover:border-ink/40 transition-colors focus-ring"
          >
            Export CSV
          </button>
        }
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Subject averages" sub="Mean attendance % across your roster">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
                <th className="py-2">Subject</th>
                <th className="py-2">Students</th>
                <th className="py-2 text-right">Average</th>
              </tr>
            </thead>
            <tbody>
              {subjectAverages.map((s) => (
                <tr key={s.subject} className="border-b border-rule/70 last:border-0">
                  <td className="py-2.5">{s.subject}</td>
                  <td className="py-2.5 text-muted">{s.count}</td>
                  <td className="py-2.5 text-right font-mono">{s.avg}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Below 75% threshold" sub="Students at exam-eligibility risk">
          {belowThreshold.length === 0 ? (
            <div className="text-[13px] text-muted py-4">No students currently below threshold.</div>
          ) : (
            belowThreshold.map((s) => (
              <div key={`${s.id}-${s.subject}`} className="flex justify-between py-2.5 border-b border-rule/70 last:border-0 text-[13px]">
                <span>{s.name} <span className="text-muted">· {s.subject}</span></span>
                <span className="font-mono text-stamp-red">{s.pct}%</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
