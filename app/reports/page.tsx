'use client'

import { useState, useEffect } from 'react'

interface ReportData {
  totalClients: number
  totalUnits: number
  totalContracts: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
  overdueInstallments: number
  activeProjects: number
  totalInventoryValue: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalClients: 0,
    totalUnits: 0,
    totalContracts: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    overdueInstallments: 0,
    activeProjects: 0,
    totalInventoryValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      // Simulate API calls to get aggregated data
      setReportData({
        totalClients: 25,
        totalUnits: 45,
        totalContracts: 32,
        totalIncome: 4250000,
        totalExpenses: 2100000,
        netProfit: 2150000,
        overdueInstallments: 3,
        activeProjects: 4,
        totalInventoryValue: 8750000
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG')
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">جاري تحميل بيانات التقارير...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والتحليلات المالية</h1>
          <p className="text-gray-600">تقارير شاملة عن الأداء المالي والتشغيلي</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            تصدير PDF
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع التقرير</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="overview">نظرة عامة</option>
              <option value="financial">التقرير المالي</option>
              <option value="clients">تقرير العملاء</option>
              <option value="projects">تقرير المشاريع</option>
              <option value="inventory">تقرير المخزون</option>
            </select>
          </div>
          <button
            onClick={fetchReportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تحديث
          </button>
        </div>
      </div>

      {/* Overview Dashboard */}
      {selectedReport === 'overview' && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalClients}</p>
                  <p className="text-xs text-green-600 mt-1">↗ زيادة 12% عن الشهر الماضي</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalIncome)}</p>
                  <p className="text-xs text-green-600 mt-1">↗ زيادة 8% عن الشهر الماضي</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                  <p className="text-xs text-red-600 mt-1">↗ زيادة 5% عن الشهر الماضي</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">صافي الربح</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.netProfit)}</p>
                  <p className="text-xs text-green-600 mt-1">↗ زيادة 15% عن الشهر الماضي</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Detailed Reports */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">الإيرادات مقابل المصروفات</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الإيرادات</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(reportData.totalIncome)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600">المصروفات</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(reportData.totalExpenses)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm font-medium text-gray-900">صافي الربح</span>
                    <span className="text-sm font-bold text-purple-600">{formatCurrency(reportData.netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">مؤشرات الأداء</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">معدل التحصيل</p>
                      <p className="text-xs text-gray-500">نسبة الأقساط المحصلة</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">85%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">معدل إشغال الوحدات</p>
                      <p className="text-xs text-gray-500">نسبة الوحدات المباعة</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">71%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">تقدم المشاريع</p>
                      <p className="text-xs text-gray-500">متوسط تقدم المشاريع</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">64%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">العقود النشطة</p>
                  <p className="text-lg font-bold text-gray-900">{reportData.totalContracts}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">الوحدات المتاحة</p>
                  <p className="text-lg font-bold text-gray-900">{reportData.totalUnits}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">أقساط متأخرة</p>
                  <p className="text-lg font-bold text-red-600">{reportData.overdueInstallments}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">قيمة المخزون</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(reportData.totalInventoryValue)}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Financial Report */}
      {selectedReport === 'financial' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">التقرير المالي التفصيلي</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">الإيرادات</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مبيعات الوحدات</span>
                    <span className="text-sm font-medium">{formatCurrency(3200000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">أقساط محصلة</span>
                    <span className="text-sm font-medium">{formatCurrency(850000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">إيرادات أخرى</span>
                    <span className="text-sm font-medium">{formatCurrency(200000)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span className="text-sm">إجمالي الإيرادات</span>
                    <span className="text-sm text-green-600">{formatCurrency(reportData.totalIncome)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">المصروفات</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">تكاليف المشاريع</span>
                    <span className="text-sm font-medium">{formatCurrency(1200000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مصروفات تشغيلية</span>
                    <span className="text-sm font-medium">{formatCurrency(450000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">رواتب ومصروفات إدارية</span>
                    <span className="text-sm font-medium">{formatCurrency(350000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مصروفات أخرى</span>
                    <span className="text-sm font-medium">{formatCurrency(100000)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span className="text-sm">إجمالي المصروفات</span>
                    <span className="text-sm text-red-600">{formatCurrency(reportData.totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">صافي الربح</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(reportData.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other report types can be added similarly */}
      {selectedReport !== 'overview' && selectedReport !== 'financial' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">تقرير {selectedReport}</h3>
            <p className="text-gray-600">سيتم إضافة هذا التقرير قريباً...</p>
          </div>
        </div>
      )}
    </div>
  )
}