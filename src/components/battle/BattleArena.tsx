import React, { useState, useEffect } from 'react';
import { Character, generateRapVerse, generateBattleResults } from '../../lib/groq';
import { generateVoiceAudio } from '../../lib/voice';
import { BattleConfig } from './BattleSetup';
import { Play, Pause, Volume2, Crown, ArrowLeft } from 'lucide-react';

interface BattleArenaProps {
  config: BattleConfig;
  onBack: () => void;
}

interface BattleRound {
  round: number;
  verses: Array<{
    character: Character;
    verse: string;
    audioUrl?: string;
  }>;
  scores?: Array<{
    character: Character;
    score: number;
  }>;
}

export function BattleArena({ config, onBack }: BattleArenaProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<BattleRound[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [battleComplete, setBattleComplete] = useState(false);
  const [winner, setWinner] = useState<Character | null>(null);
  const [finalScores, setFinalScores] = useState<Array<{ character: Character; score: number }>>([]);

  useEffect(() => {
    if (currentRound <= config.rounds) {
      generateRound();
    }
  }, [currentRound]);

  const generateRound = async () => {
    setIsGenerating(true);
    setCurrentVerse(null);

    const newRound: BattleRound = {
      round: currentRound,
      verses: [],
    };

    try {
      // Generate verses for each character
      for (let i = 0; i < config.participants.length; i++) {
        const character = config.participants[i];
        const opponents = config.participants.filter(p => p.id !== character.id);
        
        // Get previous verses for context
        const previousVerses = rounds.flatMap(r => r.verses.map(v => v.verse));
        
        setCurrentVerse(i);
        
        const verse = await generateRapVerse(
          character,
          opponents,
          config.theme,
          previousVerses
        );

        // Generate audio for the verse
        const audioUrl = await generateVoiceAudio(
          verse,
          character.name,
          character.voice_parameters
        );

        newRound.verses.push({
          character,
          verse,
          audioUrl: audioUrl || undefined,
        });
      }

      // Generate scores for this round
      const results = await generateBattleResults(config.participants, newRound.verses);
      newRound.scores = results.scores;

      setRounds(prev => [...prev, newRound]);

      // Check if battle is complete
      if (currentRound === config.rounds) {
        setBattleComplete(true);
        calculateFinalWinner();
      } else {
        setCurrentRound(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error generating round:', error);
    } finally {
      setIsGenerating(false);
      setCurrentVerse(null);
    }
  };

  const calculateFinalWinner = () => {
    const totalScores = config.participants.map(participant => {
      const totalScore = rounds.reduce((sum, round) => {
        const score = round.scores?.find(s => s.character.id === participant.id)?.score || 0;
        return sum + score;
      }, 0);
      return { character: participant, score: totalScore };
    });

    totalScores.sort((a, b) => b.score - a.score);
    setFinalScores(totalScores);
    setWinner(totalScores[0].character);
  };

  const playAudio = (audioUrl: string, verseId: string) => {
    if (playingAudio === verseId) {
      setPlayingAudio(null);
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio(verseId);
      
      audio.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Setup</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{config.name}</h2>
          <p className="text-gray-400">
            {battleComplete ? 'Battle Complete!' : `Round ${currentRound} of ${config.rounds}`}
          </p>
        </div>
        
        <div className="w-24" />
      </div>

      {battleComplete && winner && (
        <div className="bg-gradient-to-r from-purple-900 to-orange-900 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Winner: {winner.name}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {finalScores.map((score, index) => (
              <div key={score.character.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-white">#{index + 1}</span>
                  {index === 0 && <Crown className="h-5 w-5 text-yellow-400" />}
                </div>
                <p className="text-white font-medium">{score.character.name}</p>
                <p className="text-gray-400">Score: {score.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium">
            {currentVerse !== null 
              ? `Generating verse for ${config.participants[currentVerse].name}...`
              : 'Generating rap battle...'
            }
          </p>
        </div>
      )}

      <div className="space-y-6">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Round {round.round}</h3>
              {round.scores && (
                <div className="flex items-center space-x-4">
                  {round.scores.map(score => (
                    <div key={score.character.id} className="text-center">
                      <p className="text-white font-medium">{score.character.name}</p>
                      <p className="text-purple-400 font-bold">{score.score}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {round.verses.map((verse, verseIndex) => (
                <div key={verseIndex} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{verse.character.name}</h4>
                    {verse.audioUrl && (
                      <button
                        onClick={() => playAudio(verse.audioUrl!, `${roundIndex}-${verseIndex}`)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        {playingAudio === `${roundIndex}-${verseIndex}` ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {verse.verse}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}