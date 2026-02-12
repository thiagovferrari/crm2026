
-- SCHEMA: Lon CRM Premium
-- Este script prepara o banco de dados no Supabase para ser compatível com o sistema Lon CRM.

-- 1. Tabela de Contatos
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Prospect',
  commercial_area TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Interações (Histórico)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('Comment', 'Strategy', 'Meeting', 'Call')),
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE
);

-- 3. Tabela de Registros Financeiros
CREATE TABLE financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  value_charged NUMERIC(10, 2) NOT NULL,
  value_paid NUMERIC(10, 2) DEFAULT 0,
  payment_date DATE,
  status TEXT CHECK (status IN ('Pending', 'Paid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Alertas de Cobrança
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  charge_date DATE NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('Once', 'Weekly', 'Monthly', 'Yearly')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Notas Internas
CREATE TABLE internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (O usuário só vê seus próprios dados)
CREATE POLICY "Users can only see their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- Para as demais tabelas, usamos o user_id do contato relacionado
CREATE POLICY "Users can only see related interactions" ON interactions 
FOR ALL USING (EXISTS (SELECT 1 FROM contacts WHERE id = interactions.contact_id AND user_id = auth.uid()));

CREATE POLICY "Users can only see related financials" ON financials 
FOR ALL USING (EXISTS (SELECT 1 FROM contacts WHERE id = financials.contact_id AND user_id = auth.uid()));

CREATE POLICY "Users can only see related alerts" ON alerts 
FOR ALL USING (EXISTS (SELECT 1 FROM contacts WHERE id = alerts.contact_id AND user_id = auth.uid()));

CREATE POLICY "Users can only see related notes" ON internal_notes 
FOR ALL USING (EXISTS (SELECT 1 FROM contacts WHERE id = internal_notes.contact_id AND user_id = auth.uid()));
