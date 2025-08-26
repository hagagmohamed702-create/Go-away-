import { NextRequest, NextResponse } from 'next/server'

// Mock data - reliable for Netlify deployment
let mockClients = [
  {
    id: 1,
    name: 'أحمد محمد السعيد',
    code: 'C001',
    phone: '0551234567',
    email: 'ahmed.said@email.com',
    address: 'الرياض، حي النرجس، شارع الأمير سلطان',
    nationalId: '1234567890',
    status: 'نشط',
    joinDate: '2024-01-15',
    totalContracts: 2,
    totalValue: 1500000
  },
  {
    id: 2,
    name: 'فاطمة علي الأحمد',
    code: 'C002',
    phone: '0559876543',
    email: 'fatma.ahmed@email.com',
    address: 'جدة، حي الفيصلية، شارع التحلية',
    nationalId: '2345678901',
    status: 'نشط',
    joinDate: '2024-01-20',
    totalContracts: 1,
    totalValue: 950000
  },
  {
    id: 3,
    name: 'محمد حسن العتيبي',
    code: 'C003',
    phone: '0556543210',
    email: 'mohammed.hassan@email.com',
    address: 'الدمام، حي الفنار، شارع الملك فهد',
    nationalId: '3456789012',
    status: 'غير نشط',
    joinDate: '2024-02-01',
    totalContracts: 0,
    totalValue: 0
  },
  {
    id: 4,
    name: 'نورا سعد الدوسري',
    code: 'C004',
    phone: '0554321098',
    email: 'nora.saad@email.com',
    address: 'المدينة المنورة، حي الهجرة، شارع المسجد النبوي',
    nationalId: '4567890123',
    status: 'نشط',
    joinDate: '2024-02-10',
    totalContracts: 3,
    totalValue: 2100000
  },
  {
    id: 5,
    name: 'خالد عبد الرحمن القحطاني',
    code: 'C005',
    phone: '0557890123',
    email: 'khalid.alqahtani@email.com',
    address: 'مكة المكرمة، حي العزيزية، شارع إبراهيم الخليل',
    nationalId: '5678901234',
    status: 'نشط',
    joinDate: '2024-02-15',
    totalContracts: 1,
    totalValue: 800000
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/clients called')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let clients = [...mockClients]
    
    // Apply filters
    if (status && status !== 'all') {
      clients = clients.filter((client: any) => client.status === status)
    }
    
    if (search) {
      clients = clients.filter((client: any) =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.code.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Sort by join date (newest first)
    clients.sort((a: any, b: any) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    
    // Calculate summary stats
    const totalClients = clients.length
    const activeClients = clients.filter((c: any) => c.status === 'نشط').length
    const totalValue = clients.reduce((sum: number, c: any) => sum + c.totalValue, 0)
    const totalContracts = clients.reduce((sum: number, c: any) => sum + c.totalContracts, 0)
    
    const response = {
      success: true,
      data: clients,
      summary: {
        totalClients,
        activeClients,
        totalValue,
        totalContracts
      },
      source: 'mock_data'
    }
    
    console.log('Returning clients:', response.data.length)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات العملاء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/clients called')
    
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      )
    }
    
    // Check if phone number already exists
    const existingClient = mockClients.find(c => c.phone === body.phone)
    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مستخدم بالفعل' },
        { status: 400 }
      )
    }
    
    // Generate new client code
    const maxId = Math.max(...mockClients.map(c => c.id), 0)
    const newCode = `C${String(maxId + 1).padStart(3, '0')}`
    
    // Create new client
    const newClient = {
      id: maxId + 1,
      name: body.name,
      code: newCode,
      phone: body.phone,
      email: body.email || '',
      address: body.address || '',
      nationalId: body.nationalId || '',
      status: 'نشط',
      joinDate: new Date().toISOString().split('T')[0],
      totalContracts: 0,
      totalValue: 0
    }
    
    mockClients.push(newClient)
    
    console.log('✅ Created new client:', newClient)
    console.log('📊 Total clients now:', mockClients.length)
    
    const response = {
      success: true,
      data: newClient,
      message: 'تم إضافة العميل بنجاح'
    }
    
    console.log('📤 Sending response:', response)
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة العميل' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/clients called')
    
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'معرف العميل مطلوب' },
        { status: 400 }
      )
    }
    
    const clientIndex = mockClients.findIndex(c => c.id === body.id)
    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العميل غير موجود' },
        { status: 404 }
      )
    }
    
    // Update client data
    const client = mockClients[clientIndex]
    if (body.name !== undefined) client.name = body.name
    if (body.phone !== undefined) client.phone = body.phone
    if (body.email !== undefined) client.email = body.email
    if (body.address !== undefined) client.address = body.address
    if (body.nationalId !== undefined) client.nationalId = body.nationalId
    if (body.status !== undefined) client.status = body.status
    
    console.log('Updated client:', client)
    
    return NextResponse.json({
      success: true,
      data: client,
      message: 'تم تحديث بيانات العميل بنجاح'
    })
  } catch (error) {
    console.error('PUT /api/clients error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في تحديث بيانات العميل' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/clients called')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف العميل مطلوب' },
        { status: 400 }
      )
    }
    
    const clientIndex = mockClients.findIndex(c => c.id === parseInt(id))
    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العميل غير موجود' },
        { status: 404 }
      )
    }
    
    // Check if client has contracts
    const client = mockClients[clientIndex]
    if (client.totalContracts > 0) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف عميل لديه عقود نشطة' },
        { status: 400 }
      )
    }
    
    mockClients.splice(clientIndex, 1)
    
    console.log('Deleted client with id:', id)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    })
  } catch (error) {
    console.error('DELETE /api/clients error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في حذف العميل' },
      { status: 500 }
    )
  }
}