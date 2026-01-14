import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountTypeApi } from '@/lib/api';
import { AccountType, CreateAccountTypeRequest, AccountCategory, AccountTypeStatus, InterestCalculation, PostingFrequency } from '@/types';
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
import { Plus, Search, Loader2, Wallet, PiggyBank, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export function AccountTypesPage() {
  const { getBilingual } = useLanguage();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<AccountCategory | ''>('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<CreateAccountTypeRequest>>({
    category: 'SAVINGS',
    interestCalculation: 'DAILY_BALANCE',
    interestPostingFrequency: 'MONTHLY',
    interestRate: 0,
    minimumBalance: 0,
    minimumOpeningBalance: 0,
  });

  useEffect(() => {
    loadData();
  }, [currentPage, filterCategory]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountTypeApi.getAll({
        keyword: searchKeyword || undefined,
        category: filterCategory || undefined,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setAccountTypes(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setAccountTypes([]);
      }
    } catch (err: any) {
      console.error('Failed to load account types:', err);
      setError(err?.message || 'Failed to load account types');
      setAccountTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadData();
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.typeCode || !formData.typeName || !formData.category) {
      toast({ title: getBilingual('Please fill in required fields', '请填写必填字段'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await accountTypeApi.create(formData as CreateAccountTypeRequest);
      if (response.success) {
        toast({ title: getBilingual('Account type created successfully', '账户类型创建成功') });
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast({ title: response.message || getBilingual('Failed to create account type', '创建账户类型失败'), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Failed to create account type:', err);
      toast({ 
        title: getBilingual('Failed to create account type', '创建账户类型失败'),
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'SAVINGS',
      interestCalculation: 'DAILY_BALANCE',
      interestPostingFrequency: 'MONTHLY',
      interestRate: 0,
      minimumBalance: 0,
      minimumOpeningBalance: 0,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (type: AccountType) => {
    setSelectedType(type);
    setIsViewDialogOpen(true);
  };

  const getCategoryBadge = (category: AccountCategory) => {
    const colors: Record<AccountCategory, string> = {
      SAVINGS: 'bg-green-100 text-green-800',
      CURRENT: 'bg-blue-100 text-blue-800',
      TIME_DEPOSIT: 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const getStatusBadge = (status: AccountTypeStatus) => {
    const colors: Record<AccountTypeStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const formatPercent = (rate: number | undefined | null) => {
    if (rate === undefined || rate === null) return '0.00%';
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Account Types', '账户类型')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage account types and configurations', '管理账户类型及配置')}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('New Account Type', '新建账户类型')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Savings', '储蓄账户')}</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountTypes.filter(t => t.category === 'SAVINGS').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Current', '活期账户')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountTypes.filter(t => t.category === 'CURRENT').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Time Deposit', '定期存款')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountTypes.filter(t => t.category === 'TIME_DEPOSIT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={getBilingual('Search by code or name...', '按代码或名称搜索...')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v as AccountCategory | ''); setCurrentPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={getBilingual('Category', '类别')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getBilingual('All Categories', '全部类别')}</SelectItem>
                <SelectItem value="SAVINGS">{getBilingual('Savings', '储蓄')}</SelectItem>
                <SelectItem value="CURRENT">{getBilingual('Current', '活期')}</SelectItem>
                <SelectItem value="TIME_DEPOSIT">{getBilingual('Time Deposit', '定期')}</SelectItem>
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
                <TableHead>{getBilingual('Code', '代码')}</TableHead>
                <TableHead>{getBilingual('Name', '名称')}</TableHead>
                <TableHead>{getBilingual('Category', '类别')}</TableHead>
                <TableHead>{getBilingual('Interest Rate', '利率')}</TableHead>
                <TableHead>{getBilingual('Min Balance', '最低余额')}</TableHead>
                <TableHead>{getBilingual('Status', '状态')}</TableHead>
                <TableHead>{getBilingual('Actions', '操作')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {getBilingual('No account types found', '未找到账户类型')}
                  </TableCell>
                </TableRow>
              ) : (
                accountTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono">{type.typeCode}</TableCell>
                    <TableCell>{type.typeName}</TableCell>
                    <TableCell>{getCategoryBadge(type.category)}</TableCell>
                    <TableCell>{formatPercent(type.interestRate)}</TableCell>
                    <TableCell>{formatCurrency(type.minimumBalance)}</TableCell>
                    <TableCell>{getStatusBadge(type.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openViewDialog(type)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
                {getBilingual(`Showing ${accountTypes.length} of ${totalElements} results`, `显示 ${accountTypes.length} / ${totalElements} 条结果`)}
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
            <DialogTitle>{getBilingual('Create Account Type', '创建账户类型')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Configure the account type settings', '配置账户类型设置')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Type Code', '类型代码')} *</Label>
              <Input
                className="col-span-3"
                placeholder="e.g., SAV001"
                value={formData.typeCode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, typeCode: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Type Name', '类型名称')} *</Label>
              <Input
                className="col-span-3"
                placeholder="e.g., Regular Savings"
                value={formData.typeName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, typeName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Category', '类别')} *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as AccountCategory }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">{getBilingual('Savings', '储蓄')}</SelectItem>
                  <SelectItem value="CURRENT">{getBilingual('Current', '活期')}</SelectItem>
                  <SelectItem value="TIME_DEPOSIT">{getBilingual('Time Deposit', '定期')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interest Settings */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-4">{getBilingual('Interest Settings', '利息设置')}</h4>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Interest Rate (%)', '利率 (%)')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.interestRate || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Calculation Method', '计算方式')}</Label>
              <Select 
                value={formData.interestCalculation} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, interestCalculation: v as InterestCalculation }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY_BALANCE">{getBilingual('Daily Balance', '日均余额')}</SelectItem>
                  <SelectItem value="MINIMUM_BALANCE">{getBilingual('Minimum Balance', '最低余额')}</SelectItem>
                  <SelectItem value="AVERAGE_BALANCE">{getBilingual('Average Balance', '平均余额')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Posting Frequency', '计息频率')}</Label>
              <Select 
                value={formData.interestPostingFrequency} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, interestPostingFrequency: v as PostingFrequency }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">{getBilingual('Daily', '每日')}</SelectItem>
                  <SelectItem value="MONTHLY">{getBilingual('Monthly', '每月')}</SelectItem>
                  <SelectItem value="QUARTERLY">{getBilingual('Quarterly', '每季')}</SelectItem>
                  <SelectItem value="ANNUALLY">{getBilingual('Annually', '每年')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance Settings */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-4">{getBilingual('Balance Settings', '余额设置')}</h4>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Min Opening Balance', '最低开户金额')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.minimumOpeningBalance || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumOpeningBalance: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Min Balance', '最低余额')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.minimumBalance || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumBalance: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBilingual('Create', '创建')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getBilingual('Account Type Details', '账户类型详情')}</DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type Code', '类型代码')}</Label>
                  <p className="font-medium">{selectedType.typeCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type Name', '类型名称')}</Label>
                  <p className="font-medium">{selectedType.typeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Category', '类别')}</Label>
                  <p>{getCategoryBadge(selectedType.category)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                  <p>{getStatusBadge(selectedType.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Interest Rate', '利率')}</Label>
                  <p className="font-medium">{formatPercent(selectedType.interestRate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Min Balance', '最低余额')}</Label>
                  <p className="font-medium">{formatCurrency(selectedType.minimumBalance)}</p>
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

export default AccountTypesPage;
