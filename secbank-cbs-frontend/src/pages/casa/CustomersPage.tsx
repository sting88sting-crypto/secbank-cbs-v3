import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi, branchApi } from '@/lib/api';
import { Customer, Branch, CreateCustomerRequest, UpdateCustomerRequest, CustomerType, CustomerStatus, Gender, IdType, RiskRating } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Pencil, Search, Loader2, Users, Building2, ShieldCheck, Eye } from 'lucide-react';

export function CustomersPage() {
  const { t, language, getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<CustomerType | ''>('');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCustomerRequest>>({});
  const [submitting, setSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType>('INDIVIDUAL');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [stats, setStats] = useState({ total: 0, individual: 0, corporate: 0, kycVerified: 0 });

  useEffect(() => {
    loadData();
  }, [currentPage, filterType, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersRes, branchesRes, statsRes] = await Promise.all([
        customerApi.getAll({
          keyword: searchKeyword || undefined,
          type: filterType || undefined,
          status: filterStatus || undefined,
          page: currentPage,
          size: 20,
        }),
        branchApi.getActive(),
        customerApi.getStats(),
      ]);
      setCustomers(customersRes.data.content);
      setTotalPages(customersRes.data.totalPages);
      setBranches(branchesRes.data);
      if (statsRes.data) {
        setStats({
          total: statsRes.data.totalCustomers || 0,
          individual: statsRes.data.individualCustomers || 0,
          corporate: statsRes.data.corporateCustomers || 0,
          kycVerified: statsRes.data.kycVerifiedCustomers || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
    if (!formData.idType || !formData.idNumber || !formData.branchId) {
      toast({
        title: language === 'en' ? 'Please fill in required fields' : '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }
    
    if (customerType === 'INDIVIDUAL' && (!formData.firstName || !formData.lastName)) {
      toast({
        title: language === 'en' ? 'First name and last name are required' : '名和姓必填',
        variant: 'destructive',
      });
      return;
    }
    
    if (customerType === 'CORPORATE' && !formData.companyName) {
      toast({
        title: language === 'en' ? 'Company name is required' : '公司名称必填',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await customerApi.create({
        ...formData,
        customerType,
      } as CreateCustomerRequest);
      toast({
        title: language === 'en' ? 'Customer created successfully' : '客户创建成功',
        variant: 'success',
      });
      setIsCreateDialogOpen(false);
      setFormData({});
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Failed to create customer' : '创建客户失败',
        description: error.response?.data?.message || '',
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
      await customerApi.update(selectedCustomer.id, formData as UpdateCustomerRequest);
      toast({
        title: language === 'en' ? 'Customer updated successfully' : '客户更新成功',
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      setFormData({});
      loadData();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Failed to update customer' : '更新客户失败',
        description: error.response?.data?.message || '',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      middleName: customer.middleName || '',
      companyName: customer.companyName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      address: customer.address || '',
      city: customer.city || '',
      province: customer.province || '',
      postalCode: customer.postalCode || '',
      country: customer.country || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const getCustomerDisplayName = (customer: Customer) => {
    if (customer.customerType === 'CORPORATE') {
      return customer.companyName || '-';
    }
    return `${customer.firstName || ''} ${customer.middleName || ''} ${customer.lastName || ''}`.trim() || '-';
  };

  const individualCustomers = customers.filter(c => c.customerType === 'INDIVIDUAL');
  const corporateCustomers = customers.filter(c => c.customerType === 'CORPORATE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Customer Management' : '客户管理'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage individual and corporate customers' : '管理个人和企业客户'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'New Customer' : '新建客户'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Total Customers' : '总客户数'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Individual' : '个人客户'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.individual}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Corporate' : '企业客户'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.corporate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'KYC Verified' : 'KYC已验证'}
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kycVerified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder={language === 'en' ? 'Search by name, ID, or customer number...' : '按姓名、证件号或客户号搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CustomerStatus | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Status' : '全部状态'}</SelectItem>
                <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                <SelectItem value="INACTIVE">{language === 'en' ? 'Inactive' : '未激活'}</SelectItem>
                <SelectItem value="BLOCKED">{language === 'en' ? 'Blocked' : '已冻结'}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Search' : '搜索'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Tabs */}
      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">
            <Users className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Individual' : '个人客户'} ({individualCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="corporate">
            <Building2 className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Corporate' : '企业客户'} ({corporateCustomers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : individualCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No individual customers found' : '未找到个人客户'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Customer No.' : '客户号'}</TableHead>
                      <TableHead>{language === 'en' ? 'Name' : '姓名'}</TableHead>
                      <TableHead>{language === 'en' ? 'ID Type' : '证件类型'}</TableHead>
                      <TableHead>{language === 'en' ? 'ID Number' : '证件号码'}</TableHead>
                      <TableHead>{language === 'en' ? 'Phone' : '电话'}</TableHead>
                      <TableHead>{language === 'en' ? 'Branch' : '分行'}</TableHead>
                      <TableHead>{language === 'en' ? 'Status' : '状态'}</TableHead>
                      <TableHead>{language === 'en' ? 'KYC' : 'KYC'}</TableHead>
                      <TableHead>{language === 'en' ? 'Actions' : '操作'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{getCustomerDisplayName(customer)}</TableCell>
                        <TableCell>{customer.idType}</TableCell>
                        <TableCell className="font-mono">{customer.idNumber}</TableCell>
                        <TableCell>{customer.mobile || customer.phone || '-'}</TableCell>
                        <TableCell>{customer.branchName || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.kycVerified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
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

        <TabsContent value="corporate">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : corporateCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No corporate customers found' : '未找到企业客户'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Customer No.' : '客户号'}</TableHead>
                      <TableHead>{language === 'en' ? 'Company Name' : '公司名称'}</TableHead>
                      <TableHead>{language === 'en' ? 'Registration No.' : '注册号'}</TableHead>
                      <TableHead>{language === 'en' ? 'Phone' : '电话'}</TableHead>
                      <TableHead>{language === 'en' ? 'Branch' : '分行'}</TableHead>
                      <TableHead>{language === 'en' ? 'Status' : '状态'}</TableHead>
                      <TableHead>{language === 'en' ? 'KYC' : 'KYC'}</TableHead>
                      <TableHead>{language === 'en' ? 'Actions' : '操作'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {corporateCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>{customer.companyName}</TableCell>
                        <TableCell className="font-mono">{customer.idNumber}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>{customer.branchName || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.kycVerified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
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

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Create New Customer' : '创建新客户'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Fill in the customer details below' : '请填写以下客户信息'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Customer Type Selection */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Customer Type' : '客户类型'}</Label>
              <Select value={customerType} onValueChange={(v) => setCustomerType(v as CustomerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">{language === 'en' ? 'Individual' : '个人'}</SelectItem>
                  <SelectItem value="CORPORATE">{language === 'en' ? 'Corporate' : '企业'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {customerType === 'INDIVIDUAL' ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'First Name' : '名'} *</Label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Middle Name' : '中间名'}</Label>
                    <Input
                      value={formData.middleName || ''}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Last Name' : '姓'} *</Label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Gender' : '性别'}</Label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(v) => setFormData({ ...formData, gender: v as Gender })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Select gender' : '选择性别'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">{language === 'en' ? 'Male' : '男'}</SelectItem>
                        <SelectItem value="FEMALE">{language === 'en' ? 'Female' : '女'}</SelectItem>
                        <SelectItem value="OTHER">{language === 'en' ? 'Other' : '其他'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Date of Birth' : '出生日期'}</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Company Name' : '公司名称'} *</Label>
                  <Input
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Business Type' : '业务类型'}</Label>
                    <Input
                      value={formData.businessType || ''}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Date of Incorporation' : '成立日期'}</Label>
                    <Input
                      type="date"
                      value={formData.dateOfIncorporation || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfIncorporation: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ID Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'ID Type' : '证件类型'} *</Label>
                <Select
                  value={formData.idType || ''}
                  onValueChange={(v) => setFormData({ ...formData, idType: v as IdType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select ID type' : '选择证件类型'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                    <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                    <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                    <SelectItem value="SSS">SSS</SelectItem>
                    <SelectItem value="GSIS">GSIS</SelectItem>
                    <SelectItem value="TIN">TIN</SelectItem>
                    <SelectItem value="COMPANY_ID">Company ID</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'ID Number' : '证件号码'} *</Label>
                <Input
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Email' : '邮箱'}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Mobile' : '手机'}</Label>
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Branch' : '分行'} *</Label>
              <Select
                value={formData.branchId?.toString() || ''}
                onValueChange={(v) => setFormData({ ...formData, branchId: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select branch' : '选择分行'} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {getBilingual(branch.name, branch.nameCn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Address' : '地址'}</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'City' : '城市'}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Province' : '省份'}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Postal Code' : '邮编'}</Label>
                <Input
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : '取消'}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Create' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Customer' : '编辑客户'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Email' : '邮箱'}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Mobile' : '手机'}</Label>
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Address' : '地址'}</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'City' : '城市'}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Province' : '省份'}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Postal Code' : '邮编'}</Label>
                <Input
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : '取消'}
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Save' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Customer Details' : '客户详情'}</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Customer Number' : '客户号'}</Label>
                  <p className="font-mono">{selectedCustomer.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Type' : '类型'}</Label>
                  <p>{selectedCustomer.customerType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Name' : '姓名'}</Label>
                  <p>{getCustomerDisplayName(selectedCustomer)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Status' : '状态'}</Label>
                  <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'ID Type' : '证件类型'}</Label>
                  <p>{selectedCustomer.idType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'ID Number' : '证件号码'}</Label>
                  <p className="font-mono">{selectedCustomer.idNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Email' : '邮箱'}</Label>
                  <p>{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Phone' : '电话'}</Label>
                  <p>{selectedCustomer.mobile || selectedCustomer.phone || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'en' ? 'Address' : '地址'}</Label>
                <p>
                  {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.province, selectedCustomer.postalCode]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Branch' : '分行'}</Label>
                  <p>{selectedCustomer.branchName || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'KYC Status' : 'KYC状态'}</Label>
                  {selectedCustomer.kycVerified ? (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Created At' : '创建时间'}</Label>
                  <p>{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'en' ? 'Updated At' : '更新时间'}</Label>
                  <p>{formatDate(selectedCustomer.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {language === 'en' ? 'Close' : '关闭'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
