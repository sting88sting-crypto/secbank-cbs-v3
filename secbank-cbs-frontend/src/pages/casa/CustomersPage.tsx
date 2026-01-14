import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi, branchApi } from '@/lib/api';
import { Customer, CreateCustomerRequest, CustomerType, CustomerStatus, Gender, IdType, RiskRating, Branch, CustomerStats } from '@/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/useToast';
import { Plus, Pencil, Loader2, Eye, Users, Building2, UserCheck, Shield } from 'lucide-react';

export function CustomersPage() {
  const { getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerType: 'INDIVIDUAL',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    branchId: 0,
    gender: 'MALE',
    idType: 'PASSPORT',
    idNumber: '',
    riskRating: 'LOW',
  });

  useEffect(() => {
    loadData();
    loadBranches();
    loadStats();
  }, [currentPage, filterStatus, searchKeyword]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll({
        keyword: searchKeyword || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setCustomers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
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

  const loadStats = async () => {
    try {
      const response = await customerApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await customerApi.create(formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Customer created successfully' });
        setIsCreateDialogOpen(false);
        loadData();
        loadStats();
        resetForm();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create customer', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;
    try {
      const response = await customerApi.update(selectedCustomer.id, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Customer updated successfully' });
        setIsEditDialogOpen(false);
        loadData();
        resetForm();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update customer', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      customerType: activeTab === 'individual' ? 'INDIVIDUAL' : 'CORPORATE',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      branchId: 0,
      gender: 'MALE',
      idType: 'PASSPORT',
      idNumber: '',
      riskRating: 'LOW',
    });
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerType: customer.customerType,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      middleName: customer.middleName || undefined,
      companyName: customer.companyName || undefined,
      companyNameCn: customer.companyNameCn || undefined,
      email: customer.email || '',
      mobile: customer.mobile || customer.mobilePhone || '',
      branchId: customer.branchId || 0,
      gender: customer.gender || 'MALE',
      idType: customer.idType || 'PASSPORT',
      idNumber: customer.idNumber || '',
      riskRating: customer.riskRating || 'LOW',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    const colors: Record<CustomerStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLOCKED: 'bg-red-100 text-red-800',
      PENDING_KYC: 'bg-yellow-100 text-yellow-800',
      DECEASED: 'bg-gray-300 text-gray-600',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const filteredCustomers = customers.filter(c => 
    activeTab === 'individual' ? c.customerType === 'INDIVIDUAL' : c.customerType === 'CORPORATE'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Customer Management', '客户管理')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage individual and corporate customers', '管理个人和企业客户')}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('New Customer', '新建客户')}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{getBilingual('Total Customers', '客户总数')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{getBilingual('Individual', '个人客户')}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.individualCustomers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{getBilingual('Corporate', '企业客户')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.corporateCustomers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{getBilingual('Active', '活跃客户')}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCustomers || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'individual' | 'corporate')}>
        <TabsList>
          <TabsTrigger value="individual">{getBilingual('Individual Customers', '个人客户')}</TabsTrigger>
          <TabsTrigger value="corporate">{getBilingual('Corporate Customers', '企业客户')}</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={getBilingual('Search by name, email, or customer number...', '按姓名、邮箱或客户号搜索...')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CustomerStatus | '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={getBilingual('Filter by status', '按状态筛选')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getBilingual('All Status', '所有状态')}</SelectItem>
                <SelectItem value="ACTIVE">{getBilingual('Active', '活跃')}</SelectItem>
                <SelectItem value="INACTIVE">{getBilingual('Inactive', '未激活')}</SelectItem>
                <SelectItem value="BLOCKED">{getBilingual('Blocked', '已冻结')}</SelectItem>
                <SelectItem value="PENDING_KYC">{getBilingual('Pending KYC', '待KYC')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                    <TableHead>{getBilingual('Mobile', '手机')}</TableHead>
                    <TableHead>{getBilingual('Branch', '分行')}</TableHead>
                    <TableHead>{getBilingual('Status', '状态')}</TableHead>
                    <TableHead>{getBilingual('Actions', '操作')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {getBilingual('No customers found', '未找到客户')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{customer.displayName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.mobile || customer.mobilePhone}</TableCell>
                        <TableCell>{customer.branchName}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(customer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(customer)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="corporate" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={getBilingual('Search by company name or customer number...', '按公司名称或客户号搜索...')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CustomerStatus | '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={getBilingual('Filter by status', '按状态筛选')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getBilingual('All Status', '所有状态')}</SelectItem>
                <SelectItem value="ACTIVE">{getBilingual('Active', '活跃')}</SelectItem>
                <SelectItem value="INACTIVE">{getBilingual('Inactive', '未激活')}</SelectItem>
                <SelectItem value="BLOCKED">{getBilingual('Blocked', '已冻结')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                    <TableHead>{getBilingual('Company Name', '公司名称')}</TableHead>
                    <TableHead>{getBilingual('Email', '邮箱')}</TableHead>
                    <TableHead>{getBilingual('Phone', '电话')}</TableHead>
                    <TableHead>{getBilingual('Branch', '分行')}</TableHead>
                    <TableHead>{getBilingual('Status', '状态')}</TableHead>
                    <TableHead>{getBilingual('Actions', '操作')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {getBilingual('No corporate customers found', '未找到企业客户')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{getBilingual(customer.companyName || '', customer.companyNameCn)}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || customer.mobile}</TableCell>
                        <TableCell>{customer.branchName}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(customer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(customer)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Create New Customer', '新建客户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Fill in the customer information below', '请填写以下客户信息')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{getBilingual('Customer Type', '客户类型')}</Label>
                <Select
                  value={formData.customerType}
                  onValueChange={(v) => setFormData({ ...formData, customerType: v as CustomerType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">{getBilingual('Individual', '个人')}</SelectItem>
                    <SelectItem value="CORPORATE">{getBilingual('Corporate', '企业')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{getBilingual('Branch', '分行')}</Label>
                <Select
                  value={formData.branchId?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, branchId: parseInt(v) })}
                >
                  <SelectTrigger>
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
            </div>

            {formData.customerType === 'INDIVIDUAL' ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{getBilingual('First Name', '名')}</Label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{getBilingual('Middle Name', '中间名')}</Label>
                    <Input
                      value={formData.middleName || ''}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{getBilingual('Last Name', '姓')}</Label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{getBilingual('Gender', '性别')}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => setFormData({ ...formData, gender: v as Gender })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">{getBilingual('Male', '男')}</SelectItem>
                        <SelectItem value="FEMALE">{getBilingual('Female', '女')}</SelectItem>
                        <SelectItem value="OTHER">{getBilingual('Other', '其他')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{getBilingual('Date of Birth', '出生日期')}</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{getBilingual('Company Name', '公司名称')}</Label>
                  <Input
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getBilingual('Company Name (Chinese)', '公司中文名称')}</Label>
                  <Input
                    value={formData.companyNameCn || ''}
                    onChange={(e) => setFormData({ ...formData, companyNameCn: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{getBilingual('ID Type', '证件类型')}</Label>
                <Select
                  value={formData.idType}
                  onValueChange={(v) => setFormData({ ...formData, idType: v as IdType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">{getBilingual('Passport', '护照')}</SelectItem>
                    <SelectItem value="NATIONAL_ID">{getBilingual('National ID', '身份证')}</SelectItem>
                    <SelectItem value="DRIVERS_LICENSE">{getBilingual("Driver's License", '驾照')}</SelectItem>
                    <SelectItem value="SSS">SSS</SelectItem>
                    <SelectItem value="GSIS">GSIS</SelectItem>
                    <SelectItem value="TIN">TIN</SelectItem>
                    <SelectItem value="COMPANY_ID">{getBilingual('Company ID', '公司证件')}</SelectItem>
                    <SelectItem value="OTHER">{getBilingual('Other', '其他')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{getBilingual('ID Number', '证件号码')}</Label>
                <Input
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{getBilingual('Email', '邮箱')}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{getBilingual('Mobile Number', '手机号码')}</Label>
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{getBilingual('Risk Rating', '风险等级')}</Label>
              <Select
                value={formData.riskRating}
                onValueChange={(v) => setFormData({ ...formData, riskRating: v as RiskRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{getBilingual('Low', '低')}</SelectItem>
                  <SelectItem value="MEDIUM">{getBilingual('Medium', '中')}</SelectItem>
                  <SelectItem value="HIGH">{getBilingual('High', '高')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleCreate}>
              {getBilingual('Create', '创建')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Edit Customer', '编辑客户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Update customer information', '更新客户信息')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{getBilingual('Email', '邮箱')}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{getBilingual('Mobile Number', '手机号码')}</Label>
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{getBilingual('Risk Rating', '风险等级')}</Label>
              <Select
                value={formData.riskRating}
                onValueChange={(v) => setFormData({ ...formData, riskRating: v as RiskRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{getBilingual('Low', '低')}</SelectItem>
                  <SelectItem value="MEDIUM">{getBilingual('Medium', '中')}</SelectItem>
                  <SelectItem value="HIGH">{getBilingual('High', '高')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleUpdate}>
              {getBilingual('Save', '保存')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getBilingual('Customer Details', '客户详情')}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Customer Number', '客户号')}</Label>
                  <p className="font-mono">{selectedCustomer.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                  <p>{getStatusBadge(selectedCustomer.status)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Name', '姓名')}</Label>
                  <p>{selectedCustomer.displayName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Email', '邮箱')}</Label>
                  <p>{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Mobile', '手机')}</Label>
                  <p>{selectedCustomer.mobile || selectedCustomer.mobilePhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Branch', '分行')}</Label>
                  <p>{selectedCustomer.branchName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Type', '证件类型')}</Label>
                  <p>{selectedCustomer.idType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Number', '证件号码')}</Label>
                  <p>{selectedCustomer.idNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Risk Rating', '风险等级')}</Label>
                  <p>{selectedCustomer.riskRating}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Created At', '创建时间')}</Label>
                  <p>{new Date(selectedCustomer.createdAt).toLocaleString()}</p>
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
