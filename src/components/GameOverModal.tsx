import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import { GameEngine } from '../engine/GameEngine';

interface GameOverModalProps {
  engine: GameEngine;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onPlayAgain }) => {
  const rankings = engine.scoreMap.displayRanking(engine.players);
  const winner = rankings[0]?.player;

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Graceful fallback if blocked
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#111c38] to-[#090e1c] border-2 border-amber-500/60 p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center space-y-6">
        {/* Trophy & Victor Announcement */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/30">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            QUEST TRIUMPH · ALL NODES TRAVERSED
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            {winner?.name} Victorious!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            All players completed the perimeter and crossed Cell 40 into the singularity.
            Tournament rankings computed live via the Score HashMap.
          </p>
        </div>

        {/* Podium Standings Table */}
        <div className="space-y-2 text-left">
          {rankings.map((rank) => {
            const isWinner = rank.rank === 1;
            return (
              <div
                key={rank.player.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isWinner
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{rank.rank}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{rank.player.name}</span>
                      {rank.player.isAI && (
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-950 px-1 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tokens: {rank.player.tokens.length}/13 · Finish Order: #{rank.player.finishRank}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-amber-400 font-mono">
                    {rank.score} pts
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Final Score
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play Again Action */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/30 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Embark on New Quest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
