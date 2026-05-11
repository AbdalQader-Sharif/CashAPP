import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'

export function AdminDashboardPage() {
  const [data, setData] = useState<{ totalOrders: number; revenue: number; dailySales: Array<{ date: string; total: number }> }>({
    totalOrders: 0,
    revenue: 0,
    dailySales: []
  })

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data)).catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-3">
      <Card><p className="text-sm text-slate-500">Total Orders</p><p className="text-3xl font-bold">{data.totalOrders}</p></Card>
      <Card><p className="text-sm text-slate-500">Revenue</p><p className="text-3xl font-bold">${data.revenue.toFixed(2)}</p></Card>
      <Card><p className="text-sm text-slate-500">Top Action</p><p className="text-2xl font-semibold">Manage Inventory</p></Card>
      <Card className="md:col-span-3">
        <h3 className="mb-3 text-lg font-semibold">Daily Sales</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#d97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
