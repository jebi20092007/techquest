import React from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  BookOpen,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
  onRestartGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onRestartGame }) => {
  const isMuted = soundFx.getMuted();

  const toggleSound = () => {
    soundFx.setMuted(!isMuted);
    if (isMuted) {
      soundFx.playDiceRoll();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#0d1527] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#090e1c]">
          <div className="flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Settings & Rules Reference
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Sound Synthesizer Setting */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="font-bold text-white text-sm">Synthesized Audio Effects</div>
              <div className="text-slate-400 text-[11px]">
                Procedural Web Audio tones for dice rolls, token pickups & challenges.
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                !isMuted
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {!isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>{!isMuted ? 'ENABLED' : 'MUTED'}</span>
            </button>
          </div>

          {/* Quick Rules Breakdown */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-white text-sm font-['Outfit']">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>Core Rules Summary</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>
                <strong>Clockwise Movement:</strong> Roll the 6-sided dice to move forward.
              </li>
              <li>
                <strong>Finish & Bounce:</strong> Landing exactly on Cell 40 completes the quest. Excess movement bounces backward!
              </li>
              <li>
                <strong>Data Tokens (+5 pts):</strong> Stored via Linked List & HashSet. No duplicate points allowed per player.
              </li>
              <li>
                <strong>Power-ups (6 types):</strong> Shared initial supply of 3 each. Use Extra Move, Shield, Skip, etc.
              </li>
              <li>
                <strong>Algorithm Challenges:</strong> +8 pts on success; -5 pts on 1st fail with 1 retry allowed.
              </li>
              <li>
                <strong>Penalties (-5 pts):</strong> Blocked completely if you have an active Firewall Shield.
              </li>
              <li>
                <strong>Undo History:</strong> Powered by the LIFO Stack. Reverts all states atomically.
              </li>
            </ul>
          </div>

          {/* Restart Game Action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset the current game and clear saved state?')) {
                  localStorage.removeItem('TECH_QUEST_GAME_STATE_V1');
                  onRestartGame();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 rounded-xl cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Current Game</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
