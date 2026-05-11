import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'
import type { Order } from '../types'

export function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    api.get('/orders/recent').then((res) => setOrders(res.data)).catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Recent Orders</h3>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="font-medium">{order.reference}</p>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
              <strong>${order.total.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
