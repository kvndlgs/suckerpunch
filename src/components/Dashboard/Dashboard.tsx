import { useState } from 'react';
import { useCharacters } from '../../hooks/useCharacters';
import { CharacterCard } from '../Characters/CharacterCard';
import { CharacterForm } from '../Characters/CharacterForm';
import { BattleSetup, BattleConfig } from '../Battle/BattleSetup';
import { BattleArena } from '../Battle/BattleArena';
import { Character } from '../../lib/groq';
import { Plus, Mic, Trophy, Zap } from 'lucide-react';

type View = 'dashboard' | 'characters' | 'battle-setup' | 'battle-arena';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [battleConfig, setBattleConfig] = useState<BattleConfig | null>(null);
  
  const { characters, loading, createCharacter, updateCharacter, deleteCharacter } = useCharacters();

  const handleCreateCharacter = async (characterData: Omit<Character, 'id' | 'created_at'>) => {
    const { error } = await createCharacter(characterData);
    if (!error) {
      setShowCharacterForm(false);
    }
  };

  const handleUpdateCharacter = async (characterData: Omit<Character, 'id' | 'created_at'>) => {
    if (editingCharacter) {
      const { error } = await updateCharacter(editingCharacter.id, characterData);
      if (!error) {
        setEditingCharacter(null);
        setShowCharacterForm(false);
      }
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      await deleteCharacter(id);
    }
  };

  const handleStartBattle = (config: BattleConfig) => {
    setBattleConfig(config);
    setCurrentView('battle-arena');
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-light mb-4">
          Welcome to <span className=".neonText.flickabitch ">Sucker</span><span className="text-orange-400">punch</span>
        </h2>
        <p className="text-gray-400 text-lg">AI-powered rap battles with your favorite characters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setCurrentView('battle-setup')}
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 hover:from-purple-700 hover:to-purple-900 transition-all duration-200 transform hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-white" />
            <h3 className="text-xl font-bold text-white">Start Battle</h3>
          </div>
          <p className="text-purple-200">Turn Your Favorites Cartoons Characters Into a World Class Battle Rapper And See Which Ones Were Realy 'Bout that life.</p>
        </button>

        <button
          onClick={() => setCurrentView('characters')}
          className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 hover:from-orange-700 hover:to-orange-900 transition-all duration-200 transform hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Mic className="h-8 w-8 text-white" />
            <h3 className="text-xl font-bold text-white">New Characters</h3>
          </div>
          <p className="text-orange-200">View, edit, and create custom rap battle characters</p>
        </button>

        <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-6 text-left">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-8 w-8 text-white" />
            <h3 className="text-xl font-bold text-white">Battle History</h3>
          </div>
          <p className="text-gray-200">Coming soon: View your past battles and statistics</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Featured Characters</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading characters...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {characters.filter(c => c.is_default).map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Characters</h2>
          <p className="text-gray-400">Manage your rap battle characters</p>
        </div>
        <button
          onClick={() => setShowCharacterForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span>Create Character</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading characters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={(char) => {
                setEditingCharacter(char);
                setShowCharacterForm(true);
              }}
              onDelete={handleDeleteCharacter}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'characters':
        return renderCharacters();
      case 'battle-setup':
        return <BattleSetup onStartBattle={handleStartBattle} />;
      case 'battle-arena':
        return battleConfig ? (
          <BattleArena 
            config={battleConfig} 
            onBack={() => setCurrentView('battle-setup')} 
          />
        ) : null;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {currentView !== 'dashboard' && (
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        {renderContent()}

        {showCharacterForm && (
          <CharacterForm
            character={editingCharacter}
            onSubmit={editingCharacter ? handleUpdateCharacter : handleCreateCharacter}
            onCancel={() => {
              setShowCharacterForm(false);
              setEditingCharacter(null);
            }}
          />
        )}
      </div>
    </div>
  );
}