import { useEffect, useMemo, useState } from 'react'
import { PauseCircle, Search, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api } from '../lib/api'
import { usePosStore } from '../store/pos'
import type { Category, Product } from '../types'

export function CashierPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [taxRate, setTaxRate] = useState(10)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'SPLIT'>('CASH')
  const [receipt, setReceipt] = useState<string | null>(null)

  const { cart, addToCart, removeItem, updateQuantity, setItemNote, holdOrder, heldOrders, resumeOrder, clearCart, discount, setDiscount } = usePosStore()

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/products/categories'), api.get('/settings')])
      .then(([productsRes, categoriesRes, settingsRes]) => {
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
        setTaxRate(settingsRes.data?.taxPercentage ?? 10)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        if (cart.length) holdOrder()
      }
      if (event.key === 'F2') {
        event.preventDefault()
        setReceipt('preview')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cart.length, holdOrder])

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (activeCategory === 'All' || product.category?.name === activeCategory) &&
          product.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, activeCategory, search]
  )

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = Number(((subtotal - discount) * (taxRate / 100)).toFixed(2))
  const total = Number((subtotal - discount + tax).toFixed(2))

  const checkout = async () => {
    if (!cart.length) return
    await api.post('/orders', {
      items: cart,
      discount,
      paymentMethod,
      splitPayments: paymentMethod === 'SPLIT' ? [{ method: 'CASH', amount: total / 2 }, { method: 'CARD', amount: total / 2 }] : undefined
    })
    setReceipt(`Receipt total: $${total.toFixed(2)}`)
    clearCart()
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <Card className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input className="pl-9" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {['All', ...categories.map((c) => c.name)].map((category) => (
            <Button
              key={category}
              className={activeCategory === category ? 'bg-amber-600' : 'bg-slate-700'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:-translate-y-0.5" onClick={() => addToCart(product)}>
              <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-amber-100 to-amber-300 dark:from-slate-700 dark:to-slate-800" />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-slate-500">{product.category?.name}</p>
              <p className="mt-2 text-xl font-bold">${product.price.toFixed(2)}</p>
            </Card>
          ))}
        </div>
      </section>

      <aside className="sticky top-20 h-fit space-y-3">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Current Cart</h2>
          <div className="max-h-80 space-y-2 overflow-auto">
            {cart.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.name}</p>
                  <button onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.id, Number(e.target.value))} />
                  <Input placeholder="Note" value={item.note ?? ''} onChange={(e) => setItemNote(item.id, e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div className="flex items-center justify-between gap-2">
              <span>Discount</span>
              <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-28" />
            </div>
            <div className="flex justify-between"><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['CASH', 'CARD', 'SPLIT'] as const).map((method) => (
              <Button key={method} className={paymentMethod === method ? 'bg-emerald-600' : 'bg-slate-700'} onClick={() => setPaymentMethod(method)}>{method}</Button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500" onClick={checkout}>Checkout</Button>
            <Button className="bg-slate-700 hover:bg-slate-600" onClick={holdOrder}><PauseCircle size={18} /></Button>
          </div>
        </Card>
        <Card>
          <p className="mb-2 font-medium">Held Orders (Ctrl/Cmd + H)</p>
          <div className="space-y-2">
            {heldOrders.map((order, index) => (
              <Button key={index} className="w-full bg-slate-700" onClick={() => resumeOrder(index)}>
                Resume #{index + 1} ({order.length} items)
              </Button>
            ))}
          </div>
        </Card>
      </aside>

      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in">
            <h3 className="text-xl font-semibold">Receipt Preview</h3>
            <p className="mt-2 text-sm">{receipt}</p>
            <p className="mt-2 text-xs text-slate-500">Thermal printer & barcode scanner ready via desktop hardware integration.</p>
            <Button className="mt-4 w-full" onClick={() => setReceipt(null)}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
