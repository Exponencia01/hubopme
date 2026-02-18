-- =====================================================
-- USER INVITATIONS (Convites de Usuários)
-- =====================================================

CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados do Convite
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'buyer', 'specialist', 'reviewer', 'supplier_admin', 'supplier_user')),
  phone VARCHAR(20),
  
  -- Controle do Convite
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Token único para aceitar o convite
  invitation_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  
  -- Dados de Aceitação
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  
  -- Dados de Cancelamento
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, email, status) 
    DEFERRABLE INITIALLY DEFERRED,
  
  -- Apenas um convite pendente por email por organização
  CONSTRAINT unique_pending_invitation 
    EXCLUDE USING btree (organization_id WITH =, email WITH =) 
    WHERE (status = 'pending')
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_user_invitations_organization_id ON user_invitations(organization_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX idx_user_invitations_expires_at ON user_invitations(expires_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Função para expirar convites automaticamente
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para validar se usuário pode convidar
CREATE OR REPLACE FUNCTION can_user_invite()
RETURNS TRIGGER AS $$
DECLARE
  user_role VARCHAR(50);
BEGIN
  -- Buscar role do usuário que está convidando
  SELECT role INTO user_role
  FROM profiles
  WHERE id = NEW.invited_by;
  
  -- Apenas admins podem convidar
  IF user_role NOT IN ('admin', 'supplier_admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem convidar novos usuários';
  END IF;
  
  -- Validar se o convite é para a mesma organização do usuário
  IF NEW.organization_id NOT IN (
    SELECT organization_id FROM profiles WHERE id = NEW.invited_by
  ) THEN
    RAISE EXCEPTION 'Você só pode convidar usuários para sua própria organização';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário ao aceitar convite
CREATE OR REPLACE FUNCTION accept_invitation(
  p_invitation_token UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_invitation user_invitations%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Buscar convite
  SELECT * INTO v_invitation
  FROM user_invitations
  WHERE invitation_token = p_invitation_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite inválido, expirado ou já utilizado'
    );
  END IF;
  
  -- Verificar se email do usuário corresponde ao convite
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = p_user_id 
    AND email = v_invitation.email
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email do usuário não corresponde ao convite'
    );
  END IF;
  
  -- Criar perfil do usuário
  INSERT INTO profiles (
    id,
    organization_id,
    full_name,
    role,
    phone,
    is_active
  ) VALUES (
    p_user_id,
    v_invitation.organization_id,
    v_invitation.full_name,
    v_invitation.role,
    v_invitation.phone,
    true
  );
  
  -- Atualizar convite como aceito
  UPDATE user_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      accepted_by = p_user_id,
      updated_at = NOW()
  WHERE id = v_invitation.id;
  
  -- Criar notificação para quem convidou
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_entity_type,
    related_entity_id
  ) VALUES (
    v_invitation.invited_by,
    'invitation_accepted',
    'Convite Aceito',
    v_invitation.full_name || ' aceitou o convite e agora faz parte da equipe!',
    'user_invitation',
    v_invitation.id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_profile', row_to_json(
      (SELECT * FROM profiles WHERE id = p_user_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para validar permissão de convidar
CREATE TRIGGER validate_invitation_permission
  BEFORE INSERT ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION can_user_invite();

-- Trigger para updated_at
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Admins podem ver convites de sua organização
CREATE POLICY "Admins can view organization invitations"
  ON user_invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- Admins podem criar convites para sua organização
CREATE POLICY "Admins can create invitations"
  ON user_invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- Admins podem atualizar convites de sua organização
CREATE POLICY "Admins can update organization invitations"
  ON user_invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- Usuários podem ver convites enviados para seu email
CREATE POLICY "Users can view their own invitations"
  ON user_invitations FOR SELECT
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- SCHEDULED JOB (Comentado - requer pg_cron extension)
-- =====================================================

-- Para expirar convites automaticamente, você pode usar pg_cron:
-- SELECT cron.schedule('expire-invitations', '0 * * * *', 'SELECT expire_old_invitations()');

-- Ou executar manualmente via API periodicamente
