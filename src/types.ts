export type AspectRatio = '16:9' | '9:16' | '1:1';
export type ExportResolution = '480p' | '720p' | '1080p';

export interface SongData {
  id: string;
  title: string;
  artistName: string;
  genre: string;
  duration: number; // in seconds
  durationFormatted: string;
  detectedLanguage: string;
  languageCode: string;
  isMultilingual?: boolean;
  confidenceScore?: number;
  bpm: number;
  musicalKey: string;
  mood: string;
  audioUrl?: string; // object URL or synthesized
  file?: File;
  originalLyrics: string;
  lyricSections: LyricSection[];
  audioBuffer?: AudioBuffer;
}

export interface LyricSection {
  section: string;
  timestamp: string;
  startSec: number;
  endSec: number;
  originalLyrics: string;
  energyLevel: number; // 0 - 100
  vocalPhonetics?: string;
}

export interface ArtistIdentity {
  id: string;
  name: string;
  photoUrl: string;
  additionalPhotos?: string[];
  facialPreservationScore: number;
  hairStyle: string;
  skinTone: string;
  facialFeatures: string[];
  identityLockActive: boolean;
  isUploadedByUser: boolean;
}

export type MusicVideoStyleId =
  | 'realistic_cinematic'
  | 'hiphop_rap'
  | 'pop_music_video'
  | 'rnb_love_story'
  | 'rock_music_video'
  | 'kpop_style'
  | 'anime_music_video'
  | 'fantasy_cinematic'
  | 'emotional_storytelling'
  | 'concert_performance'
  | 'street_music_video'
  | 'luxury_lifestyle';

export interface MusicVideoStyle {
  id: MusicVideoStyleId;
  name: string;
  tagline: string;
  description: string;
  colorGrade: string;
  bgAtmosphere: string;
  cameraStyles: string[];
  vfxParticles: 'haze' | 'lasers' | 'rain' | 'bokeh' | 'sparkles' | 'fire' | 'anamorphic';
  accentColor: string;
  previewGradient: string;
}

export interface SceneDirectorShot {
  sceneIndex: number;
  title: string;
  timestamp: string;
  durationSec: number;
  startSec: number;
  endSec: number;
  shotType: string;
  cameraMotion: string;
  environment: string;
  lighting: string;
  artistAction: string;
  lipSyncIntensity: 'High' | 'Medium' | 'Low';
  visualEffects: string;
  lyricCue: string;
  bgImageUrl?: string;
}

export interface SubtitleCue {
  id: string;
  startSec: number;
  endSec: number;
  originalText: string;
  subtitleText: string;
}

export interface MusicVideoProject {
  id: string;
  createdAt: string;
  title: string;
  song: SongData;
  artist: ArtistIdentity;
  style: MusicVideoStyle;
  aspectRatio: AspectRatio;
  resolution: ExportResolution;
  subtitleLanguage: string; // 'original' or language name
  subtitles: SubtitleCue[];
  scenes: SceneDirectorShot[];
  directorVision?: string;
  isRendering?: boolean;
  renderProgress?: number;
  videoUrl?: string;
  isProPlan?: boolean;
}

export interface UserCredits {
  freeTakesRemaining: number;
  dailyMaxTakes: number;
  isPro: boolean;
  proExpiryDate?: string;
  lastRefillDate: string;
}
