'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: number
  name: string
  code: string
  phone: string
  email: string
  address: string
  nationalId: string
  status: string
  joinDate: string
  totalContracts: number
  totalValue: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: ''
  })

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Fetching clients...')
      const response = await fetch('/api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      
      if (data.success) {
        setClients(data.data || [])
      } else {
        setError(data.error || 'خطأ في جلب البيانات')
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('خطأ في الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Add new client
  const handleAddClient = async () => {
    if (saving) return
    
    try {
      setSaving(true)
      setError('')
      
      // Validation
      if (!formData.name.trim()) {
        setError('يرجى إدخال اسم العميل')
        return
      }
      
      if (!formData.phone.trim()) {
        setError('يرجى إدخال رقم الهاتف')
        return
      }

      console.log('Adding client:', formData)
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('Add response status:', response.status)
      
      // Get response text first to handle parsing errors
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
        console.log('Add response data:', data)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error(`خطأ في تحليل استجابة الخادم: ${responseText}`)
      }
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      if (data.success) {
        console.log('✅ Client added successfully:', data.data)
        setShowAddModal(false)
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          nationalId: ''
        })
        // Refresh the clients list
        await fetchClients()
        alert('تم إضافة العميل بنجاح!')
      } else {
        console.error('❌ Failed to add client:', data.error)
        setError(data.error || 'خطأ في إضافة العميل')
      }
    } catch (err) {
      console.error('Error adding client:', err)
      setError('خطأ في إضافة العميل. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  // Update client status
  const updateClientStatus = async (clientId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: clientId,
          status: newStatus
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        fetchClients()
      } else {
        setError(data.error || 'خطأ في تحديث حالة العميل')
      }
    } catch (err) {
      console.error('Error updating client:', err)
      setError('خطأ في تحديث حالة العميل')
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
          <h1 className="text-3xl font-bold mb-2">إدارة العملاء</h1>
          <p className="text-gray-600">إدارة قاعدة بيانات العملاء</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إضافة عميل جديد
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
          <h3 className="text-sm font-medium text-gray-500">إجمالي العملاء</h3>
          <div className="text-2xl font-bold mt-2">{clients.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">العملاء النشطون</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {clients.filter((c) => c.status === 'نشط').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">العملاء غير النشطين</h3>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {clients.filter((c) => c.status === 'غير نشط').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي القيمة</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {clients.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة العملاء</h2>
          <p className="text-sm text-gray-600">عرض جميع العملاء المسجلين</p>
        </div>
        <div className="p-6">
          {clients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد عملاء مسجلين حتى الآن
              <br />
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                إضافة أول عميل
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الرقم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الهاتف</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">العقود</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجمالي القيمة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{client.code}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          {client.nationalId && (
                            <div className="text-sm text-gray-500">هوية: {client.nationalId}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{client.phone}</td>
                      <td className="py-3 px-4 text-gray-900">{client.email}</td>
                      <td className="py-3 px-4 text-gray-900">{client.totalContracts}</td>
                      <td className="py-3 px-4 text-gray-900">{client.totalValue.toLocaleString()} ر.س</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'نشط' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateClientStatus(
                              client.id, 
                              client.status === 'نشط' ? 'غير نشط' : 'نشط'
                            )}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              client.status === 'نشط'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {client.status === 'نشط' ? 'إلغاء التفعيل' : 'تفعيل'}
                          </button>
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                            تعديل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة عميل جديد</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل الاسم الكامل"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="05xxxxxxxx"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهوية
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1xxxxxxxxx"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="أدخل العنوان"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                إلغاء
              </button>
              <button
                onClick={handleAddClient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'جاري الإضافة...' : 'إضافة العميل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}