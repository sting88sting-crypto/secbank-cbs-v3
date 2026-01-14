import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi } from '@/lib/api';
import { Customer } from '@/types';
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
import { Loader2, Users, Plus } from 'lucide-react';

export function CustomersPage() {
  const { getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll({ page: 0, size: 20 });
      if (response.success && response.data) {
        setCustomers(response.data.content || []);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Customer Management', '客户管理')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage individual and corporate customers', '管理个人和企业客户')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('New Customer', '新建客户')}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{getBilingual('Total Customers', '客户总数')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.length}</div>
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
                <TableHead>{getBilingual('Customer No.', '客户号')}</TableHead>
                <TableHead>{getBilingual('Name', '姓名')}</TableHead>
                <TableHead>{getBilingual('Email', '邮箱')}</TableHead>
                <TableHead>{getBilingual('Status', '状态')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {getBilingual('No customers found', '未找到客户')}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                    <TableCell>{customer.displayName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.status}</TableCell>
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
