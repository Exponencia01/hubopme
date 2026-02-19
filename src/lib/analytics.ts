import { supabase } from './supabase';
import type { AnalyticsDashboard, AnalyticsMetric, CreateDashboardPayload } from './types';

export const analyticsApi = {
  async getDashboards(): Promise<AnalyticsDashboard[]> {
    const { data, error } = await supabase
      .from('analytics_dashboards')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data as AnalyticsDashboard[];
  },

  async getDashboardById(id: string): Promise<AnalyticsDashboard> {
    const { data, error } = await supabase
      .from('analytics_dashboards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as AnalyticsDashboard;
  },

  async createDashboard(payload: CreateDashboardPayload): Promise<AnalyticsDashboard> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('analytics_dashboards')
      .insert({
        ...payload,
        created_by: user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as AnalyticsDashboard;
  },

  async updateDashboard(id: string, payload: Partial<CreateDashboardPayload>): Promise<AnalyticsDashboard> {
    const { data, error } = await supabase
      .from('analytics_dashboards')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as AnalyticsDashboard;
  },

  async deleteDashboard(id: string): Promise<void> {
    const { error } = await supabase
      .from('analytics_dashboards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getMetrics(
    metricName?: string,
    periodType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsMetric[]> {
    let query = supabase
      .from('analytics_metrics')
      .select('*');

    if (metricName) {
      query = query.eq('metric_name', metricName);
    }
    if (periodType) {
      query = query.eq('period_type', periodType);
    }
    if (startDate) {
      query = query.gte('period_start', startDate);
    }
    if (endDate) {
      query = query.lte('period_end', endDate);
    }

    query = query.order('period_start', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data as AnalyticsMetric[];
  },

  async calculateQuotesMetrics(periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id, status, created_at, total_value');

    if (!quotes) return;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const totalQuotes = quotes.length;
    const approvedQuotes = quotes.filter(q => q.status === 'approved').length;
    const totalValue = quotes.reduce((sum, q) => sum + (q.total_value || 0), 0);

    await supabase.from('analytics_metrics').insert([
      {
        metric_name: 'total_quotes',
        metric_type: 'count',
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        metric_value: totalQuotes,
      },
      {
        metric_name: 'approved_quotes',
        metric_type: 'count',
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        metric_value: approvedQuotes,
      },
      {
        metric_name: 'total_quotes_value',
        metric_type: 'sum',
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        metric_value: totalValue,
      },
    ]);
  },
};
