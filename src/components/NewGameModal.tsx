import React, { useState } from 'react';
import { Users, Bot, Sparkles, Play, X } from 'lucide-react';
import { Player } from '../types/game';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (players: Omit<Player, 'position' | 'score' | 'tokens' | 'powerUps' | 'hasShield' | 'hasDoubleScore' | 'isFinished' | 'movementHistory'>[]) => void;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
const DEFAULT_SYMBOLS = ['⚡', '💎', '🚀', '🛡️'];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [gameMode, setGameMode] = useState<'multiplayer' | 'ai'>('multiplayer');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [playerNames, setPlayerNames] = useState<string[]>([
    'Ada Lovelace',
    'Alan Turing',
    'Grace Hopper',
    'Claude Shannon',
  ]);

  if (!isOpen) return null;

  const handleStart = () => {
    const configured: Omit<Player, 'position' | 'score' | 'tokens' | 'powerUps' | 'hasShield' | 'hasDoubleScore' | 'isFinished' | 'movementHistory'>[] = [];

    if (gameMode === 'multiplayer') {
      for (let i = 0; i < playerCount; i++) {
        configured.push({
          id: `p${i + 1}`,
          name: playerNames[i] || `Player ${i + 1}`,
          color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          tokenSymbol: DEFAULT_SYMBOLS[i % DEFAULT_SYMBOLS.length],
          isAI: false,
        });
      }
    } else {
      // 1 Human + (playerCount - 1) AI
      configured.push({
        id: 'p1',
        name: playerNames[0] || 'Player 1',
        color: DEFAULT_COLORS[0],
        tokenSymbol: DEFAULT_SYMBOLS[0],
        isAI: false,
      });

      const aiNames = ['Bot Dijkstra', 'Bot Knuth', 'Bot Lovelace'];
      for (let i = 1; i < playerCount; i++) {
        configured.push({
          id: `ai_${i}`,
          name: aiNames[i - 1] || `AI Bot ${i}`,
          color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          tokenSymbol: ['🤖', '🧠', '⚙️'][i - 1] || '🤖',
          isAI: true,
          aiDifficulty,
        });
      }
    }

    onStartGame(configured);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1527] border border-indigo-500/50 p-5 sm:p-6 shadow-2xl shadow-indigo-500/20 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Configure New Tech Quest
              </h2>
              <div className="text-xs text-slate-400">
                Setup player roster, mode, and algorithmic difficulty
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Select Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGameMode('multiplayer')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'multiplayer'
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Mode A: Local Multiplayer</span>
            </button>

            <button
              onClick={() => setGameMode('ai')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'ai'
                  ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>Mode B: Play vs Computer</span>
            </button>
          </div>
        </div>

        {/* Player Count */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex justify-between">
            <span>Total Players: {playerCount}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {gameMode === 'ai'
                ? `1 Human + ${playerCount - 1} AI Bot${playerCount > 2 ? 's' : ''}`
                : `${playerCount} Human Players on 1 Device`}
            </span>
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  playerCount === count
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {count} Players
              </button>
            ))}
          </div>
        </div>

        {/* AI Difficulty (If Mode B) */}
        {gameMode === 'ai' && (
          <div className="space-y-2 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
            <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" />
              <span>AI Opponent Difficulty</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`py-1.5 text-xs font-bold rounded-lg border uppercase font-mono transition-all cursor-pointer ${
                    aiDifficulty === diff
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {aiDifficulty === 'easy' && 'Easy: Casual bot (50% challenge accuracy, holds powerups).'}
              {aiDifficulty === 'medium' && 'Medium: Competent bot (75% challenge accuracy, tactical powerup use).'}
              {aiDifficulty === 'hard' && 'Hard: Master algorithmic bot (95% challenge accuracy, aggressive play).'}
            </p>
          </div>
        )}

        {/* Player Names Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Player Names
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: gameMode === 'ai' ? 1 : playerCount }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: DEFAULT_COLORS[idx] }}
                >
                  {DEFAULT_SYMBOLS[idx]}
                </span>
                <input
                  type="text"
                  value={playerNames[idx] || ''}
                  onChange={(e) => {
                    const updated = [...playerNames];
                    updated[idx] = e.target.value;
                    setPlayerNames(updated);
                  }}
                  placeholder={`Player ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Launch Quest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
