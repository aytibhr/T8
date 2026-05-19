import { db } from '@/lib/db/drizzle';
import { stations } from '@/lib/db/schema';
import { StationsClient } from './stations-client';

export default async function StationsPage() {
  const allStations = await db.select().from(stations).orderBy(stations.id);

  return <StationsClient initialStations={allStations} />;
}
