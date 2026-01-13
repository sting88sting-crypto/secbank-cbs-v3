import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { userApi, roleApi, branchApi } from '@/lib/api';
import { User, Role, Branch, CreateUserRequest, UpdateUserRequest } from '@/types';
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
import { getStatusColor, formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search, Key, Loader2 } from 'lucide-react';

export function UsersPage() {
  const { t, language, getBilingual } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<CreateUserRequest & UpdateUserRequest>>({});
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        userApi.getAll(0, 100),
        roleApi.getActive(),
        branchApi.getActive(),
      ]);
      setUsers(usersRes.data.content);
      setRoles(rolesRes.data);
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
    if (!searchKeyword.trim()) {
      loadData();
      return;
    }
    setLoading(true);
    try {
      const response = await userApi.search(searchKeyword);
      setUsers(response.data.content);
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
    if (!formData.username || !formData.password || !formData.fullName || !formData.roleIds?.length) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await userApi.create(formData as CreateUserRequest);
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
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userApi.update(selectedUser.id, formData as UpdateUserRequest);
      toast({
        title: t('messages.updateSuccess'),
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
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
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userApi.delete(selectedUser.id);
      toast({
        title: t('messages.deleteSuccess'),
        variant: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
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

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    setSubmitting(true);
    try {
      await userApi.resetPassword(selectedUser.id, newPassword);
      toast({
        title: language === 'en' ? 'Password reset successfully' : '密码重置成功',
        variant: 'success',
      });
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
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

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      fullNameCn: user.fullNameCn || '',
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      branchId: user.branchId || undefined,
      roleIds: user.roles.map(r => r.id),
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('users.title')}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage system users and their access' : '管理系统用户及其访问权限'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('users.createUser')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'en' ? 'Search by username, name, or email...' : '按用户名、姓名或邮箱搜索...'}
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

      {/* Users Table */}
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
                  <TableHead>{t('auth.username')}</TableHead>
                  <TableHead>{t('users.fullName')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.branch')}</TableHead>
                  <TableHead>{t('users.roles')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('users.lastLogin')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        {getBilingual(user.fullName, user.fullNameCn)}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.branchName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {getBilingual(role.roleName, role.roleNameCn)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt, language) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsResetPasswordDialogOpen(true);
                            }}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
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

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('users.createUser')}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Create a new user account' : '创建新用户账户'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('auth.username')} *</Label>
              <Input
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.password')} *</Label>
              <Input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.fullName')} *</Label>
              <Input
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.fullNameCn')}</Label>
              <Input
                value={formData.fullNameCn || ''}
                onChange={(e) => setFormData({ ...formData, fullNameCn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.email')}</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.phone')}</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.employeeId')}</Label>
              <Input
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.branch')}</Label>
              <Select
                value={formData.branchId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, branchId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select branch' : '选择分行'} />
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
            <div className="col-span-2 space-y-2">
              <Label>{t('users.roles')} *</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roleIds?.includes(role.id) || false}
                      onChange={(e) => {
                        const roleIds = formData.roleIds || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, roleIds: [...roleIds, role.id] });
                        } else {
                          setFormData({ ...formData, roleIds: roleIds.filter(id => id !== role.id) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{getBilingual(role.roleName, role.roleNameCn)}</span>
                  </label>
                ))}
              </div>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('users.editUser')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('users.fullName')}</Label>
              <Input
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.fullNameCn')}</Label>
              <Input
                value={formData.fullNameCn || ''}
                onChange={(e) => setFormData({ ...formData, fullNameCn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.email')}</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.phone')}</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.branch')}</Label>
              <Select
                value={formData.branchId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, branchId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select branch' : '选择分行'} />
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
            <div className="space-y-2">
              <Label>{t('common.status')}</Label>
              <Select
                value={(formData as UpdateUserRequest).status || ''}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('common.active')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('common.inactive')}</SelectItem>
                  <SelectItem value="LOCKED">{t('common.locked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t('users.roles')}</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roleIds?.includes(role.id) || false}
                      onChange={(e) => {
                        const roleIds = formData.roleIds || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, roleIds: [...roleIds, role.id] });
                        } else {
                          setFormData({ ...formData, roleIds: roleIds.filter(id => id !== role.id) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{getBilingual(role.roleName, role.roleNameCn)}</span>
                  </label>
                ))}
              </div>
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
            <DialogTitle>{t('users.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('users.confirmDelete')}
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.resetPassword')}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Reset password for user: ${selectedUser?.username}`
                : `重置用户密码: ${selectedUser?.username}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>{t('auth.newPassword')}</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleResetPassword} disabled={submitting || !newPassword}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
