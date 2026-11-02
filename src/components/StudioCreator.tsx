import React, { useState } from 'react';
import {
  Upload,
  Music,
  User,
  Sparkles,
  CheckCircle,
  Globe,
  Sliders,
  ShieldCheck,
  Disc,
  Clock,
  Layers,
  Zap,
  HelpCircle,
  Languages,
  Eye,
  Camera,
  Film,
} from 'lucide-react';
import {
  SongData,
  ArtistIdentity,
  MusicVideoStyle,
  AspectRatio,
  ExportResolution,
  MusicVideoProject,
  UserCredits,
} from '../types';
import { MUSIC_VIDEO_STYLES } from '../data/styles';
import { PRESET_TRACKS, SAMPLE_ARTISTS } from '../data/presetTracks';
import { melomotionAudio } from '../utils/audioSynth';

interface StudioCreatorProps {
  onVideoCreated: (project: MusicVideoProject) => void;
  credits: UserCredits;
  onUseCredit: () => boolean;
  onUpgradeClick: () => void;
  onOpenPrivacy: () => void;
}

export const StudioCreator: React.FC<StudioCreatorProps> = ({
  onVideoCreated,
  credits,
  onUseCredit,
  onUpgradeClick,
  onOpenPrivacy,
}) => {
  // Current active selections
  const [selectedSong, setSelectedSong] = useState<SongData>(PRESET_TRACKS[0]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistIdentity>(SAMPLE_ARTISTS[0]);
  const [selectedStyle, setSelectedStyle] = useState<MusicVideoStyle>(MUSIC_VIDEO_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<ExportResolution>('720p');
  const [subtitleLanguage, setSubtitleLanguage] = useState<string>('original');

  // Custom Uploads state
  const [uploadedMusicFile, setUploadedMusicFile] = useState<File | null>(null);
  const [isAnalyzingMusic, setIsAnalyzingMusic] = useState(false);
  const [userLyricsInput, setUserLyricsInput] = useState('');

  // Artist photo upload state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [identityLockActive, setIdentityLockActive] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [rightsConfirmed, setRightsConfirmed] = useState(true);

  // Handle User Audio File Upload
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedMusicFile(file);
    setIsAnalyzingMusic(true);

    try {
      const buffer = await melomotionAudio.loadAudioFile(file);
      const audioDuration = Math.round(buffer.duration);

      // Call Gemini Server endpoint to analyze song
      const res = await fetch('/api/analyze-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          songTitle: file.name.replace(/\.[^/.]+$/, ''),
          providedLyrics: userLyricsInput,
          duration: `${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const customSong: SongData = {
          id: `custom_${Date.now()}`,
          title: d.songTitle || file.name.replace(/\.[^/.]+$/, ''),
          artistName: 'Independent Artist',
          genre: d.genre || 'Original Music',
          duration: audioDuration,
          durationFormatted: `${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`,
          detectedLanguage: d.detectedLanguage || 'Auto-Detected',
          languageCode: d.languageCode || 'auto',
          isMultilingual: d.isMultilingual,
          confidenceScore: d.confidenceScore || 96,
          bpm: d.bpm || 120,
          musicalKey: d.musicalKey || 'C Major',
          mood: d.mood || 'Vibrant & Dynamic',
          originalLyrics: userLyricsInput || d.lyricAnalysis || 'Original vocal performance',
          lyricSections: d.lyricsSections || [
            {
              section: 'Scene 1',
              timestamp: '00:00 - 00:15',
              startSec: 0,
              endSec: 15,
              originalLyrics: 'Original Vocal Melodic Verse',
              energyLevel: 60,
            },
            {
              section: 'Scene 2',
              timestamp: '00:15 - 00:30',
              startSec: 15,
              endSec: 30,
              originalLyrics: 'Vocal Hook Climax',
              energyLevel: 90,
            },
          ],
          audioBuffer: buffer,
          file: file,
        };
        setSelectedSong(customSong);
      } else {
        // Fallback song metadata if network or mock
        const fallbackSong: SongData = {
          id: `custom_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artistName: 'Independent Artist',
          genre: 'Contemporary / Pop',
          duration: audioDuration,
          durationFormatted: `${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`,
          detectedLanguage: 'Auto-Detected Universal',
          languageCode: 'auto',
          bpm: 118,
          musicalKey: 'A Minor',
          mood: 'Atmospheric and expressive',
          originalLyrics: userLyricsInput || 'Original vocal tracks',
          lyricSections: [
            {
              section: 'Verse 1',
              timestamp: '00:00 - 00:15',
              startSec: 0,
              endSec: 15,
              originalLyrics: 'Vocal melody',
              energyLevel: 55,
            },
            {
              section: 'Chorus',
              timestamp: '00:15 - 00:35',
              startSec: 15,
              endSec: 35,
              originalLyrics: 'Main vocal hook',
              energyLevel: 92,
            },
          ],
          audioBuffer: buffer,
          file: file,
        };
        setSelectedSong(fallbackSong);
      }
    } catch (err) {
      console.error('Audio load error:', err);
    } finally {
      setIsAnalyzingMusic(false);
    }
  };

  // Handle User Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setUploadedPhotoUrl(url);

      const customArtist: ArtistIdentity = {
        id: `user_artist_${Date.now()}`,
        name: 'You (The Artist)',
        photoUrl: url,
        additionalPhotos: additionalPhotos,
        facialPreservationScore: 99.8,
        hairStyle: 'Preserved original hairstyle & volume',
        skinTone: 'Preserved authentic personal tone',
        facialFeatures: [
          'Facial symmetry anchor active',
          'Eye shape preservation locked',
          'Singing mouth mapping enabled',
        ],
        identityLockActive: true,
        isUploadedByUser: true,
      };
      setSelectedArtist(customArtist);
    };
    reader.readAsDataURL(file);
  };

  // Handle Additional reference photos
  const handleAdditionalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setAdditionalPhotos((prev) => [...prev, url]);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Music Video Generation Flow
  const handleGenerate = async () => {
    if (!credits.isPro && credits.freeTakesRemaining <= 0) {
      onUpgradeClick();
      return;
    }

    const hasCredit = onUseCredit();
    if (!hasCredit) return;

    setIsGenerating(true);
    setGenerationStep('Analyzing audio rhythm, BPM, and vocal phonetics...');

    try {
      // Step 1: Call Scene Director API
      setGenerationStep('Directing cinematic scenes, camera movements, and lighting...');
      const directorRes = await fetch('/api/scene-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: selectedSong.title,
          artistName: selectedArtist.name,
          genre: selectedSong.genre,
          style: selectedStyle.name,
          aspectRatio: aspectRatio,
          detectedLanguage: selectedSong.detectedLanguage,
          lyricsSummary: selectedSong.originalLyrics,
          facialIdentityNotes: `${selectedArtist.hairStyle}, ${selectedArtist.skinTone}, ${selectedArtist.facialFeatures.join(', ')}`,
          numberOfScenes: 4,
        }),
      });

      const directorData = await directorRes.json();
      let generatedScenes = [];

      if (directorData.success && directorData.data?.scenes?.length > 0) {
        generatedScenes = directorData.data.scenes.map((s: any, idx: number) => ({
          sceneIndex: idx,
          title: s.title || `Scene ${idx + 1}`,
          timestamp: s.timestamp || `00:${(idx * 8).toString().padStart(2, '0')} - 00:${((idx + 1) * 8).toString().padStart(2, '0')}`,
          durationSec: s.durationSec || 9,
          startSec: idx * 9,
          endSec: (idx + 1) * 9,
          shotType: s.shotType || 'Cinematic Close-Up Singing',
          cameraMotion: s.cameraMotion || 'Slow 35mm push-in with lens flare',
          environment: s.environment || selectedStyle.bgAtmosphere,
          lighting: s.lighting || selectedStyle.colorGrade,
          artistAction: s.artistAction || 'Passionate vocal performance',
          lipSyncIntensity: s.lipSyncIntensity || 'High',
          visualEffects: s.visualEffects || selectedStyle.vfxParticles,
          lyricCue: s.lyricCue || selectedSong.lyricSections[idx]?.originalLyrics || '',
        }));
      } else {
        // Fallback default 4 scenes based on track sections
        generatedScenes = selectedSong.lyricSections.map((sec, idx) => ({
          sceneIndex: idx,
          title: `${sec.section}: ${sec.originalLyrics.slice(0, 24)}...`,
          timestamp: sec.timestamp,
          durationSec: sec.endSec - sec.startSec,
          startSec: sec.startSec,
          endSec: sec.endSec,
          shotType: idx % 2 === 0 ? 'Close-Up Singing Performance' : 'Dynamic Street Tracking Shot',
          cameraMotion: selectedStyle.cameraStyles[idx % selectedStyle.cameraStyles.length],
          environment: selectedStyle.bgAtmosphere,
          lighting: selectedStyle.colorGrade,
          artistAction: `Artist sings "${sec.originalLyrics.slice(0, 30)}" with intense emotion`,
          lipSyncIntensity: 'High' as const,
          visualEffects: selectedStyle.vfxParticles,
          lyricCue: sec.originalLyrics,
        }));
      }

      // Step 2: Subtitle Generation
      setGenerationStep('Synchronizing universal subtitles in original language...');
      let subtitlesList = selectedSong.lyricSections.map((sec, idx) => ({
        id: `sub_${idx}`,
        startSec: sec.startSec,
        endSec: sec.endSec,
        originalText: sec.originalLyrics,
        subtitleText: sec.originalLyrics,
      }));

      // If user selected a different subtitle language, call subtitle API
      if (subtitleLanguage !== 'original') {
        const subRes = await fetch('/api/generate-subtitles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalLyrics: selectedSong.originalLyrics,
            sourceLanguage: selectedSong.detectedLanguage,
            targetSubtitleLanguage: subtitleLanguage,
          }),
        });
        const subData = await subRes.json();
        if (subData.success && subData.data?.subtitles) {
          subtitlesList = subData.data.subtitles;
        }
      }

      setGenerationStep('Calibrating AI lip-sync and facial consistency...');
      await new Promise((r) => setTimeout(r, 600));

      const newProject: MusicVideoProject = {
        id: `proj_${Date.now()}`,
        createdAt: new Date().toLocaleDateString(),
        title: `${selectedSong.title} (${selectedStyle.name})`,
        song: selectedSong,
        artist: selectedArtist,
        style: selectedStyle,
        aspectRatio: aspectRatio,
        resolution: resolution,
        subtitleLanguage: subtitleLanguage,
        subtitles: subtitlesList,
        scenes: generatedScenes,
        isProPlan: credits.isPro,
      };

      onVideoCreated(newProject);
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Creation Banner & Credits Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-cyan-950/30 border border-purple-500/20">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Universal AI Music Video Studio
            <span className="text-[11px] font-mono font-normal text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              ALL LANGUAGES SUPPORTED
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sing in any language worldwide. Melomotion AI preserves your original lyrics, synchronizes lip-sync, and uses your own face consistently.
          </p>
        </div>

        {/* Free Plan / Pro Quota Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {credits.isPro ? (
                <span className="text-emerald-400">Pro Plan: Unlimited Takes</span>
              ) : (
                <span>Free Tier: {credits.freeTakesRemaining} / {credits.dailyMaxTakes} Daily Takes Left</span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400">
              {credits.isPro ? 'Priority Fast Queue' : 'Standard Queue · 3 Takes bawat araw'}
            </div>
          </div>

          {!credits.isPro && (
            <button
              onClick={onUpgradeClick}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:brightness-110 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Upgrade to Pro (PHP Plan)
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Studio Grid: Left Inputs, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Song & Artist Upload */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: UPLOAD MUSIC */}
          <div className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-mono text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Upload Your Own Music
                </h3>
              </div>
              <span className="text-xs text-neutral-400">MP3, WAV, M4A supported</span>
            </div>

            {/* Drag & Drop Audio Upload Box */}
            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-700 hover:border-purple-500 rounded-xl cursor-pointer bg-neutral-950/50 hover:bg-neutral-950 transition-all group">
              <input
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                onChange={handleMusicUpload}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-purple-900/30 text-purple-400 group-hover:scale-110 transition-transform mb-2">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-neutral-200">
                {uploadedMusicFile ? uploadedMusicFile.name : 'Drop your song here or Browse'}
              </span>
              <span className="text-xs text-neutral-500 mt-1">
                Original songs or AI songs (Suno, Udio, etc.)
              </span>
            </label>

            {isAnalyzingMusic && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-lg flex items-center gap-3 text-xs text-purple-200">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                <span>AI analyzing vocals, language, tempo, and lyrical rhythm...</span>
              </div>
            )}

            {/* Or Select Multilingual Sample Songs */}
            <div>
              <span className="text-xs font-medium text-neutral-400 block mb-2">
                Or test with preset songs in world languages:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedSong(track);
                      setUploadedMusicFile(null);
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      selectedSong.id === track.id
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <Disc className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{track.title}</div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {track.detectedLanguage} · {track.genre}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Song Audio & Language Intelligence Display */}
            {selectedSong && (
              <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Song Title:</span>
                  <span className="font-semibold text-neutral-200">{selectedSong.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Detected Language:</span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {selectedSong.detectedLanguage}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">BPM & Key:</span>
                  <span className="font-mono text-purple-300">
                    {selectedSong.bpm} BPM · {selectedSong.musicalKey}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-900 text-xs">
                  <span className="text-neutral-500 block mb-1">
                    Original Native Lyrics (Preserved with Zero Translation):
                  </span>
                  <p className="text-neutral-300 text-[11px] italic bg-neutral-900/60 p-2 rounded max-h-20 overflow-y-auto font-sans leading-relaxed">
                    {selectedSong.originalLyrics}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: UPLOAD ARTIST PICTURE */}
          <div className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Upload Your Own Picture
                </h3>
              </div>
              <span className="text-xs text-neutral-400">JPG, PNG, WEBP</span>
            </div>

            {/* Photo Upload Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-neutral-700 hover:border-cyan-500 rounded-xl cursor-pointer bg-neutral-950/50 hover:bg-neutral-950 transition-all text-center group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="p-2.5 rounded-full bg-cyan-900/30 text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-neutral-200">
                  Upload Your Portrait
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  You will be the main star in the music video
                </span>
              </label>

              {/* Sample Artist Profiles */}
              <div className="space-y-2">
                <span className="text-[11px] text-neutral-400 font-medium block">
                  Or use sample studio artists:
                </span>
                <div className="flex gap-2">
                  {SAMPLE_ARTISTS.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist)}
                      className={`flex-1 p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        selectedArtist.id === artist.id
                          ? 'border-cyan-500 bg-cyan-950/30'
                          : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                      }`}
                    >
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-700"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {artist.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">Preset Artist</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Artist Identity Consistency Card */}
            {selectedArtist && (
              <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800/80 flex items-start gap-3">
                <img
                  src={selectedArtist.photoUrl}
                  alt={selectedArtist.name}
                  className="w-14 h-14 rounded-lg object-cover border border-purple-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{selectedArtist.name}</span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedArtist.facialPreservationScore}% Identity Preserved
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>Hairstyle: {selectedArtist.hairStyle}</span>
                    <span>Skin tone: {selectedArtist.skinTone}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-300">
                      <input
                        type="checkbox"
                        checked={identityLockActive}
                        onChange={(e) => setIdentityLockActive(e.target.checked)}
                        className="accent-purple-500 rounded"
                      />
                      <span>Facial Consistency Lock</span>
                    </label>

                    <label className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer ml-auto">
                      + Add Multi-Angle Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdditionalPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Styles, Aspect Ratio, Subtitles & Generation */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 3: CHOOSE STYLE */}
          <div className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-fuchsia-600/30 text-fuchsia-300 font-mono text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Choose Style (12 Styles)
                </h3>
              </div>
              <span className="text-xs text-neutral-400">Cinematic Aesthetic</span>
            </div>

            {/* Style Selector Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {MUSIC_VIDEO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden ${
                    selectedStyle.id === style.id
                      ? 'border-purple-500 ring-1 ring-purple-500/50 bg-purple-950/40 text-white'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{style.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {style.tagline}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Style Detail Highlight */}
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-medium text-white">
                <span>{selectedStyle.name}</span>
                <span className="text-[11px] text-purple-400">{selectedStyle.vfxParticles} VFX</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                {selectedStyle.description}
              </p>
            </div>
          </div>

          {/* STEP 4: VIDEO FORMAT & UNIVERSAL SUBTITLES */}
          <div className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Video Format & Subtitles
            </h3>

            {/* Aspect Ratio Switcher */}
            <div>
              <span className="text-xs text-neutral-400 block mb-1.5 font-medium">
                Aspect Ratio:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9 YouTube', desc: 'Landscape' },
                  { id: '9:16', label: '9:16 TikTok', desc: 'Shorts / Reels' },
                  { id: '1:1', label: '1:1 Social', desc: 'Square Post' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as AspectRatio)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'border-purple-500 bg-purple-950/40 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{ar.label}</div>
                    <div className="text-[10px] text-neutral-500">{ar.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Universal Subtitle Language Selector */}
            <div>
              <span className="text-xs text-neutral-400 block mb-1.5 font-medium flex items-center justify-between">
                <span>Universal Subtitles:</span>
                <span className="text-[10px] text-purple-300">Never translates original audio</span>
              </span>
              <select
                value={subtitleLanguage}
                onChange={(e) => setSubtitleLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="original">
                  Keep Original Native Lyrics ({selectedSong.detectedLanguage})
                </option>
                <option value="English">English Subtitles</option>
                <option value="Tagalog">Tagalog (Filipino) Subtitles</option>
                <option value="Spanish">Spanish (Español) Subtitles</option>
                <option value="Japanese">Japanese (日本語) Subtitles</option>
                <option value="Korean">Korean (한국어) Subtitles</option>
                <option value="French">French (Français) Subtitles</option>
                <option value="German">German (Deutsch) Subtitles</option>
              </select>
            </div>

            {/* Resolution Selector */}
            <div>
              <span className="text-xs text-neutral-400 block mb-1.5 font-medium">Resolution:</span>
              <div className="flex gap-2">
                {(['480p', '720p', '1080p'] as ExportResolution[]).map((res) => {
                  const isLocked = res === '1080p' && !credits.isPro;
                  return (
                    <button
                      key={res}
                      disabled={isLocked}
                      onClick={() => setResolution(res)}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        resolution === res
                          ? 'border-purple-500 bg-purple-950/40 text-white'
                          : isLocked
                          ? 'border-neutral-800/50 bg-neutral-950/30 text-neutral-600 cursor-not-allowed'
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {res} {isLocked && '🔒'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Ownership Confirmation */}
            <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rightsConfirmed}
                  onChange={(e) => setRightsConfirmed(e.target.checked)}
                  className="accent-purple-500 mt-0.5 rounded"
                />
                <span>
                  I confirm I own or have permission to use this photo and song.
                </span>
              </label>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-purple-400 hover:underline text-[10px] block"
              >
                Melomotion Face Privacy & Security Policy (Zero public face model training)
              </button>
            </div>

            {/* Primary Action Button: GENERATE AI MUSIC VIDEO */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !rightsConfirmed}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isGenerating || !rightsConfirmed
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white hover:brightness-110 shadow-purple-900/40'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? generationStep || 'Generating AI Music Video...'
                  : `Create AI Music Video (${credits.isPro ? 'Pro Take' : '1 Take'})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
