'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { X, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/hooks/useNotifications';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getRemainingTime(endTime: Date, now: Date) {
  const diff = endTime.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes,
    seconds,
    isWarning: minutes < 15,
    isExpired: totalSeconds === 0
  };
}

export function GlobalAlerts() {
  const { data: stations } = useSWR('/api/stations', fetcher, { refreshInterval: 30000 });
  const { addNotification } = useNotifications();
  const [alertModal, setAlertModal] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
  const alertedStations = useRef<Set<number>>(new Set());
  const [now, setNow] = useState(new Date());

  // Web Audio Beeper
  const playAlertSound = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!stations) return;

    stations.forEach((st: any) => {
      if (st.status === 'Occupied' && st.session?.endTime) {
        const td = getRemainingTime(new Date(st.session.endTime), now);
        // Trigger exactly when entering the 14-min range (14:50 to 14:59)
        // or if we haven't alerted yet and it's less than 15 mins
        if (td.isWarning && !td.isExpired && !alertedStations.current.has(st.id) && td.minutes === 14) {
          alertedStations.current.add(st.id);
          playAlertSound();
          setAlertModal({ open: true, name: st.name });
          addNotification({ 
            type: 'warning', 
            title: '⏰ 15 MIN ALERT', 
            message: `${st.name} session ending soon.` 
          });
        }
        
        // Reset alert if station becomes free or gets extended
        if (!td.isWarning) {
          alertedStations.current.delete(st.id);
        }
      } else {
        alertedStations.current.delete(st.id);
      }
    });
  }, [stations, now, addNotification]);

  if (!alertModal.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0a0a1a] border-2 border-[#ffea00] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(255,234,0,0.3)] animate-in zoom-in duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#ffea00] blur-xl opacity-20 animate-pulse" />
            <div className="relative bg-[#ffea00]/10 p-5 rounded-full border-2 border-[#ffea00]/30">
               <Bell className="w-12 h-12 text-[#ffea00] animate-bounce" />
            </div>
          </div>
          
          <div>
            <h2 className="font-orbitron text-[#ffea00] text-2xl font-black tracking-tighter mb-2">15 MIN WARNING</h2>
            <p className="font-mono text-gray-400 text-sm">Station <span className="text-white font-bold">{alertModal.name}</span> is approaching checkout.</p>
          </div>

          <Button 
            onClick={() => setAlertModal({ open: false, name: '' })}
            className="w-full bg-[#ffea00] hover:bg-white text-black font-pixel text-xs py-6 border-none"
          >
            ACKNOWLEDGE
          </Button>
        </div>
      </div>
    </div>
  );
}
