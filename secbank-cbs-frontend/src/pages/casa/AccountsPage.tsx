import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountApi, accountTypeApi, customerApi, branchApi } from '@/lib/api';
import { Account, AccountType, Customer, Branch, OpenAccountRequest, AccountStatus } from '@/types';
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
import { Plus, Search, Loader2, CreditCard, Eye, Snowflake, Sun } from 'lucide-react';

export function AccountsPage() {
  const { language, getBilingual } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | ''>('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Dialog states
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<OpenAccountRequest>>({
    atmEnabled: true,
    onlineBankingEnabled: true,
    smsNotificationEnabled: true,
    emailNotificationEnabled: true,
  });
  const [freezeReason, setFreezeReason] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [currentPage, filterStatus]);

  const loadInitialData = async () => {
    try {
      const [typesRes, branchesRes] = await Promise.all([
        accountTypeApi.getActive(),
        branchApi.getActive(),
      ]);
      if (typesRes.success && typesRes.data) {
        setAccountTypes(typesRes.data);
      }
      if (branchesRes.success && branchesRes.data) {
        setBranches(branchesRes.data);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
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

  const handleSearch = () => {
    setCurrentPage(0);
    loadAccounts();
  };

  const handleSearchCustomer = async () => {
    if (!customerSearch.trim()) return;
    setSearchingCustomer(true);
    try {
      const response = await customerApi.search(customerSearch);
      if (response.success && response.data) {
        setSearchedCustomers(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
      toast({ title: getBilingual('Search failed', '搜索失败'), variant: 'destructive' });
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleOpenAccount = async () => {
    // Validate required fields
    if (!selectedCustomer) {
      toast({ title: getBilingual('Please select a customer', '请选择客户'), variant: 'destructive' });
      return;
    }
    if (!formData.accountTypeId) {
      toast({ title: getBilingual('Please select account type', '请选择账户类型'), variant: 'destructive' });
      return;
    }
    if (!formData.branchId) {
      toast({ title: getBilingual('Please select branch', '请选择分行'), variant: 'destructive' });
      return;
    }
    if (!formData.initialDeposit || formData.initialDeposit <= 0) {
      toast({ title: getBilingual('Please enter initial deposit', '请输入初始存款'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await accountApi.open({
        ...formData,
        customerId: selectedCustomer.id,
      } as OpenAccountRequest);
      if (response.success) {
        toast({ title: getBilingual('Account opened successfully', '账户开立成功') });
        setIsOpenDialogOpen(false);
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
    if (!selectedAccount || !freezeReason) {
      toast({ title: getBilingual('Please provide a reason', '请提供原因'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await accountApi.freeze(selectedAccount.id, freezeReason);
      if (response.success) {
        toast({ title: getBilingual('Account frozen successfully', '账户冻结成功') });
        setIsFreezeDialogOpen(false);
        setSelectedAccount(null);
        setFreezeReason('');
        loadAccounts();
      }
    } catch (err: any) {
      toast({ 
        title: getBilingual('Operation failed', '操作失败'),
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnfreeze = async (account: Account) => {
    try {
      const response = await accountApi.unfreeze(account.id);
      if (response.success) {
        toast({ title: getBilingual('Account unfrozen successfully', '账户解冻成功') });
        loadAccounts();
      }
    } catch (err: any) {
      toast({ 
        title: getBilingual('Operation failed', '操作失败'),
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      atmEnabled: true,
      onlineBankingEnabled: true,
      smsNotificationEnabled: true,
      emailNotificationEnabled: true,
    });
    setSelectedCustomer(null);
    setSearchedCustomers([]);
    setCustomerSearch('');
  };

  const openOpenDialog = () => {
    resetForm();
    setIsOpenDialogOpen(true);
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
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      DORMANT: 'bg-gray-100 text-gray-800',
      FROZEN: 'bg-blue-100 text-blue-800',
      BLOCKED: 'bg-red-100 text-red-800',
      CLOSED: 'bg-gray-300 text-gray-600',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Account Management', '账户管理')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage customer accounts', '管理客户账户')}</p>
        </div>
        <Button onClick={openOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('Open Account', '开立账户')}
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

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={getBilingual('Search by account number, customer...', '按账号、客户搜索...')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as AccountStatus | '')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={getBilingual('Status', '状态')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getBilingual('All Status', '全部状态')}</SelectItem>
                <SelectItem value="ACTIVE">{getBilingual('Active', '活跃')}</SelectItem>
                <SelectItem value="DORMANT">{getBilingual('Dormant', '休眠')}</SelectItem>
                <SelectItem value="FROZEN">{getBilingual('Frozen', '冻结')}</SelectItem>
                <SelectItem value="CLOSED">{getBilingual('Closed', '已关闭')}</SelectItem>
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
                <TableHead>{getBilingual('Account Name', '账户名称')}</TableHead>
                <TableHead>{getBilingual('Customer', '客户')}</TableHead>
                <TableHead>{getBilingual('Type', '类型')}</TableHead>
                <TableHead>{getBilingual('Balance', '余额')}</TableHead>
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
                    <TableCell>
                      <div>
                        <div>{account.accountName}</div>
                        {account.accountNameCn && <div className="text-sm text-muted-foreground">{account.accountNameCn}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{account.customerName}</div>
                        <div className="text-sm text-muted-foreground">{account.customerNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{account.accountTypeName}</TableCell>
                    <TableCell className="font-mono">
                      <div>
                        <div>{formatCurrency(account.currentBalance)}</div>
                        {account.holdBalance && account.holdBalance > 0 && (
                          <div className="text-xs text-orange-600">Hold: {formatCurrency(account.holdBalance)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(account)} title={getBilingual('View', '查看')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {account.status === 'ACTIVE' && (
                          <Button variant="ghost" size="icon" onClick={() => openFreezeDialog(account)} title={getBilingual('Freeze', '冻结')}>
                            <Snowflake className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        {account.status === 'FROZEN' && (
                          <Button variant="ghost" size="icon" onClick={() => handleUnfreeze(account)} title={getBilingual('Unfreeze', '解冻')}>
                            <Sun className="h-4 w-4 text-yellow-500" />
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
            <div className="flex justify-center gap-2 p-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {getBilingual('Previous', '上一页')}
              </Button>
              <span className="flex items-center px-4">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {getBilingual('Next', '下一页')}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Open Account Dialog */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Open New Account', '开立新账户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Search for a customer and fill in account details', '搜索客户并填写账户信息')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Customer Search */}
            <div className="border rounded-lg p-4">
              <Label className="font-medium">{getBilingual('Customer', '客户')} *</Label>
              {selectedCustomer ? (
                <div className="mt-2 p-3 bg-green-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{selectedCustomer.displayName}</div>
                    <div className="text-sm text-muted-foreground">{selectedCustomer.customerNumber}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                    {getBilingual('Change', '更换')}
                  </Button>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={getBilingual('Search by name, ID, customer number...', '按姓名、证件号、客户号搜索...')}
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    />
                    <Button onClick={handleSearchCustomer} disabled={searchingCustomer}>
                      {searchingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {searchedCustomers.length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {searchedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setSearchedCustomers([]);
                          }}
                        >
                          <div className="font-medium">{customer.displayName}</div>
                          <div className="text-sm text-muted-foreground">{customer.customerNumber} | {customer.idNumber}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Account Type', '账户类型')} *</Label>
              <Select 
                value={formData.accountTypeId?.toString()} 
                onValueChange={(v) => setFormData({ ...formData, accountTypeId: parseInt(v) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={getBilingual('Select account type', '选择账户类型')} />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.typeName} ({type.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Branch', '分行')} *</Label>
              <Select 
                value={formData.branchId?.toString()} 
                onValueChange={(v) => setFormData({ ...formData, branchId: parseInt(v) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={getBilingual('Select branch', '选择分行')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {getBilingual(branch.branchName, branch.branchNameCn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Account Name', '账户名称')}</Label>
              <Input
                className="col-span-3"
                placeholder={getBilingual('Optional, defaults to customer name', '可选，默认为客户名称')}
                value={formData.accountName || ''}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            {/* Initial Deposit */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Initial Deposit', '初始存款')} *</Label>
              <Input
                type="number"
                className="col-span-3"
                placeholder="e.g., 5000"
                value={formData.initialDeposit || ''}
                onChange={(e) => setFormData({ ...formData, initialDeposit: parseFloat(e.target.value) || undefined })}
              />
            </div>

            {/* Currency */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Currency', '币种')}</Label>
              <Select 
                value={formData.currency || 'PHP'} 
                onValueChange={(v) => setFormData({ ...formData, currency: v })}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleOpenAccount} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBilingual('Open Account', '开立账户')}
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
                  <p className="font-mono">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                  <p>{getStatusBadge(selectedAccount.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Account Name', '账户名称')}</Label>
                  <p>{selectedAccount.accountName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Account Type', '账户类型')}</Label>
                  <p>{selectedAccount.accountTypeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Customer', '客户')}</Label>
                  <p>{selectedAccount.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAccount.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Branch', '分行')}</Label>
                  <p>{selectedAccount.branchName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Current Balance', '当前余额')}</Label>
                  <p className="font-mono text-lg">{formatCurrency(selectedAccount.currentBalance)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Available Balance', '可用余额')}</Label>
                  <p className="font-mono text-lg">{formatCurrency(selectedAccount.availableBalance)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Hold Balance', '冻结金额')}</Label>
                  <p className="font-mono">{formatCurrency(selectedAccount.holdBalance)}</p>
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
    </div>
  );
}
