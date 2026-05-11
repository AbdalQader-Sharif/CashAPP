import { create } from 'zustand'
import { api } from '../lib/api'
import type { User } from '../types'

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  restoreSession: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  async login(email, password) {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token })
    } finally {
      set({ loading: false })
    }
  },
  async restoreSession() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await api.get('/auth/session')
      set({ user: data, token })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },
  logout() {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  }
}))
