import React, { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { ChallengeModal } from './components/ChallengeModal';
import { DataStructuresDashboard } from './components/DataStructuresDashboard';
import { GameOverModal } from './components/GameOverModal';
import { HistoryReplayModal } from './components/HistoryReplayModal';
import { ActiveScreen, Navbar } from './components/Navbar';
import { NewGameModal } from './components/NewGameModal';
import { PlayerPanel } from './components/PlayerPanel';
import { PowerUpModal } from './components/PowerUpModal';
import { SettingsModal } from './components/SettingsModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { gameEngine } from './engine/GameEngine';
import { Player, PowerUpType } from './types/game';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('play');
  const [, setTick] = useState(0);

  // Modals state
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  // Subscribe to central GameEngine
  useEffect(() => {
    // Attempt to restore saved game from LocalStorage
    const restored = gameEngine.loadFromStorage();
    if (!restored || gameEngine.players.length === 0) {
      // Default initial 2-player game
      gameEngine.initGame([
        {
          id: 'p1',
          name: 'Ada Lovelace',
          color: '#6366f1',
          tokenSymbol: '⚡',
          isAI: false,
        },
        {
          id: 'p2',
          name: 'Alan Turing',
          color: '#10b981',
          tokenSymbol: '💎',
          isAI: true,
          aiDifficulty: 'medium',
        },
      ]);
    }

    const unsubscribe = gameEngine.subscribe(() => {
      setTick((t) => t + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartNewGame = (
    configuredPlayers: Omit<Player, 'position' | 'score' | 'tokens' | 'powerUps' | 'hasShield' | 'hasDoubleScore' | 'isFinished' | 'movementHistory'>[]
  ) => {
    gameEngine.initGame(configuredPlayers);
    setActiveScreen('play');
  };

  const handleUsePowerUp = (playerId: string, type: PowerUpType) => {
    gameEngine.usePowerUp(playerId, type);
  };

  const currentPlayer = gameEngine.getCurrentPlayer();

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Permanent Top Navigation */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={(screen) => {
          if (screen === 'history') {
            setIsHistoryOpen(true);
          } else if (screen === 'settings') {
            setIsSettingsOpen(true);
          } else if (screen === 'tests') {
            setIsTestRunnerOpen(true);
          } else {
            setActiveScreen(screen);
          }
        }}
        engine={gameEngine}
        onOpenNewGame={() => setIsNewGameOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeScreen === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left / Main: Game Board (7 cols on desktop) */}
            <div className="lg:col-span-8 w-full">
              <Board engine={gameEngine} />
            </div>

            {/* Right / Side Panel: Player Stats, Tokens & Activity (5 cols on desktop) */}
            <div className="lg:col-span-4 w-full">
              <PlayerPanel
                engine={gameEngine}
                onUsePowerUp={handleUsePowerUp}
              />
            </div>
          </div>
        )}

        {activeScreen === 'datastructures' && (
          <DataStructuresDashboard
            engine={gameEngine}
            onOpenReplay={() => setIsHistoryOpen(true)}
          />
        )}
      </main>

      {/* Modals & Overlays */}

      {/* 1. Algorithmic Challenge Modal */}
      {gameEngine.activeChallenge && (
        <ChallengeModal
          challenge={gameEngine.activeChallenge}
          player={
            gameEngine.players.find(
              (p) => p.id === gameEngine.activeChallenge?.playerId
            ) || null
          }
          onAnswer={(index) => gameEngine.answerChallenge(index)}
        />
      )}

      {/* 2. Power-up Selection Modal */}
      {gameEngine.pendingPowerUpClaim && (
        <PowerUpModal
          player={
            gameEngine.players.find(
              (p) => p.id === gameEngine.pendingPowerUpClaim?.playerId
            ) || gameEngine.players[0]
          }
          availableTypes={gameEngine.pendingPowerUpClaim.options}
          supplyCount={(type) => gameEngine.powerUpManager.search(type)}
          onClaim={(type) => {
            if (gameEngine.pendingPowerUpClaim) {
              gameEngine.claimPowerUp(gameEngine.pendingPowerUpClaim.playerId, type);
              gameEngine.advanceTurn();
            }
          }}
        />
      )}

      {/* 3. Game Over Celebration Screen */}
      {gameEngine.isGameOver && (
        <GameOverModal
          engine={gameEngine}
          onPlayAgain={() => setIsNewGameOpen(true)}
        />
      )}

      {/* 4. New Game Setup Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartNewGame}
      />

      {/* 5. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onRestartGame={() => {
            gameEngine.initGame(
              gameEngine.players.map((p) => ({
                id: p.id,
                name: p.name,
                color: p.color,
                tokenSymbol: p.tokenSymbol,
                isAI: p.isAI,
                aiDifficulty: p.aiDifficulty,
              }))
            );
          }}
        />
      )}

      {/* 6. Game History & Isolated Replay Modal */}
      {isHistoryOpen && (
        <HistoryReplayModal
          history={gameEngine.eventHistory}
          players={gameEngine.players.map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* 7. Verification Test Suite Runner Modal */}
      {isTestRunnerOpen && (
        <TestRunnerModal onClose={() => setIsTestRunnerOpen(false)} />
      )}
    </div>
  );
}
