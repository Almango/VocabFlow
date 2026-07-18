import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData } from '@/services/wordService';
import type { WordGroup, Word, ReviewState, AppView, ReviewPhase } from '@/types';

const STORAGE_KEY = 'vocabflow-groups';
const REVIEW_KEY = 'vocabflow-review';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadGroups(): WordGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveGroups(groups: WordGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

function loadReviewState(): ReviewState | null {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveReviewState(state: ReviewState | null) {
  if (state) {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(REVIEW_KEY);
  }
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export function useWordGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<WordGroup[]>(loadGroups);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState | null>(loadReviewState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const hasLocalChanges = useRef(false);
  const initialSyncDone = useRef(false);

  // 首次登录后从云端拉取数据
  useEffect(() => {
    if (!user || initialSyncDone.current) return;
    const uid = user.id;

    async function syncFromCloud() {
      setSyncStatus('syncing');
      try {
        const data = await loadUserData(uid);

        if (data && data.groups.length > 0) {
          // 云端有数据：若本地未改动则使用云端，否则保留本地并上传
          if (!hasLocalChanges.current) {
            setGroups(data.groups);
            saveGroups(data.groups);
            if (data.reviewState) {
              setReviewState(data.reviewState);
              saveReviewState(data.reviewState);
            }
          } else {
            await saveUserData(uid, groups, reviewState);
          }
        } else if (groups.length > 0) {
          // 云端无数据且本地有数据，上传本地
          await saveUserData(uid, groups, reviewState);
        }

        initialSyncDone.current = true;
        setSyncStatus('synced');
      } catch (err) {
        console.error('Sync from cloud failed:', err);
        setSyncStatus('error');
      }
    }

    syncFromCloud();
  }, [user, groups, reviewState]);

  // 数据变化时防抖同步到云端
  useEffect(() => {
    if (!user || !initialSyncDone.current) return;

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await saveUserData(user.id, groups, reviewState);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Sync to cloud failed:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [groups, reviewState, user]);

  const persistGroups = useCallback((newGroups: WordGroup[]) => {
    hasLocalChanges.current = true;
    setGroups(newGroups);
    saveGroups(newGroups);
  }, []);

  const createGroup = useCallback((name: string) => {
    const newGroup: WordGroup = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      words: [],
    };
    const updated = [newGroup, ...groups];
    persistGroups(updated);
    return newGroup.id;
  }, [groups, persistGroups]);

  const deleteGroup = useCallback((groupId: string) => {
    const updated = groups.filter(g => g.id !== groupId);
    persistGroups(updated);
  }, [groups, persistGroups]);

  const renameGroup = useCallback((groupId: string, newName: string) => {
    const updated = groups.map(g =>
      g.id === groupId ? { ...g, name: newName } : g
    );
    persistGroups(updated);
  }, [groups, persistGroups]);

  const addWord = useCallback((groupId: string, english: string, chinese: string) => {
    const newWord: Word = {
      id: generateId(),
      english: english.trim(),
      chinese: chinese.trim(),
      createdAt: Date.now(),
      lastReviewedAt: null,
      recallCorrectCount: 0,
      recallIncorrectCount: 0,
      spellCorrectCount: 0,
      spellIncorrectCount: 0,
    };
    const updated = groups.map(g =>
      g.id === groupId ? { ...g, words: [...g.words, newWord] } : g
    );
    persistGroups(updated);
  }, [groups, persistGroups]);

  const deleteWord = useCallback((groupId: string, wordId: string) => {
    const updated = groups.map(g =>
      g.id === groupId ? { ...g, words: g.words.filter(w => w.id !== wordId) } : g
    );
    persistGroups(updated);
  }, [groups, persistGroups]);

  const getGroup = useCallback((groupId: string): WordGroup | undefined => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  const startReview = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.words.length === 0) return;

    const shuffled = [...group.words].sort(() => Math.random() - 0.5);
    const state: ReviewState = {
      groupId,
      phase: 'recall',
      recallQueue: shuffled,
      spellingQueue: [],
      currentIndex: 0,
      showAnswer: false,
      stats: {
        recallCorrect: 0,
        recallIncorrect: 0,
        spellCorrect: 0,
        spellIncorrect: 0,
      },
    };
    hasLocalChanges.current = true;
    setReviewState(state);
    saveReviewState(state);
    setActiveGroupId(groupId);
    setCurrentView('review');
  }, [groups]);

  const showAnswer = useCallback(() => {
    hasLocalChanges.current = true;
    setReviewState(prev => {
      if (!prev) return prev;
      const next = { ...prev, showAnswer: true };
      saveReviewState(next);
      return next;
    });
  }, []);

  const markRecall = useCallback((correct: boolean) => {
    hasLocalChanges.current = true;
    setReviewState(prev => {
      if (!prev || prev.recallQueue.length === 0) return prev;

      const currentWord = prev.recallQueue[0];
      const remaining = prev.recallQueue.slice(1);

      const updatedGroups = groups.map(g => {
        if (g.id !== prev.groupId) return g;
        return {
          ...g,
          words: g.words.map(w => {
            if (w.id !== currentWord.id) return w;
            return {
              ...w,
              lastReviewedAt: Date.now(),
              recallCorrectCount: correct ? w.recallCorrectCount + 1 : w.recallCorrectCount,
              recallIncorrectCount: correct ? w.recallIncorrectCount : w.recallIncorrectCount + 1,
            };
          }),
        };
      });
      persistGroups(updatedGroups);

      if (correct) {
        const newSpelling = [...prev.spellingQueue, currentWord];
        if (remaining.length === 0) {
          if (newSpelling.length === 0) {
            const next: ReviewState = {
              ...prev,
              phase: 'complete' as ReviewPhase,
              recallQueue: remaining,
              spellingQueue: newSpelling,
              showAnswer: false,
              stats: {
                ...prev.stats,
                recallCorrect: prev.stats.recallCorrect + 1,
              },
            };
            saveReviewState(next);
            return next;
          }
          const next: ReviewState = {
            ...prev,
            phase: 'spelling' as ReviewPhase,
            recallQueue: remaining,
            spellingQueue: newSpelling,
            currentIndex: 0,
            showAnswer: false,
            stats: {
              ...prev.stats,
              recallCorrect: prev.stats.recallCorrect + 1,
            },
          };
          saveReviewState(next);
          return next;
        }
        const next: ReviewState = {
          ...prev,
          recallQueue: remaining,
          spellingQueue: newSpelling,
          showAnswer: false,
          stats: {
            ...prev.stats,
            recallCorrect: prev.stats.recallCorrect + 1,
          },
        };
        saveReviewState(next);
        return next;
      } else {
        const newRecall = [...remaining, currentWord];
        const next: ReviewState = {
          ...prev,
          recallQueue: newRecall,
          showAnswer: false,
          stats: {
            ...prev.stats,
            recallIncorrect: prev.stats.recallIncorrect + 1,
          },
        };
        saveReviewState(next);
        return next;
      }
    });
  }, [groups, persistGroups]);

  const markSpelling = useCallback((correct: boolean) => {
    hasLocalChanges.current = true;
    setReviewState(prev => {
      if (!prev || prev.spellingQueue.length === 0) return prev;

      const currentWord = prev.spellingQueue[0];
      const remaining = prev.spellingQueue.slice(1);

      const updatedGroups = groups.map(g => {
        if (g.id !== prev.groupId) return g;
        return {
          ...g,
          words: g.words.map(w => {
            if (w.id !== currentWord.id) return w;
            return {
              ...w,
              spellCorrectCount: correct ? w.spellCorrectCount + 1 : w.spellCorrectCount,
              spellIncorrectCount: correct ? w.spellIncorrectCount : w.spellIncorrectCount + 1,
            };
          }),
        };
      });
      persistGroups(updatedGroups);

      if (correct) {
        if (remaining.length === 0) {
          const next: ReviewState = {
            ...prev,
            phase: 'complete' as ReviewPhase,
            spellingQueue: remaining,
            showAnswer: false,
            stats: {
              ...prev.stats,
              spellCorrect: prev.stats.spellCorrect + 1,
            },
          };
          saveReviewState(next);
          return next;
        }
        const next: ReviewState = {
          ...prev,
          spellingQueue: remaining,
          showAnswer: false,
          stats: {
            ...prev.stats,
            spellCorrect: prev.stats.spellCorrect + 1,
          },
        };
        saveReviewState(next);
        return next;
      } else {
        const newSpelling = [...remaining, currentWord];
        const next: ReviewState = {
          ...prev,
          spellingQueue: newSpelling,
          showAnswer: false,
          stats: {
            ...prev.stats,
            spellIncorrect: prev.stats.spellIncorrect + 1,
          },
        };
        saveReviewState(next);
        return next;
      }
    });
  }, [groups, persistGroups]);

  const exitReview = useCallback(() => {
    hasLocalChanges.current = true;
    setReviewState(null);
    saveReviewState(null);
    setCurrentView('dashboard');
    setActiveGroupId(null);
  }, []);

  const goToAddWords = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    setCurrentView('add-words');
  }, []);

  const goToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setActiveGroupId(null);
  }, []);

  return {
    groups,
    currentView,
    activeGroupId,
    reviewState,
    syncStatus,
    createGroup,
    deleteGroup,
    renameGroup,
    addWord,
    deleteWord,
    getGroup,
    startReview,
    showAnswer,
    markRecall,
    markSpelling,
    exitReview,
    goToAddWords,
    goToDashboard,
  };
}
