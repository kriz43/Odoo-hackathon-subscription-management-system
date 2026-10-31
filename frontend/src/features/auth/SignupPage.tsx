import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupSchema } from './schemas';
import { Button, Field, Input } from '../../components/ui';
import { api, errMsg } from '../../lib/api';

export default function SignupPage() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signupSchema) });
  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try { await api.post('/auth/register', { name, email, password }); toast.success('Account created. Log in to continue.'); nav('/login'); }
    catch (e) { toast.error(errMsg(e)); } // backend rejects duplicate emails
  });
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand via-mauve to-ink p-4">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <Field label="Business or full name" error={errors.name?.message}><Input {...register('name')} /></Field>
        <Field label="Email" error={errors.email?.message}><Input type="email" {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register('password')} /></Field>
        <Field label="Confirm password" error={errors.confirm?.message}><Input type="password" autoComplete="new-password" {...register('confirm')} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('terms')} /> I accept the terms</label>
        {errors.terms && <p role="alert" className="text-xs text-red-600">{errors.terms.message}</p>}
        <Button variant="cta" className="w-full" loading={isSubmitting}>Sign up</Button>
        <p className="text-center text-sm text-plum">Have an account? <Link className="font-semibold text-brand" to="/login">Log in</Link></p>
      </form>
    </div>
  );
}