import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Orbitron, Press_Start_2P, Share_Tech_Mono } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { NotificationProvider } from '@/lib/hooks/useNotifications';

export const metadata: Metadata = {
  title: 'Terminal 8 Admin | Gaming Hub Ecosystem',
  description: 'Fun | Friendship | Laughter | Games'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const pressStart2P = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${pressStart2P.variable} ${shareTechMono.variable}`}>
      <body className="min-h-[100dvh] bg-[#050510] text-[#e0e0ff] font-mono">
        <SWRConfig value={{ fallback: { '/api/user': getUser(), '/api/team': getTeamForUser() } }}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
/* Build Sync Check Sat May 16 15:56:04 IST 2026 */
