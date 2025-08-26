'use client'

import { useState, useEffect } from 'react'

interface Broker {
  id: number
  name: string
  phone: string
  email: string
  licenseNumber: string
  commissionRate: number
  totalSales: number
  totalCommissions: number
  status: string
  joinDate: string
  specialization: string
  paidCommissions?: number
  pendingCommissions?: number
  salesThisMonth?: number
}

interface Commission {
  id: number
  brokerId: number
  brokerName: string
  unitId: number
  unitNumber: string
  projectName: string
  clientName: string
  salePrice: number
  commissionRate: number
  commissionAmount: number
  saleDate: string
  paymentStatus: string
  paymentDate: string | null
  notes: string
}

interface DashboardStats {
  summary: {
    totalBrokers: number
    activeBrokers: number
    totalCommissionsValue: number
    paidCommissionsValue: number
    pendingCommissionsValue: number
    totalSalesValue: number
    totalUnits: number
    averageCommissionRate: number
  }
  monthlyData: Array<{
    month: string
    sales: number
    commissions: number
    volume: number
  }>
  topPerformers: Broker[]
}

export default function BrokerCommissionsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modals and forms
  const [showBrokerModal, setShowBrokerModal] = useState(false)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [brokerForm, setBrokerForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    commissionRate: 2.5,
    specialization: 'شقق سكنية'
  })
  const [commissionForm, setCommissionForm] = useState({
    brokerId: 0,
    unitId: 0,
    unitNumber: '',
    projectName: '',
    clientName: '',
    salePrice: 0,
    commissionRate: 2.5,
    saleDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Filters
  const [filters, setFilters] = useState({
    brokerId: '',
    status: 'all',
    startDate: '',
    endDate: ''
  })

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/broker-commissions?type=stats')
      const data = await response.json()
      
      if (data.success) {
        setDashboardStats(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب إحصائيات اللوحة')
    } finally {
      setLoading(false)
    }
  }

  // Fetch brokers
  const fetchBrokers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/broker-commissions?type=brokers')
      const data = await response.json()
      
      if (data.success) {
        setBrokers(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب بيانات الوسطاء')
    } finally {
      setLoading(false)
    }
  }

  // Fetch commissions
  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'commissions',
        ...filters
      })
      
      const response = await fetch(`/api/broker-commissions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCommissions(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب بيانات العمولات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats()
    } else if (activeTab === 'brokers') {
      fetchBrokers()
    } else if (activeTab === 'commissions') {
      fetchCommissions()
    }
  }, [activeTab, filters])

  // Create broker
  const handleCreateBroker = async () => {
    try {
      if (!brokerForm.name.trim() || !brokerForm.phone.trim()) {
        setError('يرجى إدخال البيانات المطلوبة')
        return
      }

      const response = await fetch('/api/broker-commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createBroker',
          ...brokerForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowBrokerModal(false)
        setBrokerForm({
          name: '',
          phone: '',
          email: '',
          licenseNumber: '',
          commissionRate: 2.5,
          specialization: 'شقق سكنية'
        })
        fetchBrokers()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إضافة الوسيط')
    }
  }

  // Create commission
  const handleCreateCommission = async () => {
    try {
      if (!commissionForm.brokerId || !commissionForm.clientName.trim() || commissionForm.salePrice <= 0) {
        setError('يرجى إدخال البيانات المطلوبة')
        return
      }

      const response = await fetch('/api/broker-commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCommission',
          ...commissionForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowCommissionModal(false)
        setCommissionForm({
          brokerId: 0,
          unitId: 0,
          unitNumber: '',
          projectName: '',
          clientName: '',
          salePrice: 0,
          commissionRate: 2.5,
          saleDate: new Date().toISOString().split('T')[0],
          notes: ''
        })
        fetchCommissions()
        fetchDashboardStats()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إضافة العمولة')
    }
  }

  // Update commission payment status
  const updateCommissionStatus = async (commissionId: number, status: string) => {
    try {
      const response = await fetch('/api/broker-commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCommissionStatus',
          commissionId,
          paymentStatus: status
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchCommissions()
        fetchDashboardStats()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في تحديث حالة الدفع')
    }
  }

  const KPICard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">عمولات الوسطاء</h1>
        <p className="text-gray-600">إدارة عمولات الوسطاء من بيع الوحدات العقارية</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
              { id: 'brokers', name: 'الوسطاء', icon: '👨‍💼' },
              { id: 'commissions', name: 'العمولات', icon: '💰' },
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
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardStats && (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="إجمالي الوسطاء"
              value={dashboardStats.summary.totalBrokers}
              icon="👨‍💼"
              color="bg-blue-100"
              subtitle={`${dashboardStats.summary.activeBrokers} نشط`}
            />
            <KPICard
              title="إجمالي العمولات"
              value={`${dashboardStats.summary.totalCommissionsValue.toLocaleString()} ر.س`}
              icon="💰"
              color="bg-green-100"
              subtitle={`${dashboardStats.summary.totalUnits} وحدة مباعة`}
            />
            <KPICard
              title="العمولات المدفوعة"
              value={`${dashboardStats.summary.paidCommissionsValue.toLocaleString()} ر.س`}
              icon="✅"
              color="bg-purple-100"
            />
            <KPICard
              title="العمولات المعلقة"
              value={`${dashboardStats.summary.pendingCommissionsValue.toLocaleString()} ر.س`}
              icon="⏳"
              color="bg-orange-100"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Performance */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الأداء الشهري</h3>
              <div className="space-y-4">
                {dashboardStats.monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{month.month}</span>
                      <p className="text-xs text-gray-500">{month.sales} عملية بيع</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {month.commissions.toLocaleString()} ر.س
                      </span>
                      <p className="text-xs text-gray-500">
                        حجم: {month.volume.toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل الوسطاء</h3>
              <div className="space-y-4">
                {dashboardStats.topPerformers.map((broker, index) => (
                  <div key={broker.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{broker.name}</span>
                        <p className="text-xs text-gray-500">{broker.totalSales} عملية بيع</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {broker.totalCommissions.toLocaleString()} ر.س
                      </span>
                      <p className="text-xs text-gray-500">{broker.commissionRate}% معدل</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brokers Tab */}
      {activeTab === 'brokers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">قائمة الوسطاء</h2>
            <button
              onClick={() => setShowBrokerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              إضافة وسيط جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker) => (
              <div key={broker.id} className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{broker.name}</h3>
                    <p className="text-sm text-gray-600">{broker.specialization}</p>
                    <p className="text-xs text-gray-500">رخصة: {broker.licenseNumber}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    broker.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {broker.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">نسبة العمولة:</span>
                    <span className="font-semibold">{broker.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">إجمالي المبيعات:</span>
                    <span className="font-semibold">{broker.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">إجمالي العمولات:</span>
                    <span className="font-semibold text-green-600">
                      {broker.totalCommissions.toLocaleString()} ر.س
                    </span>
                  </div>
                  {broker.paidCommissions !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">مدفوع:</span>
                        <span className="font-semibold text-blue-600">
                          {broker.paidCommissions.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">معلق:</span>
                        <span className="font-semibold text-orange-600">
                          {broker.pendingCommissions?.toLocaleString()} ر.س
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📞 {broker.phone}</span>
                    <span>📧 {broker.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    انضم في: {new Date(broker.joinDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">سجل العمولات</h2>
            <button
              onClick={() => setShowCommissionModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              إضافة عمولة جديدة
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوسيط</label>
                <select
                  value={filters.brokerId}
                  onChange={(e) => setFilters({ ...filters, brokerId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">جميع الوسطاء</option>
                  {brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="paid">مدفوع</option>
                  <option value="pending">معلق</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الوسيط</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الوحدة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">العميل</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">سعر البيع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">نسبة العمولة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">مبلغ العمولة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">تاريخ البيع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">حالة الدفع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-gray-900">{commission.brokerName}</span>
                          <p className="text-sm text-gray-500">{commission.projectName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{commission.unitNumber}</td>
                      <td className="py-3 px-4 text-gray-900">{commission.clientName}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {commission.salePrice.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">{commission.commissionRate}%</td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        {commission.commissionAmount.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(commission.saleDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          commission.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {commission.paymentStatus === 'paid' ? 'مدفوع' : 'معلق'}
                        </span>
                        {commission.paymentDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(commission.paymentDate).toLocaleDateString('ar-SA')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {commission.paymentStatus === 'pending' && (
                          <button
                            onClick={() => updateCommissionStatus(commission.id, 'paid')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            تأكيد الدفع
                          </button>
                        )}
                        {commission.paymentStatus === 'paid' && (
                          <button
                            onClick={() => updateCommissionStatus(commission.id, 'pending')}
                            className="text-orange-600 hover:text-orange-800 text-sm"
                          >
                            إلغاء الدفع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Broker Modal */}
      {showBrokerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة وسيط جديد</h3>
              <button
                onClick={() => setShowBrokerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم *
                </label>
                <input
                  type="text"
                  value={brokerForm.name}
                  onChange={(e) => setBrokerForm({ ...brokerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="أدخل اسم الوسيط"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={brokerForm.phone}
                    onChange={(e) => setBrokerForm({ ...brokerForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نسبة العمولة (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={brokerForm.commissionRate}
                    onChange={(e) => setBrokerForm({ ...brokerForm, commissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={brokerForm.email}
                  onChange={(e) => setBrokerForm({ ...brokerForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="broker@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الرخصة
                </label>
                <input
                  type="text"
                  value={brokerForm.licenseNumber}
                  onChange={(e) => setBrokerForm({ ...brokerForm, licenseNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="BRK-2024-XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التخصص
                </label>
                <select
                  value={brokerForm.specialization}
                  onChange={(e) => setBrokerForm({ ...brokerForm, specialization: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="شقق سكنية">شقق سكنية</option>
                  <option value="فلل وقصور">فلل وقصور</option>
                  <option value="شقق تجارية">شقق تجارية</option>
                  <option value="أراضي">أراضي</option>
                  <option value="عام">عام</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBrokerModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateBroker}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إضافة الوسيط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة عمولة جديدة</h3>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوسيط *
                </label>
                <select
                  value={commissionForm.brokerId}
                  onChange={(e) => {
                    const brokerId = parseInt(e.target.value)
                    const broker = brokers.find(b => b.id === brokerId)
                    setCommissionForm({ 
                      ...commissionForm, 
                      brokerId,
                      commissionRate: broker?.commissionRate || 2.5
                    })
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={0}>اختر الوسيط</option>
                  {brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name} ({broker.commissionRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الوحدة *
                  </label>
                  <input
                    type="text"
                    value={commissionForm.unitNumber}
                    onChange={(e) => setCommissionForm({ ...commissionForm, unitNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="A-101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المشروع
                  </label>
                  <input
                    type="text"
                    value={commissionForm.projectName}
                    onChange={(e) => setCommissionForm({ ...commissionForm, projectName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="اسم المشروع"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={commissionForm.clientName}
                  onChange={(e) => setCommissionForm({ ...commissionForm, clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سعر البيع (ر.س) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={commissionForm.salePrice}
                    onChange={(e) => setCommissionForm({ ...commissionForm, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نسبة العمولة (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={commissionForm.commissionRate}
                    onChange={(e) => setCommissionForm({ ...commissionForm, commissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ البيع
                </label>
                <input
                  type="date"
                  value={commissionForm.saleDate}
                  onChange={(e) => setCommissionForm({ ...commissionForm, saleDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  value={commissionForm.notes}
                  onChange={(e) => setCommissionForm({ ...commissionForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="ملاحظات إضافية"
                />
              </div>

              {commissionForm.salePrice > 0 && commissionForm.commissionRate > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>مبلغ العمولة المحسوب:</strong>{' '}
                    {((commissionForm.salePrice * commissionForm.commissionRate) / 100).toLocaleString()} ر.س
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateCommission}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                إضافة العمولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}