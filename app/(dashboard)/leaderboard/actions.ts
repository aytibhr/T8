'use server';

import { db } from '@/lib/db/drizzle';
import { leaderboard } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createLeaderboardEntry(data: {
  rank: number;
  playerName: string;
  gamerTag: string;
  gameName: string;
  score: number;
  pointsType: string;
  formattedScore: string;
  platform: string;
  rankTier: string;
}) {
  await db.insert(leaderboard).values({
    rank: data.rank,
    playerName: data.playerName,
    gamerTag: data.gamerTag,
    gameName: data.gameName,
    score: data.score,
    pointsType: data.pointsType,
    formattedScore: data.formattedScore,
    platform: data.platform,
    rankTier: data.rankTier,
  });

  revalidatePath('/leaderboard');
}

export async function updateLeaderboardEntry(
  id: number,
  data: {
    rank: number;
    playerName: string;
    gamerTag: string;
    gameName: string;
    score: number;
    pointsType: string;
    formattedScore: string;
    platform: string;
    rankTier: string;
  }
) {
  await db
    .update(leaderboard)
    .set({
      rank: data.rank,
      playerName: data.playerName,
      gamerTag: data.gamerTag,
      gameName: data.gameName,
      score: data.score,
      pointsType: data.pointsType,
      formattedScore: data.formattedScore,
      platform: data.platform,
      rankTier: data.rankTier,
      updatedAt: new Date(),
    })
    .where(eq(leaderboard.id, id));

  revalidatePath('/leaderboard');
}

export async function deleteLeaderboardEntry(id: number) {
  await db.delete(leaderboard).where(eq(leaderboard.id, id));
  revalidatePath('/leaderboard');
}
