'use client'

import { useState, useEffect } from 'react'

interface Contract {
  id: number
  contractNumber: string
  clientName: string
  unitName: string
  totalValue: number
  downPayment: number
  installmentCount: number
  installmentAmount: number
  status: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setContracts([
        { 
          id: 1, 
          contractNumber: 'C-2024-001', 
          clientName: 'أحمد محمد', 
          unitName: 'شقة 101 - عمارة أ',
          totalValue: 500000,
          downPayment: 100000,
          installmentCount: 12,
          installmentAmount: 33333,
          status: 'نشط'
        },
        { 
          id: 2, 
          contractNumber: 'C-2024-002', 
          clientName: 'فاطمة علي', 
          unitName: 'شقة 102 - عمارة أ',
          totalValue: 550000,
          downPayment: 150000,
          installmentCount: 18,
          installmentAmount: 22222,
          status: 'نشط'
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة العقود</h1>
        <p className="text-gray-600">إنشاء ومتابعة عقود البيع والأقساط</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي العقود</h3>
          <div className="text-2xl font-bold mt-2">{contracts.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">العقود النشطة</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {contracts.filter((c) => c.status === 'نشط').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي المبيعات</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(contracts.reduce((sum, contract) => sum + contract.totalValue, 0))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي المقدمات</h3>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {formatCurrency(contracts.reduce((sum, contract) => sum + contract.downPayment, 0))}
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة العقود</h2>
          <p className="text-sm text-gray-600">عرض جميع العقود مع تفاصيل الأقساط</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{contract.contractNumber}</h3>
                    <p className="text-sm text-gray-500">{contract.clientName} | {contract.unitName}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {contract.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">قيمة الوحدة:</span>
                    <div className="font-medium text-blue-600">{formatCurrency(contract.totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">المقدم:</span>
                    <div className="font-medium text-green-600">{formatCurrency(contract.downPayment)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">عدد الأقساط:</span>
                    <div className="font-medium">{contract.installmentCount} قسط</div>
                  </div>
                  <div>
                    <span className="text-gray-500">قيمة القسط:</span>
                    <div className="font-medium text-orange-600">{formatCurrency(contract.installmentAmount)}</div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse mt-3">
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    عرض التفاصيل
                  </button>
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    تعديل
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