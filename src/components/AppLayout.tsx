'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './topbar';
import ScheduleReminders from './ScheduleReminders';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath = '/' }: AppLayoutProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'ready' | 'error'>('checking');
  const [authError, setAuthError] = useState('');

  const verifySession = useCallback(async () => {
    setAuthState('checking');
    setAuthError('');
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      if (response.status === 401 || response.status === 404) {
        router.replace('/sign-up-login-screen');
        return;
      }
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to verify your session.');
      }
      setAuthState('ready');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to verify your session.');
      setAuthState('error');
    }
  }, [router]);

  useEffect(() => {
    void verifySession();
  }, [verifySession]);

  if (authState !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        {authState === 'checking' ? (
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        ) : (
          <div className="max-w-md text-center">
            <p className="text-sm text-danger">{authError}</p>
            <button type="button" onClick={() => void verifySession()} className="btn-secondary mt-4">
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentPath={currentPath} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <ScheduleReminders />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}