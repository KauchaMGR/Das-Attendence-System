import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute — wraps a page component and redirects to /login if:
 *   - nobody is logged in (`user` is null), OR
 *   - the logged-in user's role doesn't match the `role` this route requires
 *
 * Usage (see App.jsx):
 *   <Route path="/student" element={
 *     <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
 *   } />
 *
 * TODO(backend): once real JWTs exist, this same logic still works as-is —
 * `user.role` will just be coming from a decoded token instead of the demo
 * login screen. You may also want to add a loading state here for the
 * moment between "app just loaded" and "we've confirmed the token is valid".
 */
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}
