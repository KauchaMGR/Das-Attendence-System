/*
  ProtectedRoute.jsx guards routes so only authenticated users with the
  correct role can access certain pages.
*/
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  // If no user is signed in, redirect to login.
  if (!user) return <Navigate to="/login" replace />;

  // If this route requires a specific role and the user does not have it,
  // redirect to login as well.
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  // Otherwise render the protected page content.
  return children;
}
