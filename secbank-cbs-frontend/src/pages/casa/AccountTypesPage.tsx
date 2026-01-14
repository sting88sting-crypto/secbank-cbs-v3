import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountTypeApi } from '@/lib/api';
import { AccountType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Wallet, Plus } from 'lucide-react';

export function AccountTypesPage() {
  const { getBilingual } = useLanguage();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountTypeApi.getAll({ page: 0, size: 20 });
      if (response.success && response.data) {
        setAccountTypes(response.data.content || []);
      }
    } catch (err: any) {
      console.error('Failed to load account types:', err);
      setError(err.message || 'Failed to load account types');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Account Types', '账户类型')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage account types and configurations', '管理账户类型及配置')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('New Account Type', '新建账户类型')}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{getBilingual('Total Account Types', '账户类型总数')}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accountTypes.length}</div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{getBilingual('Code', '代码')}</TableHead>
                <TableHead>{getBilingual('Name', '名称')}</TableHead>
                <TableHead>{getBilingual('Category', '类别')}</TableHead>
                <TableHead>{getBilingual('Status', '状态')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {getBilingual('No account types found', '未找到账户类型')}
                  </TableCell>
                </TableRow>
              ) : (
                accountTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono">{type.typeCode}</TableCell>
                    <TableCell>{getBilingual(type.typeName, type.typeNameCn)}</TableCell>
                    <TableCell>{type.category}</TableCell>
                    <TableCell>{type.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
