import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'

export function ReportsPage() {
  const exportCsv = async () => {
    const { data } = await api.get('/admin/reports?format=csv')
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sales-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Reports Export</h3>
        <p className="text-sm text-slate-500">Download CSV report now. PDF export can be added later via printer pipeline.</p>
        <Button onClick={exportCsv}>Export CSV</Button>
      </Card>
    </div>
  )
}
