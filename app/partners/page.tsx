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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPartner, setNewPartner] = useState({
    name: '',
    sharePercentage: '',
    phone: '',
    email: '',
    totalInvestment: ''
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners')
      const data = await response.json()
      if (data.success) {
        setPartners(data.data)
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPartner.name,
          sharePercentage: parseFloat(newPartner.sharePercentage),
          phone: newPartner.phone,
          email: newPartner.email,
          totalInvestment: parseFloat(newPartner.totalInvestment)
        }),
      })

      if (response.ok) {
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
      }
    } catch (error) {
      console.error('Error adding partner:', error)
      alert('حدث خطأ في إضافة الشريك')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">جاري تحميل بيانات الشركاء...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الشركاء</h1>
          <p className="text-gray-600">إدارة الشركاء ومحافظهم المالية والتسويات</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة شريك جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الشركاء</p>
              <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المحافظ</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(partners.reduce((sum, p) => sum + p.walletBalance, 0))}
              </p>
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
              <p className="text-sm font-medium text-gray-500">إجمالي الاستثمارات</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(partners.reduce((sum, p) => sum + p.totalInvestment, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي العوائد</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(partners.reduce((sum, p) => sum + p.totalReturns, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add Partner Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">إضافة شريك جديد</h2>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشريك</label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نسبة المشاركة (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPartner.sharePercentage}
                  onChange={(e) => setNewPartner({ ...newPartner, sharePercentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الاستثمار الأولي</label>
                <input
                  type="number"
                  value={newPartner.totalInvestment}
                  onChange={(e) => setNewPartner({ ...newPartner, totalInvestment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة الشركاء</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشريك</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نسبة المشاركة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رصيد المحفظة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الاستثمار</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي العوائد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-blue-600">{partner.sharePercentage}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(partner.walletBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {formatCurrency(partner.totalInvestment)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-orange-600">
                      {formatCurrency(partner.totalReturns)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(partner.joinDate).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}