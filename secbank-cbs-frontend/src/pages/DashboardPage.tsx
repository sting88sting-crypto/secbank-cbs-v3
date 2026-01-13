import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Shield, FileText, Wallet, Calculator } from 'lucide-react';

export function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const stats = [
    {
      title: language === 'en' ? 'Total Users' : '用户总数',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: language === 'en' ? 'Active Branches' : '活跃分行',
      value: '12',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: language === 'en' ? 'Roles' : '角色数',
      value: '8',
      icon: Shield,
      color: 'bg-purple-500',
    },
    {
      title: language === 'en' ? 'Audit Logs Today' : '今日审计日志',
      value: '342',
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  const modules = [
    {
      title: language === 'en' ? 'Administration' : '系统管理',
      description: language === 'en' 
        ? 'Manage users, roles, permissions, and branches'
        : '管理用户、角色、权限和分行',
      icon: Shield,
      status: language === 'en' ? 'Active' : '已激活',
      statusColor: 'text-green-600',
    },
    {
      title: 'CASA',
      description: language === 'en'
        ? 'Customer and account management'
        : '客户和账户管理',
      icon: Wallet,
      status: language === 'en' ? 'Coming Soon' : '即将推出',
      statusColor: 'text-yellow-600',
    },
    {
      title: language === 'en' ? 'Accounting' : '会计',
      description: language === 'en'
        ? 'Chart of accounts and journal entries'
        : '会计科目表和日记账',
      icon: Calculator,
      status: language === 'en' ? 'Coming Soon' : '即将推出',
      statusColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'en' ? 'Welcome back' : '欢迎回来'}, {user?.fullName}!
        </h1>
        <p className="text-gray-500 mt-1">
          {language === 'en' 
            ? "Here's what's happening with your banking system today."
            : '以下是您的银行系统今日概况。'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'System Modules' : '系统模块'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <module.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className={`text-sm font-medium ${module.statusColor}`}>
                    {module.status}
                  </span>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Quick Actions' : '快捷操作'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Common tasks you can perform'
              : '您可以执行的常见任务'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto text-blue-600" />
              <p className="mt-2 text-sm font-medium">
                {language === 'en' ? 'Manage Users' : '管理用户'}
              </p>
            </a>
            <a
              href="/admin/roles"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Shield className="h-8 w-8 mx-auto text-purple-600" />
              <p className="mt-2 text-sm font-medium">
                {language === 'en' ? 'Manage Roles' : '管理角色'}
              </p>
            </a>
            <a
              href="/admin/branches"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Building2 className="h-8 w-8 mx-auto text-green-600" />
              <p className="mt-2 text-sm font-medium">
                {language === 'en' ? 'Manage Branches' : '管理分行'}
              </p>
            </a>
            <a
              href="/admin/audit-logs"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <FileText className="h-8 w-8 mx-auto text-orange-600" />
              <p className="mt-2 text-sm font-medium">
                {language === 'en' ? 'View Audit Logs' : '查看审计日志'}
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
