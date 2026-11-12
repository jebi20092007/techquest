import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Flag,
  Cpu,
  Layers,
} from 'lucide-react';
import { BOARD_CELLS, GAME_TOKENS, POWERUP_DEFINITIONS } from '../data/boardConfig';
import { GameEngine } from '../engine/GameEngine';
import { CellInfo, CellType, Player } from '../types/game';
import { DiceRoll } from './DiceRoll';

interface BoardProps {
  engine: GameEngine;
}

export const Board: React.FC<BoardProps> = ({ engine }) => {
  const currentPlayer = engine.getCurrentPlayer();
  const latestOp = engine.latestOperation;

  // Render cell icon & badge based on cell type
  const renderCellVisuals = (cell: CellInfo) => {
    switch (cell.type) {
      case 'finish':
        return {
          icon: <Flag className="h-3.5 w-3.5 text-amber-400" />,
          bg: 'bg-amber-950/40 border-amber-500/70 text-amber-300',
          badge: 'FINISH',
          badgeColor: 'text-amber-400',
        };
      case 'token': {
        const token = GAME_TOKENS[cell.id];
        return {
          icon: <span className="text-xs">{token?.symbol || '💎'}</span>,
          bg: 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300 hover:border-indigo-400',
          badge: `+5 PTS`,
          badgeColor: 'text-cyan-400',
        };
      }
      case 'powerup':
        return {
          icon: <Sparkles className="h-3.5 w-3.5 text-sky-400" />,
          bg: 'bg-sky-950/30 border-sky-500/50 text-sky-300 hover:border-sky-400',
          badge: 'POWER',
          badgeColor: 'text-sky-400',
        };
      case 'challenge':
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-purple-400" />,
          bg: 'bg-purple-950/30 border-purple-500/50 text-purple-300 hover:border-purple-400',
          badge: 'GATE',
          badgeColor: 'text-purple-400',
        };
      case 'penalty':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
          bg: 'bg-rose-950/30 border-rose-500/60 text-rose-300 hover:border-rose-400',
          badge: '-5 PTS',
          badgeColor: 'text-rose-400',
        };
      case 'safe':
      default:
        return {
          icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500/60" />,
          bg: 'bg-slate-900/60 border-slate-700/60 text-slate-400',
          badge: 'SAFE',
          badgeColor: 'text-slate-500',
        };
    }
  };

  // Get players currently on this cell (position 0 is outside board)
  const getPlayersOnCell = (cellId: number): Player[] => {
    return engine.players.filter((p) => p.position === cellId);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 11x11 Grid Board Container */}
      <div className="relative w-full aspect-square max-w-[720px] mx-auto p-2 sm:p-3 rounded-2xl bg-[#090e1c] border border-slate-800 shadow-2xl shadow-black/80">
        {/* Subtle Circuit Board Background Accent */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* 11x11 CSS Grid */}
        <div
          className="relative w-full h-full grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(11, minmax(0, 1fr))',
          }}
        >
          {/* Render the 40 perimeter cells */}
          {BOARD_CELLS.map((cell) => {
            const visual = renderCellVisuals(cell);
            const playersHere = getPlayersOnCell(cell.id);
            const isCurrentPlayerHere = currentPlayer && currentPlayer.position === cell.id;

            return (
              <div
                key={cell.id}
                style={{
                  gridRow: cell.gridRow,
                  gridColumn: cell.gridCol,
                }}
                className={`group relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg border transition-all duration-200 select-none ${
                  visual.bg
                } ${
                  isCurrentPlayerHere
                    ? 'ring-2 ring-amber-400/80 shadow-md shadow-amber-400/20 scale-[1.03] z-20'
                    : 'hover:scale-[1.02] z-10'
                }`}
                title={`Cell #${cell.id} (${cell.type.toUpperCase()}): ${cell.name} - ${cell.description}`}
              >
                {/* Cell Number & Visual Icon */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold opacity-80">
                    {cell.id}
                  </span>
                  <div className="shrink-0">{visual.icon}</div>
                </div>

                {/* Cell Type Badge */}
                <div className="hidden sm:flex items-center justify-between w-full">
                  <span className={`text-[8px] sm:text-[9px] font-semibold tracking-wider ${visual.badgeColor}`}>
                    {visual.badge}
                  </span>
                </div>

                {/* Player Tokens Occupying Cell */}
                {playersHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 p-0.5 flex-wrap z-30 pointer-events-none">
                    {playersHere.map((p) => (
                      <div
                        key={p.id}
                        style={{ backgroundColor: p.color }}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs text-white font-bold shadow-md shadow-black/60 ring-1 ring-white/70 animate-bounce"
                        title={`${p.name} (Position ${p.position})`}
                      >
                        {p.tokenSymbol}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Center Area: (rows 2 to 10, cols 2 to 10) */}
          <div
            style={{
              gridRow: '2 / span 9',
              gridColumn: '2 / span 9',
            }}
            className="flex flex-col items-center justify-between p-3 sm:p-5 rounded-xl bg-[#0b1329]/95 border border-slate-800/90 shadow-inner z-0"
          >
            {/* Top Center: Current Turn Banner */}
            <div className="w-full flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: currentPlayer?.color || '#6366f1' }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-md ring-2 ring-white/20"
                >
                  {currentPlayer?.tokenSymbol || '⚡'}
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    {engine.isGameOver ? 'QUEST COMPLETE' : 'CURRENT TURN'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-['Outfit']">
                    <span>{currentPlayer?.name || 'Waiting...'}</span>
                    {currentPlayer?.isAI && (
                      <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-1 rounded">
                        AI ({currentPlayer.aiDifficulty?.toUpperCase()})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Position & Score Display */}
              <div className="text-right">
                <div className="text-[10px] sm:text-xs text-slate-400">Position / Score</div>
                <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                  Cell {currentPlayer?.position || 0} / 40 · {currentPlayer?.score || 0} pts
                </div>
              </div>
            </div>

            {/* Middle Center: Interactive Dice Roll */}
            <div className="my-auto py-2">
              <DiceRoll
                lastRoll={engine.lastDiceRoll}
                isRolling={engine.isMoving}
                currentPlayer={currentPlayer}
                onRoll={() => engine.rollDice()}
                disabled={
                  engine.isGameOver ||
                  engine.isMoving ||
                  !!engine.activeChallenge ||
                  !!engine.pendingPowerUpClaim ||
                  (currentPlayer?.isAI ?? false)
                }
              />
            </div>

            {/* Bottom Center: Live Operation Explanation Panel (Section 14) */}
            <div className="w-full rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-left">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-cyan-400 font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>LIVE OPERATION EXPLANATION</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">
                  {latestOp ? latestOp.dataStructureName : 'Circular Queue'}
                </span>
              </div>

              {latestOp ? (
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-amber-400 font-mono font-bold">
                      {latestOp.operationName}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="truncate">{latestOp.action}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {latestOp.explanation}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">
                  Game engine active. Roll dice to observe live data structure modifications.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board Legend Strip */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Token (13)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>Power-up (6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Challenge (5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Penalty (3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>Safe (12)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Finish #40 (1)</span>
        </div>
      </div>
    </div>
  );
};
