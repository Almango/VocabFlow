import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import type { ReviewState } from '@/types';

interface ReviewSpellProps {
  reviewState: ReviewState;
  onMarkSpelling: (correct: boolean) => void;
  onExit: () => void;
}

export default function ReviewSpell({
  reviewState,
  onMarkSpelling,
  onExit,
}: ReviewSpellProps) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = reviewState.spellingQueue[0];
  const progress = {
    total: reviewState.spellingQueue.length + reviewState.stats.spellCorrect + reviewState.stats.spellIncorrect,
    done: reviewState.stats.spellCorrect + reviewState.stats.spellIncorrect,
  };

  useEffect(() => {
    setInput('');
    setChecked(false);
    setIsCorrect(false);
    setAnimKey(prev => prev + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentWord?.id, attempt]);

  const handleCheck = useCallback(() => {
    if (!input.trim() || checked) return;
    const correct = input.trim().toLowerCase() === currentWord.english.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
  }, [input, checked, currentWord]);

  const handleNext = useCallback(() => {
    onMarkSpelling(isCorrect);
    // 增加尝试计数器，确保同一个单词被重新放回队列时也能刷新界面
    if (!isCorrect || reviewState.spellingQueue.length > 1) {
      setAttempt(prev => prev + 1);
    }
  }, [isCorrect, onMarkSpelling, reviewState.spellingQueue.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!checked) {
        handleCheck();
      } else {
        handleNext();
      }
    }
  }, [checked, handleCheck, handleNext]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checked) {
      // Only allow letters, limit to word length
      const val = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, currentWord.english.length);
      setInput(val);
    }
  }, [checked, currentWord]);

  const handleContainerClick = useCallback(() => {
    if (!checked) {
      inputRef.current?.focus();
    }
  }, [checked]);

  // Build visual slots
  const wordLen = currentWord?.english.length || 0;
  const inputChars = input.split('');

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
                background: '#f59e0b',
              }}
            />
          </div>
        </div>
        <span className="text-gray-600 text-sm tabular-nums">
          {reviewState.spellingQueue.length}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          key={animKey}
          className="w-full rounded-2xl p-8 text-center bg-[#121216] border border-[#1e1e24]"
          style={{
            borderColor: checked
              ? isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'
              : '#1e1e24',
            animation: 'cardEnter 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Phase Badge */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#2a2010] text-[#f59e0b]">
              Spelling Mode
            </span>
          </div>

          {/* Chinese Prompt */}
          <p className="text-2xl text-gray-300 mb-2 leading-relaxed">
            {currentWord.chinese}
          </p>
          <p className="text-gray-700 text-sm mb-6">Spell the English word</p>

          {/* Input Area - clickable container */}
          <div
            className="relative mb-4 cursor-text"
            onClick={handleContainerClick}
          >
            {/* Visual letter slots */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: wordLen }).map((_, i) => {
                const char = inputChars[i] || '';
                const targetChar = currentWord.english[i];
                const isMatch = char.toLowerCase() === targetChar.toLowerCase();
                const showResult = checked;

                return (
                  <div
                    key={i}
                    className="w-8 h-10 flex items-center justify-center rounded-lg border-b-2 transition-all duration-200"
                    style={{
                      borderColor: showResult
                        ? isMatch ? '#4ade80' : '#f87171'
                        : char ? '#3a3a46' : '#1e1e24',
                      background: showResult
                        ? isMatch ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)'
                        : char ? 'rgba(255,255,255,0.03)' : 'transparent',
                    }}
                  >
                    <span
                      className="text-xl font-bold transition-colors duration-200"
                      style={{
                        fontFamily: '"DM Serif Display", "Playfair Display", serif',
                        color: showResult
                          ? isMatch ? '#4ade80' : '#f87171'
                          : char ? '#ffffff' : '#333340',
                      }}
                    >
                      {char || '\u00A0'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Invisible but focusable input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              style={{ zIndex: 10 }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
            />
          </div>

          {/* Hint text */}
          {!checked && input.length === 0 && (
            <p className="text-gray-700 text-xs">Click here and type the word</p>
          )}

          {/* Feedback */}
          {checked && (
            <div className="mt-4" style={{ animation: 'fadeUp 0.3s ease' }}>
              {isCorrect ? (
                <p className="text-green-400 text-sm font-medium">Correct!</p>
              ) : (
                <div>
                  <p className="text-red-400 text-sm font-medium mb-1">Try again later</p>
                  <p
                    className="text-white text-lg"
                    style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
                  >
                    {currentWord.english}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pb-8 pt-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all active:scale-[0.98] disabled:opacity-30 bg-[#2a2010] border border-[#3a3020] hover:bg-[#332815]"
          >
            <Check className="w-4 h-4" />
            <span>Check</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all active:scale-[0.98]"
            style={{
              background: isCorrect ? '#1a2e1f' : '#1a2030',
              border: isCorrect ? '1px solid #203a28' : '1px solid #2a3a50',
            }}
          >
            <ArrowRight className="w-4 h-4" />
            <span>Next</span>
          </button>
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
