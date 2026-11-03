/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { StudioCreator } from './components/StudioCreator';
import { LivePlayer } from './components/LivePlayer';
import { SceneDirectorTimeline } from './components/SceneDirectorTimeline';
import { ProjectsLibrary } from './components/ProjectsLibrary';
import { PricingModal } from './components/PricingModal';
import { PrivacySecurityModal } from './components/PrivacySecurityModal';
import {
  MusicVideoProject,
  UserCredits,
  SceneDirectorShot,
} from './types';
import { PRESET_TRACKS, SAMPLE_ARTISTS } from './data/presetTracks';
import { MUSIC_VIDEO_STYLES } from './data/styles';
import {
  Sparkles,
  Shield,
  Layers,
  Film,
  Music,
  Share2,
  CheckCircle,
  Clock,
  Radio,
  Sliders,
  Globe,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'creator' | 'player' | 'director' | 'projects'>('creator');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // User Credits & Plan State
  const [credits, setCredits] = useState<UserCredits>(() => {
    const saved = localStorage.getItem('melomotion_credits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      freeTakesRemaining: 3,
      dailyMaxTakes: 3,
      isPro: false,
      lastRefillDate: new Date().toDateString(),
    };
  });

  // Default initial project
  const createDefaultProject = (): MusicVideoProject => {
    const defaultSong = PRESET_TRACKS[0]; // Tagalog OPM
    const defaultArtist = SAMPLE_ARTISTS[0]; // Aria Vane
    const defaultStyle = MUSIC_VIDEO_STYLES[0]; // Realistic Cinematic

    const defaultScenes: SceneDirectorShot[] = [
      {
        sceneIndex: 0,
        title: 'Atmospheric Intro: Midnight Horizon',
        timestamp: '00:00 - 00:09',
        durationSec: 9,
        startSec: 0,
        endSec: 9,
        shotType: 'Extreme Close-Up Singing',
        cameraMotion: 'Slow 35mm push-in with lens flare',
        environment: 'Cinematic Concert Arena with subtle haze',
        lighting: 'Deep violet backlight with cool cyan rim light',
        artistAction: 'Artist gazes into camera, singing the opening phrase with emotional intensity',
        lipSyncIntensity: 'High',
        visualEffects: 'haze',
        lyricCue: defaultSong.lyricSections[0].originalLyrics,
      },
      {
        sceneIndex: 1,
        title: 'Verse Build-Up: Urban Boulevard',
        timestamp: '00:09 - 00:18',
        durationSec: 9,
        startSec: 9,
        endSec: 18,
        shotType: 'Low-Angle Tracking Walk',
        cameraMotion: 'Dynamic backward tracking steadicam',
        environment: 'Rainy neon boulevard with wet street reflections',
        lighting: 'Neon magenta and streetlamp golden bokeh',
        artistAction: 'Artist walks toward camera while delivering passionate lyrics',
        lipSyncIntensity: 'High',
        visualEffects: 'bokeh',
        lyricCue: defaultSong.lyricSections[1].originalLyrics,
      },
      {
        sceneIndex: 2,
        title: 'Chorus Drop: Stadium Pyro Explosion',
        timestamp: '00:18 - 00:28',
        durationSec: 10,
        startSec: 18,
        endSec: 28,
        shotType: 'Wide 360 Arena Jib Crane',
        cameraMotion: 'Fast sweeping orbit revealing cheering crowd',
        environment: 'Monumental 50,000-seat festival stage',
        lighting: 'Blinding electric cyan & violet laser beams',
        artistAction: 'Artist holds microphone high and belts out the chorus anthem',
        lipSyncIntensity: 'High',
        visualEffects: 'lasers',
        lyricCue: defaultSong.lyricSections[2].originalLyrics,
      },
      {
        sceneIndex: 3,
        title: 'Outro Climax: Celestial Silhouette',
        timestamp: '00:28 - 00:38',
        durationSec: 10,
        startSec: 28,
        endSec: 38,
        shotType: 'Macro Emotional Silhouette',
        cameraMotion: 'Gentle slow pan into starry sky horizon',
        environment: 'Open skyline with falling sparklers and starlight',
        lighting: 'Golden hour backlight with warm rim light',
        artistAction: 'Final sustained vocal note with resonant vibrato',
        lipSyncIntensity: 'Medium',
        visualEffects: 'sparkles',
        lyricCue: defaultSong.lyricSections[3].originalLyrics,
      },
    ];

    return {
      id: 'default_opm_video',
      createdAt: new Date().toLocaleDateString(),
      title: `${defaultSong.title} (Official AI Music Video)`,
      song: defaultSong,
      artist: defaultArtist,
      style: defaultStyle,
      aspectRatio: '16:9',
      resolution: '720p',
      subtitleLanguage: 'original',
      subtitles: defaultSong.lyricSections.map((sec, idx) => ({
        id: `sub_${idx}`,
        startSec: sec.startSec,
        endSec: sec.endSec,
        originalText: sec.originalLyrics,
        subtitleText: sec.originalLyrics,
      })),
      scenes: defaultScenes,
      isProPlan: false,
    };
  };

  const sanitizeProjectAssets = (proj: MusicVideoProject): MusicVideoProject => {
    if (!proj) return proj;
    if (proj.artist?.photoUrl && proj.artist.photoUrl.startsWith('/src/assets/')) {
      proj.artist.photoUrl = proj.artist.photoUrl.replace('/src/assets/', '/assets/');
    }
    return proj;
  };

  // Projects State
  const [currentProject, setCurrentProject] = useState<MusicVideoProject>(() => {
    const saved = localStorage.getItem('melomotion_current_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return sanitizeProjectAssets(parsed);
      } catch (e) {
        // fallback
      }
    }
    return createDefaultProject();
  });

  const [savedProjects, setSavedProjects] = useState<MusicVideoProject[]>(() => {
    const saved = localStorage.getItem('melomotion_projects');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        return Array.isArray(list) ? list.map(sanitizeProjectAssets) : [createDefaultProject()];
      } catch (e) {
        // fallback
      }
    }
    return [createDefaultProject()];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('melomotion_credits', JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('melomotion_current_project', JSON.stringify(currentProject));
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem('melomotion_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const handleUseCredit = (): boolean => {
    if (credits.isPro) return true;
    if (credits.freeTakesRemaining > 0) {
      setCredits((prev) => ({
        ...prev,
        freeTakesRemaining: prev.freeTakesRemaining - 1,
      }));
      return true;
    }
    return false;
  };

  const handleSelectPro = () => {
    setCredits((prev) => ({
      ...prev,
      isPro: true,
      freeTakesRemaining: 9999,
    }));
  };

  const handleVideoCreated = (newProject: MusicVideoProject) => {
    setCurrentProject(newProject);
    setSavedProjects((prev) => [newProject, ...prev]);
    setActiveTab('player');
  };

  const handleClearAllData = () => {
    localStorage.removeItem('melomotion_projects');
    localStorage.removeItem('melomotion_current_project');
    const fresh = createDefaultProject();
    setCurrentProject(fresh);
    setSavedProjects([fresh]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-600/30 selection:text-purple-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={credits}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workspace Mode Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'creator'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Studio Creator
            </button>
            <button
              onClick={() => setActiveTab('player')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'player'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              Live Video Preview
            </button>
            <button
              onClick={() => setActiveTab('director')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'director'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Scene Director
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              My Projects ({savedProjects.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Universal Languages Active
            </span>
            <span>·</span>
            <span className="text-cyan-400">Lip-Sync V2</span>
          </div>
        </div>

        {/* View Mode Switching */}
        {activeTab === 'creator' && (
          <StudioCreator
            onVideoCreated={handleVideoCreated}
            credits={credits}
            onUseCredit={handleUseCredit}
            onUpgradeClick={() => setIsPricingOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}

        {activeTab === 'player' && (
          <div className="space-y-6">
            <LivePlayer
              project={currentProject}
              onSceneChange={(idx) => setActiveSceneIndex(idx)}
              isProUser={credits.isPro}
              onUpgradeClick={() => setIsPricingOpen(true)}
            />

            <SceneDirectorTimeline
              scenes={currentProject.scenes}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={(idx) => setActiveSceneIndex(idx)}
              style={currentProject.style}
            />
          </div>
        )}

        {activeTab === 'director' && (
          <div className="space-y-6">
            <SceneDirectorTimeline
              scenes={currentProject.scenes}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={(idx) => {
                setActiveSceneIndex(idx);
                setActiveTab('player');
              }}
              style={currentProject.style}
            />

            <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
              <h4 className="text-sm font-semibold text-white mb-2">Director Vision</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {currentProject.directorVision ||
                  `Cinematic narrative tailored to ${currentProject.song.title} (${currentProject.song.detectedLanguage}). Emphasizes character facial consistency, authentic vocal mouth shapes, and beat-aligned cuts matching ${currentProject.song.bpm} BPM tempo.`}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectsLibrary
            projects={savedProjects}
            onOpenProject={(proj) => {
              setCurrentProject(proj);
              setActiveTab('player');
            }}
            onDeleteProject={(id) => {
              setSavedProjects((prev) => prev.filter((p) => p.id !== id));
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">MELOMOTION AI</span>
            <span>·</span>
            <span>Universal AI Music Video Creator</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Privacy & Face Rights
            </button>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Pricing & PHP Plans
            </button>
            <span>© 2026 Melomotion AI Inc.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        isPro={credits.isPro}
        onSelectPro={handleSelectPro}
      />

      <PrivacySecurityModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onClearAllUserData={handleClearAllData}
      />
    </div>
  );
}
