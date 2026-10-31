import { ReactNode, ButtonHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(' ');

export function Button({ variant = 'primary', loading, className, children, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'cta' | 'primary' | 'ghost' | 'danger'; loading?: boolean }) {
  const v = {
    cta: 'bg-coral text-white hover:bg-[#d95f6c]',
    primary: 'bg-brand text-white hover:bg-ink',
    ghost: 'border border-line bg-white text-ink hover:bg-surface',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  }[variant];
  return (
    <button {...p} disabled={p.disabled || loading}
      className={cx('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50', v, className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}
    </button>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (p, ref) => <input ref={ref} {...p}
    className={cx('w-full rounded-lg border border-line bg-white px-3 py-2 text-sm placeholder:text-sky focus:border-brand', p.className)} />);

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>{children}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </label>
  );
}

export const Card = ({ children, className }: { children: ReactNode; className?: string }) =>
  <div className={cx('rounded-xl border border-line bg-white p-5 shadow-sm', className)}>{children}</div>;

export const Skeleton = ({ className }: { className?: string }) =>
  <div className={cx('animate-pulse rounded-lg bg-line', className)} />;

export const Badge = ({ tone = 'sky', children }: { tone?: 'ok' | 'warn' | 'sky' | 'bad'; children: ReactNode }) => {
  const t = { ok: 'bg-emerald-50 text-emerald-700', warn: 'bg-amber-50 text-amber-700', sky: 'bg-sky/25 text-brand', bad: 'bg-red-50 text-red-700' }[tone];
  return <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold', t)}>{children}</span>;
};

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div><h1 className="text-2xl font-semibold">{title}</h1>{subtitle && <p className="text-sm text-plum">{subtitle}</p>}</div>
    {action}
  </div>
);

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}
    </div>
  </div>
);

export function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}