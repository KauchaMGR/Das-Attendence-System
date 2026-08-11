import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminReports — "/admin/reports"
 *
 * Same real call as AdminOverview (api.getAdminReport()), just presented in
 * more detail. CSV export includes the trend rows and states the window
 * explicitly, so exported data always matches what's on screen.
 * Maps to: GET /attendance/report/overview?days= -> api.getAdminReport()
 */
export default function AdminReports() {
  const { user, settings } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.getAdminReport(settings.historyDays).then(setReport);
  }, [settings.historyDays]);

  function exportCsv() {
    if (!report) return;
    const rows = [
      [`Window: last ${report.days} days, Sat/Sun excluded`],
      [],
      ["Date", "Day", "% present"],
      ...report.dailyTrend.map((d) => [d.date, d.dayLabel, d.pct]),
      [],
      ["Subject", "Average %"],
      ...report.subjectAverages.map((s) => [s.subject, s.avg]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campus-attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!report) {
    return (
      <>
        <Topbar title="Reports" basePath="/admin" who={user?.name} />
        <div className="text-muted text-sm">Loading…</div>
      </>
    );
  }

  const maxTrend = Math.max(1, ...report.dailyTrend.map((d) => d.pct));

  return (
    <>
      <Topbar
        title="Reports"
        sub={`Campus-wide · last ${report.days} days · Sat/Sun excluded`}
        basePath="/admin"
        who={user?.name}
        unreadCount={2}
        right={
          <button onClick={exportCsv} className="font-mono text-[11.5px] border border-rule rounded-[3px] px-3.5 py-2 hover:border-ink/40 transition-colors focus-ring">
            Export CSV
          </button>
        }
      />

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <Card title="Attendance trend" sub={`% present, last ${report.days} days`}>
          {report.dailyTrend.length === 0 ? (
            <div className="text-[13px] text-muted py-6 text-center">No capture sessions in this window yet.</div>
          ) : (
            <div className="flex items-end gap-3 h-[140px]">
              {report.dailyTrend.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-stamp-green/80 rounded-t-[2px]"
                    style={{ height: `${(d.pct / maxTrend) * 110}px` }}
                    title={`${d.pct}%`}
                  />
                  <span className="font-mono text-[10px] text-muted">{d.dayLabel}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="At a glance">
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-rule/70">
                <td className="py-2.5 font-mono text-muted">Students below 75%</td>
                <td className="py-2.5 text-right text-stamp-red font-semibold">{report.lowAttendanceCount}</td>
              </tr>
              <tr className="border-b border-rule/70">
                <td className="py-2.5 font-mono text-muted">Best-performing subject</td>
                <td className="py-2.5 text-right">
                  {[...report.subjectAverages].sort((a, b) => b.avg - a.avg)[0]?.subject ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-muted">Scans today</td>
                <td className="py-2.5 text-right">{report.scansToday}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Subject averages" sub={`Campus-wide · last ${report.days} days`}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
              <th className="py-2">Subject</th>
              <th className="py-2 text-right">Average</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectAverages.map((s) => (
              <tr key={s.subject} className="border-b border-rule/70 last:border-0">
                <td className="py-2.5">{s.subject}</td>
                <td className="py-2.5 text-right font-mono">{s.avg}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
