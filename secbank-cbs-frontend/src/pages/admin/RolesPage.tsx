import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { roleApi, permissionApi } from '@/lib/api';
import { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '@/types';
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
import { Plus, Pencil, Trash2, Loader2, Shield } from 'lucide-react';

export function RolesPage() {
  const { t, language, getBilingual } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Partial<CreateRoleRequest>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleApi.getAll(0, 100),
        permissionApi.getGrouped(),
      ]);
      setRoles(rolesRes.data.content);
      setPermissionsByModule(permissionsRes.data);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Failed to load data' : '加载数据失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.roleCode || !formData.roleName) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await roleApi.create(formData as CreateRoleRequest);
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
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      await roleApi.update(selectedRole.id, formData as UpdateRoleRequest);
      toast({
        title: t('messages.updateSuccess'),
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
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
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      await roleApi.delete(selectedRole.id);
      toast({
        title: t('messages.deleteSuccess'),
        variant: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
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

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleNameCn: role.roleNameCn || '',
      description: role.description || '',
      descriptionCn: role.descriptionCn || '',
      permissionIds: role.permissions.map(p => p.id),
      status: role.status,
    });
    setIsEditDialogOpen(true);
  };

  const togglePermission = (permissionId: number) => {
    const permissionIds = formData.permissionIds || [];
    if (permissionIds.includes(permissionId)) {
      setFormData({ ...formData, permissionIds: permissionIds.filter(id => id !== permissionId) });
    } else {
      setFormData({ ...formData, permissionIds: [...permissionIds, permissionId] });
    }
  };

  const toggleModulePermissions = (permissions: Permission[]) => {
    const permissionIds = formData.permissionIds || [];
    const modulePermissionIds = permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => permissionIds.includes(id));
    
    if (allSelected) {
      setFormData({ 
        ...formData, 
        permissionIds: permissionIds.filter(id => !modulePermissionIds.includes(id)) 
      });
    } else {
      const newIds = [...new Set([...permissionIds, ...modulePermissionIds])];
      setFormData({ ...formData, permissionIds: newIds });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('roles.title')}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage roles and their permissions' : '管理角色及其权限'}
          </p>
        </div>
        <Button onClick={() => { setFormData({ permissionIds: [] }); setIsCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('roles.createRole')}
        </Button>
      </div>

      {/* Roles Table */}
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
                  <TableHead>{t('roles.roleCode')}</TableHead>
                  <TableHead>{t('roles.roleName')}</TableHead>
                  <TableHead>{t('roles.description')}</TableHead>
                  <TableHead>{t('roles.permissions')}</TableHead>
                  <TableHead>{t('roles.isSystemRole')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.roleCode}</TableCell>
                      <TableCell>{getBilingual(role.roleName, role.roleNameCn)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {getBilingual(role.description || '-', role.descriptionCn)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions.length} {language === 'en' ? 'permissions' : '个权限'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {role.isSystemRole ? (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'System' : '系统'}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(role.status)}>
                          {role.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(role)}
                            disabled={role.isSystemRole}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRole(role);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={role.isSystemRole}
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

      {/* Create/Edit Role Dialog */}
      <Dialog 
        open={isCreateDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData({});
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? t('roles.createRole') : t('roles.editRole')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('roles.roleCode')} *</Label>
                <Input
                  value={formData.roleCode || ''}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value.toUpperCase() })}
                  placeholder="ROLE_CODE"
                  disabled={isEditDialogOpen}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.status')}</Label>
                <Select
                  value={(formData as UpdateRoleRequest).status || 'ACTIVE'}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('common.active')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('roles.roleName')} *</Label>
                <Input
                  value={formData.roleName || ''}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('roles.roleNameCn')}</Label>
                <Input
                  value={formData.roleNameCn || ''}
                  onChange={(e) => setFormData({ ...formData, roleNameCn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('roles.description')}</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('roles.descriptionCn')}</Label>
                <Input
                  value={formData.descriptionCn || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionCn: e.target.value })}
                />
              </div>
            </div>

            {/* Permissions Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">{t('roles.permissions')}</Label>
              <div className="border rounded-lg p-4 space-y-4 max-h-80 overflow-y-auto">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={permissions.every(p => formData.permissionIds?.includes(p.id))}
                        onChange={() => toggleModulePermissions(permissions)}
                        className="rounded"
                      />
                      <span className="font-medium text-sm">{module}</span>
                      <Badge variant="outline" className="text-xs">
                        {permissions.filter(p => formData.permissionIds?.includes(p.id)).length}/{permissions.length}
                      </Badge>
                    </div>
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissionIds?.includes(permission.id) || false}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">
                            {getBilingual(permission.permissionName, permission.permissionNameCn)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setFormData({});
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={isCreateDialogOpen ? handleCreate : handleUpdate} 
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreateDialogOpen ? t('common.create') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('roles.deleteRole')}</DialogTitle>
            <DialogDescription>
              {t('roles.confirmDelete')}
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
