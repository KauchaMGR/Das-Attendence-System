/*
  App.jsx is the top-level React component that defines the client-side routes
  for the entire attendance system frontend.
*/
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    /*
      <Routes> is the container for all route definitions.
      React Router uses it to match the current URL and render the correct page.
    */
    <Routes>
      {/* Public route: landing page at the root URL */}
      <Route path="/" element={<Landing />} />

      {/* Public route: login page for all users */}
      <Route path="/login" element={<Login />} />

      {/*
        Protected routes: these pages are only accessible if the current user has
        the required role. The ProtectedRoute component wraps the page content.
      */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
