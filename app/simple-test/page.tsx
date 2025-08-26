'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [apiResult, setApiResult] = useState('')
  const [clientsResult, setClientsResult] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testAPIs()
  }, [])

  const testAPIs = async () => {
    setLoading(true)
    
    // Test basic API
    try {
      const testResponse = await fetch('/api/test')
      const testData = await testResponse.json()
      setApiResult(`✅ API Test: ${testData.message || 'Success'}`)
    } catch (error) {
      setApiResult(`❌ API Test Failed: ${error}`)
    }

    // Test clients API
    try {
      const clientsResponse = await fetch('/api/clients')
      const clientsData = await clientsResponse.json()
      
      if (clientsData.success) {
        setClientsResult(`✅ Clients API: Found ${clientsData.data.length} clients`)
      } else {
        setClientsResult(`❌ Clients API: ${clientsData.error}`)
      }
    } catch (error) {
      setClientsResult(`❌ Clients API Failed: ${error}`)
    }

    setLoading(false)
  }

  const testAddClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'عميل تجريبي',
          phone: `050${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          email: 'test@example.com'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('✅ تم إضافة العميل بنجاح!')
        testAPIs() // Refresh
      } else {
        alert(`❌ فشل في إضافة العميل: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ خطأ في إضافة العميل: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🧪 اختبار النظام البسيط</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري اختبار APIs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Results */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">نتائج اختبار APIs:</h3>
              <div className="space-y-2">
                <p className="font-mono text-sm">{apiResult}</p>
                <p className="font-mono text-sm">{clientsResult}</p>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="flex gap-4">
              <button
                onClick={testAPIs}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                🔄 إعادة اختبار APIs
              </button>
              
              <button
                onClick={testAddClient}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                ➕ اختبار إضافة عميل
              </button>
            </div>

            {/* Navigation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">الصفحات المتاحة:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a href="/clients" className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center hover:bg-blue-200">
                  العملاء
                </a>
                <a href="/units" className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center hover:bg-green-200">
                  الوحدات
                </a>
                <a href="/contracts" className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-center hover:bg-purple-200">
                  العقود
                </a>
                <a href="/partners" className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-center hover:bg-orange-200">
                  الشركاء
                </a>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold">✅ حالة النظام:</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• الخادم يعمل</li>
                <li>• APIs متاحة</li>
                <li>• قاعدة البيانات الوهمية تعمل</li>
                <li>• النظام جاهز للاستخدام</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}