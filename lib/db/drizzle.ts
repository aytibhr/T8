import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

let client: any;
let db: any;

if (process.env.POSTGRES_URL) {
  client = postgres(process.env.POSTGRES_URL);
  db = drizzle(client, { schema });
} else {
  console.warn('POSTGRES_URL is not set. Running in MOCK mode for UI preview.');
  // Mock db object to prevent crashes on UI preview
  db = {
    select: () => ({ from: () => ({ orderBy: () => [] }) }),
    query: { teamMembers: { findFirst: () => null } }
  } as any;
}

export { client, db };
