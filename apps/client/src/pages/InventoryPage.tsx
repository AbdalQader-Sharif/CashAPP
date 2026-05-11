import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'
import type { Product } from '../types'

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Inventory</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-slate-500">Available stock: {product.stock}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
