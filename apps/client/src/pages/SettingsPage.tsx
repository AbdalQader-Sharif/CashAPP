import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api } from '../lib/api'

export function SettingsPage() {
  const [form, setForm] = useState({ shopName: '', taxPercentage: 10, currency: 'USD', receiptFooter: '', language: 'en' })

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data) setForm(res.data)
    }).catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Coffee shop name" />
        <Input type="number" value={form.taxPercentage} onChange={(e) => setForm({ ...form, taxPercentage: Number(e.target.value) })} placeholder="Tax" />
        <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="Currency" />
        <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Language" />
        <Input value={form.receiptFooter} onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })} placeholder="Receipt footer" />
        <Button onClick={() => api.put('/admin/settings', form)}>Save Settings</Button>
      </Card>
    </div>
  )
}
