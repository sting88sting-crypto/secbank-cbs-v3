import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerApi, branchApi } from '@/lib/api';
import { Customer, Branch, CustomerType, CustomerStatus, Gender, IdType, CreateCustomerRequest } from '@/types';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/hooks/useToast';
import { Plus, Search, Loader2, Users, Building2, Eye, Pencil } from 'lucide-react';

export function CustomersPage() {
  const { language, getBilingual } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('INDIVIDUAL');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
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
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, customerType]);

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

  const loadData = async () => {
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
    loadData();
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.branchId) {
      toast({ title: getBilingual('Please select a branch', '请选择分行'), variant: 'destructive' });
      return;
    }
    if (formData.customerType === 'INDIVIDUAL') {
      if (!formData.firstName || !formData.lastName) {
        toast({ title: getBilingual('Please enter first name and last name', '请输入名和姓'), variant: 'destructive' });
        return;
      }
    } else {
      if (!formData.companyName) {
        toast({ title: getBilingual('Please enter company name', '请输入公司名称'), variant: 'destructive' });
        return;
      }
    }
    if (!formData.idNumber) {
      toast({ title: getBilingual('Please enter ID number', '请输入证件号码'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await customerApi.create(formData as CreateCustomerRequest);
      if (response.success) {
        toast({ title: getBilingual('Customer created successfully', '客户创建成功') });
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
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
      customerType: 'INDIVIDUAL',
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
            <div className="text-2xl font-bold">{customerType === 'INDIVIDUAL' ? totalElements : '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getBilingual('Corporate Customers', '企业客户')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerType === 'CORPORATE' ? totalElements : '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Tabs value={customerType} onValueChange={(v) => { setCustomerType(v as CustomerType); setCurrentPage(0); }}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="INDIVIDUAL">{getBilingual('Individual', '个人')}</TabsTrigger>
            <TabsTrigger value="CORPORATE">{getBilingual('Corporate', '企业')}</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Input
              placeholder={getBilingual('Search by name, ID, email...', '按姓名、证件号、邮箱搜索...')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="INDIVIDUAL">
          {renderTable()}
        </TabsContent>
        <TabsContent value="CORPORATE">
          {renderTable()}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getBilingual('Create New Customer', '创建新客户')}</DialogTitle>
            <DialogDescription>
              {getBilingual('Fill in the customer information below', '请填写以下客户信息')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Customer Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Type', '类型')} *</Label>
              <Select 
                value={formData.customerType} 
                onValueChange={(v) => setFormData({ ...formData, customerType: v as CustomerType })}
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

            {/* Branch */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Branch', '分行')} *</Label>
              <Select 
                value={formData.branchId?.toString()} 
                onValueChange={(v) => setFormData({ ...formData, branchId: parseInt(v) })}
              >
                <SelectTrigger className="col-span-3">
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

            {/* Individual Fields */}
            {formData.customerType === 'INDIVIDUAL' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('First Name', '名')} *</Label>
                  <Input
                    className="col-span-3"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Last Name', '姓')} *</Label>
                  <Input
                    className="col-span-3"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Middle Name', '中间名')}</Label>
                  <Input
                    className="col-span-3"
                    value={formData.middleName || ''}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Gender', '性别')}</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(v) => setFormData({ ...formData, gender: v as Gender })}
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
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Company Name (CN)', '公司中文名')}</Label>
                  <Input
                    className="col-span-3"
                    value={formData.companyNameCn || ''}
                    onChange={(e) => setFormData({ ...formData, companyNameCn: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{getBilingual('Business Type', '业务类型')}</Label>
                  <Input
                    className="col-span-3"
                    value={formData.businessType || ''}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('ID Type', '证件类型')} *</Label>
              <Select 
                value={formData.idType} 
                onValueChange={(v) => setFormData({ ...formData, idType: v as IdType })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL_ID">{getBilingual('National ID', '身份证')}</SelectItem>
                  <SelectItem value="PASSPORT">{getBilingual('Passport', '护照')}</SelectItem>
                  <SelectItem value="DRIVERS_LICENSE">{getBilingual("Driver's License", '驾照')}</SelectItem>
                  <SelectItem value="SSS">{getBilingual('SSS', '社保号')}</SelectItem>
                  <SelectItem value="TIN">{getBilingual('TIN', '税号')}</SelectItem>
                  <SelectItem value="BUSINESS_REGISTRATION">{getBilingual('Business Registration', '营业执照')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('ID Number', '证件号码')} *</Label>
              <Input
                className="col-span-3"
                value={formData.idNumber || ''}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Email', '邮箱')}</Label>
              <Input
                type="email"
                className="col-span-3"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Mobile', '手机')}</Label>
              <Input
                className="col-span-3"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Phone', '电话')}</Label>
              <Input
                className="col-span-3"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{getBilingual('Address', '地址')}</Label>
              <Textarea
                className="col-span-3"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Name', '姓名')}</Label>
                  <p>{selectedCustomer.displayName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Type', '类型')}</Label>
                  <p>{selectedCustomer.customerType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Email', '邮箱')}</Label>
                  <p>{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('Mobile', '手机')}</Label>
                  <p>{selectedCustomer.mobile || selectedCustomer.mobilePhone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Type', '证件类型')}</Label>
                  <p>{selectedCustomer.idType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{getBilingual('ID Number', '证件号码')}</Label>
                  <p>{selectedCustomer.idNumber}</p>
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

  function renderTable() {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{getBilingual('Customer No.', '客户号')}</TableHead>
              <TableHead>{getBilingual('Name', '姓名')}</TableHead>
              <TableHead>{getBilingual('ID Number', '证件号')}</TableHead>
              <TableHead>{getBilingual('Email', '邮箱')}</TableHead>
              <TableHead>{getBilingual('Mobile', '手机')}</TableHead>
              <TableHead>{getBilingual('Status', '状态')}</TableHead>
              <TableHead>{getBilingual('Actions', '操作')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {getBilingual('No customers found', '未找到客户')}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono">{customer.customerNumber}</TableCell>
                  <TableCell>{customer.displayName}</TableCell>
                  <TableCell>{customer.idNumber}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.mobile || customer.mobilePhone || '-'}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(customer)}>
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
          <div className="flex justify-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {getBilingual('Previous', '上一页')}
            </Button>
            <span className="flex items-center px-4">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {getBilingual('Next', '下一页')}
            </Button>
          </div>
        )}
      </Card>
    );
  }
}
