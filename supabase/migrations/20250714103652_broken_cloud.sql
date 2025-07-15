/*
  # Fix profiles table and ensure proper setup

  1. Ensure profiles table exists with correct structure
  2. Fix any RLS policy issues
  3. Add proper indexes for performance
*/

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Ensure characters table exists with default characters
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  personality_traits jsonb NOT NULL DEFAULT '[]',
  signature_phrases text[] DEFAULT '{}',
  rap_style text NOT NULL DEFAULT 'freestyle',
  voice_parameters jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for characters
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Characters policies
DROP POLICY IF EXISTS "Anyone can read characters" ON characters;
DROP POLICY IF EXISTS "Users can create characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;

CREATE POLICY "Anyone can read characters"
  ON characters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create characters"
  ON characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by OR is_default = true);

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND is_default = false);

-- Insert default characters if they don't exist
INSERT INTO characters (name, description, personality_traits, signature_phrases, rap_style, voice_parameters, is_default) 
SELECT * FROM (VALUES
  ('Batman', 'The Dark Knight of Gotham City', 
   '["dark", "brooding", "justice-focused", "strategic", "intimidating"]',
   ARRAY['I am the night', 'Justice will prevail', 'Gotham needs me', 'Fear the shadows', 'Crime doesn''t pay'],
   'dark and menacing',
   '{"pitch": "low", "speed": "slow", "accent": "gravelly"}',
   true),
  ('Realistic Fish Head', 'The ocean-dwelling news anchor', 
   '["professional", "oceanic", "informative", "witty", "marine-themed"]',
   ARRAY['This is Realistic Fish Head', 'And now back to the news', 'Swimming upstream', 'Making waves', 'Catch of the day'],
   'news anchor delivery',
   '{"pitch": "medium", "speed": "medium", "accent": "professional"}',
   true),
  ('Shaggy', 'The laid-back mystery solver', 
   '["laid-back", "hungry", "cowardly", "loyal", "mellow"]',
   ARRAY['Like, zoinks man', 'Scooby snacks', 'That''s like, totally weird', 'Hungry for more', 'Mystery machine'],
   'laid-back and chill',
   '{"pitch": "medium", "speed": "relaxed", "accent": "california"}',
   true),
  ('Peter Griffin', 'The comedic family man', 
   '["comedic", "immature", "pop-culture-obsessed", "loud", "unpredictable"]',
   ARRAY['Nyehehehe', 'Freakin'' sweet', 'Road House', 'Bird is the word', 'Holy crap'],
   'comedic with pop culture references',
   '{"pitch": "medium-high", "speed": "fast", "accent": "rhode-island"}',
   true)
) AS v(name, description, personality_traits, signature_phrases, rap_style, voice_parameters, is_default)
WHERE NOT EXISTS (SELECT 1 FROM characters WHERE name = v.name AND is_default = true);