import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { Globe, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required / 用户名必填'),
  password: z.string().min(1, 'Password is required / 密码必填'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast({
        title: t('auth.loginSuccess'),
        variant: 'success',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: t('auth.loginFailed'),
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={toggleLanguage}>
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? '中文' : 'English'}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <CardTitle className="text-2xl">{t('common.appName')}</CardTitle>
          <CardDescription>{t('auth.loginTitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={language === 'en' ? 'Enter username' : '请输入用户名'}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={language === 'en' ? 'Enter password' : '请输入密码'}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'en' ? 'Signing in...' : '登录中...'}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
