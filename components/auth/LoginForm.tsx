'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AnimatedFormField } from '@/components/shared/AnimatedFormField';
import { handleApiError, showSuccessToast } from '@/lib/error-handler';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('auth');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      showSuccessToast(t('welcomeBack'), t('loginSuccessful'));
      router.push('/');
    } catch (error: any) {
      handleApiError(error, t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="login-email">{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    disabled={isLoading}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "login-email-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="login-email-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="login-password">{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "login-password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="login-password-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          aria-label={isLoading ? t('loggingIn') : t('login')}
        >
          {isLoading ? t('loggingIn') : t('login')}
        </Button>
      </form>
    </Form>
  );
}
