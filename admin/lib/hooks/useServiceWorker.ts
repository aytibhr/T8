'use client';

import { useEffect } from 'react';

/**
 * Registers the Terminal 8 Service Worker and requests
 * browser notification permission so alerts work system-wide,
 * even when the admin is on a different website.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // 1. Register the SW
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[T8] Service Worker registered:', registration.scope);

        // 2. Send a keepalive ping every 25 seconds to prevent SW sleep
        const keepAlive = setInterval(() => {
          registration.active?.postMessage('PING');
        }, 25000);

        return () => clearInterval(keepAlive);
      })
      .catch((err) => {
        console.warn('[T8] SW registration failed:', err);
      });

    // 3. Request notification permission (only asks once, browser remembers)
    if ('Notification' in window && Notification.permission === 'default') {
      // Slight delay so we don't prompt on first paint
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log('[T8] Notification permission:', permission);
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);
}
