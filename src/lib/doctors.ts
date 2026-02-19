import { supabase } from './supabase';
import type { Doctor, CreateDoctorPayload } from './types';

export const doctorsApi = {
  async getAll(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    return data as Doctor[];
  },

  async getById(id: string): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Doctor;
  },

  async getActive(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .eq('relationship_type', 'active')
      .order('full_name');
    
    if (error) throw error;
    return data as Doctor[];
  },

  async create(payload: CreateDoctorPayload): Promise<Doctor> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('doctors')
      .insert({
        ...payload,
        created_by: user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Doctor;
  },

  async update(id: string, payload: Partial<CreateDoctorPayload>): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Doctor;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateLastContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('doctors')
      .update({ last_contact_date: new Date().toISOString().split('T')[0] })
      .eq('id', id);
    
    if (error) throw error;
  },

  async searchByCRM(crm: string, crm_uf: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('crm', crm)
      .eq('crm_uf', crm_uf);
    
    if (error) throw error;
    return data as Doctor[];
  },
};
