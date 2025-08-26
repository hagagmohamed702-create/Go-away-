import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { OverdueInstallments } from '@/components/dashboard/overdue-installments'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأقساط المتأخرة */}
        <OverdueInstallments />
        
        {/* النشاطات الأخيرة */}
        <RecentActivities />
      </div>

      {/* مخطط الإيرادات */}
      <RevenueChart />
    </div>
  )
}