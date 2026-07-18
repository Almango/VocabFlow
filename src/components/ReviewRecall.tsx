import { useState, useEffect } from 'react';
import { X, Check, Eye } from 'lucide-react';
import type { ReviewState, WordGroup } from '@/types';

interface ReviewRecallProps {
  reviewState: ReviewState;
  group: WordGroup;
  onShowAnswer: () => void;
  onMarkRecall: (correct: boolean) => void;
  onExit: () => void;
}

export default function ReviewRecall({
  reviewState,
  group,
  onShowAnswer,
  onMarkRecall,
  onExit,
}: ReviewRecallProps) {
  const [revealed, setRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const currentWord = reviewState.recallQueue[0];
  const progress = {
    total: group.words.length,
    done: reviewState.stats.recallCorrect + reviewState.stats.recallIncorrect,
    remaining: reviewState.recallQueue.length,
  };

  useEffect(() => {
    setRevealed(reviewState.showAnswer);
    setAnimKey(prev => prev + 1);
  }, [reviewState.showAnswer, currentWord?.id]);

  if (!currentWord) return null;

  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <button
          onClick={onExit}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 mx-4">
          <div className="h-1 rounded-full bg-[#1e1e24] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((progress.done + 1) / progress.total) * 100}%`,
                background: '#4ade80',
              }}
            />
          </div>
        </div>
        <span className="text-gray-600 text-sm tabular-nums">
          {progress.remaining}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          key={animKey}
          className="w-full rounded-2xl p-8 text-center bg-[#121216] border border-[#1e1e24]"
          style={{
            animation: 'cardEnter 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Phase Badge */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#1a2030] text-[#60a5fa]">
              Recall Mode
            </span>
          </div>

          {/* English Word */}
          <h2
            className="text-4xl font-bold text-white mb-6 leading-tight"
            style={{
              fontFamily: '"DM Serif Display", "Playfair Display", serif',
              letterSpacing: '-0.02em',
            }}
          >
            {currentWord.english}
          </h2>

          {/* Chinese Answer */}
          <div
            className="transition-all duration-400 overflow-hidden"
            style={{
              maxHeight: revealed ? '200px' : '0',
              opacity: revealed ? 1 : 0,
            }}
          >
            <div className="pt-2 pb-4">
              <div className="w-10 h-px bg-[#2a2a36] mx-auto mb-4" />
              <p
                className="text-xl text-gray-300 leading-relaxed"
                style={{ animation: revealed ? 'fadeUp 0.3s ease' : 'none' }}
              >
                {currentWord.chinese}
              </p>
            </div>
          </div>

          {!revealed && (
            <p className="text-gray-700 text-sm mt-4">Think of the meaning...</p>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pb-8 pt-4">
        {!revealed ? (
          <button
            onClick={() => {
              setRevealed(true);
              onShowAnswer();
            }}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all hover:bg-[#1e2840] active:scale-[0.98] bg-[#1a2030] border border-[#2a3a50]"
          >
            <Eye className="w-4 h-4" />
            <span>Show Answer</span>
          </button>
        ) : (
          <div className="flex gap-3" style={{ animation: 'fadeUp 0.25s ease' }}>
            <button
              onClick={() => onMarkRecall(false)}
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-red-400 font-medium transition-all hover:bg-[#2a1a1a] active:scale-[0.98] bg-[#1e1414] border border-[#3a2020]"
            >
              <X className="w-4 h-4" />
              <span>Incorrect</span>
            </button>
            <button
              onClick={() => onMarkRecall(true)}
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-green-400 font-medium transition-all hover:bg-[#1a2e1f] active:scale-[0.98] bg-[#1a2e1f] border border-[#203a28]"
            >
              <Check className="w-4 h-4" />
              <span>Correct</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
