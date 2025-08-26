'use client'

import { useState, useEffect } from 'react'

interface Contract {
  id: number
  contractNumber: string
  clientId: number
  clientName: string
  unitId: number
  unitName: string
  totalValue: number
  downPayment: number
  installmentCount: number
  installmentAmount: number
  startDate: string
  endDate: string
  status: string
  notes: string
}

interface Client {
  id: number
  name: string
  code: string
}

interface Unit {
  id: number
  number: string
  type: string
  price: number
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

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts')
      const data = await response.json()
      
      if (data.success) {
        setContracts(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في جلب بيانات العقود')
    } finally {
      setLoading(false)
    }
  }

  // Fetch clients and units for dropdowns
  const fetchDropdownData = async () => {
    try {
      const [clientsRes, unitsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/units')
      ])
      
      const clientsData = await clientsRes.json()
      const unitsData = await unitsRes.json()
      
      if (clientsData.success) {
        setClients(clientsData.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code
        })))
      }
      
      if (unitsData.success) {
        setUnits(unitsData.data.filter((u: any) => u.status === 'متاح').map((u: any) => ({
          id: u.id,
          number: u.number,
          type: u.type,
          price: u.price
        })))
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  useEffect(() => {
    fetchContracts()
    fetchDropdownData()
  }, [])

  // Calculate installment amount when values change
  useEffect(() => {
    if (formData.totalValue && formData.downPayment && formData.installmentCount) {
      const remaining = parseFloat(formData.totalValue) - parseFloat(formData.downPayment)
      const installmentAmount = remaining / parseInt(formData.installmentCount)
      // Update calculated installment amount display only
    }
  }, [formData.totalValue, formData.downPayment, formData.installmentCount])

  // Add new contract
  const handleAddContract = async () => {
    try {
      if (!formData.clientId || !formData.unitId || !formData.totalValue || !formData.downPayment) {
        setError('يرجى إدخال جميع البيانات المطلوبة')
        return
      }

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientId: parseInt(formData.clientId),
          unitId: parseInt(formData.unitId),
          totalValue: parseFloat(formData.totalValue),
          downPayment: parseFloat(formData.downPayment),
          installmentCount: parseInt(formData.installmentCount)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          clientId: '',
          unitId: '',
          totalValue: '',
          downPayment: '',
          installmentCount: '',
          startDate: new Date().toISOString().split('T')[0],
          notes: ''
        })
        fetchContracts()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في إضافة العقد')
    }
  }

  // Update contract status
  const updateContractStatus = async (contractId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contractId,
          status: newStatus
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchContracts()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('خطأ في تحديث حالة العقد')
    }
  }

  const calculateInstallmentAmount = () => {
    if (formData.totalValue && formData.downPayment && formData.installmentCount) {
      const remaining = parseFloat(formData.totalValue) - parseFloat(formData.downPayment)
      const installmentAmount = remaining / parseInt(formData.installmentCount)
      return installmentAmount.toFixed(2)
    }
    return '0'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نشط': return 'bg-green-100 text-green-800'
      case 'مكتمل': return 'bg-blue-100 text-blue-800'
      case 'متأخر': return 'bg-red-100 text-red-800'
      case 'ملغي': return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold mb-2">إدارة العقود</h1>
          <p className="text-gray-600">إدارة عقود البيع والأقساط</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إضافة عقد جديد
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
          <h3 className="text-sm font-medium text-gray-500">العقود المكتملة</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {contracts.filter((c) => c.status === 'مكتمل').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">إجمالي القيمة</h3>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {contracts.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">قائمة العقود</h2>
          <p className="text-sm text-gray-600">عرض جميع عقود البيع</p>
        </div>
        <div className="p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد عقود مسجلة حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">رقم العقد</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">العميل</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الوحدة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجمالي القيمة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الدفعة المقدمة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">عدد الأقساط</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">قسط شهري</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600">
                        {contract.contractNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{contract.clientName}</td>
                      <td className="py-3 px-4 text-gray-900">{contract.unitName}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {contract.totalValue.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {contract.downPayment.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">{contract.installmentCount}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">
                        {contract.installmentAmount.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <select
                            value={contract.status}
                            onChange={(e) => updateContractStatus(contract.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="نشط">نشط</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="متأخر">متأخر</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                            تفاصيل
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

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">إضافة عقد جديد</h3>
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
                    العميل *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">اختر العميل</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوحدة *
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => {
                      const selectedUnit = units.find(u => u.id === parseInt(e.target.value))
                      setFormData({ 
                        ...formData, 
                        unitId: e.target.value,
                        totalValue: selectedUnit ? selectedUnit.price.toString() : ''
                      })
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">اختر الوحدة</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.type} {unit.number} ({unit.price.toLocaleString()} ر.س)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    إجمالي القيمة (ر.س) *
                  </label>
                  <input
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدفعة المقدمة (ر.س) *
                  </label>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عدد الأقساط
                  </label>
                  <input
                    type="number"
                    value={formData.installmentCount}
                    onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="ملاحظات إضافية"
                />
              </div>

              {formData.totalValue && formData.downPayment && formData.installmentCount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>القسط الشهري المحسوب:</strong>{' '}
                    {calculateInstallmentAmount()} ر.س
                  </p>
                  <p className="text-sm text-blue-600">
                    المبلغ المتبقي: {(parseFloat(formData.totalValue) - parseFloat(formData.downPayment)).toLocaleString()} ر.س
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddContract}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إضافة العقد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}