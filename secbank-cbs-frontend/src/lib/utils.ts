import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'LOCKED':
      return 'bg-red-100 text-red-800';
    case 'CLOSED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string, lang: 'en' | 'zh' = 'en'): string {
  const statusMap: Record<string, { en: string; zh: string }> = {
    ACTIVE: { en: 'Active', zh: '活跃' },
    INACTIVE: { en: 'Inactive', zh: '未激活' },
    LOCKED: { en: 'Locked', zh: '已锁定' },
    CLOSED: { en: 'Closed', zh: '已关闭' },
  };
  return statusMap[status.toUpperCase()]?.[lang] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
