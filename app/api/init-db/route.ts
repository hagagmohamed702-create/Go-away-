import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Push database schema
    console.log('🔄 Initializing database schema...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Create sample data
    console.log('🌱 Creating sample data...')

    // Create main cashbox
    const mainCashbox = await prisma.cashbox.upsert({
      where: { code: 'MAIN-001' },
      update: {},
      create: {
        code: 'MAIN-001',
        name: 'الخزينة الرئيسية',
        type: 'MAIN',
        balance: 100000,
      },
    })

    // Create sample client
    const sampleClient = await prisma.client.upsert({
      where: { code: 'C001' },
      update: {},
      create: {
        code: 'C001',
        name: 'عميل تجريبي',
        phone: '01234567890',
        email: 'client@example.com',
        address: 'القاهرة، مصر',
      },
    })

    // Create sample unit
    const sampleUnit = await prisma.unit.upsert({
      where: { code: 'A101' },
      update: {},
      create: {
        code: 'A101',
        name: 'شقة 101 - عمارة أ',
        buildingNo: 'أ',
        unitType: 'سكني',
        totalPrice: 500000,
        groupType: 'سكنية',
      },
    })

    // Create system settings
    await prisma.systemSetting.upsert({
      where: { key: 'company_name' },
      update: {},
      create: {
        key: 'company_name',
        value: 'شركة العقارات المتطورة',
        description: 'اسم الشركة',
      },
    })

    await prisma.systemSetting.upsert({
      where: { key: 'app_initialized' },
      update: { value: new Date().toISOString() },
      create: {
        key: 'app_initialized',
        value: new Date().toISOString(),
        description: 'تاريخ تهيئة النظام',
      },
    })

    console.log('✅ Database initialized successfully!')

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح',
      data: {
        cashboxes: 1,
        clients: 1,
        units: 1,
        settings: 2,
      }
    })

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'فشل في تهيئة قاعدة البيانات',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    // Check if database is initialized
    const settings = await prisma.systemSetting.findMany()
    const isInitialized = settings.some(s => s.key === 'app_initialized')
    
    return NextResponse.json({
      initialized: isInitialized,
      settings_count: settings.length,
      message: isInitialized ? 'النظام مهيأ ومعد للاستخدام' : 'النظام بحاجة إلى تهيئة'
    })
  } catch (error) {
    return NextResponse.json({
      initialized: false,
      error: 'فشل في فحص حالة قاعدة البيانات'
    }, { status: 500 })
  }
}