import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountApi, customerApi, accountTypeApi, branchApi } from '@/lib/api';
import { Account, Customer, AccountType, Branch, AccountStatus, OpenAccountRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import { Plus, Search, Loader2, Wallet, Eye, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';

export function AccountsPage() {
  const { getBilingual } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | ''>('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer search
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('');
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<OpenAccountRequest>>({
    currency: 'PHP',
    initialDeposit: 0,
  });
  const [freezeReason, setFreezeReason] = useState('');

  useEffect(() => {
    loadAccountTypes();
    loadBranches();
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [currentPage, filterStatus]);

  const loadAccountTypes = async () => {
    try {
      const response = await accountTypeApi.getAll({ page: 0, size: 100 });
      if (response.success && response.data) {
        setAccountTypes(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load account types:', err);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchApi.getAll(0, 100);
      if (response.success && response.data) {
        setBranches(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountApi.getAll({
        keyword: searchKeyword || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setAccounts(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setAccounts([]);
      }
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err?.message || 'Failed to load accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    if (!customerSearchKeyword.trim()) return;
    
    setSearchingCustomers(true);
    try {
      const response = await customerApi.getAll({
        keyword: customerSearchKeyword,
        page: 0,
        size: 10,
      });
      if (response.success && response.data) {
        setCustomers(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAccounts();
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.customerId) {
      toast({ title: getBilingual('Please select a customer', '请选择客户'), variant: 'destructive' });
      return;
    }
    if (!formData.accountTypeId) {
      toast({ title: getBilingual('Please select an account type', '请选择账户类型'), variant: 'destructive' });
      return;
    }
    if (!formData.branchId) {
      toast({ title: getBilingual('Please select a branch', '请选择分行'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await accountApi.open(formData as OpenAccountRequest);
      if (response.success) {
        toast({ title: getBilingual('Account opened successfully', '开户成功') });
        setIsCreateDialogOpen(false);
        resetForm();
        loadAccounts();
      } else {
        toast({ title: response.message || getBilingual('Failed to open account', '开户失败'), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Failed to open account:', err);
      toast({ 
        title: getBilingual('Failed to open account', '开户失败'),
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreeze = async () => {
    if (!selectedAccount) return;
    if (!freezeReason.trim()) {
      toast({ title: getBilingual('Please provide a reason', '请提供冻结原因'), variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await accountApi.freeze(selectedAccount.id, freezeReason);
      if (response.success) {
        toast({ title: getBilingual('Account frozen successfully', '账户已冻结') });
        setIsFreezeDialogOpen(false);
        setFreezeReason('');
        loadAccounts();
      } else {
        toast({ title: response.message || getBilingual('Failed to freeze account', '冻结账户失败'), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Failed to freeze account:', err);
      toast({ title: getBilingual('Failed to freeze account', '冻结账户失败'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnfreeze = async (accountId: number) => {
    try {
      const response = await accountApi.unfreeze(accountId);
      if (response.success) {
        toast({ title: getBilingual('Account unfrozen successfully', '账户已解冻') });
        loadAccounts();
      } else {
        toast({ title: response.message || getBilingual('Failed to unfreeze account', '解冻账户失败'), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Failed to unfreeze account:', err);
      toast({ title: getBilingual('Failed to unfreeze account', '解冻账户失败'), variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      currency: 'PHP',
      initialDeposit: 0,
    });
    setCustomers([]);
    setCustomerSearchKeyword('');
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (account: Account) => {
    setSelectedAccount(account);
    setIsViewDialogOpen(true);
  };

  const openFreezeDialog = (account: Account) => {
    setSelectedAccount(account);
    setFreezeReason('');
    setIsFreezeDialogOpen(true);
  };

  const getStatusBadge = (status: AccountStatus) => {
    const colors: Record<AccountStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      FROZEN: 'bg-blue-100 text-blue-800',
      CLOSED: 'bg-red-100 text-red-800',
      DORMANT: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-orange-100 text-orange-800',
      BLOCKED: 'bg-red-200 text-red-900',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number | undefined | null, currency: string = 'PHP') => {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Account Management', '账户管理')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage customer accounts', '管理客户账户')}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('Open Account', '开户')}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{getBilingual('Total Accounts', '总账户数')}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalElements}</div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={getBilingual('Search by account number or customer...', '按账号或客户搜索...')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v as AccountStatus | ''); setCurrentPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={getBilingual('Status', '状态')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getBilingual('All Status', '全部状态')}</SelectItem>
                <SelectItem value="ACTIVE">{getBilingual('Active', '正常')}</SelectItem>
                <SelectItem value="FROZEN">{getBilingual('Frozen', '冻结')}</SelectItem>
                <SelectItem value="CLOSED">{getBilingual('Closed', '已关闭')}</SelectItem>
                <SelectItem value="DORMANT">{getBilingual('Dormant', '休眠')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {getBilingual('Search', '搜索')}
            </Button>
          </div>
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
                <TableHead>{getBilingual('Branch', '分行')}</TableHead>
                <TableHead>{getBilingual('Status', '状态')}</TableHead>
                <TableHead>{getBilingual('Actions', '操作')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {getBilingual('No accounts found', '未找到账户')}
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.accountNumber}</TableCell>
                    <TableCell>{account.customerName || '-'}</TableCell>
                    <TableCell>{account.accountTypeName || '-'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(account.currentBalance, account.currency)}</TableCell>
                    <TableCell>{account.branchName || '-'}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewDialog(account)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {account.status === 'ACTIVE' && (
                          <Button variant="ghost" size="sm" onClick={() => openFreezeDialog(account)}>
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {account.status === 'FROZEN' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUnfreeze(account.id)}>
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                {getBilingual(`Showing ${accounts.length} of ${totalElements} results`, `显示 ${accounts.length} / ${totalElements} 条结果`)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Open New Account', '开立新账户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Select customer and account type to open a new account', '选择客户和账户类型以开立新账户')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Customer Search */}
            <div className="space-y-2">
              <Label>{getBilingual('Search Customer', '搜索客户')} *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={getBilingual('Enter customer name or ID...', '输入客户姓名或ID...')}
                  value={customerSearchKeyword}
                  onChange={(e) => setCustomerSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
                />
                <Button onClick={searchCustomers} disabled={searchingCustomers}>
                  {searchingCustomers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {customers.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-2 cursor-pointer hover:bg-muted ${formData.customerId === customer.id ? 'bg-muted' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, customerId: customer.id }))}
                    >
                      <div className="font-medium">{customer.displayName}</div>
                      <div className="text-sm text-muted-foreground">{customer.customerNumber}</div>
                    </div>
                  ))}
                </div>
              )}
              {formData.customerId && (
                <div className="text-sm text-green-600">
                  {getBilingual('Customer selected', '已选择客户')}: {customers.find(c => c.id === formData.customerId)?.displayName}
                </div>
              )}
            </div>

            {/* Account Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Account Type', '账户类型')} *</Label>
              <Select 
                value={formData.accountTypeId?.toString() || ''} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, accountTypeId: parseInt(v) }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={getBilingual('Select account type', '选择账户类型')} />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.typeName} ({type.typeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Branch', '分行')} *</Label>
              <Select 
                value={formData.branchId?.toString() || ''} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, branchId: parseInt(v) }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={getBilingual('Select branch', '选择分行')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Currency', '币种')}</Label>
              <Select 
                value={formData.currency || 'PHP'} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Initial Deposit */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Initial Deposit', '初始存款')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.initialDeposit || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, initialDeposit: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBilingual('Open Account', '开户')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Dialog */}
      <Dialog open={isFreezeDialogOpen} onOpenChange={setIsFreezeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getBilingual('Freeze Account', '冻结账户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Please provide a reason for freezing this account', '请提供冻结此账户的原因')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>{getBilingual('Reason', '原因')} *</Label>
            <Input
              className="mt-2"
              placeholder={getBilingual('Enter freeze reason...', '输入冻结原因...')}
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFreezeDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleFreeze} disabled={submitting} variant="destructive">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBilingual('Freeze', '冻结')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getBilingual('Account Details', '账户详情')}</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Account Number', '账号')}</Label>
                  <p className="font-medium font-mono">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                  <p>{getStatusBadge(selectedAccount.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Customer', '客户')}</Label>
                  <p className="font-medium">{selectedAccount.customerName || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Account Type', '账户类型')}</Label>
                  <p>{selectedAccount.accountTypeName || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Current Balance', '当前余额')}</Label>
                  <p className="font-medium text-lg">{formatCurrency(selectedAccount.currentBalance, selectedAccount.currency)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Available Balance', '可用余额')}</Label>
                  <p className="font-medium">{formatCurrency(selectedAccount.availableBalance, selectedAccount.currency)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Branch', '分行')}</Label>
                  <p>{selectedAccount.branchName || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Currency', '币种')}</Label>
                  <p>{selectedAccount.currency}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {getBilingual('Close', '关闭')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountsPage;
