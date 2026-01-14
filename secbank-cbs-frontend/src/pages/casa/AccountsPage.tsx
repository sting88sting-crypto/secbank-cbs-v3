import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountApi } from '@/lib/api';
import { Account } from '@/types';
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
import { Loader2, CreditCard, Plus } from 'lucide-react';

export function AccountsPage() {
  const { getBilingual } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountApi.getAll({ page: 0, size: 20 });
      if (response.success && response.data) {
        setAccounts(response.data.content || []);
      }
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Accounts', '账户')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage customer accounts', '管理客户账户')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('Open Account', '开户')}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{getBilingual('Total Accounts', '账户总数')}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accounts.length}</div>
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
                <TableHead>{getBilingual('Account No.', '账号')}</TableHead>
                <TableHead>{getBilingual('Customer', '客户')}</TableHead>
                <TableHead>{getBilingual('Type', '类型')}</TableHead>
                <TableHead>{getBilingual('Balance', '余额')}</TableHead>
                <TableHead>{getBilingual('Status', '状态')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {getBilingual('No accounts found', '未找到账户')}
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.accountNumber}</TableCell>
                    <TableCell>{account.customerName}</TableCell>
                    <TableCell>{account.accountTypeName}</TableCell>
                    <TableCell>{account.currency} {account.currentBalance?.toLocaleString()}</TableCell>
                    <TableCell>{account.status}</TableCell>
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
