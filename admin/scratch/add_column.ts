import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.POSTGRES_URL!);

async function main() {
  console.log('Adding user_phone column to sessions table...');
  try {
    await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_phone varchar(20);`;
    console.log('Success!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await sql.end();
  }
}

main();
