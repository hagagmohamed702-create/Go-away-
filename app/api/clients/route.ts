import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { code: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contracts: {
            include: {
              unit: true,
              installments: {
                where: { status: 'PENDING' }
              }
            }
          }
        }
      }),
      prisma.client.count({ where })
    ])

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب العملاء:', error)
    return NextResponse.json(
      { error: 'فشل في جلب العملاء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // التحقق من عدم تكرار الكود
    const existingClient = await prisma.client.findUnique({
      where: { code: data.code }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'كود العميل موجود بالفعل' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        code: data.code,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء العميل' },
      { status: 500 }
    )
  }
}