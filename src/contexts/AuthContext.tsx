import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    return data as Profile;
  }

  async function ensureProfile(currentUser: User): Promise<Profile | null> {
    const existingProfile = await fetchProfile(currentUser.id);
    if (existingProfile) return existingProfile;

    const fullName =
      typeof currentUser.user_metadata?.full_name === 'string'
        ? currentUser.user_metadata.full_name
        : '';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: currentUser.id,
        full_name: fullName,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error.message);
      return null;
    }

    return data as Profile;
  }

  useEffect(() => {
    // Get the initial session without blocking the listener setup.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        ensureProfile(currentUser).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Use a non-async callback with an inner IIFE to handle async work safely.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      void (async () => {
        if (currentUser) {
          const p = await ensureProfile(currentUser);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<void> {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (signUpError) throw signUpError;

    const newUser = data.user;
    if (!newUser) throw new Error('Sign-up succeeded but no user was returned.');

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: newUser.id,
      full_name: fullName,
    });

    if (profileError) throw profileError;
  }

  async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile(updates: Partial<Profile>): Promise<void> {
    if (!user) throw new Error('No authenticated user.');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...updates, id: user.id })
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
