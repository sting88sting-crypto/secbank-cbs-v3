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

  useEffect(() => {
    loadData();
  }, [currentPage, filterType, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersRes, branchesRes] = await Promise.all([
        customerApi.getAll({
          keyword: searchKeyword || undefined,
          type: filterType || undefined,
          status: filterStatus || undefined,
          page: currentPage,
          size: 20,
        }),
        branchApi.getActive(),
      ]);
      setCustomers(customersRes.data.content);
      setTotalPages(customersRes.data.totalPages);
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
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
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
        title: language === 'en' ? 'Operation failed' : '操作失败',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyKyc = async (customer: Customer) => {
    try {
      await customerApi.verifyKyc(customer.id);
      toast({
        title: language === 'en' ? 'KYC verified successfully' : 'KYC验证成功',
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

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || '',
      middleName: customer.middleName || '',
      lastName: customer.lastName || '',
      firstNameCn: customer.firstNameCn || '',
      lastNameCn: customer.lastNameCn || '',
      dateOfBirth: customer.dateOfBirth || '',
      gender: customer.gender || undefined,
      nationality: customer.nationality || '',
      companyName: customer.companyName || '',
      companyNameCn: customer.companyNameCn || '',
      registrationNumber: customer.registrationNumber || '',
      dateOfIncorporation: customer.dateOfIncorporation || '',
      industry: customer.industry || '',
      email: customer.email || '',
      mobilePhone: customer.mobilePhone || '',
      homePhone: customer.homePhone || '',
      workPhone: customer.workPhone || '',
      addressLine1: customer.addressLine1 || '',
      addressLine2: customer.addressLine2 || '',
      city: customer.city || '',
      province: customer.province || '',
      postalCode: customer.postalCode || '',
      country: customer.country || '',
      idType: customer.idType || undefined,
      idNumber: customer.idNumber || '',
      idExpiryDate: customer.idExpiryDate || '',
      taxId: customer.taxId || '',
      riskRating: customer.riskRating || undefined,
      remarks: customer.remarks || '',
    });
    setIsEditDialogOpen(true);
  };

  const getCustomerTypeColor = (type: CustomerType) => {
    return type === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getKycBadge = (verified: boolean) => {
    return verified 
      ? <Badge className="bg-green-100 text-green-800">{language === 'en' ? 'Verified' : '已验证'}</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800">{language === 'en' ? 'Pending' : '待验证'}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{language === 'en' ? 'Customer Management' : '客户管理'}</h1>
          <p className="text-gray-500">
            {language === 'en' ? 'Manage individual and corporate customers' : '管理个人和企业客户'}
          </p>
        </div>
        <Button onClick={() => { setFormData({}); setCustomerType('INDIVIDUAL'); setIsCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'New Customer' : '新建客户'}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={language === 'en' ? 'Search by name, CIF, email, phone...' : '按姓名、CIF、邮箱、电话搜索...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as CustomerType | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Type' : '类型'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Types' : '所有类型'}</SelectItem>
                <SelectItem value="INDIVIDUAL">{language === 'en' ? 'Individual' : '个人'}</SelectItem>
                <SelectItem value="CORPORATE">{language === 'en' ? 'Corporate' : '企业'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CustomerStatus | '')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'en' ? 'Status' : '状态'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === 'en' ? 'All Status' : '所有状态'}</SelectItem>
                <SelectItem value="ACTIVE">{language === 'en' ? 'Active' : '活跃'}</SelectItem>
                <SelectItem value="INACTIVE">{language === 'en' ? 'Inactive' : '不活跃'}</SelectItem>
                <SelectItem value="BLOCKED">{language === 'en' ? 'Blocked' : '已锁定'}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
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
                    <TableHead>{language === 'en' ? 'CIF Number' : 'CIF号'}</TableHead>
                    <TableHead>{language === 'en' ? 'Name' : '名称'}</TableHead>
                    <TableHead>{language === 'en' ? 'Type' : '类型'}</TableHead>
                    <TableHead>{language === 'en' ? 'Contact' : '联系方式'}</TableHead>
                    <TableHead>{language === 'en' ? 'Branch' : '分行'}</TableHead>
                    <TableHead>{language === 'en' ? 'KYC' : 'KYC'}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.displayName}</div>
                            {customer.displayNameCn && (
                              <div className="text-sm text-gray-500">{customer.displayNameCn}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCustomerTypeColor(customer.customerType)}>
                            {customer.customerType === 'INDIVIDUAL' 
                              ? (language === 'en' ? 'Individual' : '个人')
                              : (language === 'en' ? 'Corporate' : '企业')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {customer.mobilePhone && <div>{customer.mobilePhone}</div>}
                            {customer.email && <div className="text-gray-500">{customer.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{customer.branchName || '-'}</TableCell>
                        <TableCell>{getKycBadge(customer.kycVerified)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedCustomer(customer); setIsViewDialogOpen(true); }}
                              title={language === 'en' ? 'View' : '查看'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(customer)}
                              title={language === 'en' ? 'Edit' : '编辑'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!customer.kycVerified && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleVerifyKyc(customer)}
                                title={language === 'en' ? 'Verify KYC' : '验证KYC'}
                              >
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                              </Button>
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

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Create New Customer' : '创建新客户'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Enter customer information to create a new CIF' : '输入客户信息以创建新的CIF'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={customerType} onValueChange={(v) => setCustomerType(v as CustomerType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="INDIVIDUAL">
                <Users className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Individual' : '个人'}
              </TabsTrigger>
              <TabsTrigger value="CORPORATE">
                <Building2 className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Corporate' : '企业'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="INDIVIDUAL" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'First Name' : '名'} *</Label>
                  <Input
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Middle Name' : '中间名'}</Label>
                  <Input
                    value={formData.middleName || ''}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Last Name' : '姓'} *</Label>
                  <Input
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Date of Birth' : '出生日期'}</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Gender' : '性别'}</Label>
                  <Select value={formData.gender || ''} onValueChange={(v) => setFormData({ ...formData, gender: v as Gender })}>
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
              </div>
              <div>
                <Label>{language === 'en' ? 'Nationality' : '国籍'}</Label>
                <Input
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g., Filipino, Chinese"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="CORPORATE" className="space-y-4 mt-4">
              <div>
                <Label>{language === 'en' ? 'Company Name' : '公司名称'} *</Label>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Company Name (Chinese)' : '公司名称（中文）'}</Label>
                <Input
                  value={formData.companyNameCn || ''}
                  onChange={(e) => setFormData({ ...formData, companyNameCn: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Registration Number' : '注册号'}</Label>
                  <Input
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Date of Incorporation' : '成立日期'}</Label>
                  <Input
                    type="date"
                    value={formData.dateOfIncorporation || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfIncorporation: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{language === 'en' ? 'Industry' : '行业'}</Label>
                <Input
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Manufacturing, Retail, Technology"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Common fields */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-medium">{language === 'en' ? 'Identification' : '身份信息'}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'ID Type' : '证件类型'} *</Label>
                <Select value={formData.idType || ''} onValueChange={(v) => setFormData({ ...formData, idType: v as IdType })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select ID type' : '选择证件类型'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">{language === 'en' ? 'Passport' : '护照'}</SelectItem>
                    <SelectItem value="NATIONAL_ID">{language === 'en' ? 'National ID' : '身份证'}</SelectItem>
                    <SelectItem value="DRIVERS_LICENSE">{language === 'en' ? "Driver's License" : '驾照'}</SelectItem>
                    <SelectItem value="SSS">SSS</SelectItem>
                    <SelectItem value="GSIS">GSIS</SelectItem>
                    <SelectItem value="TIN">TIN</SelectItem>
                    <SelectItem value="COMPANY_ID">{language === 'en' ? 'Company ID' : '公司证件'}</SelectItem>
                    <SelectItem value="OTHER">{language === 'en' ? 'Other' : '其他'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'en' ? 'ID Number' : '证件号码'} *</Label>
                <Input
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'ID Expiry Date' : '证件有效期'}</Label>
                <Input
                  type="date"
                  value={formData.idExpiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, idExpiryDate: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Tax ID (TIN)' : '税号'}</Label>
                <Input
                  value={formData.taxId || ''}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Contact Information' : '联系信息'}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Mobile Phone' : '手机'}</Label>
                <Input
                  value={formData.mobilePhone || ''}
                  onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Email' : '邮箱'}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Address' : '地址'}</h4>
            <div>
              <Label>{language === 'en' ? 'Address Line 1' : '地址行1'}</Label>
              <Input
                value={formData.addressLine1 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{language === 'en' ? 'City' : '城市'}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Province' : '省份'}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Postal Code' : '邮编'}</Label>
                <Input
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Branch & Risk' : '分行与风险'}</h4>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>{language === 'en' ? 'Risk Rating' : '风险等级'}</Label>
                <Select value={formData.riskRating || ''} onValueChange={(v) => setFormData({ ...formData, riskRating: v as RiskRating })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select risk rating' : '选择风险等级'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{language === 'en' ? 'Low' : '低'}</SelectItem>
                    <SelectItem value="MEDIUM">{language === 'en' ? 'Medium' : '中'}</SelectItem>
                    <SelectItem value="HIGH">{language === 'en' ? 'High' : '高'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.create')}
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
                  <Label className="text-gray-500">{language === 'en' ? 'CIF Number' : 'CIF号'}</Label>
                  <p className="font-mono">{selectedCustomer.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Type' : '类型'}</Label>
                  <p>
                    <Badge className={getCustomerTypeColor(selectedCustomer.customerType)}>
                      {selectedCustomer.customerType === 'INDIVIDUAL' 
                        ? (language === 'en' ? 'Individual' : '个人')
                        : (language === 'en' ? 'Corporate' : '企业')}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Name' : '名称'}</Label>
                  <p className="font-medium">{selectedCustomer.displayName}</p>
                  {selectedCustomer.displayNameCn && <p className="text-sm text-gray-500">{selectedCustomer.displayNameCn}</p>}
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Status' : '状态'}</Label>
                  <p><Badge className={getStatusColor(selectedCustomer.status)}>{selectedCustomer.status}</Badge></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'ID Type / Number' : '证件类型/号码'}</Label>
                  <p>{selectedCustomer.idType}: {selectedCustomer.idNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'KYC Status' : 'KYC状态'}</Label>
                  <p>{getKycBadge(selectedCustomer.kycVerified)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Mobile' : '手机'}</Label>
                  <p>{selectedCustomer.mobilePhone || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Email' : '邮箱'}</Label>
                  <p>{selectedCustomer.email || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">{language === 'en' ? 'Address' : '地址'}</Label>
                <p>
                  {[selectedCustomer.addressLine1, selectedCustomer.city, selectedCustomer.province, selectedCustomer.postalCode]
                    .filter(Boolean).join(', ') || '-'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Branch' : '分行'}</Label>
                  <p>{selectedCustomer.branchName || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Risk Rating' : '风险等级'}</Label>
                  <p>{selectedCustomer.riskRating || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Created At' : '创建时间'}</Label>
                  <p>{formatDate(selectedCustomer.createdAt, language)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{language === 'en' ? 'Updated At' : '更新时间'}</Label>
                  <p>{formatDate(selectedCustomer.updatedAt, language)}</p>
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

      {/* Edit Customer Dialog - Similar to Create but for editing */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Customer' : '编辑客户'}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.customerNumber} - {selectedCustomer?.displayName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer?.customerType === 'INDIVIDUAL' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'en' ? 'First Name' : '名'}</Label>
                  <Input
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Middle Name' : '中间名'}</Label>
                  <Input
                    value={formData.middleName || ''}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Last Name' : '姓'}</Label>
                  <Input
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>{language === 'en' ? 'Company Name' : '公司名称'}</Label>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Contact Information' : '联系信息'}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Mobile Phone' : '手机'}</Label>
                <Input
                  value={formData.mobilePhone || ''}
                  onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Email' : '邮箱'}</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Address' : '地址'}</h4>
            <div>
              <Label>{language === 'en' ? 'Address Line 1' : '地址行1'}</Label>
              <Input
                value={formData.addressLine1 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{language === 'en' ? 'City' : '城市'}</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Province' : '省份'}</Label>
                <Input
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Postal Code' : '邮编'}</Label>
                <Input
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">{language === 'en' ? 'Risk' : '风险'}</h4>
            <div>
              <Label>{language === 'en' ? 'Risk Rating' : '风险等级'}</Label>
              <Select value={formData.riskRating || ''} onValueChange={(v) => setFormData({ ...formData, riskRating: v as RiskRating })}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select risk rating' : '选择风险等级'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{language === 'en' ? 'Low' : '低'}</SelectItem>
                  <SelectItem value="MEDIUM">{language === 'en' ? 'Medium' : '中'}</SelectItem>
                  <SelectItem value="HIGH">{language === 'en' ? 'High' : '高'}</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}
