import { NextRequest, NextResponse } from 'next/server'

// Mock data for contracts
const mockContracts = [
  {
    id: 1,
    contractNumber: 'CT-2024-001',
    clientId: 1,
    clientName: 'أحمد محمد السعيد',
    unitId: 1,
    unitName: 'شقة A-101',
    totalValue: 850000,
    downPayment: 200000,
    installmentCount: 24,
    installmentAmount: 27083,
    startDate: '2024-01-15',
    endDate: '2026-01-15',
    status: 'نشط',
    notes: 'عقد بيع شقة سكنية'
  },
  {
    id: 2,
    contractNumber: 'CT-2024-002',
    clientId: 2,
    clientName: 'فاطمة علي الأحمد',
    unitId: 2,
    unitName: 'شقة A-102',
    totalValue: 950000,
    downPayment: 250000,
    installmentCount: 36,
    installmentAmount: 19444,
    startDate: '2024-01-20',
    endDate: '2027-01-20',
    status: 'نشط',
    notes: 'عقد بيع شقة فاخرة'
  },
  {
    id: 3,
    contractNumber: 'CT-2024-003',
    clientId: 4,
    clientName: 'نورا سعد الدوسري',
    unitId: 4,
    unitName: 'فيلا B-101',
    totalValue: 1500000,
    downPayment: 500000,
    installmentCount: 48,
    installmentAmount: 20833,
    startDate: '2024-02-10',
    endDate: '2028-02-10',
    status: 'نشط',
    notes: 'عقد بيع فيلا مع حديقة'
  },
  {
    id: 4,
    contractNumber: 'CT-2024-004',
    clientId: 5,
    clientName: 'خالد عبد الرحمن القحطاني',
    unitId: 5,
    unitName: 'محل C-001',
    totalValue: 600000,
    downPayment: 150000,
    installmentCount: 12,
    installmentAmount: 37500,
    startDate: '2024-02-15',
    endDate: '2025-02-15',
    status: 'مكتمل',
    notes: 'عقد بيع محل تجاري'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let filteredContracts = [...mockContracts]
    
    // Filter by status
    if (status && status !== 'all') {
      filteredContracts = filteredContracts.filter(contract => contract.status === status)
    }
    
    // Filter by client
    if (clientId) {
      filteredContracts = filteredContracts.filter(contract => contract.clientId === parseInt(clientId))
    }
    
    // Filter by date range
    if (startDate) {
      filteredContracts = filteredContracts.filter(contract => 
        new Date(contract.startDate) >= new Date(startDate)
      )
    }
    if (endDate) {
      filteredContracts = filteredContracts.filter(contract => 
        new Date(contract.startDate) <= new Date(endDate)
      )
    }
    
    // Sort by creation date (newest first)
    filteredContracts.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    
    // Calculate summary stats
    const totalContracts = filteredContracts.length
    const activeContracts = filteredContracts.filter(c => c.status === 'نشط').length
    const completedContracts = filteredContracts.filter(c => c.status === 'مكتمل').length
    const overdueContracts = filteredContracts.filter(c => c.status === 'متأخر').length
    const totalValue = filteredContracts.reduce((sum, c) => sum + c.totalValue, 0)
    const totalDownPayments = filteredContracts.reduce((sum, c) => sum + c.downPayment, 0)
    const totalInstallments = filteredContracts.reduce((sum, c) => sum + (c.totalValue - c.downPayment), 0)
    
    return NextResponse.json({
      success: true,
      data: filteredContracts,
      summary: {
        totalContracts,
        activeContracts,
        completedContracts,
        overdueContracts,
        totalValue,
        totalDownPayments,
        totalInstallments
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات العقود' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.clientId || !body.unitId || !body.totalValue || !body.downPayment) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات الأساسية مطلوبة' },
        { status: 400 }
      )
    }
    
    // Check if client exists (in real app, would query database)
    const clientExists = body.clientId >= 1 && body.clientId <= 5
    if (!clientExists) {
      return NextResponse.json(
        { success: false, error: 'العميل المحدد غير موجود' },
        { status: 400 }
      )
    }
    
    // Check if unit is available (in real app, would query database)
    const unitExists = body.unitId >= 1 && body.unitId <= 6
    if (!unitExists) {
      return NextResponse.json(
        { success: false, error: 'الوحدة المحددة غير موجودة أو غير متاحة' },
        { status: 400 }
      )
    }
    
    // Check if unit is already contracted
    const existingContract = mockContracts.find(c => 
      c.unitId === body.unitId && (c.status === 'نشط' || c.status === 'مكتمل')
    )
    if (existingContract) {
      return NextResponse.json(
        { success: false, error: 'الوحدة محجوزة بالفعل في عقد آخر' },
        { status: 400 }
      )
    }
    
    // Generate contract number
    const contractNumber = `CT-${new Date().getFullYear()}-${String(mockContracts.length + 1).padStart(3, '0')}`
    
    // Calculate installment amount
    const remainingAmount = body.totalValue - body.downPayment
    const installmentAmount = body.installmentCount > 0 ? Math.round(remainingAmount / body.installmentCount) : 0
    
    // Calculate end date
    const startDate = new Date(body.startDate)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + (body.installmentCount || 0))
    
    // Get client and unit names (in real app, would join from database)
    const clientNames = {
      1: 'أحمد محمد السعيد',
      2: 'فاطمة علي الأحمد',
      3: 'محمد حسن العتيبي',
      4: 'نورا سعد الدوسري',
      5: 'خالد عبد الرحمن القحطاني'
    }
    
    const unitNames = {
      1: 'شقة A-101',
      2: 'شقة A-102',
      3: 'شقة A-201',
      4: 'فيلا B-101',
      5: 'محل C-001',
      6: 'مكتب D-301'
    }
    
    // Create new contract
    const newContract = {
      id: Math.max(...mockContracts.map(c => c.id), 0) + 1,
      contractNumber,
      clientId: body.clientId,
      clientName: clientNames[body.clientId as keyof typeof clientNames] || 'عميل غير محدد',
      unitId: body.unitId,
      unitName: unitNames[body.unitId as keyof typeof unitNames] || 'وحدة غير محددة',
      totalValue: body.totalValue,
      downPayment: body.downPayment,
      installmentCount: body.installmentCount || 0,
      installmentAmount,
      startDate: body.startDate,
      endDate: endDate.toISOString().split('T')[0],
      status: 'نشط',
      notes: body.notes || ''
    }
    
    mockContracts.push(newContract)
    
    return NextResponse.json({
      success: true,
      data: newContract,
      message: 'تم إنشاء العقد بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إنشاء العقد' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'معرف العقد مطلوب' },
        { status: 400 }
      )
    }
    
    const contractIndex = mockContracts.findIndex(c => c.id === body.id)
    if (contractIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العقد غير موجود' },
        { status: 404 }
      )
    }
    
    // Update contract data
    const contract = mockContracts[contractIndex]
    if (body.status !== undefined) contract.status = body.status
    if (body.notes !== undefined) contract.notes = body.notes
    if (body.totalValue !== undefined) {
      contract.totalValue = body.totalValue
      // Recalculate installment amount if installment count exists
      if (contract.installmentCount > 0) {
        const remainingAmount = contract.totalValue - contract.downPayment
        contract.installmentAmount = Math.round(remainingAmount / contract.installmentCount)
      }
    }
    if (body.downPayment !== undefined) {
      contract.downPayment = body.downPayment
      // Recalculate installment amount if installment count exists
      if (contract.installmentCount > 0) {
        const remainingAmount = contract.totalValue - contract.downPayment
        contract.installmentAmount = Math.round(remainingAmount / contract.installmentCount)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: contract,
      message: 'تم تحديث العقد بنجاح'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في تحديث العقد' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف العقد مطلوب' },
        { status: 400 }
      )
    }
    
    const contractIndex = mockContracts.findIndex(c => c.id === parseInt(id))
    if (contractIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العقد غير موجود' },
        { status: 404 }
      )
    }
    
    // Check if contract can be deleted
    const contract = mockContracts[contractIndex]
    if (contract.status === 'مكتمل') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف عقد مكتمل' },
        { status: 400 }
      )
    }
    
    mockContracts.splice(contractIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العقد بنجاح'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في حذف العقد' },
      { status: 500 }
    )
  }
}