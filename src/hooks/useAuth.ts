import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name?: string;
  avatar_url?: string;
  desired_identity?: string;
}

interface AuthError {
  message: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // 1. Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (authError) throw authError;

      // 2. Criar perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            name,
            avatar_type: 'initials',
            avatar_color: 'violet',
            tier: 'free',
            xp: 0,
            level: 1
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileData) => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);

      // 1. Atualizar metadados do auth
      const { error: authError } = await supabase.auth.updateUser({
        data: profileData
      });

      if (authError) throw authError;

      // 2. Atualizar tabela de profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
}