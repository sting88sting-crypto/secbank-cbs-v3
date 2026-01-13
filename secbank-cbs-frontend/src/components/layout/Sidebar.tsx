import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Building2,
  FileText,
  Wallet,
  Calculator,
  Receipt,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  titleKey: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    titleKey: 'nav.administration',
    icon: Shield,
    children: [
      { titleKey: 'nav.users', icon: Users, href: '/admin/users' },
      { titleKey: 'nav.roles', icon: Shield, href: '/admin/roles' },
      { titleKey: 'nav.permissions', icon: Key, href: '/admin/permissions' },
      { titleKey: 'nav.branches', icon: Building2, href: '/admin/branches' },
      { titleKey: 'nav.auditLogs', icon: FileText, href: '/admin/audit-logs' },
    ],
  },
  {
    titleKey: 'nav.casa',
    icon: Wallet,
    children: [
      { titleKey: 'Customers / 客户', icon: Users, href: '/casa/customers' },
      { titleKey: 'Accounts / 账户', icon: CreditCard, href: '/casa/accounts' },
    ],
  },
  {
    titleKey: 'nav.accounting',
    icon: Calculator,
    children: [
      { titleKey: 'Chart of Accounts / 会计科目', icon: FileText, href: '/accounting/coa' },
      { titleKey: 'Journal Entries / 日记账', icon: Receipt, href: '/accounting/journal' },
    ],
  },
  {
    titleKey: 'nav.tellering',
    icon: Receipt,
    href: '/tellering',
  },
  {
    titleKey: 'nav.nrps',
    icon: CreditCard,
    href: '/nrps',
  },
];

export function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<string[]>(['nav.administration']);

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.titleKey);
    const active = isActive(item.href);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.titleKey}>
          <button
            onClick={() => toggleExpanded(item.titleKey)}
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:bg-gray-100 text-gray-700'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{t(item.titleKey)}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children!.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.titleKey}
        to={item.href!}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          active
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.titleKey.includes('/') ? item.titleKey : t(item.titleKey)}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  );
}
