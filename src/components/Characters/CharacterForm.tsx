import React, { useState } from 'react';
import { Character } from '../../lib/groq';
import { X, Plus, Minus } from 'lucide-react';

interface CharacterFormProps {
  character?: Character;
  onSubmit: (character: Omit<Character, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export function CharacterForm({ character, onSubmit, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    description: character?.description || '',
    personality_traits: character?.personality_traits || [''],
    signature_phrases: character?.signature_phrases || [''],
    rap_style: character?.rap_style || 'freestyle',
    voice_parameters: character?.voice_parameters || {
      pitch: 'medium',
      speed: 'medium',
      accent: 'standard',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      personality_traits: formData.personality_traits.filter(trait => trait.trim()),
      signature_phrases: formData.signature_phrases.filter(phrase => phrase.trim()),
      is_default: false,
      created_by: null,
    });
  };

  const addTrait = () => {
    setFormData(prev => ({
      ...prev,
      personality_traits: [...prev.personality_traits, ''],
    }));
  };

  const removeTrait = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.filter((_, i) => i !== index),
    }));
  };

  const updateTrait = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.map((trait, i) =>
        i === index ? value : trait
      ),
    }));
  };

  const addPhrase = () => {
    setFormData(prev => ({
      ...prev,
      signature_phrases: [...prev.signature_phrases, ''],
    }));
  };

  const removePhrase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      signature_phrases: prev.signature_phrases.filter((_, i) => i !== index),
    }));
  };

  const updatePhrase = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      signature_phrases: prev.signature_phrases.map((phrase, i) =>
        i === index ? value : phrase
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {character ? 'Edit Character' : 'Create Character'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rap Style
              </label>
              <select
                value={formData.rap_style}
                onChange={(e) => setFormData(prev => ({ ...prev, rap_style: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="freestyle">Freestyle</option>
                <option value="aggressive">Aggressive</option>
                <option value="laid-back">Laid-back</option>
                <option value="comedic">Comedic</option>
                <option value="dark">Dark</option>
                <option value="melodic">Melodic</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personality Traits
            </label>
            {formData.personality_traits.map((trait, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={trait}
                  onChange={(e) => updateTrait(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter personality trait"
                />
                {formData.personality_traits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTrait(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTrait}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Trait</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Signature Phrases
            </label>
            {formData.signature_phrases.map((phrase, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={phrase}
                  onChange={(e) => updatePhrase(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter signature phrase"
                />
                {formData.signature_phrases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhrase(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPhrase}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Phrase</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Pitch
              </label>
              <select
                value={formData.voice_parameters.pitch}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  voice_parameters: { ...prev.voice_parameters, pitch: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Speed
              </label>
              <select
                value={formData.voice_parameters.speed}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  voice_parameters: { ...prev.voice_parameters, speed: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Accent
              </label>
              <select
                value={formData.voice_parameters.accent}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  voice_parameters: { ...prev.voice_parameters, accent: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="standard">Standard</option>
                <option value="british">British</option>
                <option value="southern">Southern</option>
                <option value="new-york">New York</option>
                <option value="california">California</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all"
            >
              {character ? 'Update Character' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}