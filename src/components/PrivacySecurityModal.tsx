import React from 'react';
import { X, ShieldCheck, Lock, Trash2, CheckCircle2 } from 'lucide-react';

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllUserData?: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  isOpen,
  onClose,
  onClearAllUserData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Artist Privacy & Face Protection</h3>
            <p className="text-xs text-neutral-400">
              Ethical AI commitment to artists, singers, and creators worldwide.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-neutral-300 leading-relaxed mb-8">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Zero Public Model Training</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              We never use your uploaded personal photos, portrait likenesses, or original audio stems to train public or commercial foundation models. Your biometric facial vectors are held in temporary memory strictly for rendering your music video.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ownership & Content Rights</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              You retain 100% intellectual property ownership of your original songs, vocals, and visual likeness. Users must only upload photos and songs that they own or hold authorized licensing for.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>One-Click Complete File Deletion</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              You have the right to erase all uploaded music files and face photos at any time. Clicking the button below wipes all stored browser caches and active session files immediately.
            </p>
            {onClearAllUserData && (
              <button
                onClick={() => {
                  onClearAllUserData();
                  onClose();
                }}
                className="mt-2 px-3 py-1.5 text-[11px] font-semibold text-red-300 bg-red-950/40 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Erase All My Uploaded Photos & Audio Now
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
