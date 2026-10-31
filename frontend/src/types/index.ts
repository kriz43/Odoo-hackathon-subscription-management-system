export type Role = 'admin' | 'staff' | 'customer';
export interface User { id: number; name: string; email: string; role: Role }
export interface Paginated<T> { items: T[]; total: number; page: number; page_size: number }
export interface Customer {
  id: number; name: string; company: string; email: string;
  active_subscriptions: number; total_revenue: number; outstanding: number;
  status: 'active' | 'archived';
}
export interface DashboardData {
  cards: { active_subscriptions: number; mrr: number; revenue_collected: number;
           outstanding: number; overdue_invoices: number; new_customers: number };
  revenue_trend: { month: string; revenue: number }[];
}