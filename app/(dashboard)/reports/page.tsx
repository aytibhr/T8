import { db } from '@/lib/db/drizzle';
import { transactions, userMemberships, sessions } from '@/lib/db/schema';
import { ReportsClient } from './reports-client';
import { desc, eq } from 'drizzle-orm';

export default async function ReportsPage() {
  const allTransactions = await db
    .select({
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
    .orderBy(desc(transactions.timestamp));

  return <ReportsClient transactions={allTransactions} />;
}
