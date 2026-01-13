import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { permissionApi } from '@/lib/api';
import { Permission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Key, Shield } from 'lucide-react';
import { toast } from '@/hooks/useToast';

export function PermissionsPage() {
  const { t, language, getBilingual } = useLanguage();
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await permissionApi.getGrouped();
      setPermissionsByModule(response.data);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Failed to load permissions' : '加载权限失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const moduleColors: Record<string, string> = {
    USER: 'bg-blue-100 text-blue-800',
    ROLE: 'bg-purple-100 text-purple-800',
    PERMISSION: 'bg-indigo-100 text-indigo-800',
    BRANCH: 'bg-green-100 text-green-800',
    AUDIT_LOG: 'bg-orange-100 text-orange-800',
    CUSTOMER: 'bg-cyan-100 text-cyan-800',
    ACCOUNT: 'bg-teal-100 text-teal-800',
    TRANSACTION: 'bg-yellow-100 text-yellow-800',
    REPORT: 'bg-pink-100 text-pink-800',
  };

  const getModuleColor = (module: string) => {
    return moduleColors[module] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('permissions.title')}</h1>
        <p className="text-gray-500">
          {language === 'en' 
            ? 'View all system permissions organized by module' 
            : '按模块查看所有系统权限'}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Total Permissions' : '权限总数'}
                </p>
                <p className="text-2xl font-bold">
                  {Object.values(permissionsByModule).flat().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Total Modules' : '模块总数'}
                </p>
                <p className="text-2xl font-bold">
                  {Object.keys(permissionsByModule).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions by Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(permissionsByModule).map(([module, permissions]) => (
          <Card key={module}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={getModuleColor(module)}>
                    {module}
                  </Badge>
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {permissions.length} {language === 'en' ? 'permissions' : '个权限'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {getBilingual(permission.permissionName, permission.permissionNameCn)}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {permission.permissionCode}
                        </p>
                      </div>
                    </div>
                    {permission.description && (
                      <p className="text-xs text-gray-500 mt-2">
                        {getBilingual(permission.description, permission.descriptionCn)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
