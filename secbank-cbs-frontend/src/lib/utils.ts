import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status color mapping / 状态颜色映射
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    LOCKED: 'bg-red-100 text-red-800',
    BLOCKED: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-300 text-gray-600',
    PENDING: 'bg-yellow-100 text-yellow-800',
    DORMANT: 'bg-gray-100 text-gray-800',
    FROZEN: 'bg-blue-100 text-blue-800',
    DECEASED: 'bg-gray-400 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Date formatting / 日期格式化
export function formatDate(dateString: string | null | undefined, language: string = 'en'): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', options);
  } catch {
    return '-';
  }
}

// Format date only (no time) / 仅格式化日期
export function formatDateOnly(dateString: string | null | undefined, language: string = 'en'): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', options);
  } catch {
    return '-';
  }
}

// Format currency / 格式化货币
export function formatCurrency(amount: number | null | undefined, currency: string = 'PHP'): string {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format percentage / 格式化百分比
export function formatPercent(rate: number | null | undefined, decimals: number = 2): string {
  if (rate === null || rate === undefined) return '-';
  return `${(rate * 100).toFixed(decimals)}%`;
}
