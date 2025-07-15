import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Character } from '../lib/groq';

// Default characters fallback data
const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'batman-default',
    name: 'Batman',
    description: 'The Dark Knight of Gotham City',
    personality_traits: ['dark', 'brooding', 'justice-focused', 'strategic', 'intimidating'],
    signature_phrases: ['I am the night', 'Justice will prevail', 'Gotham needs me', 'Fear the shadows', 'Crime doesn\'t pay'],
    rap_style: 'dark and menacing',
    voice_parameters: { pitch: 'low', speed: 'slow', accent: 'gravelly' },
    is_default: true,
    created_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fish-head-default',
    name: 'Realistic Fish Head',
    description: 'The ocean-dwelling news anchor',
    personality_traits: ['professional', 'oceanic', 'informative', 'witty', 'marine-themed'],
    signature_phrases: ['This is Realistic Fish Head', 'And now back to the news', 'Swimming upstream', 'Making waves', 'Catch of the day'],
    rap_style: 'news anchor delivery',
    voice_parameters: { pitch: 'medium', speed: 'medium', accent: 'professional' },
    is_default: true,
    created_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'shaggy-default',
    name: 'Shaggy',
    description: 'The laid-back mystery solver',
    personality_traits: ['laid-back', 'hungry', 'cowardly', 'loyal', 'mellow'],
    signature_phrases: ['Like, zoinks man', 'Scooby snacks', 'That\'s like, totally weird', 'Hungry for more', 'Mystery machine'],
    rap_style: 'laid-back and chill',
    voice_parameters: { pitch: 'medium', speed: 'relaxed', accent: 'california' },
    is_default: true,
    created_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'peter-griffin-default',
    name: 'Peter Griffin',
    description: 'The comedic family man',
    personality_traits: ['comedic', 'immature', 'pop-culture-obsessed', 'loud', 'unpredictable'],
    signature_phrases: ['Nyehehehe', 'Freakin\' sweet', 'Road House', 'Bird is the word', 'Holy crap'],
    rap_style: 'comedic with pop culture references',
    voice_parameters: { pitch: 'medium-high', speed: 'fast', accent: 'rhode-island' },
    is_default: true,
    created_by: null,
    created_at: new Date().toISOString(),
  },
];

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        // If characters table doesn't exist, use default characters
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Characters table not found, using default characters');
          setCharacters(DEFAULT_CHARACTERS);
        } else {
          throw error;
        }
      } else {
        setCharacters(data || []);
      }
    } catch (error) {
      console.error('Error fetching characters, falling back to defaults:', error);
      setCharacters(DEFAULT_CHARACTERS);
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async (character: Omit<Character, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert([character])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return { data: null, error: new Error('Database not properly configured. Please contact support.') };
        }
        throw error;
      }
      
      if (data) {
        setCharacters(prev => [data, ...prev]);
        return { data, error: null };
      }
      
      return { data: null, error: new Error('Failed to create character') };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return { data: null, error: new Error('Database not properly configured. Please contact support.') };
        }
        throw error;
      }
      
      if (data) {
        setCharacters(prev => prev.map(c => c.id === id ? data : c));
        return { data, error: null };
      }
      
      return { data: null, error: new Error('Failed to update character') };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      // Don't allow deletion of default characters when using fallback data
      const character = characters.find(c => c.id === id);
      if (character?.is_default && character.id.includes('-default')) {
        return { error: new Error('Cannot delete default characters') };
      }
      
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return { error: new Error('Database not properly configured. Please contact support.') };
        }
        throw error;
      }
      
      setCharacters(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    refreshCharacters: fetchCharacters,
  };
}