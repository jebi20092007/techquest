import React from 'react';
import {
  Gamepad2,
  Database,
  History,
  Settings,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GameEngine } from '../engine/GameEngine';

export type ActiveScreen = 'play' | 'datastructures' | 'history' | 'settings' | 'tests';

interface NavbarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  engine: GameEngine;
  onOpenNewGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  engine,
  onOpenNewGame,
}) => {
  const currentPlayer = engine.getCurrentPlayer();
  const canUndo = !engine.undoStack.isEmpty() && !engine.isMoving && !engine.isGameOver;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090e1c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <button
            onClick={() => setActiveScreen('play')}
            className="text-left group cursor-pointer"
          >
            <div className="text-base font-bold tracking-tight text-white font-['Outfit'] group-hover:text-indigo-400 transition-colors whitespace-nowrap">
              TECH QUEST
            </div>
            <div className="text-[11px] text-slate-400 -mt-1 font-medium whitespace-nowrap">
              The Data Structures Adventure
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Permanent navigation options) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveScreen('play')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeScreen === 'play'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>PLAY GAME</span>
          </button>

          <button
            onClick={() => setActiveScreen('datastructures')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeScreen === 'datastructures'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="h-4 w-4 text-cyan-400" />
            <span>DATA STRUCTURES</span>
            {engine.latestOperation && (
              <span className="hidden md:inline-block h-2 w-2 rounded-full bg-cyan-400" title="Live updates active" />
            )}
          </button>

          <button
            onClick={() => setActiveScreen('history')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeScreen === 'history'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">GAME HISTORY</span>
            <span className="sm:hidden">HISTORY</span>
          </button>

          <button
            onClick={() => setActiveScreen('tests')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeScreen === 'tests'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">VERIFY TESTS</span>
            <span className="sm:hidden">TESTS</span>
          </button>

          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeScreen === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Settings & Rules"
          >
            <Settings className="h-4 w-4" />
          </button>
        </nav>

        {/* Zone 3: Quick Action Zone (Undo & New Game) */}
        <div className="flex items-center gap-2 shrink-0">
          {canUndo && (
            <button
              onClick={() => engine.undo()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all whitespace-nowrap cursor-pointer"
              title="Undo last action via Stack"
            >
              <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden md:inline">Undo ({engine.undoStack.size()})</span>
            </button>
          )}

          <button
            onClick={onOpenNewGame}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg shadow-sm shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  );
};
