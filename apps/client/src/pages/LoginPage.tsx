import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const [email, setEmail] = useState('admin@coffee.local')
  const [password, setPassword] = useState('admin1234')
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  if (user) {
    navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 to-slate-200 p-4 dark:from-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md space-y-4 p-6">
        <h2 className="text-2xl font-semibold">Welcome to BrewPoint POS</h2>
        <p className="text-sm text-slate-500">Sign in with your admin or cashier account.</p>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button
          className="w-full py-3 text-base"
          disabled={loading}
          onClick={async () => {
            try {
              await login(email, password)
              navigate('/')
            } catch {
              setError('Login failed. Check your credentials.')
            }
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <div className="rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-800">
          <p>Admin: admin@coffee.local / admin1234</p>
          <p>Cashier: cashier@coffee.local / cashier1234</p>
        </div>
      </Card>
    </div>
  )
}
