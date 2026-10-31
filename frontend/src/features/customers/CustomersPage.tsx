import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api, errMsg } from '../../lib/api';
import { Customer, Paginated } from '../../types';
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Skeleton, useDebounced } from '../../components/ui';

const schema = z.object({
  name: z.string().min(2, 'Enter the customer’s name.'),
  company: z.string().min(1, 'Enter a company name.'),
  email: z.string().email('Enter a valid email.'),
});
type Form = z.infer<typeof schema>;
const PAGE = 10;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const search = useDebounced(q);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => (await api.get<Paginated<Customer>>('/customers', { params: { page, page_size: PAGE, search } })).data,
    placeholderData: keepPreviousData, // server-side pagination
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const create = useMutation({
    mutationFn: (d: Form) => api.post('/customers', d),
    onSuccess: () => { toast.success('Customer added.'); qc.invalidateQueries({ queryKey: ['customers'] }); setAdding(false); reset(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1;

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who subscribes to Brightloop."
        action={<Button variant="cta" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add customer</Button>} />
      <Input className="mb-4 max-w-xs" placeholder="Search by name, company or email" aria-label="Search customers"
        value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <Card className="overflow-x-auto p-0">
        {isLoading ? <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          : isError ? <p className="p-8 text-center text-plum">Couldn’t load customers. Check your connection and refresh.</p>
          : !data?.items.length ? <p className="p-8 text-center text-plum">No customers found. Add your first customer to get started.</p> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-plum"><tr>{['Customer', 'Company', 'Email', 'Active subs', 'Revenue', 'Outstanding', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3">{c.company}</td><td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.active_subscriptions}</td><td className="px-4 py-3">₹{c.total_revenue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">₹{c.outstanding.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><Badge tone={c.status === 'active' ? 'ok' : 'warn'}>{c.status}</Badge></td>
              </tr>))}</tbody>
          </table>)}
      </Card>
      <div className="mt-4 flex items-center justify-end gap-3 text-sm">
        <span className="text-plum">Page {page} of {pages}</span>
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      {adding && (
        <Modal title="Add customer" onClose={() => setAdding(false)}>
          <form onSubmit={handleSubmit((d) => create.mutate(d))} noValidate className="space-y-3">
            <Field label="Name" error={errors.name?.message}><Input {...register('name')} /></Field>
            <Field label="Company" error={errors.company?.message}><Input {...register('company')} /></Field>
            <Field label="Email" error={errors.email?.message}><Input type="email" {...register('email')} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="cta" loading={isSubmitting || create.isPending}>Save customer</Button>
            </div>
          </form>
        </Modal>)}
    </>
  );
}