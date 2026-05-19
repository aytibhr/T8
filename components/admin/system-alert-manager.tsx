'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { WA_TEMPLATES, formatWhatsAppLink } from '@/lib/utils/whatsapp';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function SystemAlertManager() {
  const { addNotification } = useNotifications();
  const { data: alerts } = useSWR('/api/system-alerts', fetcher, { refreshInterval: 60000 }); // Every minute
  const processedAlerts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!alerts) return;

    // 1. Handle Expiry Alerts
    alerts.expiring.forEach((a: any) => {
      if (processedAlerts.current.has(a.id)) return;
      processedAlerts.current.add(a.id);

      const waMsg = WA_TEMPLATES.EXPIRY_REMINDER({
        name: a.member.name,
        daysLeft: a.daysLeft,
        expiryDate: new Date(a.member.validUntil).toLocaleDateString()
      });

      addNotification({
        type: 'warning',
        title: a.daysLeft === 0 ? '⚠️ PLAN EXPIRED TODAY' : `⏳ PLAN EXPIRING IN ${a.daysLeft} DAYS`,
        message: `${a.member.name}'s membership is almost over. Click to notify via WhatsApp.`,
        waLink: formatWhatsAppLink(a.member.phone, waMsg)
      });
    });

    // 2. Handle Low Coin Alerts
    alerts.lowCoins.forEach((a: any) => {
      if (processedAlerts.current.has(a.id)) return;
      processedAlerts.current.add(a.id);

      const waMsg = WA_TEMPLATES.LOW_COINS({
        name: a.member.name,
        balance: a.member.coinsBalance
      });

      addNotification({
        type: 'error',
        title: '🪫 LOW COIN ALERT',
        message: `${a.member.name} has only ${a.member.coinsBalance} coins left. Notify them!`,
        waLink: formatWhatsAppLink(a.member.phone, waMsg)
      });
    });
  }, [alerts, addNotification]);

  return null;
}
