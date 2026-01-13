import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { RolesPage } from '@/pages/admin/RolesPage';
import { PermissionsPage } from '@/pages/admin/PermissionsPage';
import { BranchesPage } from '@/pages/admin/BranchesPage';
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Administration Module */}
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/roles" element={<RolesPage />} />
              <Route path="/admin/permissions" element={<PermissionsPage />} />
              <Route path="/admin/branches" element={<BranchesPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              
              {/* Placeholder routes for other modules */}
              <Route path="/casa/*" element={<ComingSoon module="CASA" />} />
              <Route path="/accounting/*" element={<ComingSoon module="Accounting" />} />
              <Route path="/tellering/*" element={<ComingSoon module="Tellering" />} />
              <Route path="/nrps/*" element={<ComingSoon module="NRPS" />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

// Coming Soon placeholder component
function ComingSoon({ module }: { module: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        {module} Module
      </h2>
      <p className="text-gray-500">
        Coming Soon / 即将推出
      </p>
    </div>
  );
}

export default App;
