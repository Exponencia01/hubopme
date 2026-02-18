import { supabase } from './supabase';
import type { UserInvitation, CreateInvitationPayload } from './types';

export const invitationsApi = {
  async createInvitation(payload: CreateInvitationPayload): Promise<UserInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    console.log('🔍 Buscando perfil para user.id:', user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    console.log('📊 Resultado da busca:', { profile, profileError });

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      throw new Error(`Erro ao buscar perfil: ${profileError.message}. Código: ${profileError.code}`);
    }

    if (!profile) {
      throw new Error('Seu perfil de usuário não foi encontrado. Por favor, complete seu cadastro primeiro.');
    }
    
    if (!['admin', 'supplier_admin'].includes(profile.role)) {
      throw new Error('Apenas administradores podem convidar usuários');
    }

    // Verificar se já existe um convite pendente para este email
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id, status')
      .eq('organization_id', profile.organization_id)
      .eq('email', payload.email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      throw new Error('Já existe um convite pendente para este email');
    }

    // Verificar se o email já pertence a um usuário da organização
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .ilike('id', `%${payload.email}%`)
      .single();

    if (existingUser) {
      throw new Error('Este email já pertence a um usuário da sua organização');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        organization_id: profile.organization_id,
        email: payload.email.toLowerCase(),
        full_name: payload.full_name,
        role: payload.role,
        phone: payload.phone,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserInvitation;
  },

  async getOrganizationInvitations(): Promise<UserInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Perfil não encontrado');

    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserInvitation[];
  },

  async getPendingInvitations(): Promise<UserInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Perfil não encontrado');

    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserInvitation[];
  },

  async getInvitationByToken(token: string): Promise<UserInvitation | null> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as UserInvitation;
  },

  async cancelInvitation(invitationId: string, reason?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('user_invitations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: reason,
      })
      .eq('id', invitationId);

    if (error) throw error;
  },

  async resendInvitation(invitationId: string): Promise<UserInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError) throw fetchError;
    if (!invitation) throw new Error('Convite não encontrado');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('user_invitations')
      .update({
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) throw error;
    return data as UserInvitation;
  },

  async acceptInvitation(token: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase.rpc('accept_invitation', {
      p_invitation_token: token,
      p_user_id: user.id,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as { success: boolean; error?: string };
  },

  async expireOldInvitations(): Promise<void> {
    const { error } = await supabase.rpc('expire_old_invitations');
    if (error) throw error;
  },

  async getMyInvitations(): Promise<UserInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserInvitation[];
  },
};

export const usersApi = {
  async getOrganizationUsers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Perfil não encontrado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) throw error;
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  },
};
