import { Character } from '../../lib/groq';
import { Edit, Trash2 } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onEdit?: (character: Character) => void;
  onDelete?: (id: string) => void;
  onSelect?: (character: Character) => void;
  selected?: boolean;
  showActions?: boolean;
}

export function CharacterCard({
  character,
  onEdit,
  onDelete,
  onSelect,
  selected,
  showActions = true,
}: CharacterCardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-6 border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
        selected
          ? 'border-purple-500 bg-purple-900/20'
          : 'border-gray-600 hover:border-purple-400'
      }`}
      onClick={() => onSelect?.(character)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">

          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {character.name}
            </h3>
            <p className="text-gray-300 text-sm">{character.rap_style}</p>
          </div>
        </div>

        {showActions && !character.is_default && (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(character);
              }}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(character.id);
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {character.description}
      </p>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-1">Personality</h4>
          <div className="flex flex-wrap gap-1">
            {character.personality_traits.slice(0, 3).map((trait, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-orange-400 mb-1">Signature Phrase</h4>
          <p className="text-xs text-gray-300 italic">
            "{character.signature_phrases[0] || 'No signature phrase'}"
          </p>
        </div>
      </div>
    </div>
  );
}