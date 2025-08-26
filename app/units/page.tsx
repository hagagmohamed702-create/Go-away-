'use client'

import { useState, useEffect } from 'react'

interface Unit {
  id: number
  number: string
  type: string
  area: number
  floor: number
  building: string
  project: string
  price: number
  status: string
  description: string
  features: string[]
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    type: 'شقة',
    area: '',
    floor: '',
    building: '',
    project: '',
    price: '',
    description: '',
    features: ''
  })

  // Load units on component mount
  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/units')
      
      if (!response.ok) {
        throw new Error('Failed to fetch units')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUnits(data.data || [])
      } else {
        setError(data.error || 'خطأ في جلب البيانات')
      }
    } catch (err) {
      console.error('Error loading units:', err)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = async () => {
    if (!formData.number.trim() || !formData.price.trim()) {
      setError('رقم الوحدة والسعر مطلوبان')
      return
    }

    try {
      setError('')
      
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          area: parseFloat(formData.area) || 0,
          floor: parseInt(formData.floor) || 1,
          price: parseFloat(formData.price) || 0,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          number: '', type: 'شقة', area: '', floor: '', building: '',
          project: '', price: '', description: '', features: ''
        })
        await loadUnits()
        alert('تم إضافة الوحدة بنجاح!')
      } else {
        setError(data.error || 'خطأ في إضافة الوحدة')
      }
    } catch (err) {
      console.error('Error adding unit:', err)
      setError('خطأ في إضافة الوحدة')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'متاح': return 'bg-green-100 text-green-800'
      case 'محجوز': return 'bg-yellow-100 text-yellow-800'
      case 'مباع': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">خطأ</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadUnits}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الوحدات</h1>
          <p className="text-gray-600">إدارة الوحدات العقارية والمشاريع</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          إضافة وحدة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الوحدات</h3>
          <p className="text-2xl font-bold text-gray-900">{units.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">الوحدات المتاحة</h3>
          <p className="text-2xl font-bold text-green-600">
            {units.filter(u => u.status === 'متاح').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">الوحدات المحجوزة</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {units.filter(u => u.status === 'محجوز').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">الوحدات المباعة</h3>
          <p className="text-2xl font-bold text-red-600">
            {units.filter(u => u.status === 'مباع').length}
          </p>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">وحدة {unit.number}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(unit.status)}`}>
                  {unit.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>النوع:</span>
                  <span className="font-medium">{unit.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>المساحة:</span>
                  <span className="font-medium">{unit.area} م²</span>
                </div>
                <div className="flex justify-between">
                  <span>الطابق:</span>
                  <span className="font-medium">{unit.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span>المبنى:</span>
                  <span className="font-medium">{unit.building}</span>
                </div>
                <div className="flex justify-between">
                  <span>المشروع:</span>
                  <span className="font-medium">{unit.project}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-3">
                  <span>السعر:</span>
                  <span className="font-bold text-blue-600">
                    {unit.price.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
              
              {unit.description && (
                <p className="mt-3 text-sm text-gray-500">{unit.description}</p>
              )}
              
              {unit.features && unit.features.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {unit.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {feature}
                      </span>
                    ))}
                    {unit.features.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{unit.features.length - 3} المزيد
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد وحدات مسجلة حالياً</p>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة وحدة جديدة</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الوحدة *</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A101"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="شقة">شقة</option>
                    <option value="فيلا">فيلا</option>
                    <option value="مكتب">مكتب</option>
                    <option value="محل">محل</option>
                    <option value="مستودع">مستودع</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الطابق</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبنى</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مبنى A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المشروع</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الواحة السكنية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ر.س) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="وصف الوحدة..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المميزات (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="بلكونة, موقف سيارة, حديقة"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddUnit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                  setFormData({
                    number: '', type: 'شقة', area: '', floor: '', building: '',
                    project: '', price: '', description: '', features: ''
                  })
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}