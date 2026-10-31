import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../lib/api';
import { DashboardData } from '../../types';
import { Card, PageHeader, Skeleton } from '../../components/ui';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/reports/dashboard')).data, // TODO: backend endpoint
  });

  const cards = data && [
    ['Active subscriptions', data.cards.active_subscriptions, 'border-brand'],
    ['Monthly recurring revenue', inr(data.cards.mrr), 'border-plum'],
    ['Revenue collected', inr(data.cards.revenue_collected), 'border-sky'],
    ['Outstanding', inr(data.cards.outstanding), 'border-coral'],
    ['Overdue invoices', data.cards.overdue_invoices, 'border-coral'],
    ['New customers', data.cards.new_customers, 'border-mauve'],
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your recurring revenue at a glance." />
      {isError && <Card className="mb-4 text-sm">Couldn’t load the dashboard. <button className="font-semibold text-brand" onClick={() => refetch()}>Try again</button></Card>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)
          : cards?.map(([l, v, b]) => (
            <Card key={l as string} className={`border-l-4 ${b}`}><p className="text-sm text-plum">{l}</p><p className="mt-1 text-2xl font-semibold">{v}</p></Card>))}
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Monthly revenue</h2>
        {isLoading ? <Skeleton className="h-64" /> : !data?.revenue_trend.length ? <p className="py-12 text-center text-plum">No revenue recorded yet.</p> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenue_trend}>
              <CartesianGrid stroke="#E4E1EC" vertical={false} />
              <XAxis dataKey="month" stroke="#6C5E82" fontSize={12} /><YAxis stroke="#6C5E82" fontSize={12} />
              <Tooltip formatter={(v) => inr(Number(v))} />
              <Area dataKey="revenue" stroke="#3F5B8B" fill="#96A4C5" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>)}
      </Card>
    </>
  );
}