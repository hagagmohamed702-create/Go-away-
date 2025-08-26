import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الإيرادات الشهرية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>مخطط الإيرادات سيتم إضافته قريباً</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}