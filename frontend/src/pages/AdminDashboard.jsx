/*
  AdminDashboard.jsx shows the admin overview screen for the attendance system.
  It loads stats, device status, and pending enrollments, then renders them in a dashboard layout.
*/
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import Card from "../components/Card.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  // Get the current authenticated user from context.
  const { user } = useAuth();

  // Local state for dashboard data.
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Load the data when the component mounts once.
    api.getAdminStats().then(setStats);
    api.getDevices().then(setDevices);
    api.getEnrollmentQueue().then(setQueue);
  }, []);

  // Convert the stats object into an array of label/value pairs for rendering.
  const STAT_LABELS = stats && [
    ["Enrolled students", stats.enrolledStudents],
    ["Devices online", stats.devicesOnline],
    ["Scans today", stats.scansToday],
    ["Avg. match confidence", `${stats.avgConfidence}%`],
  ];

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar navigation for admin pages */}
      <Sidebar
        roleLabel="Admin"
        items={["Overview", "Enrollment", "Users", "Subjects", "Reports", "Settings"]}
        activeIndex={0}
        who={user?.name}
        whoSub="System administrator"
      />

      <main className="flex-1 p-8 max-w-[1180px]">
        {/* Topbar displays the page title and a status badge */}
        <Topbar
          title="System overview"
          sub="NCIT · Balkumari Campus"
          right={<StatusStamp status="present">All systems operational</StatusStamp>}
        />

        {/* Summary stats cards displayed in a grid */}
        <div className="grid md:grid-cols-4 gap-5 mb-5">
          {STAT_LABELS?.map(([label, value]) => (
            <Card key={label}>
              <div className="font-mono text-[10.5px] text-muted uppercase tracking-wide">{label}</div>
              <div className="font-display font-bold text-[28px] mt-2">{value}</div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Device status panel */}
          <Card title="Device status" sub="Cameras / capture points across campus">
            {devices.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between py-3 border-b border-rule/70 last:border-0"
              >
                <div>
                  <div className="text-[13.5px] font-semibold">{d.name}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">{d.meta}</div>
                </div>
                <StatusStamp status={d.online ? "present" : "neutral"}>
                  {d.online ? "Online" : "Offline"}
                </StatusStamp>
              </div>
            ))}
          </Card>

          {/* Enrollment queue panel */}
          <Card title="Enrollment queue" sub="New students pending face enrollment">
            {queue.map((q) => (
              <div
                key={q.name}
                className="flex items-center justify-between py-2.5 border-b border-rule/70 last:border-0 text-[13px]"
              >
                <span>
                  {q.name} · <span className="text-muted">{q.meta}</span>
                </span>
                <button className="font-mono text-[10.5px] border border-stamp-green text-stamp-green rounded-[3px] px-3 py-1.5 hover:bg-stamp-greenDim focus-ring">
                  Enroll
                </button>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  );
}
