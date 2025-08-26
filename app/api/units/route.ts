import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const units = [
      { id: '1', code: 'A101', name: 'شقة 101 - عمارة أ', buildingNo: 'أ', unitType: 'سكني', totalPrice: 500000, groupType: 'سكنية', status: 'AVAILABLE' },
      { id: '2', code: 'A102', name: 'شقة 102 - عمارة أ', buildingNo: 'أ', unitType: 'سكني', totalPrice: 550000, groupType: 'سكنية', status: 'SOLD' },
      { id: '3', code: 'B001', name: 'محل 1 - عمارة ب', buildingNo: 'ب', unitType: 'تجاري', totalPrice: 800000, groupType: 'تجارية', status: 'AVAILABLE' }
    ]

    return NextResponse.json({
      success: true,
      units
    })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في تحميل الوحدات'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock successful creation
    const newUnit = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      unit: newUnit
    })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء الوحدة'
    }, { status: 500 })
  }
}