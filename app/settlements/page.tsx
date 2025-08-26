'use client'

import { useState, useEffect } from 'react'

interface PartnerSettlement {
  partnerId: number
  partnerName: string
  sharePercentage: number
  targetAmount: number
  actualPaid: number
  difference: number
  settlementAmount: number
  settlementType: string
}

interface Settlement {
  id: number
  settlementNumber: string
  date: string
  status: string
  totalAmount: number
  description: string
  createdBy: string
  partnerSettlements: PartnerSettlement[]
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
  const [stats, setStats] = useState({ totalSettlements: 0, completedSettlements: 0, pendingSettlements: 0, totalAmount: 0 })
  
  const [calculatorData, setCalculatorData] = useState({
    totalExpenses: '',
    description: '',
    partnerExpenses: [
      { partnerId: 1, partnerName: 'أحمد محمد علي', amount: '' },
      { partnerId: 2, partnerName: 'فاطمة أحمد حسن', amount: '' },
      { partnerId: 3, partnerName: 'محمد السيد إبراهيم', amount: '' }
    ]
  })
  
  const [calculatedSettlement, setCalculatedSettlement] = useState<PartnerSettlement[]>([])

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    try {
      const response = await fetch('/api/settlements')
      const data = await response.json()
      if (data.success) {
        setSettlements(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching settlements:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSettlement = async () => {
    try {
      const partnerExpenses = calculatorData.partnerExpenses.filter(pe => pe.amount).map(pe => ({
        partnerId: pe.partnerId,
        amount: parseFloat(pe.amount)
      }))
      
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'calculate',
          totalExpenses: parseFloat(calculatorData.totalExpenses),
          partnerExpenses
        })
      })

      const result = await response.json()
      if (result.success) {
        setCalculatedSettlement(result.data)
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error calculating settlement:', error)
      alert('حدث خطأ في حساب التسوية')
    }
  }

  const createSettlement = async () => {
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create',
          totalAmount: parseFloat(calculatorData.totalExpenses),
          description: calculatorData.description,
          partnerSettlements: calculatedSettlement
        })
      })

      const result = await response.json()
      if (result.success) {
        await fetchSettlements()
        setShowCalculator(false)
        setCalculatedSettlement([])
        setCalculatorData({
          totalExpenses: '',
          description: '',
          partnerExpenses: calculatorData.partnerExpenses.map(pe => ({ ...pe, amount: '' }))
        })
        alert('تم إنشاء التسوية بنجاح!')
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error creating settlement:', error)
      alert('حدث خطأ في إنشاء التسوية')
    }
  }

  const approveSettlement = async (settlementId: number) => {
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approve',
          settlementId
        })
      })

      const result = await response.json()
      if (result.success) {
        await fetchSettlements()
        alert('تم اعتماد التسوية بنجاح!')
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error approving settlement:', error)
      alert('حدث خطأ في اعتماد التسوية')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتملة': return 'bg-green-100 text-green-800'
      case 'معلقة': return 'bg-yellow-100 text-yellow-800'
      case 'ملغية': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSettlementTypeColor = (type: string) => {
    switch (type) {
      case 'استحقاق': return 'text-green-600'
      case 'دفع': return 'text-red-600'
      case 'متوازن': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">جاري تحميل بيانات التسويات...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تسويات الشركاء</h1>
          <p className="text-gray-600">إدارة التسويات المالية بين الشركاء</p>
        </div>
        <button
          onClick={() => setShowCalculator(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          حساب تسوية جديدة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي التسويات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSettlements}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10l-3-3m0 0l-3 3m3-3V4M21 21H3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">التسويات المكتملة</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedSettlements}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">التسويات المعلقة</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingSettlements}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المبالغ</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">حاسبة التسويات</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">إجمالي المصروفات</label>
                  <input
                    type="number"
                    value={calculatorData.totalExpenses}
                    onChange={(e) => setCalculatorData({ ...calculatorData, totalExpenses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="أدخل إجمالي المصروفات"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف التسوية</label>
                  <input
                    type="text"
                    value={calculatorData.description}
                    onChange={(e) => setCalculatorData({ ...calculatorData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="وصف التسوية"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">مصروفات الشركاء الفعلية</h3>
                <div className="space-y-3">
                  {calculatorData.partnerExpenses.map((partner, index) => (
                    <div key={partner.partnerId} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600">{partner.partnerName}</label>
                      </div>
                      <div className="w-48">
                        <input
                          type="number"
                          value={partner.amount}
                          onChange={(e) => {
                            const newPartnerExpenses = [...calculatorData.partnerExpenses]
                            newPartnerExpenses[index].amount = e.target.value
                            setCalculatorData({ ...calculatorData, partnerExpenses: newPartnerExpenses })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="المبلغ المدفوع"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={calculateSettlement}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!calculatorData.totalExpenses}
                >
                  حساب التسوية
                </button>
              </div>

              {/* Calculated Settlement Results */}
              {calculatedSettlement.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">نتائج التسوية</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-right text-sm font-medium">الشريك</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">النسبة</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">المبلغ المطلوب</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">المبلغ المدفوع</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">الفرق</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">التسوية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatedSettlement.map((ps) => (
                          <tr key={ps.partnerId} className="border-t">
                            <td className="px-4 py-2 text-sm">{ps.partnerName}</td>
                            <td className="px-4 py-2 text-sm">{ps.sharePercentage}%</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(ps.targetAmount)}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(ps.actualPaid)}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(Math.abs(ps.difference))}</td>
                            <td className={`px-4 py-2 text-sm font-medium ${getSettlementTypeColor(ps.settlementType)}`}>
                              {ps.settlementType === 'استحقاق' ? '+' : ps.settlementType === 'دفع' ? '-' : ''}
                              {ps.settlementAmount !== 0 ? formatCurrency(Math.abs(ps.settlementAmount)) : 'متوازن'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={createSettlement}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      إنشاء التسوية
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settlements List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة التسويات</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{settlement.settlementNumber}</h3>
                  <p className="text-sm text-gray-500">{settlement.description}</p>
                  <p className="text-xs text-gray-400">بواسطة {settlement.createdBy} • {formatDate(settlement.date)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(settlement.status)}`}>
                    {settlement.status}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(settlement.totalAmount)}</p>
                  {settlement.status === 'معلقة' && (
                    <button
                      onClick={() => approveSettlement(settlement.id)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded mt-2 hover:bg-green-700"
                    >
                      اعتماد
                    </button>
                  )}
                </div>
              </div>

              {/* Partner Settlements Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">تفاصيل التسوية</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {settlement.partnerSettlements.map((ps) => (
                    <div key={ps.partnerId} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">{ps.partnerName}</span>
                        <span className="text-xs text-gray-500">{ps.sharePercentage}%</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>مطلوب:</span>
                          <span>{formatCurrency(ps.targetAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>مدفوع:</span>
                          <span>{formatCurrency(ps.actualPaid)}</span>
                        </div>
                        <div className={`flex justify-between font-medium ${getSettlementTypeColor(ps.settlementType)}`}>
                          <span>{ps.settlementType}:</span>
                          <span>
                            {ps.settlementAmount !== 0 ? formatCurrency(Math.abs(ps.settlementAmount)) : 'متوازن'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}