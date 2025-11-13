'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
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

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      showSuccessToast('Your account has been created successfully!', 'Registration Successful');
      router.push('/events');
    } catch (error: any) {
      handleApiError(error, 'Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Registration form">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="register-name">Name</FormLabel>
                <FormControl>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    disabled={isLoading}
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "register-name-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-name-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="register-email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "register-email-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-email-error" />
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
                <FormLabel htmlFor="register-password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "register-password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-password-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="register-confirm-password">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "register-confirm-password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-confirm-password-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          aria-label={isLoading ? 'Creating account' : 'Create a new account'}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
