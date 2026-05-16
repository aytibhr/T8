'use client';

import { useActionState } from 'react';
import { inviteTeamMember } from '@/app/(login)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, PlusCircle } from 'lucide-react';

export function InviteTeamMember({ user }: { user: any }) {
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState(
    inviteTeamMember,
    { success: '' } as any
  );

  return (
    <form action={inviteAction} className="space-y-4">
      <div>
        <Label htmlFor="email" className="mb-2 text-[#00f3ff] font-mono text-xs">
          STAFF EMAIL
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="staff@terminal8.com"
          required
          disabled={!isOwner}
          className="bg-[#0f1026] border-gray-700 text-white font-mono mt-1"
        />
      </div>
      <div>
        <Label className="text-[#00f3ff] font-mono text-xs">ROLE</Label>
        <RadioGroup
          defaultValue="member"
          name="role"
          className="flex space-x-4 mt-2 text-white font-mono text-sm"
          disabled={!isOwner}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="member" id="member" className="border-gray-500 text-[#ff00ea]" />
            <Label htmlFor="member">Staff</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="owner" id="owner" className="border-gray-500 text-[#00ff55]" />
            <Label htmlFor="owner">Admin</Label>
          </div>
        </RadioGroup>
      </div>
      {inviteState?.error && (
        <p className="text-red-500 font-mono text-xs mt-2">{inviteState.error}</p>
      )}
      {inviteState?.success && (
        <p className="text-[#00ff55] font-mono text-xs mt-2">{inviteState.success}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-[#00f3ff] hover:bg-[#00e0e0] text-black font-pixel text-xs border-none mt-4 py-6"
        disabled={isInvitePending || !isOwner}
      >
        {isInvitePending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            INVITING...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            INVITE STAFF
          </>
        )}
      </Button>
      {!isOwner && (
        <p className="text-xs text-gray-500 font-mono mt-2 text-center">
          You must be an admin to invite staff.
        </p>
      )}
    </form>
  );
}
