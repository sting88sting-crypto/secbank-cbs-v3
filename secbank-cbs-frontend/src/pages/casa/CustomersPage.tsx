import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi, branchApi } from '@/lib/api';
import { Customer, Branch, CreateCustomerRequest, CustomerType, CustomerStatus } from '@/types';
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
import { Plus, Search, Loader2, Users, Building2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomersPage() {
  const { getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('INDIVIDUAL');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Stats
  const [individualCount, setIndividualCount] = useState(0);
  const [corporateCount, setCorporateCount] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<CreateCustomerRequest>>({
    customerType: 'INDIVIDUAL',
    gender: 'MALE',
    idType: 'NATIONAL_ID',
  });

  useEffect(() => {
    loadBranches();
    loadStats();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [currentPage, customerType]);

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
        setIndividualCount(response.data.individualCustomers || 0);
        setCorporateCount(response.data.corporateCustomers || 0);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll({
        keyword: searchKeyword || undefined,
        type: customerType,
        page: currentPage,
        size: 20,
      });
      if (response.success && response.data) {
        setCustomers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadCustomers();
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.customerType) {
      toast({ title: getBilingual('Please select customer type', '请选择客户类型'), variant: 'destructive' });
      return;
    }
    
    if (formData.customerType === 'INDIVIDUAL') {
      if (!formData.firstName || !formData.lastName) {
        toast({ title: getBilingual('Please fill in name', '请填写姓名'), variant: 'destructive' });
        return;
      }
    } else {
      if (!formData.companyName) {
        toast({ title: getBilingual('Please fill in company name', '请填写公司名称'), variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await customerApi.create(formData as CreateCustomerRequest);
      if (response.success) {
        toast({ title: getBilingual('Customer created successfully', '客户创建成功') });
        setIsCreateDialogOpen(false);
        resetForm();
        loadCustomers();
        loadStats();
      } else {
        toast({ title: response.message || getBilingual('Failed to create customer', '创建客户失败'), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Failed to create customer:', err);
      toast({ 
        title: getBilingual('Failed to create customer', '创建客户失败'),
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerType: customerType,
      gender: 'MALE',
      idType: 'NATIONAL_ID',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLOCKED: 'bg-red-100 text-red-800',
      PENDING_KYC: 'bg-yellow-100 text-yellow-800',
      DECEASED: 'bg-gray-300 text-gray-600',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{getBilingual('Customer Management', '客户管理')}</h1>
          <p className="text-muted-foreground">{getBilingual('Manage individual and corporate customers', '管理个人和企业客户')}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {getBilingual('New Customer', '新建客户')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Individual Customers', '个人客户')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Corporate Customers', '企业客户')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{corporateCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={customerType} onValueChange={(v) => { setCustomerType(v as CustomerType); setCurrentPage(0); }}>
        <TabsList>
          <TabsTrigger value="INDIVIDUAL">{getBilingual('Individual', '个人')}</TabsTrigger>
          <TabsTrigger value="CORPORATE">{getBilingual('Corporate', '企业')}</TabsTrigger>
        </TabsList>

        <TabsContent value={customerType} className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={getBilingual('Search by name, ID, phone...', '按姓名、ID、电话搜索...')}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
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
                    <TableHead>{getBilingual('Customer No.', '客户号')}</TableHead>
                    <TableHead>{getBilingual('Name', '姓名')}</TableHead>
                    <TableHead>{getBilingual('Contact', '联系方式')}</TableHead>
                    <TableHead>{getBilingual('Branch', '分行')}</TableHead>
                    <TableHead>{getBilingual('Status', '状态')}</TableHead>
                    <TableHead>{getBilingual('Actions', '操作')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {getBilingual('No customers found', '未找到客户')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.displayName}</div>
                            {customer.displayNameCn && <div className="text-sm text-muted-foreground">{customer.displayNameCn}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {customer.email && <div>{customer.email}</div>}
                            {customer.mobile && <div>{customer.mobile}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{customer.branchName || '-'}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(customer)}>
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
                    {getBilingual(`Showing ${customers.length} of ${totalElements} results`, `显示 ${customers.length} / ${totalElements} 条结果`)}
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
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.customerType === 'INDIVIDUAL' 
                ? getBilingual('Create Individual Customer', '创建个人客户')
                : getBilingual('Create Corporate Customer', '创建企业客户')}
            </DialogTitle>
            <DialogDescription>
              {getBilingual('Fill in customer information', '填写客户信息')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Customer Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Customer Type', '客户类型')} *</Label>
              <Select 
                value={formData.customerType} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, customerType: v as CustomerType }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">{getBilingual('Individual', '个人')}</SelectItem>
                  <SelectItem value="CORPORATE">{getBilingual('Corporate', '企业')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Individual Fields */}
            {formData.customerType === 'INDIVIDUAL' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('First Name', '名')} *</Label>
                  <Input
                    className="col-span-3"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Last Name', '姓')} *</Label>
                  <Input
                    className="col-span-3"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Gender', '性别')}</Label>
                  <Select 
                    value={formData.gender || 'MALE'} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v as 'MALE' | 'FEMALE' | 'OTHER' }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">{getBilingual('Male', '男')}</SelectItem>
                      <SelectItem value="FEMALE">{getBilingual('Female', '女')}</SelectItem>
                      <SelectItem value="OTHER">{getBilingual('Other', '其他')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Date of Birth', '出生日期')}</Label>
                  <Input
                    type="date"
                    className="col-span-3"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Corporate Fields */}
            {formData.customerType === 'CORPORATE' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Company Name', '公司名称')} *</Label>
                  <Input
                    className="col-span-3"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Registration No.', '注册号')}</Label>
                  <Input
                    className="col-span-3"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-4">{getBilingual('Contact Information', '联系信息')}</h4>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Email', '邮箱')}</Label>
              <Input
                type="email"
                className="col-span-3"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Mobile', '手机')}</Label>
              <Input
                className="col-span-3"
                value={formData.mobile || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Address', '地址')}</Label>
              <Input
                className="col-span-3"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            {/* Branch */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Branch', '分行')}</Label>
              <Select 
                value={formData.branchId?.toString() || ''} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, branchId: parseInt(v) }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={getBilingual('Select branch', '选择分行')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <p className="font-medium">{selectedCustomer.customerNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Status', '状态')}</Label>
                  <p>{getStatusBadge(selectedCustomer.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Name', '姓名')}</Label>
                  <p className="font-medium">{selectedCustomer.displayName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type', '类型')}</Label>
                  <p>{selectedCustomer.customerType === 'INDIVIDUAL' ? getBilingual('Individual', '个人') : getBilingual('Corporate', '企业')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Email', '邮箱')}</Label>
                  <p>{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Mobile', '手机')}</Label>
                  <p>{selectedCustomer.mobile || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Branch', '分行')}</Label>
                  <p>{selectedCustomer.branchName || '-'}</p>
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

export default CustomersPage;
