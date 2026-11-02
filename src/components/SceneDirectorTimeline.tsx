import React from 'react';
import { SceneDirectorShot, MusicVideoStyle } from '../types';
import { Camera, Film, Sun, Mic2, Sparkles, SlidersHorizontal, Play } from 'lucide-react';

interface SceneDirectorTimelineProps {
  scenes: SceneDirectorShot[];
  activeSceneIndex: number;
  onSelectScene: (idx: number) => void;
  style: MusicVideoStyle;
  onUpdateScene?: (idx: number, updated: Partial<SceneDirectorShot>) => void;
}

export const SceneDirectorTimeline: React.FC<SceneDirectorTimelineProps> = ({
  scenes,
  activeSceneIndex,
  onSelectScene,
  style,
  onUpdateScene,
}) => {
  return (
    <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" />
            AI Scene Director Storyboard
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronized cuts based on musical energy, lyrics, and rhythm.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span>{scenes.length} Scenes</span>
          <span>·</span>
          <span>Style: {style.name}</span>
        </div>
      </div>

      {/* Storyboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;
          return (
            <div
              key={scene.sceneIndex ?? idx}
              onClick={() => onSelectScene(idx)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/50'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950'
              }`}
            >
              <div>
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Scene {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {scene.timestamp}
                  </span>
                </div>

                {/* Shot Type & Environment */}
                <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {scene.shotType}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                  {scene.artistAction}
                </p>
              </div>

              {/* Camera & Lighting Specs */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[10px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{scene.cameraMotion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{scene.lighting}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mic2 className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate text-purple-300">
                    Lip-Sync: {scene.lipSyncIntensity}
                  </span>
                </div>

                {scene.lyricCue && (
                  <div className="mt-1 pt-1 border-t border-neutral-900 text-neutral-300 italic truncate">
                    "{scene.lyricCue}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
