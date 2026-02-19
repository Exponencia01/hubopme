import { supabase } from './supabase';
import type { PriceTable, PriceTableItem, CreatePriceTablePayload, CreatePriceTableItemPayload } from './types';

export const priceTablesApi = {
  async getAll(): Promise<PriceTable[]> {
    const { data, error } = await supabase
      .from('price_tables')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as PriceTable[];
  },

  async getActive(): Promise<PriceTable[]> {
    const { data, error } = await supabase
      .from('price_tables')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data as PriceTable[];
  },

  async getById(id: string): Promise<PriceTable> {
    const { data, error } = await supabase
      .from('price_tables')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as PriceTable;
  },

  async getDefault(): Promise<PriceTable | null> {
    const { data, error } = await supabase
      .from('price_tables')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as PriceTable | null;
  },

  async create(payload: CreatePriceTablePayload): Promise<PriceTable> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('price_tables')
      .insert({
        ...payload,
        created_by: user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as PriceTable;
  },

  async update(id: string, payload: Partial<CreatePriceTablePayload>): Promise<PriceTable> {
    const { data, error } = await supabase
      .from('price_tables')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PriceTable;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_tables')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async setDefault(id: string): Promise<void> {
    await supabase.from('price_tables').update({ is_default: false }).neq('id', id);
    
    const { error } = await supabase
      .from('price_tables')
      .update({ is_default: true })
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const priceTableItemsApi = {
  async getByTableId(priceTableId: string): Promise<PriceTableItem[]> {
    const { data, error } = await supabase
      .from('price_table_items')
      .select('*')
      .eq('price_table_id', priceTableId)
      .order('product_name');
    
    if (error) throw error;
    return data as PriceTableItem[];
  },

  async getAvailable(priceTableId: string): Promise<PriceTableItem[]> {
    const { data, error } = await supabase
      .from('price_table_items')
      .select('*')
      .eq('price_table_id', priceTableId)
      .eq('is_available', true)
      .order('product_name');
    
    if (error) throw error;
    return data as PriceTableItem[];
  },

  async getById(id: string): Promise<PriceTableItem> {
    const { data, error } = await supabase
      .from('price_table_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as PriceTableItem;
  },

  async create(payload: CreatePriceTableItemPayload): Promise<PriceTableItem> {
    const { data, error } = await supabase
      .from('price_table_items')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return data as PriceTableItem;
  },

  async update(id: string, payload: Partial<CreatePriceTableItemPayload>): Promise<PriceTableItem> {
    const { data, error } = await supabase
      .from('price_table_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PriceTableItem;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_table_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async searchByCode(priceTableId: string, code: string): Promise<PriceTableItem[]> {
    const { data, error } = await supabase
      .from('price_table_items')
      .select('*')
      .eq('price_table_id', priceTableId)
      .ilike('product_code', `%${code}%`);
    
    if (error) throw error;
    return data as PriceTableItem[];
  },

  async searchByName(priceTableId: string, name: string): Promise<PriceTableItem[]> {
    const { data, error } = await supabase
      .from('price_table_items')
      .select('*')
      .eq('price_table_id', priceTableId)
      .ilike('product_name', `%${name}%`);
    
    if (error) throw error;
    return data as PriceTableItem[];
  },
};
