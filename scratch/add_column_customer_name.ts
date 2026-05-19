import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.POSTGRES_URL!);

async function main() {
  console.log('Adding customer_name column to transactions table...');
  try {
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_name varchar(100);`;
    console.log('Success!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await sql.end();
  }
}

main();
