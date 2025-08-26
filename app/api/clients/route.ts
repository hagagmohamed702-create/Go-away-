import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const clients = [
      { id: '1', code: 'C001', name: 'أحمد محمد', phone: '01234567890', email: 'ahmed@example.com', status: 'ACTIVE' },
      { id: '2', code: 'C002', name: 'فاطمة علي', phone: '01234567891', email: 'fatma@example.com', status: 'ACTIVE' },
      { id: '3', code: 'C003', name: 'محمد حسن', phone: '01234567892', email: 'mohamed@example.com', status: 'INACTIVE' }
    ]

    return NextResponse.json({
      success: true,
      clients
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في تحميل العملاء'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock successful creation
    const newClient = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      client: newClient
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء العميل'
    }, { status: 500 })
  }
}