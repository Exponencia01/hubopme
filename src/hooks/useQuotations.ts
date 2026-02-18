import { useState, useEffect } from 'react';
import { quotationsApi } from '@/lib/api';
import type { Quote } from '@/lib/types';

export function useQuotations(filters?: { status?: string; urgency?: string }) {
  const [quotations, setQuotations] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quotationsApi.getAll(filters);
      setQuotations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cotações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [filters?.status, filters?.urgency]);

  return {
    quotations,
    isLoading,
    error,
    refetch: fetchQuotations,
  };
}

export function useQuotation(id: string) {
  const [quotation, setQuotation] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quotationsApi.getById(id);
      setQuotation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cotação');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  return {
    quotation,
    isLoading,
    error,
    refetch: fetchQuotation,
  };
}
