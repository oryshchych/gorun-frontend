import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to start managing and registering for events
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
