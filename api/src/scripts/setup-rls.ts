import 'dotenv/config';
import { Client } from 'pg';

async function setupRls() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log("📡 Connected to the database to configure RLS and policies...");

  const sql = `
    -- 1. Enable RLS on all tables in the public schema
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        END LOOP;
    END;
    $$;

    -- 2. Drop existing policies to prevent conflicts
    DROP POLICY IF EXISTS "Users can select their own User row" ON "User";
    DROP POLICY IF EXISTS "Users can select messages they sent or received" ON "Message";
    DROP POLICY IF EXISTS "Users can select their own notifications" ON "Notification";

    -- 3. Create RLS Policies
    -- User policy: needed so that subqueries in other policies can map auth.uid() to User.id
    CREATE POLICY "Users can select their own User row" ON "User"
      FOR SELECT
      TO authenticated
      USING ("supabaseId" = auth.uid()::text);

    -- Message policy: allows users to receive Realtime updates for their messages
    CREATE POLICY "Users can select messages they sent or received" ON "Message"
      FOR SELECT
      TO authenticated
      USING (
        "senderId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text) OR
        "receiverId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text)
      );

    -- Notification policy: allows users to receive Realtime updates for their notifications
    CREATE POLICY "Users can select their own notifications" ON "Notification"
      FOR SELECT
      TO authenticated
      USING (
        "userId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text)
      );
  `;

  try {
    await client.query(sql);
    console.log("✅ RLS successfully enabled on all tables!");
    console.log("✅ Secure SELECT policies created for 'User', 'Message', and 'Notification' tables!");
  } catch (err) {
    console.error("❌ Failed to set up RLS and policies:", err);
  } finally {
    await client.end();
  }
}

setupRls().catch(console.error);
