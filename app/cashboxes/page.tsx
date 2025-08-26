'use client'

import { useState, useEffect } from 'react'

interface Cashbox {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  status: string
  lastTransaction: string
  description: string
}

interface Transaction {
  id: number
  cashboxId: number
  type: string
  amount: number
  description: string
  date: string
  reference: string
  balanceAfter: number
}

export default function CashboxesPage() {
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCashboxForm, setShowAddCashboxForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedCashbox, setSelectedCashbox] = useState<number | null>(null)
  const [newCashbox, setNewCashbox] = useState({
    name: '',
    type: 'فرعية',
    initialBalance: '',
    description: ''
  })
  const [newTransaction, setNewTransaction] = useState({
    cashboxId: '',
    transactionType: 'إيداع',
    amount: '',
    description: ''
  })

  useEffect(() => {
    fetchCashboxes()
    fetchTransactions()
  }, [])

  const fetchCashboxes = async () => {
    try {
      const response = await fetch('/api/cashboxes')
      const data = await response.json()
      if (data.success) {
        setCashboxes(data.data)
      }
    } catch (error) {
      console.error('Error fetching cashboxes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (cashboxId?: number) => {
    try {
      const url = cashboxId 
        ? `/api/cashboxes?type=transactions&cashboxId=${cashboxId}`
        : '/api/cashboxes?type=transactions'
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleAddCashbox = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/cashboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCashbox.name,
          type: newCashbox.type,
          initialBalance: parseFloat(newCashbox.initialBalance),
          description: newCashbox.description
        }),
      })

      if (response.ok) {
        await fetchCashboxes()
        setShowAddCashboxForm(false)
        setNewCashbox({
          name: '',
          type: 'فرعية',
          initialBalance: '',
          description: ''
        })
        alert('تم إضافة الخزينة بنجاح!')
      }
    } catch (error) {
      console.error('Error adding cashbox:', error)
      alert('حدث خطأ في إضافة الخزينة')
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/cashboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'transaction',
          cashboxId: parseInt(newTransaction.cashboxId),
          transactionType: newTransaction.transactionType,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchCashboxes()
        await fetchTransactions()
        setShowTransactionForm(false)
        setNewTransaction({
          cashboxId: '',
          transactionType: 'إيداع',
          amount: '',
          description: ''
        })
        alert('تم إضافة المعاملة بنجاح!')
      } else {
        alert(result.error || 'حدث خطأ في إضافة المعاملة')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('حدث خطأ في إضافة المعاملة')
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">جاري تحميل بيانات الخزائن...</div>
      </div>
    )
  }

  const totalBalance = cashboxes.reduce((sum, cb) => sum + cb.balance, 0)

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الخزائن</h1>
          <p className="text-gray-600">إدارة الخزائن والمعاملات المالية</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            إضافة معاملة
          </button>
          <button
            onClick={() => setShowAddCashboxForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة خزينة
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الخزائن</p>
              <p className="text-2xl font-bold text-gray-900">{cashboxes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">المعاملات اليوم</p>
              <p className="text-2xl font-bold text-purple-600">
                {transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الخزائن النشطة</p>
              <p className="text-2xl font-bold text-orange-600">
                {cashboxes.filter(cb => cb.status === 'نشطة').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add Cashbox Form Modal */}
      {showAddCashboxForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">إضافة خزينة جديدة</h2>
            <form onSubmit={handleAddCashbox} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخزينة</label>
                <input
                  type="text"
                  value={newCashbox.name}
                  onChange={(e) => setNewCashbox({ ...newCashbox, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخزينة</label>
                <select
                  value={newCashbox.type}
                  onChange={(e) => setNewCashbox({ ...newCashbox, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="رئيسية">رئيسية</option>
                  <option value="فرعية">فرعية</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرصيد الأولي</label>
                <input
                  type="number"
                  value={newCashbox.initialBalance}
                  onChange={(e) => setNewCashbox({ ...newCashbox, initialBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={newCashbox.description}
                  onChange={(e) => setNewCashbox({ ...newCashbox, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCashboxForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">إضافة معاملة جديدة</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الخزينة</label>
                <select
                  value={newTransaction.cashboxId}
                  onChange={(e) => setNewTransaction({ ...newTransaction, cashboxId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">اختر الخزينة</option>
                  {cashboxes.map((cashbox) => (
                    <option key={cashbox.id} value={cashbox.id}>
                      {cashbox.name} - {formatCurrency(cashbox.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المعاملة</label>
                <select
                  value={newTransaction.transactionType}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transactionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="إيداع">إيداع</option>
                  <option value="صرف">صرف</option>
                  <option value="تحويل">تحويل</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cashboxes and Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cashboxes Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">قائمة الخزائن</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخزينة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cashboxes.map((cashbox) => (
                  <tr key={cashbox.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cashbox.name}</div>
                        <div className="text-sm text-gray-500">{cashbox.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${cashbox.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashbox.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {cashbox.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">المعاملات الأخيرة</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3 p-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'إيداع' ? 'bg-green-100' :
                      transaction.type === 'صرف' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        transaction.type === 'إيداع' ? 'text-green-600' :
                        transaction.type === 'صرف' ? 'text-red-600' : 'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {transaction.type === 'إيداع' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        ) : transaction.type === 'صرف' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.reference} • {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(transaction.balanceAfter)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}