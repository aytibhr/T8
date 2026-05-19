'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type Notification = {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string; // ISO string for JSON serialization
  read: boolean;
  waLink?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: number;
};

const STORAGE_KEY = 't8_notifications';

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  markAllRead: () => {},
  clearAll: () => {},
  unreadCount: 0,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Notification[] = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (_) {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications, hydrated]);

  // Sync across tabs using BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('t8_notifications_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'SYNC') {
        setNotifications(event.data.notifications);
      }
    };
    return () => channel.close();
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const isDuplicate = prev.some(
        p => p.title === newNotif.title && p.message === newNotif.message &&
          (Date.now() - new Date(p.timestamp).getTime()) < 60000
      );
      if (isDuplicate) return prev;
      const updated = [newNotif, ...prev].slice(0, 50);
      new BroadcastChannel('t8_notifications_sync').postMessage({ type: 'SYNC', notifications: updated });
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      new BroadcastChannel('t8_notifications_sync').postMessage({ type: 'SYNC', notifications: updated });
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    new BroadcastChannel('t8_notifications_sync').postMessage({ type: 'SYNC', notifications: [] });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
