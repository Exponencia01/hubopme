import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'urgent':
      return 'text-red-600 bg-red-50';
    case 'normal':
      return 'text-blue-600 bg-blue-50';
    case 'scheduled':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'sent':
      return 'text-blue-600 bg-blue-50';
    case 'received_quotes':
      return 'text-purple-600 bg-purple-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    sent: 'Enviada',
    received_quotes: 'Cotações Recebidas',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    submitted: 'Enviada',
    accepted: 'Aceita',
    rejected: 'Rejeitada',
    viewed: 'Visualizada',
    responded: 'Respondida',
    declined: 'Recusada',
  };
  return labels[status] || status;
}

export function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    urgent: 'Urgente',
    normal: 'Normal',
    scheduled: 'Agendada',
  };
  return labels[urgency] || urgency;
}
