import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const contracts = [
      {
        id: '1',
        contractNumber: 'C-2024-001',
        client: { id: '1', name: 'أحمد محمد', code: 'C001' },
        unit: { id: '1', name: 'شقة 101 - عمارة أ', code: 'A101', totalPrice: 500000 },
        unitValue: 500000,
        downPayment: 100000,
        installmentCount: 12,
        installmentType: 'MONTHLY',
        installmentAmount: 33333,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        installments: []
      }
    ]

    return NextResponse.json({
      success: true,
      contracts
    })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في تحميل العقود'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock successful creation
    const newContract = {
      id: Date.now().toString(),
      contractNumber: `C-2024-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      contract: newContract
    })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء العقد'
    }, { status: 500 })
  }
}