import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountTypeApi } from '@/lib/api';
import { AccountType, CreateAccountTypeRequest, AccountCategory, AccountTypeStatus, InterestCalculation, PostingFrequency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Search, Loader2, Eye, Wallet, PiggyBank, Clock } from 'lucide-react';

export function AccountTypesPage() {
  const { t, language, getBilingual } = useLanguage();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<AccountCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<AccountTypeStatus | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAccountTypeRequest>>({});
  const [submitting, setSubmitting] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, filterCategory, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountTypeApi.getAll({
        keyword: searchKeyword || undefined,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setAccountTypes(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setAccountTypes([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Failed to load account types:', err);
      setError(err?.message || 'Failed to load account types');
      setAccountTypes([]);
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

  const handleCreate = async () => {
    if (!formData.typeCode || !formData.typeName || !formData.category) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await accountTypeApi.create(formData as CreateAccountTypeRequest);
      if (response.success) {
        toast({
          title: language === 'en' ? 'Account type created successfully' : '账户类型创建成功',
        });
        setIsCreateDialogOpen(false);
        setFormData({});
        loadData();
      }
    } catch (err: any) {
      toast({
        title: language === 'en' ? 'Failed to create account type' : '创建账户类型失败',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      interestCalculation: 'DAILY_BALANCE',
      interestPostingFrequency: 'MONTHLY',
    });
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (type: AccountType) => {
    setSelectedType(type);
    setIsViewDialogOpen(true);
  };

  const getCategoryIcon = (category: AccountCategory) => {
    switch (category) {
      case 'SAVINGS': return <PiggyBank className="h-4 w-4" />;
      case 'CURRENT': return <Wallet className="h-4 w-4" />;
      case 'TIME_DEPOSIT': return <Clock className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: AccountCategory) => {
    const colors: Record<AccountCategory, string> = {
      SAVINGS: 'bg-green-100 text-green-800',
      CURRENT: 'bg-blue-100 text-blue-800',
      TIME_DEPOSIT: 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[category]}>{category}</Badge>;
  };

  const getStatusBadge = (status: AccountTypeStatus) => {
    const colors: Record<AccountTypeStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Account Types', '账户类型')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage account types and their configurations', '管理账户类型及其配置')}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {getBilingual('Add Account Type', '添加账户类型')}
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
                placeholder={language === 'en' ? 'Search by code or name...' : '按代码或名称搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as AccountCategory | '')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={language === 'en' ? 'Category' : '类别'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Categories' : '全部类别'}</SelectItem>
                <SelectItem value="SAVINGS">{language === 'en' ? 'Savings' : '储蓄'}</SelectItem>
                <SelectItem value="CURRENT">{language === 'en' ? 'Current' : '活期'}</SelectItem>
                <SelectItem value="TIME_DEPOSIT">{language === 'en' ? 'Time Deposit' : '定期'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as AccountTypeStatus | '')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Status' : '全部状态'}</SelectItem>
                <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                <SelectItem value="INACTIVE">{language === 'en' ? 'Inactive' : '非活跃'}</SelectItem>
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
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : accountTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {getBilingual('No account types found', '暂无账户类型')}
            </div>
          ) : (
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
                {accountTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono">{type.typeCode}</TableCell>
                    <TableCell>
                      <div>
                        <div>{type.typeName}</div>
                        {type.typeNameCn && <div className="text-sm text-muted-foreground">{type.typeNameCn}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(type.category)}</TableCell>
                    <TableCell>{type.interestRate ? `${type.interestRate}%` : '-'}</TableCell>
                    <TableCell>{type.minimumBalance ? `₱${type.minimumBalance.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{getStatusBadge(type.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openViewDialog(type)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            {getBilingual('Previous', '上一页')}
          </Button>
          <span className="py-2 px-4">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            {getBilingual('Next', '下一页')}
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Add Account Type', '添加账户类型')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Configure the account type settings', '配置账户类型设置')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Type Code', '类型代码')} *</Label>
                <Input
                  value={formData.typeCode || ''}
                  onChange={(e) => setFormData({...formData, typeCode: e.target.value.toUpperCase()})}
                  placeholder="e.g., SAV001"
                />
              </div>
              <div>
                <Label>{getBilingual('Category', '类别')} *</Label>
                <Select value={formData.category || ''} onValueChange={(v) => setFormData({...formData, category: v as AccountCategory})}>
                  <SelectTrigger>
                    <SelectValue placeholder={getBilingual('Select category', '选择类别')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">{getBilingual('Savings', '储蓄')}</SelectItem>
                    <SelectItem value="CURRENT">{getBilingual('Current', '活期')}</SelectItem>
                    <SelectItem value="TIME_DEPOSIT">{getBilingual('Time Deposit', '定期')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Type Name', '类型名称')} *</Label>
                <Input
                  value={formData.typeName || ''}
                  onChange={(e) => setFormData({...formData, typeName: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Type Name (Chinese)', '类型名称（中文）')}</Label>
                <Input
                  value={formData.typeNameCn || ''}
                  onChange={(e) => setFormData({...formData, typeNameCn: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Interest Rate (%)', '利率 (%)')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.interestRate || ''}
                  onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div>
                <Label>{getBilingual('Minimum Balance', '最低余额')}</Label>
                <Input
                  type="number"
                  value={formData.minimumBalance || ''}
                  onChange={(e) => setFormData({...formData, minimumBalance: parseFloat(e.target.value) || undefined})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Interest Calculation', '利息计算方式')}</Label>
                <Select value={formData.interestCalculation || 'DAILY_BALANCE'} onValueChange={(v) => setFormData({...formData, interestCalculation: v as InterestCalculation})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY_BALANCE">{getBilingual('Daily Balance', '日均余额')}</SelectItem>
                    <SelectItem value="MINIMUM_BALANCE">{getBilingual('Minimum Balance', '最低余额')}</SelectItem>
                    <SelectItem value="AVERAGE_BALANCE">{getBilingual('Average Balance', '平均余额')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{getBilingual('Interest Posting Frequency', '利息入账频率')}</Label>
                <Select value={formData.interestPostingFrequency || 'MONTHLY'} onValueChange={(v) => setFormData({...formData, interestPostingFrequency: v as PostingFrequency})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">{getBilingual('Daily', '每日')}</SelectItem>
                    <SelectItem value="MONTHLY">{getBilingual('Monthly', '每月')}</SelectItem>
                    <SelectItem value="QUARTERLY">{getBilingual('Quarterly', '每季')}</SelectItem>
                    <SelectItem value="SEMI_ANNUALLY">{getBilingual('Semi-Annually', '每半年')}</SelectItem>
                    <SelectItem value="ANNUALLY">{getBilingual('Annually', '每年')}</SelectItem>
                    <SelectItem value="AT_MATURITY">{getBilingual('At Maturity', '到期')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{getBilingual('Description', '描述')}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  <p className="font-mono">{selectedType.typeCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Category', '类别')}</Label>
                  <p>{getCategoryBadge(selectedType.category)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type Name', '类型名称')}</Label>
                  <p>{selectedType.typeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type Name (Chinese)', '类型名称（中文）')}</Label>
                  <p>{selectedType.typeNameCn || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Interest Rate', '利率')}</Label>
                  <p>{selectedType.interestRate ? `${selectedType.interestRate}%` : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Minimum Balance', '最低余额')}</Label>
                  <p>{selectedType.minimumBalance ? `₱${selectedType.minimumBalance.toLocaleString()}` : '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Interest Calculation', '利息计算方式')}</Label>
                  <p>{selectedType.interestCalculation || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Interest Posting', '利息入账')}</Label>
                  <p>{selectedType.interestPostingFrequency || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{getBilingual('Description', '描述')}</Label>
                <p>{selectedType.description || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                <p>{getStatusBadge(selectedType.status)}</p>
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
