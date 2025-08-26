import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInstallmentSchedule, calculateInstallmentAmount } from '@/lib/calculations'
import { Decimal } from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const clientId = searchParams.get('clientId')

    const skip = (page - 1) * limit

    const where = clientId ? { clientId } : {}

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          unit: {
            include: {
              unitPartners: {
                include: { partner: true }
              }
            }
          },
          installments: {
            orderBy: { installmentNo: 'asc' }
          }
        }
      }),
      prisma.contract.count({ where })
    ])

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب العقود:', error)
    return NextResponse.json(
      { error: 'فشل في جلب العقود' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // التحقق من عدم تكرار رقم العقد
    const existingContract = await prisma.contract.findUnique({
      where: { contractNo: data.contractNo }
    })

    if (existingContract) {
      return NextResponse.json(
        { error: 'رقم العقد موجود بالفعل' },
        { status: 400 }
      )
    }

    // التحقق من أن الوحدة متاحة
    const unit = await prisma.unit.findUnique({
      where: { id: data.unitId }
    })

    if (!unit || !unit.isAvailable) {
      return NextResponse.json(
        { error: 'الوحدة غير متاحة' },
        { status: 400 }
      )
    }

    // حساب قيمة القسط
    const installmentAmount = calculateInstallmentAmount(
      new Decimal(data.unitPrice),
      new Decimal(data.downPayment),
      data.installmentCount
    )

    // إنشاء العقد
    const contract = await prisma.contract.create({
      data: {
        contractNo: data.contractNo,
        clientId: data.clientId,
        unitId: data.unitId,
        unitPrice: new Decimal(data.unitPrice),
        downPayment: new Decimal(data.downPayment),
        installmentCount: data.installmentCount,
        paymentType: data.paymentType,
        installmentAmount,
      }
    })

    // توليد جدول الأقساط
    const installmentSchedule = generateInstallmentSchedule({
      unitPrice: new Decimal(data.unitPrice),
      downPayment: new Decimal(data.downPayment),
      installmentCount: data.installmentCount,
      paymentType: data.paymentType,
      startDate: new Date()
    })

    // إنشاء الأقساط
    const installments = await Promise.all(
      installmentSchedule.map(installment =>
        prisma.installment.create({
          data: {
            contractId: contract.id,
            clientId: data.clientId,
            unitId: data.unitId,
            installmentNo: installment.installmentNo,
            amount: installment.amount,
            remainingAmount: installment.remainingAmount,
            dueDate: installment.dueDate,
            status: installment.status
          }
        })
      )
    )

    // تحديث حالة الوحدة لتصبح غير متاحة
    await prisma.unit.update({
      where: { id: data.unitId },
      data: { isAvailable: false }
    })

    // جلب العقد مع العلاقات
    const contractWithRelations = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        client: true,
        unit: true,
        installments: {
          orderBy: { installmentNo: 'asc' }
        }
      }
    })

    return NextResponse.json(contractWithRelations, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء العقد:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء العقد' },
      { status: 500 }
    )
  }
}