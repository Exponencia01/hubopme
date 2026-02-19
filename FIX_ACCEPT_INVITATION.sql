-- =====================================================
-- FIX: accept_invitation function to use correct table
-- =====================================================

-- O problema: a função accept_invitation está tentando inserir em 'profiles'
-- mas a tabela real pode ser 'user_profiles'

-- Verificar qual tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_profiles');

-- Recriar função accept_invitation com tabela correta
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
  
  -- Verificar se perfil já existe
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    -- Perfil já existe, apenas atualizar
    UPDATE profiles
    SET organization_id = v_invitation.organization_id,
        full_name = v_invitation.full_name,
        role = v_invitation.role,
        phone = v_invitation.phone,
        is_active = true,
        updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    -- Criar novo perfil
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
  END IF;
  
  -- Atualizar convite como aceito
  UPDATE user_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      accepted_by = p_user_id,
      updated_at = NOW()
  WHERE id = v_invitation.id;
  
  -- Criar notificação para quem convidou (se tabela notifications existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
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
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite aceito com sucesso!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função (substitua os valores)
-- SELECT accept_invitation('SEU_TOKEN_AQUI'::uuid, 'SEU_USER_ID_AQUI'::uuid);
