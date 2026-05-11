import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { useAuthStore } from '../store/auth'

const links = [
  ['/', 'POS'],
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/products', 'Products'],
  ['/admin/inventory', 'Inventory'],
  ['/admin/orders', 'Orders'],
  ['/admin/employees', 'Employees'],
  ['/admin/reports', 'Reports'],
  ['/admin/settings', 'Settings']
]

export function Topbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <h1 className="mr-2 text-xl font-bold">☕ BrewPoint POS</h1>
        <nav className="hidden flex-wrap items-center gap-2 md:flex">
          {links
            .filter(([path]) => user?.role === 'ADMIN' || path === '/')
            .map(([path, label]) => (
              <Link
                key={path}
                to={path}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  pathname === path ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </Link>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:block">{user?.name}</span>
          <Button className="bg-slate-700 px-3 py-2 hover:bg-slate-600" onClick={onToggle}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button className="bg-rose-600 px-3 py-2 hover:bg-rose-500" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
