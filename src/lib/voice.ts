// Voice synthesis integration (ElevenLabs/PlayHT)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceParameters {
  pitch: string;
  speed: string;
  accent: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Character voice mapping
const CHARACTER_VOICES: Record<string, string> = {
  'Batman': 'xAMrOR5PymFHdT8J95zY', // Adam voice (deep, dramatic)
  'Realistic Fish Head': 'DkDLZILbak4QilyAd0Xp', // 
  'Shaggy': 'VR6AewLTigWG4xSOukaG', // Josh voice (laid-back)
  'Peter Griffin': 'BYRWjbVpzKrq4SrM6fxD', // Clyde voice (comedic)
};

export async function generateVoiceAudio(
  text: string,
  characterName: string,
  voiceParams: VoiceParameters = { pitch: 'medium', speed: 'medium', accent: 'standard' }
): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  const voiceId = CHARACTER_VOICES[characterName] || CHARACTER_VOICES['Batman'];
  
  // Convert voice parameters to ElevenLabs settings
  const settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true
  };

  // Adjust settings based on voice parameters
  if (voiceParams.pitch === 'low') {
    settings.stability = 0.7;
  } else if (voiceParams.pitch === 'high') {
    settings.stability = 0.3;
  }

  if (voiceParams.speed === 'slow') {
    settings.style = 0.3;
  } else if (voiceParams.speed === 'fast') {
    settings.style = 0.7;
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating voice audio:', error);
    return null;
  }
}

export async function generateCustomVoiceAudio(
  text: string,
  voiceId: string,
  settings: VoiceSettings
): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating custom voice audio:', error);
    return null;
  }
}

// Fallback for when voice synthesis is not available
export function createSpeechSynthesisAudio(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      resolve('speech-synthesis-complete');
    };

    utterance.onerror = () => {
      resolve(null);
    };

    speechSynthesis.speak(utterance);
  });
}