import { create } from 'zustand'
import type { CartItem, Product } from '../types'

type PosState = {
  cart: CartItem[]
  heldOrders: CartItem[][]
  discount: number
  addToCart: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setItemNote: (id: string, note: string) => void
  clearCart: () => void
  holdOrder: () => void
  resumeOrder: (index: number) => void
  setDiscount: (value: number) => void
}

const BEEP = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAABErAAACABAAZGF0YQAAAAA=')

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  heldOrders: JSON.parse(localStorage.getItem('heldOrders') ?? '[]'),
  discount: 0,
  addToCart(product) {
    BEEP.play().catch(() => undefined)
    const existing = get().cart.find((item) => item.productId === product.id)
    if (existing) {
      set({
        cart: get().cart.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      })
      return
    }
    set({
      cart: [
        ...get().cart,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price
        }
      ]
    })
  },
  removeItem(id) {
    set({ cart: get().cart.filter((item) => item.id !== id) })
  },
  updateQuantity(id, quantity) {
    if (quantity <= 0) return
    set({ cart: get().cart.map((item) => (item.id === id ? { ...item, quantity } : item)) })
  },
  setItemNote(id, note) {
    set({ cart: get().cart.map((item) => (item.id === id ? { ...item, note } : item)) })
  },
  clearCart() {
    set({ cart: [], discount: 0 })
  },
  holdOrder() {
    const held = [...get().heldOrders, get().cart]
    localStorage.setItem('heldOrders', JSON.stringify(held))
    set({ heldOrders: held, cart: [] })
  },
  resumeOrder(index) {
    const held = [...get().heldOrders]
    const [restored] = held.splice(index, 1)
    localStorage.setItem('heldOrders', JSON.stringify(held))
    set({ cart: restored ?? [], heldOrders: held })
  },
  setDiscount(value) {
    set({ discount: value })
  }
}))
