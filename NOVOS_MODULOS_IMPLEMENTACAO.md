# Implementação dos 3 Novos Módulos

## ✅ Concluído

1. **Migration do Banco de Dados** - `010_medicos_precos_analytics.sql`
   - Tabelas: `doctors`, `price_tables`, `price_table_items`, `analytics_dashboards`, `analytics_metrics`
   - RLS Policies configuradas
   - Índices otimizados

2. **TypeScript Types** - Adicionados em `src/lib/types.ts`
   - `Doctor`, `CreateDoctorPayload`
   - `PriceTable`, `PriceTableItem`, `CreatePriceTablePayload`, `CreatePriceTableItemPayload`
   - `AnalyticsDashboard`, `AnalyticsMetric`, `CreateDashboardPayload`

## 📋 Próximos Passos

### 1. Aplicar Migration no Supabase

Execute no **Supabase SQL Editor**:
```sql
-- Copie todo o conteúdo de: supabase/migrations/010_medicos_precos_analytics.sql
```

### 2. Criar APIs (src/lib/)

Criar 3 arquivos de API:

**`src/lib/doctors.ts`**
```typescript
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
};
```

**`src/lib/priceTables.ts`** - Similar structure
**`src/lib/analytics.ts`** - Similar structure

### 3. Criar Páginas (src/pages/)

**`src/pages/Doctors.tsx`** - Lista e gerenciamento de médicos
**`src/pages/PriceTables.tsx`** - Lista e gerenciamento de tabelas de preço
**`src/pages/Analytics.tsx`** - Dashboards e métricas

### 4. Adicionar Navegação

Editar `src/components/layout/Sidebar.tsx`:

```typescript
const navigation = [
  // ... existentes
  { name: 'Médicos', href: '/doctors', icon: UserCircle },
  { name: 'Tabela de Preços', href: '/price-tables', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];
```

### 5. Adicionar Rotas

Editar `src/App.tsx`:

```typescript
import Doctors from './pages/Doctors';
import PriceTables from './pages/PriceTables';
import Analytics from './pages/Analytics';

// Adicionar rotas:
<Route path="/doctors" element={<Doctors />} />
<Route path="/price-tables" element={<PriceTables />} />
<Route path="/analytics" element={<Analytics />} />
```

## 🎯 Estrutura das Páginas

Cada página deve ter:
- **Lista** com tabela de dados
- **Botão "Adicionar"** que abre modal
- **Modal de criação/edição**
- **Ações**: Editar, Excluir, Ver detalhes
- **Filtros e busca**
- **Paginação** (se necessário)

## 📊 Features Específicas

### Módulo Médicos
- Cadastro completo com CRM, especialidades
- Relacionamento com hospitais
- Histórico de contatos
- Produtos preferidos

### Módulo Tabela de Preços
- Múltiplas tabelas por organização
- Itens com preços, descontos, estoque
- Vigência de tabelas
- Importação/Exportação (futuro)

### Módulo Analytics
- Embed de dashboards externos
- Métricas calculadas
- Filtros por período
- Permissões por role

## 🚀 Ordem de Implementação Sugerida

1. ✅ Migration + Types (FEITO)
2. Aplicar migration no Supabase
3. Criar API do módulo Médicos
4. Criar página Médicos (mais simples)
5. Testar módulo Médicos
6. Criar API Tabela de Preços
7. Criar página Tabela de Preços
8. Testar módulo Preços
9. Criar API Analytics
10. Criar página Analytics
11. Testar módulo Analytics
12. Commit final

## 💡 Dicas

- Use componentes existentes (Card, Button, Input, etc)
- Siga padrão das páginas existentes (Settings, Users)
- Adicione loading states
- Implemente error handling
- Use Zustand para state management se necessário
