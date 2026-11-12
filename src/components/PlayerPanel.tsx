import React, { useState } from 'react';
import {
  Trophy,
  Shield,
  Sparkles,
  Zap,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Package,
} from 'lucide-react';
import { GAME_TOKENS, POWERUP_DEFINITIONS } from '../data/boardConfig';
import { GameEngine } from '../engine/GameEngine';
import { Player, PowerUpType } from '../types/game';

interface PlayerPanelProps {
  engine: GameEngine;
  onUsePowerUp: (playerId: string, type: PowerUpType) => void;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ engine, onUsePowerUp }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    engine.players[0]?.id || ''
  );
  const [confirmUsePowerUp, setConfirmUsePowerUp] = useState<{
    playerId: string;
    type: PowerUpType;
  } | null>(null);

  const currentPlayer = engine.getCurrentPlayer();
  const selectedPlayer =
    engine.players.find((p) => p.id === selectedPlayerId) || engine.players[0];

  const recentEvents = engine.eventHistory
    .query({ sortOrder: 'desc' })
    .slice(0, 5);

  const handleConfirmUse = () => {
    if (confirmUsePowerUp) {
      onUsePowerUp(confirmUsePowerUp.playerId, confirmUsePowerUp.type);
      setConfirmUsePowerUp(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Player List Cards */}
      <div className="rounded-xl bg-[#090e1c] border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-['Outfit']">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Players & Standings</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {engine.players.filter((p) => p.isFinished).length}/{engine.players.length} Finished
          </span>
        </div>

        <div className="space-y-1.5">
          {engine.players.map((p) => {
            const isTurn = currentPlayer?.id === p.id && !engine.isGameOver;
            const isSelected = selectedPlayer?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/80 border-indigo-500/60'
                    : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/40'
                } ${isTurn ? 'ring-1 ring-amber-400/70 shadow-sm shadow-amber-400/20' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: p.color }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm"
                  >
                    {p.tokenSymbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white leading-none">
                        {p.name}
                      </span>
                      {p.isAI && (
                        <span className="text-[9px] text-purple-300 font-mono bg-purple-950/70 px-1 py-0.2 rounded">
                          AI
                        </span>
                      )}
                      {p.hasShield && (
                        <span title="Shield active">
                          <Shield className="h-3 w-3 text-emerald-400" />
                        </span>
                      )}
                      {p.hasDoubleScore && (
                        <span title="Double score active">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Cell {p.position}/40 · {p.tokens.length} Tokens
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400 font-mono">
                    {p.score} pts
                  </div>
                  {p.isFinished ? (
                    <span className="text-[9px] text-emerald-400 font-semibold">
                      Rank #{p.finishRank}
                    </span>
                  ) : isTurn ? (
                    <span className="text-[9px] text-amber-400 font-bold animate-pulse">
                      YOUR TURN
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Player Details (Tokens & Power-ups) */}
      {selectedPlayer && (
        <div className="rounded-xl bg-[#090e1c] border border-slate-800 p-3 shadow-lg space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {selectedPlayer.name}&apos;s Inventory
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Score: {selectedPlayer.score}
            </span>
          </div>

          {/* Tokens Collected (Linked List + HashSet representation) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <span>Data Tokens ({selectedPlayer.tokens.length}/13)</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">HashSet Verified</span>
            </div>

            {selectedPlayer.tokens.length === 0 ? (
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                No data tokens collected yet. Land on Token cells to collect!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedPlayer.tokens.map((tid) => {
                  const tok = Object.values(GAME_TOKENS).find((t) => t.id === tid);
                  return (
                    <div
                      key={tid}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/80 border border-indigo-500/30 text-[10px]"
                      title={`${tok?.name || tid}: ${tok?.description || ''}`}
                    >
                      <span className="text-sm shrink-0">{tok?.symbol || '💎'}</span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">
                          {tok?.name || tid}
                        </div>
                        <div className="text-[9px] text-cyan-400 font-mono">{tid}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Power-up Inventory */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Package className="h-3 w-3 text-sky-400" />
                <span>Power-ups ({selectedPlayer.powerUps.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Supply: 6 types</span>
            </div>

            {selectedPlayer.powerUps.length === 0 ? (
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                No power-ups in inventory. Land on Power-up cells to claim.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedPlayer.powerUps.map((type, idx) => {
                  const def = POWERUP_DEFINITIONS[type];
                  const isCurrent = currentPlayer?.id === selectedPlayer.id;
                  return (
                    <div
                      key={`${type}-${idx}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-[11px]"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <span style={{ color: def.color }}>●</span>
                          <span>{def.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          {def.description}
                        </div>
                      </div>

                      {isCurrent && !selectedPlayer.isAI && (
                        <button
                          onClick={() =>
                            setConfirmUsePowerUp({
                              playerId: selectedPlayer.id,
                              type,
                            })
                          }
                          className="px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors whitespace-nowrap cursor-pointer shrink-0 ml-2"
                        >
                          Use
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for using power-up */}
      {confirmUsePowerUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#0d1527] border border-slate-700 p-4 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Confirm Power-up Usage</span>
            </h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to activate{' '}
              <strong className="text-amber-400">
                {POWERUP_DEFINITIONS[confirmUsePowerUp.type]?.name}
              </strong>
              ? It will be consumed from your inventory and tracked in the used queue.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmUsePowerUp(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUse}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow cursor-pointer"
              >
                Activate Power-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Mini-Feed */}
      <div className="rounded-xl bg-[#090e1c] border border-slate-800 p-3 shadow-lg flex-1 flex flex-col min-h-[140px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-['Outfit']">
            Recent Activity
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {engine.eventHistory.count()} events
          </span>
        </div>

        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 text-[11px]">
          {recentEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-1.5 rounded-md bg-slate-900/60 border border-slate-800/80 leading-snug"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="font-semibold text-slate-300 truncate">
                  {evt.playerName}
                </span>
                <span className="font-mono text-[9px] text-indigo-400">
                  {evt.action}
                </span>
              </div>
              <div className="text-slate-300 text-[11px]">{evt.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
