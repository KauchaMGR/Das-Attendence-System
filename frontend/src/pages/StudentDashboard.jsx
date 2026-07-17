/*
  StudentDashboard.jsx is the student-facing homepage after login.
  It loads the student's profile, enrolled subjects, and recent attendance heatmap,
  then renders summary cards for status and attendance data.
*/
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import Card from "../components/Card.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import Ring from "../components/Ring.jsx";
import Heatmap from "../components/Heatmap.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function StudentDashboard() {
  // Get the current logged-in user from auth context.
  const { user } = useAuth();

  // Local state for student dashboard data.
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    // Load student data once when the component mounts.
    api.getStudentProfile().then(setStudent);
    api.getStudentSubjects().then(setSubjects);
    api.getStudentHeatmap().then(setHeatmap);
  }, []);

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar navigation for the student portal */}
      <Sidebar
        roleLabel="Student"
        items={["Dashboard", "Attendance History", "Notifications", "My Profile"]}
        activeIndex={0}
        who={user?.name ?? student?.name}
        whoSub={student ? `ROLL ${student.roll} · ${student.program}` : ""}
      />

      <main className="flex-1 p-8 max-w-[1180px]">
        {/* Topbar greeting and current status */}
        <Topbar
          title={`Good afternoon, ${(user?.name ?? student?.name ?? "").split(" ")[0]}`}
          sub={student ? `${student.program}` : ""}
          right={
            student && (
              <StatusStamp status="present">
                Marked present · {student.lastScan.time}
              </StatusStamp>
            )
          }
        />

        {/* Show a loading message until the student profile is ready */}
        {!student ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : (
          <>
            {/* Top summary row: overall attendance, last scan details, eligibility note */}
            <div className="grid md:grid-cols-3 gap-5 mb-5">
              <Card title="This semester" sub="Overall standing across all enrolled subjects">
                <div className="flex items-center gap-5">
                  {/* Visual ring chart for overall attendance percent */}
                  <Ring percent={student.overallPercent} />
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-[2px] bg-stamp-green" />Present — {student.present} days
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-[2px] bg-stamp-amber" />Late — {student.late} days
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-[2px] bg-paper2" />Absent — {student.absent} days
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Last recognized scan" sub="Most recent recognition event">
                <table className="w-full text-[13px]">
                  <tbody>
                    <tr className="border-b border-rule/70">
                      <td className="py-2 font-mono text-muted">Camera</td>
                      <td className="py-2 text-right">{student.lastScan.camera}</td>
                    </tr>
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
                <p className="text-[13px] text-ink2/80 leading-relaxed">
                  You&apos;re clear of the 75% threshold in every subject this semester. Database Systems is your closest — keep it above 75% to stay exam-eligible.
                </p>
              </Card>
            </div>

            {/* Bottom row: per-subject attendance and recent daily heatmap */}
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
                {/* Heatmap uses the `heatmap` array to render colored squares */}
                <Heatmap days={heatmap} />
                <div className="flex gap-4 mt-4 font-mono text-[10.5px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-stamp-green" />Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-stamp-amber" />Late
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-paper2" />Absent
                  </span>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
