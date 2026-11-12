import React, { useState } from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { ActiveChallenge, Player } from '../types/game';

interface ChallengeModalProps {
  challenge: ActiveChallenge;
  player: Player | null;
  onAnswer: (index: number) => { isCorrect: boolean; retryAllowed: boolean };
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  player,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    retryAllowed: boolean;
    message: string;
  } | null>(null);

  const { question, attemptsMade, maxAttempts } = challenge;

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const result = onAnswer(selectedIndex);
    if (result.isCorrect) {
      setFeedback({
        submitted: true,
        isCorrect: true,
        retryAllowed: false,
        message: 'Correct answer! +8 points awarded to your score.',
      });
    } else if (result.retryAllowed) {
      setFeedback({
        submitted: true,
        isCorrect: false,
        retryAllowed: true,
        message: 'Incorrect! -5 points deducted. You have 1 retry attempt remaining!',
      });
    } else {
      setFeedback({
        submitted: true,
        isCorrect: false,
        retryAllowed: false,
        message: 'Second attempt failed. No additional points deducted. Challenge concluded.',
      });
    }
  };

  const handleRetryClick = () => {
    setSelectedIndex(null);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1527] border border-purple-500/50 p-5 sm:p-6 shadow-2xl shadow-purple-500/20 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-500/40">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-400 font-mono">
                {question.category.toUpperCase()} GATE
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Algorithmic Challenge for {player?.name}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400">
              Attempt {attemptsMade + 1}/{maxAttempts}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                disabled={feedback?.submitted && !feedback.retryAllowed}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-400 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-purple-300 font-mono">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs sm:text-sm space-y-1 ${
              feedback.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {feedback.isCorrect ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{feedback.message}</span>
            </div>
            {question.explanation && (
              <div className="text-[11px] text-slate-400 pt-1">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400">
            Correct: +8 pts · 1st Fail: -5 pts (1 retry) · 2nd Fail: 0 pts
          </div>

          <div className="flex gap-2">
            {feedback?.retryAllowed ? (
              <button
                onClick={handleRetryClick}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Retry Challenge</span>
              </button>
            ) : !feedback?.submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedIndex === null}
                className={`px-5 py-2 text-xs font-bold rounded-xl shadow transition-all cursor-pointer ${
                  selectedIndex === null
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30'
                }`}
              >
                Submit Answer
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
