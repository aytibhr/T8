import { db } from '@/lib/db/drizzle';
import { userMemberships } from '@/lib/db/schema';
import { sql, lte, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(now.getDate() + 5);

  // 1. Members expiring in 5 days or today
  const expiringMembers = await db.select()
    .from(userMemberships)
    .where(
      and(
        lte(userMemberships.validUntil, fiveDaysFromNow),
        sql`${userMemberships.validUntil} >= ${now.toISOString()}`
      )
    );

  // 2. Members with low coins (<= 5)
  const lowCoinMembers = await db.select()
    .from(userMemberships)
    .where(lte(userMemberships.coinsBalance, 5));

  const alerts = {
    expiring: expiringMembers.map((m: any) => {
      const daysLeft = Math.ceil((new Date(m.validUntil!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: `exp-${m.id}-${m.validUntil}`,
        type: 'expiry',
        member: m,
        daysLeft
      };
    }),
    lowCoins: lowCoinMembers.map((m: any) => ({
      id: `low-${m.id}-${m.coinsBalance}`,
      type: 'low-coins',
      member: m
    }))
  };

  return NextResponse.json(alerts);
}
