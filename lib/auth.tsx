import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { API_BASE_URL } from './constants';
import type { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activate: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  activate: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setIsLoading(true);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, branches:branch_id(name)')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        // Profile not found (user was deleted) - sign out
        if (!data) {
          console.warn('Profile not found for user, signing out');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }

        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          branch_id: data.branch_id || null,
          branch_name: (data.branches as any)?.name || null,
        });
        setIsLoading(false);
        return;
      } catch (error) {
        console.error(`fetchProfile attempt ${i + 1} failed:`, error);
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000));
        } else {
          // All retries exhausted - sign out to avoid stuck state
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
        }
      }
    }
    setIsLoading(false);
  }

  async function activate(code: string) {
    const response = await fetch(`${API_BASE_URL}/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Activation failed');
    }

    const { token_hash, email, otp, user_id } = await response.json();

    // Try OTP first (more reliable), fall back to token_hash
    let authError;
    if (otp && email) {
      const result = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink',
      });
      authError = result.error;
    }

    if (authError && token_hash) {
      const result = await supabase.auth.verifyOtp({
        token_hash,
        type: 'magiclink',
      });
      authError = result.error;
    }

    // Check if a session was established despite any errors
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession && authError) {
      throw authError;
    }

    // Mark device as connected after successful auth
    if (currentSession && user_id) {
      await fetch(`${API_BASE_URL}/auth/mark-connected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
      }).catch(() => {});
    }
  }

  async function signOut() {
    // Mark device as disconnected before signing out
    if (session?.access_token) {
      await fetch(`${API_BASE_URL}/auth/mark-disconnected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      }).catch(() => {});
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        activate,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
