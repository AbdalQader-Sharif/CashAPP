export type Role = 'ADMIN' | 'CASHIER'

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type Category = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  price: number
  stock: number
  unavailable: boolean
  categoryId: string
  category?: Category
}

export type CartItem = {
  id: string
  productId: string
  name: string
  unitPrice: number
  quantity: number
  note?: string
}

export type Order = {
  id: string
  reference: string
  status: 'COMPLETED' | 'HELD' | 'CANCELED'
  subtotal: number
  discount: number
  tax: number
  total: number
  createdAt: string
}
