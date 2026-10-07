const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runMigration() {
  console.log('====================================================');
  console.log(' CAMPUSBITE — SUPABASE MIGRATION RUNNER');
  console.log('====================================================');

  const migrationFile = path.resolve(__dirname, '../supabase/migrations/001_initial_schema.sql');
  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found at:', migrationFile);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFile, 'utf8');

  // Check for direct database connection string
  let dbUrl = process.env.DATABASE_URL;

  // Supabase reference from project url
  const supabaseUrl = process.env.SUPABASE_URL || 'https://wfaxdtfoyrokfjddhivw.supabase.co';
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  if (!dbUrl && process.env.SUPABASE_DB_PASSWORD) {
    dbUrl = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
  }

  if (dbUrl) {
    console.log(`📡 Connecting to Supabase PostgreSQL at pooler...`);
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });

    try {
      await client.connect();
      console.log('✅ Connected successfully to Supabase PostgreSQL.');
      console.log('🚀 Executing migration 001_initial_schema.sql...');
      await client.query(sqlContent);
      console.log('🎉 Migration completed successfully! Tables, triggers, and seed data applied.');
      await client.end();
      return;
    } catch (err) {
      console.error('⚠️ Direct PostgreSQL execution encountered error:', err.message);
      try { await client.end(); } catch (_) {}
    }
  }

  // Display helpful instruction for one-click Supabase Dashboard migration
  console.log('\n----------------------------------------------------');
  console.log('ℹ️  HOW TO APPLY SCHEMA TO SUPABASE IN 30 SECONDS:');
  console.log('----------------------------------------------------');
  console.log('1. Open your Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('2. Copy the contents of:');
  console.log(`   supabase/migrations/001_initial_schema.sql`);
  console.log('3. Paste into the SQL Editor and click "RUN".');
  console.log('----------------------------------------------------');
  console.log('OR set DATABASE_URL in backend/.env:');
  console.log(`DATABASE_URL=postgresql://postgres.${projectRef}:[YOUR_DB_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`);
  console.log('and run: npm run migrate\n');
}

runMigration().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
