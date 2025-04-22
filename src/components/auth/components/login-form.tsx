import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignInFlow } from '../types';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface LoginFormProps extends React.ComponentProps<'form'> {
  setState: (state: SignInFlow) => void;
}

export function LoginForm({ className, setState, ...props }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: () => {
          setPending(false);
          toast.success('Successfully signed in!');
          router.push('/');
        },
        onError: (ctx) => {
          setPending(false);
          setError(ctx.error.message || 'Failed to sign in');
          toast.error(ctx.error.message || 'Failed to sign in');
        },
      }
    );
  };

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={pending}
            {...register('email', { required: true })}
          />
          {errors.email && <p className="text-sm text-red-500">Email is required</p>}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" disabled={pending} {...register('password', { required: true })} />
          {errors.password && <p className="text-sm text-red-500">Password is required</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          Login
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full relative" disabled={pending}>
            <FcGoogle className="size-5 mr-2" />
            Login with Google
          </Button>
          <Button variant="outline" className="w-full relative" disabled={pending}>
            <FaGithub className="size-5 mr-2" />
            Login with GitHub
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <span className="underline underline-offset-4 cursor-pointer" onClick={() => setState('signUp')}>
          Sign up
        </span>
      </div>
    </form>
  );
}
