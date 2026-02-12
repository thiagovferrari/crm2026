-- 1. Habilitar RLS em todas as tabelas (garantia)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Users can only see their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can only see related interactions" ON interactions;
DROP POLICY IF EXISTS "Users can only see related financials" ON financials;
DROP POLICY IF EXISTS "Users can only see related alerts" ON alerts;
DROP POLICY IF EXISTS "Users can only see related notes" ON internal_notes;

-- 3. Criar políticas completas para Contacts (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "Contacts Policy" ON contacts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Criar políticas para tabelas relacionadas (Interactions, Financials, etc.)
-- O truque aqui é usar USING e WITH CHECK garantindo que o contact_id pertença ao usuário.

-- Interactions
CREATE POLICY "Interactions Policy" ON interactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = interactions.contact_id 
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = interactions.contact_id 
    AND user_id = auth.uid()
  )
);

-- Financials
CREATE POLICY "Financials Policy" ON financials
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = financials.contact_id 
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = financials.contact_id 
    AND user_id = auth.uid()
  )
);

-- Alerts
CREATE POLICY "Alerts Policy" ON alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = alerts.contact_id 
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = alerts.contact_id 
    AND user_id = auth.uid()
  )
);

-- Internal Notes
CREATE POLICY "Internal Notes Policy" ON internal_notes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = internal_notes.contact_id 
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE id = internal_notes.contact_id 
    AND user_id = auth.uid()
  )
);

-- 5. Garantir permissões básicas para authenticated
GRANT ALL ON TABLE contacts TO authenticated;
GRANT ALL ON TABLE interactions TO authenticated;
GRANT ALL ON TABLE financials TO authenticated;
GRANT ALL ON TABLE alerts TO authenticated;
GRANT ALL ON TABLE internal_notes TO authenticated;
