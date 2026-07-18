import { useEffect, useState } from 'react';
import { Home, RotateCcw, Trophy, Target, Zap } from 'lucide-react';
import type { ReviewState } from '@/types';

interface ReviewCompleteProps {
  reviewState: ReviewState;
  onHome: () => void;
  onRetry: () => void;
}

export default function ReviewComplete({ reviewState, onHome, onRetry }: ReviewCompleteProps) {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const totalRecall = reviewState.stats.recallCorrect + reviewState.stats.recallIncorrect;
  const totalSpell = reviewState.stats.spellCorrect + reviewState.stats.spellIncorrect;
  const recallRate = totalRecall > 0 ? Math.round((reviewState.stats.recallCorrect / totalRecall) * 100) : 0;
  const spellRate = totalSpell > 0 ? Math.round((reviewState.stats.spellCorrect / totalSpell) * 100) : 0;

  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 h-screen flex flex-col items-center justify-center">
      <div
        className="w-full rounded-2xl p-8 text-center bg-[#121216] border border-[#1e1e24]"
        style={{ animation: 'completeEnter 0.45s cubic-bezier(0.25, 1, 0.5, 1)' }}
      >
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-[#2a2010] border border-[#3a3020]">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>

        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
        >
          复习完成
        </h2>
        <p className="text-gray-600 text-sm mb-7">做得好！继续积累词汇。</p>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 gap-3 mb-7"
          style={{
            opacity: showStats ? 1 : 0,
            transform: showStats ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.4s ease 0.2s',
          }}
        >
          <div className="rounded-xl p-4 bg-[#1a2030] border border-[#2a3a50]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span className="text-gray-500 text-xs">识忆</span>
            </div>
            <p className="text-xl font-bold text-white">{recallRate}%</p>
            <p className="text-gray-600 text-xs mt-1">
              {reviewState.stats.recallCorrect}/{totalRecall} 正确
            </p>
          </div>

          <div className="rounded-xl p-4 bg-[#2a2010] border border-[#3a3020]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-gray-500 text-xs">拼写</span>
            </div>
            <p className="text-xl font-bold text-white">{spellRate}%</p>
            <p className="text-gray-600 text-xs mt-1">
              {reviewState.stats.spellCorrect}/{totalSpell} correct
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-gray-400 font-medium text-sm transition-all hover:bg-[#1a1a20] active:scale-[0.98] bg-[#16161a] border border-[#1e1e24]"
          >
            <Home className="w-4 h-4" />
            <span>首页</span>
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-green-400 font-medium text-sm transition-all hover:bg-[#1f3a26] active:scale-[0.98] bg-[#1a2e1f] border border-[#203a28]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次复习</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes completeEnter {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
