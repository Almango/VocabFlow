import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

export default function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const { signIn, signUp, user } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnonymous = user?.is_anonymous ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } =
      tab === 'login'
        ? await signIn(username, password)
        : await signUp(username, password);

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setUsername('');
      setPassword('');
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121216] border-[#1e1e24] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {tab === 'login' ? '登录账号' : '创建账号'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isAnonymous && tab === 'signup'
              ? '当前是匿名用户，创建账号后会保留现有数据。'
              : '登录后可跨设备同步你的词组数据。'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a24]">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#252532] data-[state=active]:text-white">
              登录
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-[#252532] data-[state=active]:text-white">
              注册
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <AuthForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              loading={loading}
              error={error}
              submitLabel="登录"
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="signup">
            <AuthForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              loading={loading}
              error={error}
              submitLabel={isAnonymous ? '保存到账号' : '创建账号'}
              onSubmit={handleSubmit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface AuthFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
}

function AuthForm({
  username,
  setUsername,
  password,
  setPassword,
  loading,
  error,
  submitLabel,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm text-gray-300">
          用户名
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="yourname"
          className="bg-[#1a1a24] border-[#2a2a36] text-white placeholder:text-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-gray-300">
          密码
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="至少 6 位"
          className="bg-[#1a1a24] border-[#2a2a36] text-white placeholder:text-gray-600"
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
      >
        {loading ? '请稍候...' : submitLabel}
      </Button>
    </form>
  );
}
