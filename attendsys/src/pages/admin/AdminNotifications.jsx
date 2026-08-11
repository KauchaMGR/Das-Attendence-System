import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import NotificationList from "../../components/NotificationList.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminNotifications — "/admin/notifications"
 * Maps to: GET /api/admin/notifications
 */
export default function AdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getAdminNotifications().then(setNotifications);
  }, []);

  function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    // TODO(backend): PATCH /api/admin/notifications/:id — add an api.js
    // function for this the same way markNotificationRead() was added for students.
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Topbar title="Notifications" sub={`${unreadCount} unread`} basePath="/admin" who={user?.name} unreadCount={unreadCount} />
      <Card>
        <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      </Card>
    </>
  );
}
