'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: number
  name: string
  code: string
  phone: string
  status: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setClients([
        { id: 1, name: 'أحمد محمد', code: 'C001', phone: '01234567890', status: 'نشط' },
        { id: 2, name: 'فاطمة علي', code: 'C002', phone: '01234567891', status: 'نشط' },
        { id: 3, name: 'محمد حسن', code: 'C003', phone: '01234567892', status: 'غير نشط' }
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة العملاء</h1>
        <p className="text-gray-600">إدارة قاعدة بيانات العملاء</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة العملاء</h2>
          <p className="text-sm text-gray-600">عرض جميع العملاء المسجلين</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{client.name}</h3>
                  <p className="text-sm text-gray-500">#{client.code} | {client.phone}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    client.status === 'نشط' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
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