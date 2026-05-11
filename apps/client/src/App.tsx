import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Topbar } from './components/Topbar'
import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { CashierPage } from './pages/CashierPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { ProductManagementPage } from './pages/ProductManagementPage'
import { InventoryPage } from './pages/InventoryPage'
import { OrdersHistoryPage } from './pages/OrdersHistoryPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

function Protected({ adminOnly = false, children }: { adminOnly?: boolean; children: ReactElement }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    restoreSession().catch(() => undefined)
  }, [restoreSession])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const isLogin = useMemo(() => location.pathname === '/login', [location.pathname])

  return (
    <div className="min-h-screen transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {user && !isLogin && <Topbar dark={dark} onToggle={() => setDark((d) => !d)} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Protected><CashierPage /></Protected>} />
        <Route path="/admin/dashboard" element={<Protected adminOnly><AdminDashboardPage /></Protected>} />
        <Route path="/admin/products" element={<Protected adminOnly><ProductManagementPage /></Protected>} />
        <Route path="/admin/inventory" element={<Protected adminOnly><InventoryPage /></Protected>} />
        <Route path="/admin/orders" element={<Protected adminOnly><OrdersHistoryPage /></Protected>} />
        <Route path="/admin/employees" element={<Protected adminOnly><EmployeesPage /></Protected>} />
        <Route path="/admin/reports" element={<Protected adminOnly><ReportsPage /></Protected>} />
        <Route path="/admin/settings" element={<Protected adminOnly><SettingsPage /></Protected>} />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  )
}
