import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, CalendarClock, FileText, Repeat, Receipt, CreditCard, Tag, BarChart3, UserCog, Settings, Menu, LogOut, PanelLeftClose } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import type { Role } from '../types';

const NAV: { to: string; label: string; icon: any; roles: Role[] }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'staff'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['admin', 'staff'] },
  { to: '/plans', label: 'Subscription Plans', icon: CalendarClock, roles: ['admin', 'staff'] },
  { to: '/quotations', label: 'Quotations', icon: FileText, roles: ['admin', 'staff'] },
  { to: '/subscriptions', label: 'Subscriptions', icon: Repeat, roles: ['admin', 'staff'] },
  { to: '/invoices', label: 'Invoices', icon: Receipt, roles: ['admin', 'staff'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'staff'] },
  { to: '/discounts', label: 'Discounts', icon: Tag, roles: ['admin'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'staff'] },
  { to: '/staff', label: 'Staff Management', icon: UserCog, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'staff'] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const crumb = loc.pathname.split('/').filter(Boolean).join(' / ');

  const sidebar = (
    <aside className={`flex h-full flex-col bg-ink p-3 text-sky transition-all ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className="mb-4 flex items-center justify-between px-2 pt-2 text-xl font-semibold text-white">
        {!collapsed && <span>bright<span className="text-coral">loop</span></span>}
        <button aria-label="Collapse sidebar" className="hidden lg:block" onClick={() => setCollapsed(!collapsed)}><PanelLeftClose className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV.filter((n) => n.roles.includes(user!.role)).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} title={label}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-white' : 'hover:bg-white/10 hover:text-white'}`}>
            <Icon className="h-5 w-5 shrink-0" />{!collapsed && label}
          </NavLink>))}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/10 hover:text-white"><LogOut className="h-5 w-5" />{!collapsed && 'Log out'}</button>
    </aside>
  );

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 flex bg-ink/50 lg:hidden" onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()}>{sidebar}</div></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
          <button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-6 w-6" /></button>
          <p className="flex-1 text-sm capitalize text-plum">{crumb}</p>
          <div className="text-right text-sm"><p className="font-semibold">{user!.name}</p><p className="text-xs capitalize text-plum">{user!.role}</p></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}