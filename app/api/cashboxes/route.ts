import { NextRequest, NextResponse } from 'next/server'

// Mock data for cashboxes
const mockCashboxes = [
  {
    id: 1,
    name: 'الخزينة الرئيسية',
    type: 'رئيسية',
    balance: 1250000,
    currency: 'EGP',
    status: 'نشطة',
    lastTransaction: '2024-01-15T10:30:00',
    description: 'الخزينة الرئيسية للشركة'
  },
  {
    id: 2,
    name: 'خزينة الشركاء',
    type: 'فرعية',
    balance: 850000,
    currency: 'EGP',
    status: 'نشطة',
    lastTransaction: '2024-01-14T15:45:00',
    description: 'خزينة مخصصة لمدفوعات الشركاء'
  },
  {
    id: 3,
    name: 'خزينة المشاريع',
    type: 'فرعية',
    balance: 650000,
    currency: 'EGP',
    status: 'نشطة',
    lastTransaction: '2024-01-13T09:20:00',
    description: 'خزينة مخصصة لمصروفات المشاريع'
  }
]

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    cashboxId: 1,
    type: 'إيداع',
    amount: 150000,
    description: 'دفعة من العميل أحمد محمد - العقد C-2024-001',
    date: '2024-01-15T10:30:00',
    reference: 'REC-2024-015',
    balanceAfter: 1250000
  },
  {
    id: 2,
    cashboxId: 2,
    type: 'تحويل',
    amount: -50000,
    description: 'تحويل إلى محفظة الشريك أحمد علي',
    date: '2024-01-14T15:45:00',
    reference: 'TRF-2024-012',
    balanceAfter: 850000
  },
  {
    id: 3,
    cashboxId: 3,
    type: 'صرف',
    amount: -75000,
    description: 'شراء مواد بناء للمشروع PRJ-001',
    date: '2024-01-13T09:20:00',
    reference: 'EXP-2024-008',
    balanceAfter: 650000
  },
  {
    id: 4,
    cashboxId: 1,
    type: 'إيداع',
    amount: 200000,
    description: 'دفعة من العميل فاطمة أحمد - العقد C-2024-002',
    date: '2024-01-12T14:15:00',
    reference: 'REC-2024-014',
    balanceAfter: 1100000
  },
  {
    id: 5,
    cashboxId: 2,
    type: 'إيداع',
    amount: 300000,
    description: 'تحويل من الخزينة الرئيسية',
    date: '2024-01-11T11:30:00',
    reference: 'TRF-2024-011',
    balanceAfter: 900000
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'transactions') {
      const cashboxId = searchParams.get('cashboxId')
      let transactions = mockTransactions
      
      if (cashboxId) {
        transactions = mockTransactions.filter(t => t.cashboxId === parseInt(cashboxId))
      }
      
      return NextResponse.json({
        success: true,
        data: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        total: transactions.length
      })
    }
    
    return NextResponse.json({
      success: true,
      data: mockCashboxes,
      total: mockCashboxes.length,
      totalBalance: mockCashboxes.reduce((sum, cb) => sum + cb.balance, 0)
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات الخزائن' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, cashboxId, amount, description, transactionType } = body
    
    if (type === 'transaction') {
      // Add new transaction
      const cashbox = mockCashboxes.find(cb => cb.id === cashboxId)
      if (!cashbox) {
        return NextResponse.json(
          { success: false, error: 'الخزينة غير موجودة' },
          { status: 404 }
        )
      }
      
      const transactionAmount = transactionType === 'صرف' ? -Math.abs(amount) : Math.abs(amount)
      const newBalance = cashbox.balance + transactionAmount
      
      if (newBalance < 0) {
        return NextResponse.json(
          { success: false, error: 'الرصيد غير كافي' },
          { status: 400 }
        )
      }
      
      const newTransaction = {
        id: Math.max(...mockTransactions.map(t => t.id)) + 1,
        cashboxId,
        type: transactionType,
        amount: transactionAmount,
        description,
        date: new Date().toISOString(),
        reference: `${transactionType === 'إيداع' ? 'DEP' : transactionType === 'صرف' ? 'EXP' : 'TRF'}-${new Date().getFullYear()}-${String(Math.max(...mockTransactions.map(t => t.id)) + 1).padStart(3, '0')}`,
        balanceAfter: newBalance
      }
      
      // Update cashbox balance
      cashbox.balance = newBalance
      cashbox.lastTransaction = newTransaction.date
      
      // Add transaction
      mockTransactions.push(newTransaction)
      
      return NextResponse.json({
        success: true,
        data: newTransaction,
        message: 'تم إضافة المعاملة بنجاح'
      }, { status: 201 })
    }
    
    // Add new cashbox
    const newCashbox = {
      id: Math.max(...mockCashboxes.map(cb => cb.id)) + 1,
      name: body.name || 'خزينة جديدة',
      type: body.type || 'فرعية',
      balance: body.initialBalance || 0,
      currency: 'EGP',
      status: 'نشطة',
      lastTransaction: new Date().toISOString(),
      description: body.description || ''
    }
    
    mockCashboxes.push(newCashbox)
    
    return NextResponse.json({
      success: true,
      data: newCashbox,
      message: 'تم إضافة الخزينة بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة البيانات' },
      { status: 500 }
    )
  }
}