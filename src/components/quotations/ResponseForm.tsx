import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Check, X, AlertCircle } from 'lucide-react';
import type { Quote, QuoteProductItem } from '@/lib/types';

interface ResponseFormProps {
  quote: Quote;
  onSubmit: (response: QuoteResponseData) => Promise<void>;
  onCancel: () => void;
}

export interface QuoteResponseData {
  items: ResponseItem[];
  prazo_entrega_dias: number;
  condicoes_pagamento: string;
  validade_proposta: string;
  tipo_frete: 'CIF' | 'FOB';
  desconto_percentual: number;
  observacoes_gerais: string;
}

export interface ResponseItem {
  product_ref: string;
  product_name: string;
  original_quantity: number;
  disponivel: boolean;
  quantidade_oferecida: number;
  preco_unitario: number;
  preco_total: number;
  prazo_entrega_especifico?: number;
  substituto_sugerido: string;
  observacoes_item: string;
}

export default function ResponseForm({ quote, onSubmit, onCancel }: ResponseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar itens com base nos produtos da cotação
  const [items, setItems] = useState<ResponseItem[]>(
    quote.products?.map((product: QuoteProductItem) => ({
      product_ref: product.referencia,
      product_name: product.name,
      original_quantity: product.quantity,
      disponivel: true,
      quantidade_oferecida: product.quantity,
      preco_unitario: 0,
      preco_total: 0,
      prazo_entrega_especifico: undefined,
      substituto_sugerido: '',
      observacoes_item: '',
    })) || []
  );

  // Condições comerciais
  const [prazoEntrega, setPrazoEntrega] = useState(7);
  const [condicoesPagamento, setCondicoesPagamento] = useState('30 dias');
  const [validadeProposta, setValidadeProposta] = useState('7 dias');
  const [tipoFrete, setTipoFrete] = useState<'CIF' | 'FOB'>('CIF');
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + item.preco_total, 0);
  const descontoValor = (subtotal * descontoPercentual) / 100;
  const valorTotal = subtotal - descontoValor;

  const handleItemChange = (index: number, field: keyof ResponseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalcular preço total quando quantidade ou preço unitário mudar
    if (field === 'quantidade_oferecida' || field === 'preco_unitario') {
      newItems[index].preco_total =
        newItems[index].quantidade_oferecida * newItems[index].preco_unitario;
    }

    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (items.every((item) => !item.disponivel)) {
      setError('Você deve marcar pelo menos um item como disponível');
      return;
    }

    const itemsDisponiveis = items.filter((item) => item.disponivel);
    if (itemsDisponiveis.some((item) => item.preco_unitario <= 0)) {
      setError('Todos os itens disponíveis devem ter preço unitário maior que zero');
      return;
    }

    if (!condicoesPagamento.trim()) {
      setError('Informe as condições de pagamento');
      return;
    }

    setLoading(true);

    try {
      const responseData: QuoteResponseData = {
        items,
        prazo_entrega_dias: prazoEntrega,
        condicoes_pagamento: condicoesPagamento,
        validade_proposta: validadeProposta,
        tipo_frete: tipoFrete,
        desconto_percentual: descontoPercentual,
        observacoes_gerais: observacoes,
      };

      await onSubmit(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar resposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Itens da Resposta */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Cotação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.disponivel}
                        onChange={(e) =>
                          handleItemChange(index, 'disponivel', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="font-medium">
                        {item.disponivel ? (
                          <Check className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 inline" />
                        )}
                      </span>
                    </label>
                    <div>
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Ref: {item.product_ref}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quantidade solicitada: {item.original_quantity}
                  </p>
                </div>
              </div>

              {item.disponivel && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${index}`}>Quantidade Oferecida</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      min="1"
                      value={item.quantidade_oferecida}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'quantidade_oferecida',
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>Preço Unitário (R$)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.preco_unitario}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'preco_unitario',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`delivery-${index}`}>
                      Prazo Específico (dias - opcional)
                    </Label>
                    <Input
                      id={`delivery-${index}`}
                      type="number"
                      min="1"
                      value={item.prazo_entrega_especifico || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'prazo_entrega_especifico',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="Deixe vazio para usar prazo geral"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Total</Label>
                    <div className="text-2xl font-bold text-primary">
                      R$ {item.preco_total.toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`substitute-${index}`}>
                      Produto Substituto (opcional)
                    </Label>
                    <Input
                      id={`substitute-${index}`}
                      value={item.substituto_sugerido}
                      onChange={(e) =>
                        handleItemChange(index, 'substituto_sugerido', e.target.value)
                      }
                      placeholder="Sugerir produto alternativo"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`notes-${index}`}>Observações do Item</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={item.observacoes_item}
                      onChange={(e) =>
                        handleItemChange(index, 'observacoes_item', e.target.value)
                      }
                      placeholder="Informações adicionais sobre este item"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Condições Comerciais */}
      <Card>
        <CardHeader>
          <CardTitle>Condições Comerciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-days">Prazo de Entrega (dias)</Label>
              <Input
                id="delivery-days"
                type="number"
                min="1"
                value={prazoEntrega}
                onChange={(e) => setPrazoEntrega(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-terms">Condições de Pagamento</Label>
              <Input
                id="payment-terms"
                value={condicoesPagamento}
                onChange={(e) => setCondicoesPagamento(e.target.value)}
                placeholder="Ex: 30 dias, À vista, 30/60/90"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Validade da Proposta</Label>
              <Input
                id="validity"
                value={validadeProposta}
                onChange={(e) => setValidadeProposta(e.target.value)}
                placeholder="Ex: 7 dias, 15 dias"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freight">Tipo de Frete</Label>
              <select
                id="freight"
                value={tipoFrete}
                onChange={(e) => setTipoFrete(e.target.value as 'CIF' | 'FOB')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CIF">CIF (Frete por nossa conta)</option>
                <option value="FOB">FOB (Frete por conta do cliente)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={descontoPercentual}
                onChange={(e) => setDescontoPercentual(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="general-notes">Observações Gerais</Label>
            <Textarea
              id="general-notes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre a proposta"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            {descontoPercentual > 0 && (
              <div className="flex justify-between text-lg text-green-600">
                <span>Desconto ({descontoPercentual}%):</span>
                <span className="font-medium">- R$ {descontoValor.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-primary border-t pt-3">
              <span>Valor Total:</span>
              <span>R$ {valorTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Resposta'}
        </Button>
      </div>
    </form>
  );
}
