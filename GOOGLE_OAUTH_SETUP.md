# Configuração do Google OAuth para Supabase

## Erro: redirect_uri_mismatch

Este erro ocorre quando a URL de redirecionamento configurada no Google OAuth não corresponde à URL configurada no Supabase.

## Solução

### 1. Configurar no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **APIs & Services** > **Credentials**
3. Encontre seu OAuth 2.0 Client ID
4. Clique em **Edit**
5. Em **Authorized redirect URIs**, adicione:
   ```
   https://ifuhypkkmkaklkmcypmc.supabase.co/auth/v1/callback
   ```
6. Salve as alterações

### 2. Configurar no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto `ifuhypkkmkaklkmcypmc`
3. Vá para **Authentication** > **Providers**
4. Encontre **Google** e clique em **Configure**
5. Em **Redirect URL**, certifique-se de que está:
   ```
   https://ifuhypkkmkaklkmcypmc.supabase.co/auth/v1/callback
   ```

### 3. URLs de Desenvolvimento Local

Para desenvolvimento local, também adicione no Google Cloud Console:
```
http://localhost:5173/auth/callback
```

### 4. Verificar Configurações

- **Google Client ID**: Deve estar configurado no Supabase
- **Google Client Secret**: Deve estar configurado no Supabase
- **Redirect URI**: Deve ser exatamente `https://ifuhypkkmkaklkmcypmc.supabase.co/auth/v1/callback`

## Arquivos Modificados

- `src/contexts/AuthContext.tsx`: URL de redirecionamento corrigida
- `src/pages/AuthCallback.tsx`: Nova página para processar callback
- `src/App.tsx`: Rota `/auth/callback` adicionada

## Teste

Após configurar, teste o login com Google:
1. Clique em "Continuar com o Google"
2. Complete a autenticação no Google
3. Deve redirecionar para `/auth/callback`
4. Após processar, deve redirecionar para `/dashboard` ou `/onboarding`
