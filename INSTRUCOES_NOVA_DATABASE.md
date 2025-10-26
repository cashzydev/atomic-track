# 🚀 Configuração da Nova Database Supabase

## 📋 Passos para Configurar a Nova Database

### 1. **Configurar Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# URL da API do Supabase
VITE_SUPABASE_URL=https://ifuhypkkmkaklkmcypmc.supabase.co

# Chave anônima do Supabase (obtenha no dashboard)
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 2. **Obter as Chaves do Supabase**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto `ifuhypkkmkaklkmcypmc`
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. **Executar Script de Configuração**
1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o script `setup_nova_database.sql`
3. Aguarde a execução completa

### 4. **Adicionar Usuário Admin**
Após fazer login com `lucasoliveiratnb0@gmail.com`, execute:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### 5. **Reiniciar o Servidor**
```bash
# Parar o servidor atual
pkill -f "npm run dev"

# Iniciar novamente
npm run dev
```

## 🔧 Arquivos Atualizados

- ✅ `supabase/config.toml` → Project ID atualizado
- ✅ `setup_nova_database.sql` → Script completo de configuração
- ✅ `NOVA_DATABASE_CONFIG.md` → Instruções detalhadas

## 🎯 O que o Script Faz

### **Tabelas Criadas:**
- `user_roles` → Gerenciamento de roles (admin/user)
- `profiles` → Perfis de usuários
- `habits` → Hábitos dos usuários
- `habit_completions` → Completions dos hábitos

### **Funções Criadas:**
- `has_role()` → Verificar roles
- `add_user_role()` → Adicionar roles (admin only)
- `remove_user_role()` → Remover roles (admin only)
- `complete_habit()` → Completar hábito
- `undo_habit()` → Desfazer hábito
- `get_user_stats()` → Estatísticas do usuário
- `get_user_xp()` → Obter XP do usuário
- `add_user_xp()` → Adicionar XP

### **Políticas RLS:**
- ✅ Usuários só veem seus próprios dados
- ✅ Admins podem gerenciar todos os roles
- ✅ Segurança completa implementada

## 🚨 Importante

1. **A database está vazia** → Execute o script completo
2. **Faça login primeiro** → Depois adicione a role de admin
3. **Reinicie o servidor** → Para carregar as novas variáveis
4. **Teste o acesso** → `/admin` deve funcionar

## 🔍 Debug

Se ainda houver problemas:
1. Use o `AdminDebugCard` no Dashboard
2. Verifique as variáveis de ambiente
3. Confirme se o usuário tem role de admin no banco
4. Verifique os logs do console do navegador
