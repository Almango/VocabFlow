import { useState } from 'react';
import { Plus, BookOpen, Brain, Trash2, Edit2, Check, X, Play } from 'lucide-react';
import type { WordGroup } from '@/types';

interface DashboardProps {
  groups: WordGroup[];
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onStartReview: (id: string) => void;
  onGoToAddWords: (id: string) => void;
}

export default function Dashboard({
  groups,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onStartReview,
  onGoToAddWords,
}: DashboardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
  const totalReviewed = groups.reduce(
    (sum, g) => sum + g.words.filter(w => w.recallCorrectCount > 0).length,
    0
  );

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateGroup(newName.trim());
      setNewName('');
      setShowCreate(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameGroup(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
          >
            VocabFlow
          </h1>
          <p className="text-gray-500 text-xs mt-1">词汇塑造思维</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-white">{totalWords}</p>
          <p className="text-gray-500 text-xs">单词</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-2xl p-5 mb-6 bg-[#121216] border border-[#1e1e24]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#1a1a24]">
            <Brain className="w-6 h-6 text-[#60a5fa]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">学习进度</p>
            <p className="text-gray-500 text-xs">已复习 {totalReviewed} / {totalWords} 个单词</p>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e1e24" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
                strokeDasharray={`${totalWords > 0 ? (totalReviewed / totalWords) * 97 : 0} 97`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
              {totalWords > 0 ? Math.round((totalReviewed / totalWords) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Word Groups */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Word Groups</h2>
        <span className="text-gray-600 text-xs">{groups.length} groups</span>
      </div>

      <div className="space-y-2.5">
        {groups.map(group => (
          <div
            key={group.id}
            className="rounded-xl p-3.5 bg-[#121216] border border-[#1e1e24] hover:border-[#2a2a36] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1a1a24] flex-shrink-0">
                <BookOpen className="w-4 h-4 text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                {editingId === group.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-transparent text-white border-b border-[#60a5fa] outline-none text-sm w-full"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(group.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button onClick={() => handleRename(group.id)} className="text-green-400">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm truncate">{group.name}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(group.id);
                        setEditName(group.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p className="text-gray-600 text-xs">{group.words.length} 个单词</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onGoToAddWords(group.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#1e1e24] transition-all"
                  title="Add words"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {group.words.length > 0 && (
                  <button
                    onClick={() => onStartReview(group.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#1a3a2e] text-green-400 hover:bg-[#1f4a38] transition-all"
                    title="开始复习"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}

                {deleteConfirm === group.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onDeleteGroup(group.id);
                        setDeleteConfirm(null);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#1e1e24] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(group.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="rounded-2xl p-8 text-center bg-[#121216] border border-dashed border-[#1e1e24]">
            <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No word groups yet</p>
            <p className="text-gray-700 text-xs mt-1">Create your first group to get started</p>
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        {showCreate ? (
          <div className="flex items-center gap-2 rounded-xl p-1.5 pr-3 bg-[#1a1a22] border border-[#2a2a36]">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="词组名称..."
              className="bg-transparent text-white placeholder-gray-600 outline-none text-sm px-3 py-1.5 w-44"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowCreate(false);
                  setNewName('');
                }
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-7 h-7 rounded-lg bg-[#60a5fa] flex items-center justify-center text-white disabled:opacity-30 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName('');
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-12 h-12 rounded-full bg-[#60a5fa] hover:bg-[#4a8fe0] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
