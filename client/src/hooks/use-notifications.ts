import * as React from "react";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: "trip" | "collaboration" | "weather" | "system";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const STORAGE_KEY = "movomatic.notifications";

const listeners = new Set<(notifications: AppNotification[]) => void>();
let memoryNotifications: AppNotification[] = loadNotifications();

function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load notifications:", error);
    return [];
  }
}

function persistNotifications(notifications: AppNotification[]) {
  memoryNotifications = notifications;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.warn("Failed to persist notifications:", error);
    }
  }

  listeners.forEach((listener) => listener(notifications));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function notify(notification: Omit<AppNotification, "id" | "isRead" | "createdAt">) {
  const nextNotification: AppNotification = {
    ...notification,
    id: genId(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  persistNotifications([nextNotification, ...memoryNotifications]);
  return nextNotification;
}

export function markNotificationAsRead(id: string) {
  persistNotifications(
    memoryNotifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    )
  );
}

export function markAllNotificationsAsRead() {
  persistNotifications(memoryNotifications.map((notification) => ({ ...notification, isRead: true })));
}

export function clearNotifications() {
  persistNotifications([]);
}

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>(memoryNotifications);

  React.useEffect(() => {
    const listener = (nextNotifications: AppNotification[]) => setNotifications(nextNotifications);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
    notify,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  };
}
