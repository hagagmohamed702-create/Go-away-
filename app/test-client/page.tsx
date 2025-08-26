'use client'

import { useState } from 'react'

export default function TestClientPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'عميل اختبار',
    phone: '0501234567',
    email: 'test@example.com',
    address: 'الرياض',
    nationalId: '1234567890'
  })

  const testAddClient = async () => {
    setLoading(true)
    setResult('جاري الإضافة...')
    
    try {
      console.log('🚀 Sending request with data:', formData)
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      const responseText = await response.text()
      console.log('📄 Raw response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError)
        setResult(`خطأ في تحليل الاستجابة: ${responseText}`)
        return
      }
      
      console.log('✅ Parsed data:', data)
      
      if (response.ok && data.success) {
        setResult(`✅ نجح! تم إضافة العميل: ${JSON.stringify(data.data, null, 2)}`)
      } else {
        setResult(`❌ فشل: ${data.error || 'خطأ غير محدد'}`)
      }
      
    } catch (error) {
      console.error('💥 Network error:', error)
      setResult(`💥 خطأ في الشبكة: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetClients = async () => {
    setLoading(true)
    setResult('جاري جلب العملاء...')
    
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setResult(`✅ تم جلب ${data.data.length} عميل:\n${JSON.stringify(data.data, null, 2)}`)
      } else {
        setResult(`❌ فشل في جلب العملاء: ${data.error}`)
      }
    } catch (error) {
      setResult(`💥 خطأ: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">🧪 اختبار إضافة العملاء</h1>
          
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الهاتف</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهوية</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={testAddClient}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جاري التنفيذ...' : '🚀 اختبار إضافة عميل'}
            </button>
            
            <button
              onClick={testGetClients}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              📋 جلب العملاء
            </button>
          </div>

          {/* Result */}
          <div className="bg-gray-100 rounded-md p-4">
            <h3 className="font-medium text-gray-800 mb-2">النتيجة:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {result || 'لم يتم تنفيذ أي اختبار بعد...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}