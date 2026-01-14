import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountApi, accountTypeApi, customerApi, branchApi } from '@/lib/api';
import { Account, AccountType, Customer, Branch, OpenAccountRequest, UpdateAccountRequest, AccountStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { getStatusColor, formatDate } from '@/lib/utils';
import { Plus, Pencil, Search, Loader2, Eye, Snowflake, Sun, XCircle, CreditCard } from 'lucide-react';

export function AccountsPage() {
  const { t, language, getBilingual } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | ''>('');
  const [filterBranch, setFilterBranch] = useState<number | ''>('');
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<OpenAccountRequest>>({});
  const [updateFormData, setUpdateFormData] = useState<Partial<UpdateAccountRequest>>({});
  const [freezeReason, setFreezeReason] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage, filterStatus, filterBranch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsRes, typesRes, branchesRes] = await Promise.all([
        accountApi.getAll({
          keyword: searchKeyword || undefined,
          status: filterStatus || undefined,
          branchId: filterBranch || undefined,
          page: currentPage,
          size: 20,
        }),
        accountTypeApi.getActive(),
        branchApi.getActive(),
      ]);
      setAccounts(accountsRes.data.content);
      setTotalPages(accountsRes.data.totalPages);
      setAccountTypes(typesRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Failed to load data' : '加载数据失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(0);
    loadData();
  };

  const handleSearchCustomer = async () => {
    if (!customerSearch.trim()) return;
    try {
      const response = await customerApi.search(customerSearch);
      setSearchedCustomers(response.data.content);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Search failed' : '搜索失败',
        variant: 'destructive',
      });
    }
  };

  const handleOpenAccount = async () => {
    if (!selectedCustomer || !formData.accountTypeId || !formData.branchId || !formData.initialDeposit) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await accountApi.open({
        ...formData,
        customerId: selectedCustomer.id,
      } as OpenAccountRequest);
      toast({
        title: language === 'en' ? 'Account opened successfully' : '账户开立成功',
        variant: 'success',
      });
      setIsOpenDialogOpen(false);
      setFormData({});
      setSelectedCustomer(null);
      setSearchedCustomers([]);
      setCustomerSearch('');
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAccount) return;
    setSubmitting(true);
    try {
      await accountApi.update(selectedAccount.id, updateFormData as UpdateAccountRequest);
      toast({
        title: language === 'en' ? 'Account updated successfully' : '账户更新成功',
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      setUpdateFormData({});
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreeze = async () => {
    if (!selectedAccount || !freezeReason) {
      toast({
        title: language === 'en' ? 'Please provide a reason' : '请提供原因',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await accountApi.freeze(selectedAccount.id, freezeReason);
      toast({
        title: language === 'en' ? 'Account frozen successfully' : '账户冻结成功',
        variant: 'success',
      });
      setIsFreezeDialogOpen(false);
      setSelectedAccount(null);
      setFreezeReason('');
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnfreeze = async (account: Account) => {
    try {
      await accountApi.unfreeze(account.id);
      toast({
        title: language === 'en' ? 'Account unfrozen successfully' : '账户解冻成功',
        variant: 'success',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = async () => {
    if (!selectedAccount || !closeReason) {
      toast({
        title: language === 'en' ? 'Please provide a reason' : '请提供原因',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await accountApi.close(selectedAccount.id, closeReason);
      toast({
        title: language === 'en' ? 'Account closed successfully' : '账户关闭成功',
        variant: 'success',
      });
      setIsCloseDialogOpen(false);
      setSelectedAccount(null);
      setCloseReason('');
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setUpdateFormData({
      accountName: account.accountName,
      accountNameCn: account.accountNameCn || '',
      atmEnabled: account.atmEnabled,
      onlineBankingEnabled: account.onlineBankingEnabled,
      smsNotificationEnabled: account.smsNotificationEnabled,
      emailNotificationEnabled: account.emailNotificationEnabled,
      remarks: account.remarks || '',
    });
    setIsEditDialogOpen(true);
  };

  const getAccountStatusColor = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DORMANT': return 'bg-gray-100 text-gray-800';
      case 'FROZEN': return 'bg-blue-100 text-blue-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'CLOSED': return 'bg-gray-300 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{language === 'en' ? 'Account Management' : '账户管理'}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage customer accounts' : '管理客户账户'}
          </p>
        </div>
        <Button onClick={() => { setFormData({ atmEnabled: true, onlineBankingEnabled: true, smsNotificationEnabled: true }); setIsOpenDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Open Account' : '开立账户'}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={language === 'en' ? 'Search by account number, name, customer...' : '按账号、名称、客户搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={String(filterBranch)} onValueChange={(v) => setFilterBranch(v ? Number(v) : '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'en' ? 'Branch' : '分行'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Branches' : '所有分行'}</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {getBilingual(branch.branchName, branch.branchNameCn)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as AccountStatus | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Status' : '所有状态'}</SelectItem>
                <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                <SelectItem value="DORMANT">{language === 'en' ? 'Dormant' : '休眠'}</SelectItem>
                <SelectItem value="FROZEN">{language === 'en' ? 'Frozen' : '冻结'}</SelectItem>
                <SelectItem value="CLOSED">{language === 'en' ? 'Closed' : '已关闭'}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'en' ? 'Account Number' : '账号'}</TableHead>
                    <TableHead>{language === 'en' ? 'Account Name' : '账户名称'}</TableHead>
                    <TableHead>{language === 'en' ? 'Customer' : '客户'}</TableHead>
                    <TableHead>{language === 'en' ? 'Type' : '类型'}</TableHead>
                    <TableHead>{language === 'en' ? 'Branch' : '分行'}</TableHead>
                    <TableHead className="text-right">{language === 'en' ? 'Balance' : '余额'}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.accountNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.accountName}</div>
                            {account.accountNameCn && (
                              <div className="text-sm text-gray-500">{account.accountNameCn}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{account.customerName}</div>
                            <div className="text-gray-500">{account.customerNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{account.accountTypeName}</TableCell>
                        <TableCell>{account.branchName}</TableCell>
                        <TableCell className="text-right font-mono">
                          <div>
                            <div>{formatCurrency(account.currentBalance)}</div>
                            {account.holdBalance > 0 && (
                              <div className="text-xs text-orange-600">
                                Hold: {formatCurrency(account.holdBalance)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAccountStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedAccount(account); setIsViewDialogOpen(true); }}
                              title={language === 'en' ? 'View' : '查看'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {account.status !== 'CLOSED' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(account)}
                                  title={language === 'en' ? 'Edit' : '编辑'}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {account.status === 'ACTIVE' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setSelectedAccount(account); setIsFreezeDialogOpen(true); }}
                                    title={language === 'en' ? 'Freeze' : '冻结'}
                                  >
                                    <Snowflake className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                                {account.status === 'FROZEN' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUnfreeze(account)}
                                    title={language === 'en' ? 'Unfreeze' : '解冻'}
                                  >
                                    <Sun className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                )}
                                {(account.status === 'ACTIVE' || account.status === 'DORMANT') && account.currentBalance === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setSelectedAccount(account); setIsCloseDialogOpen(true); }}
                                    title={language === 'en' ? 'Close' : '关闭'}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </>
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
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    {language === 'en' ? 'Previous' : '上一页'}
                  </Button>
                  <span className="py-2 px-4 text-sm">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    {language === 'en' ? 'Next' : '下一页'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Open Account Dialog */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Open New Account' : '开立新账户'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Search for a customer and select account type to open a new account' : '搜索客户并选择账户类型以开立新账户'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Search */}
            <div className="space-y-4">
              <h4 className="font-medium">{language === 'en' ? 'Select Customer' : '选择客户'}</h4>
              {selectedCustomer ? (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedCustomer.displayName}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.customerNumber}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                        {language === 'en' ? 'Change' : '更换'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder={language === 'en' ? 'Search customer by name, CIF, phone...' : '按姓名、CIF、电话搜索客户...'}
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    />
                    <Button onClick={handleSearchCustomer}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchedCustomers.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {searchedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setSearchedCustomers([]);
                            setFormData({ ...formData, branchId: customer.branchId || undefined });
                          }}
                        >
                          <div className="font-medium">{customer.displayName}</div>
                          <div className="text-sm text-gray-500">
                            {customer.customerNumber} | {customer.mobilePhone || customer.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Account Details */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Account Details' : '账户详情'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Account Type' : '账户类型'} *</Label>
                  <Select value={String(formData.accountTypeId || '')} onValueChange={(v) => setFormData({ ...formData, accountTypeId: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select account type' : '选择账户类型'} />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.typeName} ({type.typeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Branch' : '分行'} *</Label>
                  <Select value={String(formData.branchId || '')} onValueChange={(v) => setFormData({ ...formData, branchId: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select branch' : '选择分行'} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)}>
                          {getBilingual(branch.branchName, branch.branchNameCn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Initial Deposit' : '初始存款'} *</Label>
                  <Input
                    type="number"
                    value={formData.initialDeposit || ''}
                    onChange={(e) => setFormData({ ...formData, initialDeposit: Number(e.target.value) })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Account Name (Optional)' : '账户名称（可选）'}</Label>
                  <Input
                    value={formData.accountName || ''}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder={language === 'en' ? 'Custom account name' : '自定义账户名称'}
                  />
                </div>
              </div>
            </div>

            {/* Account Features */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Account Features' : '账户功能'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="atmEnabled"
                    checked={formData.atmEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, atmEnabled: !!checked })}
                  />
                  <Label htmlFor="atmEnabled">{language === 'en' ? 'ATM Enabled' : '启用ATM'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlineBankingEnabled"
                    checked={formData.onlineBankingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, onlineBankingEnabled: !!checked })}
                  />
                  <Label htmlFor="onlineBankingEnabled">{language === 'en' ? 'Online Banking' : '网上银行'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsNotificationEnabled"
                    checked={formData.smsNotificationEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, smsNotificationEnabled: !!checked })}
                  />
                  <Label htmlFor="smsNotificationEnabled">{language === 'en' ? 'SMS Notifications' : '短信通知'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailNotificationEnabled"
                    checked={formData.emailNotificationEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, emailNotificationEnabled: !!checked })}
                  />
                  <Label htmlFor="emailNotificationEnabled">{language === 'en' ? 'Email Notifications' : '邮件通知'}</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleOpenAccount} disabled={submitting || !selectedCustomer}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CreditCard className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Open Account' : '开立账户'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Account' : '编辑账户'}</DialogTitle>
            <DialogDescription>
              {selectedAccount?.accountNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Account Name' : '账户名称'}</Label>
              <Input
                value={updateFormData.accountName || ''}
                onChange={(e) => setUpdateFormData({ ...updateFormData, accountName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-atmEnabled"
                  checked={updateFormData.atmEnabled}
                  onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, atmEnabled: !!checked })}
                />
                <Label htmlFor="edit-atmEnabled">{language === 'en' ? 'ATM Enabled' : '启用ATM'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-onlineBankingEnabled"
                  checked={updateFormData.onlineBankingEnabled}
                  onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, onlineBankingEnabled: !!checked })}
                />
                <Label htmlFor="edit-onlineBankingEnabled">{language === 'en' ? 'Online Banking' : '网上银行'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-smsNotificationEnabled"
                  checked={updateFormData.smsNotificationEnabled}
                  onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, smsNotificationEnabled: !!checked })}
                />
                <Label htmlFor="edit-smsNotificationEnabled">{language === 'en' ? 'SMS Notifications' : '短信通知'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-emailNotificationEnabled"
                  checked={updateFormData.emailNotificationEnabled}
                  onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, emailNotificationEnabled: !!checked })}
                />
                <Label htmlFor="edit-emailNotificationEnabled">{language === 'en' ? 'Email Notifications' : '邮件通知'}</Label>
              </div>
            </div>
            <div>
              <Label>{language === 'en' ? 'Remarks' : '备注'}</Label>
              <Input
                value={updateFormData.remarks || ''}
                onChange={(e) => setUpdateFormData({ ...updateFormData, remarks: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Account Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Account Details' : '账户详情'}</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Account Number' : '账号'}</Label>
                  <p className="font-mono text-lg">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Status' : '状态'}</Label>
                  <p><Badge className={getAccountStatusColor(selectedAccount.status)}>{selectedAccount.status}</Badge></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Account Name' : '账户名称'}</Label>
                  <p className="font-medium">{selectedAccount.accountName}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Account Type' : '账户类型'}</Label>
                  <p>{selectedAccount.accountTypeName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Customer' : '客户'}</Label>
                  <p>{selectedAccount.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedAccount.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Branch' : '分行'}</Label>
                  <p>{selectedAccount.branchName}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Current Balance' : '当前余额'}</Label>
                  <p className="text-xl font-mono font-bold">{formatCurrency(selectedAccount.currentBalance)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Available Balance' : '可用余额'}</Label>
                  <p className="text-xl font-mono">{formatCurrency(selectedAccount.availableBalance)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Hold Amount' : '冻结金额'}</Label>
                  <p className="text-xl font-mono text-orange-600">{formatCurrency(selectedAccount.holdBalance)}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'ATM' : 'ATM'}</Label>
                  <p>{selectedAccount.atmEnabled ? '✓' : '✗'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Online' : '网银'}</Label>
                  <p>{selectedAccount.onlineBankingEnabled ? '✓' : '✗'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'SMS' : '短信'}</Label>
                  <p>{selectedAccount.smsNotificationEnabled ? '✓' : '✗'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Email' : '邮件'}</Label>
                  <p>{selectedAccount.emailNotificationEnabled ? '✓' : '✗'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Open Date' : '开户日期'}</Label>
                  <p>{formatDate(selectedAccount.openDate, language)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Last Transaction' : '最后交易'}</Label>
                  <p>{selectedAccount.lastTransactionDate ? formatDate(selectedAccount.lastTransactionDate, language) : '-'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Account Dialog */}
      <Dialog open={isFreezeDialogOpen} onOpenChange={setIsFreezeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Freeze Account' : '冻结账户'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'This will prevent any transactions on this account. Please provide a reason.'
                : '这将阻止此账户的任何交易。请提供原因。'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>{language === 'en' ? 'Reason' : '原因'} *</Label>
            <Input
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
              placeholder={language === 'en' ? 'Enter reason for freezing' : '输入冻结原因'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFreezeDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleFreeze} disabled={submitting} variant="destructive">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Snowflake className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Freeze' : '冻结'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Account Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Close Account' : '关闭账户'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'This action is irreversible. The account must have zero balance.'
                : '此操作不可逆。账户余额必须为零。'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>{language === 'en' ? 'Reason' : '原因'} *</Label>
            <Input
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder={language === 'en' ? 'Enter reason for closing' : '输入关闭原因'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleClose} disabled={submitting} variant="destructive">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <XCircle className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Close Account' : '关闭账户'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
