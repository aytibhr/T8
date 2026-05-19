import { db } from '@/lib/db/drizzle';
import { stations, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const allStations = await db.select().from(stations).orderBy(stations.id);
  const activeSessions = await db.select().from(sessions).where(eq(sessions.status, 'Active'));

  const stationsWithSessions = allStations.map((station: any) => {
    const session = activeSessions.find((s: any) => s.stationId === station.id);
    return { ...station, session: session || null };
  });

  return NextResponse.json(stationsWithSessions);
}
