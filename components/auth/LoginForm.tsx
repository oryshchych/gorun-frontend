'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
      showSuccessToast('Welcome back!', 'Login Successful');
      router.push('/events');
    } catch (error: any) {
      handleApiError(error, 'Login Failed');
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
                <FormLabel htmlFor="login-email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
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
                <FormLabel htmlFor="login-password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
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
          aria-label={isLoading ? 'Logging in' : 'Login to your account'}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
