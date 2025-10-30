# Configuração OAuth Google - Checklist

## ✅ Correções Aplicadas no Código

1. **Criada função `normalizeAppUrl()`** - Garante que sempre use `www.atomictrack.com.br`
2. **Atualizado `AuthContext.tsx`** - Usa URL normalizada para OAuth redirect
3. **Atualizado `vercel.json`** - Redireciona `atomictrack.com.br` → `www.atomictrack.com.br`
4. **Logs de debug adicionados** - Facilita identificação de problemas

## 📋 Configurações Necessárias no Supabase

### 1. Site URL
**Local:** `https://supabase.com/dashboard/project/ifuhypkkmkaklkmcypmc/auth/url-configuration`

**Configurar:**
```
Site URL: https://www.atomictrack.com.br
```

### 2. Redirect URLs
**No mesmo local acima, adicionar nas Redirect URLs (uma por linha):**
```
https://www.atomictrack.com.br/auth/callback
https://www.atomictrack.com.br/**
```

### 3. Google OAuth Provider
**Local:** `https://supabase.com/dashboard/project/ifuhypkkmkaklkmcypmc/auth/providers`

**Verificar:**
- ✅ Provider Google está **Enabled**
- ✅ **Client ID** está preenchido
- ✅ **Client Secret** está preenchido

## 📋 Configurações no Google Cloud Console

### Authorized Redirect URIs
**Local:** `https://console.cloud.google.com/apis/credentials`

**Configurar no OAuth 2.0 Client ID usado pelo Supabase:**

Adicionar APENAS esta URI:
```
https://ifuhypkkmkaklkmcypmc.supabase.co/auth/v1/callback
```

⚠️ **IMPORTANTE:** Não adicionar `www.atomictrack.com.br` aqui! O Supabase faz o redirect intermediário.

## 🔍 Como Testar

1. Abra o console do navegador (F12)
2. Acesse `https://www.atomictrack.com.br/auth` ou `https://atomictrack.com.br/auth`
3. Se acessar sem www, deve redirecionar automaticamente para www
4. Clique em "Continuar com o Google"
5. Verifique nos logs do console:
   - `🔐 Iniciando login Google OAuth`
   - `📍 Redirect URL: https://www.atomictrack.com.br/auth/callback`
6. Após autenticar no Google, verifique:
   - `🔄 AuthCallback iniciado`
   - `📍 URL atual:` (deve mostrar www.atomictrack.com.br)
   - `✅ Sessão obtida: Sessão encontrada`
   - `🚀 Redirecionando para: /dashboard` ou `/onboarding`

## 🐛 Troubleshooting

### Problema: Ainda redireciona para localhost
**Solução:** Verificar se a variável de ambiente `VITE_SUPABASE_URL` está correta na Vercel

### Problema: Erro "redirect_uri_mismatch"
**Solução:** Verificar se a URI `https://ifuhypkkmkaklkmcypmc.supabase.co/auth/v1/callback` está no Google Cloud Console

### Problema: Hash da URL não contém tokens
**Solução:** Verificar Site URL no Supabase está como `https://www.atomictrack.com.br` (sem barra no final)

### Problema: Loop de redirecionamento
**Solução:** Verificar logs do console. O AuthContext não deve redirecionar quando estiver em `/auth/callback`

## 📝 Notas

- A função `normalizeAppUrl()` sempre retorna `www.atomictrack.com.br` em produção
- O Vercel redireciona automaticamente de `atomictrack.com.br` para `www.atomictrack.com.br`
- Os logs ajudam a identificar exatamente onde o problema ocorre
- A URL de redirect OAuth sempre será `https://www.atomictrack.com.br/auth/callback` independente de como o usuário acessou




