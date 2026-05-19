import { db } from '@/lib/db/drizzle';
import { leaderboard } from '@/lib/db/schema';
import { LeaderboardClient } from './leaderboard-client';

export default async function LeaderboardPage() {
  const allEntries = await db
    .select()
    .from(leaderboard)
    .orderBy(leaderboard.rank);

  return <LeaderboardClient initialEntries={allEntries} />;
}
