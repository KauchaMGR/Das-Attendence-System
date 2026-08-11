import LoginForm from "../../components/LoginForm.jsx";

/**
 * StudentLogin — "/login/student"
 * Thin wrapper around the shared <LoginForm>, just supplying the role-
 * specific copy, icon, and redirect target.
 */
export default function StudentLogin() {
  return (
    <LoginForm
      role="student"
      roleLabel="Student"
      demoName="Sittal Pantha"
      redirectTo="/student"
      accentClass="bg-stamp-green/10 border border-stamp-green/30 text-stamp-green"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
        </svg>
      }
    />
  );
}
