import { NextRequest, NextResponse } from 'next/server'

// Mock data for units
const mockUnits = [
  {
    id: 1,
    number: 'A-101',
    type: 'شقة',
    area: 120,
    floor: 1,
    building: 'المبنى أ',
    project: 'مشروع الأبراج السكنية',
    price: 850000,
    status: 'متاح',
    description: 'شقة فاخرة بإطلالة رائعة',
    features: ['مصعد', 'موقف سيارة', 'بلكونة', 'مكيف مركزي']
  },
  {
    id: 2,
    number: 'A-102',
    type: 'شقة',
    area: 140,
    floor: 1,
    building: 'المبنى أ',
    project: 'مشروع الأبراج السكنية',
    price: 950000,
    status: 'محجوز',
    description: 'شقة واسعة مع حديقة خاصة',
    features: ['مصعد', 'موقف سيارة', 'حديقة', 'مكيف مركزي']
  },
  {
    id: 3,
    number: 'A-201',
    type: 'شقة',
    area: 110,
    floor: 2,
    building: 'المبنى أ',
    project: 'مشروع الأبراج السكنية',
    price: 800000,
    status: 'مباع',
    description: 'شقة مريحة في الطابق الثاني',
    features: ['مصعد', 'موقف سيارة', 'بلكونة']
  },
  {
    id: 4,
    number: 'B-101',
    type: 'فيلا',
    area: 300,
    floor: 0,
    building: 'المبنى ب',
    project: 'مجمع الفلل الراقية',
    price: 1500000,
    status: 'متاح',
    description: 'فيلا فاخرة مع حديقة واسعة',
    features: ['حديقة كبيرة', 'مسبح خاص', 'مواقف متعددة', 'مكيف مركزي', 'نظام أمني']
  },
  {
    id: 5,
    number: 'C-001',
    type: 'محل تجاري',
    area: 80,
    floor: 0,
    building: 'المبنى التجاري',
    project: 'المركز التجاري الحديث',
    price: 600000,
    status: 'متاح',
    description: 'محل تجاري في موقع استراتيجي',
    features: ['واجهة زجاجية', 'مكيف', 'حمام', 'مخزن']
  },
  {
    id: 6,
    number: 'D-301',
    type: 'مكتب',
    area: 90,
    floor: 3,
    building: 'برج الأعمال',
    project: 'مركز الأعمال المتطور',
    price: 450000,
    status: 'قيد الصيانة',
    description: 'مكتب حديث مع إطلالة بانورامية',
    features: ['مصعد', 'مكيف مركزي', 'إنترنت عالي السرعة', 'قاعة اجتماعات مشتركة']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const project = searchParams.get('project')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    let filteredUnits = [...mockUnits]
    
    // Filter by status
    if (status && status !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.status === status)
    }
    
    // Filter by type
    if (type && type !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.type === type)
    }
    
    // Filter by project
    if (project && project !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.project === project)
    }
    
    // Filter by price range
    if (minPrice) {
      filteredUnits = filteredUnits.filter(unit => unit.price >= parseInt(minPrice))
    }
    if (maxPrice) {
      filteredUnits = filteredUnits.filter(unit => unit.price <= parseInt(maxPrice))
    }
    
    // Calculate summary stats
    const totalUnits = filteredUnits.length
    const availableUnits = filteredUnits.filter(u => u.status === 'متاح').length
    const soldUnits = filteredUnits.filter(u => u.status === 'مباع').length
    const reservedUnits = filteredUnits.filter(u => u.status === 'محجوز').length
    const totalValue = filteredUnits.reduce((sum, u) => sum + u.price, 0)
    const avgPrice = totalUnits > 0 ? Math.round(totalValue / totalUnits) : 0
    const avgArea = totalUnits > 0 ? Math.round(filteredUnits.reduce((sum, u) => sum + u.area, 0) / totalUnits) : 0
    
    return NextResponse.json({
      success: true,
      data: filteredUnits,
      summary: {
        totalUnits,
        availableUnits,
        soldUnits,
        reservedUnits,
        totalValue,
        avgPrice,
        avgArea
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات الوحدات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.number || !body.area || !body.price) {
      return NextResponse.json(
        { success: false, error: 'رقم الوحدة والمساحة والسعر مطلوبة' },
        { status: 400 }
      )
    }
    
    // Check if unit number already exists in the same project
    const existingUnit = mockUnits.find(u => 
      u.number === body.number && u.project === body.project
    )
    if (existingUnit) {
      return NextResponse.json(
        { success: false, error: 'رقم الوحدة موجود بالفعل في هذا المشروع' },
        { status: 400 }
      )
    }
    
    // Create new unit
    const newUnit = {
      id: Math.max(...mockUnits.map(u => u.id), 0) + 1,
      number: body.number,
      type: body.type || 'شقة',
      area: body.area,
      floor: body.floor || 0,
      building: body.building || '',
      project: body.project || '',
      price: body.price,
      status: 'متاح',
      description: body.description || '',
      features: body.features || []
    }
    
    mockUnits.push(newUnit)
    
    return NextResponse.json({
      success: true,
      data: newUnit,
      message: 'تم إضافة الوحدة بنجاح'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة الوحدة' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'معرف الوحدة مطلوب' },
        { status: 400 }
      )
    }
    
    const unitIndex = mockUnits.findIndex(u => u.id === body.id)
    if (unitIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'الوحدة غير موجودة' },
        { status: 404 }
      )
    }
    
    // Update unit data
    const unit = mockUnits[unitIndex]
    if (body.number !== undefined) unit.number = body.number
    if (body.type !== undefined) unit.type = body.type
    if (body.area !== undefined) unit.area = body.area
    if (body.floor !== undefined) unit.floor = body.floor
    if (body.building !== undefined) unit.building = body.building
    if (body.project !== undefined) unit.project = body.project
    if (body.price !== undefined) unit.price = body.price
    if (body.status !== undefined) unit.status = body.status
    if (body.description !== undefined) unit.description = body.description
    if (body.features !== undefined) unit.features = body.features
    
    return NextResponse.json({
      success: true,
      data: unit,
      message: 'تم تحديث بيانات الوحدة بنجاح'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في تحديث بيانات الوحدة' },
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
        { success: false, error: 'معرف الوحدة مطلوب' },
        { status: 400 }
      )
    }
    
    const unitIndex = mockUnits.findIndex(u => u.id === parseInt(id))
    if (unitIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'الوحدة غير موجودة' },
        { status: 404 }
      )
    }
    
    // Check if unit is sold or reserved
    const unit = mockUnits[unitIndex]
    if (unit.status === 'مباع' || unit.status === 'محجوز') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف وحدة مباعة أو محجوزة' },
        { status: 400 }
      )
    }
    
    mockUnits.splice(unitIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الوحدة بنجاح'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في حذف الوحدة' },
      { status: 500 }
    )
  }
}