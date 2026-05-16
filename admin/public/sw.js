// Terminal 8 - Background Service Worker
// Polls station data and shows OS-level notifications even when admin is on another website

const STATION_POLL_INTERVAL = 30000; // 30 seconds
const ALERT_POLL_INTERVAL = 120000;  // 2 minutes for system alerts

const alerted15Min = new Set();
const alertedSystem = new Set();

// --- Helpers ---
function getRemainingMinutes(endTime) {
  return (new Date(endTime).getTime() - Date.now()) / 60000;
}

async function showBrowserNotification(title, body, tag, requireInteraction = false) {
  // Check if any window is already focused
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  const isFocused = clientList.some(client => client.focused);
  
  // Only show OS notification if the app is NOT focused
  if (isFocused) return;

  return self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag,
    requireInteraction,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    silent: false,
  });
}

// --- Station 15-min Check ---
async function checkStations() {
  try {
    const res = await fetch('/api/stations', { credentials: 'include' });
    if (!res.ok) return;
    const stations = await res.json();

    for (const st of stations) {
      if (st.status !== 'Occupied' || !st.session?.endTime) {
        alerted15Min.delete(st.id);
        continue;
      }

      const minsLeft = getRemainingMinutes(st.session.endTime);

      // Alert when between 0 and 15 mins remaining
      if (minsLeft > 0 && minsLeft <= 15 && !alerted15Min.has(st.id)) {
        alerted15Min.add(st.id);
        await showBrowserNotification(
          'TERMINAL 8 — TIME ALERT',
          `${st.name}: ${Math.ceil(minsLeft)} mins remaining! Time to check out soon.`,
          `alert-15-${st.id}`,
          true // requireInteraction — stays on screen until dismissed
        );
      }

      // Reset if time is back above 15 (session extended)
      if (minsLeft > 15) {
        alerted15Min.delete(st.id);
      }
    }
  } catch {
    // Network error, ignore silently
  }
}

// --- System Alerts Check (expiry & low coins) ---
async function checkSystemAlerts() {
  try {
    const res = await fetch('/api/system-alerts', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();

    for (const alert of (data.expiring || [])) {
      if (alertedSystem.has(alert.id)) continue;
      alertedSystem.add(alert.id);
      const label = alert.daysLeft === 0 ? 'EXPIRED TODAY' : `Expiring in ${alert.daysLeft} day(s)`;
      await showBrowserNotification(
        `TERMINAL 8 — MEMBERSHIP ALERT`,
        `${alert.member.name}: ${label}. Open dashboard to take action.`,
        `exp-${alert.id}`
      );
    }

    for (const alert of (data.lowCoins || [])) {
      if (alertedSystem.has(alert.id)) continue;
      alertedSystem.add(alert.id);
      await showBrowserNotification(
        `TERMINAL 8 — LOW COINS ALERT`,
        `${alert.member.name} has only ${alert.member.coinsBalance} coins remaining.`,
        `low-${alert.id}`
      );
    }
  } catch {
    // Network error, ignore silently
  }
}

// --- Polling Loop ---
let stationTimer = null;
let systemTimer = null;

function startPolling() {
  // Initial immediate check
  checkStations();
  checkSystemAlerts();

  // Recurring checks
  stationTimer = setInterval(checkStations, STATION_POLL_INTERVAL);
  systemTimer = setInterval(checkSystemAlerts, ALERT_POLL_INTERVAL);
}

function stopPolling() {
  if (stationTimer) clearInterval(stationTimer);
  if (systemTimer) clearInterval(systemTimer);
}

// --- Service Worker Lifecycle ---
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  startPolling();
});

// --- Messages from the main app ---
self.addEventListener('message', (event) => {
  if (event.data === 'CHECK_NOW') {
    checkStations();
    checkSystemAlerts();
  }
  if (event.data === 'PING') {
    // Keepalive ping from the app — reply so the app knows SW is alive
    event.source?.postMessage('PONG');
  }
});

// --- Clicking a notification focuses the dashboard ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If dashboard tab already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab to dashboard
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
