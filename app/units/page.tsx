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

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/units')
      const data = await response.json()
      
      if (data.success) {
        setUnits(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب بيانات الوحدات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Add new unit
  const handleAddUnit = async () => {
    try {
      if (!formData.number.trim() || !formData.area || !formData.price) {
        setError('يرجى إدخال رقم الوحدة والمساحة والسعر على الأقل')
        return
      }

      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          area: parseFloat(formData.area),
          floor: parseInt(formData.floor) || 0,
          price: parseFloat(formData.price),
          features: formData.features.split(',').map(f => f.trim()).filter(f => f)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
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
        fetchUnits()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إضافة الوحدة')
    }
  }

  // Update unit status
  const updateUnitStatus = async (unitId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/units', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: unitId,
          status: newStatus
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchUnits()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في تحديث حالة الوحدة')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'متاح': return 'bg-green-100 text-green-800'
      case 'محجوز': return 'bg-yellow-100 text-yellow-800'
      case 'مباع': return 'bg-red-100 text-red-800'
      case 'قيد الصيانة': return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الوحدات</h1>
          <p className="text-gray-600">إدارة الوحدات السكنية والتجارية</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إضافة وحدة جديدة
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
          <h3 className="text-sm font-medium text-gray-500">إجمالي الوحدات</h3>
          <div className="text-2xl font-bold mt-2">{units.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">وحدات متاحة</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {units.filter((u) => u.status === 'متاح').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">وحدات مباعة</h3>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {units.filter((u) => u.status === 'مباع').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">القيمة الإجمالية</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {units.reduce((sum, u) => sum + u.price, 0).toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* Units Grid */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة الوحدات</h2>
          <p className="text-sm text-gray-600">عرض جميع الوحدات المتاحة</p>
        </div>
        <div className="p-6">
          {units.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد وحدات مسجلة حتى الآن
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit) => (
                <div key={unit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {unit.type} {unit.number}
                      </h3>
                      <p className="text-sm text-gray-600">{unit.project}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>المساحة:</span>
                      <span className="font-semibold">{unit.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطابق:</span>
                      <span className="font-semibold">{unit.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المبنى:</span>
                      <span className="font-semibold">{unit.building}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>السعر:</span>
                      <span className="font-semibold text-green-600">
                        {unit.price.toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>

                  {unit.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">المميزات:</p>
                      <div className="flex flex-wrap gap-1">
                        {unit.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <select
                      value={unit.status}
                      onChange={(e) => updateUnitStatus(unit.id, e.target.value)}
                      className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="متاح">متاح</option>
                      <option value="محجوز">محجوز</option>
                      <option value="مباع">مباع</option>
                      <option value="قيد الصيانة">قيد الصيانة</option>
                    </select>
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة وحدة جديدة</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الوحدة *
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="A-101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الوحدة
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="شقة">شقة</option>
                    <option value="فيلا">فيلا</option>
                    <option value="دوبلكس">دوبلكس</option>
                    <option value="محل تجاري">محل تجاري</option>
                    <option value="مكتب">مكتب</option>
                    <option value="مستودع">مستودع</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المساحة (م²) *
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الطابق
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المبنى
                  </label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="المبنى أ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المشروع
                  </label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="اسم المشروع"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر (ر.س) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="وصف الوحدة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المميزات (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="مصعد، موقف سيارة، بلكونة"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إضافة الوحدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}