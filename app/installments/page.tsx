'use client'

import { useState, useEffect } from 'react'

interface Installment {
  id: number
  contractNumber: string
  clientName: string
  installmentNumber: number
  amount: number
  dueDate: string
  paidAmount: number
  status: string
}

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setInstallments([
        { 
          id: 1, 
          contractNumber: 'C-2024-001',
          clientName: 'أحمد محمد',
          installmentNumber: 1,
          amount: 33333,
          dueDate: '2024-01-15',
          paidAmount: 33333,
          status: 'مدفوع'
        },
        { 
          id: 2, 
          contractNumber: 'C-2024-001',
          clientName: 'أحمد محمد',
          installmentNumber: 2,
          amount: 33333,
          dueDate: '2024-02-15',
          paidAmount: 20000,
          status: 'مدفوع جزئياً'
        },
        { 
          id: 3, 
          contractNumber: 'C-2024-001',
          clientName: 'أحمد محمد',
          installmentNumber: 3,
          amount: 33333,
          dueDate: '2024-03-15',
          paidAmount: 0,
          status: 'متأخر'
        },
        { 
          id: 4, 
          contractNumber: 'C-2024-002',
          clientName: 'فاطمة علي',
          installmentNumber: 1,
          amount: 22222,
          dueDate: '2024-01-20',
          paidAmount: 22222,
          status: 'مدفوع'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوع': return 'bg-green-100 text-green-800'
      case 'مدفوع جزئياً': return 'bg-yellow-100 text-yellow-800'
      case 'متأخر': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: installments.length,
    paid: installments.filter((i) => i.status === 'مدفوع').length,
    overdue: installments.filter((i) => i.status === 'متأخر').length,
    totalAmount: installments.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: installments.reduce((sum, i) => sum + i.paidAmount, 0)
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة الأقساط</h1>
        <p className="text-gray-600">متابعة المدفوعات والأقساط المستحقة</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الأقساط</h3>
          <div className="text-2xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">مدفوعة</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.paid}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">متأخرة</h3>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.overdue}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي المبلغ</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(stats.totalAmount)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">المدفوع</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(stats.paidAmount)}
          </div>
        </div>
      </div>

      {/* Installments List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة الأقساط</h2>
          <p className="text-sm text-gray-600">عرض جميع الأقساط مع حالات الدفع</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {installments.map((installment) => (
              <div key={installment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">
                      {installment.contractNumber} - القسط {installment.installmentNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {installment.clientName} | استحقاق: {formatDate(installment.dueDate)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(installment.status)}`}>
                    {installment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">المبلغ المطلوب:</span>
                    <div className="font-medium text-blue-600">{formatCurrency(installment.amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">المدفوع:</span>
                    <div className="font-medium text-green-600">{formatCurrency(installment.paidAmount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">المتبقي:</span>
                    <div className="font-medium text-red-600">
                      {formatCurrency(installment.amount - installment.paidAmount)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse mt-3">
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    تسجيل دفعة
                  </button>
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}