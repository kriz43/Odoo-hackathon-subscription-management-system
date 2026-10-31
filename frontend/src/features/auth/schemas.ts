import { z } from 'zod';

export const passwordRule = z.string()
  .min(9, 'Use more than 8 characters.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[^A-Za-z0-9]/, 'Add a special character.');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
});
export const signupSchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email.'),
  password: passwordRule,
  confirm: z.string(),
  terms: z.literal(true, { message: 'Accept the terms to continue.' }),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords don’t match.' });