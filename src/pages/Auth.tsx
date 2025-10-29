import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button as UIButton } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido').min(1, 'Email é obrigatório');
const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um símbolo');
const confirmPasswordSchema = z.string();
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');

// Ícone do Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const onboardingCompleted = user.user_metadata?.onboarding_completed;
      navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // O redirecionamento cuida do resto, não precisa setar loading para false
    } catch (error) {
      toast.error('Erro ao fazer login com Google');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (isSignUp) {
        nameSchema.parse(name);
        
        // Validar confirmação de senha
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        
        if (error) {
          console.error('SignUp error:', error);
          
          // Validações específicas para diferentes tipos de erro
          if (error.message.includes('already registered') || 
              error.message.includes('User already registered') ||
              error.message.includes('email address has already been registered')) {
            setError('Este email já está cadastrado. Faça login ou use outro email.');
          } else if (error.message.includes('Password should be at least')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.message.includes('Invalid email')) {
            setError('Email inválido. Verifique o formato.');
          } else if (error.message.includes('Signup is disabled')) {
            setError('Cadastro temporariamente desabilitado. Tente novamente mais tarde.');
          } else {
            setError('Erro ao criar conta. Verifique os dados e tente novamente.');
          }
        } else {
          toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
          navigate('/onboarding');
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          console.error('SignIn error:', error);
          
          // Validações específicas para login
          if (error.message.includes('Invalid login credentials') ||
              error.message.includes('Invalid email or password')) {
            setError('Email ou senha incorretos. Verifique e tente novamente.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Email não confirmado. Verifique sua caixa de entrada.');
          } else if (error.message.includes('Too many requests')) {
            setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
          } else if (error.message.includes('User not found')) {
            setError('Usuário não encontrado. Verifique o email ou cadastre-se.');
          } else {
            setError('Erro ao fazer login. Tente novamente.');
          }
        } else {
          toast.success('Login realizado com sucesso!');
        }
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      
      if (err?.issues) {
        // Erro de validação do Zod
        const firstIssue = err.issues[0];
        if (firstIssue.path[0] === 'email') {
          setError('Email inválido. Verifique o formato.');
        } else if (firstIssue.path[0] === 'password') {
          setError(firstIssue.message);
        } else if (firstIssue.path[0] === 'name') {
          setError('Nome deve ter pelo menos 2 caracteres.');
        } else {
          setError(firstIssue.message);
        }
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/atom-logo.png" 
              alt="atomicTrack" 
              className="w-16 h-16 sm:w-20 sm:h-20 opacity-90"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            atomicTrack
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Construa hábitos que duram
          </p>
        </div>

        {/* Auth Card */}
        <div className="neuro-card rounded-2xl p-6 sm:p-8 animate-scale-in">
          {error && (
            <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <UIButton
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || loading}
            variant="outline"
            className="w-full mb-6 h-12 text-sm font-medium"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Entrando com Google...
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="ml-2">Continuar com o Google</span>
              </>
            )}
          </UIButton>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2.5">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Como podemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || isGoogleLoading}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2.5">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isGoogleLoading}
                required
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2.5">
                            Senha
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading || isGoogleLoading}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {isSignUp && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground font-medium">Pré-requisitos da senha:</p>
                              <div className="space-y-1">
                                <div className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                  Pelo menos 8 caracteres
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                  Uma letra maiúscula
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                  Um número
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                  Um símbolo
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {isSignUp && (
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2.5">
                              Confirmar Senha
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={loading || isGoogleLoading}
                              required
                              className={`w-full px-4 py-3 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                confirmPassword && password !== confirmPassword 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : confirmPassword && password === confirmPassword
                                  ? 'border-emerald-500 focus:border-emerald-500'
                                  : 'border-border focus:border-primary'
                              }`}
                            />
                            {confirmPassword && password !== confirmPassword && (
                              <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                            )}
                            {confirmPassword && password === confirmPassword && (
                              <p className="text-xs text-emerald-500 mt-1">Senhas coincidem</p>
                            )}
                          </div>
                        )}

            <button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="w-full px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>{isSignUp ? 'Criando conta...' : 'Entrando...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              disabled={loading || isGoogleLoading}
            >
              {isSignUp ? (
                <>
                  Já tem uma conta? <span className="font-medium text-primary">Entre aqui</span>
                </>
              ) : (
                <>
                  Não tem uma conta? <span className="font-medium text-primary">Cadastre-se</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/70 text-xs mt-8">
          Grátis para sempre • Sem cartão
        </p>
      </div>
    </div>
  );
};

export default Auth;