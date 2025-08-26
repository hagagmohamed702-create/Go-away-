import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: 'payment',
      description: 'دفع قسط - أحمد محمد',
      amount: '15,000 ج.م',
      time: 'منذ ساعتين'
    },
    {
      id: 2, 
      type: 'contract',
      description: 'عقد جديد - سارة أحمد',
      amount: '500,000 ج.م',
      time: 'منذ 4 ساعات'
    },
    {
      id: 3,
      type: 'expense',
      description: 'مصروف - شراء مواد إنشاء',
      amount: '25,000 ج.م',
      time: 'منذ يوم'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>النشاطات الأخيرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              <div className="text-lg font-bold">{activity.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}