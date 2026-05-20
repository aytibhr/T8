import { db } from '@/lib/db/drizzle';
import { stations, sessions, transactions, userMemberships, membershipPlans, addons } from '@/lib/db/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';
import { DashboardClient } from './dashboard-client';
import { getUser } from '@/lib/db/queries';

export default async function DashboardPage() {
  const [allStations, activeSessions, todaysTxns, allMembers, plans, allAddons] = await Promise.all([
    db.select().from(stations).orderBy(stations.id),
    db.select().from(sessions).where(eq(sessions.status, 'Active')),
    db.select().from(transactions).where(gte(transactions.timestamp, new Date(new Date().setHours(0, 0, 0, 0)))),
    db.select({
      id: userMemberships.id,
      name: userMemberships.name,
      phone: userMemberships.phone,
      coinsBalance: userMemberships.coinsBalance,
      validUntil: userMemberships.validUntil,
      planName: membershipPlans.name,
    })
      .from(userMemberships)
      .leftJoin(membershipPlans, eq(userMemberships.planId, membershipPlans.id)),
    db.select().from(membershipPlans),
    db.select().from(addons).orderBy(addons.name),
  ]);

  const recentTxns = await db.select({
    id: transactions.id,
    sessionId: transactions.sessionId,
    userPhone: transactions.userPhone,
    userName: userMemberships.name,
    amountCash: transactions.amountCash,
    amountCreditsUsed: transactions.amountCreditsUsed,
    transactionType: transactions.transactionType,
    timestamp: transactions.timestamp,
    customerName: transactions.customerName,
    sessionStartTime: sessions.startTime,
    sessionEndTime: sessions.endTime,
    sessionDuration: sessions.durationMinutes,
  })
    .from(transactions)
    .leftJoin(userMemberships, eq(transactions.userPhone, userMemberships.phone))
    .leftJoin(sessions, eq(transactions.sessionId, sessions.id))
    .orderBy(desc(transactions.timestamp))
    .limit(8);

  // Map sessions to stations
  const stationsWithSessions = allStations.map((station: typeof allStations[0]) => {
    const session = activeSessions.find((s: typeof activeSessions[0]) => s.stationId === station.id);
    return { ...station, session: session || null };
  });

  const todaysRevenue = todaysTxns.reduce((sum: number, t: { amountCash: number | null }) => sum + (t.amountCash || 0), 0);
  const vipCount = allMembers.length;

  const user = await getUser();

  return (
    <DashboardClient
      stations={stationsWithSessions}
      members={allMembers}
      plans={plans}
      recentTxns={recentTxns}
      todaysRevenue={todaysRevenue}
      vipCount={vipCount}
      totalStations={allStations.length}
      user={user}
      addons={allAddons}
    />
  );
}
