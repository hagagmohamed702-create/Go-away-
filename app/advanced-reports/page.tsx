'use client'

import { useState, useEffect } from 'react'

interface ReportData {
  financial?: any
  projects?: any
  partners?: any
  clients?: any
  dashboard?: any
}

interface KPIs {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  roi: number
  activeProjects: number
  completedProjects: number
  totalClients: number
  avgProjectCompletion: number
  cashOnHand: number
  growthRate: number
}

export default function AdvancedReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })

  // Fetch report data
  const fetchReportData = async (reportType: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: reportType,
        period: 'year',
        ...dateRange
      })
      
      const response = await fetch(`/api/advanced-reports?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReportData(prev => ({ ...prev, [reportType]: data.data }))
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب بيانات التقرير')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData(activeTab)
  }, [activeTab, dateRange])

  // Simple chart components (text-based for simplicity)
  const SimpleBarChart = ({ data, title, dataKey, valueKey, color = 'blue' }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data?.slice(0, 6).map((item: any, index: number) => {
          const maxValue = Math.max(...data.map((d: any) => d[valueKey]))
          const percentage = (item[valueKey] / maxValue) * 100
          
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item[dataKey]}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                <div 
                  className={`bg-${color}-500 h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                {item[valueKey]?.toLocaleString?.() || item[valueKey]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const SimplePieChart = ({ data, title }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data?.map((item: any, index: number) => {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500']
          const color = colors[index % colors.length]
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${color}`}></div>
                <span className="text-sm text-gray-700">{item.category || item.segment}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {item.percentage || Math.round((item.amount / data.reduce((sum: number, d: any) => sum + (d.amount || d.revenue), 0)) * 100)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const LineChart = ({ data, title, xKey, yKey }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data?.slice(-8).map((item: any, index: number) => {
          const value = item[yKey]
          const prevValue = index > 0 ? data[index - 1][yKey] : value
          const trend = value > prevValue ? '↗️' : value < prevValue ? '↘️' : '➡️'
          const trendColor = value > prevValue ? 'text-green-600' : value < prevValue ? 'text-red-600' : 'text-gray-600'
          
          return (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{item[xKey]}</span>
                <span className={`text-sm ${trendColor}`}>{trend}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {value?.toLocaleString?.()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const KPICard = ({ title, value, icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير المتقدمة</h1>
        <p className="text-gray-600">تحليلات شاملة ومفصلة مع رسوم بيانية تفاعلية</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-left text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => fetchReportData(activeTab)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              تحديث التقرير
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              تصدير PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { id: 'dashboard', name: 'لوحة المؤشرات', icon: '📊' },
              { id: 'financial', name: 'التقرير المالي', icon: '💰' },
              { id: 'projects', name: 'تحليل المشاريع', icon: '🏗️' },
              { id: 'partners', name: 'أداء الشركاء', icon: '👥' },
              { id: 'clients', name: 'تحليل العملاء', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التقرير...</p>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && reportData.dashboard && (
        <div className="space-y-8">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="إجمالي الإيرادات"
              value={`${reportData.dashboard.kpis?.totalRevenue?.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
              trend={12.5}
            />
            <KPICard
              title="صافي الربح"
              value={`${reportData.dashboard.kpis?.netProfit?.toLocaleString()} ر.س`}
              icon="📈"
              color="bg-blue-100"
              trend={8.3}
            />
            <KPICard
              title="هامش الربح"
              value={`${reportData.dashboard.kpis?.profitMargin}%`}
              icon="📊"
              color="bg-purple-100"
              trend={2.1}
            />
            <KPICard
              title="معدل العائد"
              value={`${reportData.dashboard.kpis?.roi}%`}
              icon="🎯"
              color="bg-orange-100"
              trend={5.2}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LineChart
              data={reportData.dashboard.monthlyTrend}
              title="اتجاه الإيرادات الشهرية"
              xKey="month"
              yKey="revenue"
            />
            <SimplePieChart
              data={reportData.dashboard.expenseBreakdown}
              title="توزيع المصروفات"
            />
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SimpleBarChart
              data={reportData.dashboard.topProjects}
              title="أفضل المشاريع ربحية"
              dataKey="name"
              valueKey="profit"
              color="green"
            />
            <SimpleBarChart
              data={reportData.dashboard.topPartners}
              title="أفضل الشركاء عائداً"
              dataKey="name"
              valueKey="returns"
              color="blue"
            />
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && reportData.financial && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KPICard
              title="إجمالي الإيرادات"
              value={`${reportData.financial.kpis?.totalRevenue?.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
            />
            <KPICard
              title="إجمالي المصروفات"
              value={`${reportData.financial.kpis?.totalExpenses?.toLocaleString()} ر.س`}
              icon="💸"
              color="bg-red-100"
            />
            <KPICard
              title="صافي الربح"
              value={`${reportData.financial.kpis?.netProfit?.toLocaleString()} ر.س`}
              icon="📈"
              color="bg-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SimpleBarChart
              data={reportData.financial.monthlyData}
              title="الإيرادات الشهرية"
              dataKey="month"
              valueKey="revenue"
              color="green"
            />
            <SimplePieChart
              data={reportData.financial.expenses}
              title="تصنيف المصروفات"
            />
          </div>

          <LineChart
            data={reportData.financial.cashflow}
            title="تدفق النقدية"
            xKey="date"
            yKey="balance"
          />
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && reportData.projects && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <KPICard
              title="إجمالي المشاريع"
              value={reportData.projects.summary?.totalProjects}
              icon="🏗️"
              color="bg-blue-100"
            />
            <KPICard
              title="الميزانية الإجمالية"
              value={`${reportData.projects.summary?.totalBudget?.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
            />
            <KPICard
              title="نسبة الإنجاز"
              value={`${reportData.projects.summary?.avgCompletion}%`}
              icon="📊"
              color="bg-purple-100"
            />
            <KPICard
              title="إجمالي الأرباح"
              value={`${reportData.projects.summary?.totalProfit?.toLocaleString()} ر.س`}
              icon="📈"
              color="bg-orange-100"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل المشاريع</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">اسم المشروع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الميزانية</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">المُنفق</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">نسبة الإنجاز</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الربح</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.projects.projects?.map((project: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{project.name}</td>
                      <td className="py-3 px-4 text-gray-600">{project.budget?.toLocaleString()} ر.س</td>
                      <td className="py-3 px-4 text-gray-600">{project.spent?.toLocaleString()} ر.س</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${project.completion}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{project.completion}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-600 font-semibold">
                        {project.profit?.toLocaleString()} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && reportData.partners && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <KPICard
              title="إجمالي الشركاء"
              value={reportData.partners.summary?.totalPartners}
              icon="👥"
              color="bg-blue-100"
            />
            <KPICard
              title="إجمالي الاستثمارات"
              value={`${reportData.partners.summary?.totalInvestment?.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
            />
            <KPICard
              title="إجمالي العوائد"
              value={`${reportData.partners.summary?.totalReturns?.toLocaleString()} ر.س`}
              icon="📈"
              color="bg-purple-100"
            />
            <KPICard
              title="متوسط العائد"
              value={`${reportData.partners.summary?.avgROI}%`}
              icon="🎯"
              color="bg-orange-100"
            />
          </div>

          <SimpleBarChart
            data={reportData.partners.partners}
            title="أداء الشركاء حسب العوائد"
            dataKey="name"
            valueKey="returns"
            color="purple"
          />
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && reportData.clients && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KPICard
              title="إجمالي العملاء"
              value={reportData.clients.summary?.totalClients}
              icon="👤"
              color="bg-blue-100"
            />
            <KPICard
              title="إجمالي الإيرادات"
              value={`${reportData.clients.summary?.totalRevenue?.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
            />
            <KPICard
              title="متوسط قيمة الصفقة"
              value={`${reportData.clients.summary?.avgDealSize?.toLocaleString()} ر.س`}
              icon="📊"
              color="bg-purple-100"
            />
          </div>

          <SimplePieChart
            data={reportData.clients.segments}
            title="توزيع العملاء حسب الفئة"
          />
        </div>
      )}
    </div>
  )
}