import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignInFlow } from '../types';
import { useState } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface SignupFormProps extends React.ComponentProps<'form'> {
  setState: (state: SignInFlow) => void;
}

export function SignupForm({ className, setState, ...props }: SignupFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    await authClient.signUp.email(
      {
        email: data.email,
        name: data.name,
        password: data.password,
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: () => {
          setPending(false);
          toast.success('Successfully signed up!');
          setState('signIn'); // 注册成功后跳转到登录页面
        },
        onError: (ctx) => {
          setPending(false);
          setError(ctx.error.message || 'Failed to sign up');
          toast.error(ctx.error.message || 'Failed to sign up');
        },
      }
    );
  };

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Please fill in the following information to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Zhang San"
            disabled={pending}
            {...register('name', { required: true })}
          />
          {errors.name && <p className="text-sm text-red-500">Full name is required</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@example.com"
            disabled={pending}
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
          />
          {errors.email && <p className="text-sm text-red-500">Valid email is required</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            disabled={pending}
            {...register('password', { required: true, minLength: 6 })}
          />
          {errors.password && errors.password.type === 'required' && (
            <p className="text-sm text-red-500">Password is required</p>
          )}
          {errors.password && errors.password.type === 'minLength' && (
            <p className="text-sm text-red-500">Password must be at least 6 characters</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          Sign up
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full relative" disabled={pending}>
            <FcGoogle className="size-5 mr-2" />
            Sign up with Google
          </Button>
          <Button variant="outline" className="w-full relative" disabled={pending}>
            <FaGithub className="size-5 mr-2" />
            Sign up with GitHub
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <span className="underline underline-offset-4 cursor-pointer" onClick={() => setState('signIn')}>
          Login
        </span>
      </div>
    </form>
  );
}
