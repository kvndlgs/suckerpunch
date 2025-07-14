import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          wins: number;
          losses: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          wins?: number;
          losses?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          wins?: number;
          losses?: number;
          created_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          name: string;
          description: string;
          personality_traits: string[];
          signature_phrases: string[];
          rap_style: string;
          voice_parameters: Record<string, any>;
          is_default: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          personality_traits: string[];
          signature_phrases: string[];
          rap_style: string;
          voice_parameters: Record<string, any>;
          is_default?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          personality_traits?: string[];
          signature_phrases?: string[];
          rap_style?: string;
          voice_parameters?: Record<string, any>;
          is_default?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          name: string;
          participants: string[];
          rounds: number;
          theme: string | null;
          status: string;
          winner_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          participants: string[];
          rounds?: number;
          theme?: string | null;
          status?: string;
          winner_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          participants?: string[];
          rounds?: number;
          theme?: string | null;
          status?: string;
          winner_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      battle_rounds: {
        Row: {
          id: string;
          battle_id: string;
          round_number: number;
          character_id: string;
          rap_verse: string;
          audio_url: string | null;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          round_number: number;
          character_id: string;
          rap_verse: string;
          audio_url?: string | null;
          score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          battle_id?: string;
          round_number?: number;
          character_id?: string;
          rap_verse?: string;
          audio_url?: string | null;
          score?: number;
          created_at?: string;
        };
      };
    };
  };
};