import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini Client with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Universal Song & Audio Analyzer Endpoint
app.post('/api/analyze-song', async (req, res) => {
  try {
    const {
      fileName,
      songTitle,
      providedLyrics,
      genre,
      duration,
      languageHint,
    } = req.body;

    const prompt = `You are Melomotion AI's Universal Music Video Audio & Lyric Intelligence Engine.
Analyze this song for a high-end music video production.
Song metadata:
- Title/File: ${songTitle || fileName || 'Untitled Track'}
- Genre: ${genre || 'Pop / Cinematic'}
- Duration: ${duration || '03:15'}
- Language Hint: ${languageHint || 'Auto-detect'}
- User Provided Lyrics or Vocal Info: ${providedLyrics || 'Original vocals detected from audio track.'}

CRITICAL UNIVERSAL LANGUAGE RULES:
1. Support ALL world languages (e.g. Tagalog/Filipino, Spanish, Japanese, Korean, Hindi, French, Portuguese, English, Arabic, Mandarin, German, etc.).
2. NEVER translate the original song lyrics into English. Preserve the original language, spelling, and phrasing.
3. Automatically detect the primary and any secondary languages in the song.
4. Extract vocal rhythms, musical mood, estimated BPM, and emotional arc.
5. Create timestamped musical section markers (Intro, Verse 1, Chorus, Verse 2, Bridge, Outro) with energy ratings (0-100).
6. Provide phonetic lip-sync hints (e.g. open vowels 'A/O', closed mouth 'M/B/P', smiles 'E/I') for key vocal phrases.

Return ONLY a valid JSON object matching this schema:
{
  "detectedLanguage": "string (e.g. 'Tagalog (Filipino)', 'Spanish', 'Japanese', 'English')",
  "languageCode": "string (e.g. 'tl', 'es', 'ja', 'en', 'ko')",
  "isMultilingual": boolean,
  "confidenceScore": number (e.g. 98),
  "songTitle": "string",
  "genre": "string",
  "bpm": number (e.g. 118),
  "musicalKey": "string (e.g. 'D Minor')",
  "mood": "string",
  "vocalStyle": "string",
  "lyricAnalysis": "string (summary of narrative theme without translating original phrases)",
  "lyricsSections": [
    {
      "section": "string (e.g. 'Verse 1', 'Chorus')",
      "timestamp": "string (e.g. '00:15 - 00:32')",
      "startSec": number,
      "endSec": number,
      "originalLyrics": "string (in original native language and script)",
      "energyLevel": number (0 to 100),
      "vocalPhonetics": "string (e.g. 'Heavy open vowels [A, O], punchy consonants')"
    }
  ],
  "videoDirectorBrief": "string (Cinematic concept recommendation)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Song analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze song audio and lyrics',
    });
  }
});

// 2. AI Scene Director Endpoint
app.post('/api/scene-director', async (req, res) => {
  try {
    const {
      songTitle,
      artistName,
      genre,
      style,
      aspectRatio,
      detectedLanguage,
      lyricsSummary,
      facialIdentityNotes,
      numberOfScenes = 5,
    } = req.body;

    const prompt = `You are an elite music video director for Melomotion AI.
Create a beat-synchronized, visually cinematic music video storyboard for:
- Song: ${songTitle || 'Original Song'}
- Artist: ${artistName || 'The Artist'}
- Style: ${style || 'Realistic Cinematic'}
- Aspect Ratio: ${aspectRatio || '16:9'}
- Native Language: ${detectedLanguage || 'Original Language'}
- Identity Preservation: The user has uploaded their own portrait. The main character must preserve their facial identity, hairstyle, skin tone, and features: ${facialIdentityNotes || 'Consistent facial features and authentic artist presence'}.
- Lyrics & Mood Context: ${lyricsSummary || 'Expressive vocal performance and dynamic pacing'}.
- Generate ${numberOfScenes} distinct cinematic scenes.

DIRECTOR GUIDELINES:
- Every scene must integrate the artist character with consistent identity.
- Include varied camera shots (close-up singing performance with lip-sync, slow tracking shot, wide concert spectacle, dynamic neon boulevard walking shot, low-angle emotional spotlight).
- Provide precise lighting, color palettes, visual VFX (lens flares, atmospheric haze, rain reflections, laser beams, film grain), and lip-sync vocal focus.

Return ONLY a valid JSON object matching this schema:
{
  "directorVision": "string",
  "colorPalette": ["string", "string", "string", "string"],
  "scenes": [
    {
      "sceneIndex": number,
      "title": "string",
      "timestamp": "string (e.g. '00:00 - 00:08')",
      "durationSec": number,
      "shotType": "string (e.g. 'Extreme Close-Up Singing', 'Wide Drone Orbit', 'Medium Tracking')",
      "cameraMotion": "string (e.g. 'Slow 35mm push-in with anamorphic violet streak')",
      "environment": "string",
      "lighting": "string",
      "artistAction": "string",
      "lipSyncIntensity": "High (vocal chorus)" | "Medium (soft verse)" | "Low (instrumental break)",
      "visualEffects": "string",
      "lyricCue": "string (original language lyrics if singing during this scene)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Scene director error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate scene storyboard',
    });
  }
});

// 3. Subtitles & Universal Language Alignment Endpoint
app.post('/api/generate-subtitles', async (req, res) => {
  try {
    const {
      originalLyrics,
      sourceLanguage,
      targetSubtitleLanguage,
      songDurationSec = 180,
    } = req.body;

    const prompt = `You are Melomotion AI Universal Subtitle Engine.
Generate synchronized subtitle lines for a music video.
- Original Lyrics: ${originalLyrics || 'Melodic rhythm and expressive singing'}
- Source Language: ${sourceLanguage || 'Auto-detect'}
- Target Subtitle Language: ${targetSubtitleLanguage || 'original'} (If 'original', do not translate; if another language like English, Spanish, Tagalog, Japanese, provide translation while strictly preserving original vocal timing).

Return ONLY a valid JSON object matching this schema:
{
  "sourceLanguage": "string",
  "targetLanguage": "string",
  "subtitles": [
    {
      "id": "string",
      "startSec": number,
      "endSec": number,
      "timestamp": "string (e.g. '00:12')",
      "originalText": "string (exact original native lyrics)",
      "subtitleText": "string (subtitle to display on screen)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Subtitle generator error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate subtitles',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MELOMOTION AI Core Engine',
    timestamp: new Date().toISOString(),
    capabilities: [
      'Universal Language Lyric Processing',
      'Audio & Vocal Rhythmic Analysis',
      'AI Lip-Sync Keyframing',
      'Face Identity Consistency Engine',
      'Cinematic Scene Director',
      'Multiformat Video Exporter (9:16, 16:9, 1:1)'
    ]
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MELOMOTION AI Server listening on port ${PORT}`);
  });
}

startServer();
