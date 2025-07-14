import React, { useState } from 'react';
import { Character } from '../../lib/groq';
import { useCharacters } from '../../hooks/useCharacters';
import { CharacterCard } from '../Characters/CharacterCard';
import { Play, Settings, Users } from 'lucide-react';

interface BattleSetupProps {
  onStartBattle: (config: BattleConfig) => void;
}

export interface BattleConfig {
  participants: Character[];
  rounds: number;
  theme?: string;
  name: string;
}

export function BattleSetup({ onStartBattle }: BattleSetupProps) {
  const { characters, loading } = useCharacters();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [battleName, setBattleName] = useState('');
  const [rounds, setRounds] = useState(1);
  const [theme, setTheme] = useState('');

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacters(prev => {
      const isSelected = prev.some(c => c.id === character.id);
      if (isSelected) {
        return prev.filter(c => c.id !== character.id);
      } else if (prev.length < 4) {
        return [...prev, character];
      }
      return prev;
    });
  };

  const handleStartBattle = () => {
    if (selectedCharacters.length >= 2 && battleName.trim()) {
      onStartBattle({
        participants: selectedCharacters,
        rounds,
        theme: theme.trim() || undefined,
        name: battleName.trim(),
      });
    }
  };

  const canStartBattle = selectedCharacters.length >= 2 && battleName.trim();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Setup Battle</h2>
        <p className="text-gray-400">Configure your rap battle and select characters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Select Characters</h3>
              <span className="text-gray-400">({selectedCharacters.length}/4)</span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading characters...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map(character => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onSelect={handleCharacterSelect}
                    selected={selectedCharacters.some(c => c.id === character.id)}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Battle Configuration</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Battle Name
                </label>
                <input
                  type="text"
                  value={battleName}
                  onChange={(e) => setBattleName(e.target.value)}
                  placeholder="Enter battle name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Rounds
                </label>
                <select
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 Round</option>
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme (Optional)
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., superheroes, food, movies"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Selected Characters</h4>
            {selectedCharacters.length > 0 ? (
              <div className="space-y-3">
                {selectedCharacters.map(character => (
                  <div key={character.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{character.name}</p>
                      <p className="text-gray-400 text-sm">{character.rap_style}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Select at least 2 characters to start
              </p>
            )}

            <button
              onClick={handleStartBattle}
              disabled={!canStartBattle}
              className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                canStartBattle
                  ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white hover:from-purple-700 hover:to-orange-700 transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play className="h-5 w-5" />
              <span>Start Battle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}