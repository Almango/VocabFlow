export interface Word {
  id: string;
  english: string;
  chinese: string;
  createdAt: number;
  lastReviewedAt: number | null;
  recallCorrectCount: number;
  recallIncorrectCount: number;
  spellCorrectCount: number;
  spellIncorrectCount: number;
}

export interface WordGroup {
  id: string;
  name: string;
  createdAt: number;
  words: Word[];
}

export type ReviewPhase = 'recall' | 'spelling' | 'complete';

export interface ReviewState {
  groupId: string;
  phase: ReviewPhase;
  recallQueue: Word[];
  spellingQueue: Word[];
  currentIndex: number;
  showAnswer: boolean;
  stats: {
    recallCorrect: number;
    recallIncorrect: number;
    spellCorrect: number;
    spellIncorrect: number;
  };
}

export type AppView = 'dashboard' | 'review' | 'add-words';
