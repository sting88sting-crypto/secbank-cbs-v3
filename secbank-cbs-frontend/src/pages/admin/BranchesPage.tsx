import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { branchApi } from '@/lib/api';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Search, Loader2, Building2 } from 'lucide-react';

export function BranchesPage() {
  const { t, language, getBilingual } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<CreateBranchRequest>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await branchApi.getAll(0, 100);
      setBranches(response.data.content);
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
    if (!searchKeyword.trim()) {
      loadData();
      return;
    }
    setLoading(true);
    try {
      const response = await branchApi.search(searchKeyword);
      setBranches(response.data.content);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Search failed' : '搜索失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.branchCode || !formData.branchName) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await branchApi.create(formData as CreateBranchRequest);
      toast({
        title: t('messages.createSuccess'),
        variant: 'success',
      });
      setIsCreateDialogOpen(false);
      setFormData({});
      loadData();
    } catch (error: any) {
      toast({
        title: t('messages.operationFailed'),
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBranch) return;
    setSubmitting(true);
    try {
      await branchApi.update(selectedBranch.id, formData as UpdateBranchRequest);
      toast({
        title: t('messages.updateSuccess'),
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedBranch(null);
      setFormData({});
      loadData();
    } catch (error: any) {
      toast({
        title: t('messages.operationFailed'),
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    setSubmitting(true);
    try {
      await branchApi.delete(selectedBranch.id);
      toast({
        title: t('messages.deleteSuccess'),
        variant: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
      loadData();
    } catch (error: any) {
      toast({
        title: t('messages.operationFailed'),
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      branchName: branch.branchName,
      branchNameCn: branch.branchNameCn || '',
      address: branch.address || '',
      city: branch.city || '',
      province: branch.province || '',
      postalCode: branch.postalCode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      status: branch.status,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('branches.title')}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage bank branches and locations' : '管理银行分行和网点'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('branches.createBranch')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'en' ? 'Search by branch code or name...' : '按分行代码或名称搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('branches.branchCode')}</TableHead>
                  <TableHead>{t('branches.branchName')}</TableHead>
                  <TableHead>{t('branches.city')}</TableHead>
                  <TableHead>{t('branches.phone')}</TableHead>
                  <TableHead>{t('branches.managerName')}</TableHead>
                  <TableHead>{t('branches.isHeadOffice')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.branchCode}</TableCell>
                      <TableCell>{getBilingual(branch.branchName, branch.branchNameCn)}</TableCell>
                      <TableCell>{branch.city || '-'}</TableCell>
                      <TableCell>{branch.phone || '-'}</TableCell>
                      <TableCell>{branch.managerName || '-'}</TableCell>
                      <TableCell>
                        {branch.isHeadOffice ? (
                          <Badge variant="default">
                            <Building2 className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'Head Office' : '总行'}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(branch.status)}>
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(branch)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={branch.isHeadOffice}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('branches.createBranch')}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Create a new bank branch' : '创建新的银行分行'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('branches.branchCode')} *</Label>
              <Input
                value={formData.branchCode || ''}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                placeholder="001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.branchName')} *</Label>
              <Input
                value={formData.branchName || ''}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.branchNameCn')}</Label>
              <Input
                value={formData.branchNameCn || ''}
                onChange={(e) => setFormData({ ...formData, branchNameCn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.managerName')}</Label>
              <Input
                value={formData.managerName || ''}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t('branches.address')}</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.city')}</Label>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.province')}</Label>
              <Input
                value={formData.province || ''}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.postalCode')}</Label>
              <Input
                value={formData.postalCode || ''}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.phone')}</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t('branches.email')}</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('branches.editBranch')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('branches.branchName')}</Label>
              <Input
                value={formData.branchName || ''}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.branchNameCn')}</Label>
              <Input
                value={formData.branchNameCn || ''}
                onChange={(e) => setFormData({ ...formData, branchNameCn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.managerName')}</Label>
              <Input
                value={formData.managerName || ''}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.status')}</Label>
              <Select
                value={(formData as UpdateBranchRequest).status || ''}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('common.active')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('common.inactive')}</SelectItem>
                  <SelectItem value="CLOSED">{t('common.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t('branches.address')}</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.city')}</Label>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.province')}</Label>
              <Input
                value={formData.province || ''}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.phone')}</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('branches.email')}</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('branches.deleteBranch')}</DialogTitle>
            <DialogDescription>
              {t('branches.confirmDelete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
