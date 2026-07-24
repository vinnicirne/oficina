-- Inicialização do Banco de Dados Supabase (PostgreSQL)

-- Habilita a extensão de UUID (embora vamos usar TEXT para ids importados do Mongo, exceto usuários)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS (Ligada ao auth.users do Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  roles TEXT DEFAULT 'cliente',
  department TEXT DEFAULT 'Cliente',
  status TEXT DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE CLIENTES
CREATE TABLE public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  score NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  "businessUnit" TEXT DEFAULT 'OFICINA',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE ORDENS DE SERVIÇO (REPAIRS)
CREATE TABLE public.repairs (
  id TEXT PRIMARY KEY,
  "clientId" TEXT REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  "vehicleInfo" TEXT,
  description TEXT NOT NULL,
  items JSONB,
  "totalAmount" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  "businessUnit" TEXT DEFAULT 'OFICINA',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE ESTOQUE/SERVIÇOS (INVENTORIES)
CREATE TABLE public.inventories (
  id TEXT PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  quantidade INT DEFAULT 0,
  "valorVenda" NUMERIC NOT NULL,
  "businessUnit" TEXT DEFAULT 'OFICINA',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE TRANSAÇÕES FINANCEIRAS
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  "clientId" TEXT REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  "repairId" TEXT REFERENCES public.repairs(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING',
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "paidDate" TIMESTAMP WITH TIME ZONE,
  "businessUnit" TEXT DEFAULT 'OFICINA',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE LOGS
CREATE TABLE public.logs (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT,
  resource TEXT,
  details TEXT,
  "businessUnit" TEXT DEFAULT 'OFICINA',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas genéricas liberando acesso total para usuários logados (autenticados)
-- Em um sistema mais rígido, poderíamos filtrar por businessUnit, mas como todos são da oficina:

CREATE POLICY "Enable all for authenticated users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.repairs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.inventories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
