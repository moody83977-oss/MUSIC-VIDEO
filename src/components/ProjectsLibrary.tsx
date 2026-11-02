import React from 'react';
import { MusicVideoProject } from '../types';
import { Play, Download, Trash2, Calendar, Music, Sparkles } from 'lucide-react';

interface ProjectsLibraryProps {
  projects: MusicVideoProject[];
  onOpenProject: (proj: MusicVideoProject) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsLibrary: React.FC<ProjectsLibraryProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
}) => {
  if (projects.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-neutral-900 border border-neutral-800">
        <Music className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white mb-1">No Music Videos Yet</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Create your first AI music video above! Upload your music and photo, choose your style, and preview the results.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">My Music Video Projects</h3>
          <p className="text-xs text-neutral-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {proj.createdAt}
                </span>
                <span className="font-mono text-purple-400 font-medium">
                  {proj.aspectRatio} · {proj.resolution}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={proj.artist.photoUrl}
                  alt={proj.artist.name}
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{proj.title}</h4>
                  <div className="text-xs text-neutral-400 truncate">
                    {proj.song.detectedLanguage} · {proj.style.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-900 flex items-center justify-between">
              <button
                onClick={() => onOpenProject(proj)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5 ml-0.5" />
                Play & Export
              </button>

              <button
                onClick={() => onDeleteProject(proj.id)}
                className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
