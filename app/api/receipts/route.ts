import { NextRequest, NextResponse } from 'next/server'

// Mock data for receipts (payment and expense vouchers)
const mockReceipts = [
  {
    id: 1,
    voucherNumber: 'REC-2024-001',
    type: 'قبض',
    amount: 250000,
    clientName: 'أحمد محمد علي',
    contractNumber: 'C-2024-001',
    description: 'دفعة القسط الأول - شقة 102',
    date: '2024-01-15T10:30:00',
    cashboxName: 'الخزينة الرئيسية',
    status: 'مؤكد',
    createdBy: 'محمد أحمد',
    paymentMethod: 'نقدي'
  },
  {
    id: 2,
    voucherNumber: 'EXP-2024-001',
    type: 'صرف',
    amount: 75000,
    supplierName: 'شركة مواد البناء المتحدة',
    projectName: 'مشروع العمارة الجديدة',
    description: 'شراء أسمنت ومواد بناء',
    date: '2024-01-14T14:20:00',
    cashboxName: 'خزينة المشاريع',
    status: 'مؤكد',
    createdBy: 'علي حسن',
    paymentMethod: 'شيك'
  },
  {
    id: 3,
    voucherNumber: 'REC-2024-002',
    type: 'قبض',
    amount: 180000,
    clientName: 'فاطمة أحمد حسن',
    contractNumber: 'C-2024-002',
    description: 'دفعة القسط الثاني - فيلا 5',
    date: '2024-01-13T09:15:00',
    cashboxName: 'الخزينة الرئيسية',
    status: 'مؤكد',
    createdBy: 'سارة محمد',
    paymentMethod: 'تحويل بنكي'
  },
  {
    id: 4,
    voucherNumber: 'EXP-2024-002',
    type: 'صرف',
    amount: 125000,
    supplierName: 'مقاولات الإنشاءات الحديثة',
    projectName: 'مشروع التوسعات',
    description: 'أجور عمالة ومعدات',
    date: '2024-01-12T16:45:00',
    cashboxName: 'خزينة المشاريع',
    status: 'مؤكد',
    createdBy: 'أحمد علي',
    paymentMethod: 'نقدي'
  },
  {
    id: 5,
    voucherNumber: 'REC-2024-003',
    type: 'قبض',
    amount: 300000,
    clientName: 'محمد السيد إبراهيم',
    contractNumber: 'C-2024-003',
    description: 'مقدم عقد - شقة 205',
    date: '2024-01-11T11:30:00',
    cashboxName: 'خزينة الشركاء',
    status: 'مؤكد',
    createdBy: 'نورا أحمد',
    paymentMethod: 'نقدي'
  },
  {
    id: 6,
    voucherNumber: 'EXP-2024-003',
    type: 'صرف',
    amount: 45000,
    supplierName: 'شركة الكهرباء والصيانة',
    projectName: 'صيانة المباني',
    description: 'أعمال كهرباء وصيانة',
    date: '2024-01-10T13:20:00',
    cashboxName: 'خزينة المشاريع',
    status: 'معلق',
    createdBy: 'خالد محمد',
    paymentMethod: 'شيك'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    let filteredReceipts = [...mockReceipts]
    
    // Filter by type
    if (type && type !== 'all') {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.type === type)
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.status === status)
    }
    
    // Filter by date range
    if (dateFrom) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        new Date(receipt.date) >= new Date(dateFrom)
      )
    }
    
    if (dateTo) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        new Date(receipt.date) <= new Date(dateTo)
      )
    }
    
    // Sort by date (newest first)
    filteredReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Calculate totals
    const totalIncome = filteredReceipts
      .filter(r => r.type === 'قبض' && r.status === 'مؤكد')
      .reduce((sum, r) => sum + r.amount, 0)
      
    const totalExpense = filteredReceipts
      .filter(r => r.type === 'صرف' && r.status === 'مؤكد')
      .reduce((sum, r) => sum + r.amount, 0)
    
    return NextResponse.json({
      success: true,
      data: filteredReceipts,
      total: filteredReceipts.length,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات السندات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newReceipt = {
      id: Math.max(...mockReceipts.map(r => r.id)) + 1,
      voucherNumber: `${body.type === 'قبض' ? 'REC' : 'EXP'}-${new Date().getFullYear()}-${String(Math.max(...mockReceipts.map(r => r.id)) + 1).padStart(3, '0')}`,
      type: body.type,
      amount: body.amount,
      clientName: body.clientName || '',
      contractNumber: body.contractNumber || '',
      supplierName: body.supplierName || '',
      projectName: body.projectName || '',
      description: body.description,
      date: new Date().toISOString(),
      cashboxName: body.cashboxName,
      status: 'مؤكد',
      createdBy: 'النظام',
      paymentMethod: body.paymentMethod || 'نقدي'
    }
    
    mockReceipts.push(newReceipt)
    
    return NextResponse.json({
      success: true,
      data: newReceipt,
      message: 'تم إضافة السند بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة السند' },
      { status: 500 }
    )
  }
}