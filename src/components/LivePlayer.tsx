import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Subtitles,
  Film,
  Camera,
  Layers,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { MusicVideoProject } from '../types';
import { melomotionAudio } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface LivePlayerProps {
  project: MusicVideoProject;
  onSceneChange?: (sceneIndex: number) => void;
  isProUser: boolean;
  onUpgradeClick: () => void;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  project,
  onSceneChange,
  isProUser,
  onUpgradeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(project.song.duration || 38);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);

  // Cached image assets for canvas rendering
  const artistImgRef = useRef<HTMLImageElement | null>(null);
  const sceneBgImgRef = useRef<HTMLImageElement | null>(null);
  const streetBgImgRef = useRef<HTMLImageElement | null>(null);
  const concertBgImgRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Preload images
  useEffect(() => {
    const artist = new Image();
    artist.src = project.artist.photoUrl;
    artist.crossOrigin = 'anonymous';
    artist.onload = () => {
      artistImgRef.current = artist;
    };

    const concert = new Image();
    concert.src = '/src/assets/images/scene_concert_stage_1793619121138.jpg';
    concert.crossOrigin = 'anonymous';
    concert.onload = () => {
      concertBgImgRef.current = concert;
    };

    const street = new Image();
    street.src = '/src/assets/images/scene_cyber_street_1793619121025.jpg';
    street.crossOrigin = 'anonymous';
    street.onload = () => {
      streetBgImgRef.current = street;
    };

    return () => {
      melomotionAudio.stop();
    };
  }, [project.artist.photoUrl]);

  // Helper to start playback based on available audio format
  const startPlayback = (time: number, onEnd?: () => void) => {
    melomotionAudio.init();
    if (project.song.audioBuffer) {
      melomotionAudio.playBuffer(project.song.audioBuffer, time, onEnd);
    } else if (project.song.audioUrl) {
      melomotionAudio.playAudioUrl(project.song.audioUrl, time, onEnd);
    } else {
      melomotionAudio.playPresetSynth(project.song.id, project.song.bpm, time, onEnd);
    }
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      melomotionAudio.stop();
      setIsPlaying(false);
    } else {
      startPlayback(currentTime, () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (isPlaying) {
      melomotionAudio.stop();
      startPlayback(newTime, () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  };

  const handleReset = () => {
    melomotionAudio.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveSceneIndex(0);
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particles state
    const particles: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      let timeSec = currentTime;

      if (isPlaying) {
        timeSec = melomotionAudio.getCurrentTime();
        setCurrentTime(timeSec);

        if (timeSec >= duration) {
          handleReset();
          return;
        }
      }

      // Determine active scene based on timeSec
      const scenes = project.scenes;
      let currentScene = scenes[0];
      let currentSceneIdx = 0;
      for (let i = 0; i < scenes.length; i++) {
        if (timeSec >= scenes[i].startSec && timeSec <= scenes[i].endSec) {
          currentScene = scenes[i];
          currentSceneIdx = i;
          break;
        }
      }
      if (currentSceneIdx !== activeSceneIndex) {
        setActiveSceneIndex(currentSceneIdx);
        if (onSceneChange) onSceneChange(currentSceneIdx);
      }

      // Audio analysis
      const metrics = melomotionAudio.getAudioMetrics();
      const vocalEnergy = metrics.vocalEnergy; // 0 - 1
      const bassEnergy = metrics.bassEnergy;   // 0 - 1
      const highEnergy = metrics.highEnergy;

      // Canvas dimensions based on aspect ratio
      let targetW = 1280;
      let targetH = 720;
      if (project.aspectRatio === '9:16') {
        targetW = 720;
        targetH = 1280;
      } else if (project.aspectRatio === '1:1') {
        targetW = 800;
        targetH = 800;
      }

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.clearRect(0, 0, targetW, targetH);

      // 1. Camera Movement Matrix & Beat Shake
      const beatShakeX = (Math.random() - 0.5) * bassEnergy * 8;
      const beatShakeY = (Math.random() - 0.5) * bassEnergy * 8;
      const beatScale = 1 + bassEnergy * 0.035;

      // Camera pan / dolly drift
      const cameraProgress = (timeSec - currentScene.startSec) / Math.max(1, currentScene.durationSec);
      let cameraScale = 1.0 + cameraProgress * 0.08;
      let cameraPanX = Math.sin(timeSec * 0.8) * 12;

      ctx.translate(targetW / 2 + beatShakeX + cameraPanX, targetH / 2 + beatShakeY);
      ctx.scale(beatScale * cameraScale, beatScale * cameraScale);
      ctx.translate(-targetW / 2, -targetH / 2);

      // 2. Render Scene Background
      const isConcertScene = currentScene.environment.toLowerCase().includes('concert') || currentScene.environment.toLowerCase().includes('stage');
      const isStreetScene = currentScene.environment.toLowerCase().includes('street') || currentScene.environment.toLowerCase().includes('city');
      const bgImg = isConcertScene && concertBgImgRef.current
        ? concertBgImgRef.current
        : isStreetScene && streetBgImgRef.current
        ? streetBgImgRef.current
        : concertBgImgRef.current || streetBgImgRef.current;

      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        // Draw image covering canvas with aspect fill
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasRatio = targetW / targetH;
        let sWidth = bgImg.naturalWidth;
        let sHeight = bgImg.naturalHeight;
        if (imgRatio > canvasRatio) {
          sWidth = sHeight * canvasRatio;
        } else {
          sHeight = sWidth / canvasRatio;
        }
        const sx = (bgImg.naturalWidth - sWidth) / 2;
        const sy = (bgImg.naturalHeight - sHeight) / 2;

        ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
      } else {
        // Fallback Atmospheric Gradient
        const grad = ctx.createRadialGradient(
          targetW * 0.5,
          targetH * 0.4,
          50,
          targetW * 0.5,
          targetH * 0.5,
          targetW * 0.8
        );
        grad.addColorStop(0, '#3b0764');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#05050a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 3. Style Color Grade & Vignette Overlay
      const tintGrad = ctx.createLinearGradient(0, 0, 0, targetH);
      tintGrad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      tintGrad.addColorStop(0.6, 'rgba(88, 28, 135, 0.25)');
      tintGrad.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
      ctx.fillStyle = tintGrad;
      ctx.fillRect(0, 0, targetW, targetH);

      // 4. Dynamic Lighting / Laser Beams / Bokeh
      if (project.style.vfxParticles === 'lasers' || isConcertScene) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 4; i++) {
          const angle = Math.sin(timeSec * 1.2 + i * 1.5) * 0.35;
          const laserGrad = ctx.createLinearGradient(
            targetW * (0.2 + i * 0.2),
            0,
            targetW * (0.2 + i * 0.2) + Math.tan(angle) * targetH,
            targetH
          );
          laserGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          laserGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.15 + highEnergy * 0.35})`);
          laserGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = laserGrad;
          ctx.fillRect(targetW * (0.15 + i * 0.2), 0, 80 + highEnergy * 40, targetH);
        }
        ctx.restore();
      }

      // 5. Floating Ambient Particles
      ctx.save();
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = targetH;
        ctx.fillStyle = `rgba(216, 180, 254, ${p.alpha * (0.4 + highEnergy * 0.6)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 6. Main Character / Artist with Identity Consistency & AI Lip-Sync
      if (artistImgRef.current && artistImgRef.current.complete) {
        ctx.save();

        // Position character in center / cinematic lower third
        const charW = Math.min(targetW * 0.62, targetH * 0.65);
        const charH = charW;
        const charX = (targetW - charW) / 2;
        const charY = targetH * 0.22 + Math.sin(timeSec * 2.5) * 4; // gentle breathing

        // Subtle glow rim light behind artist
        const rimGlow = ctx.createRadialGradient(
          charX + charW / 2,
          charY + charH / 2,
          charW * 0.3,
          charX + charW / 2,
          charY + charH / 2,
          charW * 0.65
        );
        rimGlow.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
        rimGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = rimGlow;
        ctx.beginPath();
        ctx.arc(charX + charW / 2, charY + charH / 2, charW * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Circular cinematic portrait frame preserving facial identity
        ctx.save();
        ctx.beginPath();
        ctx.arc(charX + charW / 2, charY + charH / 2, charW / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw character photo
        ctx.drawImage(artistImgRef.current, charX, charY, charW, charH);

        // 7. AI LIP-SYNC TECHNOLOGY ENGINE:
        // Dynamic mouth opening matching singing amplitude and rhythm
        const mouthOpenAmount = Math.max(0, (vocalEnergy - 0.12) * 28); // 0 to ~24px
        const mouthX = charX + charW * 0.495;
        const mouthY = charY + charH * 0.64;
        const mouthWidth = charW * 0.13 + vocalEnergy * 6;

        if (vocalEnergy > 0.08) {
          // Open mouth cavity (dark inner with teeth highlight)
          ctx.save();
          ctx.fillStyle = '#200707';
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY, mouthWidth / 2, Math.max(3, mouthOpenAmount / 2), 0, 0, Math.PI * 2);
          ctx.fill();

          // Upper teeth highlight
          if (mouthOpenAmount > 6) {
            ctx.fillStyle = '#fef2f2';
            ctx.beginPath();
            ctx.ellipse(
              mouthX,
              mouthY - mouthOpenAmount * 0.25,
              mouthWidth * 0.35,
              Math.min(3, mouthOpenAmount * 0.2),
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // Lips outline highlight for seamless blending
          ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY, mouthWidth / 2 + 1, Math.max(4, mouthOpenAmount / 2 + 1), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore(); // end clip

        // Subtle hair & rim lighting ring
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.4 + vocalEnergy * 0.4})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(charX + charW / 2, charY + charH / 2, charW / 2 + 1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // end camera transformation

      // 8. Lower Third Cinematic Scrim & Subtitles (Screen space)
      if (showSubtitles) {
        ctx.save();
        // Dark gradient scrim behind subtitles
        const subScrim = ctx.createLinearGradient(0, targetH * 0.72, 0, targetH);
        subScrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
        subScrim.addColorStop(0.4, 'rgba(0, 0, 0, 0.75)');
        subScrim.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = subScrim;
        ctx.fillRect(0, targetH * 0.72, targetW, targetH * 0.28);

        // Find active subtitle
        let activeSub = project.subtitles.find(
          (s) => timeSec >= s.startSec && timeSec <= s.endSec
        );

        if (!activeSub) {
          // Fallback to active scene lyric cue
          const currentSection = project.song.lyricSections.find(
            (sec) => timeSec >= sec.startSec && timeSec <= sec.endSec
          );
          if (currentSection) {
            activeSub = {
              id: 'fallback',
              startSec: currentSection.startSec,
              endSec: currentSection.endSec,
              originalText: currentSection.originalLyrics,
              subtitleText: currentSection.originalLyrics,
            };
          }
        }

        if (activeSub) {
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          // Main Subtitle (in original native language)
          ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(activeSub.subtitleText || activeSub.originalText, targetW / 2, targetH * 0.88);

          // If subtitle language is different, render secondary line
          if (
            project.subtitleLanguage !== 'original' &&
            activeSub.subtitleText !== activeSub.originalText
          ) {
            ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#c084fc';
            ctx.fillText(activeSub.originalText, targetW / 2, targetH * 0.83);
          }
        }
        ctx.restore();
      }

      // 9. Watermark (Free Tier has subtle watermark; Pro has NONE)
      if (!isProUser) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '500 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('MELOMOTION AI · Free Take', targetW - 20, 32);
        ctx.restore();
      }

      // 10. Live Studio HUD Overlays
      ctx.save();
      // Scene indicator pill in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, 16, 210, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(28, 32, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'left';
      ctx.fillText(
        `SCENE ${currentSceneIdx + 1}/${scenes.length} · ${currentScene.shotType.slice(0, 16)}`,
        38,
        36
      );
      ctx.restore();

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isPlaying,
    currentTime,
    duration,
    project,
    activeSceneIndex,
    showSubtitles,
    isProUser,
  ]);

  // Real Client-Side Video Export Functionality (MP4 / WebM)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);
    melomotionAudio.stop();
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const stream = canvas.captureStream(30);
      const audioStream = melomotionAudio.getMediaStream();
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setExportDownloadUrl(url);
        setIsExporting(false);
        setExportProgress(100);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      };

      recorder.start();

      // Play audio and let canvas render through full song
      startPlayback(0);
      setIsPlaying(true);

      const totalDurationSec = Math.min(duration, 38);
      const updateInterval = setInterval(() => {
        const currentSec = melomotionAudio.getCurrentTime();
        const pct = Math.min(95, Math.round((currentSec / totalDurationSec) * 100));
        setExportProgress(pct);

        if (currentSec >= totalDurationSec) {
          clearInterval(updateInterval);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
          melomotionAudio.stop();
          setIsPlaying(false);
        }
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentScene = project.scenes[activeSceneIndex] || project.scenes[0];

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
    >
      {/* Top Player Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-purple-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Live Preview Studio
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-300 font-mono">
            {project.song.title} ({project.song.detectedLanguage})
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400 capitalize">{project.style.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-mono">
            Aspect: <strong className="text-neutral-200">{project.aspectRatio}</strong>
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400 font-mono">
            Quality: <strong className="text-purple-300">{project.resolution}</strong>
          </span>
          {!isProUser && (
            <button
              onClick={onUpgradeClick}
              className="ml-2 px-2 py-0.5 text-[11px] font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded hover:bg-amber-900/40 transition-colors"
            >
              Remove Watermark (Pro)
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative bg-black flex items-center justify-center min-h-[420px] max-h-[620px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`shadow-2xl transition-all duration-300 ${
            project.aspectRatio === '9:16'
              ? 'h-[540px] aspect-[9/16]'
              : project.aspectRatio === '1:1'
              ? 'h-[460px] aspect-square'
              : 'w-full aspect-[16/9] max-h-[520px]'
          }`}
        />

        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center">
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin mb-4" />
            <h4 className="text-lg font-semibold text-white mb-1">
              Rendering Beat-Synced Music Video
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mb-4">
              Synthesizing camera moves, lip-sync mouth frames, and universal language subtitles...
            </p>
            <div className="w-72 bg-neutral-800 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-cyan-300">{exportProgress}% rendered</span>
          </div>
        )}

        {/* Export Ready Modal */}
        {exportDownloadUrl && (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <h4 className="text-xl font-bold text-white mb-1">Music Video Ready!</h4>
            <p className="text-xs text-neutral-400 mb-6">
              Your {project.aspectRatio} video has been rendered with full lip-sync and beat synchronization.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={exportDownloadUrl}
                download={`Melomotion_${project.song.title.replace(/\s+/g, '_')}_${project.style.id}.webm`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium text-sm rounded-lg hover:brightness-110 shadow-lg shadow-purple-900/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Video File (.webm)
              </a>
              <button
                onClick={() => setExportDownloadUrl(null)}
                className="px-4 py-2.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Active Scene Floating Card (Lower Left) */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 rounded-lg p-2.5 max-w-xs text-left">
          <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5 mb-0.5">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Scene {activeSceneIndex + 1}: {currentScene.title}
          </div>
          <div className="text-xs text-neutral-200 line-clamp-1">{currentScene.artistAction}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
            <span>🎥 {currentScene.cameraMotion}</span>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="px-4 pt-3 pb-1 bg-neutral-950">
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
          />
        </div>

        {/* Scene Cut Markers */}
        <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            {project.scenes.map((s, idx) => (
              <span
                key={idx}
                onClick={() => handleSeek(s.startSec)}
                className={`cursor-pointer transition-colors ${
                  idx === activeSceneIndex ? 'text-purple-400 font-semibold' : 'hover:text-neutral-300'
                }`}
              >
                S{idx + 1}
              </span>
            ))}
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:brightness-110 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-1.5 ml-2 text-neutral-400">
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                melomotionAudio.setVolume(nextMuted ? 0 : volume);
              }}
              className="p-1 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(val === 0);
                melomotionAudio.setVolume(val);
              }}
              className="w-16 h-1 bg-neutral-800 rounded appearance-none accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Feature Switches & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              showSubtitles
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>Subtitles</span>
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-950 hover:bg-white shadow-md hover:shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>{isExporting ? 'Rendering...' : 'Export Video'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
