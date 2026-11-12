import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, RotateCcw, X, ShieldCheck } from 'lucide-react';
import { runAllGameTests, TestSuiteSummary } from '../tests/gameEngineTests';

interface TestRunnerModalProps {
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ onClose }) => {
  const [suiteSummary, setSuiteSummary] = useState<TestSuiteSummary | null>(() => {
    // Run tests immediately so results are ready
    return runAllGameTests();
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runAllGameTests();
      setSuiteSummary(summary);
      setIsRunning(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0d1527] border border-emerald-500/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#090e1c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Automated Verification Test Suite (20 Tests)
              </h2>
              <div className="text-xs text-slate-400">
                Section 22 Comprehensive Specification Compliance Runner
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Re-run Tests'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suite Summary Strip */}
        {suiteSummary && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-[#0a1021] border-b border-slate-800 text-center font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Total</span>
              <span className="text-sm font-bold text-white">{suiteSummary.total} Tests</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 uppercase block">Passed</span>
              <span className="text-sm font-bold text-emerald-300">{suiteSummary.passed} / 20</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40">
              <span className="text-[10px] text-rose-400 uppercase block">Failed</span>
              <span className="text-sm font-bold text-rose-300">{suiteSummary.failed}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Execution</span>
              <span className="text-sm font-bold text-cyan-400">{suiteSummary.durationMs}ms</span>
            </div>
          </div>
        )}

        {/* Scrollable Test List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {suiteSummary?.results.map((res) => (
            <div
              key={res.id}
              className={`flex items-start justify-between p-3 rounded-xl border text-xs transition-colors ${
                res.passed
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-rose-950/30 border-rose-500/60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5">
                  {res.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px]">
                      Test #{res.id}
                    </span>
                    <span className="font-bold text-white text-xs">{res.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded">
                      {res.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{res.message}</div>
                </div>
              </div>

              <div className="text-right text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                {res.durationMs}ms
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
