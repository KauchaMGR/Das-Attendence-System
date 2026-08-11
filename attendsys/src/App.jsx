import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import RoleSelect from "./pages/auth/RoleSelect.jsx";
import StudentLogin from "./pages/auth/StudentLogin.jsx";
import FacultyLogin from "./pages/auth/FacultyLogin.jsx";
import AdminLogin from "./pages/auth/AdminLogin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleLayout from "./layouts/RoleLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
 
// Student pages
import StudentOverview from "./pages/student/StudentOverview.jsx";
import StudentHistory from "./pages/student/StudentHistory.jsx";
import StudentNotifications from "./pages/student/StudentNotifications.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";

// Faculty pages
import FacultyLiveSession from "./pages/faculty/FacultyLiveSession.jsx";
import FacultyRecords from "./pages/faculty/FacultyRecords.jsx";
import FacultyStudents from "./pages/faculty/FacultyStudents.jsx";
import FacultyReports from "./pages/faculty/FacultyReports.jsx";
import FacultyNotifications from "./pages/faculty/FacultyNotifications.jsx";
import FacultyProfile from "./pages/faculty/FacultyProfile.jsx";

// Admin pages
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminEnrollment from "./pages/admin/AdminEnrollment.jsx";
import AdminFaculty from "./pages/admin/AdminFaculty.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminSubjects from "./pages/admin/AdminSubjects.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";


/**
 * ============================================================================
 * App — top-level route table.
 * ============================================================================
 * "/" (Landing) and "/login" are public. Every role below is a NESTED route
 * tree: a <ProtectedRoute> guards a <RoleLayout> (which renders the Sidebar
 * once + an <Outlet/>), and each sidebar item is a real child route inside
 * it.
 *
 * Every role has a /profile route (StudentProfile / FacultyProfile /
 * AdminProfile) — reachable from Topbar's avatar button and Sidebar's
 * bottom who-am-I block (see components/Topbar.jsx and components/Sidebar.jsx).
 *
 * ROUTE MAP:
 *   /login                  -> RoleSelect (choose Student/Faculty/Admin)
 *   /login/student           -> StudentLogin
 *   /login/faculty           -> FacultyLogin
 *   /login/admin             -> AdminLogin
 *
 *   /student              -> StudentOverview   (index)
 *   /student/history      -> StudentHistory
 *   /student/notifications -> StudentNotifications
 *   /student/profile      -> StudentProfile
 *
 *   /faculty               -> FacultyLiveSession (index)
 *   /faculty/records       -> FacultyRecords
 *   /faculty/students      -> FacultyStudents
 *   /faculty/reports       -> FacultyReports
 *   /faculty/notifications -> FacultyNotifications
 *   /faculty/profile       -> FacultyProfile
 *
 *   /admin                 -> AdminOverview (index)
 *   /admin/enrollment      -> AdminEnrollment
 *   /admin/faculty         -> AdminFaculty
 *   /admin/users           -> AdminUsers
 *   /admin/subjects        -> AdminSubjects
 *   /admin/reports         -> AdminReports
 *   /admin/settings        -> AdminSettings
 *   /admin/notifications   -> AdminNotifications
 *   /admin/profile         -> AdminProfile
 * ============================================================================
 */
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<RoleSelect />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/faculty" element={<FacultyLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      {/* ---------------- STUDENT ---------------- */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <RoleLayout
              roleLabel="Student"
              basePath="/student"
              who={user?.name}
              whoSub="Student account"
              items={[
                { label: "Dashboard", to: "" },
                { label: "Attendance History", to: "history" },
                { label: "Notifications", to: "notifications" },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentOverview />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* ---------------- FACULTY ---------------- */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <RoleLayout
              roleLabel="Faculty"
              basePath="/faculty"
              who={user?.name}
              whoSub="Faculty account"
              items={[
                { label: "Live Session", to: "" },
                { label: "Attendance Records", to: "records" },
                { label: "My Students", to: "students" },
                { label: "Reports", to: "reports" },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyLiveSession />} />
        <Route path="records" element={<FacultyRecords />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="reports" element={<FacultyReports />} />
        <Route path="notifications" element={<FacultyNotifications />} />
        <Route path="profile" element={<FacultyProfile />} />
      </Route>

      {/* ---------------- ADMIN ---------------- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <RoleLayout
              roleLabel="Admin"
              basePath="/admin"
              who={user?.name}
              whoSub="System administrator"
              items={[
                { label: "Overview", to: "" },
                { label: "Enrollment", to: "enrollment" },
                { label: "Faculty", to: "faculty" },
                { label: "Users", to: "users" },
                { label: "Subjects", to: "subjects" },
                { label: "Reports", to: "reports" },
                { label: "Settings", to: "settings" },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="enrollment" element={<AdminEnrollment />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}
