import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { loginSchema } from './schemas';
import { Button, Field, Input } from '../../components/ui';
import { errMsg } from '../../lib/api';

export default function LoginPage() {
  const { login } = useAuth(); const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });
  const onSubmit = handleSubmit(async (d) => {
    try { const u = await login(d.email, d.password); nav(u.role === 'customer' ? '/portal' : '/dashboard'); }
    catch (e) { toast.error(errMsg(e)); }
  });
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand via-mauve to-ink p-4">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register('password')} /></Field>
        <Button variant="cta" className="w-full" loading={isSubmitting}>Log in</Button>
        <p className="text-center text-sm text-plum">New here? <Link className="font-semibold text-brand" to="/signup">Create an account</Link></p>
      </form>
    </div>
  );
}