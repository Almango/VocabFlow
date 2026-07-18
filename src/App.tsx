import { useState } from 'react';
import { useWordGroups } from '@/hooks/useWordGroups';
import { useAuth, getDisplayName } from '@/contexts/AuthContext';
import Background3D from '@/components/Background3D';
import Dashboard from '@/components/Dashboard';
import AddWords from '@/components/AddWords';
import ReviewRecall from '@/components/ReviewRecall';
import ReviewSpell from '@/components/ReviewSpell';
import ReviewComplete from '@/components/ReviewComplete';
import AuthModal from '@/components/AuthModal';
import { Cloud, Check, Loader2, AlertCircle, User, LogOut } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useWordGroups';
import './App.css';

function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'idle') {
    return (
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <Cloud className="w-3.5 h-3.5" />
        <span>本地</span>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-1.5 text-blue-400 text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>同步中</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-red-400 text-xs" title="同步失败，数据仍保存在本地">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>同步失败</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-green-400 text-xs">
      <Check className="w-3.5 h-3.5" />
      <span>已同步</span>
    </div>
  );
}

function App() {
  const {
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
  } = useWordGroups();

  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  const activeGroup = activeGroupId ? getGroup(activeGroupId) : undefined;
  const isAnonymous = user?.is_anonymous ?? true;
  const displayName = getDisplayName(user);

  return (
    <div className="min-h-screen" style={{ background: '#08080a' }}>
      {/* Clean Background */}
      <Background3D />

      {/* Top Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Sync Status */}
        <div className="px-3 py-1.5 rounded-full bg-[#121216]/80 border border-[#1e1e24] backdrop-blur-sm">
          <SyncIndicator status={syncStatus} />
        </div>

        {/* User Button */}
        {isAnonymous ? (
          <button
            onClick={() => {
              setAuthTab('login');
              setAuthOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121216]/80 border border-[#1e1e24] text-gray-300 text-xs hover:text-white hover:border-[#2a2a36] transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>登录</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121216]/80 border border-[#1e1e24] text-xs">
            <span className="text-gray-300 truncate max-w-[120px]">{displayName || '已登录'}</span>
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="登出"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {currentView === 'dashboard' && (
        <Dashboard
          groups={groups}
          onCreateGroup={createGroup}
          onDeleteGroup={deleteGroup}
          onRenameGroup={renameGroup}
          onStartReview={startReview}
          onGoToAddWords={goToAddWords}
        />
      )}

      {currentView === 'add-words' && activeGroup && (
        <AddWords
          group={activeGroup}
          onAddWord={addWord}
          onDeleteWord={deleteWord}
          onBack={goToDashboard}
        />
      )}

      {currentView === 'review' && reviewState && activeGroup && (
        <>
          {reviewState.phase === 'recall' && reviewState.recallQueue.length > 0 && (
            <ReviewRecall
              reviewState={reviewState}
              group={activeGroup}
              onShowAnswer={showAnswer}
              onMarkRecall={markRecall}
              onExit={exitReview}
            />
          )}

          {reviewState.phase === 'spelling' && reviewState.spellingQueue.length > 0 && (
            <ReviewSpell
              reviewState={reviewState}
              onMarkSpelling={markSpelling}
              onExit={exitReview}
            />
          )}

          {reviewState.phase === 'complete' && (
            <ReviewComplete
              reviewState={reviewState}
              onHome={exitReview}
              onRetry={() => activeGroupId && startReview(activeGroupId)}
            />
          )}
        </>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </div>
  );
}

export default App;
