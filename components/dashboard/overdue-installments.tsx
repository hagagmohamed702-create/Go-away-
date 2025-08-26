import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function OverdueInstallments() {
  const overdueInstallments = [
    {
      id: 1,
      clientName: 'محمد حسن',
      unitCode: 'A101',
      amount: 25000,
      dueDate: '2024-01-15',
      daysOverdue: 5
    },
    {
      id: 2,
      clientName: 'فاطمة علي',
      unitCode: 'B203',
      amount: 30000,
      dueDate: '2024-01-10',
      daysOverdue: 10
    }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <CardTitle className="text-red-600">الأقساط المتأخرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {overdueInstallments.map((installment) => (
            <div key={installment.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium">{installment.clientName}</p>
                <p className="text-sm text-muted-foreground">
                  وحدة {installment.unitCode} • متأخر {installment.daysOverdue} يوم
                </p>
              </div>
              <div className="text-lg font-bold text-red-600">
                {installment.amount.toLocaleString('ar-EG')} ج.م
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}