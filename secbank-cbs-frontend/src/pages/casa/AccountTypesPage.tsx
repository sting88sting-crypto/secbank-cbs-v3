import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountTypeApi } from '@/lib/api';
import { AccountType, CreateAccountTypeRequest, AccountCategory, AccountTypeStatus, InterestCalculation, PostingFrequency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { getStatusColor } from '@/lib/utils';
import { Plus, Pencil, Search, Loader2, Eye, Wallet, PiggyBank, Clock } from 'lucide-react';

export function AccountTypesPage() {
  const { t, language, getBilingual } = useLanguage();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<AccountCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<AccountTypeStatus | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    try {
      const response = await accountTypeApi.getAll({
        keyword: searchKeyword || undefined,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        size: 20,
      });
      setAccountTypes(response.data.content);
      setTotalPages(response.data.totalPages);
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
      await accountTypeApi.create(formData as CreateAccountTypeRequest);
      toast({
        title: language === 'en' ? 'Account type created successfully' : '账户类型创建成功',
        variant: 'success',
      });
      setIsCreateDialogOpen(false);
      setFormData({});
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
    if (!selectedType) return;
    setSubmitting(true);
    try {
      await accountTypeApi.update(selectedType.id, formData as CreateAccountTypeRequest);
      toast({
        title: language === 'en' ? 'Account type updated successfully' : '账户类型更新成功',
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedType(null);
      setFormData({});
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

  const openEditDialog = (type: AccountType) => {
    setSelectedType(type);
    setFormData({
      typeCode: type.typeCode,
      typeName: type.typeName,
      typeNameCn: type.typeNameCn || '',
      category: type.category,
      description: type.description || '',
      descriptionCn: type.descriptionCn || '',
      interestRate: type.interestRate || undefined,
      interestCalculation: type.interestCalculation || undefined,
      interestPostingFrequency: type.interestPostingFrequency || undefined,
      minimumBalance: type.minimumBalance || undefined,
      minimumOpeningBalance: type.minimumOpeningBalance || undefined,
      maximumBalance: type.maximumBalance || undefined,
      monthlyFee: type.monthlyFee || undefined,
      belowMinimumFee: type.belowMinimumFee || undefined,
      dormancyFee: type.dormancyFee || undefined,
      dailyWithdrawalLimit: type.dailyWithdrawalLimit || undefined,
      dailyTransferLimit: type.dailyTransferLimit || undefined,
      maxTransactionsPerDay: type.maxTransactionsPerDay || undefined,
      termDays: type.termDays || undefined,
      earlyWithdrawalPenaltyRate: type.earlyWithdrawalPenaltyRate || undefined,
      allowIndividual: type.allowIndividual,
      allowCorporate: type.allowCorporate,
      minimumAge: type.minimumAge || undefined,
      maximumAge: type.maximumAge || undefined,
      currency: type.currency,
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryIcon = (category: AccountCategory) => {
    switch (category) {
      case 'SAVINGS': return <PiggyBank className="h-4 w-4" />;
      case 'CURRENT': return <Wallet className="h-4 w-4" />;
      case 'TIME_DEPOSIT': return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: AccountCategory) => {
    switch (category) {
      case 'SAVINGS': return 'bg-green-100 text-green-800';
      case 'CURRENT': return 'bg-blue-100 text-blue-800';
      case 'TIME_DEPOSIT': return 'bg-purple-100 text-purple-800';
    }
  };

  const getCategoryLabel = (category: AccountCategory) => {
    const labels = {
      SAVINGS: language === 'en' ? 'Savings' : '储蓄',
      CURRENT: language === 'en' ? 'Current' : '活期',
      TIME_DEPOSIT: language === 'en' ? 'Time Deposit' : '定期',
    };
    return labels[category];
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const formatPercent = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return '-';
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{language === 'en' ? 'Account Types' : '账户类型'}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage savings, current, and time deposit account types' : '管理储蓄、活期和定期账户类型'}
          </p>
        </div>
        <Button onClick={() => { setFormData({ currency: 'PHP', allowIndividual: true, allowCorporate: true }); setIsCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'New Account Type' : '新建账户类型'}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={language === 'en' ? 'Search by code or name...' : '按代码或名称搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as AccountCategory | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Category' : '类别'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Categories' : '所有类别'}</SelectItem>
                <SelectItem value="SAVINGS">{language === 'en' ? 'Savings' : '储蓄'}</SelectItem>
                <SelectItem value="CURRENT">{language === 'en' ? 'Current' : '活期'}</SelectItem>
                <SelectItem value="TIME_DEPOSIT">{language === 'en' ? 'Time Deposit' : '定期'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as AccountTypeStatus | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Status' : '所有状态'}</SelectItem>
                <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                <SelectItem value="INACTIVE">{language === 'en' ? 'Inactive' : '不活跃'}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Types Table */}
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
                    <TableHead>{language === 'en' ? 'Code' : '代码'}</TableHead>
                    <TableHead>{language === 'en' ? 'Name' : '名称'}</TableHead>
                    <TableHead>{language === 'en' ? 'Category' : '类别'}</TableHead>
                    <TableHead>{language === 'en' ? 'Interest Rate' : '利率'}</TableHead>
                    <TableHead>{language === 'en' ? 'Min Balance' : '最低余额'}</TableHead>
                    <TableHead>{language === 'en' ? 'Min Opening' : '最低开户'}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    accountTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-mono">{type.typeCode}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{type.typeName}</div>
                            {type.typeNameCn && (
                              <div className="text-sm text-gray-500">{type.typeNameCn}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(type.category)}>
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(type.category)}
                              {getCategoryLabel(type.category)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPercent(type.interestRate)}</TableCell>
                        <TableCell>{formatCurrency(type.minimumBalance)}</TableCell>
                        <TableCell>{formatCurrency(type.minimumOpeningBalance)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(type.status)}>
                            {type.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedType(type); setIsViewDialogOpen(true); }}
                              title={language === 'en' ? 'View' : '查看'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(type)}
                              title={language === 'en' ? 'Edit' : '编辑'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => { 
        if (!open) { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); } 
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen 
                ? (language === 'en' ? 'Edit Account Type' : '编辑账户类型')
                : (language === 'en' ? 'Create Account Type' : '创建账户类型')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium">{language === 'en' ? 'Basic Information' : '基本信息'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Type Code' : '类型代码'} *</Label>
                  <Input
                    value={formData.typeCode || ''}
                    onChange={(e) => setFormData({ ...formData, typeCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., SA01, CA01, TD30"
                    disabled={isEditDialogOpen}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Category' : '类别'} *</Label>
                  <Select value={formData.category || ''} onValueChange={(v) => setFormData({ ...formData, category: v as AccountCategory })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select category' : '选择类别'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">{language === 'en' ? 'Savings' : '储蓄'}</SelectItem>
                      <SelectItem value="CURRENT">{language === 'en' ? 'Current' : '活期'}</SelectItem>
                      <SelectItem value="TIME_DEPOSIT">{language === 'en' ? 'Time Deposit' : '定期'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Type Name' : '类型名称'} *</Label>
                  <Input
                    value={formData.typeName || ''}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                    placeholder="e.g., Regular Savings Account"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Type Name (Chinese)' : '类型名称（中文）'}</Label>
                  <Input
                    value={formData.typeNameCn || ''}
                    onChange={(e) => setFormData({ ...formData, typeNameCn: e.target.value })}
                    placeholder="e.g., 普通储蓄账户"
                  />
                </div>
              </div>
              <div>
                <Label>{language === 'en' ? 'Description' : '描述'}</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Interest Configuration */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Interest Configuration' : '利息配置'}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Interest Rate (%)' : '利率 (%)'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.interestRate !== undefined ? formData.interestRate * 100 : ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value ? Number(e.target.value) / 100 : undefined })}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Calculation Method' : '计算方式'}</Label>
                  <Select value={formData.interestCalculation || ''} onValueChange={(v) => setFormData({ ...formData, interestCalculation: v as InterestCalculation })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select method' : '选择方式'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY_BALANCE">{language === 'en' ? 'Daily Balance' : '日均余额'}</SelectItem>
                      <SelectItem value="MINIMUM_BALANCE">{language === 'en' ? 'Minimum Balance' : '最低余额'}</SelectItem>
                      <SelectItem value="AVERAGE_BALANCE">{language === 'en' ? 'Average Balance' : '平均余额'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Posting Frequency' : '计息频率'}</Label>
                  <Select value={formData.interestPostingFrequency || ''} onValueChange={(v) => setFormData({ ...formData, interestPostingFrequency: v as PostingFrequency })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select frequency' : '选择频率'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">{language === 'en' ? 'Monthly' : '每月'}</SelectItem>
                      <SelectItem value="QUARTERLY">{language === 'en' ? 'Quarterly' : '每季'}</SelectItem>
                      <SelectItem value="SEMI_ANNUALLY">{language === 'en' ? 'Semi-Annually' : '每半年'}</SelectItem>
                      <SelectItem value="ANNUALLY">{language === 'en' ? 'Annually' : '每年'}</SelectItem>
                      <SelectItem value="AT_MATURITY">{language === 'en' ? 'At Maturity' : '到期'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Balance Requirements */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Balance Requirements' : '余额要求'}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Minimum Balance' : '最低余额'}</Label>
                  <Input
                    type="number"
                    value={formData.minimumBalance || ''}
                    onChange={(e) => setFormData({ ...formData, minimumBalance: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Minimum Opening Balance' : '最低开户余额'}</Label>
                  <Input
                    type="number"
                    value={formData.minimumOpeningBalance || ''}
                    onChange={(e) => setFormData({ ...formData, minimumOpeningBalance: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Maximum Balance' : '最高余额'}</Label>
                  <Input
                    type="number"
                    value={formData.maximumBalance || ''}
                    onChange={(e) => setFormData({ ...formData, maximumBalance: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Fees' : '费用'}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Monthly Fee' : '月费'}</Label>
                  <Input
                    type="number"
                    value={formData.monthlyFee || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Below Minimum Fee' : '低于最低余额费'}</Label>
                  <Input
                    type="number"
                    value={formData.belowMinimumFee || ''}
                    onChange={(e) => setFormData({ ...formData, belowMinimumFee: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Dormancy Fee' : '休眠费'}</Label>
                  <Input
                    type="number"
                    value={formData.dormancyFee || ''}
                    onChange={(e) => setFormData({ ...formData, dormancyFee: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Transaction Limits */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{language === 'en' ? 'Transaction Limits' : '交易限额'}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Daily Withdrawal Limit' : '每日取款限额'}</Label>
                  <Input
                    type="number"
                    value={formData.dailyWithdrawalLimit || ''}
                    onChange={(e) => setFormData({ ...formData, dailyWithdrawalLimit: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Daily Transfer Limit' : '每日转账限额'}</Label>
                  <Input
                    type="number"
                    value={formData.dailyTransferLimit || ''}
                    onChange={(e) => setFormData({ ...formData, dailyTransferLimit: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Max Transactions/Day' : '每日最大交易次数'}</Label>
                  <Input
                    type="number"
                    value={formData.maxTransactionsPerDay || ''}
                    onChange={(e) => setFormData({ ...formData, maxTransactionsPerDay: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Time Deposit Specific */}
            {formData.category === 'TIME_DEPOSIT' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">{language === 'en' ? 'Time Deposit Settings' : '定期存款设置'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'en' ? 'Term (Days)' : '期限（天）'}</Label>
                    <Input
                      type="number"
                      value={formData.termDays || ''}
                      onChange={(e) => setFormData({ ...formData, termDays: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="e.g., 30, 60, 90, 180, 365"
                    />
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Early Withdrawal Penalty (%)' : '提前取款罚金 (%)'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.earlyWithdrawalPenaltyRate !== undefined ? formData.earlyWithdrawalPenaltyRate * 100 : ''}
                      onChange={(e) => setFormData({ ...formData, earlyWithdrawalPenaltyRate: e.target.value ? Number(e.target.value) / 100 : undefined })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={isEditDialogOpen ? handleUpdate : handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditDialogOpen ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Account Type Details' : '账户类型详情'}</DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Code' : '代码'}</Label>
                  <p className="font-mono">{selectedType.typeCode}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Category' : '类别'}</Label>
                  <p>
                    <Badge className={getCategoryColor(selectedType.category)}>
                      {getCategoryLabel(selectedType.category)}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">{language === 'en' ? 'Name' : '名称'}</Label>
                <p className="font-medium">{getBilingual(selectedType.typeName, selectedType.typeNameCn)}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Interest Rate' : '利率'}</Label>
                  <p>{formatPercent(selectedType.interestRate)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Min Balance' : '最低余额'}</Label>
                  <p>{formatCurrency(selectedType.minimumBalance)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Min Opening' : '最低开户'}</Label>
                  <p>{formatCurrency(selectedType.minimumOpeningBalance)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Monthly Fee' : '月费'}</Label>
                  <p>{formatCurrency(selectedType.monthlyFee)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Daily Withdrawal' : '每日取款'}</Label>
                  <p>{formatCurrency(selectedType.dailyWithdrawalLimit)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Daily Transfer' : '每日转账'}</Label>
                  <p>{formatCurrency(selectedType.dailyTransferLimit)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Eligibility' : '适用对象'}</Label>
                  <p>
                    {selectedType.allowIndividual && <Badge className="mr-1">{language === 'en' ? 'Individual' : '个人'}</Badge>}
                    {selectedType.allowCorporate && <Badge>{language === 'en' ? 'Corporate' : '企业'}</Badge>}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Status' : '状态'}</Label>
                  <p><Badge className={getStatusColor(selectedType.status)}>{selectedType.status}</Badge></p>
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
    </div>
  );
}
