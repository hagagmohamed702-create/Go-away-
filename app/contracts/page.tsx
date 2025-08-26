'use client'

import { useState, useEffect } from 'react'

interface Contract {
  id: number
  contractNumber: string
  clientId: number
  clientName: string
  unitId: number
  unitNumber: string
  totalValue: number
  downPayment: number
  installmentAmount: number
  installmentCount: number
  paidInstallments: number
  startDate: string
  endDate: string
  status: string
  notes: string
}

interface Client {
  id: number
  name: string
}

interface Unit {
  id: number
  number: string
  type: string
  status: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    unitId: '',
    totalValue: '',
    downPayment: '',
    installmentCount: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load contracts, clients, and units in parallel
      const [contractsRes, clientsRes, unitsRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/clients'),
        fetch('/api/units')
      ])
      
      const contractsData = await contractsRes.json()
      const clientsData = await clientsRes.json()
      const unitsData = await unitsRes.json()
      
      if (contractsData.success) {
        setContracts(contractsData.data || [])
      }
      
      if (clientsData.success) {
        setClients(clientsData.data || [])
      }
      
      if (unitsData.success) {
        setUnits(unitsData.data || [])
      }
      
      if (!contractsData.success && !clientsData.success && !unitsData.success) {
        setError('خطأ في جلب البيانات')
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContract = async () => {
    if (!formData.clientId || !formData.unitId || !formData.totalValue) {
      setError('العميل والوحدة والقيمة الإجمالية مطلوبة')
      return
    }

    try {
      setError('')
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientId: parseInt(formData.clientId),
          unitId: parseInt(formData.unitId),
          totalValue: parseFloat(formData.totalValue),
          downPayment: parseFloat(formData.downPayment) || 0,
          installmentCount: parseInt(formData.installmentCount) || 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          clientId: '', unitId: '', totalValue: '', downPayment: '',
          installmentCount: '', startDate: new Date().toISOString().split('T')[0], notes: ''
        })
        await loadData()
        alert('تم إضافة العقد بنجاح!')
      } else {
        setError(data.error || 'خطأ في إضافة العقد')
      }
    } catch (err) {
      console.error('Error adding contract:', err)
      setError('خطأ في إضافة العقد')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نشط': return 'bg-green-100 text-green-800'
      case 'مكتمل': return 'bg-blue-100 text-blue-800'
      case 'ملغي': return 'bg-red-100 text-red-800'
      case 'متأخر': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateInstallmentAmount = () => {
    const total = parseFloat(formData.totalValue) || 0
    const down = parseFloat(formData.downPayment) || 0
    const count = parseInt(formData.installmentCount) || 1
    return count > 0 ? (total - down) / count : 0
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
                  onClick={loadData}
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة العقود</h1>
          <p className="text-gray-600">إدارة عقود البيع والإيجار</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          إضافة عقد جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">إجمالي العقود</h3>
          <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">العقود النشطة</h3>
          <p className="text-2xl font-bold text-green-600">
            {contracts.filter(c => c.status === 'نشط').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">العقود المكتملة</h3>
          <p className="text-2xl font-bold text-blue-600">
            {contracts.filter(c => c.status === 'مكتمل').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">إجمالي القيمة</h3>
          <p className="text-2xl font-bold text-purple-600">
            {contracts.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()} ر.س
          </p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العقد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة الإجمالية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدفعة الأولى</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأقساط</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contract.contractNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  وحدة {contract.unitNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.totalValue.toLocaleString()} ر.س
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.downPayment.toLocaleString()} ر.س
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.paidInstallments}/{contract.installmentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contracts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد عقود مسجلة حالياً</p>
          </div>
        )}
      </div>

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة عقد جديد</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العميل *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر العميل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة *</label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({...formData, unitId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الوحدة</option>
                  {units.filter(u => u.status === 'متاح').map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      وحدة {unit.number} - {unit.type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القيمة الإجمالية (ر.س) *</label>
                <input
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدفعة الأولى (ر.س)</label>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأقساط</label>
                <input
                  type="number"
                  value={formData.installmentCount}
                  onChange={(e) => setFormData({...formData, installmentCount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
              
              {formData.totalValue && formData.installmentCount && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    قيمة القسط الشهري: {calculateInstallmentAmount().toLocaleString()} ر.س
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="ملاحظات على العقد..."
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
                onClick={handleAddContract}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setError('')
                  setFormData({
                    clientId: '', unitId: '', totalValue: '', downPayment: '',
                    installmentCount: '', startDate: new Date().toISOString().split('T')[0], notes: ''
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