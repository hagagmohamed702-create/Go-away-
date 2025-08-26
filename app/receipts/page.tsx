'use client'

import { useState, useEffect } from 'react'

interface Receipt {
  id: number
  voucherNumber: string
  type: string
  amount: number
  clientName?: string
  contractNumber?: string
  supplierName?: string
  projectName?: string
  description: string
  date: string
  cashboxName: string
  status: string
  createdBy: string
  paymentMethod: string
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 })
  const [newReceipt, setNewReceipt] = useState({
    type: 'قبض',
    amount: '',
    clientName: '',
    contractNumber: '',
    supplierName: '',
    projectName: '',
    description: '',
    cashboxName: 'الخزينة الرئيسية',
    paymentMethod: 'نقدي'
  })

  useEffect(() => {
    fetchReceipts()
  }, [filterType, filterStatus])

  const fetchReceipts = async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      
      const response = await fetch(`/api/receipts?${params}`)
      const data = await response.json()
      if (data.success) {
        setReceipts(data.data)
        setTotals(data.totals)
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newReceipt.type,
          amount: parseFloat(newReceipt.amount),
          clientName: newReceipt.clientName,
          contractNumber: newReceipt.contractNumber,
          supplierName: newReceipt.supplierName,
          projectName: newReceipt.projectName,
          description: newReceipt.description,
          cashboxName: newReceipt.cashboxName,
          paymentMethod: newReceipt.paymentMethod
        }),
      })

      if (response.ok) {
        await fetchReceipts()
        setShowAddForm(false)
        setNewReceipt({
          type: 'قبض',
          amount: '',
          clientName: '',
          contractNumber: '',
          supplierName: '',
          projectName: '',
          description: '',
          cashboxName: 'الخزينة الرئيسية',
          paymentMethod: 'نقدي'
        })
        alert('تم إضافة السند بنجاح!')
      }
    } catch (error) {
      console.error('Error adding receipt:', error)
      alert('حدث خطأ في إضافة السند')
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
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">جاري تحميل بيانات السندات...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة السندات</h1>
          <p className="text-gray-600">إدارة سندات القبض والصرف</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة سند جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي السندات</p>
              <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي القبض</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.income)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الصرف</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.expense)}
              </p>
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
              <p className="text-sm font-medium text-gray-500">صافي التدفق</p>
              <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.net)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totals.net >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع السند</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">جميع الأنواع</option>
              <option value="قبض">سندات القبض</option>
              <option value="صرف">سندات الصرف</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">جميع الحالات</option>
              <option value="مؤكد">مؤكد</option>
              <option value="معلق">معلق</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Receipt Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">إضافة سند جديد</h2>
            <form onSubmit={handleAddReceipt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع السند</label>
                <select
                  value={newReceipt.type}
                  onChange={(e) => setNewReceipt({ ...newReceipt, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="قبض">سند قبض</option>
                  <option value="صرف">سند صرف</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                <input
                  type="number"
                  value={newReceipt.amount}
                  onChange={(e) => setNewReceipt({ ...newReceipt, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {newReceipt.type === 'قبض' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                    <input
                      type="text"
                      value={newReceipt.clientName}
                      onChange={(e) => setNewReceipt({ ...newReceipt, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد</label>
                    <input
                      type="text"
                      value={newReceipt.contractNumber}
                      onChange={(e) => setNewReceipt({ ...newReceipt, contractNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المورد</label>
                    <input
                      type="text"
                      value={newReceipt.supplierName}
                      onChange={(e) => setNewReceipt({ ...newReceipt, supplierName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشروع</label>
                    <input
                      type="text"
                      value={newReceipt.projectName}
                      onChange={(e) => setNewReceipt({ ...newReceipt, projectName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={newReceipt.description}
                  onChange={(e) => setNewReceipt({ ...newReceipt, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الخزينة</label>
                <select
                  value={newReceipt.cashboxName}
                  onChange={(e) => setNewReceipt({ ...newReceipt, cashboxName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="الخزينة الرئيسية">الخزينة الرئيسية</option>
                  <option value="خزينة الشركاء">خزينة الشركاء</option>
                  <option value="خزينة المشاريع">خزينة المشاريع</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select
                  value={newReceipt.paymentMethod}
                  onChange={(e) => setNewReceipt({ ...newReceipt, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="نقدي">نقدي</option>
                  <option value="شيك">شيك</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="بطاقة ائتمان">بطاقة ائتمان</option>
                </select>
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

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة السندات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم السند</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطرف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{receipt.voucherNumber}</div>
                    <div className="text-sm text-gray-500">{receipt.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      receipt.type === 'قبض' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {receipt.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      receipt.type === 'قبض' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {receipt.type === 'قبض' ? '+' : '-'}{formatCurrency(receipt.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {receipt.type === 'قبض' ? receipt.clientName : receipt.supplierName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receipt.type === 'قبض' ? receipt.contractNumber : receipt.projectName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {receipt.description}
                    </div>
                    <div className="text-sm text-gray-500">{receipt.cashboxName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(receipt.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      receipt.status === 'مؤكد' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {receipt.status}
                    </span>
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