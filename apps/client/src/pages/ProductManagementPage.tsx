import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api } from '../lib/api'
import type { Category, Product } from '../types'

export function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', price: 0, stock: 0, categoryId: '' })

  const load = () => {
    Promise.all([api.get('/products'), api.get('/products/categories')]).then(([a, b]) => {
      setProducts(a.data)
      setCategories(b.data)
      setForm((prev) => ({ ...prev, categoryId: b.data[0]?.id ?? '' }))
    })
  }

  useEffect(load, [])

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[360px_1fr]">
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Add Product</h3>
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        <select className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Button className="w-full" onClick={async () => {
          await api.post('/products', { ...form, unavailable: false, imageUrl: '', description: '' })
          setForm({ ...form, name: '', price: 0, stock: 0 })
          load()
        }}>Save</Button>
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Products</h3>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-slate-500">{product.category?.name} • ${product.price.toFixed(2)} • stock {product.stock}</p>
              </div>
              <Button className="bg-rose-600" onClick={async () => { await api.delete(`/products/${product.id}`); load() }}>Delete</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
