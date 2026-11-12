import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { Player } from '../types/game';

interface DiceRollProps {
  lastRoll: number | null;
  isRolling: boolean;
  currentPlayer: Player | null;
  onRoll: () => void;
  disabled: boolean;
}

export const DiceRoll: React.FC<DiceRollProps> = ({
  lastRoll,
  isRolling,
  currentPlayer,
  onRoll,
  disabled,
}) => {
  const [animating, setAnimating] = useState(false);

  const handleRollClick = () => {
    if (disabled || isRolling || animating) return;
    setAnimating(true);
    onRoll();
    setTimeout(() => {
      setAnimating(false);
    }, 600);
  };

  // Render dots on standard 6-sided dice
  const renderDots = (value: number) => {
    const dotClasses = 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-900 shadow-inner';
    switch (value) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className={dotClasses} />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className={`${dotClasses} self-start`} />
            <span className={`${dotClasses} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className={`${dotClasses} self-start`} />
            <span className={`${dotClasses} self-center`} />
            <span className={`${dotClasses} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 p-1.5 w-full h-full place-items-center">
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-1.5">
            <div className="grid grid-cols-2 gap-2 h-full place-items-center">
              <span className={dotClasses} />
              <span className={dotClasses} />
              <span className={dotClasses} />
              <span className={dotClasses} />
            </div>
            <span className={`${dotClasses} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-1.5 p-1.5 w-full h-full place-items-center">
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
            <span className={dotClasses} />
          </div>
        );
    }
  };

  const displayRoll = lastRoll || 1;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* 3D Dice Box */}
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300/80 shadow-lg shadow-amber-500/20 flex items-center justify-center transition-transform duration-300 ${
          animating || isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
        }`}
      >
        {renderDots(displayRoll)}
      </div>

      {/* Roll Action Button */}
      <button
        onClick={handleRollClick}
        disabled={disabled || isRolling || animating}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer whitespace-nowrap ${
          disabled || isRolling
            ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
        }`}
      >
        <Dices className="h-4 w-4" />
        <span>
          {isRolling
            ? 'Rolling...'
            : currentPlayer?.isAI
            ? `${currentPlayer.name} Rolling...`
            : 'ROLL DICE'}
        </span>
      </button>
    </div>
  );
};
