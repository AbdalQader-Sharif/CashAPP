import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api } from '../lib/api'
import type { User } from '../types'

export function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const load = () => api.get('/admin/employees').then((res) => setUsers(res.data))

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[320px_1fr]">
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Create Cashier</h3>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button className="w-full" onClick={async () => {
          await api.post('/admin/employees', { name, email, role: 'CASHIER', password: 'cashier1234' })
          setName('')
          setEmail('')
          load()
        }}>Create</Button>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Employees</h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div><p className="font-medium">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{user.role}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
