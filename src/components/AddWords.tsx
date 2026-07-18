import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTranslator } from '@/hooks/useTranslator';
import type { WordGroup } from '@/types';

interface AddWordsProps {
  group: WordGroup;
  onAddWord: (groupId: string, english: string, chinese: string) => void;
  onDeleteWord: (groupId: string, wordId: string) => void;
  onBack: () => void;
}

export default function AddWords({ group, onAddWord, onDeleteWord, onBack }: AddWordsProps) {
  const [english, setEnglish] = useState('');
  const [chinese, setChinese] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { translate, isTranslating } = useTranslator();

  const handleTranslate = async () => {
    if (!english.trim() || isTranslating) return;
    const result = await translate(english.trim());
    if (result) {
      setChinese(result);
    }
  };

  const handleSubmit = () => {
    if (!english.trim() || !chinese.trim()) return;
    onAddWord(group.id, english.trim(), chinese.trim());
    setEnglish('');
    setChinese('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!chinese.trim() && english.trim()) {
        handleTranslate();
      } else {
        handleSubmit();
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
          >
            {group.name}
          </h2>
          <p className="text-gray-600 text-xs">{group.words.length} words</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="rounded-2xl p-4 mb-4 bg-[#121216] border border-[#1e1e24]">
        <div className="flex gap-3 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={english}
            onChange={e => setEnglish(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="English word..."
            className="flex-1 bg-transparent text-white placeholder-gray-700 outline-none text-lg border-b border-[#1e1e24] focus:border-[#60a5fa]/50 pb-2 transition-colors"
            style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
            autoComplete="off"
          />
          <button
            onClick={handleTranslate}
            disabled={!english.trim() || isTranslating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a2030] text-[#60a5fa] hover:bg-[#1e2840] disabled:opacity-30 disabled:hover:bg-[#1a2030] transition-all text-sm"
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Translate</span>
          </button>
        </div>

        <input
          type="text"
          value={chinese}
          onChange={e => setChinese(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chinese meaning..."
          className="w-full bg-transparent text-white placeholder-gray-700 outline-none text-base border-b border-[#1e1e24] focus:border-[#60a5fa]/50 pb-2 transition-colors mb-3"
        />

        <button
          onClick={handleSubmit}
          disabled={!english.trim() || !chinese.trim()}
          className="w-full py-2.5 rounded-xl bg-[#1a2e1f] text-green-400 hover:bg-[#1f3a26] disabled:opacity-30 disabled:hover:bg-[#1a2e1f] transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Word</span>
        </button>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pb-4">
        {[...group.words].reverse().map((word, idx) => (
          <div
            key={word.id}
            className="rounded-lg p-3 flex items-center gap-3 group bg-[#0e0e12] border border-transparent hover:border-[#1e1e24] transition-all"
            style={{
              animation: `slideIn 0.25s ease ${idx * 0.02}s both`,
            }}
          >
            <span className="text-gray-700 text-xs w-6 text-right flex-shrink-0">
              {group.words.length - idx}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-white font-medium text-sm truncate"
                style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
              >
                {word.english}
              </p>
              <p className="text-gray-600 text-xs truncate">{word.chinese}</p>
            </div>
            <button
              onClick={() => onDeleteWord(group.id, word.id)}
              className="w-6 h-6 rounded flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {group.words.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 text-sm">No words yet</p>
            <p className="text-gray-800 text-xs mt-1">Start adding words above</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
