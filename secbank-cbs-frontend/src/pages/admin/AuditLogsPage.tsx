import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { auditLogApi } from '@/lib/api';
import { AuditLog } from '@/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { Search, Loader2, Eye } from 'lucide-react';

export function AuditLogsPage() {
  const { t, language } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Filters - use 'all' instead of empty string to avoid Select issues
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  useEffect(() => {
    loadData();
    loadFilters();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await auditLogApi.getAll(0, 100);
      if (response.success && response.data?.content) {
        setAuditLogs(response.data.content);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast({
        title: language === 'en' ? 'Failed to load audit logs' : '加载审计日志失败',
        variant: 'destructive',
      });
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [modulesRes, actionsRes] = await Promise.all([
        auditLogApi.getModules(),
        auditLogApi.getActions(),
      ]);
      if (modulesRes.success && modulesRes.data) {
        setModules(modulesRes.data);
      }
      if (actionsRes.success && actionsRes.data) {
        setActions(actionsRes.data);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = { page: 0, size: 100 };
      if (filterModule && filterModule !== 'all') params.module = filterModule;
      if (filterAction && filterAction !== 'all') params.action = filterAction;
      if (filterStartDate) params.startDate = new Date(filterStartDate).toISOString();
      if (filterEndDate) params.endDate = new Date(filterEndDate).toISOString();
      
      const response = await auditLogApi.search(params);
      if (response.success && response.data?.content) {
        setAuditLogs(response.data.content);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: language === 'en' ? 'Search failed' : '搜索失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilterModule('all');
    setFilterAction('all');
    setFilterStartDate('');
    setFilterEndDate('');
    loadData();
  };

  const getActionColor = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('auditLogs.title')}</h1>
        <p className="text-gray-500">
          {language === 'en' 
            ? 'View system activity and audit trail' 
            : '查看系统活动和审计跟踪'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>{t('auditLogs.module')}</Label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'All modules' : '所有模块'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'en' ? 'All modules' : '所有模块'}</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('auditLogs.action')}</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'All actions' : '所有操作'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'en' ? 'All actions' : '所有操作'}</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('auditLogs.startDate')}</Label>
              <Input
                type="datetime-local"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('auditLogs.endDate')}</Label>
              <Input
                type="datetime-local"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {t('common.search')}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
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
                  <TableHead>{t('auditLogs.timestamp')}</TableHead>
                  <TableHead>{t('auditLogs.user')}</TableHead>
                  <TableHead>{t('auditLogs.action')}</TableHead>
                  <TableHead>{t('auditLogs.module')}</TableHead>
                  <TableHead>{t('auditLogs.entityType')}</TableHead>
                  <TableHead>{t('auditLogs.entityId')}</TableHead>
                  <TableHead>{t('auditLogs.ipAddress')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDate(log.createdAt, language)}
                      </TableCell>
                      <TableCell>{log.username || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>{log.entityType || '-'}</TableCell>
                      <TableCell>{log.entityId || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewDetail(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Audit Log Detail' : '审计日志详情'}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{t('auditLogs.timestamp')}</Label>
                  <p className="font-medium">{formatDate(selectedLog.createdAt, language)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.user')}</Label>
                  <p className="font-medium">{selectedLog.username || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.action')}</Label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.module')}</Label>
                  <p className="font-medium">{selectedLog.module}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.entityType')}</Label>
                  <p className="font-medium">{selectedLog.entityType || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.entityId')}</Label>
                  <p className="font-medium">{selectedLog.entityId || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{t('auditLogs.ipAddress')}</Label>
                  <p className="font-medium font-mono">{selectedLog.ipAddress || '-'}</p>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <Label className="text-gray-500">{t('auditLogs.description')}</Label>
                  <p className="font-medium mt-1">{selectedLog.description}</p>
                </div>
              )}
              
              {selectedLog.oldValue && (
                <div>
                  <Label className="text-gray-500">
                    {language === 'en' ? 'Old Value' : '旧值'}
                  </Label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded-md text-sm overflow-auto max-h-40">
                    {selectedLog.oldValue}
                  </pre>
                </div>
              )}
              
              {selectedLog.newValue && (
                <div>
                  <Label className="text-gray-500">
                    {language === 'en' ? 'New Value' : '新值'}
                  </Label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded-md text-sm overflow-auto max-h-40">
                    {selectedLog.newValue}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
