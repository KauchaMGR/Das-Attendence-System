import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import Heatmap from "../../components/Heatmap.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { greeting } from "../../utils/time.js";

/**
 * StudentOverview — "/student" (index route).
 *
 * DATA FLOW: same three calls as before —
 *   api.getStudentProfile()  -> GET /attendance/student/{id}/summary
 *   api.getStudentSubjects() -> same summary, reshaped as a subject table
 *   api.getStudentHeatmap()  -> same summary, bucketed into the last
 *                                `historyDays` calendar days
 *
 * CHANGES IN THIS PASS (see DOCUMENTATION.md §8):
 *   - Greeting is now computed from the viewer's local clock instead of a
 *     hardcoded "Good afternoon".
 *   - "This semester" card removed per request; "Low-attendance check" is
 *     now genuinely computed from `subjects` instead of hardcoded copy.
 *   - "Last recognized scan" time goes through api.js's parseServerDate fix
 *     (was silently showing UTC as if it were local time).
 *   - "Last 14 days" heatmap now marks Sat/Sun as a distinct "holiday" cell
 *     and shows a present/absent/holiday summary line underneath, using the
 *     admin-configured `historyDays` setting instead of a hardcoded 14.
 */
export default function StudentOverview() {
  const { user, settings } = useAuth();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [heatmap, setHeatmap] = useState(null);

  useEffect(() => {
    if (!user?.studentId) return;
    api.getStudentProfile(user.studentId, user.name).then(setStudent);
    api.getStudentSubjects(user.studentId).then(setSubjects);
    api.getStudentHeatmap(user.studentId, settings.historyDays).then(setHeatmap);
  }, [user?.studentId, settings.historyDays]);

  const lowSubjects = subjects.filter((s) => s.pct < 75);

  return (
    <>
      <Topbar
        title={`${greeting()}, ${(user?.name ?? student?.name ?? "").split(" ")[0]}`}
        sub={student ? "Your attendance at a glance" : ""}
        basePath="/student"
        unreadCount={2} // TODO(backend): replace with a real unread count from api.getStudentNotifications()
        right={
          student && (
            <StatusStamp status="present">
              Marked present · {student.lastScan.time}
            </StatusStamp>
          )
        }
      />

      {!student ? (
        <div className="text-muted text-sm">Loading…</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Card title="Last recognized scan" sub="Most recent recognition event">
              <table className="w-full text-[13px]">
                <tbody>
                  <tr className="border-b border-rule/70">
                    <td className="py-2 font-mono text-muted">Confidence</td>
                    <td className="py-2 text-right">{student.lastScan.confidence != null ? `${student.lastScan.confidence}%` : "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-muted">Time</td>
                    <td className="py-2 text-right">{student.lastScan.time}</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card title="Low-attendance check" sub="Threshold for exam eligibility">
              {lowSubjects.length === 0 ? (
                <p className="text-[13px] text-ink2/80 leading-relaxed">
                  You're clear of the 75% threshold in every subject this semester.
                </p>
              ) : (
                <div className="space-y-2 text-[13px]">
                  {lowSubjects.map((s) => (
                    <div key={s.name} className="flex justify-between">
                      <span>{s.name}</span>
                      <span className="font-mono text-stamp-red">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Card title="Subject-wise attendance" sub="Semester to date">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left font-mono text-[10.5px] text-muted uppercase tracking-wide border-b border-rule">
                    <th className="py-2">Subject</th>
                    <th className="py-2">Held</th>
                    <th className="py-2">Attended</th>
                    <th className="py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.name} className="border-b border-rule/70 last:border-0">
                      <td className="py-2.5">{s.name}</td>
                      <td className="py-2.5">{s.held}</td>
                      <td className="py-2.5">{s.attended}</td>
                      <td className="py-2.5">{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card title={`Last ${settings.historyDays} days`} sub="Daily presence">
              {heatmap && (
                <>
                  <Heatmap days={heatmap.days} />
                  <div className="flex gap-4 mt-4 font-mono text-[10.5px] text-muted flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px] bg-stamp-green" />Present</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px] bg-paper2" />Absent</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px]" style={{ background: "#C9C4B6" }} />Holiday (Sat/Sun)</span>
                  </div>
                  <p className="text-[12px] text-muted mt-3">
                    {heatmap.present} present · {heatmap.absent} absent · {heatmap.holiday} holiday(s) —
                    last {settings.historyDays} days. Saturdays/Sundays are excluded from the absent count.
                  </p>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
