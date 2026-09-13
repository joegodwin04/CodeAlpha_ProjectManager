import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket, joinUserRoom, leaveUserRoom } from '../services/socket';

/**
 * useNotifications
 * Fetches notifications on mount, listens for real-time `notification` events
 * on the user-specific Socket.IO room, and exposes actions.
 *
 * @param {string|null} userId – The authenticated user's id
 */
const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch from REST API ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('[Notifications] Failed to fetch', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Join user room + listen for real-time events ─────────────────────────
  useEffect(() => {
    if (!userId) return;

    joinUserRoom(userId);
    const socket = getSocket();

    const onNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
      leaveUserRoom(userId);
    };
  }, [userId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[Notifications] Failed to mark as read', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const prev = notifications;
    setNotifications((ns) => ns.filter((n) => n.id !== id));
    setUnreadCount((count) => {
      const target = prev.find((n) => n.id === id);
      return target && !target.read ? Math.max(0, count - 1) : count;
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('[Notifications] Failed to delete', err);
      setNotifications(prev); // restore on failure
    }
  }, [notifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification };
};

export default useNotifications;
