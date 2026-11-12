import React, { useState } from 'react';
import {
  Layers,
  Repeat,
  Binary,
  Cpu,
  ArrowRight,
  Database,
  Search,
  Sparkles,
  HelpCircle,
  Trophy,
  History,
  Box,
  Flame,
  Check,
  AlertTriangle,
  Play,
  FlaskConical,
} from 'lucide-react';
import { GAME_TOKENS, POWERUP_DEFINITIONS } from '../data/boardConfig';
import { GameEngine } from '../engine/GameEngine';
import { Player, PowerUpType } from '../types/game';

interface DataStructuresDashboardProps {
  engine: GameEngine;
  onOpenReplay?: () => void;
}

type TabType =
  | 'overview'
  | 'dll'
  | 'queue'
  | 'tokens'
  | 'stack'
  | 'powerups'
  | 'challenges'
  | 'scores'
  | 'sandbox';

export const DataStructuresDashboard: React.FC<DataStructuresDashboardProps> = ({
  engine,
  onOpenReplay,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    engine.players[0]?.id || ''
  );

  // Educational Sandbox State (completely separate from live game)
  const [sandboxStack, setSandboxStack] = useState<string[]>(['Init State', 'Token Landed']);
  const [sandboxInput, setSandboxInput] = useState<string>('');
  const [sandboxQueue, setSandboxQueue] = useState<string[]>(['Alice', 'Bob', 'Charlie']);
  const [sandboxHashItems, setSandboxHashItems] = useState<string[]>(['TOK_02', 'TOK_08', 'TOK_15']);
  const [sandboxDll, setSandboxDll] = useState<number[]>([0, 4, 9, 15]);

  const currentPlayer = engine.getCurrentPlayer();
  const selectedPlayer =
    engine.players.find((p) => p.id === selectedPlayerId) || engine.players[0];

  const latestOp = engine.latestOperation;

  // Determine recently changed structure
  const recentlyChanged = latestOp ? latestOp.dataStructureName.toLowerCase() : '';

  // Data Structure 1: Movement Doubly Linked List for selected player
  const playerDll = selectedPlayer
    ? engine.movementLists.get(selectedPlayer.id)
    : null;
  const dllNodes = playerDll ? playerDll.displayDetailed() : [];

  // Data Structure 2: Circular Turn Queue
  const turnQueueSlots = engine.turnQueue.getBufferSlots();
  const queuePointers = engine.turnQueue.getPointers();

  // Data Structure 3: Token Collection (Linked List + HashSet)
  const tokenMgr = selectedPlayer
    ? engine.tokenManagers.get(selectedPlayer.id)
    : null;
  const collectedTokens = tokenMgr ? tokenMgr.getTokens() : [];
  const hashBucketMap = tokenMgr ? tokenMgr.hashSet.getBucketMap() : [];

  // Data Structure 4: Undo Stack
  const stackFrames = engine.undoStack.display();

  // Data Structure 5: Power-Up Supply HashMap & Used Queue
  const supplyEntries = engine.powerUpManager.getSupplyEntries();
  const usedPowerUps = engine.powerUpManager.getUsedQueue();

  // Data Structure 6: Challenge Queue
  const pendingChallenges = engine.challengeQueue.display();
  const challengeHistory = engine.challengeQueue.getHistory();

  // Data Structure 7: Score HashMap & Rankings
  const rankings = engine.scoreMap.displayRanking(engine.players);
  const scoreEntries = engine.scoreMap.getVisualEntries();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#0e1938] to-[#0b1329] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-cyan-400">
              LIVE ENGINE RUNTIME
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300">
              Direct Memory Inspection
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-['Outfit']">
            Live Data Structures Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time inspection of all 8 core data structures operating behind the active board game.
            Every node, pointer, hash bucket, and stack frame reflects genuine live game mutations.
          </p>
        </div>

        {/* Live Status Pill & Player Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>SYNCED WITH ENGINE</span>
          </div>

          {engine.players.length > 0 && (
            <select
              value={selectedPlayer?.id || ''}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-cyan-400 cursor-pointer"
            >
              {engine.players.map((p) => (
                <option key={p.id} value={p.id}>
                  Inspecting: {p.name} ({p.tokens.length} tokens, {p.score} pts)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Live Operation Explanation Card (Section 14) */}
      {latestOp && (
        <div className="rounded-xl bg-slate-900/90 border border-cyan-500/40 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white uppercase tracking-wider font-['Outfit']">
                Latest Game Operation: {latestOp.operationName}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-cyan-300 font-mono">
                {latestOp.dataStructureName}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Count: {latestOp.elementCount} items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#0b1120] p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">
                Before State
              </span>
              <span className="text-slate-300 font-mono truncate block">
                {latestOp.beforeState}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-mono block mb-0.5">
                Action Performed
              </span>
              <span className="text-amber-200 font-medium truncate block">
                {latestOp.action}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-mono block mb-0.5">
                After State
              </span>
              <span className="text-emerald-200 font-mono truncate block">
                {latestOp.afterState}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            <strong className="text-cyan-400">Algorithmic Explanation:</strong> {latestOp.explanation}
          </p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'overview', label: 'All 8 Structures' },
          { id: 'dll', label: '1. Doubly Linked List', match: 'doubly' },
          { id: 'queue', label: '2. Circular Queue', match: 'circular' },
          { id: 'tokens', label: '3. HashSet & List', match: 'hash' },
          { id: 'stack', label: '4. Undo Stack', match: 'stack' },
          { id: 'powerups', label: '5. Supply HashMap', match: 'power' },
          { id: 'challenges', label: '6. Challenge Queue', match: 'challenge' },
          { id: 'scores', label: '7. Score Map', match: 'score' },
          { id: 'sandbox', label: 'Educational Sandbox' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const isHot = tab.match && recentlyChanged.includes(tab.match);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {isHot && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" title="Recently modified" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview or Detailed Views */}

      {/* VIEW: 1. DOUBLY LINKED LIST (Movement History) */}
      {(activeTab === 'overview' || activeTab === 'dll') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #1 · Linear Bi-Directional
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Repeat className="h-4 w-4 text-cyan-400" />
                <span>Doubly Linked List – Movement History ({selectedPlayer?.name})</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>HEAD: Cell {dllNodes[0]?.data.position ?? 0}</span>
              <span>·</span>
              <span>TAIL: Cell {dllNodes[dllNodes.length - 1]?.data.position ?? 0}</span>
              <span>·</span>
              <span className="text-cyan-400 font-bold">{dllNodes.length} Nodes</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Each movement appends a new node holding <code className="text-cyan-300">prev</code> and{' '}
            <code className="text-cyan-300">next</code> memory pointer references. When undo is triggered,{' '}
            <code className="text-cyan-300">removeLast()</code> severs the tail pointer in O(1) time.
          </p>

          {/* Interactive Visual Node Diagram */}
          <div className="overflow-x-auto py-4 px-2 bg-[#060a14] rounded-xl border border-slate-900">
            <div className="flex items-center gap-2 min-w-max">
              {/* HEAD Label */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                  HEAD
                </span>
                <span className="text-xs text-slate-500 mt-1">↓</span>
              </div>

              {dllNodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {/* Node Box */}
                  <div
                    className={`flex flex-col rounded-xl border p-2 text-center transition-all min-w-[120px] ${
                      node.isTail
                        ? 'bg-indigo-950/60 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : node.isHead
                        ? 'bg-slate-900 border-amber-500/60'
                        : 'bg-slate-900/90 border-slate-700/80'
                    }`}
                  >
                    {/* Node Pointer Header */}
                    <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-800 pb-1 mb-1 text-slate-400">
                      <span>PREV: {node.hasPrev ? '●' : 'NULL'}</span>
                      <span className="text-[10px] text-cyan-300 font-bold">#{idx}</span>
                      <span>NEXT: {node.hasNext ? '●' : 'NULL'}</span>
                    </div>

                    {/* Node Data */}
                    <div className="text-sm font-bold text-white font-mono">
                      Cell {node.data.position}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate max-w-[110px] mt-0.5">
                      {node.data.actionDescription}
                    </div>

                    {/* Tail Indicator */}
                    {node.isTail && (
                      <span className="mt-1 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 rounded py-0.5">
                        TAIL (CURRENT)
                      </span>
                    )}
                  </div>

                  {/* Bi-directional ⇄ Arrow */}
                  {idx < dllNodes.length - 1 && (
                    <div className="flex flex-col items-center justify-center text-cyan-400 font-mono text-sm px-1">
                      <span>⇄</span>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* TAIL Label */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                  TAIL
                </span>
                <span className="text-xs text-slate-500 mt-1">↑</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW: 2. CIRCULAR QUEUE (Turn Management) */}
      {(activeTab === 'overview' || activeTab === 'queue') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #2 · FIFO Ring Buffer
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Repeat className="h-4 w-4 text-purple-400" />
                <span>Circular Queue – Player Turn Rotation</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-purple-400">FRONT: Index {queuePointers.front}</span>
              <span>·</span>
              <span className="text-cyan-400">REAR: Index {queuePointers.rear}</span>
              <span>·</span>
              <span>Capacity: {queuePointers.capacity}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Player turns rotate in a fixed-size ring buffer using modulo indexing:{' '}
            <code className="text-cyan-300">rear = (rear + 1) % capacity</code> and{' '}
            <code className="text-cyan-300">front = (front + 1) % capacity</code>. Finished players are
            surgically dequeued without disrupting the cyclic turn ordering.
          </p>

          {/* Circular Ring Buffer Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-[#060a14] rounded-xl border border-slate-900">
            {turnQueueSlots.map((slot) => {
              const player = slot.value
                ? engine.players.find((p) => p.id === slot.value)
                : null;
              const isFront = slot.isFront;
              const isRear = slot.isRear;

              return (
                <div
                  key={slot.index}
                  className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border text-center min-h-[90px] transition-all ${
                    isFront
                      ? 'bg-purple-950/50 border-purple-400 shadow-md shadow-purple-500/20'
                      : slot.isActive
                      ? 'bg-slate-900 border-indigo-500/40'
                      : 'bg-slate-900/30 border-slate-800/60 opacity-50'
                  }`}
                >
                  {/* Slot Index */}
                  <span className="text-[9px] font-mono text-slate-400">
                    Slot [{slot.index}]
                  </span>

                  {/* Player Content */}
                  {player ? (
                    <div className="flex flex-col items-center my-1">
                      <div
                        style={{ backgroundColor: player.color }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm"
                      >
                        {player.tokenSymbol}
                      </div>
                      <span className="text-[10px] font-bold text-white truncate max-w-[60px] mt-1">
                        {player.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 my-auto">
                      EMPTY
                    </span>
                  )}

                  {/* Pointers Flags */}
                  <div className="flex gap-1">
                    {isFront && (
                      <span className="text-[8px] font-mono font-bold text-purple-300 bg-purple-900/80 px-1 rounded">
                        FRONT
                      </span>
                    )}
                    {isRear && (
                      <span className="text-[8px] font-mono font-bold text-cyan-300 bg-cyan-900/80 px-1 rounded">
                        REAR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: 3. LINKED LIST + HASHSET (Token Collection) */}
      {(activeTab === 'overview' || activeTab === 'tokens') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #3 · Linked List + Custom HashSet
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Binary className="h-4 w-4 text-emerald-400" />
                <span>Token Collection – {selectedPlayer?.name} (Ordered List + Hash Buckets)</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-emerald-400">{collectedTokens.length} Unique Tokens</span>
              <span>·</span>
              <span>8 Hash Buckets</span>
              <span>·</span>
              <span className="text-cyan-400">O(1) Duplicate Lookup</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Tokens are appended to a <code className="text-cyan-300">TokenLinkedList</code> for ordered display, while
            their IDs are hashed via <code className="text-cyan-300">hash(key) % bucketCount</code> into separate chaining
            buckets in the <code className="text-cyan-300">TokenHashSet</code> to instantly reject duplicates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Ordered Token Linked List */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-['Outfit']">
                <span>1. Singly Linked List (Chronological Order)</span>
              </h3>
              {collectedTokens.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No tokens collected yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {collectedTokens.map((tok, idx) => (
                    <div
                      key={tok.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tok.symbol}</span>
                        <div>
                          <span className="font-semibold text-white">{tok.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono ml-2">
                            {tok.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Node #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Custom HashSet Hash Buckets */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-['Outfit']">
                <span>2. Custom HashSet Buckets (Collision Resolution)</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {hashBucketMap.map((bucket) => (
                  <div
                    key={bucket.index}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px]"
                  >
                    <div className="flex items-center justify-between font-mono text-slate-400 border-b border-slate-800/60 pb-1 mb-1">
                      <span>Bucket [{bucket.index}]</span>
                      <span className="text-emerald-400 font-bold">{bucket.count} items</span>
                    </div>
                    {bucket.keys.length === 0 ? (
                      <span className="text-slate-600 font-mono italic">empty</span>
                    ) : (
                      <div className="space-y-0.5">
                        {bucket.keys.map((k) => (
                          <div
                            key={k}
                            className="bg-emerald-950/60 text-emerald-300 font-mono px-1 py-0.5 rounded truncate"
                          >
                            {k}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW: 4. UNDO STACK */}
      {(activeTab === 'overview' || activeTab === 'stack') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #4 · LIFO Stack
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Box className="h-4 w-4 text-amber-400" />
                <span>Undo Management – Game State Stack</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-amber-400">
                TOP: {stackFrames[0] ? stackFrames[0].actionName : 'EMPTY'}
              </span>
              <span>·</span>
              <span className="text-cyan-400">Stack Height: {stackFrames.length} Frames</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Full atomic state snapshots (player positions, scores, token maps, power-up supply, and active turns)
            are pushed onto the LIFO stack before reversible actions. Clicking Undo performs a <code className="text-cyan-300">pop()</code> to restore pristine state.
          </p>

          <div className="p-4 bg-[#060a14] rounded-xl border border-slate-900 max-h-60 overflow-y-auto space-y-2">
            {stackFrames.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Stack is currently empty. Roll the dice or use a power-up to push frames.
              </div>
            ) : (
              stackFrames.map((frame, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={frame.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                      isTop
                        ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/70 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isTop
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isTop ? 'TOP' : `Frame -${idx}`}
                      </span>
                      <div>
                        <div className="font-semibold text-white">
                          {frame.actionName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Snapshot captured: {new Date(frame.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-400">
                      {frame.data.players.length} Players Saved
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* VIEW: 5. POWER-UP STRUCTURES (HashMap + Queue + Set) */}
      {(activeTab === 'overview' || activeTab === 'powerups') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #5 · Multi-Structure Architecture
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>Power-Up Management – Supply HashMap, Inventories & Used Queue</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-sky-400">6 Supply Categories</span>
              <span>·</span>
              <span>{usedPowerUps.length} Used Power-ups</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shared Supply HashMap */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between font-['Outfit']">
                <span>Shared Supply HashMap (Initial: 3 Each)</span>
                <span className="text-[10px] text-sky-400 font-mono">Key-Value Map</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {supplyEntries.map((entry) => (
                  <div
                    key={entry.type}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">{entry.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{entry.type}</div>
                    </div>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        entry.count > 0
                          ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {entry.count} / 3
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Used Power-Ups FIFO Queue */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between font-['Outfit']">
                <span>Used Power-ups FIFO Queue</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {usedPowerUps.length} records
                </span>
              </h3>
              {usedPowerUps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No power-ups activated yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {usedPowerUps.map((used, idx) => (
                    <div
                      key={used.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {POWERUP_DEFINITIONS[used.type]?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          by {used.playerName}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* VIEW: 6. CHALLENGE QUEUE */}
      {(activeTab === 'overview' || activeTab === 'challenges') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #6 · FIFO Task Queue
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                <span>Challenge Queue – Pending & Completed Algorithmic Tasks</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-purple-400">Pending: {pendingChallenges.length}</span>
              <span>·</span>
              <span className="text-emerald-400">Completed: {challengeHistory.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Tasks Queue */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-['Outfit']">
                Pending Queue (FRONT → REAR)
              </h3>
              {pendingChallenges.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No challenges currently waiting in queue.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingChallenges.map((task, idx) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-purple-300 font-bold">
                          {idx === 0 ? 'FRONT (ACTIVE)' : `REAR [${idx}]`}
                        </span>
                        <span className="text-slate-400">
                          Attempts: {task.attempts}/{task.maxAttempts}
                        </span>
                      </div>
                      <div className="font-semibold text-white truncate">
                        {task.question.question}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Assigned to: {task.playerName} · Category: {task.question.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved History */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-['Outfit']">
                Resolved Challenge History
              </h3>
              {challengeHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No challenges resolved yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {challengeHistory.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-white truncate">
                          {task.question.category}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {task.playerName}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          task.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {task.status.toUpperCase()} ({task.scoreAwarded || 0} pts)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* VIEW: 7. SCORE HASHMAP */}
      {(activeTab === 'overview' || activeTab === 'scores') && (
        <section className="rounded-2xl bg-[#090e1c] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                Data Structure #8 · Hash Table / Map
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Score Management – Player ID → Score HashMap & Rankings</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-amber-400">Rank #1: {rankings[0]?.player.name || 'N/A'}</span>
              <span>·</span>
              <span className="text-cyan-400">O(1) Direct Lookup</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw HashMap Key-Value Entries */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-['Outfit']">
                Raw HashMap Entries: Key (PlayerId) → Value (Score)
              </h3>
              <div className="space-y-1.5">
                {scoreEntries.map((entry) => {
                  const p = engine.players.find((pl) => pl.id === entry.playerId);
                  return (
                    <div
                      key={entry.playerId}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">&quot;{entry.playerId}&quot;</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-300">{p?.name || entry.playerId}</span>
                      </div>
                      <span className="font-bold text-amber-400 text-sm">
                        {entry.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculated Ranking Ladder */}
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-900 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-['Outfit']">
                Computed Ranking Table (Sort Priority: Score → Finish Time → Position)
              </h3>
              <div className="space-y-1.5">
                {rankings.map((rank) => (
                  <div
                    key={rank.player.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-[10px] flex items-center justify-center">
                        #{rank.rank}
                      </span>
                      <span className="font-bold text-white">{rank.player.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-amber-400 font-bold">{rank.score} pts</span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        (Pos: {rank.player.position})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB: EDUCATIONAL SANDBOX (Clearly separated sandbox instance) */}
      {activeTab === 'sandbox' && (
        <section className="rounded-2xl bg-[#090e1c] border-2 border-indigo-500/40 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Isolated Educational Sandbox
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Hands-On Data Structure Experimentation
              </h2>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-950/50 border border-amber-500/40 px-2 py-1 rounded">
              Sandbox Only · Live game is completely unaffected
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Test manual insert, delete, push, pop, enqueue, and dequeue operations below.
            These operations run in their own dedicated sandbox instances so you can experiment freely without touching active game state!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sandbox 1: Stack Push / Pop */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 font-mono uppercase">
                1. Sandbox Stack (LIFO)
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter element name..."
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <button
                  onClick={() => {
                    if (sandboxInput.trim()) {
                      setSandboxStack([sandboxInput.trim(), ...sandboxStack]);
                      setSandboxInput('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg cursor-pointer"
                >
                  PUSH
                </button>
                <button
                  onClick={() => {
                    if (sandboxStack.length > 0) {
                      setSandboxStack(sandboxStack.slice(1));
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  POP
                </button>
              </div>

              <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-900 min-h-[100px] text-xs font-mono">
                {sandboxStack.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded flex items-center justify-between ${
                      idx === 0
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>{item}</span>
                    <span className="text-[10px] opacity-70">
                      {idx === 0 ? '← TOP' : `[#${sandboxStack.length - idx - 1}]`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox 2: Circular Queue Enqueue / Dequeue */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-purple-400 font-mono uppercase">
                2. Sandbox Queue (FIFO)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const names = ['Delta', 'Echo', 'Foxtrot', 'Golf'];
                    const next = names[Math.floor(Math.random() * names.length)];
                    setSandboxQueue([...sandboxQueue, next]);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg cursor-pointer"
                >
                  ENQUEUE RANDOM
                </button>
                <button
                  onClick={() => {
                    if (sandboxQueue.length > 0) {
                      setSandboxQueue(sandboxQueue.slice(1));
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  DEQUEUE FRONT
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-slate-950 rounded-lg border border-slate-900 min-h-[100px]">
                {sandboxQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-center text-xs font-mono min-w-[70px] ${
                      idx === 0
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] text-slate-500">
                      {idx === 0 ? 'FRONT' : idx === sandboxQueue.length - 1 ? 'REAR' : `[${idx}]`}
                    </div>
                    <div className="font-bold">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
