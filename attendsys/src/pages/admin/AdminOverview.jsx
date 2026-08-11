import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * AdminOverview — "/admin" (index route).
 *
 * DATA FLOW:
 *   api.getAdminStats()  -> GET /api/admin/stats/overview
 *   api.getAdminReport() -> GET /api/admin/reports/overview
 *
 * CHANGES PER REQUEST:
 *   - "Devices online" stat + the whole "Device status" card are gone —
 *     this system doesn't track camera/device hardware info, so
 *     api.getDevices() is no longer called here (or anywhere).
 *   - The "Enrollment queue" preview card is gone too. In its place: a
 *     7-day attendance trend + subject averages snapshot (same data the
 *     full Admin > Reports page uses), which is more immediately useful
 *     on a landing/overview screen than a queue you can already see in
 *     full on the Enrollment page.
 */
export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.getAdminStats().then(setStats);
    api.getAdminReport().then(setReport);
  }, []);

  const STAT_LABELS = stats && report && [
    ["Enrolled students", stats.enrolledStudents],
    ["Scans today", stats.scansToday],
    ["Avg. match confidence", `${stats.avgConfidence}%`],
    ["Below 75% attendance", report.lowAttendanceCount],
  ];

  const maxTrend = report ? Math.max(...report.weeklyAttendanceTrend) : 1;

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
          <Card title="Weekly attendance trend" sub="% present, last 7 days">
            <div className="flex items-end gap-3 h-[120px]">
              {report.weeklyAttendanceTrend.map((pct, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-stamp-green/80 rounded-t-[2px]"
                    style={{ height: `${(pct / maxTrend) * 90}px` }}
                    title={`${pct}%`}
                  />
                  <span className="font-mono text-[10px] text-muted">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Subject averages" sub="Campus-wide, this semester">
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
