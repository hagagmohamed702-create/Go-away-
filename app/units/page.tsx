'use client'

import { useState, useEffect } from 'react'

interface Unit {
  id: number
  name: string
  code: string
  price: number
  status: string
  type: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setUnits([
        { id: 1, name: 'شقة 101 - عمارة أ', code: 'A101', price: 500000, status: 'متاحة', type: 'سكني' },
        { id: 2, name: 'شقة 102 - عمارة أ', code: 'A102', price: 550000, status: 'مباعة', type: 'سكني' },
        { id: 3, name: 'محل 1 - عمارة ب', code: 'B001', price: 800000, status: 'متاحة', type: 'تجاري' }
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
        <h1 className="text-3xl font-bold mb-2">إدارة الوحدات</h1>
        <p className="text-gray-600">إدارة الوحدات السكنية والتجارية</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الوحدات</h3>
          <div className="text-2xl font-bold mt-2">{units.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">الوحدات المتاحة</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {units.filter((u) => u.status === 'متاحة').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">الوحدات المباعة</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {units.filter((u) => u.status === 'مباعة').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي القيمة</h3>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {formatCurrency(units.reduce((sum, unit) => sum + unit.price, 0))}
          </div>
        </div>
      </div>

      {/* Units Grid */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة الوحدات</h2>
          <p className="text-sm text-gray-600">عرض جميع الوحدات السكنية والتجارية</p>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <div key={unit.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{unit.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    unit.status === 'متاحة' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {unit.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الكود:</span>
                    <span>{unit.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">النوع:</span>
                    <span>{unit.type}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">السعر:</span>
                    <span className="text-blue-600">{formatCurrency(unit.price)}</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    تعديل
                  </button>
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 text-red-600">
                    حذف
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