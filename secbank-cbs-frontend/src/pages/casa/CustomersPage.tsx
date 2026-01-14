import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi, branchApi } from '@/lib/api';
import { Customer, CreateCustomerRequest, CustomerType, CustomerStatus, Gender, IdType, RiskRating, Branch, CustomerStats } from '@/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/useToast';
import { getStatusColor } from '@/lib/utils';
import { Plus, Pencil, Search, Loader2, Eye, Users, Building2, UserCheck, Shield } from 'lucide-react';

export function CustomersPage() {
  const { t, language, getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<CustomerType | ''>('');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCustomerRequest>>({});
  const [submitting, setSubmitting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');

  useEffect(() => {
    loadData();
    loadBranches();
    loadStats();
  }, [currentPage, filterType, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll({
        keyword: searchKeyword || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setCustomers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setCustomers([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err?.message || 'Failed to load customers');
      setCustomers([]);
      toast({
        title: language === 'en' ? 'Failed to load data' : '加载数据失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchApi.getActive();
      if (response.success && response.data) {
        setBranches(response.data);
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

  const handleSearch = async () => {
    setCurrentPage(0);
    loadData();
  };

  const handleCreate = async () => {
    if (!formData.customerType || !formData.idType || !formData.idNumber || !formData.branchId) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await customerApi.create(formData as CreateCustomerRequest);
      if (response.success) {
        toast({
          title: language === 'en' ? 'Customer created successfully' : '客户创建成功',
        });
        setIsCreateDialogOpen(false);
        setFormData({});
        loadData();
        loadStats();
      }
    } catch (err: any) {
      toast({
        title: language === 'en' ? 'Failed to create customer' : '创建客户失败',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      const response = await customerApi.update(selectedCustomer.id, formData);
      if (response.success) {
        toast({
          title: language === 'en' ? 'Customer updated successfully' : '客户更新成功',
        });
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
        setFormData({});
        loadData();
      }
    } catch (err: any) {
      toast({
        title: language === 'en' ? 'Failed to update customer' : '更新客户失败',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = (type: CustomerType) => {
    setFormData({ 
      customerType: type,
      riskRating: 'LOW',
    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || undefined,
      middleName: customer.middleName || undefined,
      lastName: customer.lastName || undefined,
      firstNameCn: customer.firstNameCn || undefined,
      lastNameCn: customer.lastNameCn || undefined,
      companyName: customer.companyName || undefined,
      companyNameCn: customer.companyNameCn || undefined,
      email: customer.email || undefined,
      mobilePhone: customer.mobilePhone || undefined,
      addressLine1: customer.addressLine1 || undefined,
      city: customer.city || undefined,
      province: customer.province || undefined,
      country: customer.country || undefined,
      idType: customer.idType || undefined,
      idNumber: customer.idNumber || undefined,
      riskRating: customer.riskRating || undefined,
      branchId: customer.branchId || undefined,
      remarks: customer.remarks || undefined,
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
    return <Badge className={colors[status]}>{status}</Badge>;
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
              <Users className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">{getBilingual('KYC Verified', 'KYC已验证')}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.kycVerifiedCustomers || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'individual' | 'corporate')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="individual">
              <Users className="h-4 w-4 mr-2" />
              {getBilingual('Individual', '个人客户')}
            </TabsTrigger>
            <TabsTrigger value="corporate">
              <Building2 className="h-4 w-4 mr-2" />
              {getBilingual('Corporate', '企业客户')}
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => openCreateDialog(activeTab === 'individual' ? 'INDIVIDUAL' : 'CORPORATE')}>
            <Plus className="h-4 w-4 mr-2" />
            {getBilingual('Add Customer', '添加客户')}
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={language === 'en' ? 'Search by name, customer number, ID...' : '按姓名、客户号、证件号搜索...'}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CustomerStatus | '')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{language === 'en' ? 'All Status' : '全部状态'}</SelectItem>
                  <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                  <SelectItem value="INACTIVE">{language === 'en' ? 'Inactive' : '非活跃'}</SelectItem>
                  <SelectItem value="BLOCKED">{language === 'en' ? 'Blocked' : '已冻结'}</SelectItem>
                  <SelectItem value="PENDING_KYC">{language === 'en' ? 'Pending KYC' : '待KYC'}</SelectItem>
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
        <TabsContent value="individual" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {getBilingual('No customers found', '暂无客户')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{getBilingual('Customer No.', '客户号')}</TableHead>
                      <TableHead>{getBilingual('Name', '姓名')}</TableHead>
                      <TableHead>{getBilingual('ID Type', '证件类型')}</TableHead>
                      <TableHead>{getBilingual('ID Number', '证件号码')}</TableHead>
                      <TableHead>{getBilingual('Mobile', '手机')}</TableHead>
                      <TableHead>{getBilingual('Status', '状态')}</TableHead>
                      <TableHead>{getBilingual('Actions', '操作')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{customer.displayName}</TableCell>
                        <TableCell>{customer.idType}</TableCell>
                        <TableCell className="font-mono">{customer.idNumber}</TableCell>
                        <TableCell>{customer.mobilePhone || customer.mobile || '-'}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corporate" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {getBilingual('No customers found', '暂无客户')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{getBilingual('Customer No.', '客户号')}</TableHead>
                      <TableHead>{getBilingual('Company Name', '公司名称')}</TableHead>
                      <TableHead>{getBilingual('Registration No.', '注册号')}</TableHead>
                      <TableHead>{getBilingual('Industry', '行业')}</TableHead>
                      <TableHead>{getBilingual('Contact', '联系方式')}</TableHead>
                      <TableHead>{getBilingual('Status', '状态')}</TableHead>
                      <TableHead>{getBilingual('Actions', '操作')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{customer.companyName}</TableCell>
                        <TableCell className="font-mono">{customer.registrationNumber || '-'}</TableCell>
                        <TableCell>{customer.industry || '-'}</TableCell>
                        <TableCell>{customer.mobilePhone || customer.mobile || customer.email || '-'}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <DialogTitle>
              {formData.customerType === 'INDIVIDUAL' 
                ? getBilingual('Add Individual Customer', '添加个人客户')
                : getBilingual('Add Corporate Customer', '添加企业客户')
              }
            </DialogTitle>
            <DialogDescription>
              {getBilingual('Fill in the customer information below', '请填写以下客户信息')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {formData.customerType === 'INDIVIDUAL' ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{getBilingual('First Name', '名')} *</Label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{getBilingual('Middle Name', '中间名')}</Label>
                    <Input
                      value={formData.middleName || ''}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{getBilingual('Last Name', '姓')} *</Label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{getBilingual('Gender', '性别')}</Label>
                    <Select value={formData.gender || ''} onValueChange={(v) => setFormData({...formData, gender: v as Gender})}>
                      <SelectTrigger>
                        <SelectValue placeholder={getBilingual('Select gender', '选择性别')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">{getBilingual('Male', '男')}</SelectItem>
                        <SelectItem value="FEMALE">{getBilingual('Female', '女')}</SelectItem>
                        <SelectItem value="OTHER">{getBilingual('Other', '其他')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{getBilingual('Date of Birth', '出生日期')}</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{getBilingual('Company Name', '公司名称')} *</Label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{getBilingual('Company Name (Chinese)', '公司名称（中文）')}</Label>
                    <Input
                      value={formData.companyNameCn || ''}
                      onChange={(e) => setFormData({...formData, companyNameCn: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{getBilingual('Registration Number', '注册号')}</Label>
                    <Input
                      value={formData.registrationNumber || ''}
                      onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{getBilingual('Industry', '行业')}</Label>
                    <Input
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ID Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('ID Type', '证件类型')} *</Label>
                <Select value={formData.idType || ''} onValueChange={(v) => setFormData({...formData, idType: v as IdType})}>
                  <SelectTrigger>
                    <SelectValue placeholder={getBilingual('Select ID type', '选择证件类型')} />
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
              <div>
                <Label>{getBilingual('ID Number', '证件号码')} *</Label>
                <Input
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Email', '邮箱')}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Mobile Phone', '手机号码')}</Label>
                <Input
                  value={formData.mobilePhone || ''}
                  onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label>{getBilingual('Address', '地址')}</Label>
              <Input
                value={formData.addressLine1 || ''}
                onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{getBilingual('City', '城市')}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Province', '省份')}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Country', '国家')}</Label>
                <Input
                  value={formData.country || ''}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Philippines"
                />
              </div>
            </div>

            {/* Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Branch', '分行')} *</Label>
                <Select value={formData.branchId?.toString() || ''} onValueChange={(v) => setFormData({...formData, branchId: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue placeholder={getBilingual('Select branch', '选择分行')} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branchName} {branch.branchNameCn ? `/ ${branch.branchNameCn}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{getBilingual('Risk Rating', '风险等级')}</Label>
                <Select value={formData.riskRating || 'LOW'} onValueChange={(v) => setFormData({...formData, riskRating: v as RiskRating})}>
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

            {/* Remarks */}
            <div>
              <Label>{getBilingual('Remarks', '备注')}</Label>
              <Textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
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
                  <Label className="text-muted-foreground">{getBilingual('Type', '类型')}</Label>
                  <p>{selectedCustomer.customerType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Type', '证件类型')}</Label>
                  <p>{selectedCustomer.idType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Number', '证件号码')}</Label>
                  <p className="font-mono">{selectedCustomer.idNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Email', '邮箱')}</Label>
                  <p>{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Mobile', '手机')}</Label>
                  <p>{selectedCustomer.mobilePhone || selectedCustomer.mobile || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{getBilingual('Address', '地址')}</Label>
                <p>{[selectedCustomer.addressLine1, selectedCustomer.city, selectedCustomer.province, selectedCustomer.country].filter(Boolean).join(', ') || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Risk Rating', '风险等级')}</Label>
                  <p>{selectedCustomer.riskRating || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('KYC Verified', 'KYC验证')}</Label>
                  <p>{selectedCustomer.kycVerified ? getBilingual('Yes', '是') : getBilingual('No', '否')}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{getBilingual('Remarks', '备注')}</Label>
                <p>{selectedCustomer.remarks || '-'}</p>
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

      {/* Edit Dialog - Similar to Create but with update */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Edit Customer', '编辑客户')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{getBilingual('Email', '邮箱')}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Mobile Phone', '手机号码')}</Label>
                <Input
                  value={formData.mobilePhone || ''}
                  onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
                />
              </div>
            </div>
            {/* Address */}
            <div>
              <Label>{getBilingual('Address', '地址')}</Label>
              <Input
                value={formData.addressLine1 || ''}
                onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{getBilingual('City', '城市')}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Province', '省份')}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                />
              </div>
              <div>
                <Label>{getBilingual('Country', '国家')}</Label>
                <Input
                  value={formData.country || ''}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>{getBilingual('Remarks', '备注')}</Label>
              <Textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {getBilingual('Cancel', '取消')}
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBilingual('Save', '保存')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
