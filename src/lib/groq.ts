// Groq API integration for rap generation
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
import { Instrumental } from "./instrumental";



export interface Character {
  id: string;
  name: string;
  description: string;
  personality_traits: string[];
  signature_phrases: string[];
  rap_style: string;
  voice_parameters: Record<string, any>;
}

export interface RapBattleRequest {
  characters: Character[];
  theme?: string;
  instrumental?: Instrumental;
  rounds: number;
  currentRound: number;
  previousVerses?: string[];
}



// Characters pictures mapping
/*
export const CHARACTER_PICTURE: Record<string, string> = {
  'Batman': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT55FDxHLybsIhbkYiv0J8WRCFAPj-XQLI68w&s', 
  'Realistic Fish Head': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlHd0O6SPQulm9UYinqcTsrp30xhCjVAsVSNjahj62ie2c_f_KffVigeTvdNpFIx97CoIC&s', 
  'Shaggy': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKwvqTcvLUj_PFMEuQhrnNAo8HV8Rsnc-uw&s', 
  'Peter Griffin': 'https://static.wikia.nocookie.net/simpsons/images/4/4a/Profile_-_Peter_Griffin.png/revision/latest?cb=20250307004047', 
};
*/

export async function generateRapVerse(
  character: Character,
  opponents: Character[],
  theme?: string,
  previousVerses: string[] = []
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is required');
  }

  const opponentNames = opponents.map(opp => opp.name).join(', ');
  const personalityTraits = character.personality_traits.join(', ');
  const signaturePhrases = character.signature_phrases.join(', ');
  
  const context = previousVerses.length > 0 
    ? `Previous verses in this battle:\n${previousVerses.join('\n\n')}\n\n`
    : '';

  const prompt = `You are ${character.name}, a rap battle character. Generate a fierce, competitive rap verse for a battle against ${opponentNames}.

Character Details:
- Name: ${character.name}
- Description: ${character.description}
- Personality: ${personalityTraits}
- Signature phrases: ${signaturePhrases}
- Rap style: ${character.rap_style}
${theme ? `- Battle theme: ${theme}` : ''}

${context}Instructions:
1. Stay in character as ${character.name}
2. Create 8-12 lines of rap with proper flow and rhythm
3. Include character-specific references and personality traits
4. Use some signature phrases naturally
5. Make it competitive and engaging
6. Keep it edgy
7. Respond with ONLY the rap verse, no explanations

Generate the rap verse now:`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a creative rap battle AI that generates authentic, character-specific rap verses. Keep responses clean but competitive.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Error generating rap verse';
  } catch (error) {
    console.error('Error generating rap verse:', error);
    return `Yo, I'm ${character.name}, and I'm here to say,
Something went wrong, but I'll battle another day!
Technical difficulties can't stop my flow,
Give me a minute and I'll steal the show!`;
  }
}

export async function generateBattleResults(
  participants: Character[],
  verses: Array<{ character: Character; verse: string }>
): Promise<{ winner: Character; scores: Array<{ character: Character; score: number }> }> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is required');
  }

  const versesText = verses.map(v => `${v.character.name}:\n${v.verse}`).join('\n\n');

  const prompt = `You are a rap battle judge. Analyze these rap verses and determine the winner.

Battle participants and their verses:
${versesText}

Judging criteria:
1. Flow and rhythm (25%)
2. Wordplay and creativity (25%)  
3. Character consistency (25%)
4. Overall impact (25%)

Respond with ONLY a JSON object in this format:
{
  "winner": "Character Name",
  "scores": [
    {"character": "Character Name", "score": 85},
    {"character": "Character Name", "score": 92}
  ]
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a rap battle judge AI that provides fair, objective scoring. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    const winner = participants.find(p => p.name === result.winner) || participants[0];
    const scores = result.scores?.map((s: any) => ({
      character: participants.find(p => p.name === s.character) || participants[0],
      score: s.score || 50
    })) || participants.map(p => ({ character: p, score: 50 }));

    return { winner, scores };
  } catch (error) {
    console.error('Error generating battle results:', error);
    // Return random winner as fallback
    const winner = participants[Math.floor(Math.random() * participants.length)];
    const scores = participants.map(p => ({ 
      character: p, 
      score: Math.floor(Math.random() * 40) + 60 
    }));
    return { winner, scores };
  }
}