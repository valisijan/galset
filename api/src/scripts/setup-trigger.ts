import 'dotenv/config';
import { Client } from 'pg';

async function setupTrigger() {
  const supabaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl) {
    console.error("❌ Missing DATABASE_URL (Supabase)");
    return;
  }

  const supabase = new Client({ connectionString: supabaseUrl });
  await supabase.connect();

  console.log("📡 Connected to Supabase database for Trigger setup!");

  const sql = `
    -- Enable pgcrypto extension for crypt / hashing functions
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Create the trigger function
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    DECLARE
      new_user_id integer;
      new_wallet_id integer;
      base_username text;
      final_username text;
      username_suffix integer := 1;
    BEGIN
      -- Generate base username from metadata or email
      base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
      base_username := regexp_replace(lower(base_username), '[^a-z0-9_.]', '_', 'g');
      
      IF base_username = '' THEN
        base_username := 'user';
      END IF;
      
      final_username := base_username;
      
      -- Ensure username uniqueness
      WHILE EXISTS (SELECT 1 FROM public."User" WHERE username = final_username) LOOP
        final_username := base_username || '_' || username_suffix;
        username_suffix := username_suffix + 1;
      END LOOP;

      -- Insert into public."User"
      INSERT INTO public."User" (
        email, 
        password,
        "fullName", 
        username, 
        "profileImg", 
        "createdAt", 
        "updatedAt", 
        "supabaseId",
        "birthDate",
        "country"
      )
      VALUES (
        new.email,
        coalesce(nullif(new.encrypted_password, ''), extensions.crypt(md5(random()::text), extensions.gen_salt('bf'))),
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        final_username,
        new.raw_user_meta_data->>'avatar_url',
        new.created_at,
        new.updated_at,
        new.id::text,
        NULLIF(new.raw_user_meta_data->>'birth_date', '')::timestamp,
        coalesce(nullif(new.raw_user_meta_data->>'country', ''), 'Srbija')
      )
      RETURNING id INTO new_user_id;

      -- Insert into public."Wallet"
      INSERT INTO public."Wallet" ("userId", balance, "createdAt", "updatedAt")
      VALUES (new_user_id, 1000, now(), now())
      RETURNING id INTO new_wallet_id;

      -- Insert into public."Transaction"
      INSERT INTO public."Transaction" ("walletId", amount, type, description, "createdAt")
      VALUES (new_wallet_id, 1000, 'DEPOSIT', 'Dobrodošli bonus - 1000 kredita na poklon!', now());

      -- Insert into public."NotificationPreference"
      INSERT INTO public."NotificationPreference" ("userId", messages, "expiredAds", "expiredPromotions", "followedAds", "newFollowers", "newReviews", "updatedAt")
      VALUES (new_user_id, true, true, true, true, true, true, now());

      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Drop the trigger if it already exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- Bind the trigger to the auth.users table
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `;

  try {
    await supabase.query(sql);
    console.log("✅ PostgreSQL Auth Sync Trigger successfully set up in Supabase!");
  } catch (err) {
    console.error("❌ Failed to set up Auth trigger:", err);
  } finally {
    await supabase.end();
  }
}

setupTrigger().catch(console.error);
