import { useState, useEffect } from 'react';
import { suppliersApi } from '@/lib/api';
import type { Supplier } from '@/lib/types';

export function useSuppliers(filters?: { specialties?: string[] }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await suppliersApi.getAll(filters);
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [filters?.specialties?.join(',')]);

  return {
    suppliers,
    isLoading,
    error,
    refetch: fetchSuppliers,
  };
}
