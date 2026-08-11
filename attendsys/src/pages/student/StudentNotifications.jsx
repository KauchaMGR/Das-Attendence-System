import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import NotificationList from "../../components/NotificationList.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * StudentNotifications — "/student/notifications"
 *
 * Maps to: GET /api/students/me/notifications
 * Clicking an unread notification calls api.markNotificationRead(id) ->
 * PATCH /api/students/me/notifications/:id, then updates local state.
 */
export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getStudentNotifications().then(setNotifications);
  }, []);

  async function handleMarkRead(id) {
    // Optimistically update local state first, then persist. If the PATCH
    // fails in a real implementation, you'd want to roll this back —
    // omitted here for simplicity since the mock can't fail.
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await api.markNotificationRead(id);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Topbar
        title="Notifications"
        sub={`${unreadCount} unread`}
        basePath="/student"
        who={user?.name}
        unreadCount={unreadCount}
      />
      <Card>
        <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      </Card>
    </>
  );
}
