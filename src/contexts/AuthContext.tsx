import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAppBaseUrl } from '@/utils/url';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateOnboardingStatus: (completed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true); // Garante que o loading é reativado se o contexto for remontado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // <--- PONTO CHAVE

        // Não redirecionar se estiver na rota de callback - o AuthCallback já cuida disso
        if (session?.user && !location.pathname.includes('/auth/callback')) {
          // Redirecionar baseado no status de onboarding apenas se não estiver na rota de callback
          const onboardingCompleted = session.user.user_metadata?.onboarding_completed;
          if (!onboardingCompleted && location.pathname !== '/onboarding') {
            navigate('/onboarding');
          } else if (onboardingCompleted && location.pathname !== '/dashboard' && !location.pathname.startsWith('/auth')) {
            navigate('/dashboard');
          }
          
          // Initialize user badges
          supabase.rpc('initialize_user_badges', { p_user_id: session.user.id });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${getAppBaseUrl()}/dashboard`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    // Criar perfil se o usuário foi criado
    if (!error && authData.user) {
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

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não retornar erro aqui para não quebrar o fluxo de signup
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      navigate('/dashboard');
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    // Sempre usar www para garantir consistência
    const redirectUrl = `${getAppBaseUrl()}/auth/callback`;
    
    console.log('🔐 Iniciando login Google OAuth');
    console.log('📍 Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('❌ Error signing in with Google:', error);
      // O erro será capturado pelo toast no componente que chama
    } else {
      console.log('✅ OAuth redirect iniciado com sucesso');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigate('/auth');
    }
  };

  const updateOnboardingStatus = async (completed: boolean) => {
    if (!user) return;
    
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: completed
      }
    });
    
    // Update local user state with new metadata
    if (session) {
      setSession({
        ...session,
        user: {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            onboarding_completed: completed
          }
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signUp, 
      signIn, 
      signInWithGoogle,
      signOut, 
      loading,
      updateOnboardingStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};