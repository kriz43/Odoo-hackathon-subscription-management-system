import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';
import AppLayout from './layout/AppLayout';
import { Role } from './types';

const Login = lazy(() => import('./features/auth/LoginPage'));
const Signup = lazy(() => import('./features/auth/SignupPage'));
const Dashboard = lazy(() => import('./features/dashboard/DashboardPage'));
const Customers = lazy(() => import('./features/customers/CustomersPage'));

function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'customer' ? '/portal' : '/dashboard'} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Guard roles={['admin', 'staff']}><AppLayout /></Guard>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          {/* Next parts: products, plans, quotations, subscriptions, invoices, payments, discounts, reports, staff, settings */}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}