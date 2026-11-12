import React, { useState, useEffect } from 'react';
import {
  History,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { EventHistory, HistoryFilterOptions, ReplayEngine } from '../data-structures/EventHistory';
import { GameActionType, GameEvent } from '../types/game';

interface HistoryReplayModalProps {
  history: EventHistory;
  players: { id: string; name: string }[];
  onClose: () => void;
}

export const HistoryReplayModal: React.FC<HistoryReplayModalProps> = ({
  history,
  players,
  onClose,
}) => {
  const [filterPlayer, setFilterPlayer] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<GameActionType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Replay state machine
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayEngine, setReplayEngine] = useState<ReplayEngine | null>(null);
  const [currentReplayEvent, setCurrentReplayEvent] = useState<GameEvent | null>(null);
  const [replayStep, setReplayStep] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);

  const filterOptions: HistoryFilterOptions = {
    playerId: filterPlayer,
    actionType: filterAction,
    searchQuery,
    sortOrder,
  };

  const filteredEvents = history.query(filterOptions);

  // Initialize ReplayEngine with chronological snapshot
  const startReplay = () => {
    const chronologicalEvents = history.query({ sortOrder: 'asc' });
    const engine = new ReplayEngine(chronologicalEvents);
    setReplayEngine(engine);
    setCurrentReplayEvent(engine.getCurrentEvent());
    setReplayStep(0);
    setIsReplaying(true);
    setIsPlayingAuto(false);
  };

  // Replay Step handlers
  const handleNextStep = () => {
    if (!replayEngine) return;
    const evt = replayEngine.next();
    if (evt) {
      setCurrentReplayEvent(evt);
      setReplayStep(replayEngine.currentIndex);
    } else {
      setIsPlayingAuto(false);
    }
  };

  const handlePrevStep = () => {
    if (!replayEngine) return;
    const evt = replayEngine.prev();
    if (evt) {
      setCurrentReplayEvent(evt);
      setReplayStep(replayEngine.currentIndex);
    }
  };

  // Auto-play timer for replay
  useEffect(() => {
    let timer: number | null = null;
    if (isPlayingAuto && replayEngine) {
      timer = window.setInterval(() => {
        if (replayEngine.currentIndex < replayEngine.totalSteps - 1) {
          handleNextStep();
        } else {
          setIsPlayingAuto(false);
        }
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingAuto, replayEngine]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0d1527] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#090e1c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Game History & Isolated Replay Engine
              </h2>
              <div className="text-xs text-slate-400">
                Total events recorded: {history.count()} · Filtered: {filteredEvents.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReplaying ? (
              <button
                onClick={startReplay}
                disabled={history.count() === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Start Step Replay</span>
              </button>
            ) : (
              <button
                onClick={() => setIsReplaying(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Exit Replay
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800/80 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* REPLAY MODE BANNER */}
        {isReplaying && replayEngine && (
          <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400 font-bold uppercase">
                Isolated Replay State · Step {replayStep + 1} of {replayEngine.totalSteps}
              </span>
              <span className="text-amber-400 text-[11px] font-mono">
                Live game engine remains untainted
              </span>
            </div>

            {/* Current Replay Event Showcase */}
            {currentReplayEvent && (
              <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {currentReplayEvent.title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                      {currentReplayEvent.action}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    {currentReplayEvent.description}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">
                  {new Date(currentReplayEvent.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Replay Controls */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handlePrevStep}
                disabled={replayStep === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                title="Previous event"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                {isPlayingAuto ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextStep}
                disabled={replayStep >= replayEngine.totalSteps - 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                title="Next event"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  replayEngine.reset();
                  setCurrentReplayEvent(replayEngine.getCurrentEvent());
                  setReplayStep(0);
                  setIsPlayingAuto(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer ml-2"
                title="Reset to beginning"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0a1021] border-b border-slate-800 text-xs">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex-1 min-w-[160px]">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, actions, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-hidden w-full"
            />
          </div>

          {/* Filter by Player */}
          <select
            value={filterPlayer}
            onChange={(e) => setFilterPlayer(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs cursor-pointer"
          >
            <option value="ALL">All Players</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Filter by Action */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as GameActionType | 'ALL')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="DICE_ROLL">Dice Rolls</option>
            <option value="MOVE">Moves</option>
            <option value="TOKEN_COLLECT">Token Collect</option>
            <option value="POWERUP_USE">Power-up Usage</option>
            <option value="CHALLENGE_GENERATE">Challenges</option>
            <option value="PENALTY_APPLIED">Penalties</option>
            <option value="PLAYER_FINISH">Finishes</option>
            <option value="UNDO">Undo Actions</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white cursor-pointer font-mono"
          >
            {sortOrder === 'desc' ? 'Latest First ↓' : 'Chronological ↑'}
          </button>
        </div>

        {/* Events Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching events found.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                    #{evt.eventNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{evt.playerName}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 rounded">
                        {evt.action}
                      </span>
                      {evt.dataStructureInvolved && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          [{evt.dataStructureInvolved}]
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300 mt-1">{evt.description}</div>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                  {evt.scoreChange !== undefined && evt.scoreChange !== 0 && (
                    <div
                      className={`font-bold ${
                        evt.scoreChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {evt.scoreChange > 0 ? `+${evt.scoreChange}` : evt.scoreChange} pts
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
