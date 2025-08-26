import { NextRequest, NextResponse } from 'next/server'

// Mock data for settlements
const mockSettlements = [
  {
    id: 1,
    settlementNumber: 'SET-2024-001',
    date: '2024-01-15T10:00:00',
    status: 'مكتملة',
    totalAmount: 150000,
    description: 'تسوية شهر يناير 2024',
    createdBy: 'أحمد محمد',
    partnerSettlements: [
      {
        partnerId: 1,
        partnerName: 'أحمد محمد علي',
        sharePercentage: 40,
        targetAmount: 60000,
        actualPaid: 80000,
        difference: -20000,
        settlementAmount: 20000,
        settlementType: 'استحقاق'
      },
      {
        partnerId: 2,
        partnerName: 'فاطمة أحمد حسن',
        sharePercentage: 35,
        targetAmount: 52500,
        actualPaid: 45000,
        difference: 7500,
        settlementAmount: -7500,
        settlementType: 'دفع'
      },
      {
        partnerId: 3,
        partnerName: 'محمد السيد إبراهيم',
        sharePercentage: 25,
        targetAmount: 37500,
        actualPaid: 25000,
        difference: 12500,
        settlementAmount: -12500,
        settlementType: 'دفع'
      }
    ]
  },
  {
    id: 2,
    settlementNumber: 'SET-2024-002',
    date: '2024-01-10T14:30:00',
    status: 'معلقة',
    totalAmount: 200000,
    description: 'تسوية مصروفات المشروع الجديد',
    createdBy: 'سارة أحمد',
    partnerSettlements: [
      {
        partnerId: 1,
        partnerName: 'أحمد محمد علي',
        sharePercentage: 40,
        targetAmount: 80000,
        actualPaid: 90000,
        difference: -10000,
        settlementAmount: 10000,
        settlementType: 'استحقاق'
      },
      {
        partnerId: 2,
        partnerName: 'فاطمة أحمد حسن',
        sharePercentage: 35,
        targetAmount: 70000,
        actualPaid: 60000,
        difference: 10000,
        settlementAmount: -10000,
        settlementType: 'دفع'
      },
      {
        partnerId: 3,
        partnerName: 'محمد السيد إبراهيم',
        sharePercentage: 25,
        targetAmount: 50000,
        actualPaid: 50000,
        difference: 0,
        settlementAmount: 0,
        settlementType: 'متوازن'
      }
    ]
  }
]

// Mock partners data for calculations
const mockPartners = [
  { id: 1, name: 'أحمد محمد علي', sharePercentage: 40 },
  { id: 2, name: 'فاطمة أحمد حسن', sharePercentage: 35 },
  { id: 3, name: 'محمد السيد إبراهيم', sharePercentage: 25 }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const partnerId = searchParams.get('partnerId')
    
    let filteredSettlements = [...mockSettlements]
    
    // Filter by status
    if (status && status !== 'all') {
      filteredSettlements = filteredSettlements.filter(settlement => settlement.status === status)
    }
    
    // Filter by partner
    if (partnerId) {
      filteredSettlements = filteredSettlements.filter(settlement => 
        settlement.partnerSettlements.some(ps => ps.partnerId === parseInt(partnerId))
      )
    }
    
    // Sort by date (newest first)
    filteredSettlements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Calculate totals
    const totalSettlements = filteredSettlements.length
    const completedSettlements = filteredSettlements.filter(s => s.status === 'مكتملة').length
    const pendingSettlements = filteredSettlements.filter(s => s.status === 'معلقة').length
    const totalAmount = filteredSettlements.reduce((sum, s) => sum + s.totalAmount, 0)
    
    return NextResponse.json({
      success: true,
      data: filteredSettlements,
      total: filteredSettlements.length,
      stats: {
        totalSettlements,
        completedSettlements,
        pendingSettlements,
        totalAmount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات التسويات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body
    
    if (type === 'calculate') {
      // Calculate automatic settlement based on expenses
      const { totalExpenses, partnerExpenses } = body
      
      const settlementCalculations = mockPartners.map(partner => {
        const targetAmount = (totalExpenses * partner.sharePercentage) / 100
        const actualPaid = partnerExpenses.find((pe: any) => pe.partnerId === partner.id)?.amount || 0
        const difference = actualPaid - targetAmount
        
        return {
          partnerId: partner.id,
          partnerName: partner.name,
          sharePercentage: partner.sharePercentage,
          targetAmount,
          actualPaid,
          difference,
          settlementAmount: difference > 0 ? difference : -Math.abs(difference),
          settlementType: difference > 0 ? 'استحقاق' : difference < 0 ? 'دفع' : 'متوازن'
        }
      })
      
      return NextResponse.json({
        success: true,
        data: settlementCalculations,
        message: 'تم حساب التسوية بنجاح'
      })
    }
    
    if (type === 'create') {
      // Create new settlement
      const newSettlement = {
        id: Math.max(...mockSettlements.map(s => s.id)) + 1,
        settlementNumber: `SET-${new Date().getFullYear()}-${String(Math.max(...mockSettlements.map(s => s.id)) + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        status: 'معلقة',
        totalAmount: body.totalAmount,
        description: body.description,
        createdBy: 'النظام',
        partnerSettlements: body.partnerSettlements
      }
      
      mockSettlements.push(newSettlement)
      
      return NextResponse.json({
        success: true,
        data: newSettlement,
        message: 'تم إنشاء التسوية بنجاح'
      }, { status: 201 })
    }
    
    if (type === 'approve') {
      // Approve settlement
      const settlementId = body.settlementId
      const settlement = mockSettlements.find(s => s.id === settlementId)
      
      if (!settlement) {
        return NextResponse.json(
          { success: false, error: 'التسوية غير موجودة' },
          { status: 404 }
        )
      }
      
      settlement.status = 'مكتملة'
      
      return NextResponse.json({
        success: true,
        data: settlement,
        message: 'تم اعتماد التسوية بنجاح'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'نوع العملية غير صحيح' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة التسوية' },
      { status: 500 }
    )
  }
}