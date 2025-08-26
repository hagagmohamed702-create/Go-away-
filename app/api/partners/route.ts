import { NextRequest, NextResponse } from 'next/server'

// Mock data for partners
const mockPartners = [
  {
    id: 1,
    name: 'أحمد محمد علي',
    sharePercentage: 40.0,
    walletBalance: 850000,
    phone: '01234567890',
    email: 'ahmed@example.com',
    status: 'نشط',
    joinDate: '2023-01-15',
    totalInvestment: 2000000,
    totalReturns: 450000
  },
  {
    id: 2,
    name: 'فاطمة أحمد حسن',
    sharePercentage: 35.0,
    walletBalance: 720000,
    phone: '01123456789',
    email: 'fatma@example.com',
    status: 'نشط',
    joinDate: '2023-02-20',
    totalInvestment: 1750000,
    totalReturns: 380000
  },
  {
    id: 3,
    name: 'محمد السيد إبراهيم',
    sharePercentage: 25.0,
    walletBalance: 520000,
    phone: '01098765432',
    email: 'mohamed@example.com',
    status: 'نشط',
    joinDate: '2023-03-10',
    totalInvestment: 1250000,
    totalReturns: 270000
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockPartners,
      total: mockPartners.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات الشركاء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create new partner with mock data
    const newPartner = {
      id: Math.max(...mockPartners.map(p => p.id)) + 1,
      name: body.name || 'شريك جديد',
      sharePercentage: body.sharePercentage || 0,
      walletBalance: 0,
      phone: body.phone || '',
      email: body.email || '',
      status: 'نشط',
      joinDate: new Date().toISOString().split('T')[0],
      totalInvestment: body.totalInvestment || 0,
      totalReturns: 0
    }

    // Add to mock data
    mockPartners.push(newPartner)

    return NextResponse.json({
      success: true,
      data: newPartner,
      message: 'تم إضافة الشريك بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة الشريك' },
      { status: 500 }
    )
  }
}