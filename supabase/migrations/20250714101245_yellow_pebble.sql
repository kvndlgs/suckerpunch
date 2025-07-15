/*
  # Suckerpunch Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_url` (text, optional)
      - `wins` (integer, default 0)
      - `losses` (integer, default 0)
      - `created_at` (timestamp)
    
    - `characters`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `personality_traits` (jsonb)
      - `signature_phrases` (text array)
      - `rap_style` (text)
      - `voice_parameters` (jsonb)
      - `is_default` (boolean, default false)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `battles`
      - `id` (uuid, primary key)
      - `name` (text)
      - `participants` (jsonb array of character ids)
      - `rounds` (integer, default 1)
      - `theme` (text, optional)
      - `status` (text, default 'pending')
      - `winner_id` (uuid, optional)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `battle_rounds`
      - `id` (uuid, primary key)
      - `battle_id` (uuid, references battles)
      - `round_number` (integer)
      - `character_id` (uuid, references characters)
      - `rap_verse` (text)
      - `audio_url` (text, optional)
      - `score` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create characters table
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

-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  participants jsonb NOT NULL DEFAULT '[]',
  rounds integer DEFAULT 1,
  theme text,
  status text DEFAULT 'pending',
  winner_id uuid REFERENCES characters(id),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create battle_rounds table
CREATE TABLE IF NOT EXISTS battle_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  character_id uuid REFERENCES characters(id),
  rap_verse text NOT NULL,
  audio_url text,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- Characters policies
CREATE POLICY "Anyone can read characters"
  ON characters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create characters"
  ON characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Battles policies
CREATE POLICY "Anyone can read battles"
  ON battles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create battles"
  ON battles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own battles"
  ON battles FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Battle rounds policies
CREATE POLICY "Anyone can read battle rounds"
  ON battle_rounds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Battle creator can manage rounds"
  ON battle_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM battles 
      WHERE battles.id = battle_rounds.battle_id 
      AND battles.created_by = auth.uid()
    )
  );

-- Insert default characters
INSERT INTO characters (name, description, personality_traits, signature_phrases, rap_style, voice_parameters, is_default) VALUES
('Batman', 'The Dark Knight of Gotham City', 
 '["dark", "brooding", "justice-focused", "strategic", "intimidating"]',
 '{
   "I am the night",
   "Justice will prevail",
   "Gotham needs me",
   "Fear the shadows",
   "Crime doesn''t pay"
 }',
 'dark and menacing',
 '{"pitch": "low", "speed": "slow", "accent": "gravelly"}',
 true),

('Realistic Fish Head', 'The ocean-dwelling news anchor', 
 '["professional", "oceanic", "informative", "witty", "marine-themed"]',
 '{
   "This is Realistic Fish Head",
   "And now back to the news",
   "Swimming upstream",
   "Making waves",
   "Catch of the day"
 }',
 'news anchor delivery',
 '{"pitch": "medium", "speed": "medium", "accent": "professional"}',
 true),

('Shaggy', 'The laid-back mystery solver', 
 '["laid-back", "hungry", "cowardly", "loyal", "mellow"]',
 '{
   "Like, zoinks man",
   "Scooby snacks",
   "That''s like, totally weird",
   "Hungry for more",
   "Mystery machine"
 }',
 'laid-back and chill',
 '{"pitch": "medium", "speed": "relaxed", "accent": "california"}',
 true),

('Peter Griffin', 'The comedic family man', 
 '["comedic", "immature", "pop-culture-obsessed", "loud", "unpredictable"]',
 '{
   "Nyehehehe",
   "Freakin'' sweet",
   "Road House",
   "Bird is the word",
   "Holy crap"
 }',
 'comedic with pop culture references',
 '{"pitch": "medium-high", "speed": "fast", "accent": "rhode-island"}',
 true);