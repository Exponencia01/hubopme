-- =====================================================
-- FIX: Permitir acesso público a convites por token
-- =====================================================

-- Permitir que qualquer pessoa (autenticada ou não) possa visualizar
-- um convite específico usando o token único
-- Isso é necessário para a página de aceitação de convite funcionar

CREATE POLICY "Anyone can view invitation by token"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    invitation_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
  );
