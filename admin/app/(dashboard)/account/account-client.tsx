'use client';

import { useState, useActionState } from 'react';
import { updateAccount, updatePassword } from '@/app/(login)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, CheckCircle, XCircle } from 'lucide-react';

function Section({ title, icon: Icon, color, children }: any) {
  return (
    <div className="bg-[#0a0a1a] border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="font-orbitron text-white text-xl mb-6 flex items-center gap-2">
        <Icon className="w-5 h-5" style={{ color }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

export function AccountClient({ user }: { user: any }) {
  const [profileState, profileAction, profilePending] = useActionState(updateAccount, { name: '', success: '' } as any);
  const [passState, passAction, passPending] = useActionState(updatePassword, { success: '' } as any);

  return (
    <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">ACCOUNT</h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">Manage your profile and security settings.</p>
      </div>

      {/* Profile */}
      <Section title="PROFILE" icon={User} color="#00f3ff">
        <form action={profileAction} className="space-y-4 font-mono">
          <div>
            <label className="block text-[#00f3ff] text-xs mb-1">DISPLAY NAME</label>
            <Input name="name" defaultValue={user?.name || ''} className="bg-[#0f1026] border-gray-700 text-white" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-[#00f3ff] text-xs mb-1">EMAIL ADDRESS</label>
            <Input name="email" type="email" defaultValue={user?.email || ''} className="bg-[#0f1026] border-gray-700 text-white" />
          </div>
          {profileState?.error && <p className="text-[#ff00ea] text-xs flex items-center gap-1"><XCircle className="w-3 h-3" />{profileState.error}</p>}
          {profileState?.success && <p className="text-[#00ff55] text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{profileState.success}</p>}
          <Button type="submit" disabled={profilePending} className="bg-[#00f3ff] hover:bg-[#00e0e0] text-black font-pixel text-xs border-none">
            {profilePending ? 'SAVING...' : 'SAVE PROFILE'}
          </Button>
        </form>
      </Section>

      {/* Password */}
      <Section title="CHANGE PASSWORD" icon={Lock} color="#ff00ea">
        <form action={passAction} className="space-y-4 font-mono">
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1">CURRENT PASSWORD</label>
            <Input name="currentPassword" type="password" className="bg-[#0f1026] border-gray-700 text-white" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1">NEW PASSWORD</label>
            <Input name="newPassword" type="password" className="bg-[#0f1026] border-gray-700 text-white" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1">CONFIRM NEW PASSWORD</label>
            <Input name="confirmPassword" type="password" className="bg-[#0f1026] border-gray-700 text-white" placeholder="••••••••" />
          </div>
          {passState?.error && <p className="text-[#ff00ea] text-xs flex items-center gap-1"><XCircle className="w-3 h-3" />{passState.error}</p>}
          {passState?.success && <p className="text-[#00ff55] text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{passState.success}</p>}
          <Button type="submit" disabled={passPending} className="bg-[#ff00ea] hover:bg-[#cc00bb] text-white font-pixel text-xs border-none">
            {passPending ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </Button>
        </form>
      </Section>
    </main>
  );
}
