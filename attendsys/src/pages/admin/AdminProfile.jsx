import Topbar from "../../components/Topbar.jsx";
import ProfileView from "../../components/ProfileView.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminProfile — "/admin/profile"
 *
 * Shows the logged-in admin's account details from the login response
 * (AuthContext) — there's no separate "admin profile" collection beyond the
 * `users` document itself.
 */
export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <>
      <Topbar title="My profile" sub="Account details" basePath="/admin" unreadCount={0} />

      <ProfileView
        initial={user?.name?.[0] ?? "?"}
        name={user?.name}
        roleLabel="System administrator"
        rows={[
          { label: "Email", value: user?.email },
          { label: "Role", value: user?.role },
        ]}
      />
    </>
  );
}
