import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import Heatmap from "../../components/Heatmap.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * StudentOverview — "/student" (index route).
 *
 * DATA FLOW: same three calls as before —
 *   api.getStudentProfile()  -> GET /api/students/me
 *   api.getStudentSubjects() -> GET /api/students/me/subjects
 *   api.getStudentHeatmap()  -> GET /api/students/me/attendance
 *
 * RECENT CHANGES (per request):
 *   - "Late" removed as a tracked status — attendance is now just
 *     present/absent everywhere on this page (breakdown card + heatmap
 *     legend). `student.late` is no longer read or displayed. If your
 *     backend's `attendance_records.status` field still has a "late"
 *     value in MongoDB, either stop writing it, or bucket it into
 *     "present"/"absent" before it reaches the frontend.
 *   - "Camera" row removed from the "Last recognized scan" card — only
 *     confidence and time are shown now.
 */
export default function StudentOverview() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    if (!user?.studentId) return;
    api.getStudentProfile(user.studentId, user.name).then(setStudent);
    api.getStudentSubjects(user.studentId).then(setSubjects);
    api.getStudentHeatmap(user.studentId).then(setHeatmap);
  }, [user?.studentId]);

  return (
    <>
      <Topbar
        title={`Good afternoon, ${(user?.name ?? student?.name ?? "").split(" ")[0]}`}
        sub={student ? `${student.program}` : ""}
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
          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <Card title="This semester" sub="Overall standing across all enrolled subjects">
              {/* Present/Absent only — "Late" removed per request */}
              <div className="space-y-2 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-[2px] bg-stamp-green" />
                    Present
                  </span>
                  <b>{student.present} days</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-[2px] bg-paper2" />
                    Absent
                  </span>
                  <b>{student.absent} days</b>
                </div>
              </div>
            </Card>

            <Card title="Last recognized scan" sub="Most recent recognition event">
              {/* "Camera" row removed per request — confidence + time only */}
              <table className="w-full text-[13px]">
                <tbody>
                  <tr className="border-b border-rule/70">
                    <td className="py-2 font-mono text-muted">Confidence</td>
                    <td className="py-2 text-right">{student.lastScan.confidence}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-muted">Time</td>
                    <td className="py-2 text-right">{student.lastScan.time}</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card title="Low-attendance check" sub="Threshold for exam eligibility">
              {/* TODO(backend): compute this from `subjects` (flag pct < 75)
                  instead of the hardcoded message below once real data flows in. */}
              <p className="text-[13px] text-ink2/80 leading-relaxed">
                You're clear of the 75% threshold in every subject this
                semester. Database Systems is your closest — keep it above
                75% to stay exam-eligible.
              </p>
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

            <Card title="Last 14 days" sub="Daily presence">
              <Heatmap days={heatmap} />
              {/* "Late" removed from the legend — present/absent only */}
              <div className="flex gap-4 mt-4 font-mono text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px] bg-stamp-green" />Present</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px] bg-paper2" />Absent</span>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
