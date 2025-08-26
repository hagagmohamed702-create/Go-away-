import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UnitSchema = z.object({
  code: z.string().min(1, 'رقم الوحدة مطلوب'),
  name: z.string().min(1, 'اسم الوحدة مطلوب'),
  buildingNo: z.string().min(1, 'رقم العمارة مطلوب'),
  unitType: z.string().min(1, 'نوع الوحدة مطلوب'),
  totalPrice: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  groupType: z.string().min(1, 'نوع المجموعة مطلوب'),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional()
})

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contracts: {
          select: {
            id: true,
            client: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      units: units.map(unit => ({
        id: unit.id,
        code: unit.code,
        name: unit.name,
        buildingNo: unit.buildingNo,
        unitType: unit.unitType,
        totalPrice: unit.totalPrice.toNumber(),
        groupType: unit.groupType,
        status: unit.status,
        createdAt: unit.createdAt.toISOString(),
        contracts: unit.contracts
      }))
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
    const validatedData = UnitSchema.parse(body)

    // Check if unit code already exists
    const existingUnit = await prisma.unit.findUnique({
      where: { code: validatedData.code }
    })

    if (existingUnit) {
      return NextResponse.json({
        success: false,
        error: 'رقم الوحدة موجود بالفعل'
      }, { status: 400 })
    }

    const unit = await prisma.unit.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        buildingNo: validatedData.buildingNo,
        unitType: validatedData.unitType,
        totalPrice: validatedData.totalPrice,
        groupType: validatedData.groupType,
        status: validatedData.status || 'AVAILABLE'
      }
    })

    return NextResponse.json({
      success: true,
      unit: {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        buildingNo: unit.buildingNo,
        unitType: unit.unitType,
        totalPrice: unit.totalPrice.toNumber(),
        groupType: unit.groupType,
        status: unit.status,
        createdAt: unit.createdAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    console.error('Error creating unit:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء الوحدة'
    }, { status: 500 })
  }
}