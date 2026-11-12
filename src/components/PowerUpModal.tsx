import React, { useState } from 'react';
import { Sparkles, Package, Check } from 'lucide-react';
import { GAME_TOKENS, POWERUP_DEFINITIONS } from '../data/boardConfig';
import { Player, PowerUpType } from '../types/game';

interface PowerUpModalProps {
  player: Player;
  availableTypes: PowerUpType[];
  supplyCount: (type: PowerUpType) => number;
  onClaim: (type: PowerUpType) => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({
  player,
  availableTypes,
  supplyCount,
  onClaim,
}) => {
  const [selectedType, setSelectedType] = useState<PowerUpType>(
    availableTypes[0] || 'extra_move'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-sky-500/50 p-5 sm:p-6 shadow-2xl shadow-sky-500/20 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-500/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-sky-400 font-mono">
              OVERCLOCK NODE UNLOCKED
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Choose a Power-up for {player.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          Select an available tactical power-up from the shared supply to add to your inventory:
        </p>

        {/* Available Options List */}
        <div className="space-y-2">
          {availableTypes.map((type) => {
            const def = POWERUP_DEFINITIONS[type];
            const remaining = supplyCount(type);
            const isSelected = selectedType === type;

            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-400 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: def.color }}
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{def.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono">
                        ({remaining} left in supply)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {def.description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onClaim(selectedType)}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl shadow-md shadow-sky-600/30 transition-all cursor-pointer"
          >
            Claim {POWERUP_DEFINITIONS[selectedType]?.name}
          </button>
        </div>
      </div>
    </div>
  );
};
