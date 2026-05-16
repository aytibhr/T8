'use server';

import { db } from '@/lib/db/drizzle';
import { stations, sessions, transactions, userMemberships } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function allotSession(data: { stationId: number; durationMinutes: number; type: 'walkin' | 'member'; userPhone?: string }) {
  const [station] = await db.select().from(stations).where(eq(stations.id, data.stationId));
  if (!station) throw new Error('Station not found');

  const totalPrice = data.type === 'walkin' ? Math.round((data.durationMinutes / 60) * station.ratePerHour) : 0;

  await db.insert(sessions).values({
    stationId: data.stationId,
    startTime: new Date(),
    endTime: new Date(Date.now() + data.durationMinutes * 60000),
    durationMinutes: data.durationMinutes,
    totalPrice,
    status: 'Active',
    userPhone: data.userPhone,
  });

  await db.update(stations).set({ status: 'Occupied' }).where(eq(stations.id, data.stationId));
  revalidatePath('/dashboard');
}

export async function checkoutSession(data: { stationId: number; sessionId: number; customerName: string; customerPhone: string; type: 'walkin' | 'member'; finalAmountCash: number; finalCoinsUsed: number }) {
  await db.update(sessions).set({ status: 'Completed' }).where(eq(sessions.id, data.sessionId));
  await db.update(stations).set({ status: 'Active' }).where(eq(stations.id, data.stationId));

  await db.insert(transactions).values({
    sessionId: data.sessionId,
    userPhone: data.customerPhone,
    amountCash: data.finalAmountCash,
    amountCreditsUsed: data.finalCoinsUsed,
    transactionType: 'Session',
    timestamp: new Date(),
    customerName: data.customerName,
  });

  if (data.type === 'member' && data.customerPhone) {
    const [member] = await db.select().from(userMemberships).where(eq(userMemberships.phone, data.customerPhone));
    if (member) {
      await db.update(userMemberships).set({ coinsBalance: Math.max(0, member.coinsBalance - data.finalCoinsUsed) }).where(eq(userMemberships.id, member.id));
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/reports');
}

export async function add15Mins(stationId: number, sessionId: number) {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!session?.endTime) return;
  await db.update(sessions).set({
    endTime: new Date(session.endTime.getTime() + 15 * 60000),
    durationMinutes: session.durationMinutes + 15,
  }).where(eq(sessions.id, sessionId));
  revalidatePath('/dashboard');
}
