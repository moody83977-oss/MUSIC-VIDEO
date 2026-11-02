import React from 'react';
import { Sparkles, Crown, Shield } from 'lucide-react';
import { UserCredits } from '../types';

interface TopNavigationProps {
  activeTab: 'creator' | 'player' | 'director' | 'projects';
  setActiveTab: (tab: 'creator' | 'player' | 'director' | 'projects') => void;
  credits: UserCredits;
  onOpenPricing: () => void;
  onOpenPrivacy: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  credits,
  onOpenPricing,
  onOpenPrivacy,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('creator');
          }}
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-purple-900/30 font-black text-sm">
            M
          </span>
          MELOMOTION AI
        </a>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line text links) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => setActiveTab('creator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'creator' ? 'text-purple-300 font-semibold' : ''
          }`}
        >
          Studio Creator
        </button>
        <button
          onClick={() => setActiveTab('player')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'player' ? 'text-purple-300 font-semibold' : ''
          }`}
        >
          Live Player
        </button>
        <button
          onClick={() => setActiveTab('director')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'director' ? 'text-purple-300 font-semibold' : ''
          }`}
        >
          Scene Director
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'projects' ? 'text-purple-300 font-semibold' : ''
          }`}
        >
          My Projects
        </button>
        <button
          onClick={onOpenPricing}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-amber-400/90"
        >
          Plans & Pricing (PHP)
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg hover:brightness-110 shadow-md shadow-purple-900/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>{credits.isPro ? 'Pro Active' : 'Upgrade to Pro'}</span>
        </button>
      </div>
    </header>
  );
};
