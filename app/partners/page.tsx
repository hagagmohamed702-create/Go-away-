'use client'

import { useState, useEffect } from 'react'

interface Partner {
  id: number
  name: string
  sharePercentage: number
  walletBalance: number
  phone: string
  email: string
  status: string
  joinDate: string
  totalInvestment: number
  totalReturns: number
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPartner, setNewPartner] = useState({
    name: '',
    sharePercentage: '',
    phone: '',
    email: '',
    totalInvestment: ''
  })

  // Fetch partners
  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/partners')
      const data = await response.json()
      
      if (data.success) {
        setPartners(data.data || [])
      } else {
        setError(data.error || 'خطأ في جلب البيانات')
      }
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  // Add new partner
  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError('')
      
      // Validation
      if (!newPartner.name.trim()) {
        setError('يرجى إدخال اسم الشريك')
        return
      }
      
      if (!newPartner.phone.trim()) {
        setError('يرجى إدخال رقم الهاتف')
        return
      }

      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPartner.name,
          sharePercentage: parseFloat(newPartner.sharePercentage) || 0,
          phone: newPartner.phone,
          email: newPartner.email,
          totalInvestment: parseFloat(newPartner.totalInvestment) || 0
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchPartners()
        setShowAddForm(false)
        setNewPartner({
          name: '',
          sharePercentage: '',
          phone: '',
          email: '',
          totalInvestment: ''
        })
        alert('تم إضافة الشريك بنجاح!')
      } else {
        setError(result.error || 'خطأ في إضافة الشريك')
      }
    } catch (err) {
      console.error('Error adding partner:', err)
      setError('خطأ في الاتصال بالخادم')
    }
  }

  // Calculate stats
  const totalInvestment = partners.reduce((sum, partner) => sum + partner.totalInvestment, 0)
  const totalReturns = partners.reduce((sum, partner) => sum + partner.totalReturns, 0)
  const activePartners = partners.filter(p => p.status === 'نشط').length

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الشركاء</h1>
          <p className="text-gray-600">إدارة شركاء الشركة ونسب مشاركتهم</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إضافة شريك جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-left text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الشركاء</h3>
          <div className="text-2xl font-bold mt-2">{partners.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">الشركاء النشطون</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">{activePartners}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الاستثمارات</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {totalInvestment.toLocaleString()} ر.س
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي العوائد</h3>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {totalReturns.toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة الشركاء</h2>
          <p className="text-sm text-gray-600">عرض جميع شركاء الشركة</p>
        </div>
        <div className="p-6">
          {partners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد شركاء مسجلين حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">نسبة المشاركة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">رصيد المحفظة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الهاتف</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجمالي الاستثمار</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">العوائد</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">تاريخ الانضمام</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{partner.name}</td>
                      <td className="py-3 px-4 text-gray-900">{partner.sharePercentage}%</td>
                      <td className="py-3 px-4 text-gray-900">
                        {partner.walletBalance.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">{partner.phone}</td>
                      <td className="py-3 px-4 text-gray-900">{partner.email}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {partner.totalInvestment.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-green-600 font-semibold">
                        {partner.totalReturns.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          partner.status === 'نشط'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(partner.joinDate).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة شريك جديد</h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الشريك *
                </label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم الشريك"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نسبة المشاركة (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newPartner.sharePercentage}
                    onChange={(e) => setNewPartner({ ...newPartner, sharePercentage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="partner@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  إجمالي الاستثمار (ر.س)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPartner.totalInvestment}
                  onChange={(e) => setNewPartner({ ...newPartner, totalInvestment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000000"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة الشريك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}