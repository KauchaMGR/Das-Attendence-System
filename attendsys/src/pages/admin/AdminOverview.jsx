import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminOverview — "/admin" (index route).
 *
 * DATA FLOW: api.getAdminReport() -> GET /attendance/report/overview?days=
 * — one real call for everything on this page (enrolled students, scans
 * today, avg. match confidence, the trend, subject averages, and the
 * below-75% count). See DOCUMENTATION.md §8.
 *
 * Trend bars are one per school day that actually held a class in the
 * window — weekend days are never plotted (see the ground rule in §8), so
 * day labels come from the real dates returned, not a fixed Mon–Sun array.
 */
export default function AdminOverview() {
  const { user, settings } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.getAdminReport(settings.historyDays).then(setReport);
  }, [settings.historyDays]);

  const STAT_LABELS = report && [
    ["Enrolled students", report.enrolledStudents],
    ["Scans today", report.scansToday],
    ["Avg. match confidence", `${report.avgConfidence}%`],
    ["Below 75% attendance", report.lowAttendanceCount],
  ];

  const maxTrend = report ? Math.max(1, ...report.dailyTrend.map((d) => d.pct)) : 1;

  return (
    <>
      <Topbar
        title="System overview"
        sub="NCIT · Balkumari Campus"
        basePath="/admin"
        unreadCount={2}
        right={<StatusStamp status="present">All systems operational</StatusStamp>}
      />

      <div className="grid md:grid-cols-4 gap-5 mb-5">
        {STAT_LABELS?.map(([label, value]) => (
          <Card key={label}>
            <div className="font-mono text-[10.5px] text-muted uppercase tracking-wide">{label}</div>
            <div className="font-display font-bold text-[28px] mt-2">{value}</div>
          </Card>
        ))}
      </div>

      {report && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="Attendance trend" sub={`% present, last ${report.days} days (Sat/Sun excluded)`}>
            {report.dailyTrend.length === 0 ? (
              <div className="text-[13px] text-muted py-6 text-center">No capture sessions in this window yet.</div>
            ) : (
              <div className="flex items-end gap-3 h-[120px]">
                {report.dailyTrend.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-stamp-green/80 rounded-t-[2px]"
                      style={{ height: `${(d.pct / maxTrend) * 90}px` }}
                      title={`${d.pct}%`}
                    />
                    <span className="font-mono text-[10px] text-muted">{d.dayLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Subject averages" sub={`Last ${report.days} days`}>
            {report.subjectAverages.map((s) => (
              <div key={s.subject} className="flex justify-between py-2 border-b border-rule/70 last:border-0 text-[13px]">
                <span>{s.subject}</span>
                <span className={`font-mono ${s.avg < 75 ? "text-stamp-red" : "text-ink"}`}>{s.avg}%</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </>
  );
}
